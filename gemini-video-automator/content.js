// Content script — business.gemini.google.com
// Fluxo: separar blocos → digitar no campo "Descreva como deve ser o vídeo"
//        → enviar → aguardar geração → clicar "Baixar arquivo de vídeo" → próximo bloco

let state = {
  queue: [],
  currentIndex: 0,
  isRunning: false,
  isPaused: false,
  settings: { delayBetween: 5000 }
};

// ─── Messages ─────────────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'START':
      state.queue        = message.blocks;
      state.settings     = message.settings || state.settings;
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
      state.isRunning    = false;
      state.isPaused     = false;
      state.queue        = [];
      state.currentIndex = 0;
      sendResponse({ ok: true });
      break;
    case 'GET_STATUS':
      sendResponse({ currentIndex: state.currentIndex, total: state.queue.length, isRunning: state.isRunning });
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
    total: state.queue.length,
    preview: block.substring(0, 60) + (block.length > 60 ? '...' : '')
  });

  try {
    // PASSO 1: Digitar o bloco no campo de texto
    log(`[${blockNum}/${state.queue.length}] Digitando bloco...`);
    await typePrompt(block);
    await sleep(800);

    // PASSO 2: Enviar
    log(`[${blockNum}] Enviando para o Gemini...`);
    await submitPrompt();

    // PASSO 3: Aguardar geração do vídeo
    log(`[${blockNum}] Aguardando geração (pode levar 1-2 min)...`);
    await waitForVideoReady();
    await sleep(1500); // pausa extra para o botão de download aparecer

    // PASSO 4: Baixar o vídeo
    log(`[${blockNum}] Vídeo pronto! Clicando em "Baixar arquivo de vídeo"...`);
    const downloaded = await downloadVideo(blockNum);

    notifyPopup({ type: 'BLOCK_DONE', current: blockNum, total: state.queue.length, downloaded });

    // PASSO 5: Aguardar delay e ir para o próximo
    const delay = state.settings.delayBetween || 5000;
    log(`[${blockNum}] Concluído. Aguardando ${delay / 1000}s antes do próximo bloco...`);
    await sleep(delay);

    state.currentIndex++;
    processNext();

  } catch (err) {
    log(`[${blockNum}] ERRO: ${err.message}`);
    notifyPopup({ type: 'ERROR', current: blockNum, message: err.message });
    state.isRunning = false;
  }
}

// ─── PASSO 1: Digitar no campo de vídeo ──────────────────────────────────────
function findInputElement() {
  // O campo do Gemini para vídeo tem placeholder "Descreva como deve ser o vídeo"
  const selectors = [
    'textarea[placeholder*="Descreva como deve ser"]',
    'textarea[placeholder*="vídeo"]',
    'div[contenteditable][placeholder*="Descreva"]',
    '[placeholder*="Descreva como deve ser o vídeo"]',
    // Fallbacks genéricos
    'rich-textarea [contenteditable="true"]',
    'div[contenteditable="true"]',
    'textarea',
  ];

  for (const sel of selectors) {
    const els = document.querySelectorAll(sel);
    if (els.length > 0) return els[els.length - 1]; // sempre o último (campo ativo)
  }
  return null;
}

