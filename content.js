(() => {
  // Voice Typist Content Script (Final Single-Insert Version)
  // Handles text and rephrased text insertion in the active editable field

  if (window.top !== window.self) {
    console.log("⏩ Skipping Voice Typist in iframe");
    return;
  }

  if (window.__voiceTypistLoaded) {
    console.log("⏩ Voice Typist already active, skipping reload");
    return;
  }
  window.__voiceTypistLoaded = true;

  console.log("✅ Voice Typist: Content script loaded in main frame");

  let lastInsertedText = "";
  let lastInsertTime = 0;

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    try {
      // ✅ Ping check
      if (request.ping) {
        sendResponse({ pong: true });
        return true;
      }

      // ✅ Prevent duplicate insertions
      const now = Date.now();
      if (
        (request.action === "insertText" || request.action === "insertRephrasedText") &&
        request.text === lastInsertedText &&
        now - lastInsertTime < 1000
      ) {
        console.warn("⏩ Skipped duplicate insertion");
        sendResponse({ success: true, skipped: true });
        return true;
      }

      if (request.action === "insertText" || request.action === "insertRephrasedText") {
        const success = smartInsert(request.text, request.action === "insertRephrasedText");
        lastInsertedText = request.text;
        lastInsertTime = now;
        sendResponse({ success });
      }
    } catch (error) {
      console.error("Voice Typist: Error handling message:", error);
      sendResponse({ success: false, error: error.message });
    }
    return true;
  });

  // Core insert logic
  function smartInsert(text, isRephrased = false) {
    if (!text || !text.trim()) {
      showNotification("⚠️ No text to insert.");
      return false;
    }

    let element = document.activeElement;
    if (!element || !isInputElement(element)) {
      const candidates = document.querySelectorAll(
        'textarea, input[type="text"], input[type="search"], input[type="email"], input[type="password"], [contenteditable="true"]'
      );
      element = Array.from(candidates).find(isElementVisible);
      if (element) {
        element.focus();
      } else {
        showNotification("⚠️ No editable field found on this page.");
        return false;
      }
    }

    insertTextIntoElement(element, text);
    showNotification(isRephrased ? "✨ Rephrased text inserted!" : "✅ Text inserted!");
    return true;
  }

  function isInputElement(el) {
    if (!el) return false;
    const tag = el.tagName?.toLowerCase();
    return tag === "input" || tag === "textarea" || el.hasAttribute("contenteditable");
  }

  function insertTextIntoElement(el, text) {
    const tag = el.tagName?.toLowerCase();
    if (tag === "input" || tag === "textarea") {
      const start = el.selectionStart || 0;
      const end = el.selectionEnd || 0;
      el.value = (el.value || "").substring(0, start) + text + (el.value || "").substring(end);
      const newCursor = start + text.length;
      el.setSelectionRange(newCursor, newCursor);
      triggerInputEvent(el);
    } else if (el.hasAttribute("contenteditable")) {
      const selection = window.getSelection();
      const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
      if (range) {
        range.deleteContents();
        const node = document.createTextNode(text);
        range.insertNode(node);
        range.setStartAfter(node);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        el.textContent = (el.textContent || "") + text;
      }
      triggerInputEvent(el);
    }
  }

  function triggerInputEvent(el) {
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function isElementVisible(el) {
    if (!el) return false;
    const style = window.getComputedStyle(el);
    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      el.offsetWidth > 0 &&
      el.offsetHeight > 0
    );
  }

  function showNotification(msg, duration = 2000) {
    const existing = document.getElementById("voice-typist-notification");
    if (existing) existing.remove();

    const note = document.createElement("div");
    note.id = "voice-typist-notification";
    note.textContent = msg;
    note.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #333;
      color: #fff;
      padding: 10px 16px;
      border-radius: 6px;
      font-size: 14px;
      z-index: 2147483647;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      transition: opacity 0.3s ease;
    `;
    document.body.appendChild(note);
    setTimeout(() => {
      note.style.opacity = "0";
      setTimeout(() => note.remove(), 300);
    }, duration);
  }
})();
