// Content script — business.gemini.google.com

let state = {
  queue: [],
  currentIndex: 0,
  isRunning: false,
  isPaused: false,
  settings: { delayBetween: 3000 }
};

// ─── Message listener ─────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'START':
      state.queue    = message.blocks;
      state.settings = message.settings || state.settings;
      state.currentIndex = 0;
      state.isRunning    = true;
      state.isPaused     = false;
      processNext();
      sendResponse({ ok: true });
      break;
    case 'PAUSE':
      state.isPaused  = true;
      state.isRunning = false;
      sendResponse({ ok: true });
      break;
    case 'RESUME':
      state.isPaused  = false;
      state.isRunning = true;
      processNext();
      sendResponse({ ok: true });
      break;
    case 'STOP':
      state.isRunning = false;
      state.isPaused  = false;
      state.queue     = [];
      state.currentIndex = 0;
      sendResponse({ ok: true });
      break;
    case 'GET_STATUS':
      sendResponse({
        currentIndex: state.currentIndex,
        total:        state.queue.length,
        isRunning:    state.isRunning,
        isPaused:     state.isPaused
      });
      break;
    case 'DIAGNOSE':
      sendResponse(diagnose());
      break;
  }
  return true;
});

// ─── Main loop ────────────────────────────────────────────────────────────────

async function processNext() {
  if (!state.isRunning || state.isPaused) return;
  if (state.currentIndex >= state.queue.length) {
    notifyPopup({ type: 'COMPLETE', total: state.queue.length });
    state.isRunning = false;
    return;
  }

  const block    = state.queue[state.currentIndex];
  const blockNum = state.currentIndex + 1;

  notifyPopup({
    type: 'PROGRESS',
    current: blockNum,
    total:   state.queue.length,
    preview: block.substring(0, 60) + (block.length > 60 ? '...' : '')
  });

  try {
    log(`[${blockNum}/${state.queue.length}] Digitando prompt...`);
    await typePrompt(block);
    await sleep(700);

    log(`[${blockNum}] Enviando...`);
    await submitPrompt();

    log(`[${blockNum}] Aguardando geração do vídeo...`);
    await waitForVideoReady();

    log(`[${blockNum}] Vídeo pronto! Tentando baixar...`);
    await sleep(1000);
    downloadLatestVideo(blockNum); // fire-and-forget — não bloqueia o fluxo

    notifyPopup({ type: 'BLOCK_DONE', current: blockNum, total: state.queue.length });

    const delay = state.settings.delayBetween || 3000;
    log(`[${blockNum}] Aguardando ${delay / 1000}s antes do próximo bloco...`);
    await sleep(delay);

    state.currentIndex++;
    processNext();

  } catch (err) {
    log(`[${blockNum}] ERRO: ${err.message}`);
    notifyPopup({ type: 'ERROR', current: blockNum, message: err.message });
    state.isRunning = false;
  }
}

// ─── Input detection ─────────────────────────────────────────────────────────

function findInputElement() {
  // Try selectors from most specific to most generic
  const selectors = [
    // Gemini video prompt input (Portuguese placeholder)
    '[placeholder*="como deve ser"]',
    '[placeholder*="vídeo"]',
    '[aria-label*="vídeo" i]',
    // Rich textarea (Gemini's custom component)
    'rich-textarea [contenteditable="true"]',
    'rich-textarea div[contenteditable]',
    // Generic contenteditable inputs at the bottom of the page
    'div[contenteditable="true"]',
    // Fallback textarea
    'textarea',
  ];

  for (const sel of selectors) {
    const els = document.querySelectorAll(sel);
    if (els.length > 0) {
      // Always pick the LAST match (bottom of page = active input)
      return els[els.length - 1];
    }
  }
  return null;
}

