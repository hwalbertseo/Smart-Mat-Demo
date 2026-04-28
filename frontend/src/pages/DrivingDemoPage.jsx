import { useEffect, useMemo, useRef, useState } from "react";
import Controls from "../components/Controls";
import MatCanvas from "../components/MatCanvas";
import {
  pedals,
  clampFootCenter,
  rectCenter,
  getFootDimensions,
} from "../pedalGeometry";
import { computeFeatures, ruleBasedAssessment } from "../featureExtractor";
import { loadModel, predictWithMeta } from "../modelRunner";
import {
  t,
  buildFeedbackText,
  getModelScoreCaption,
  localizeAssessmentLabel,
  localizeBoolean,
  localizePedalLabel,
} from "../i18n";

const INITIAL_STATE = {
  footX: 316,
  footY: 376,
  angle: -35,
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

function getAssessmentAccent(label) {
  const v = String(label ?? "").toUpperCase();

  if (v === "SAFE") return "#22c55e";
  if (v === "RISK") return "#f59e0b";
  if (v === "MISAPPLICATION") return "#ef4444";

  return "#94a3b8";
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

function Metric({ label, value }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function LiveAssessmentCard({
  lang,
  assessment,
  feedbackText,
  modelScore,
  modelScoreCaption,
}) {
  const accent = getAssessmentAccent(assessment?.label);

  return (
    <div
      style={{
        background: "rgba(15, 23, 42, 0.78)",
        border: "1px solid rgba(148, 163, 184, 0.18)",
        borderRadius: 24,
        padding: 18,
        color: "#f8fafc",
        display: "grid",
        gap: 14,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              color: "#94a3b8",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              marginBottom: 5,
            }}
          >
            {t(lang, "currentStatus")}
          </div>

          <div
            style={{
              fontSize: 28,
              fontWeight: 950,
              color: accent,
              lineHeight: 1.05,
            }}
          >
            {localizeAssessmentLabel(
              lang,
              assessment?.label ?? "NOT PRESSING"
            )}
          </div>
        </div>

        <div
          style={{
            minWidth: 94,
            textAlign: "right",
          }}
        >
          <div
            style={{
              fontSize: 12,
              color: "#94a3b8",
              fontWeight: 800,
              marginBottom: 4,
            }}
          >
            {t(lang, "modelScore")}
          </div>

          <div
            style={{
              fontSize: 30,
              fontWeight: 950,
              color: "#f8fafc",
              lineHeight: 1,
            }}
          >
            {modelScore}
            <span
              style={{
                fontSize: 14,
                color: "#94a3b8",
                marginLeft: 3,
              }}
            >
              /100
            </span>
          </div>
        </div>
      </div>

      <div
        style={{
          height: 10,
          borderRadius: 999,
          background: "rgba(148, 163, 184, 0.18)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${Math.max(0, Math.min(100, modelScore))}%`,
            height: "100%",
            borderRadius: 999,
            background: accent,
          }}
        />
      </div>

      <div
        style={{
          fontSize: 14,
          color: "#e2e8f0",
          lineHeight: 1.5,
        }}
      >
        {feedbackText}
      </div>

      <div
        style={{
          fontSize: 12,
          color: "#94a3b8",
          lineHeight: 1.45,
        }}
      >
        {modelScoreCaption}
      </div>
    </div>
  );
}

export default function DrivingDemoPage({ lang = "en", setLang }) {
  const [state, setState] = useState(INITIAL_STATE);
  const [isPressing, setIsPressing] = useState(false);
  const [isTouchPrimary, setIsTouchPrimary] = useState(isTouchPrimaryDevice());
  const [modelStatus, setModelStatus] = useState("loading");
  const [assessment, setAssessment] = useState(IDLE_ASSESSMENT);
  const [alerts, setAlerts] = useState([]);

  const lastAlertKeyRef = useRef("");
  const tr = (key) => t(lang, key);

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

  const pressActive = isPressing;

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
        const { logits, meta } = await predictWithMeta(featureResult.features);
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
    return buildFeedbackText(lang, {
      label: assessment?.label,
      pressedPedal: geometry?.pressedPedal,
      intendedPedal: geometry?.intendedPedal,
      speed: features?.car_velocity_kph,
    });
  }, [
    lang,
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
      pressedPedal: geometry?.pressedPedal,
      intendedPedal: geometry?.intendedPedal,
      speed: features?.car_velocity_kph,
    };

    setAlerts((prev) => [nextAlert, ...prev].slice(0, 8));
  }, [
    pressActive,
    assessment?.label,
    assessment?.riskScore,
    geometry?.pressedPedal,
    geometry?.intendedPedal,
    features?.car_velocity_kph,
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

  const modelScoreCaption = getModelScoreCaption(lang, assessment?.source);

  return (
    <div className="app-shell">
      <div className="header">
        <div>
          <h1>{tr("appTitle")}</h1>
          <p>{tr("appSubtitle")}</p>
        </div>

        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ color: "#cbd5e1", fontSize: 14 }}>
            {tr("language")}
          </span>

          <button
            onClick={() => setLang("ko")}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid rgba(148,163,184,0.25)",
              background: lang === "ko" ? "#2563eb" : "#0f172a",
              color: "#f8fafc",
              cursor: "pointer",
            }}
          >
            한국어
          </button>

          <button
            onClick={() => setLang("en")}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid rgba(148,163,184,0.25)",
              background: lang === "en" ? "#2563eb" : "#0f172a",
              color: "#f8fafc",
              cursor: "pointer",
            }}
          >
            EN
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gap: 18,
          alignItems: "start",
        }}
      >
        <MatCanvas
          state={state}
          setState={setState}
          assessment={assessment}
          geometry={geometry}
          isPressing={pressActive}
          setIsPressing={setIsPressing}
          isTouchPrimary={isTouchPrimary}
          lang={lang}
        />

        <LiveAssessmentCard
          lang={lang}
          assessment={assessment}
          feedbackText={feedbackText}
          modelScore={modelScore}
          modelScoreCaption={modelScoreCaption}
        />

        <Controls
          state={state}
          setState={setState}
          onReset={resetFoot}
          assessment={assessment}
          modelStatus={modelStatus}
          isPressing={pressActive}
          geometry={geometry}
          lang={lang}
        />

        <div className="metrics-row">
          <Metric
            label={tr("intendedPedal")}
            value={
              geometry?.intendedPedal
                ? localizePedalLabel(lang, geometry.intendedPedal)
                : "-"
            }
          />

          <Metric
            label={tr("pressedPedal")}
            value={
              geometry?.pressedPedal
                ? localizePedalLabel(lang, geometry.pressedPedal)
                : tr("none")
            }
          />

          <Metric
            label={tr("vehicleSpeed")}
            value={`${formatMetric(features?.car_velocity_kph, 0)} kph`}
          />

          <Metric
            label={tr("heelPressure")}
            value={formatMetric(features?.heel_pressure, 0)}
          />

          <Metric
            label={tr("heelAnchorDx")}
            value={formatMetric(features?.heel_anchor_dx, 3)}
          />

          <Metric
            label={tr("heelAnchorDy")}
            value={formatMetric(features?.heel_anchor_dy, 3)}
          />

          <Metric
            label={tr("pressActive")}
            value={localizeBoolean(lang, pressActive)}
          />
        </div>

        {alerts.length > 0 && (
          <div
            style={{
              background: "rgba(15, 23, 42, 0.78)",
              border: "1px solid rgba(148, 163, 184, 0.18)",
              borderRadius: 24,
              padding: 18,
              color: "#f8fafc",
            }}
          >
            <h2
              style={{
                margin: "0 0 12px 0",
                fontSize: 18,
                fontWeight: 900,
              }}
            >
              {tr("recentAlerts")}
            </h2>

            <div style={{ display: "grid", gap: 10 }}>
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  style={{
                    borderRadius: 16,
                    padding: 12,
                    background:
                      alert.label === "MISAPPLICATION"
                        ? "rgba(239, 68, 68, 0.15)"
                        : "rgba(245, 158, 11, 0.15)",
                    border:
                      alert.label === "MISAPPLICATION"
                        ? "1px solid rgba(239, 68, 68, 0.35)"
                        : "1px solid rgba(245, 158, 11, 0.35)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                      marginBottom: 5,
                    }}
                  >
                    <strong>
                      {localizeAssessmentLabel(lang, alert.label)}
                    </strong>
                    <span style={{ color: "#94a3b8", fontSize: 12 }}>
                      {alert.time}
                    </span>
                  </div>

                  <div
                    style={{
                      color: "#e2e8f0",
                      fontSize: 13,
                      lineHeight: 1.45,
                    }}
                  >
                    {buildFeedbackText(lang, {
                      label: alert.label,
                      pressedPedal: alert.pressedPedal,
                      intendedPedal: alert.intendedPedal,
                      speed: alert.speed,
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}