async function typePrompt(text) {
  const input = findInputElement();
  if (!input) throw new Error('Campo "Descreva como deve ser o vídeo" não encontrado. Certifique-se de estar na interface de vídeo do Gemini.');

  input.focus();
  await sleep(400);

  const isEditable = input.isContentEditable || input.contentEditable === 'true';

  if (isEditable) {
    document.execCommand('selectAll', false, null);
    await sleep(100);
    const ok = document.execCommand('insertText', false, text);
    if (!ok) {
      input.textContent = '';
      input.textContent = text;
      input.dispatchEvent(new InputEvent('input', { bubbles: true, data: text, inputType: 'insertText' }));
    }
  } else {
    // textarea padrão
    const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
    setter.call(input, text);
    input.dispatchEvent(new Event('input',  { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  input.dispatchEvent(new Event('input', { bubbles: true }));
  await sleep(300);
  log(`Campo preenchido com ${text.length} caracteres.`);
}

// ─── PASSO 2: Enviar ──────────────────────────────────────────────────────────
async function submitPrompt() {
  // Tenta encontrar botão de envio na vizinhança do campo de texto
  const input = findInputElement();

  // Estratégia 1: busca o botão no mesmo container do input (subindo até 5 níveis)
  if (input) {
    let parent = input.parentElement;
    for (let i = 0; i < 5; i++) {
      if (!parent) break;
      const btns = parent.querySelectorAll('button:not([disabled])');
      for (const btn of btns) {
        const label = (btn.getAttribute('aria-label') || btn.textContent || '').toLowerCase();
        // Ignora botão de microfone e de adicionar
        if (label.includes('microfone') || label.includes('microphone') || label.includes('adicionar') || label.includes('add')) continue;
        // Prefere botões com ícone de envio
        const hasSendIcon = btn.querySelector('svg, [data-icon], mat-icon');
        if (btns.length <= 3 || hasSendIcon) {
          btn.click();
          log('Enviado via botão próximo ao campo: ' + (btn.getAttribute('aria-label') || btn.className || 'sem label'));
          return;
        }
      }
      parent = parent.parentElement;
    }
  }

  // Estratégia 2: seletores globais conhecidos
  const selectors = [
    'button[aria-label="Send message"]',
    'button[aria-label="Enviar mensagem"]',
    'button[aria-label*="Send" i]',
    'button[aria-label*="Enviar" i]',
    'button[data-testid="send-button"]',
    'button[jsname="Qx7uuf"]',
    'button[jsname="M2UYVd"]',
    'button.send-button',
    'form button[type="submit"]',
  ];
  for (const sel of selectors) {
    const btn = document.querySelector(sel);
    if (btn && !btn.disabled) {
      btn.click();
      log('Enviado via seletor: ' + sel);
      return;
    }
  }

  // Estratégia 3: Enter no campo
  if (input) {
    log('Botão não encontrado — tentando Enter...');
    input.focus();
    await sleep(200);

    // Tenta via evento nativo do teclado
    const enterDown = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true, cancelable: true });
    input.dispatchEvent(enterDown);
    await sleep(100);
    input.dispatchEvent(new KeyboardEvent('keypress', { key: 'Enter', code: 'Enter', keyCode: 13, which: 13, bubbles: true }));
    await sleep(100);
    input.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }));

    log('Enter disparado. Aguarde...');
  } else {
    throw new Error('Campo de texto e botão de envio não encontrados.');
  }
}

// ─── PASSO 3: Aguardar geração via MutationObserver ──────────────────────────
function waitForVideoReady() {
  return new Promise((resolve, reject) => {
    const MAX_WAIT = 180_000; // 3 minutos
    let resolved   = false;

    function done(reason) {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeout);
      clearInterval(poll);
      observer.disconnect();
      log('Vídeo detectado: ' + reason);
      resolve();
    }

    function fail(msg) {
      if (resolved) return;
      resolved = true;
      clearTimeout(timeout);
      clearInterval(poll);
      observer.disconnect();
      reject(new Error(msg));
    }

    // MutationObserver: detecta qualquer novo elemento que indique vídeo pronto
    const observer = new MutationObserver(() => {
      // 1) Botão "Baixar arquivo de vídeo" apareceu → geração concluída
      if (findDownloadButton()) { done('botão de download encontrado'); return; }

      // 2) Elemento <video> com src
      const videos = document.querySelectorAll('video');
      for (const v of videos) {
        if (v.readyState >= 1 || v.src || v.currentSrc) { done('elemento <video> detectado'); return; }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });

    // Polling de backup a cada 3s
    const poll = setInterval(() => {
      if (findDownloadButton())                              { done('poll: botão download'); return; }
      const v = document.querySelector('video');
      if (v && (v.src || v.currentSrc || v.readyState >= 1)) { done('poll: video'); }
    }, 3000);

    const timeout = setTimeout(() => fail('Timeout: vídeo não gerado em 3 minutos.'), MAX_WAIT);

    // Aguarda no mínimo 5s antes de começar a verificar (geração leva tempo)
    sleep(5000).then(() => { if (!resolved) observer.observe(document.body, { childList: true, subtree: true }); });
  });
}

