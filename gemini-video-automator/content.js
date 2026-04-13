// Content script injected into business.gemini.google.com
// Handles DOM interaction: typing prompts, submitting, detecting videos, downloading

let state = {
  queue: [],
  currentIndex: 0,
  isRunning: false,
  isPaused: false,
  settings: { delayBetween: 3000, separator: '\n\n' }
};

// ─── Message listener ───────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'START':
      state.queue = message.blocks;
      state.settings = message.settings || state.settings;
      state.currentIndex = 0;
      state.isRunning = true;
      state.isPaused = false;
      processNext();
      sendResponse({ ok: true });
      break;

    case 'PAUSE':
      state.isPaused = true;
      state.isRunning = false;
      sendResponse({ ok: true });
      break;

    case 'RESUME':
      state.isPaused = false;
      state.isRunning = true;
      processNext();
      sendResponse({ ok: true });
      break;

    case 'STOP':
      state.isRunning = false;
      state.isPaused = false;
      state.queue = [];
      state.currentIndex = 0;
      sendResponse({ ok: true });
      break;

    case 'GET_STATUS':
      sendResponse({
        currentIndex: state.currentIndex,
        total: state.queue.length,
        isRunning: state.isRunning,
        isPaused: state.isPaused
      });
      break;
  }
  return true;
});

// ─── Main loop ───────────────────────────────────────────────────────────────

async function processNext() {
  if (!state.isRunning || state.isPaused) return;
  if (state.currentIndex >= state.queue.length) {
    notifyPopup({ type: 'COMPLETE', total: state.queue.length });
    state.isRunning = false;
    return;
  }

  const block = state.queue[state.currentIndex];
  const blockNum = state.currentIndex + 1;

  notifyPopup({
    type: 'PROGRESS',
    current: blockNum,
    total: state.queue.length,
    preview: block.substring(0, 60) + (block.length > 60 ? '...' : '')
  });

  try {
    log(`[${blockNum}/${state.queue.length}] Digitando prompt...`);

    // Count videos before sending so we can detect the NEW one
    const videosBefore = countVideos();

    await typePrompt(block);
    await sleep(600);
    await submitPrompt();

    log(`[${blockNum}] Aguardando geração do vídeo...`);
    await waitForNewVideo(videosBefore);

    log(`[${blockNum}] Vídeo gerado! Baixando...`);
    await sleep(1500); // leave time for video to fully load
    await downloadLatestVideo(blockNum);

    notifyPopup({ type: 'BLOCK_DONE', current: blockNum, total: state.queue.length });

    const delay = state.settings.delayBetween || 3000;
    log(`[${blockNum}] Concluído. Aguardando ${delay / 1000}s antes do próximo...`);
    await sleep(delay);

    state.currentIndex++;
    processNext();

  } catch (err) {
    log(`[${blockNum}] ERRO: ${err.message}`);
    notifyPopup({ type: 'ERROR', current: blockNum, message: err.message });
    state.isRunning = false;
  }
}

// ─── DOM helpers ─────────────────────────────────────────────────────────────

function findInputElement() {
  // Gemini uses a rich-textarea web component with a contenteditable inside
  const candidates = [
    // Most specific: inside rich-textarea component
    'rich-textarea [contenteditable="true"]',
    'rich-textarea div[contenteditable]',
    // Generic contenteditable (Gemini's chat input)
    'div[contenteditable="true"][aria-multiline]',
    'div[contenteditable="true"]',
    // Fallback for textarea-based inputs
    'textarea[aria-label]',
    'textarea'
  ];

  for (const sel of candidates) {
    const els = document.querySelectorAll(sel);
    // Pick the last one (usually the active input at the bottom)
    if (els.length > 0) return els[els.length - 1];
  }
  return null;
}

async function typePrompt(text) {
  const input = findInputElement();
  if (!input) throw new Error('Campo de texto não encontrado. Certifique-se de estar na página de chat do Gemini.');

  input.focus();
  await sleep(200);

  // Clear existing content
  if (input.contentEditable === 'true' || input.isContentEditable) {
    // Select all
    document.execCommand('selectAll', false, null);
    await sleep(100);
    // Insert new text
    const result = document.execCommand('insertText', false, text);
    if (!result) {
      // Fallback: manipulate innerHTML (less ideal for React)
      input.textContent = text;
      input.dispatchEvent(new InputEvent('input', { bubbles: true, data: text }));
    }
  } else {
    // Textarea fallback
    const nativeSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype, 'value'
    ).set;
    nativeSetter.call(input, text);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // Dispatch extra events so React/Angular pick up the change
  input.dispatchEvent(new Event('input', { bubbles: true }));
  await sleep(200);
}

