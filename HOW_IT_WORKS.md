# ⚙️ How SwarManthan Works — Technical Overview 

## 🏗️ Architecture Overview

The **Voice Typist Chrome Extension** combines **real-time speech recognition** with **offline AI-powered tone rephrasing** using ONNX models.  
It operates through a **three-component architecture**:

1. 🧠 **Popup Interface** (`popup.html`, `popup.js`, `rephraser-onnx.js`)
2. 🌐 **Content Script** (`content.js`)
3. ⚙️ **Manifest Configuration** (`manifest.json`)

---

## 📋 Component Breakdown

### 1. **Popup Interface (User Interaction + AI Processing)**

**Files**
- `popup.html` — Popup UI structure  
- `popup.css` — Styling  
- `popup.js` — Speech recognition, ONNX model integration, and tab communication  
- `rephraser-onnx.js` — Local ONNX transformer model logic  

**Responsibilities**
- Captures speech via Chrome’s **Web Speech API**
- Displays **live transcription** of spoken text
- Rephrases text locally using **ONNX Runtime Web + Transformers.js**
- Sends original or rephrased text to `content.js` for insertion

**Key Technologies**
- 🗣️ **Web Speech API** (`webkitSpeechRecognition`)
- 🎙️ **getUserMedia** for microphone access  
- 🧩 **ONNX Runtime Web (ort-wasm.wasm)** for AI inference  
- 🤖 **Transformers.js** (FLAN-T5-small model)  
- 🔄 **Chrome Scripting API** for dynamic content injection  

---

### 2. **Content Script (Webpage Interaction)**

**Files**
- `content.js` — Text insertion logic and notification display  

**Responsibilities**
- Receives messages from `popup.js`
- Inserts text into editable elements (`input`, `textarea`, `contenteditable`)
- Ensures **no duplicate insertions** via deduplication logic
- Displays visual notifications for success/error
- Responds to `ping` requests from popup.js (verifies if already loaded)

**Key Features**
- Smart detection of focused or visible input elements  
- Cursor-aware text insertion  
- Dispatches `input` and `change` events for web app compatibility  
- Single-injection system — only one listener per page  

---

### 3. **Manifest Configuration**

**File:** `manifest.json`

**Highlights**
- **Manifest V3 compliant**
- **Permissions**
  - `activeTab`
  - `scripting`
  - `<all_urls>`
  - `microphone`
- Defines:
  - Popup UI  
  - Content script injection  
  - ONNX/WASM model access via `web_accessible_resources`

---

## 🔄 Step-by-Step Workflow

### **Step 1: Open Extension**
```
User clicks the Voice Typist icon → Popup loads (popup.html + popup.js)
```

---

### **Step 2: Start Recording**
```
User clicks “Start Recording”
 ↓
popup.js initializes getUserMedia and SpeechRecognition
 ↓
Chrome Web Speech API starts transcribing
 ↓
Transcription shown in popup (live updates)
```

---

### **Step 3: Stop Recording**
```
User clicks “Stop Recording”
 ↓
SpeechRecognition stops
 ↓
Final text saved to transcript variable
 ↓
Ready for rephrasing or direct insertion
```

---

### **Step 4: AI-Based Tone Rephrasing (Offline)**
```
User selects tone (Formal / Friendly / Professional)
 ↓
popup.js → rephraseWithONNX(originalTranscript, tone)
 ↓
rephraser-onnx.js loads ONNX Runtime Web (ort-wasm.wasm)
 ↓
Loads FLAN-T5-Small transformer model locally
 ↓
Generates rephrased version of text
 ↓
Displays rephrased text in popup
```

🧠 **All AI inference happens locally (in-browser)**  
No internet, no APIs, and no external servers are involved.

---

### **Step 5: Insert Text into a Webpage**
```
User clicks “Insert Text” or “Insert Rephrased Text”
 ↓
popup.js checks if content.js is active via ping
 ↓
If not found → injects it once (MV3-safe)
 ↓
Sends message to content.js with text payload
 ↓
content.js identifies target input field
 ↓
Inserts text at cursor position
 ↓
Triggers 'input' and 'change' events
 ↓
Shows success notification on page
```

---

## 🧠 Rephrasing Pipeline (rephraser-onnx.js)