async function typePrompt(text) {
  const input = findInputElement();
  if (!input) throw new Error('Campo de texto não encontrado. Abra um chat no Gemini e tente novamente.');

  input.focus();
  await sleep(300);

  const isEditable = input.isContentEditable || input.contentEditable === 'true';

  if (isEditable) {
    // Select all existing text and replace
    document.execCommand('selectAll', false, null);
    await sleep(100);
    const ok = document.execCommand('insertText', false, text);
    if (!ok) {
      // Fallback for browsers that block execCommand
      input.textContent = '';
      input.textContent = text;
      input.dispatchEvent(new InputEvent('input', { bubbles: true, data: text, inputType: 'insertText' }));
    }
  } else {
    // Standard textarea
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
    setter.call(input, text);
    input.dispatchEvent(new Event('input',  { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // Fire extra input event so React/Lit detects the change
  input.dispatchEvent(new Event('input', { bubbles: true }));
  await sleep(300);
}

async function submitPrompt() {
  // Button selectors — Gemini's send button
  const selectors = [
    'button[aria-label="Send message"]',
    'button[aria-label="Enviar mensagem"]',
    'button[aria-label*="Send" i]',
    'button[aria-label*="Enviar" i]',
    'button[data-testid="send-button"]',
    'button[jsname="Qx7uuf"]',    // common Gemini send button jsname
    'button.send-button',
    'form button[type="submit"]',
  ];

  for (const sel of selectors) {
    const btn = document.querySelector(sel);
    if (btn && !btn.disabled) {
      btn.click();
      log('Enviado via botão: ' + sel);
      return;
    }
  }

  // Fallback: Enter key on the input
  const input = findInputElement();
  if (input) {
    log('Botão não encontrado, usando Enter...');
    input.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Enter', code: 'Enter', keyCode: 13,
      bubbles: true, cancelable: true
    }));
    await sleep(50);
    input.dispatchEvent(new KeyboardEvent('keyup', {
      key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true
    }));
  } else {
    throw new Error('Botão de envio e campo de texto não encontrados.');
  }
}

// ─── Video detection via MutationObserver ─────────────────────────────────────

function waitForVideoReady() {
  return new Promise((resolve, reject) => {
    const MAX_WAIT = 180_000; // 3 min
    let timer;
    let resolved = false;

    function done() {
      if (resolved) return;
      resolved = true;
      clearTimeout(timer);
      observer.disconnect();
      resolve();
    }

    function fail(msg) {
      if (resolved) return;
      resolved = true;
      clearTimeout(timer);
      observer.disconnect();
      reject(new Error(msg));
    }

    // MutationObserver watches for any new video element or src change
    const observer = new MutationObserver(() => {
      // Check for a video that has a src (even blob)
      const videos = document.querySelectorAll('video');
      for (const v of videos) {
        if (v.src || v.currentSrc || v.querySelector('source')) {
          // Also make sure it's not paused on frame 0 with no duration (still loading)
          if (v.readyState >= 1 || v.src) {
            log('Vídeo detectado pelo MutationObserver.');
            done();
            return;
          }
        }
      }

      // Also look for a download/share button appearing (signals generation complete)
      const doneSignals = [
        '[aria-label*="Download" i]',
        '[aria-label*="Baixar" i]',
        '[aria-label*="download" i]',
        'button[download]',
      ];
      for (const sel of doneSignals) {
        if (document.querySelector(sel)) {
          log('Botão de download detectado — vídeo pronto.');
          done();
          return;
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree:   true,
      attributes: true,
      attributeFilter: ['src']
    });

    // Also poll every 3s as backup
    const poll = setInterval(() => {
      if (resolved) { clearInterval(poll); return; }
      const videos = document.querySelectorAll('video');
      if (videos.length > 0) {
        const last = videos[videos.length - 1];
        if (last.src || last.currentSrc) {
          clearInterval(poll);
          log('Vídeo detectado pelo polling.');
          done();
        }
      }
    }, 3000);

    timer = setTimeout(() => {
      clearInterval(poll);
      fail('Timeout: vídeo não foi gerado em 3 minutos.');
    }, MAX_WAIT);

    // Wait at least 4s before starting to check (generation takes time)
    sleep(4000).then(() => {
      if (!resolved) observer.observe(document.body, { childList: true, subtree: true });
    });
  });
}

// ─── Download ─────────────────────────────────────────────────────────────────

function downloadLatestVideo(index) {
  try {
    // 1) Try clicking Gemini's download button
    const btnSelectors = [
      '[aria-label*="Download" i]',
      '[aria-label*="Baixar" i]',
      '[aria-label*="download" i]',
      'button[download]',
      'a[download]',
    ];
    for (const sel of btnSelectors) {
      const btn = document.querySelector(sel);
      if (btn) {
        btn.click();
        log(`[${index}] Download iniciado via botão (${sel}).`);
        return;
      }
    }

    // 2) Get video src
    const videos = document.querySelectorAll('video');
    if (videos.length === 0) {
      log(`[${index}] Nenhum elemento <video> encontrado — pule ou baixe manualmente.`);
      return;
    }

    const last = videos[videos.length - 1];
    const url  = last.src || last.currentSrc || (last.querySelector('source') || {}).src;

    if (!url) {
      log(`[${index}] URL do vídeo não disponível — tente baixar manualmente.`);
      return;
    }

    if (url.startsWith('blob:')) {
      // Blob URLs can't be downloaded via chrome.downloads directly.
      // Create a temporary <a> tag and click it (works for same-origin blobs).
      const a = document.createElement('a');
      a.href     = url;
      a.download = `video_${String(index).padStart(3, '0')}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      log(`[${index}] Download blob iniciado.`);
      return;
    }

    // 3) Regular URL — send to background for chrome.downloads
    chrome.runtime.sendMessage({
      type:     'DOWNLOAD',
      url,
      filename: `video_${String(index).padStart(3, '0')}.mp4`
    });
    log(`[${index}] Download enviado ao background.`);

  } catch (e) {
    log(`[${index}] Aviso no download: ${e.message} — continue manualmente se necessário.`);
  }
}

// ─── Diagnose (debug helper) ──────────────────────────────────────────────────

function diagnose() {
  const input = findInputElement();
  const videos = document.querySelectorAll('video');
  return {
    inputFound:    !!input,
    inputTag:      input ? input.tagName : null,
    inputEditable: input ? input.isContentEditable : null,
    videosCount:   videos.length,
    videoSrcs:     Array.from(videos).map(v => v.src || v.currentSrc || '(no src)').slice(0, 3),
  };
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function log(msg) {
  console.log('[GVA]', msg);
  notifyPopup({ type: 'LOG', message: msg });
}

function notifyPopup(data) {
  chrome.runtime.sendMessage(data).catch(() => {});
}
