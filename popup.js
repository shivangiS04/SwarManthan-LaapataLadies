// Voice Typist Popup Script — Voice + ONNX Rephrasing (FINAL STABLE VERSION)
import { rephraseWithONNX } from './rephraser-onnx.js';

let recognition = null;
let isRecording = false;
let shouldAutoRestart = false;

let originalTranscript = '';   // raw speech text
let rephrasedTranscript = '';  // ONNX rephrased text

// ---------------- SPEECH RECOGNITION ----------------
function initSpeechRecognition() {
  console.log("Initializing SpeechRecognition...");
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    console.warn("SpeechRecognition API not found.");
    updateStatus("Speech recognition not supported. Use Chrome.", true);
    return false;
  }

  try {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log('🎙️ Speech recognition started');
      isRecording = true;
      shouldAutoRestart = true;
      updateStatus('🎤 Listening... Speak now!', false, true);
      document.getElementById('startRecording').style.display = 'none';
      document.getElementById('stopRecording').style.display = 'flex';
      document.getElementById('insertText').disabled = false;
    };

    recognition.onresult = (event) => {
      let interim = '', final = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += transcript + ' ';
        else interim += transcript;
      }

      if (final) originalTranscript += final;
      const displayText = originalTranscript + interim;
      document.getElementById('transcriptText').textContent = displayText;

      // Clear old rephrased text if new speech appears
      if (final || interim) {
        rephrasedTranscript = '';
        document.getElementById('rephrasedText').textContent = '';
        updateInsertButtonState();
      }
    };

    recognition.onerror = (e) => {
      console.error('Speech recognition error:', e.error);
      shouldAutoRestart = false;
      let msg = 'Error occurred.';
      if (e.error === 'no-speech') {
        msg = 'No speech detected. Try again.';
        shouldAutoRestart = true;
      } else if (e.error === 'audio-capture') msg = 'Microphone not found.';
      else if (e.error === 'not-allowed') msg = 'Microphone permission denied.';
      updateStatus(msg, true);
    };

    recognition.onend = () => {
      if (isRecording && shouldAutoRestart) {
        setTimeout(() => {
          try {
            recognition.start();
          } catch (err) {
            console.log('Restart error:', err);
          }
        }, 150);
      } else {
        updateStatus('Recording stopped. Ready to insert text.');
      }
    };

    return true;
  } catch (err) {
    console.error('Speech init error:', err);
    updateStatus('Failed to initialize speech recognition.', true);
    return false;
  }
}

// ---------------- UI HELPERS ----------------
function updateStatus(message, isError = false, isRecordingState = false) {
  const statusEl = document.getElementById('status');
  statusEl.textContent = message;
  statusEl.className = 'status';
  if (isRecordingState) statusEl.classList.add('recording');
  if (isError) {
    statusEl.style.background = '#f8d7da';
    statusEl.style.color = '#721c24';
  } else {
    statusEl.style.background = '';
    statusEl.style.color = '';
  }
}

function updateInsertButtonState() {
  const btn = document.getElementById('insertText');
  if (rephrasedTranscript) {
    btn.textContent = 'Insert Rephrased Text';
    btn.disabled = false;
  } else if (originalTranscript) {
    btn.textContent = 'Insert Text';
    btn.disabled = false;
  } else {
    btn.textContent = 'Insert Text';
    btn.disabled = true;
  }
}

async function startRecording() {
  console.log("🎬 Start Recording clicked");
  updateStatus("Initializing microphone...", false);

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((t) => t.stop());
  } catch (err) {
    console.error("Microphone permission denied:", err);
    updateStatus("Microphone access denied.", true);
    return;
  }

  if (!recognition && !initSpeechRecognition()) return;

  try {
    console.log("🚀 Starting speech recognition...");
    shouldAutoRestart = true;
    recognition.start();
    updateStatus("🎤 Listening... Speak now!", false, true);
  } catch (err) {
    console.error("Start error:", err);
    updateStatus("Failed to start recognition: " + err.message, true);
  }
}

