// popup.js

const scriptInput      = document.getElementById('scriptInput');
const blockCount       = document.getElementById('blockCount');
const separatorSelect  = document.getElementById('separatorSelect');
const delayInput       = document.getElementById('delayInput');
const btnStart         = document.getElementById('btnStart');
const btnPause         = document.getElementById('btnPause');
const btnStop          = document.getElementById('btnStop');
const btnClearLog      = document.getElementById('btnClearLog');
const btnDiagnose      = document.getElementById('btnDiagnose');
const statusText       = document.getElementById('statusText');
const progressText     = document.getElementById('progressText');
const progressFill     = document.getElementById('progressFill');
const progressLabel    = document.getElementById('progressLabel');
const progressContainer = document.getElementById('progressContainer');
const blockListEl      = document.getElementById('blockList');
const blockListSection = document.getElementById('blockListSection');
const logEl            = document.getElementById('log');
const dot              = document.getElementById('dot');
const toggleIcon       = document.getElementById('toggleIcon');
const inputBody        = document.getElementById('inputBody');

// ─── Block tracking ───────────────────────────────────────────────────────────
// Each: { text, status: 'pending'|'running'|'done'|'error', downloaded: false, msg: '' }
let blocks = [];

// ─── Collapsible input section ────────────────────────────────────────────────
document.getElementById('toggleInput').addEventListener('click', () => {
  const collapsed = inputBody.style.display === 'none';
  inputBody.style.display = collapsed ? '' : 'none';
  toggleIcon.classList.toggle('collapsed', !collapsed);
});

// ─── Separator & block count ──────────────────────────────────────────────────
function getSeparator() {
  const val = separatorSelect.value;
  if (val === '\\n\\n') return '\n\n';
  if (val === '\\n')    return '\n';
  return val;
}

function parseBlocks(text) {
  const sep = getSeparator();
  return text.split(sep).map(b => b.trim()).filter(b => b.length > 0);
}

scriptInput.addEventListener('input', updateBlockCount);
separatorSelect.addEventListener('change', updateBlockCount);

function updateBlockCount() {
  const b = parseBlocks(scriptInput.value);
  blockCount.textContent = `${b.length} bloco${b.length !== 1 ? 's' : ''} detectado${b.length !== 1 ? 's' : ''}`;
}

// ─── Controls ─────────────────────────────────────────────────────────────────
btnStart.addEventListener('click', async () => {
  const text = scriptInput.value.trim();
  if (!text) { addLog('Cole o roteiro antes de iniciar.', 'error'); return; }

  const parsed = parseBlocks(text);
  if (parsed.length === 0) { addLog('Nenhum bloco encontrado.', 'error'); return; }

  const tab = await getActiveTab();
  if (!tab) { addLog('Nenhuma aba ativa encontrada.', 'error'); return; }

  // Init block list
  blocks = parsed.map(t => ({ text: t, status: 'pending', downloaded: false, msg: 'Aguardando...' }));
  renderBlockList();

  const settings = { delayBetween: (parseInt(delayInput.value) || 5) * 1000 };

  addLog(`Iniciando: ${blocks.length} blocos`, 'info');
  setUIState('running');
  showProgress(0, blocks.length);

  // Collapse input to give more space for the list
  inputBody.style.display = 'none';
  toggleIcon.classList.add('collapsed');

  sendToTab(tab.id, { type: 'START', blocks: parsed, settings });
});

btnPause.addEventListener('click', async () => {
  const tab = await getActiveTab();
  if (!tab) return;
  chrome.tabs.sendMessage(tab.id, { type: 'PAUSE' }, () => {});
  setUIState('paused');
  addLog('Pausado.', 'info');
});

btnStop.addEventListener('click', async () => {
  const tab = await getActiveTab();
  if (!tab) return;
  chrome.tabs.sendMessage(tab.id, { type: 'STOP' }, () => {});
  setUIState('idle');
  addLog('Parado pelo usuário.', 'error');
  blocks.forEach(b => { if (b.status === 'running' || b.status === 'pending') { b.status = 'error'; b.msg = 'Parado'; } });
  renderBlockList();
});

btnClearLog.addEventListener('click', () => { logEl.innerHTML = ''; });

btnDiagnose.addEventListener('click', async () => {
  const tab = await getActiveTab();
  if (!tab) { addLog('Nenhuma aba ativa.', 'error'); return; }
  addLog('Conectando...', 'info');
  sendToTabWithResponse(tab.id, { type: 'DIAGNOSE' }, (res) => {
    if (!res) { addLog('Falha ao conectar. Recarregue a aba do Gemini (F5).', 'error'); return; }
    addLog('── Diagnóstico ──', 'info');
    addLog('── Diagnóstico ──', 'info');
    addLog(`Campo: ${res.fieldFound ? `✓ <${res.fieldTag}>` : '✗ não encontrado'}`, res.fieldFound ? 'success' : 'error');
    addLog(`Vídeos: ${res.videosCount} | Download: ${res.downloadBtn ? '✓' : '✗'}`, 'info');
    const right = res.rightElements || [];
    addLog(`Elementos à direita do campo: ${right.length}`, right.length > 0 ? 'success' : 'error');
    right.forEach(e => addLog(`  x=${e.x} <${e.tag}> label="${e.label}" jsname="${e.jsname}" cls="${e.cls.substring(0,30)}"`, 'info'));
  });
});