// ─── PASSO 4: Clicar em "Baixar arquivo de vídeo" ────────────────────────────
function findDownloadButton() {
  // Seletores baseados no que aparece na interface do Gemini
  const selectors = [
    '[aria-label="Baixar arquivo de vídeo"]',
    '[aria-label="Download video file"]',
    '[title="Baixar arquivo de vídeo"]',
    '[title="Download video file"]',
    'button[aria-label*="Baixar" i]',
    'button[aria-label*="Download" i]',
    'a[download]',
  ];

  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) return el;
  }
  return null;
}

async function downloadVideo(blockNum) {
  // Tenta clicar no botão de download do Gemini
  let btn = findDownloadButton();

  if (btn) {
    btn.click();
    log(`[${blockNum}] Clicou em "Baixar arquivo de vídeo".`);
    return true;
  }

  // Fallback: pegar src do <video> e baixar via blob link
  log(`[${blockNum}] Botão de download não encontrado — tentando via <video>...`);
  const videos = document.querySelectorAll('video');
  if (videos.length === 0) {
    log(`[${blockNum}] Sem vídeo encontrado — baixe manualmente.`);
    return false;
  }

  const last = videos[videos.length - 1];
  const url  = last.src || last.currentSrc || (last.querySelector('source') || {}).src;

  if (!url) {
    log(`[${blockNum}] Sem URL — baixe manualmente.`);
    return false;
  }

  if (url.startsWith('blob:')) {
    const a = document.createElement('a');
    a.href     = url;
    a.download = `video_${String(blockNum).padStart(3, '0')}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    log(`[${blockNum}] Download blob iniciado.`);
    return true;
  }

  chrome.runtime.sendMessage({ type: 'DOWNLOAD', url, filename: `video_${String(blockNum).padStart(3, '0')}.mp4` });
  return true;
}

// ─── Diagnóstico ─────────────────────────────────────────────────────────────
function diagnose() {
  const input   = findInputElement();
  const videos  = document.querySelectorAll('video');
  const dlBtn   = findDownloadButton();

  // Lista botões próximos ao campo de texto
  let nearbyBtns = [];
  if (input) {
    let parent = input.parentElement;
    for (let i = 0; i < 5; i++) {
      if (!parent) break;
      const btns = parent.querySelectorAll('button');
      btns.forEach(b => {
        nearbyBtns.push((b.getAttribute('aria-label') || b.getAttribute('jsname') || b.className || 'sem-label').substring(0, 40));
      });
      if (nearbyBtns.length > 0) break;
      parent = parent.parentElement;
    }
  }

  return {
    inputFound:       !!input,
    inputTag:         input ? input.tagName : null,
    inputEditable:    input ? input.isContentEditable : null,
    inputPlaceholder: input ? (input.placeholder || input.getAttribute('placeholder') || null) : null,
    nearbyButtons:    nearbyBtns.slice(0, 6),
    videosCount:      videos.length,
    videoSrcs:        Array.from(videos).map(v => v.src || v.currentSrc || '(no src)').slice(0, 3),
    downloadBtn:      !!dlBtn,
    downloadBtnLabel: dlBtn ? (dlBtn.getAttribute('aria-label') || dlBtn.textContent.trim()) : null,
  };
}

// ─── Utils ───────────────────────────────────────────────────────────────────
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function log(msg) {
  console.log('[GVA]', msg);
  notifyPopup({ type: 'LOG', message: msg });
}

function notifyPopup(data) {
  chrome.runtime.sendMessage(data).catch(() => {});
}
