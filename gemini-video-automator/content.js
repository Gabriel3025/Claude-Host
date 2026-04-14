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
    const dl = await downloadVideo(n, prevDlBtn);

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
  await sleep(400);

  // Limpa campo primeiro
  document.execCommand('selectAll', false, null);
  await sleep(100);
  document.execCommand('delete', false, null);
  await sleep(100);

  // Insere texto via execCommand (mais compatível com React/Angular)
  document.execCommand('insertText', false, text);
  await sleep(300);

  // Dispara eventos adicionais para forçar React a atualizar o estado
  // (necessário para o botão mic→enviar aparecer)
  field.dispatchEvent(new Event('input',  { bubbles: true }));
  field.dispatchEvent(new Event('change', { bubbles: true }));
  field.dispatchEvent(new InputEvent('input', {
    bubbles: true, inputType: 'insertText', data: text
  }));
  await sleep(200);

  // Verifica se inseriu
  if (field.value.trim().length > 0) {
    log(`Campo OK: ${field.value.length} chars`);
    return;
  }

  // Fallback: setter nativo do React
  const nativeSetter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
  nativeSetter.call(field, text);
  field.dispatchEvent(new Event('focus',  { bubbles: true }));
  field.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }));
  field.dispatchEvent(new Event('change', { bubbles: true }));
  await sleep(400);
  log(`Campo OK (fallback): ${field.value.length} chars`);
}

// ── Clicar no botão de envio ──────────────────────────────────────────────────