// ─── Messages from content.js ─────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message) => {
  switch (message.type) {

    case 'PROGRESS': {
      // Mark previous block done if needed, mark current as running
      if (message.current > 1) {
        // previous already handled by BLOCK_DONE
      }
      setBlockStatus(message.current - 1, 'running', 'Gerando vídeo...');
      updateProgress(message.current - 1, message.total);
      addLog(`Bloco ${message.current}/${message.total}: ${message.preview}`, 'info');
      break;
    }

    case 'BLOCK_DONE':
      setBlockStatus(message.current - 1, 'done', message.downloaded ? '✓ Concluído e baixado' : '✓ Concluído (baixe manualmente)');
      blocks[message.current - 1].downloaded = message.downloaded;
      updateProgress(message.current, message.total);
      addLog(`✓ Bloco ${message.current} concluído!`, 'success');
      break;

    case 'COMPLETE':
      addLog(`✓ Todos os ${message.total} vídeos gerados!`, 'success');
      setUIState('done');
      updateProgress(message.total, message.total);
      statusText.textContent = 'Concluído!';
      break;

    case 'ERROR':
      setBlockStatus(message.current - 1, 'error', `Erro: ${message.message}`);
      addLog(`✗ Bloco ${message.current}: ${message.message}`, 'error');
      setUIState('idle');
      statusText.textContent = 'Erro — verifique o log';
      break;

    case 'LOG':
      addLog(message.message);
      break;
  }
});

// ─── Block list rendering ─────────────────────────────────────────────────────
function renderBlockList() {
  blockListSection.style.display = '';
  blockListEl.innerHTML = '';
  blocks.forEach((b, i) => {
    const item = document.createElement('div');
    item.id = `block-item-${i}`;
    item.className = `block-item ${b.status}`;

    const icon = b.status === 'running'  ? '<span class="spinner">⟳</span>'
               : b.status === 'done'     ? '✓'
               : b.status === 'error'    ? '✗'
               : '○';

    item.innerHTML = `
      <div class="block-num">${i + 1}</div>
      <div class="block-content">
        <div class="block-preview">${escHtml(b.text.substring(0, 55))}${b.text.length > 55 ? '…' : ''}</div>
        <div class="block-status">${b.msg}</div>
      </div>
      <div class="block-icon">${icon}</div>`;

    blockListEl.appendChild(item);
  });
}

function setBlockStatus(index, status, msg) {
  if (!blocks[index]) return;
  blocks[index].status = status;
  blocks[index].msg    = msg;

  const item = document.getElementById(`block-item-${index}`);
  if (!item) return;

  item.className = `block-item ${status}`;
  item.querySelector('.block-status').textContent = msg;
  const icon = status === 'running' ? '<span class="spinner">⟳</span>'
             : status === 'done'    ? '✓'
             : status === 'error'   ? '✗'
             : '○';
  item.querySelector('.block-icon').innerHTML = icon;

  // Auto-scroll to current block
  item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ─── UI state ─────────────────────────────────────────────────────────────────
function setUIState(state) {
  dot.className = 'dot';
  if (state === 'running') dot.classList.add('running');
  else if (state === 'paused') dot.classList.add('paused');
  else if (state === 'done')   dot.classList.add('done');
  else                         dot.classList.add('error');

  btnStart.disabled = state === 'running';
  btnPause.disabled = state !== 'running';
  btnStop.disabled  = state === 'idle' || state === 'done';

  if (state === 'running') statusText.textContent = 'Gerando vídeos...';
  if (state === 'paused')  statusText.textContent = 'Pausado';
  if (state === 'idle')    statusText.textContent = 'Pronto';
  if (state === 'done')    statusText.textContent = 'Concluído!';

  progressContainer.style.display = (state !== 'idle') ? 'block' : 'none';
}

function showProgress(current, total) {
  progressContainer.style.display = 'block';
  updateProgress(current, total);
}

function updateProgress(current, total) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  progressFill.style.width = pct + '%';
  progressLabel.textContent = `${current} / ${total}`;
  progressText.textContent  = total > 0 ? `${current}/${total}` : '';
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
  return new Promise(resolve => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => resolve(tabs[0] || null));
  });
}

// Envia para tab com auto-inject; chama callback com response ou null em caso de erro
function sendToTabWithResponse(tabId, message, callback) {
  chrome.tabs.sendMessage(tabId, message, (res) => {
    if (!chrome.runtime.lastError) { callback(res); return; }

    addLog('Injetando script automaticamente...', 'info');
    chrome.scripting.executeScript({ target: { tabId }, files: ['content.js'] }, () => {
      if (chrome.runtime.lastError) {
        addLog('Falha ao injetar: ' + chrome.runtime.lastError.message, 'error');
        callback(null); return;
      }
      setTimeout(() => {
        chrome.tabs.sendMessage(tabId, message, (res2) => {
          if (chrome.runtime.lastError) { addLog('Erro: ' + chrome.runtime.lastError.message, 'error'); callback(null); }
          else callback(res2);
        });
      }, 600);
    });
  });
}

// Versão sem callback (para START)
function sendToTab(tabId, message) {
  sendToTabWithResponse(tabId, message, (res) => {
    if (!res) { addLog('Não foi possível conectar. Recarregue a aba do Gemini (F5) e tente novamente.', 'error'); setUIState('idle'); }
  });
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// Init
updateBlockCount();
setUIState('idle');
