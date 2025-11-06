# Voice Typist Chrome Extension

A Chrome extension that allows you to type anywhere on the web using only your voice with tone rephrasing capabilities.

## 📋 Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [How to Use](#how-to-use)
- [Project Structure](#project-structure)
- [Development](#development)
- [Troubleshooting](#troubleshooting)

## ✨ Features

- **Voice-to-Text**: Type on any website using your voice
- **Tone Rephrasing**: Rephrase text with different tones
- **Universal Compatibility**: Works on all websites (`<all_urls>`)
- **Modern Manifest V3**: Built using the latest Chrome extension standards

## 📦 Prerequisites

- Google Chrome browser (version 88 or higher recommended for Manifest V3 support)
- A working microphone for voice input
- Basic knowledge of Chrome extension installation (developer mode)

## 🚀 Installation

### Step 1: Enable Developer Mode in Chrome

1. Open Google Chrome
2. Navigate to `chrome://extensions/`
   - You can also access this via: **Menu (⋮) → Extensions → Manage Extensions**
3. Toggle **"Developer mode"** ON (located in the top-right corner)

### Step 2: Load the Extension

1. Click **"Load unpacked"** button (visible after enabling Developer mode)
2. Navigate to and select the `Chrome_Extension` folder:
   ```
   /Users/shivangisingh/Desktop/Chrome_Extension
   ```
3. Click **"Select"** or **"Open"**

### Step 3: Grant Permissions

When you first load the extension:
- Chrome may prompt you to grant microphone permissions
- Click **"Allow"** when prompted
- The extension will appear in your Extensions toolbar

## 🎯 How to Use

### Basic Voice Typing

1. **Open the Extension Popup**
   - Click the Voice Typist icon in your Chrome toolbar
   - The popup interface will open

2. **Start Voice Input**
   - Click the microphone button or activate voice input
   - Speak clearly into your microphone
   - Your speech will be converted to text

3. **Insert Text on Web Pages**
   - Click on any text input field on a webpage
   - The extension will automatically insert the transcribed text
   - Works in text boxes, forms, search bars, and content-editable areas

### Tone Rephrasing

1. Select text on a webpage (if applicable)
2. Use the extension's tone options to rephrase:
   - Professional
   - Casual
   - Formal
   - Friendly
   - And more...

## 📁 Project Structure

```
Chrome_Extension/
├── manifest.json          # Extension configuration and permissions
├── popup.html            # Extension popup interface (referenced)
├── content.js            # Content script for web page interaction (referenced)
├── content.css           # Styles for content script (referenced)
├── icon16.png           # 16x16 extension icon (referenced)
├── icon48.png           # 48x48 extension icon (referenced)
├── icon128.png          # 128x128 extension icon (referenced)
└── README.md            # This file
```

### Current Status

**Note**: The following files are referenced in `manifest.json` but need to be created:
- `popup.html` - Extension popup UI
- `content.js` - Main functionality script
- `content.css` - Styling for injected elements
- Icon files (icon16.png, icon48.png, icon128.png)

## 🛠️ Development

### Making Changes

1. **Edit Files**: Make changes to any extension files
2. **Reload Extension**: Go to `chrome://extensions/`
3. Click the **refresh icon** (🔄) on the Voice Typist card to reload changes

### Testing

1. Test on different websites to ensure compatibility
2. Check browser console for errors:
   - Right-click extension icon → **"Inspect popup"** (for popup errors)
   - Press `F12` on any webpage → **Console tab** (for content script errors)
3. Test voice input in various scenarios:
   - Text input fields
   - Textareas
   - Content-editable divs
   - Search bars

### Debugging

- **Popup Debugging**: Right-click extension icon → **"Inspect popup"**
- **Content Script Debugging**: Open DevTools (`F12`) on any webpage
- **Extension Errors**: Check `chrome://extensions/` for error messages

## 🔧 Permissions Explained

The extension requests the following permissions:

- **`activeTab`**: Access to the currently active tab for voice typing
- **`storage`**: Store user preferences and settings
- **`<all_urls>`**: Work on all websites (host permission)

## ❓ Troubleshooting

### Extension Won't Load

- **Error: "Manifest file is missing or unreadable"**
  - Ensure `manifest.json` is in the root folder
  - Check for JSON syntax errors

- **Error: "Could not load extension"**
  - Verify all referenced files exist
  - Check browser console for specific errors

### Voice Not Working

- **Microphone permissions denied**
  - Go to `chrome://settings/content/microphone`
  - Ensure microphone access is allowed
  - Check system microphone permissions (macOS System Preferences)

- **Voice input not transcribing**
  - Check browser console for errors
  - Verify Web Speech API is supported in your Chrome version
  - Ensure you're on an HTTPS site (required for microphone access on some sites)

### Text Not Inserting

- **Content script not running**
  - Check if the page has CSP (Content Security Policy) restrictions
  - Verify `content.js` is properly loaded (check DevTools → Sources)

## 📝 Notes

- This extension uses **Manifest V3**, the latest Chrome extension standard
- Microphone access requires HTTPS on most websites (HTTP works on localhost)
- Some websites may block content script injection due to security policies

## 🔐 Privacy

- Voice data is processed locally in your browser (when using Web Speech API)
- No data is sent to external servers (unless you implement custom voice services)
- Review the extension's permissions before installation

## 📄 License

This project is available for personal and educational use.

## 🆘 Support

If you encounter issues:
1. Check the [Troubleshooting](#troubleshooting) section above
2. Review Chrome extension console errors
3. Verify all files are present and correctly referenced

---

**Happy Voice Typing! 🎤✨**

