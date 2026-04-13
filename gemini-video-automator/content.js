// Content script — Gemini Video Automator

let state = {
  queue: [], currentIndex: 0,
  isRunning: false, isPaused: false,
  settings: { delayBetween: 5000 }
};

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  switch (msg.type) {
    case 'START':
      state.queue = msg.blocks; state.settings = msg.settings || state.settings;
      state.currentIndex = 0; state.isRunning = true; state.isPaused = false;
      processNext(); sendResponse({ ok: true }); break;
    case 'PAUSE':
      state.isPaused = true; state.isRunning = false; sendResponse({ ok: true }); break;
    case 'RESUME':
      state.isPaused = false; state.isRunning = true; processNext(); sendResponse({ ok: true }); break;
    case 'STOP':
      state.isRunning = false; state.isPaused = false;
      state.queue = []; state.currentIndex = 0; sendResponse({ ok: true }); break;
    case 'DIAGNOSE':
      sendResponse(runDiagnose()); break;
  }
  return true;
});

// ── Loop ─────────────────────────────────────────────────────────────────────

async function processNext() {
  if (!state.isRunning || state.isPaused) return;
  if (state.currentIndex >= state.queue.length) {
    notifyPopup({ type: 'COMPLETE', total: state.queue.length });
    state.isRunning = false; return;
  }

  const block = state.queue[state.currentIndex];
  const n     = state.currentIndex + 1;

  notifyPopup({ type: 'PROGRESS', current: n, total: state.queue.length,
    preview: block.substring(0, 60) + (block.length > 60 ? '...' : '') });

  try {
    log(`[${n}/${state.queue.length}] Preenchendo campo...`);
    await fillField(block);
    await sleep(1000);

    log(`[${n}] Enviando...`);
    await clickSend();

    log(`[${n}] Aguardando vídeo...`);
    await waitForVideo();
    await sleep(1500);

    log(`[${n}] Baixando...`);
    const dl = await downloadVideo(n);

    notifyPopup({ type: 'BLOCK_DONE', current: n, total: state.queue.length, downloaded: dl });

    const delay = state.settings.delayBetween || 5000;
    log(`[${n}] ✓ Pronto. Próximo em ${delay/1000}s...`);
    await sleep(delay);
    state.currentIndex++;
    processNext();
  } catch (err) {
    log(`ERRO [${n}]: ${err.message}`);
    notifyPopup({ type: 'ERROR', current: n, message: err.message });
    state.isRunning = false;
  }
}

// ── Encontrar o campo ─────────────────────────────────────────────────────────

function findField() {
  const all = document.querySelectorAll('textarea');
  if (!all.length) return null;
  // Prefere o que tem o placeholder correto
  for (const t of all) {
    if (/descreva|vídeo|video/i.test(t.placeholder)) return t;
  }
  return all[all.length - 1];
}

// ── Preencher campo ───────────────────────────────────────────────────────────

async function fillField(text) {
  const field = findField();
  if (!field) throw new Error('Campo de texto não encontrado.');

  field.click();
  field.focus();
  await sleep(300);

  // Limpa e insere via execCommand (mais compatível com frameworks)
  document.execCommand('selectAll', false, null);
  await sleep(100);
  document.execCommand('insertText', false, text);
  await sleep(200);

  // Verifica se inseriu
  if (field.value.trim().length > 0) {
    log(`Campo OK: ${field.value.length} chars`);
    return;
  }

  // Fallback: setter nativo
  const s = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
  s.call(field, text);
  ['input','change'].forEach(e => field.dispatchEvent(new Event(e, { bubbles: true })));
  field.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }));
  await sleep(300);
  log(`Campo OK (fallback): ${field.value.length} chars`);
}

// ── Clicar no botão de envio ──────────────────────────────────────────────────

async function clickSend() {
  const field = findField();
  if (!field) throw new Error('Campo não encontrado para envio.');

  // 1. Varre todos os elementos clicáveis da página
  const clickables = getAllClickable();
  log(`${clickables.length} elementos clicáveis encontrados.`);

  // 2. Tenta por aria-label / texto
  const sendWords = ['send','enviar','submit','gerar vídeo','criar vídeo','generate','go'];
  for (const el of clickables) {
    const label = (el.getAttribute('aria-label') || el.textContent || el.title || '').toLowerCase().trim();
    if (sendWords.some(w => label.includes(w))) {
      el.click();
      log(`Enviado via label: "${label.substring(0, 40)}"`);
      return;
    }
  }

  // 3. Varre visualmente à DIREITA do campo (onde fica o botão de envio)
  const rect = field.getBoundingClientRect();
  const checked = new Set();

  // Varre da borda direita do campo até a borda da tela
  for (let x = rect.right + 5; x < window.innerWidth - 2; x += 8) {
    for (const y of [rect.top + 8, rect.top + rect.height * 0.5, rect.bottom - 8]) {
      const el = document.elementFromPoint(x, y);
      if (!el || checked.has(el) || el === field || el.tagName === 'BODY') continue;
      checked.add(el);

      const clickable = findClickableParent(el);
      if (clickable && !clickable.disabled && clickable !== field) {
        clickable.click();
        log(`Enviado via scan visual (x=${Math.round(x)}, y=${Math.round(y)}): <${clickable.tagName}> "${(clickable.getAttribute('aria-label')||'').substring(0,30)}"`);
        return;
      }
    }
  }

  // 4. Tenta dentro do container do campo (sobe na árvore)
  let parent = field.parentElement;
  for (let i = 0; i < 10; i++) {
    if (!parent || parent === document.body) break;
    const btns = [...parent.querySelectorAll('button:not([disabled]), [role="button"]')];
    if (btns.length && btns.length <= 8) {
      const btn = btns[btns.length - 1]; // último botão do container
      btn.click();
      log(`Enviado via container (nível ${i}): "${btn.getAttribute('aria-label') || btn.textContent.trim().substring(0,20)}"`);
      return;
    }
    parent = parent.parentElement;
  }

  // 5. Último recurso: Enter
  log('Nenhum botão encontrado. Tentando Enter...');
  field.focus();
  await sleep(200);
  ['keydown','keypress','keyup'].forEach(type => {
    field.dispatchEvent(new KeyboardEvent(type, {
      key: 'Enter', code: 'Enter', keyCode: 13, which: 13,
      bubbles: true, cancelable: true
    }));
  });
  log('Enter disparado.');
}

