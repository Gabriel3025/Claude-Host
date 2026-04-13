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

// ── Shadow DOM traversal ──────────────────────────────────────────────────────

// Busca recursiva em todo o Shadow DOM da página
function shadowQueryAll(selector, root) {
  if (!root) root = document;
  const results = [];
  try {
    results.push(...root.querySelectorAll(selector));
    const all = root.querySelectorAll('*');
    for (const el of all) {
      if (el.shadowRoot) results.push(...shadowQueryAll(selector, el.shadowRoot));
    }
  } catch (_) {}
  return results;
}

// Busca o primeiro elemento que satisfaz um predicado (com shadow DOM)
function shadowFind(predicate, root) {
  if (!root) root = document;
  try {
    const all = root.querySelectorAll('*');
    for (const el of all) {
      if (predicate(el)) return el;
      if (el.shadowRoot) {
        const found = shadowFind(predicate, el.shadowRoot);
        if (found) return found;
      }
    }
  } catch (_) {}
  return null;
}

// ── Encontrar o campo ─────────────────────────────────────────────────────────

function findField() {
  // Busca em todo o shadow DOM — o Gemini esconde o textarea dentro de web components
  const all = shadowQueryAll('textarea');
  if (!all.length) return null;

  // Prefere textarea visível com placeholder de vídeo
  const byPlaceholder = all.find(t => /descreva|vídeo|video/i.test(t.placeholder));
  if (byPlaceholder) return byPlaceholder;

  // Prefere textarea visível (com área positiva)
  const visible = all.filter(t => {
    const r = t.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  });
  return visible[visible.length - 1] || all[all.length - 1];
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

  // 1. Busca o botão de envio dentro do Shadow DOM
  const sendBtn = shadowFind(el => {
    const tag   = (el.tagName || '').toLowerCase();
    const label = (el.getAttribute?.('aria-label') || '').toLowerCase();
    const jsname = el.getAttribute?.('jsname') || '';
    const type  = el.getAttribute?.('type') || el.type || '';
    return (
      label.includes('send') || label.includes('enviar') ||
      jsname === 'Qx7uuf' || jsname === 'M2UYVd' ||
      type === 'submit' ||
      (tag === 'button' && !el.disabled)
    );
  });

  if (sendBtn) {
    sendBtn.click();
    log(`Enviado via shadow DOM: <${sendBtn.tagName}> "${sendBtn.getAttribute?.('aria-label') || sendBtn.getAttribute?.('jsname') || ''}"`);
    return;
  }

  // 2. Busca qualquer botão visível no shadow DOM
  const allShadowBtns = shadowQueryAll('button, [role="button"]')
    .filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !el.disabled; });

  log(`${allShadowBtns.length} botões visíveis no shadow DOM.`);
  allShadowBtns.forEach(el =>
    log(`  <${el.tagName}> label="${el.getAttribute('aria-label')||''}" jsname="${el.getAttribute('jsname')||''}" pos=(${Math.round(el.getBoundingClientRect().x)},${Math.round(el.getBoundingClientRect().y)})`)
  );

  // O botão de envio costuma ser o mais à direita / mais embaixo
  if (allShadowBtns.length > 0) {
    allShadowBtns.sort((a, b) => {
      const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
      return (rb.x + rb.y) - (ra.x + ra.y); // mais à direita e abaixo primeiro
    });
    allShadowBtns[0].click();
    log(`Clicou no botão mais à direita/baixo do shadow DOM.`);
    return;
  }

  const rect = field.getBoundingClientRect();
  const centerY = rect.top + rect.height / 2;

  // O layout do Gemini: textarea em cima, botões embaixo (mic + enviar)
  // Varre: direita do campo + abaixo do campo + canto inferior direito da tela
  const seen = new Set();
  const candidates = [];

  const scanPoints = [];

  // Área à direita do textarea
  for (let x = rect.right + 2; x < window.innerWidth - 1; x += 6) {
    for (const y of [rect.top + 5, centerY, rect.bottom - 5]) {
      scanPoints.push({ x, y });
    }
  }

  // Área ABAIXO do textarea (onde ficam os chips e botões)
  for (let y = rect.bottom + 2; y < rect.bottom + 80; y += 6) {
    for (let x = window.innerWidth * 0.4; x < window.innerWidth - 1; x += 8) {
      scanPoints.push({ x, y });
    }
  }

  // Canto inferior direito da janela (botão de envio geralmente fica aqui)
  for (let y = window.innerHeight - 120; y < window.innerHeight - 5; y += 6) {
    for (let x = window.innerWidth - 150; x < window.innerWidth - 5; x += 6) {
      scanPoints.push({ x, y });
    }
  }

  for (const { x, y } of scanPoints) {
    const el = document.elementFromPoint(x, y);
    if (!el || seen.has(el)) continue;
    seen.add(el);
    if (el.tagName === 'BODY' || el.tagName === 'HTML' || el === field) continue;
    candidates.push({ el, x: Math.round(x), y: Math.round(y) });
  }

  log(`${candidates.length} elementos encontrados ao redor do campo.`);
  candidates.slice(0, 5).forEach(({ el, x, y }) =>
    log(`  (${x},${y}) <${el.tagName}> aria="${el.getAttribute?.('aria-label')||''}" jsname="${el.getAttribute?.('jsname')||''}" cls="${(el.className?.substring?.(0,30))||''}"`)
  );

  // Clica no elemento mais à direita e abaixo (mais provável ser o botão de envio)
  if (candidates.length > 0) {
    // Ordena por x decrescente (mais à direita = botão de envio)
    candidates.sort((a, b) => b.x - a.x);
    const { el, x, y } = candidates[0];
    el.click();
    log(`Clicou: (${x},${y}) <${el.tagName}> "${el.getAttribute?.('aria-label') || (el.className?.substring?.(0,30)) || ''}"`);
    return;
  }

  // Fallback: sobe no DOM e pega irmãos do campo
  let parent = field.parentElement;
  for (let i = 0; i < 12; i++) {
    if (!parent || parent === document.body) break;
    const siblings = [...parent.children].filter(c => c !== field && c.tagName !== 'TEXTAREA');
    if (siblings.length) {
      const last = siblings[siblings.length - 1];
      last.click();
      log(`Clicou irmão nível ${i}: <${last.tagName}> "${last.getAttribute('aria-label')||last.textContent?.trim().substring(0,20)}"`);
      return;
    }
    parent = parent.parentElement;
  }

  // Último recurso: Enter
  log('Sem elemento. Tentando Enter...');
  field.focus();
  await sleep(150);
  field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true, cancelable: true }));
  await sleep(80);
  field.dispatchEvent(new KeyboardEvent('keyup',   { key: 'Enter', keyCode: 13, bubbles: true }));
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
  const field  = findField();
  const dlBtn  = findDlBtn();
  const videos = document.querySelectorAll('video');

  // Escaneia visualmente o que está à direita do campo
  const rightElements = [];
  if (field) {
    const rect = field.getBoundingClientRect();
    const seen = new Set();
    for (let x = rect.right + 2; x < window.innerWidth - 1; x += 6) {
      for (const y of [rect.top + 5, rect.top + rect.height * 0.5, rect.bottom - 5]) {
        const el = document.elementFromPoint(x, y);
        if (!el || seen.has(el) || el === field || el.tagName === 'BODY') continue;
        seen.add(el);
        rightElements.push({
          tag:    el.tagName,
          label:  el.getAttribute('aria-label') || '',
          jsname: el.getAttribute('jsname') || '',
          cls:    (el.className?.substring?.(0, 40)) || '',
          x:      Math.round(x)
        });
      }
    }
  }

  return {
    fieldFound:    !!field,
    fieldTag:      field?.tagName,
    fieldPlaceholder: field?.placeholder,
    rightElements: rightElements.slice(0, 10),
    videosCount:   videos.length,
    downloadBtn:   !!dlBtn,
    downloadLabel: dlBtn?.getAttribute('aria-label')
  };
}

// ── Utils ─────────────────────────────────────────────────────────────────────

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function log(msg)  { console.log('[GVA]', msg); notifyPopup({ type: 'LOG', message: msg }); }
function notifyPopup(d) { chrome.runtime.sendMessage(d).catch(() => {}); }
