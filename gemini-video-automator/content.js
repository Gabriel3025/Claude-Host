// Content script — business.gemini.google

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
    case 'GET_STATUS':
      sendResponse({ currentIndex: state.currentIndex, total: state.queue.length, isRunning: state.isRunning }); break;
    case 'DIAGNOSE':
      sendResponse(diagnose()); break;
  }
  return true;
});

// ── Main loop ────────────────────────────────────────────────────────────────

async function processNext() {
  if (!state.isRunning || state.isPaused) return;
  if (state.currentIndex >= state.queue.length) {
    notifyPopup({ type: 'COMPLETE', total: state.queue.length });
    state.isRunning = false; return;
  }

  const block = state.queue[state.currentIndex];
  const n = state.currentIndex + 1;

  notifyPopup({ type: 'PROGRESS', current: n, total: state.queue.length,
    preview: block.substring(0, 60) + (block.length > 60 ? '...' : '') });

  try {
    log(`[${n}/${state.queue.length}] Preenchendo campo...`);
    await fillField(block);
    await sleep(1000); // garante que framework processou o texto

    log(`[${n}] Enviando...`);
    await sendMessage();

    log(`[${n}] Aguardando vídeo...`);
    await waitForVideo();
    await sleep(1500);

    log(`[${n}] Baixando...`);
    const dl = await downloadVideo(n);

    notifyPopup({ type: 'BLOCK_DONE', current: n, total: state.queue.length, downloaded: dl });

    const delay = state.settings.delayBetween || 5000;
    log(`[${n}] ✓ Concluído. Próximo em ${delay / 1000}s...`);
    await sleep(delay);
    state.currentIndex++;
    processNext();
  } catch (err) {
    log(`[${n}] ERRO: ${err.message}`);
    notifyPopup({ type: 'ERROR', current: n, message: err.message });
    state.isRunning = false;
  }
}

// ── Encontrar o campo de texto ───────────────────────────────────────────────

function findField() {
  // O campo do Gemini Video é um <textarea> com placeholder específico
  const byPlaceholder = document.querySelector('textarea[placeholder*="Descreva"]') ||
                        document.querySelector('textarea[placeholder*="vídeo"]') ||
                        document.querySelector('textarea[placeholder*="video"]');
  if (byPlaceholder) return byPlaceholder;

  // Fallback: último textarea ou contenteditable da página
  const textareas = document.querySelectorAll('textarea');
  if (textareas.length) return textareas[textareas.length - 1];

  const editables = document.querySelectorAll('[contenteditable="true"]');
  if (editables.length) return editables[editables.length - 1];

  return null;
}

// ── Preencher campo (método que aciona React/Angular) ────────────────────────

async function fillField(text) {
  const field = findField();
  if (!field) throw new Error('Campo de texto não encontrado na página.');

  // 1. Clica para focar (necessário para ativar event listeners)
  field.click();
  await sleep(200);
  field.focus();
  await sleep(300);

  // 2. Seleciona tudo e apaga
  document.execCommand('selectAll', false, null);
  await sleep(100);

  // 3. Tenta inserir via execCommand (mais compatível com React)
  const inserted = document.execCommand('insertText', false, text);
  await sleep(300);

  // 4. Verifica se funcionou
  const currentVal = field.value || field.textContent || '';
  if (currentVal.trim().length > 0) {
    log(`Campo preenchido: ${currentVal.length} chars ✓`);
    return;
  }

  // 5. Fallback: setter nativo + evento input (compatível com React controlled components)
  log('execCommand falhou, usando setter nativo...');
  const nativeSetter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
  nativeSetter.call(field, text);

  // Dispara os eventos que React/Angular escutam
  field.dispatchEvent(new Event('focus',  { bubbles: true }));
  field.dispatchEvent(new Event('input',  { bubbles: true }));
  field.dispatchEvent(new Event('change', { bubbles: true }));
  field.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }));

  await sleep(400);

  // 6. Simula paste como última tentativa
  const dt = new DataTransfer();
  dt.setData('text/plain', text);
  field.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
  await sleep(300);

  log(`Campo preenchido (fallback): ${text.length} chars`);
}

// ── Enviar mensagem ──────────────────────────────────────────────────────────

async function sendMessage() {
  // Aguarda framework processar o input
  await sleep(800);

  const field = findField();

  // Estratégia 0: requestSubmit no form (nativo, funciona com qualquer framework)
  const form = field?.closest('form');
  if (form) {
    try {
      form.requestSubmit();
      log('Enviado via form.requestSubmit() ✓');
      return;
    } catch (e) {
      // form.submit() como fallback do requestSubmit
      try { form.submit(); log('Enviado via form.submit() ✓'); return; } catch (_) {}
    }
  }

  // Tenta encontrar o botão de envio via MutationObserver por 3 segundos
  const btn = await waitForSendButton(3000);
  if (btn) {
    btn.click();
    log('Enviado via botão: ' + (btn.getAttribute('aria-label') || btn.getAttribute('jsname') || btn.className.substring(0, 40)));
    return;
  }

  // Busca manual por todos os botões habilitados
  const field = findField();
  const allButtons = Array.from(document.querySelectorAll('button:not([disabled])'));
  log(`${allButtons.length} botões ativos. Procurando envio...`);

  // Tenta botões com aria-label de envio
  for (const b of allButtons) {
    const label = (b.getAttribute('aria-label') || '').toLowerCase();
    if (label.includes('send') || label.includes('enviar') || label.includes('submit')) {
      b.click();
      log('Enviado: ' + label);
      return;
    }
  }

  // Tenta clicar no botão à direita do campo
  if (field) {
    const rect = field.getBoundingClientRect();
    for (const xOffset of [50, 80, 40, 100]) {
      const el = document.elementFromPoint(rect.right + xOffset, rect.top + rect.height / 2);
      const btn = el?.closest('button') || (el?.tagName === 'BUTTON' ? el : null);
      if (btn && !btn.disabled) {
        btn.click();
        log('Enviado via clique posicional (right+' + xOffset + ')');
        return;
      }
    }

    // Tenta dentro do container do campo (botão irmão)
    let parent = field.parentElement;
    for (let i = 0; i < 8; i++) {
      if (!parent) break;
      const btns = Array.from(parent.querySelectorAll('button:not([disabled])'));
      if (btns.length > 0 && btns.length <= 5) {
        // Pega o último botão do container (geralmente é o de envio)
        const last = btns[btns.length - 1];
        last.click();
        log('Enviado via último botão do container (nível ' + i + ')');
        return;
      }
      parent = parent.parentElement;
    }

    // Último recurso: Enter no campo
    log('Usando Enter como último recurso...');
    field.focus();
    await sleep(200);
    field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true, cancelable: true }));
    await sleep(100);
    field.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', keyCode: 13, bubbles: true }));
  }
}

