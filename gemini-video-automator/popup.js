// popup.js — controls the extension UI and communicates with content.js

const scriptInput     = document.getElementById('scriptInput');
const blockCount      = document.getElementById('blockCount');
const separatorSelect = document.getElementById('separatorSelect');
const delayInput      = document.getElementById('delayInput');
const btnStart        = document.getElementById('btnStart');
const btnPause        = document.getElementById('btnPause');
const btnStop         = document.getElementById('btnStop');
const btnClearLog     = document.getElementById('btnClearLog');
const statusText      = document.getElementById('statusText');
const progressText    = document.getElementById('progressText');
const progressFill    = document.getElementById('progressFill');
const progressLabel   = document.getElementById('progressLabel');
const progressContainer = document.getElementById('progressContainer');
const logEl           = document.getElementById('log');
const dot             = document.querySelector('.dot');

let currentState = 'idle'; // idle | running | paused

// ─── Separator ───────────────────────────────────────────────────────────────

function getSeparator() {
  const val = separatorSelect.value;
  if (val === '\\n\\n') return '\n\n';
  if (val === '\\n')    return '\n';
  return val; // --- or ###
}

function parseBlocks(text) {
  const sep = getSeparator();
  return text
    .split(sep)
    .map(b => b.trim())
    .filter(b => b.length > 0);
}

// ─── Block count update ───────────────────────────────────────────────────────

scriptInput.addEventListener('input', updateBlockCount);
separatorSelect.addEventListener('change', updateBlockCount);

function updateBlockCount() {
  const blocks = parseBlocks(scriptInput.value);
  blockCount.textContent = `${blocks.length} bloco${blocks.length !== 1 ? 's' : ''} detectado${blocks.length !== 1 ? 's' : ''}`;
}

// ─── Controls ─────────────────────────────────────────────────────────────────

btnStart.addEventListener('click', async () => {
  const text = scriptInput.value.trim();
  if (!text) { addLog('Cole o roteiro antes de iniciar.', 'error'); return; }

  const blocks = parseBlocks(text);
  if (blocks.length === 0) { addLog('Nenhum bloco encontrado.', 'error'); return; }

  const tab = await getActiveTab();
  if (!tab) { addLog('Nenhuma aba ativa encontrada.', 'error'); return; }

  // Warn but don't block — tab.url may be undefined without "tabs" permission in older installs
  if (tab.url && !tab.url.includes('business.gemini.google.com')) {
    addLog('Aviso: aba ativa não parece ser o Gemini Enterprise.', 'info');
  }

  const settings = {
    delayBetween: (parseInt(delayInput.value) || 3) * 1000
  };

  addLog(`Iniciando: ${blocks.length} blocos`, 'info');
  setUIState('running');
  showProgress(0, blocks.length);

  chrome.tabs.sendMessage(tab.id, { type: 'START', blocks, settings }, (res) => {
    if (chrome.runtime.lastError) {
      addLog('Erro ao conectar: ' + chrome.runtime.lastError.message, 'error');
      setUIState('idle');
    }
  });
});

btnPause.addEventListener('click', async () => {
  const tab = await getActiveTab();
  if (!tab) return;
  chrome.tabs.sendMessage(tab.id, { type: 'PAUSE' });
  setUIState('paused');
  addLog('Pausado.', 'info');
});

btnStop.addEventListener('click', async () => {
  const tab = await getActiveTab();
  if (!tab) return;
  chrome.tabs.sendMessage(tab.id, { type: 'STOP' });
  setUIState('idle');
  addLog('Parado.', 'error');
});

btnClearLog.addEventListener('click', () => { logEl.innerHTML = ''; });

// ─── Messages from content.js ─────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message) => {
  switch (message.type) {
    case 'PROGRESS':
      updateProgress(message.current, message.total);
      addLog(`Bloco ${message.current}/${message.total}: ${message.preview}`, 'info');
      break;

    case 'BLOCK_DONE':
      addLog(`✓ Bloco ${message.current} concluído!`, 'success');
      break;

    case 'COMPLETE':
      addLog(`✓ Todos os ${message.total} vídeos gerados!`, 'success');
      setUIState('idle');
      updateProgress(message.total, message.total);
      statusText.textContent = 'Concluído!';
      break;

    case 'ERROR':
      addLog(`✗ Erro no bloco ${message.current}: ${message.message}`, 'error');
      setUIState('idle');
      statusText.textContent = 'Erro — verifique o log';
      break;

    case 'LOG':
      addLog(message.message);
      break;
  }
});

// ─── UI helpers ───────────────────────────────────────────────────────────────

function setUIState(state) {
  currentState = state;

  dot.className = 'dot';
  if (state === 'running') dot.classList.add(''); // green (default)
  if (state === 'paused')  dot.classList.add('paused');
  if (state === 'idle')    dot.classList.add('stopped');

  btnStart.disabled = state === 'running';
  btnPause.disabled = state !== 'running';
  btnStop.disabled  = state === 'idle';

  if (state === 'running') statusText.textContent = 'Gerando vídeos...';
  if (state === 'paused')  statusText.textContent = 'Pausado';
  if (state === 'idle')    statusText.textContent = 'Pronto';

  progressContainer.style.display = state !== 'idle' ? 'block' : 'none';
}

function showProgress(current, total) {
  progressContainer.style.display = 'block';
  updateProgress(current, total);
}

function updateProgress(current, total) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  progressFill.style.width = pct + '%';
  progressLabel.textContent = `${current} / ${total}`;
  progressText.textContent = total > 0 ? `${current}/${total}` : '';
}

function addLog(msg, type = '') {
  const line = document.createElement('div');
  line.className = 'log-entry' + (type ? ` ${type}` : '');
  const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  line.textContent = `[${time}] ${msg}`;
  logEl.appendChild(line);
  logEl.scrollTop = logEl.scrollHeight;
}

async function getActiveTab() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      resolve(tabs[0] || null);
    });
  });
}

// Initialize
updateBlockCount();
setUIState('idle');
