import { useEffect, useMemo, useRef, useState } from "react";
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

function isTouchPrimaryDevice() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(hover: none) and (pointer: coarse)").matches;
}

function getAssessmentTone(label) {
  const v = String(label ?? "").toUpperCase();

  if (v === "SAFE") {
    return {
      background: "rgba(34, 197, 94, 0.16)",
      border: "1px solid rgba(34, 197, 94, 0.34)",
      color: "#bbf7d0",
    };
  }

  if (v === "RISK") {
    return {
      background: "rgba(245, 158, 11, 0.16)",
      border: "1px solid rgba(245, 158, 11, 0.34)",
      color: "#fde68a",
    };
  }

  if (v === "MISAPPLICATION") {
    return {
      background: "rgba(239, 68, 68, 0.16)",
      border: "1px solid rgba(239, 68, 68, 0.34)",
      color: "#fecaca",
    };
  }

  return {
    background: "rgba(148, 163, 184, 0.14)",
    border: "1px solid rgba(148, 163, 184, 0.26)",
    color: "#e2e8f0",
  };
}

function getAssessmentAccent(label) {
  const v = String(label ?? "").toUpperCase();

  if (v === "SAFE") return "#22c55e";
  if (v === "RISK") return "#f59e0b";
  if (v === "MISAPPLICATION") return "#ef4444";
  return "#94a3b8";
}

function buildFeedbackText({ label, pressedPedal, intendedPedal, speed }) {
  const v = String(label ?? "").toUpperCase();
  const pressed = String(pressedPedal ?? "none").toLowerCase();
  const intended = String(intendedPedal ?? "unknown").toLowerCase();
  const currentSpeed = Number(speed ?? 0);

  if (v === "MISAPPLICATION") {
    if (pressed === "accel" && intended === "brake") {
      return currentSpeed > 0
        ? "Wrong pedal input detected. Release the accelerator and move the foot back toward the brake."
        : "Wrong pedal input detected. Lift and reposition the foot before moving.";
    }

    if (pressed === "brake" && intended === "accel") {
      return "Pedal mismatch detected. Reposition the foot carefully before applying input.";
    }

    return "Unsafe pedal application detected. Reposition the foot and confirm heel alignment.";
  }

  if (v === "RISK") {
    return "Foot posture looks unstable. Adjust heel position and apply pedal input more deliberately.";
  }

  if (v === "SAFE") {
    return "Foot placement looks stable and consistent with the intended pedal.";
  }

  return "Waiting for pedal input.";
}

function formatMetric(value, digits = 0, fallback = "-") {
  if (value == null || Number.isNaN(value)) return fallback;
  return Number(value).toFixed(digits);
}

