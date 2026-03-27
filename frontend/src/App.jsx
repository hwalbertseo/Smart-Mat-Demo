import { useEffect, useMemo, useState } from "react";
import Controls from "./Controls";
import MatCanvas from "./MatCanvas";
import {
  pedals,
  clampFootCenter,
  rectCenter,
  getFootDimensions,
} from "./pedalGeometry";
import { computeFeatures, ruleBasedAssessment } from "./featureExtractor";
import { loadModel, predictWithMeta } from "./modelRunner";

const INITIAL_STATE = {
  footX: 235,
  footY: 230,
  angle: 0,
  size: 1.35,
  heelPressure: 45,
  carVelocityKph: 0,
};

const IDLE_ASSESSMENT = {
  label: "NOT PRESSING",
  riskScore: 0.0,
  probs: [1, 0, 0],
  source: "idle",
};

const DEFAULT_LABELS = ["SAFE", "RISK", "MISAPPLICATION"];

function softmax(logits) {
  const maxLogit = Math.max(...logits);
  const exps = logits.map((value) => Math.exp(value - maxLogit));
  const sum = exps.reduce((acc, value) => acc + value, 0);
  return exps.map((value) => value / sum);
}

function canonicalizeLabel(label) {
  const v = String(label ?? "").trim().toLowerCase();

  if (v === "safe") return "SAFE";
  if (v === "risk" || v === "warning" || v === "caution") return "RISK";
  if (
    v === "misapplication" ||
    v === "dangerous" ||
    v === "danger" ||
    v === "unsafe"
  ) {
    return "MISAPPLICATION";
  }
  if (v === "not pressing") return "NOT PRESSING";

  return String(label ?? "SAFE").toUpperCase();
}

function riskScoreFromProbs(probs, labelNames) {
  const normalized = labelNames.map(canonicalizeLabel);
  const riskIndex = normalized.indexOf("RISK");
  const misIndex = normalized.indexOf("MISAPPLICATION");

  return Math.max(
    riskIndex >= 0 ? probs[riskIndex] || 0 : 0,
    misIndex >= 0 ? probs[misIndex] || 0 : 0
  );
}

function pointInRectWithPad(x, y, rect, pad = 12) {
  return (
    x >= rect.x - pad &&
    x <= rect.x + rect.width + pad &&
    y >= rect.y - pad &&
    y <= rect.y + rect.height + pad
  );
}

function inferForefootPoint(state) {
  const { length } = getFootDimensions(state.size);
  const rad = (state.angle * Math.PI) / 180;

  return {
    x: state.footX + Math.sin(rad) * (length * 0.62),
    y: state.footY - Math.cos(rad) * (length * 0.62),
  };
}

function inferPedalState(state, isPressing) {
  const forefoot = inferForefootPoint(state);

  const brakeCenter = rectCenter(pedals.brake);
  const accelCenter = rectCenter(pedals.accel);

  const brakeDist = Math.hypot(
    forefoot.x - brakeCenter.x,
    forefoot.y - brakeCenter.y
  );
  const accelDist = Math.hypot(
    forefoot.x - accelCenter.x,
    forefoot.y - accelCenter.y
  );

  const intendedPedal = brakeDist <= accelDist ? "brake" : "accel";

  let pressedPedal = "none";

  if (isPressing) {
    const onBrake = pointInRectWithPad(
      forefoot.x,
      forefoot.y,
      pedals.brake,
      12
    );
    const onAccel = pointInRectWithPad(
      forefoot.x,
      forefoot.y,
      pedals.accel,
      12
    );

    if (onBrake && !onAccel) pressedPedal = "brake";
    else if (onAccel && !onBrake) pressedPedal = "accel";
    else if (onBrake && onAccel) pressedPedal = intendedPedal;
  }

  return {
    intendedPedal,
    pressedPedal,
    forefootX: forefoot.x,
    forefootY: forefoot.y,
  };
}

