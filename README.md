# SwarManthan-Voice Typist Chrome Extension

🎙️ Speak naturally — get AI-polished, tone-aware text anywhere on the web.  
Powered by **Chrome’s Web Speech API** + **ONNX Runtime Web (offline AI rephrasing)**.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [How to Use](#how-to-use)
- [Project Structure](#project-structure)
- [Development](#development)
- [Troubleshooting](#troubleshooting)
- [Privacy](#privacy)
- [License](#license)

---

## 🧭 Overview

**Voice Typist** is a Manifest V3 Chrome extension that enables you to type text anywhere on the web using only your **voice**, and then **rephrase it offline using AI** — all **without depending on any external API or internet connection**.

It uses:
- Chrome’s **Web Speech API** for voice transcription, and  
- **ONNX Runtime Web + Transformers.js** to rephrase text into different tones locally (e.g. Formal, Friendly, Professional).

---

## ✨ Features

| Feature | Description |
|----------|--------------|
| 🎙️ **Voice-to-Text** | Speak naturally and transcribe in real time |
| 🧠 **AI Tone Rephrasing** | Rephrase your text into professional, friendly, or formal tones |
| 📴 **Offline Processing** | ONNX model runs entirely in your browser (no internet required) |
| ⚡ **Smart Insertion** | Automatically inserts transcribed or rephrased text into focused inputs |
| 🔄 **Duplicate Prevention** | Avoids inserting text multiple times |
| 🌐 **Universal Compatibility** | Works across all websites (`<all_urls>`) |
| 🧩 **Manifest V3 Compliant** | Secure, efficient, and future-proof |

---

## 🏗️ Architecture

**Core Components:**

1. **Popup Interface**  
   - `popup.html`, `popup.js`, `rephraser-onnx.js`  
   - Handles speech recognition, rephrasing, and user interactions.

2. **Content Script**  
   - `content.js`  
   - Injected into active web pages to insert text and show notifications.

3. **ONNX Model Execution (Offline AI)**  
   - Uses **Transformers.js** + **ONNX Runtime Web (WASM)**  
   - Loads **FLAN-T5-small** model locally to rephrase text in various tones.

**Flow:**
```
🎤 User Speaks
   ↓
Web Speech API transcribes
   ↓
User selects tone (Formal / Friendly / Professional)
   ↓
ONNX Runtime Web (FLAN-T5-small) rephrases text locally
   ↓
User clicks “Insert”
   ↓
content.js inserts text into webpage input
```

---

## 📦 Prerequisites

- ✅ Google Chrome (v88 or higher for Manifest V3)
- 🎙️ Working microphone
- 💻 Local file access (for unpacked extension)
- No internet required (AI runs locally)

---

## 🚀 Installation

### Step 1: Enable Developer Mode
1. Open Chrome and go to:
   ```
   chrome://extensions/
   ```
2. Toggle **Developer mode** (top right corner).

### Step 2: Load the Extension
1. Click **Load unpacked**
2. Select the folder containing your project:
   ```
   /path/to/Voice_Typist_Extension
   ```
3. Click **Open**

### Step 3: Grant Microphone Permission
When prompted, click **Allow** for microphone access.

---

## 🎯 How to Use

### 🗣️ Voice Typing
1. Click the **Voice Typist icon** in your toolbar.
2. Click **Start Recording** — speak clearly.
3. Watch your transcription appear live in the popup.
4. Click **Stop Recording** when done.

### ✏️ AI Tone Rephrasing
1. After transcription, select one of the tone buttons:
   - **Formal**
   - **Friendly**
   - **Professional**
2. Wait for ONNX model inference (done locally).
3. The rephrased text appears in the popup.

### 💡 Insert Text
1. Click inside any input field, textarea, or editable box on a webpage.
2. Click **Insert Rephrased Text** (or **Insert Text**).
3. Your text is automatically inserted in the active input.

---

## 📁 Project Structure

```
Voice_Typist_Extension/
├── manifest.json                # Chrome Extension configuration
├── popup.html                   # Extension popup UI
├── popup.js                     # Voice + rephrasing logic
├── rephraser-onnx.js            # ONNX inference logic (FLAN-T5-small)
├── content.js                   # Text insertion script
├── popup.css                    # Popup styling
├── content.css                  # In-page notification styles
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── HOW_IT_WORKS.md              # Detailed technical documentation
```

---

## 🛠️ Development

### Run Locally
1. Modify source files as needed.
2. Reload the extension in `chrome://extensions/` by pressing the refresh (🔄) icon.
3. Test your changes on any website.

### Debugging
- **Popup:** Right-click extension icon → “Inspect popup”
- **Content Script:** Open DevTools (F12) → Console
- **Speech Issues:** Check microphone permissions under  
  `chrome://settings/content/microphone`

### Key Commands
| Action | Command |
|--------|----------|
| Start Recording | `popup.js → startRecording()` |
| Stop Recording | `popup.js → stopRecording()` |
| Rephrase Text | `rephraser-onnx.js → rephraseWithONNX()` |
| Insert Text | `chrome.tabs.sendMessage(tabId, {action: "insertText"})` |

---

## 🧩 Troubleshooting

### ❌ Voice Not Working
- Ensure microphone permission is granted.
- Chrome must run over **HTTPS** for mic access.
- Check DevTools → Console for errors.

### ⚠️ Text Not Inserting
- Click **inside** a text field before inserting.
- Some pages may block content scripts (CSP restrictions).
- Reload extension if `content.js` didn’t load.

### 🧠 Model Loading Error
If you see:
```
Error: ONNX model load failed. Check WASM binary or model folder.
```
→ Ensure your model files are in the correct folder:
```
/models/Xenova/flan-t5-small/onnx/
```
and that WASM files are accessible under:
```
/wasm/ort-wasm.wasm
```

---

## 🔐 Privacy

✅ 100% Offline  
- Speech recognition handled by Chrome’s built-in **Web Speech API**  
- Rephrasing handled by **ONNX Runtime Web** locally in browser memory  
- No API keys, cloud models, or data uploads  

---

## 📜 License

This project is available for **personal, educational, and open-source use**.  
Contributions are welcome — open a Pull Request to suggest improvements.

---

## 💬 Author & Credits

Built with ❤️ by **Shivangi Singh , Aastha Rawat and Lipika Dudeja**  
- 🏆 Winners at SIH 2024 (Security & AI solutions) and Hackeroverflow 9.0 by NIT Durgapur
- 🔒 Focused on AI, Cybersecurity, and AI/ML solutions.

---

**Happy Voice Typing — Now with AI! 🎤🤖✨**
