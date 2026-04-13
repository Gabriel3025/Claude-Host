// Background service worker

// Abre Side Panel ao clicar no ícone
if (chrome.sidePanel) {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

  // ── Preenche o campo no contexto da página (MAIN world = acessa Angular/React) ──
  if (msg.type === 'FILL_FIELD') {
    chrome.scripting.executeScript({
      target: { tabId: sender.tab.id },
      world: 'MAIN',
      func: fillFieldInPage,
      args: [msg.text]
    }, (results) => {
      const err = chrome.runtime.lastError;
      sendResponse({ ok: !err, result: results?.[0]?.result, error: err?.message });
    });
    return true;
  }

  // ── Envia o formulário no contexto da página ──
  if (msg.type === 'SUBMIT_FORM') {
    chrome.scripting.executeScript({
      target: { tabId: sender.tab.id },
      world: 'MAIN',
      func: submitFormInPage
    }, (results) => {
      const err = chrome.runtime.lastError;
      sendResponse({ ok: !err, result: results?.[0]?.result, error: err?.message });
    });
    return true;
  }

  // ── Inspeciona botões da página ──
  if (msg.type === 'INSPECT_BUTTONS') {
    chrome.scripting.executeScript({
      target: { tabId: sender.tab.id },
      world: 'MAIN',
      func: inspectButtonsInPage
    }, (results) => {
      sendResponse({ ok: true, result: results?.[0]?.result });
    });
    return true;
  }

  // ── Download ──
  if (msg.type === 'DOWNLOAD') {
    chrome.downloads.download(
      { url: msg.url, filename: msg.filename, saveAs: false },
      (id) => sendResponse({ ok: !chrome.runtime.lastError, id })
    );
    return true;
  }
});

// ─── Funções que rodam na página (MAIN world) ─────────────────────────────────

function fillFieldInPage(text) {
  const ta = document.querySelector('textarea[placeholder*="Descreva"]') ||
             document.querySelector('textarea[placeholder*="vídeo"]') ||
             document.querySelector('textarea[placeholder*="video"]') ||
             [...document.querySelectorAll('textarea')].at(-1);

  if (!ta) return { ok: false, error: 'textarea not found' };

  // Foca e limpa
  ta.click();
  ta.focus();

  // Seta o valor usando o setter nativo (compatível com React e Angular)
  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
  setter.call(ta, text);

  // Dispara eventos que Angular e React escutam
  ta.dispatchEvent(new Event('focus',  { bubbles: true }));
  ta.dispatchEvent(new InputEvent('beforeinput', { bubbles: true, inputType: 'insertText', data: text }));
  ta.dispatchEvent(new Event('input',  { bubbles: true }));
  ta.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }));
  ta.dispatchEvent(new Event('change', { bubbles: true }));

  return { ok: true, length: ta.value.length };
}

function submitFormInPage() {
  const ta = document.querySelector('textarea[placeholder*="Descreva"]') ||
             document.querySelector('textarea[placeholder*="vídeo"]') ||
             document.querySelector('textarea[placeholder*="video"]') ||
             [...document.querySelectorAll('textarea')].at(-1);

  // Tenta requestSubmit no form
  const form = ta?.closest('form');
  if (form) {
    try { form.requestSubmit(); return { method: 'form.requestSubmit' }; } catch (_) {}
    try { form.submit();        return { method: 'form.submit' }; }       catch (_) {}
  }

  // Todos os botões habilitados da página com seus atributos
  const btns = [...document.querySelectorAll('button:not([disabled])')];

  // Tenta por aria-label
  const labelVariants = ['send','enviar','submit','gerar','criar','generate','create','confirm'];
  for (const b of btns) {
    const lbl = (b.getAttribute('aria-label') || b.textContent || '').toLowerCase();
    if (labelVariants.some(v => lbl.includes(v))) {
      b.click();
      return { method: 'button-label', label: b.getAttribute('aria-label') };
    }
  }

  // Tenta o botão mais próximo do textarea (à direita)
  if (ta) {
    const rect = ta.getBoundingClientRect();
    for (const offset of [60, 80, 100, 40, 120]) {
      const el = document.elementFromPoint(rect.right + offset, rect.top + rect.height / 2);
      const btn = el?.tagName === 'BUTTON' ? el : el?.closest('button');
      if (btn && !btn.disabled) {
        btn.click();
        return { method: 'positional', label: btn.getAttribute('aria-label'), offset };
      }
    }
  }

  // Último recurso: último botão habilitado da página
  const last = btns.at(-1);
  if (last) { last.click(); return { method: 'last-button', label: last.getAttribute('aria-label') }; }

  return { ok: false, error: 'no submit method found' };
}

function inspectButtonsInPage() {
  return [...document.querySelectorAll('button')].map(b => ({
    label:   b.getAttribute('aria-label'),
    jsname:  b.getAttribute('jsname'),
    type:    b.type,
    disabled: b.disabled,
    text:    b.textContent.trim().substring(0, 25),
    class:   b.className.substring(0, 50)
  }));
}
