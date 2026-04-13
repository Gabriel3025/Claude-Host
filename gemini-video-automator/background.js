if (chrome.sidePanel) {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'DOWNLOAD') {
    chrome.downloads.download(
      { url: msg.url, filename: msg.filename, saveAs: false },
      (id) => sendResponse({ ok: !chrome.runtime.lastError, id })
    );
    return true;
  }
});