export default function App() {
  const [state, setState] = useState(INITIAL_STATE);
  const [isPressing, setIsPressing] = useState(false);
  const [modelStatus, setModelStatus] = useState("loading");
  const [assessment, setAssessment] = useState(IDLE_ASSESSMENT);

  useEffect(() => {
    let active = true;

    loadModel()
      .then(() => {
        if (active) setModelStatus("loaded");
      })
      .catch((err) => {
        console.error("Model load failed:", err);
        if (active) setModelStatus("fallback");
      });

    return () => {
      active = false;
    };
  }, []);

  const inferredPedalState = useMemo(
    () => inferPedalState(state, isPressing),
    [state, isPressing]
  );

  const effectiveState = useMemo(
    () => ({
      ...state,
      intendedPedal: inferredPedalState.intendedPedal,
      pressedPedal: inferredPedalState.pressedPedal,
    }),
    [state, inferredPedalState]
  );

  const featureResult = useMemo(
    () => computeFeatures(effectiveState, pedals),
    [effectiveState]
  );

  const geometry = featureResult.geometry;
  const features = featureResult.features;

  useEffect(() => {
    let active = true;

    if (!isPressing) {
      setAssessment(IDLE_ASSESSMENT);
      return () => {
        active = false;
      };
    }

    const fallback = ruleBasedAssessment(featureResult, effectiveState, pedals);

    async function runAssessment() {
      if (modelStatus !== "loaded") {
        setAssessment({
          ...fallback,
          source: "rules",
        });
        return;
      }

      try {
        const { logits, meta } = await predictWithMeta(featureResult.vector);
        if (!active) return;

        const probs = softmax(logits);
        const rawLabelNames =
          Array.isArray(meta?.label_names) && meta.label_names.length === probs.length
            ? meta.label_names
            : DEFAULT_LABELS;

        const labelNames = rawLabelNames.map(canonicalizeLabel);
        const bestIndex = probs.indexOf(Math.max(...probs));

        setAssessment({
          label: labelNames[bestIndex] ?? "SAFE",
          riskScore: riskScoreFromProbs(probs, labelNames),
          probs,
          source: "model",
        });
      } catch (error) {
        if (!active) return;
        console.error("Falling back to rules because model inference failed:", error);
        setModelStatus("fallback");
        setAssessment({
          ...fallback,
          source: "rules",
        });
      }
    }

    runAssessment();

    return () => {
      active = false;
    };
  }, [featureResult, effectiveState, modelStatus, isPressing]);

  function resetFoot() {
    const clamped = clampFootCenter(
      INITIAL_STATE.footX,
      INITIAL_STATE.footY,
      INITIAL_STATE.size,
      INITIAL_STATE.angle
    );

    setState({
      ...INITIAL_STATE,
      footX: clamped.x,
      footY: clamped.y,
    });
    setIsPressing(false);
    setAssessment(IDLE_ASSESSMENT);
  }

  return (
    <div className="app-shell">
      <div className="header">
        <div>
          <h1>Smart Mat Demo</h1>
          <p>
            A browser prototype for intention-aware foot placement and pedal
            misapplication detection.
          </p>
        </div>
      </div>

      <div className="workspace">
        <MatCanvas
          state={state}
          setState={setState}
          assessment={assessment}
          geometry={geometry}
          isPressing={isPressing}
          setIsPressing={setIsPressing}
        />

        <Controls
          state={state}
          setState={setState}
          onReset={resetFoot}
          assessment={assessment}
          modelStatus={modelStatus}
          isPressing={isPressing}
          geometry={geometry}
        />
      </div>

      <div className="metrics-row">
        <div className="metric">
          <span>Intended pedal</span>
          <strong>{geometry?.intendedPedal?.toUpperCase?.() ?? "-"}</strong>
        </div>

        <div className="metric">
          <span>Pressed pedal</span>
          <strong>{geometry?.pressedPedal?.toUpperCase?.() ?? "NONE"}</strong>
        </div>

        <div className="metric">
          <span>Vehicle speed</span>
          <strong>{features.car_velocity_kph.toFixed(0)} kph</strong>
        </div>

        <div className="metric">
          <span>Heel pressure</span>
          <strong>{features.heel_pressure.toFixed(0)}</strong>
        </div>

        <div className="metric">
          <span>Heel anchor dx</span>
          <strong>{features.heel_anchor_dx.toFixed(3)}</strong>
        </div>

        <div className="metric">
          <span>Heel anchor dy</span>
          <strong>{features.heel_anchor_dy.toFixed(3)}</strong>
        </div>

        <div className="metric">
          <span>Press active</span>
          <strong>{isPressing ? "YES" : "NO"}</strong>
        </div>
      </div>
    </div>
  );
}