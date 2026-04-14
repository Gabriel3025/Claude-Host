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

    // Captura estado ANTES de enviar para detectar apenas elementos NOVOS
    const prevDlBtn  = findDlBtn();
    const prevVideos = new Set(shadowQueryAll('video').map(v => v.src || v.currentSrc || '').filter(Boolean));

    log(`[${n}] Enviando...`);
    await clickSend();

    log(`[${n}] Aguardando vídeo... (pode levar 1-2 min)`);
    await waitForVideo(prevDlBtn, prevVideos);
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
  // Estrutura confirmada via DevTools:
  // <md-icon-button class="send-button submit" data-aria-label="Enviar">
  //   #shadow-root (open)
  //     <button id="button" aria-label="Enviar">

  // 1. Seletores exatos do md-icon-button
  const sendSelectors = [
    'md-icon-button.send-button',
    'md-icon-button[data-aria-label="Enviar"]',
    'md-icon-button[data-aria-label="Send"]',
    '[data-aria-label="Enviar"]',
    '[data-aria-label="Send"]',
  ];

  for (const sel of sendSelectors) {
    const el = shadowQueryAll(sel)[0];
    if (el) {
      const innerBtn = el.shadowRoot?.querySelector('button');
      if (innerBtn) {
        innerBtn.click();
        log(`✓ Enviado via inner button (${sel}): "${innerBtn.getAttribute('aria-label')}"`);
        return;
      }
      el.click();
      log(`✓ Enviado via custom element: ${sel}`);
      return;
    }
  }

  // 2. Qualquer button[aria-label="Enviar|Send"] no shadow DOM
  const enviarBtn = shadowFind(el =>
    el.tagName === 'BUTTON' &&
    /enviar|send/i.test(el.getAttribute('aria-label') || '')
  );
  if (enviarBtn) {
    enviarBtn.click();
    log(`✓ Enviado via button[aria-label]: "${enviarBtn.getAttribute('aria-label')}"`);
    return;
  }

  // 3. Qualquer elemento com classe send-button
  const byClass = shadowFind(el =>
    (el.className || '').includes('send-button') ||
    (el.className || '').includes('send_button')
  );
  if (byClass) {
    const inner = byClass.shadowRoot?.querySelector('button') || byClass;
    inner.click();
    log(`✓ Enviado via .send-button: <${byClass.tagName}>`);
    return;
  }

  // 4. Último recurso: Enter no campo
  const field = findField();
  if (field) {
    log('Botão não encontrado. Tentando Enter no campo...');
    field.focus();
    await sleep(150);
    field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true, cancelable: true }));
    await sleep(80);
    field.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', keyCode: 13, bubbles: true }));
    return;
  }

  throw new Error('Botão de envio não encontrado.');
}

// ── Aguardar vídeo ────────────────────────────────────────────────────────────

// prevDlBtn: botão de download que já existia ANTES de enviar (para ignorar)
// prevVideos: Set de srcs de vídeos já existentes ANTES de enviar
function waitForVideo(prevDlBtn, prevVideos) {
  prevVideos = prevVideos || new Set();

  return new Promise((resolve, reject) => {
    let done = false;

    function check() {
      // Só aceita botão de download que seja NOVO (diferente do anterior)
      const dlBtn = findDlBtn();
      if (dlBtn && dlBtn !== prevDlBtn) return 'download-btn';

      // Só aceita vídeo com src que não existia antes
      const videos = shadowQueryAll('video');
      const newVideo = videos.find(v => {
        const src = v.src || v.currentSrc;
        return src && !prevVideos.has(src) && v.readyState >= 1;
      });
      if (newVideo) return 'video-element';

      return null;
    }

    function finish(r) {
      if (done) return; done = true;
      clearTimeout(t); clearInterval(p); obs.disconnect();
      log('Novo vídeo detectado: ' + r); resolve();
    }
    function fail(m) {
      if (done) return; done = true;
      clearTimeout(t); clearInterval(p); obs.disconnect();
      reject(new Error(m));
    }

    const obs = new MutationObserver(() => {
      const r = check(); if (r) finish(r);
    });
    obs.observe(document.body, { childList: true, subtree: true, attributes: true });

    const p = setInterval(() => { const r = check(); if (r) finish(r); }, 2000);
    const t = setTimeout(() => fail('Timeout: vídeo não gerado em 3 min.'), 180_000);

    // Primeira verificação só após 8s (aguarda Gemini começar a gerar)
    setTimeout(() => { const r = check(); if (r) finish(r); }, 8000);
  });
}

// ── Download ──────────────────────────────────────────────────────────────────

function findDlBtn() {
  // Busca no DOM normal e no shadow DOM
  const selectors = [
    '[aria-label="Baixar arquivo de vídeo"]',
    '[aria-label="Download video file"]',
    '[data-aria-label="Baixar arquivo de vídeo"]',
    '[data-aria-label="Download video file"]',
    '[aria-label*="Baixar" i]',
    '[aria-label*="Download" i]',
    'a[download]',
  ];
  for (const sel of selectors) {
    const results = shadowQueryAll(sel);
    if (results.length) return results[0];
  }
  return null;
}

async function downloadVideo(n) {
  const btn = findDlBtn();
  if (btn) {
    // Tenta clicar no inner button se for custom element
    const inner = btn.shadowRoot?.querySelector('button, a') || btn;
    inner.click();
    log('Download via botão ✓');
    return true;
  }

  const videos = shadowQueryAll('video');
  const v = videos[videos.length - 1] || document.querySelector('video');
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
