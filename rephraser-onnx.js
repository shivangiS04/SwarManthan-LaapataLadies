// rephraser-onnx.js
// ✅ 100% Offline tone rephrasing using Transformers.js + ONNXRuntime (MV3-safe)

import * as rawOrt from "./lib/ort.min.js";
import { pipeline, env } from "./lib/transformers.min.js";

/* ========================================================
   1️⃣ SAFELY CLONE THE ONNX RUNTIME OBJECT
   ======================================================== */
const ort = Object.assign({}, rawOrt);

/* ========================================================
   2️⃣ PRELOAD WASM FILE MANUALLY
   ======================================================== */
async function preloadWasmBinary() {
  const wasmUrl = chrome.runtime.getURL("wasm/ort-wasm.wasm");
  const resp = await fetch(wasmUrl);
  if (!resp.ok) throw new Error(`Failed to fetch ort-wasm.wasm: ${resp.statusText}`);
  const buffer = await resp.arrayBuffer();
  console.log(`✅ Loaded ort-wasm.wasm (${(buffer.byteLength / 1024).toFixed(1)} KB)`);
  return buffer;
}

/* ========================================================
   3️⃣ SETUP ENVIRONMENT (MV3-SAFE)
   ======================================================== */
async function setupEnv() {
  const wasmBuffer = await preloadWasmBinary();

  // Attach our cloned ONNX runtime to Transformers
  env.backends.onnx = ort;

  // Ensure internal wasm object exists
  if (!ort.env) ort.env = {};
  if (!ort.env.wasm) ort.env.wasm = {};

  // Configure ONNX runtime
  ort.env.wasm.numThreads = 1;
  ort.env.wasm.simd = false;
  ort.env.wasm.proxy = false;
  ort.env.wasm.wasmPaths = "";
  ort.env.wasm.wasmBinary = wasmBuffer;

  if (typeof ort.init === "function") {
    try {
      await ort.init();
      console.log("🧠 ONNXRuntime initialized.");
    } catch (e) {
      console.warn("⚠️ ONNX init skipped:", e.message);
    }
  }

  // Configure Transformers environment
  env.allowLocalModels = true;
  env.allowRemoteModels = false;
  env.useBrowserCache = false;
  env.localModelPath = chrome.runtime.getURL("models");

  console.log("🧩 ONNX environment configured (with cloned runtime).");
}

/* ========================================================
   4️⃣ LOAD PIPELINE
   ======================================================== */
let pipePromise = null;

async function getPipeline() {
  if (!pipePromise) {
    console.log("🧠 Loading ONNX model...");
    try {
      await setupEnv();

      pipePromise = await pipeline("text2text-generation", "Xenova/flan-t5-small", {
        device: "wasm",
      });

      console.log("✅ ONNX model pipeline ready.");
    } catch (err) {
      console.error("❌ Model loading failed:", err);
      throw new Error("ONNX model load failed. Check WASM binary or model folder.");
    }
  }
  return pipePromise;
}

/* ========================================================
   5️⃣ REPHRASE FUNCTION
   ======================================================== */
export async function rephraseWithONNX(text, tone = "formal") {
  if (!text || !text.trim()) return "";

  const prompt = `Rephrase the following text in a ${tone} tone.
Preserve the meaning but adjust the style:\n\n"${text.trim()}"`;

  try {
    const pipe = await getPipeline();
    console.log(`⚙️ Generating rephrase [tone=${tone}]...`);

    const output = await pipe(prompt, {
      max_new_tokens: 96,
      temperature: 0.7,
      top_p: 0.9,
      repetition_penalty: 1.1,
    });

    const rephrased = Array.isArray(output)
      ? output[0]?.generated_text ?? ""
      : String(output);

    console.log("✅ Rephrased text:", rephrased);
    return rephrased.trim();
  } catch (err) {
    console.error("❌ Rephrase error:", err);
    throw new Error("Rephrase failed: " + err.message);
  }
}