async function clickSend() {
  // Aguarda a UI reagir ao texto inserido (mic → botão de envio)
  await sleep(800);

  // Helper: tenta clicar num elemento (inner shadow button ou o elemento em si)
  function tryClick(el, label) {
    const inner = el.shadowRoot?.querySelector('button') || el;
    inner.click();
    log(`✓ Enviado via ${label}: <${el.tagName}> "${inner.getAttribute?.('aria-label') || ''}"`);
    return true;
  }

  // 1. Seletores para o botão de envio (estrutura original + variações pós-update)
  const sendSelectors = [
    'md-icon-button.send-button',
    'md-icon-button[data-aria-label="Enviar"]',
    'md-icon-button[data-aria-label="Send"]',
    'md-icon-button[aria-label="Enviar"]',
    'md-icon-button[aria-label="Send"]',
    '[data-aria-label="Enviar"]',
    '[data-aria-label="Send"]',
    'button[aria-label="Enviar"]',
    'button[aria-label="Send"]',
  ];
  for (const sel of sendSelectors) {
    const el = shadowQueryAll(sel)[0];
    if (el) { tryClick(el, sel); return; }
  }

  // 2. Qualquer button com label de envio no shadow DOM inteiro
  const enviarBtn = shadowFind(el =>
    el.tagName === 'BUTTON' &&
    /^(enviar|send|submit|gerar|generate)$/i.test((el.getAttribute('aria-label') || '').trim())
  );
  if (enviarBtn) { enviarBtn.click(); log(`✓ Enviado via button label: "${enviarBtn.getAttribute('aria-label')}"`); return; }

  // 3. Elemento com classe send-button (pode ter mudado de aria-label mas manteve classe)
  const byClass = shadowFind(el =>
    typeof el.className === 'string' &&
    (el.className.includes('send-button') || el.className.includes('send_button'))
  );
  if (byClass) { tryClick(byClass, '.send-button'); return; }

  // 4. O botão de microfone pode ter virado o botão de envio no modo vídeo
  //    Se o campo tem texto, o mic-button geralmente vira o send
  const micSelectors = [
    'md-icon-button[data-aria-label*="Gravar" i]',
    'md-icon-button[data-aria-label*="Record" i]',
    'md-icon-button[data-aria-label*="Microfone" i]',
    'md-icon-button[data-aria-label*="Microphone" i]',
    '[aria-label*="Gravar" i]',
    '[aria-label*="Microfone" i]',
  ];
  for (const sel of micSelectors) {
    const el = shadowQueryAll(sel)[0];
    if (el) { tryClick(el, `mic/send (${sel})`); return; }
  }

  // 5. Último md-icon-button na área de input (mais à direita — posição do botão de envio)
  const allIconBtns = shadowQueryAll('md-icon-button');
  if (allIconBtns.length) {
    // Pega o que está mais à direita e embaixo (posição típica do botão de envio)
    const sorted = allIconBtns
      .map(el => ({ el, r: el.getBoundingClientRect() }))
      .filter(({ r }) => r.width > 0 && r.height > 0)
      .sort((a, b) => (b.r.right + b.r.bottom) - (a.r.right + a.r.bottom));
    if (sorted.length) {
      const { el } = sorted[0];
      tryClick(el, 'md-icon-button (rightmost)');
      return;
    }
  }

  // 6. Tenta submeter via form
  const field = findField();
  if (field) {
    const form = field.closest('form');
    if (form) {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      log('✓ Enviado via form.submit event');
      return;
    }

    // 7. Enter direto no campo (funciona em alguns modos do Gemini)
    log('Botão não encontrado. Tentando Enter...');
    field.focus();
    await sleep(100);
    field.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', keyCode: 13, bubbles: true, cancelable: true }));
    await sleep(80);
    field.dispatchEvent(new KeyboardEvent('keyup',   { key: 'Enter', keyCode: 13, bubbles: true }));
    return;
  }

  throw new Error('Botão de envio não encontrado. Use o Diagnóstico para inspecionar a página.');
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

// Retorna TODOS os botões de download encontrados no shadow DOM
function findAllDlBtns() {
  const selectors = [
    '[aria-label="Baixar arquivo de vídeo"]',
    '[aria-label="Download video file"]',
    '[data-aria-label="Baixar arquivo de vídeo"]',
    '[data-aria-label="Download video file"]',
    '[aria-label*="Baixar" i]',
    '[aria-label*="Download" i]',
    'a[download]',
  ];
  const seen = new Set();
  const all  = [];
  for (const sel of selectors) {
    for (const el of shadowQueryAll(sel)) {
      if (!seen.has(el)) { seen.add(el); all.push(el); }
    }
  }
  return all;
}

// Retorna o botão de download mais recente (último na ordem do DOM)
function findDlBtn(skipBtn) {
  const all = findAllDlBtns().filter(el => el !== skipBtn);
  return all[all.length - 1] || null; // último = mais recente
}

async function downloadVideo(n, prevDlBtn) {
  // Busca o botão mais recente, ignorando o do bloco anterior
  const btn = findDlBtn(prevDlBtn);
  if (btn) {
    const inner = btn.shadowRoot?.querySelector('button, a') || btn;
    inner.click();
    log('Download via botão (mais recente) ✓');
    // Auto-confirma o diálogo DLP do Google Workspace se aparecer
    await autoConfirmDlpDialog();
    return true;
  }

  // Fallback: pega o último elemento <video> da página
  const videos = shadowQueryAll('video');
  const v = videos[videos.length - 1];
  if (!v) { log('Sem vídeo e sem botão de download.'); return false; }

  const url = v.src || v.currentSrc;
  if (!url) { log('Vídeo sem URL.'); return false; }

  if (url.startsWith('blob:')) {
    const a = Object.assign(document.createElement('a'), { href: url, download: `video_${String(n).padStart(3,'0')}.mp4` });
    document.body.appendChild(a); a.click(); a.remove();
    log('Download blob ✓'); return true;
  }

  chrome.runtime.sendMessage({ type: 'DOWNLOAD', url, filename: `video_${String(n).padStart(3,'0')}.mp4` });
  return true;
}

// Auto-confirma o diálogo "Baixar o arquivo?" do Google Workspace DLP
// (aparece quando a organização tem política de proteção de dados)
async function autoConfirmDlpDialog() {
  // Textos possíveis do botão de confirmação (PT/EN)
  const confirmTexts = ['sim, baixar', 'yes, download', 'baixar', 'download', 'confirm', 'ok'];

  for (let attempt = 0; attempt < 8; attempt++) {
    await sleep(500);

    // Busca botão de confirmação no shadow DOM inteiro
    const confirmBtn = shadowFind(el => {
      if (el.tagName !== 'BUTTON' && el.tagName !== 'A') return false;
      const text  = (el.textContent  || '').trim().toLowerCase();
      const label = (el.getAttribute('aria-label') || '').toLowerCase();
      return confirmTexts.some(t => text === t || text.startsWith(t) || label === t);
    });

    if (confirmBtn) {
      confirmBtn.click();
      log('✓ Diálogo de download confirmado automaticamente ("' + confirmBtn.textContent.trim() + '")');
      return;
    }
  }
  // Se não encontrou diálogo em 4s, continua normalmente (não havia diálogo)
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
