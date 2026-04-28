import * as ort from "onnxruntime-web";
import { FEATURE_NAMES } from "./featureExtractor";

let cachedSession = null;
let cachedMeta = null;

const MODEL_PATH = `${import.meta.env.BASE_URL}smart_mat.onnx`;
const META_PATH = `${import.meta.env.BASE_URL}smart_mat_meta.json`;

function getInputFeatureNames(meta) {
  return (
    meta?.input_feature_names ||
    meta?.feature_names ||
    meta?.featureNames ||
    meta?.features ||
    meta?.input_features ||
    meta?.columns ||
    FEATURE_NAMES
  );
}

function getNumericFeatureNames(meta) {
  return meta?.numeric_feature_names || [];
}

function getCategoricalFeatureNames(meta) {
  return meta?.categorical_feature_names || [];
}

function getMeans(meta) {
  return meta?.mean || meta?.means || meta?.feature_means || [];
}

function getStds(meta) {
  return meta?.std || meta?.stds || meta?.feature_stds || [];
}

function getRawFeatureValue(features, name) {
  if (!features) return undefined;

  if (features[name] != null) return features[name];

  const aliases = {
    intended_pedal_code: features.intended_pedal,
    pressed_state_code: features.pressed_state,

    intended_pedal: features.intendedPedal,
    intended: features.intendedPedal,

    pressed_state: features.pressedPedal,
    pressed_pedal: features.pressedPedal,
    pressed: features.pressedPedal,
  };

  return aliases[name];
}

function encodeCategoricalValue(name, rawValue, meta) {
  if (typeof rawValue === "number" && Number.isFinite(rawValue)) {
    return rawValue;
  }

  const raw = String(rawValue ?? "").trim();
  const lower = raw.toLowerCase();

  if (name.includes("intended")) {
    const map = meta?.intended_map || {};

    return Number(
      map[raw] ??
        map[lower] ??
        map[raw.toUpperCase()] ??
        map[lower === "accelerator" ? "accel" : lower] ??
        0
    );
  }

  if (name.includes("pressed")) {
    const map = meta?.pressed_state_map || {};

    return Number(
      map[raw] ??
        map[lower] ??
        map[raw.toUpperCase()] ??
        map[lower === "accelerator" ? "accel" : lower] ??
        0
    );
  }

  return Number(rawValue) || 0;
}

function buildModelInput(features, meta) {
  const numericNames = getNumericFeatureNames(meta);
  const categoricalNames = getCategoricalFeatureNames(meta);
  const inputFeatureNames = getInputFeatureNames(meta);

  const means = getMeans(meta);
  const stds = getStds(meta);

  const expectsRawCombinedInput = Boolean(meta?.expects_raw_combined_input);

  if (numericNames.length > 0 && categoricalNames.length > 0) {
    const missingNumeric = [];

    const numericValues = numericNames.map((name, index) => {
      const rawValue = getRawFeatureValue(features, name);

      if (rawValue == null) {
        missingNumeric.push(name);
      }

      const raw = Number(rawValue ?? 0);

      if (expectsRawCombinedInput) {
        return raw;
      }

      const mean = Number(means[index] ?? 0);
      const std = Number(stds[index] ?? 1) || 1;

      return (raw - mean) / std;
    });

    if (missingNumeric.length > 0) {
      console.warn("[modelRunner] Missing numeric features:", missingNumeric);
    }

    const categoricalDebug = categoricalNames.map((name) => {
      const raw = getRawFeatureValue(features, name);
      const encoded = encodeCategoricalValue(name, raw, meta);

      return {
        name,
        raw,
        encoded,
      };
    });

    const categoricalValues = categoricalDebug.map((item) => item.encoded);

    const combined = [...numericValues, ...categoricalValues];

    console.log("[modelRunner] expects_raw_combined_input:", expectsRawCombinedInput);
    console.log("[modelRunner] Numeric feature count:", numericValues.length);
    console.log("[modelRunner] Categorical feature count:", categoricalValues.length);
    console.log("[modelRunner] Final input length:", combined.length);
    console.log("[modelRunner] Categorical debug:", categoricalDebug);
    console.log("[modelRunner] Final model input:", combined);

    return combined;
  }

  const values = inputFeatureNames.map((name) => {
    return Number(getRawFeatureValue(features, name) ?? 0);
  });

  if (expectsRawCombinedInput) {
    return values;
  }

  return values.map((value, index) => {
    if (index >= means.length || index >= stds.length) return value;

    const mean = Number(means[index] ?? 0);
    const std = Number(stds[index] ?? 1) || 1;

    return (value - mean) / std;
  });
}