// Aguarda o botão de envio habilitar (fica disabled=false após React processar o texto)
function waitForSendButton(timeout = 3000) {
  return new Promise((resolve) => {
    const start = Date.now();

    function check() {
      // Busca botões que possam ser de envio
      const candidates = document.querySelectorAll('button:not([disabled])');
      for (const b of candidates) {
        const label = (b.getAttribute('aria-label') || '').toLowerCase();
        const jsname = b.getAttribute('jsname') || '';
        if (
          label.includes('send') || label.includes('enviar') ||
          jsname === 'Qx7uuf' || jsname === 'M2UYVd' || jsname === 'Nu4kNd'
        ) {
          resolve(b); return;
        }
      }
      if (Date.now() - start < timeout) setTimeout(check, 200);
      else resolve(null);
    }

    check();
  });
}

// ── Aguardar geração do vídeo ────────────────────────────────────────────────

function waitForVideo() {
  return new Promise((resolve, reject) => {
    const MAX = 180_000;
    let done = false;

    function finish(reason) {
      if (done) return; done = true;
      clearTimeout(t); clearInterval(poll); observer.disconnect();
      log('Vídeo detectado: ' + reason);
      resolve();
    }
    function fail(msg) {
      if (done) return; done = true;
      clearTimeout(t); clearInterval(poll); observer.disconnect();
      reject(new Error(msg));
    }

    const observer = new MutationObserver(() => {
      if (findDownloadButton()) { finish('botão download apareceu'); return; }
      const v = document.querySelector('video');
      if (v && (v.src || v.currentSrc || v.readyState >= 1)) finish('elemento video detectado');
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['src', 'aria-label', 'disabled'] });

    const poll = setInterval(() => {
      if (findDownloadButton()) { finish('poll: botão download'); return; }
      const v = document.querySelector('video');
      if (v && (v.src || v.currentSrc)) finish('poll: video src');
    }, 2000);

    const t = setTimeout(() => fail('Timeout: vídeo não gerado em 3 minutos.'), MAX);

    // Começa a verificar após 5s (geração leva tempo)
    sleep(5000).then(() => { if (!done) observer.observe(document.body, { childList: true, subtree: true }); });
  });
}

// ── Download ─────────────────────────────────────────────────────────────────

function findDownloadButton() {
  const selectors = [
    '[aria-label="Baixar arquivo de vídeo"]',
    '[aria-label="Download video file"]',
    '[aria-label*="Baixar" i]',
    '[aria-label*="Download" i]',
    '[title*="Baixar" i]',
    '[title*="Download" i]',
    'a[download]',
  ];
  for (const s of selectors) {
    const el = document.querySelector(s);
    if (el) return el;
  }
  return null;
}

async function downloadVideo(n) {
  const btn = findDownloadButton();
  if (btn) { btn.click(); log(`Download: clicou no botão ✓`); return true; }

  const v = document.querySelector('video');
  if (!v) { log('Sem vídeo para baixar.'); return false; }

  const url = v.src || v.currentSrc;
  if (!url) { log('Sem URL de vídeo.'); return false; }

  if (url.startsWith('blob:')) {
    const a = document.createElement('a');
    a.href = url;
    a.download = `video_${String(n).padStart(3,'0')}.mp4`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    log('Download blob iniciado ✓'); return true;
  }

  chrome.runtime.sendMessage({ type: 'DOWNLOAD', url, filename: `video_${String(n).padStart(3,'0')}.mp4` });
  return true;
}

// ── Diagnóstico ───────────────────────────────────────────────────────────────

function diagnose() {
  const field = findField();
  const videos = document.querySelectorAll('video');
  const dlBtn = findDownloadButton();
  const allBtns = Array.from(document.querySelectorAll('button')).map(b => ({
    label: b.getAttribute('aria-label') || '',
    jsname: b.getAttribute('jsname') || '',
    disabled: b.disabled,
    text: b.textContent.trim().substring(0, 20)
  }));

  return {
    fieldFound: !!field,
    fieldTag: field?.tagName,
    fieldPlaceholder: field?.placeholder || field?.getAttribute('placeholder'),
    allButtons: allBtns.slice(0, 15),
    videosCount: videos.length,
    downloadBtn: !!dlBtn,
    downloadBtnLabel: dlBtn ? (dlBtn.getAttribute('aria-label') || dlBtn.textContent.trim()) : null
  };
}

// ── Utils ─────────────────────────────────────────────────────────────────────

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function log(msg) { console.log('[GVA]', msg); notifyPopup({ type: 'LOG', message: msg }); }
function notifyPopup(data) { chrome.runtime.sendMessage(data).catch(() => {}); }
