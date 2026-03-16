import { useEffect, useMemo, useState } from "react";
import Controls from "./Controls";
import MatCanvas from "./MatCanvas";
import { pedals, clampFootCenter } from "./pedalGeometry";
import { computeFeatures, ruleBasedAssessment } from "./featureExtractor";
import { loadModel, predictLogits } from "./modelRunner";

const INITIAL_STATE = {
  footX: 235,
  footY: 230,
  angle: 0,
  size: 1.0,
  intendedPedal: "brake",
  mouseFollow: false,
};

function softmax(logits) {
  const maxLogit = Math.max(...logits);
  const exps = logits.map((value) => Math.exp(value - maxLogit));
  const sum = exps.reduce((acc, value) => acc + value, 0);
  return exps.map((value) => value / sum);
}

function labelFromIndex(index) {
  return ["SAFE", "RISK", "MISAPPLICATION"][index] ?? "SAFE";
}

export default function App() {
  const [state, setState] = useState(INITIAL_STATE);
  const [modelStatus, setModelStatus] = useState("loading");
  const [assessment, setAssessment] = useState({
    label: "SAFE",
    riskScore: 0.0,
    probs: [1, 0, 0],
    source: "rules",
  });

  useEffect(() => {
    let active = true;

    loadModel()
      .then(() => {
        if (active) setModelStatus("loaded");
      })
      .catch(() => {
        if (active) setModelStatus("fallback");
      });

    return () => {
      active = false;
    };
  }, []);

  const featureResult = useMemo(() => computeFeatures(state, pedals), [state]);

  useEffect(() => {
    let active = true;
    const fallback = ruleBasedAssessment(featureResult, state);

    async function runAssessment() {
      if (modelStatus !== "loaded") {
        setAssessment(fallback);
        return;
      }

      try {
        const logits = await predictLogits(featureResult.vector);
        if (!active) return;

        const probs = softmax(logits);
        const bestIndex = probs.indexOf(Math.max(...probs));
        const riskScore = Math.max(probs[1] || 0, probs[2] || 0);

        setAssessment({
          label: labelFromIndex(bestIndex),
          riskScore,
          probs,
          source: "model",
        });
      } catch (error) {
        if (!active) return;
        console.error("Falling back to rules because model inference failed:", error);
        setModelStatus("fallback");
        setAssessment(fallback);
      }
    }

    runAssessment();

    return () => {
      active = false;
    };
  }, [featureResult, modelStatus, state]);

  const geometry = featureResult.geometry;

  function resetFoot() {
    const clamped = clampFootCenter(INITIAL_STATE.footX, INITIAL_STATE.footY, state.size);
    setState((prev) => ({
      ...prev,
      footX: clamped.x,
      footY: clamped.y,
      angle: 0,
      size: 1.0,
      mouseFollow: false,
    }));
  }

  return (
    <div className="app-shell">
      <div className="header">
        <div>
          <h1>Smart Mat Demo</h1>
          <p>
            A browser prototype for foot placement, pedal overlap, and live
            pedal-misapplication risk.
          </p>
        </div>
      </div>

      <div className="workspace">
        <MatCanvas
          state={state}
          setState={setState}
          assessment={assessment}
          geometry={geometry}
        />

        <Controls
          state={state}
          setState={setState}
          onReset={resetFoot}
          assessment={assessment}
          modelStatus={modelStatus}
        />
      </div>

      <div className="metrics-row">
        <div className="metric">
          <span>Brake overlap</span>
          <strong>{geometry.brakeOverlap.toFixed(2)}</strong>
        </div>
        <div className="metric">
          <span>Accelerator overlap</span>
          <strong>{geometry.accelOverlap.toFixed(2)}</strong>
        </div>
        <div className="metric">
          <span>Distance to brake</span>
          <strong>{geometry.distBrake.toFixed(2)}</strong>
        </div>
        <div className="metric">
          <span>Distance to accelerator</span>
          <strong>{geometry.distAccel.toFixed(2)}</strong>
        </div>
        <div className="metric">
          <span>Angle penalty</span>
          <strong>{geometry.anglePenalty.toFixed(2)}</strong>
        </div>
      </div>
    </div>
  );
}
