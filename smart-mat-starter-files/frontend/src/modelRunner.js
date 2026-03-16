import * as ort from "onnxruntime-web";

let sessionPromise = null;

export async function loadModel() {
  if (!sessionPromise) {
    sessionPromise = ort.InferenceSession.create("/smart_mat.onnx", {
      executionProviders: ["wasm"],
    }).catch((err) => {
      sessionPromise = null;
      throw err;
    });
  }

  return sessionPromise;
}

export async function predictLogits(vector) {
  const session = await loadModel();
  const input = new ort.Tensor("float32", Float32Array.from(vector), [1, vector.length]);
  const outputs = await session.run({ input });

  const outputName = Object.keys(outputs)[0];
  return Array.from(outputs[outputName].data);
}