### Internal Process
1. Loads ONNX runtime binary (`wasm/ort-wasm.wasm`)
2. Initializes `Transformers.js` with ONNX backend
3. Loads **FLAN-T5-small** model locally
4. Creates a custom prompt:
   ```js
   const prompt = `Rephrase the following text in a ${tone} tone.
   Preserve the meaning but adjust the style:\n\n"${text}"`;
   ```
5. Performs inference via `pipeline("text2text-generation")`
6. Returns the rephrased output to `popup.js`

**Example:**

| Tone | Input | Output |
|------|--------|---------|
| Formal | "Hey, can you send me that file?" | "Could you please share that document with me?" |
| Friendly | "I am unable to attend today." | "Sorry, I can’t make it today!" |
| Professional | "Let's do this later." | "We can revisit this task at a later time." |

---

## 🎨 UI & Interaction States

| State | Description |
|-------|--------------|
| 🎤 Listening | Speech recognition active |
| ✏️ Rephrased | AI output generated |
| ✅ Inserted | Text successfully inserted |
| ⚠️ Error | Microphone or model issue detected |

---

## 🔐 Privacy & Security

### ✅ 100% Offline
- Speech-to-text handled by Chrome’s built-in Web Speech API  
- Tone rephrasing processed locally via ONNX WASM  
- No external APIs, keys, or internet requests  

### **Permissions Overview**

| Permission | Purpose |
|-------------|----------|
| `activeTab` | Communicate with current webpage |
| `scripting` | Inject content script dynamically |
| `microphone` | Capture voice input |
| `<all_urls>` | Enable insertion on any website |

---

## 🌉 Communication Flow Diagram

```
 ┌──────────────┐
 │   User       │
 │  (Speaks)    │
 └─────┬────────┘
       │
       ▼
 ┌────────────────┐
 │ Web Speech API │
 │ (Chrome Engine)│
 └─────┬──────────┘
       │
       ▼
 ┌──────────────────────────────┐
 │ popup.js + rephraser-onnx.js │
 │ (Processes + Rephrases Text) │
 └─────┬────────────────────────┘
       │
       │ User clicks “Insert”
       ▼
 ┌───────────────────────┐
 │ chrome.scripting API  │
 │ (Injects content.js)  │
 └─────┬────────────────┘
       │
       ▼
 ┌────────────────┐     ┌──────────────────────┐
 │  content.js     │────▶│  Active Webpage Input│
 │ (Insert Handler)│     │  Field/Textarea      │
 └────────────────┘     └──────────────────────┘
```

---

## 🚀 Updated Key Features

| Feature | Description |
|----------|--------------|
| 🎙️ Real-time Speech-to-Text | Chrome’s built-in speech recognition |
| 🧠 AI Tone Rephrasing | Local ONNX inference (FLAN-T5-small) |
| 📴 Works Offline | No external API or internet connection |
| ✏️ Smart Text Insertion | Auto-detects active input field |
| ♻️ Duplicate Prevention | Prevents repeated insertions |
| 🔄 Tone Options | Formal, Friendly, Professional |
| 🧩 Dynamic Injection | Injects `content.js` only once |
| ⚡ MV3 Compliant | Uses Chrome Scripting API |

---

## 🔧 Technology Stack

| Layer | Technologies Used |
|--------|------------------|
| Speech Recognition | Web Speech API, getUserMedia |
| AI Model Inference | ONNX Runtime Web (WASM), Transformers.js |
| Communication | Chrome Runtime Messaging API |
| UI Layer | HTML5, CSS3, Vanilla JS |
| Environment | Chrome Extension (Manifest V3) |

---

## 🌟 Future Enhancements

1. 🌍 Multi-language support  
2. 🧠 Larger models (Flan-T5-Base for improved fluency)  
3. 💬 Custom tone presets  
4. ⚙️ Settings page for personalization  
5. 📜 Transcription history export  
6. 🎧 Offline keyword commands (“Insert”, “Clear”, etc.)  

---

## 🧾 Summary

> **Voice Typist** is an AI-enhanced Chrome extension that transforms voice into well-written text.  
> It performs **real-time transcription**, **tone-aware rephrasing**, and **intelligent insertion** —  
> all **offline**, using **ONNX Runtime Web** and **Transformers.js** for secure, low-latency processing.

---

**Privacy First · 100% Offline · AI-Powered Writing Assistant**