function getAllClickable() {
  return [...document.querySelectorAll(
    'button:not([disabled]), [role="button"], input[type="submit"], input[type="image"], [jsaction]'
  )].filter(el => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0; // visível
  });
}

function findClickableParent(el) {
  let node = el;
  for (let i = 0; i < 5; i++) {
    if (!node) return null;
    const tag = node.tagName;
    const role = node.getAttribute?.('role');
    if (tag === 'BUTTON' || role === 'button' || tag === 'A' ||
        node.getAttribute?.('jsaction') || node.onclick) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

// ── Aguardar vídeo ────────────────────────────────────────────────────────────

function waitForVideo() {
  return new Promise((resolve, reject) => {
    let done = false;

    function finish(r) {
      if (done) return; done = true;
      clearTimeout(t); clearInterval(p); obs.disconnect();
      log('Vídeo: ' + r); resolve();
    }
    function fail(m) {
      if (done) return; done = true;
      clearTimeout(t); clearInterval(p); obs.disconnect();
      reject(new Error(m));
    }

    const obs = new MutationObserver(() => {
      if (findDlBtn()) { finish('botão download'); return; }
      const v = document.querySelector('video');
      if (v?.src || v?.currentSrc) finish('video src');
    });
    obs.observe(document.body, { childList: true, subtree: true, attributes: true });

    const p = setInterval(() => {
      if (findDlBtn()) { finish('poll dl'); return; }
      const v = document.querySelector('video');
      if (v?.src || v?.currentSrc) finish('poll video');
    }, 2000);

    const t = setTimeout(() => fail('Timeout: vídeo não gerado em 3 min.'), 180_000);
  });
}

// ── Download ──────────────────────────────────────────────────────────────────

function findDlBtn() {
  return document.querySelector(
    '[aria-label="Baixar arquivo de vídeo"], [aria-label="Download video file"], [aria-label*="Baixar" i], [aria-label*="Download" i], [title*="Baixar" i], a[download]'
  );
}

async function downloadVideo(n) {
  const btn = findDlBtn();
  if (btn) { btn.click(); log('Download via botão ✓'); return true; }

  const v = document.querySelector('video');
  if (!v) { log('Sem vídeo.'); return false; }

  const url = v.src || v.currentSrc;
  if (!url) { log('Sem URL.'); return false; }

  if (url.startsWith('blob:')) {
    const a = Object.assign(document.createElement('a'), { href: url, download: `video_${String(n).padStart(3,'0')}.mp4` });
    document.body.appendChild(a); a.click(); a.remove();
    log('Download blob ✓'); return true;
  }

  chrome.runtime.sendMessage({ type: 'DOWNLOAD', url, filename: `video_${String(n).padStart(3,'0')}.mp4` });
  return true;
}

// ── Diagnóstico ───────────────────────────────────────────────────────────────

function runDiagnose() {
  const field     = findField();
  const clickable = getAllClickable();
  const dlBtn     = findDlBtn();
  const videos    = document.querySelectorAll('video');

  return {
    fieldFound:   !!field,
    fieldTag:     field?.tagName,
    fieldPlaceholder: field?.placeholder,
    buttons: clickable.slice(0, 15).map(el => ({
      tag:     el.tagName,
      label:   el.getAttribute('aria-label'),
      text:    el.textContent.trim().substring(0, 25),
      role:    el.getAttribute('role'),
      disabled: el.disabled || false
    })),
    textareas: [...document.querySelectorAll('textarea')].map(t => ({ placeholder: t.placeholder })),
    videosCount:  videos.length,
    downloadBtn:  !!dlBtn,
    downloadLabel: dlBtn?.getAttribute('aria-label')
  };
}

// ── Utils ─────────────────────────────────────────────────────────────────────

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function log(msg)  { console.log('[GVA]', msg); notifyPopup({ type: 'LOG', message: msg }); }
function notifyPopup(d) { chrome.runtime.sendMessage(d).catch(() => {}); }
