// Content script — coordena com o background que roda no MAIN world

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
      runDiagnose().then(sendResponse); break;
  }
  return true;
});

// ── Loop principal ────────────────────────────────────────────────────────────

async function processNext() {
  if (!state.isRunning || state.isPaused) return;
  if (state.currentIndex >= state.queue.length) {
    notifyPopup({ type: 'COMPLETE', total: state.queue.length });
    state.isRunning = false; return;
  }

  const block = state.queue[state.currentIndex];
  const n = state.currentIndex + 1;

  notifyPopup({
    type: 'PROGRESS', current: n, total: state.queue.length,
    preview: block.substring(0, 60) + (block.length > 60 ? '...' : '')
  });

  try {
    // PASSO 1: Preenche o campo via MAIN world
    log(`[${n}/${state.queue.length}] Preenchendo campo...`);
    const fillResult = await bgExec('FILL_FIELD', { text: block });
    if (!fillResult?.ok) throw new Error(fillResult?.error || 'Falha ao preencher campo.');
    log(`Campo preenchido: ${fillResult.result?.length || 0} chars ✓`);

    // Aguarda o framework processar e habilitar o botão
    await sleep(1200);

    // PASSO 2: Envia via MAIN world
    log(`[${n}] Enviando...`);
    const submitResult = await bgExec('SUBMIT_FORM');
    log(`Envio: ${JSON.stringify(submitResult?.result || {})}`);

    // PASSO 3: Aguarda geração
    log(`[${n}] Aguardando vídeo (até 3 min)...`);
    await waitForVideo();
    await sleep(1500);

    // PASSO 4: Download
    log(`[${n}] Baixando...`);
    const dl = await downloadVideo(n);

    notifyPopup({ type: 'BLOCK_DONE', current: n, total: state.queue.length, downloaded: dl });

    const delay = state.settings.delayBetween || 5000;
    log(`[${n}] ✓ Pronto. Próximo em ${delay / 1000}s...`);
    await sleep(delay);
    state.currentIndex++;
    processNext();

  } catch (err) {
    log(`[${n}] ERRO: ${err.message}`);
    notifyPopup({ type: 'ERROR', current: n, message: err.message });
    state.isRunning = false;
  }
}

// ── Comunicação com background ────────────────────────────────────────────────

function bgExec(type, extra = {}) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type, ...extra }, (res) => {
      if (chrome.runtime.lastError) resolve({ ok: false, error: chrome.runtime.lastError.message });
      else resolve(res);
    });
  });
}

// ── Aguardar vídeo (MutationObserver) ────────────────────────────────────────

function waitForVideo() {
  return new Promise((resolve, reject) => {
    const MAX = 180_000;
    let done = false;

    function finish(reason) {
      if (done) return; done = true;
      clearTimeout(t); clearInterval(poll); observer.disconnect();
      log('Vídeo detectado: ' + reason); resolve();
    }
    function fail(msg) {
      if (done) return; done = true;
      clearTimeout(t); clearInterval(poll); observer.disconnect();
      reject(new Error(msg));
    }

    const observer = new MutationObserver(() => {
      if (findDownloadButton()) { finish('botão download'); return; }
      const v = document.querySelector('video');
      if (v && (v.src || v.currentSrc || v.readyState >= 1)) finish('elemento video');
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['src', 'disabled'] });

    const poll = setInterval(() => {
      if (findDownloadButton()) { finish('poll: download btn'); return; }
      const v = document.querySelector('video');
      if (v && (v.src || v.currentSrc)) finish('poll: video src');
    }, 2000);

    const t = setTimeout(() => fail('Timeout: vídeo não gerado em 3 minutos.'), MAX);
    sleep(5000); // mínimo antes de começar a verificar
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
  if (btn) { btn.click(); log('Download via botão ✓'); return true; }

  const v = document.querySelector('video');
  if (!v) { log('Sem vídeo — baixe manualmente.'); return false; }

  const url = v.src || v.currentSrc;
  if (!url) { log('Sem URL — baixe manualmente.'); return false; }

  if (url.startsWith('blob:')) {
    const a = document.createElement('a');
    a.href = url; a.download = `video_${String(n).padStart(3,'0')}.mp4`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    log('Download blob ✓'); return true;
  }

  chrome.runtime.sendMessage({ type: 'DOWNLOAD', url, filename: `video_${String(n).padStart(3,'0')}.mp4` });
  return true;
}

// ── Diagnóstico ───────────────────────────────────────────────────────────────

async function runDiagnose() {
  const res = await bgExec('INSPECT_BUTTONS');
  const buttons = res?.result || [];
  const v = document.querySelector('video');
  const dl = findDownloadButton();
  return {
    buttons,
    videosCount: document.querySelectorAll('video').length,
    videoSrc: v?.src || v?.currentSrc || null,
    downloadBtn: !!dl,
    downloadLabel: dl?.getAttribute('aria-label') || null
  };
}

// ── Utils ─────────────────────────────────────────────────────────────────────

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function log(msg) { console.log('[GVA]', msg); notifyPopup({ type: 'LOG', message: msg }); }
function notifyPopup(data) { chrome.runtime.sendMessage(data).catch(() => {}); }
