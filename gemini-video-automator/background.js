// Background service worker

if (chrome.sidePanel) {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

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

  if (msg.type === 'DOWNLOAD') {
    chrome.downloads.download(
      { url: msg.url, filename: msg.filename, saveAs: false },
      (id) => sendResponse({ ok: !chrome.runtime.lastError, id })
    );
    return true;
  }
});

// ─── Funções executadas no MAIN world da página ───────────────────────────────

// Busca recursiva no Shadow DOM — Gemini usa web components que encapsulam o DOM
function queryShadow(selector, root) {
  if (!root) root = document;
  const found = Array.from(root.querySelectorAll(selector));
  const all = root.querySelectorAll ? Array.from(root.querySelectorAll('*')) : [];
  for (const el of all) {
    if (el.shadowRoot) {
      found.push(...queryShadow(selector, el.shadowRoot));
    }
  }
  return found;
}

function fillFieldInPage(text) {
  // Busca no DOM normal E no Shadow DOM
  function queryShadow(selector, root) {
    if (!root) root = document;
    const found = Array.from(root.querySelectorAll(selector));
    const all = Array.from(root.querySelectorAll ? root.querySelectorAll('*') : []);
    for (const el of all) {
      if (el.shadowRoot) found.push(...queryShadow(selector, el.shadowRoot));
    }
    return found;
  }

  const textareas = queryShadow('textarea');
  const ta = textareas.find(t =>
    (t.placeholder || '').toLowerCase().includes('descreva') ||
    (t.placeholder || '').toLowerCase().includes('vídeo') ||
    (t.placeholder || '').toLowerCase().includes('video')
  ) || textareas.at(-1);

  if (!ta) return { ok: false, error: 'textarea not found', total: textareas.length };

  ta.click();
  ta.focus();

  const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
  setter.call(ta, text);

  ta.dispatchEvent(new Event('focus',  { bubbles: true }));
  ta.dispatchEvent(new InputEvent('beforeinput', { bubbles: true, inputType: 'insertText', data: text }));
  ta.dispatchEvent(new Event('input',  { bubbles: true }));
  ta.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }));
  ta.dispatchEvent(new Event('change', { bubbles: true }));

  return { ok: true, length: ta.value.length, placeholder: ta.placeholder };
}

function submitFormInPage() {
  function queryShadow(selector, root) {
    if (!root) root = document;
    const found = Array.from(root.querySelectorAll(selector));
    const all = Array.from(root.querySelectorAll ? root.querySelectorAll('*') : []);
    for (const el of all) {
      if (el.shadowRoot) found.push(...queryShadow(selector, el.shadowRoot));
    }
    return found;
  }

  // 1. Tenta requestSubmit no form (busca incluindo shadow DOM)
  const forms = queryShadow('form');
  for (const form of forms) {
    try { form.requestSubmit(); return { method: 'form.requestSubmit' }; } catch (_) {}
    try { form.submit();        return { method: 'form.submit' }; }       catch (_) {}
  }

  // 2. Busca botões no Shadow DOM completo
  const allBtns = queryShadow('button').filter(b => !b.disabled);

  // 3. Tenta por aria-label (português e inglês)
  const sendLabels = ['send','enviar','submit','gerar','criar','generate','create','confirmar','go','ok'];
  for (const b of allBtns) {
    const lbl = (b.getAttribute('aria-label') || b.textContent || '').toLowerCase();
    if (sendLabels.some(v => lbl.includes(v))) {
      b.click();
      return { method: 'label', label: b.getAttribute('aria-label'), text: b.textContent.trim() };
    }
  }

  // 4. Busca o textarea para referenciar posição
  const textareas = queryShadow('textarea');
  const ta = textareas.find(t => (t.placeholder||'').toLowerCase().includes('descreva')) || textareas.at(-1);

  if (ta) {
    // 5. Botão mais próximo do textarea pela posição visual
    const rect = ta.getBoundingClientRect();
    for (const offset of [60, 80, 40, 100, 120, 160]) {
      const el = document.elementFromPoint(rect.right + offset, rect.top + rect.height / 2);
      const btn = el?.tagName === 'BUTTON' ? el : el?.closest('button');
      if (btn && !btn.disabled) {
        btn.click();
        return { method: 'positional', offset, label: btn.getAttribute('aria-label') };
      }
    }

    // 6. Também tenta dentro do shadowRoot do pai do textarea
    let parent = ta.parentElement || ta.getRootNode();
    for (let i = 0; i < 10; i++) {
      if (!parent) break;
      const btns = Array.from((parent.querySelectorAll || (() => []))('button:not([disabled])'));
      if (btns.length > 0 && btns.length <= 6) {
        const last = btns.at(-1);
        last.click();
        return { method: 'container-last', level: i, label: last.getAttribute('aria-label') };
      }
      parent = parent.parentElement || parent.host; // .host para sair do shadow root
    }
  }

  // 7. Último recurso: último botão habilitado de toda a página
  const last = allBtns.at(-1);
  if (last) { last.click(); return { method: 'last-global', label: last.getAttribute('aria-label') }; }

  return { ok: false, error: 'no submit found', buttonsFound: allBtns.length };
}

function inspectButtonsInPage() {
  function queryShadow(selector, root) {
    if (!root) root = document;
    const found = Array.from(root.querySelectorAll(selector));
    const all = Array.from(root.querySelectorAll ? root.querySelectorAll('*') : []);
    for (const el of all) {
      if (el.shadowRoot) found.push(...queryShadow(selector, el.shadowRoot));
    }
    return found;
  }

  const buttons = queryShadow('button');
  const textareas = queryShadow('textarea');

  return {
    buttons: buttons.slice(0, 20).map(b => ({
      label:    b.getAttribute('aria-label'),
      jsname:   b.getAttribute('jsname'),
      type:     b.type,
      disabled: b.disabled,
      text:     b.textContent.trim().substring(0, 30),
      inShadow: b.getRootNode() !== document
    })),
    textareas: textareas.map(t => ({
      placeholder: t.placeholder,
      inShadow: t.getRootNode() !== document
    }))
  };
}