function stopRecording() {
  shouldAutoRestart = false;
  if (recognition) {
    try {
      recognition.stop();
    } catch (e) {
      console.log('Stop error:', e);
    }
  }
  isRecording = false;
  document.getElementById('startRecording').style.display = 'flex';
  document.getElementById('stopRecording').style.display = 'none';
  updateStatus('Recording stopped. Ready to insert text.');
}

// ---------------- INSERT / CLEAR ----------------
async function insertText() {
  const textToInsert = rephrasedTranscript.trim() || originalTranscript.trim();
  if (!textToInsert) {
    updateStatus('No text to insert. Please record or rephrase first.', true);
    return;
  }

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const action = rephrasedTranscript ? 'insertRephrasedText' : 'insertText';

    // ✅ Step 1: Check if content.js already exists
    const isReady = await new Promise((resolve) => {
      let responded = false;
      chrome.tabs.sendMessage(tab.id, { ping: true }, (resp) => {
        responded = true;
        resolve(resp?.pong === true);
      });
      setTimeout(() => {
        if (!responded) resolve(false);
      }, 400);
    });

    // ✅ Step 2: Inject only if missing
    if (!isReady) {
      console.log('Injecting content.js...');
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js'],
      });
    }

    // ✅ Step 3: Send unique message
    const message = {
      action,
      text: textToInsert,
      _actionId: Math.random().toString(36).slice(2),
    };

    chrome.tabs.sendMessage(tab.id, message, (response) => {
      if (chrome.runtime.lastError) {
        updateStatus('Error: ' + chrome.runtime.lastError.message, true);
      } else if (response?.success) {
        updateStatus(
          rephrasedTranscript ? '✨ Rephrased text inserted!' : '✅ Text inserted!'
        );
        setTimeout(clearText, 2000);
      } else {
        updateStatus('⚠️ Click inside a text box first, then try again.', true);
      }
    });
  } catch (err) {
    console.error('Insert error:', err);
    updateStatus('Insert failed.', true);
  }
}

function clearText() {
  originalTranscript = '';
  rephrasedTranscript = '';
  document.getElementById('transcriptText').textContent = '';
  document.getElementById('rephrasedText').textContent = '';
  updateInsertButtonState();
  updateStatus('Cleared.');
}

// ---------------- REAL ONNX REPHRASING ----------------
async function rephraseText(tone) {
  if (!originalTranscript.trim()) {
    updateStatus('No text to rephrase.', true);
    return;
  }

  const rephrasedEl = document.getElementById('rephrasedText');
  rephrasedEl.textContent = '⏳ Loading model / Rephrasing...';
  rephrasedEl.classList.add('show');

  try {
    const rephrased = await rephraseWithONNX(originalTranscript, tone);
    console.log('✅ Rephrased text:', rephrased);
    rephrasedTranscript = rephrased;
    rephrasedEl.textContent = rephrased;
    updateStatus(`Rephrased as ${tone}! Click "Insert" to use it.`);
    updateInsertButtonState();
  } catch (err) {
    console.error('Rephrase error:', err);
    rephrasedEl.textContent = '❌ Rephrasing failed.';
    updateStatus('Error during rephrasing: ' + err.message, true);
  }
}

// ---------------- EVENT LISTENERS ----------------
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('startRecording').addEventListener('click', startRecording);
  document.getElementById('stopRecording').addEventListener('click', stopRecording);
  document.getElementById('insertText').addEventListener('click', insertText);
  document.getElementById('clearText').addEventListener('click', clearText);

  document.querySelectorAll('.tone-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tone-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const tone = btn.getAttribute('data-tone');
      rephraseText(tone);
    });
  });

  updateStatus('Ready to record. Click "Start Recording" to begin.');
  updateInsertButtonState();
});