async function submitPrompt() {
  // Try send button first
  const sendSelectors = [
    'button[aria-label="Send message"]',
    'button[aria-label="Enviar mensagem"]',
    'button[data-testid="send-button"]',
    // Gemini's send button often has a mat-icon-button class
    'button.send-button',
    '[aria-label*="send" i]:not([disabled])',
    '[aria-label*="enviar" i]:not([disabled])',
    // Generic: look for a button at the bottom right with an SVG arrow icon
    'form button[type="submit"]',
  ];

  for (const sel of sendSelectors) {
    const btn = document.querySelector(sel);
    if (btn && !btn.disabled && !btn.hasAttribute('disabled')) {
      btn.click();
      return;
    }
  }

  // Fallback: press Enter in the input field
  const input = findInputElement();
  if (input) {
    input.dispatchEvent(new KeyboardEvent('keydown', {
      key: 'Enter', code: 'Enter', keyCode: 13,
      bubbles: true, cancelable: true
    }));
    input.dispatchEvent(new KeyboardEvent('keyup', {
      key: 'Enter', code: 'Enter', keyCode: 13,
      bubbles: true
    }));
  } else {
    throw new Error('Botão de envio não encontrado.');
  }
}

function countVideos() {
  return document.querySelectorAll('video').length;
}

async function waitForNewVideo(videosBefore) {
  const maxWait = 180000; // 3 minutes max (video generation can take a while)
  const poll = 2000;
  let elapsed = 0;

  // First, wait for the request to be sent (brief delay)
  await sleep(3000);

  while (elapsed < maxWait) {
    const videosNow = countVideos();

    // A new video appeared
    if (videosNow > videosBefore) {
      // Make sure it's actually loaded (has a src)
      const videos = document.querySelectorAll('video');
      const lastVideo = videos[videos.length - 1];
      if (lastVideo && (lastVideo.src || lastVideo.currentSrc || lastVideo.querySelector('source'))) {
        return lastVideo;
      }
    }

    // Check if there's an error message
    const errorEl = document.querySelector('[aria-label*="error" i], .error-message, [data-error]');
    if (errorEl) throw new Error('Gemini retornou um erro durante a geração.');

    await sleep(poll);
    elapsed += poll;
  }

  throw new Error('Timeout: vídeo não gerado após 3 minutos.');
}

async function downloadLatestVideo(index) {
  // 1) Try clicking Gemini's own download button
  const downloadBtnSelectors = [
    '[aria-label*="Download" i]',
    '[aria-label*="Baixar" i]',
    '[aria-label*="download" i]',
    'button[download]',
    '.download-button',
  ];

  for (const sel of downloadBtnSelectors) {
    const btn = document.querySelector(sel);
    if (btn) {
      btn.click();
      log(`[${index}] Download iniciado via botão.`);
      return;
    }
  }

  // 2) Fallback: get video src and trigger download via background
  const videos = document.querySelectorAll('video');
  if (videos.length === 0) {
    log(`[${index}] Aviso: nenhum vídeo encontrado para download.`);
    return;
  }

  const lastVideo = videos[videos.length - 1];
  let url = lastVideo.src || lastVideo.currentSrc;

  if (!url) {
    const source = lastVideo.querySelector('source');
    if (source) url = source.src;
  }

  if (!url || url.startsWith('blob:')) {
    // Blob URLs: try to click a parent download link
    const link = lastVideo.closest('a[download], a[href*="download"]');
    if (link) {
      link.click();
      return;
    }
    log(`[${index}] Aviso: não foi possível obter URL direta do vídeo (blob). Tente baixar manualmente.`);
    return;
  }

  const filename = `video_${String(index).padStart(3, '0')}.mp4`;
  chrome.runtime.sendMessage({ type: 'DOWNLOAD', url, filename });
  log(`[${index}] Download enviado: ${filename}`);
}

// ─── Utilities ───────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function log(msg) {
  console.log('[GVA]', msg);
  notifyPopup({ type: 'LOG', message: msg });
}

function notifyPopup(data) {
  chrome.runtime.sendMessage(data).catch(() => {
    // Popup might be closed — that's fine
  });
}