async function fetchJson(path, label) {
  const response = await fetch(path, { cache: "no-store" });

  console.log(`[modelRunner] ${label} fetch status:`, response.status, path);

  if (!response.ok) {
    throw new Error(`${label} not found at ${path}`);
  }

  return response.json();
}

async function loadMeta() {
  if (cachedMeta) return cachedMeta;

  cachedMeta = await fetchJson(META_PATH, "Metadata JSON");

  console.log("[modelRunner] Metadata loaded:", cachedMeta);
  console.log("[modelRunner] input_dim:", cachedMeta.input_dim);
  console.log("[modelRunner] expects_raw_combined_input:", cachedMeta.expects_raw_combined_input);
  console.log("[modelRunner] numeric_feature_names:", cachedMeta.numeric_feature_names);
  console.log("[modelRunner] categorical_feature_names:", cachedMeta.categorical_feature_names);
  console.log("[modelRunner] mean length:", getMeans(cachedMeta).length);
  console.log("[modelRunner] std length:", getStds(cachedMeta).length);

  return cachedMeta;
}

async function assertModelExists() {
  const response = await fetch(MODEL_PATH, { cache: "no-store" });

  console.log("[modelRunner] ONNX model fetch status:", response.status, MODEL_PATH);

  if (!response.ok) {
    throw new Error(`ONNX model not found at ${MODEL_PATH}`);
  }
}

export async function loadModel() {
  if (cachedSession && cachedMeta) {
    return {
      session: cachedSession,
      meta: cachedMeta,
    };
  }

  console.log("[modelRunner] BASE_URL:", import.meta.env.BASE_URL);
  console.log("[modelRunner] MODEL_PATH:", MODEL_PATH);
  console.log("[modelRunner] META_PATH:", META_PATH);

  await assertModelExists();

  const meta = await loadMeta();

  cachedSession = await ort.InferenceSession.create(MODEL_PATH, {
    executionProviders: ["wasm"],
    graphOptimizationLevel: "all",
  });

  cachedMeta = meta;

  console.log("[modelRunner] ONNX session loaded.");
  console.log("[modelRunner] Input names:", cachedSession.inputNames);
  console.log("[modelRunner] Output names:", cachedSession.outputNames);
  console.log("[modelRunner] Input metadata:", cachedSession.inputMetadata);

  return {
    session: cachedSession,
    meta: cachedMeta,
  };
}

export async function predictWithMeta(features) {
  const { session, meta } = await loadModel();

  const inputValues = buildModelInput(features, meta);
  const expectedInputDim = Number(meta?.input_dim ?? inputValues.length);

  if (inputValues.length !== expectedInputDim) {
    throw new Error(
      `Input length mismatch. Built ${inputValues.length}, but metadata expects ${expectedInputDim}.`
    );
  }

  const inputName = session.inputNames[0];
  const outputName = session.outputNames[0];

  console.log("[modelRunner] Running inference.");
  console.log("[modelRunner] Tensor shape:", [1, inputValues.length]);

  const inputTensor = new ort.Tensor("float32", Float32Array.from(inputValues), [
    1,
    inputValues.length,
  ]);

  const outputs = await session.run({
    [inputName]: inputTensor,
  });

  const output = outputs[outputName];

  if (!output) {
    console.error("[modelRunner] Available outputs:", outputs);
    throw new Error(`Output "${outputName}" was not found.`);
  }

  const logits = Array.from(output.data);

  console.log("[modelRunner] Raw logits:", logits);

  return {
    logits,
    meta,
  };
}

export function clearModelCache() {
  cachedSession = null;
  cachedMeta = null;
}