function nowTimeLabel() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function DashboardSection({ title, children }) {
  return (
    <div
      style={{
        background: "rgba(15, 23, 42, 0.72)",
        border: "1px solid rgba(148, 163, 184, 0.16)",
        borderRadius: 18,
        padding: 14,
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          color: "#cbd5e1",
          marginBottom: 10,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function DashboardMetric({ label, value, emphasize = false }) {
  return (
    <div
      style={{
        background: "rgba(30, 41, 59, 0.84)",
        border: "1px solid rgba(148, 163, 184, 0.14)",
        borderRadius: 14,
        padding: "10px 12px",
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: "#94a3b8",
          marginBottom: 6,
          lineHeight: 1.2,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: emphasize ? 24 : 17,
          fontWeight: 800,
          color: "#f8fafc",
          lineHeight: 1.15,
          wordBreak: "break-word",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function DashboardPill({ children, ok = true }) {
  return (
    <div
      style={{
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 800,
        color: ok ? "#bbf7d0" : "#fecaca",
        background: ok
          ? "rgba(34, 197, 94, 0.12)"
          : "rgba(239, 68, 68, 0.12)",
        border: ok
          ? "1px solid rgba(34, 197, 94, 0.28)"
          : "1px solid rgba(239, 68, 68, 0.28)",
      }}
    >
      {children}
    </div>
  );
}

function ScoreCard({ score, label, caption, accent }) {
  return (
    <div
      style={{
        background: "rgba(30, 41, 59, 0.84)",
        border: "1px solid rgba(148, 163, 184, 0.14)",
        borderRadius: 16,
        padding: 14,
      }}
    >
      <div
        style={{
          fontSize: 11,
          color: "#94a3b8",
          marginBottom: 8,
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        {label}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 6,
          marginBottom: 10,
        }}
      >
        <div
          style={{
            fontSize: 32,
            fontWeight: 900,
            color: "#f8fafc",
            lineHeight: 1,
          }}
        >
          {score}
        </div>
        <div
          style={{
            fontSize: 14,
            color: "#94a3b8",
            fontWeight: 700,
          }}
        >
          / 100
        </div>
      </div>

      <div
        style={{
          width: "100%",
          height: 10,
          borderRadius: 999,
          background: "rgba(148, 163, 184, 0.18)",
          overflow: "hidden",
          marginBottom: 10,
        }}
      >
        <div
          style={{
            width: `${Math.max(0, Math.min(100, score))}%`,
            height: "100%",
            borderRadius: 999,
            background: accent,
          }}
        />
      </div>

      <div
        style={{
          fontSize: 12,
          lineHeight: 1.45,
          color: "#cbd5e1",
        }}
      >
        {caption}
      </div>
    </div>
  );
}

function AppFootPreview({ state, geometry, assessment }) {
  const { length, width } = getFootDimensions(state.size);
  const forefoot = inferForefootPoint(state);
  const accent = getAssessmentAccent(assessment?.label);

  return (
    <div
      style={{
        background: "rgba(2, 6, 23, 0.62)",
        border: "1px solid rgba(148, 163, 184, 0.14)",
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      <svg
        viewBox="0 0 700 450"
        style={{
          display: "block",
          width: "100%",
          height: "auto",
        }}
      >
        <rect x="0" y="0" width="700" height="450" fill="#0f172a" />
        <rect
          x="18"
          y="18"
          width="664"
          height="414"
          rx="28"
          fill="#1e293b"
          stroke="#475569"
          strokeWidth="4"
        />

        <rect x="34" y="46" width="138" height="310" rx="28" fill="#14213d" />
        <text
          x="62"
          y="84"
          fill="#e2e8f0"
          fontSize="26"
          fontWeight="700"
          fontFamily="Arial, sans-serif"
        >
          Seat
        </text>

        <rect
          x={pedals.brake.x}
          y={pedals.brake.y}
          width={pedals.brake.width}
          height={pedals.brake.height}
          rx="22"
          fill="#5b46a8"
          stroke="#a8a35d"
          strokeWidth="4"
        />
        <text
          x={pedals.brake.x + pedals.brake.width / 2}
          y={pedals.brake.y - 16}
          fill="#e5e7eb"
          fontSize="20"
          fontWeight="700"
          textAnchor="middle"
          fontFamily="Arial, sans-serif"
        >
          Brake
        </text>

        <rect
          x={pedals.accel.x}
          y={pedals.accel.y}
          width={pedals.accel.width}
          height={pedals.accel.height}
          rx="22"
          fill="#1f6b94"
          stroke="#94a3b8"
          strokeWidth="4"
        />
        <text
          x={pedals.accel.x + pedals.accel.width / 2}
          y={pedals.accel.y - 16}
          fill="#e5e7eb"
          fontSize="20"
          fontWeight="700"
          textAnchor="middle"
          fontFamily="Arial, sans-serif"
        >
          Accel
        </text>

        <text
          x="640"
          y="46"
          fill="#e5e7eb"
          fontSize="20"
          fontWeight="700"
          textAnchor="end"
          fontFamily="Arial, sans-serif"
        >
          Intent: {geometry?.intendedPedal?.toUpperCase?.() ?? "-"}
        </text>
        <text
          x="640"
          y="74"
          fill="#e5e7eb"
          fontSize="20"
          fontWeight="700"
          textAnchor="end"
          fontFamily="Arial, sans-serif"
        >
          Press: {geometry?.pressedPedal?.toUpperCase?.() ?? "NONE"}
        </text>

        <g transform={`translate(${state.footX} ${state.footY}) rotate(${state.angle})`}>
          <rect
            x={-width / 2}
            y={-length * 0.86}
            width={width}
            height={length}
            rx={width * 0.48}
            fill="#e7cdbb"
            stroke={accent}
            strokeWidth="5"
          />
        </g>

        <circle
          cx={state.footX}
          cy={state.footY}
          r="10"
          fill="#f43f5e"
          stroke="#fecdd3"
          strokeWidth="4"
        />
        <circle
          cx={forefoot.x}
          cy={forefoot.y}
          r="8"
          fill="#22d3ee"
          stroke="#a5f3fc"
          strokeWidth="3"
        />

        <text
          x="28"
          y="412"
          fill="#cbd5e1"
          fontSize="18"
          fontWeight="500"
          fontFamily="Arial, sans-serif"
        >
          Pink = heel anchor
        </text>
        <text
          x="190"
          y="412"
          fill="#cbd5e1"
          fontSize="18"
          fontWeight="500"
          fontFamily="Arial, sans-serif"
        >
          Cyan = forefoot estimate
        </text>
      </svg>
    </div>
  );
}

export default function App() {
  const [state, setState] = useState(INITIAL_STATE);
  const [isPressing, setIsPressing] = useState(false);
  const [isTouchPrimary, setIsTouchPrimary] = useState(isTouchPrimaryDevice());
  const [modelStatus, setModelStatus] = useState("loading");
  const [assessment, setAssessment] = useState(IDLE_ASSESSMENT);
  const [alerts, setAlerts] = useState([]);
  const [isCompactLayout, setIsCompactLayout] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 1220;
  });

  const lastAlertKeyRef = useRef("");

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

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const media = window.matchMedia("(hover: none) and (pointer: coarse)");
    const updateTouchMode = () => setIsTouchPrimary(media.matches);

    updateTouchMode();

    if (media.addEventListener) {
      media.addEventListener("change", updateTouchMode);
      return () => media.removeEventListener("change", updateTouchMode);
    }

    if (media.addListener) {
      media.addListener(updateTouchMode);
      return () => media.removeListener(updateTouchMode);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onResize = () => {
      setIsCompactLayout(window.innerWidth < 1220);
    };

    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const pressActive = isTouchPrimary || isPressing;

  const inferredPedalState = useMemo(
    () => inferPedalState(state, pressActive),
    [state, pressActive]
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

    if (!pressActive) {
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
          Array.isArray(meta?.label_names) &&
          meta.label_names.length === probs.length
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
        console.error(
          "Falling back to rules because model inference failed:",
          error
        );
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
  }, [featureResult, effectiveState, modelStatus, pressActive]);

  const feedbackText = useMemo(() => {
    return buildFeedbackText({
      label: assessment?.label,
      pressedPedal: geometry?.pressedPedal,
      intendedPedal: geometry?.intendedPedal,
      speed: features?.car_velocity_kph,
    });
  }, [
    assessment?.label,
    geometry?.pressedPedal,
    geometry?.intendedPedal,
    features?.car_velocity_kph,
  ]);

  useEffect(() => {
    if (!pressActive) return;
    if (!assessment?.label) return;

    const label = String(assessment.label).toUpperCase();
    if (label !== "RISK" && label !== "MISAPPLICATION") return;

    const key = [
      label,
      geometry?.pressedPedal ?? "none",
      geometry?.intendedPedal ?? "unknown",
      Math.round((assessment?.riskScore ?? 0) * 100),
      Math.round(features?.car_velocity_kph ?? 0),
    ].join("|");

    if (key === lastAlertKeyRef.current) return;
    lastAlertKeyRef.current = key;

    const nextAlert = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`,
      time: nowTimeLabel(),
      label,
      message: feedbackText,
    };

    setAlerts((prev) => [nextAlert, ...prev].slice(0, 8));
  }, [
    pressActive,
    assessment?.label,
    assessment?.riskScore,
    geometry?.pressedPedal,
    geometry?.intendedPedal,
    features?.car_velocity_kph,
    feedbackText,
  ]);

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
    setAlerts([]);
    lastAlertKeyRef.current = "";
    setAssessment(
      isTouchPrimary
        ? ruleBasedAssessment(featureResult, effectiveState, pedals)
        : IDLE_ASSESSMENT
    );
  }

  const tone = getAssessmentTone(assessment?.label);
  const appLinked = true;
  const modelReady = modelStatus === "loaded";
  const riskPercent = Math.round((assessment?.riskScore ?? 0) * 100);

  const modelScore = useMemo(() => {
    if (assessment?.source === "idle") return 0;

    if (
      assessment?.source === "model" &&
      Array.isArray(assessment?.probs) &&
      assessment.probs.length > 0
    ) {
      return Math.round(Math.max(...assessment.probs) * 100);
    }

    return riskPercent;
  }, [assessment, riskPercent]);

  const modelScoreCaption =
    assessment?.source === "model"
      ? "Confidence in the current assessment from the ONNX model."
      : assessment?.source === "rules"
      ? "Using the rule-based fallback estimate right now."
      : "The model score will appear when pedal input becomes active.";

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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isCompactLayout
            ? "minmax(0, 1fr)"
            : "minmax(0, 1fr) 360px",
          gap: 24,
          alignItems: "start",
        }}
      >
        <div
          style={{
            minWidth: 0,
            display: "grid",
            gap: 18,
            alignItems: "start",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <MatCanvas
              state={state}
              setState={setState}
              assessment={assessment}
              geometry={geometry}
              isPressing={pressActive}
              setIsPressing={setIsPressing}
              isTouchPrimary={isTouchPrimary}
            />
          </div>

          <div style={{ minWidth: 0, width: "100%" }}>
            <Controls
              state={state}
              setState={setState}
              onReset={resetFoot}
              assessment={assessment}
              modelStatus={modelStatus}
              isPressing={pressActive}
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
              <strong>{formatMetric(features?.car_velocity_kph, 0)} kph</strong>
            </div>

            <div className="metric">
              <span>Heel pressure</span>
              <strong>{formatMetric(features?.heel_pressure, 0)}</strong>
            </div>

            <div className="metric">
              <span>Heel anchor dx</span>
              <strong>{formatMetric(features?.heel_anchor_dx, 3)}</strong>
            </div>

            <div className="metric">
              <span>Heel anchor dy</span>
              <strong>{formatMetric(features?.heel_anchor_dy, 3)}</strong>
            </div>

            <div className="metric">
              <span>Press active</span>
              <strong>{pressActive ? "YES" : "NO"}</strong>
            </div>
          </div>
        </div>

        <div
          style={{
            position: isCompactLayout ? "static" : "sticky",
            top: 20,
            alignSelf: "start",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: isCompactLayout ? "100%" : 360,
              margin: "0 auto",
              borderRadius: 30,
              padding: 14,
              background:
                "linear-gradient(180deg, rgba(15,23,42,0.98) 0%, rgba(2,6,23,0.98) 100%)",
              border: "1px solid rgba(148, 163, 184, 0.18)",
              boxShadow: "0 24px 44px rgba(0,0,0,0.34)",
              color: "#f8fafc",
            }}
          >
            <div
              style={{
                width: 88,
                height: 6,
                borderRadius: 999,
                background: "rgba(148, 163, 184, 0.28)",
                margin: "2px auto 14px auto",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 12,
                marginBottom: 14,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 19,
                    fontWeight: 900,
                    color: "#f8fafc",
                    marginBottom: 4,
                  }}
                >
                  Driver App
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#94a3b8",
                  }}
                >
                  Live feedback preview
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gap: 8,
                  justifyItems: "end",
                }}
              >
                <DashboardPill ok={appLinked}>APP LINKED</DashboardPill>
                <DashboardPill ok={modelReady}>
                  {modelReady ? "AI READY" : "RULE MODE"}
                </DashboardPill>
              </div>
            </div>

            <div
              style={{
                ...tone,
                borderRadius: 18,
                padding: 16,
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  opacity: 0.9,
                  marginBottom: 6,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                Current status
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 900,
                  marginBottom: 8,
                  lineHeight: 1.05,
                }}
              >
                {assessment?.label ?? "NOT PRESSING"}
              </div>
              <div
                style={{
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                {feedbackText}
              </div>
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              <ScoreCard
                score={modelScore}
                label="Model Score"
                caption={modelScoreCaption}
                accent={getAssessmentAccent(assessment?.label)}
              />

              <DashboardSection title="Live foot view">
                <AppFootPreview
                  state={state}
                  geometry={geometry}
                  assessment={assessment}
                />
              </DashboardSection>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                }}
              >
                <DashboardMetric
                  label="Speed"
                  value={`${formatMetric(features?.car_velocity_kph, 0)} kph`}
                />
                <DashboardMetric
                  label="Pressed"
                  value={geometry?.pressedPedal?.toUpperCase?.() ?? "NONE"}
                />
                <DashboardMetric
                  label="Intent"
                  value={geometry?.intendedPedal?.toUpperCase?.() ?? "-"}
                />
                <DashboardMetric
                  label="Risk Score"
                  value={`${riskPercent}/100`}
                  emphasize
                />
              </div>

              <DashboardSection title="Recommended action">
                <div
                  style={{
                    fontSize: 14,
                    lineHeight: 1.55,
                    color: "#e2e8f0",
                  }}
                >
                  {feedbackText}
                </div>
              </DashboardSection>

              <DashboardSection title="Recent alerts">
                <div
                  style={{
                    display: "grid",
                    gap: 8,
                    maxHeight: 220,
                    overflowY: "auto",
                  }}
                >
                  {alerts.length === 0 ? (
                    <div
                      style={{
                        fontSize: 13,
                        color: "#94a3b8",
                      }}
                    >
                      No risk events logged yet.
                    </div>
                  ) : (
                    alerts.map((alert) => {
                      const alertTone = getAssessmentTone(alert.label);

                      return (
                        <div
                          key={alert.id}
                          style={{
                            ...alertTone,
                            borderRadius: 14,
                            padding: 10,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: 10,
                              marginBottom: 4,
                              alignItems: "center",
                            }}
                          >
                            <strong style={{ fontSize: 13 }}>
                              {alert.label}
                            </strong>
                            <span
                              style={{
                                fontSize: 11,
                                opacity: 0.9,
                              }}
                            >
                              {alert.time}
                            </span>
                          </div>

                          <div
                            style={{
                              fontSize: 12,
                              lineHeight: 1.45,
                            }}
                          >
                            {alert.message}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </DashboardSection>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}