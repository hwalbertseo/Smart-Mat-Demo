import * as ort from "onnxruntime-web";

let bundlePromise = null;

function validateMeta(rawMeta) {
  if (!rawMeta || typeof rawMeta !== "object") {
    throw new Error("smart_mat_meta.json is missing or invalid.");
  }

  const meta = { ...rawMeta };

  if (!Array.isArray(meta.input_feature_names)) {
    const numeric = Array.isArray(meta.numeric_feature_names)
      ? meta.numeric_feature_names
      : [];
    const categorical = Array.isArray(meta.categorical_feature_names)
      ? meta.categorical_feature_names
      : [];

    if (numeric.length || categorical.length) {
      meta.input_feature_names = [...numeric, ...categorical];
    }
  }

  if (!Array.isArray(meta.input_feature_names)) {
    throw new Error("smart_mat_meta.json is missing input_feature_names.");
  }

  if (!Array.isArray(meta.label_names)) {
    throw new Error("smart_mat_meta.json is missing label_names.");
  }

  if (meta.input_dim == null) {
    meta.input_dim = meta.input_feature_names.length;
  }

  return meta;
}

async function loadBundle() {
  if (!bundlePromise) {
    bundlePromise = Promise.all([
      ort.InferenceSession.create("/smart_mat.onnx", {
        executionProviders: ["wasm"],
      }),
      fetch("/smart_mat_meta.json").then((r) => {
        if (!r.ok) {
          throw new Error(`Failed to load smart_mat_meta.json: ${r.status}`);
        }
        return r.json();
      }),
    ])
      .then(([session, rawMeta]) => {
        const meta = validateMeta(rawMeta);
        return { session, meta };
      })
      .catch((err) => {
        console.error("Model bundle load failed:", err);
        bundlePromise = null;
        throw err;
      });
  }

  return bundlePromise;
}

function normalizeVectorLegacy(vector, meta) {
  const { mean, std } = meta;

  if (!Array.isArray(mean) || !Array.isArray(std)) {
    throw new Error("Legacy normalization requested, but mean/std are missing.");
  }

  if (vector.length !== mean.length || vector.length !== std.length) {
    throw new Error(
      `Feature length mismatch. Got ${vector.length}, expected ${mean.length}.`
    );
  }

  return vector.map((value, i) => {
    const denom = Math.abs(std[i]) < 1e-6 ? 1.0 : std[i];
    return (value - mean[i]) / denom;
  });
}

function vectorFromInput(inputValue, meta) {
  if (Array.isArray(inputValue)) {
    return inputValue.map((v) => Number(v));
  }

  if (inputValue && typeof inputValue === "object") {
    return meta.input_feature_names.map((name) => {
      if (!(name in inputValue)) {
        throw new Error(`Missing feature '${name}' in input object.`);
      }
      return Number(inputValue[name]);
    });
  }

  throw new Error("predictLogits expects either an array or a feature object.");
}

function prepareVector(inputValue, meta) {
  const vector = vectorFromInput(inputValue, meta);
  const expectedLength = meta.input_dim ?? meta.input_feature_names.length;

  if (vector.length !== expectedLength) {
    throw new Error(
      `Feature length mismatch. Got ${vector.length}, expected ${expectedLength}.`
    );
  }

  if (vector.some((value) => !Number.isFinite(value))) {
    throw new Error("Input vector contains NaN or non-finite values.");
  }

  if (meta.expects_raw_combined_input) {
    return vector;
  }

  return normalizeVectorLegacy(vector, meta);
}

export async function loadModel() {
  return loadBundle();
}

export async function predictLogits(inputValue) {
  const { session, meta } = await loadBundle();
  const prepared = prepareVector(inputValue, meta);

  const input = new ort.Tensor(
    "float32",
    Float32Array.from(prepared),
    [1, prepared.length]
  );

  const outputs = await session.run({ input });
  const outputName = Object.keys(outputs)[0];
  return Array.from(outputs[outputName].data);
}

export async function predictWithMeta(inputValue) {
  const { session, meta } = await loadBundle();
  const prepared = prepareVector(inputValue, meta);

  const input = new ort.Tensor(
    "float32",
    Float32Array.from(prepared),
    [1, prepared.length]
  );

  const outputs = await session.run({ input });
  const outputName = Object.keys(outputs)[0];

  return {
    logits: Array.from(outputs[outputName].data),
    meta,
  };
}