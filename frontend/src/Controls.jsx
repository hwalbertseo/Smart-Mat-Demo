import {
  t,
  localizeAssessmentLabel,
  localizeBoolean,
  localizeModelStatus,
  localizePedalLabel,
  localizeSourceLabel,
} from "./i18n";

function getAssessmentTone(label) {
  const v = String(label ?? "").toUpperCase();

  if (v === "SAFE") {
    return {
      background: "rgba(34, 197, 94, 0.18)",
      border: "1px solid rgba(34, 197, 94, 0.45)",
      color: "#bbf7d0",
    };
  }

  if (v === "RISK") {
    return {
      background: "rgba(245, 158, 11, 0.18)",
      border: "1px solid rgba(245, 158, 11, 0.45)",
      color: "#fde68a",
    };
  }

  if (v === "MISAPPLICATION") {
    return {
      background: "rgba(239, 68, 68, 0.18)",
      border: "1px solid rgba(239, 68, 68, 0.45)",
      color: "#fecaca",
    };
  }

  return {
    background: "rgba(148, 163, 184, 0.16)",
    border: "1px solid rgba(148, 163, 184, 0.35)",
    color: "#e2e8f0",
  };
}

export default function Controls({
  state,
  setState,
  onReset,
  assessment,
  modelStatus,
  isPressing,
  geometry,
  lang,
}) {
  const tone = getAssessmentTone(assessment.label);
  const tr = (key) => t(lang, key);

  return (
    <div className="panel">
      <h2>{tr("controlsTitle")}</h2>

      <div className="control-block">
        <label htmlFor="size">
          {tr("footSizeScale")}: {state.size.toFixed(2)}
        </label>
        <input
          id="size"
          type="range"
          min="1.0"
          max="1.5"
          step="0.01"
          value={state.size}
          onChange={(e) =>
            setState((prev) => ({ ...prev, size: Number(e.target.value) }))
          }
        />
      </div>

      <div className="control-block">
        <label htmlFor="angle">
          {tr("footAngle")}: {state.angle}°
        </label>
        <input
          id="angle"
          type="range"
          min="-90"
          max="90"
          step="1"
          value={state.angle}
          onChange={(e) =>
            setState((prev) => ({
              ...prev,
              angle: Number(e.target.value),
            }))
          }
        />
      </div>

      <div className="control-block">
        <label htmlFor="heelPressure">
          {tr("heelPressure")}: {state.heelPressure.toFixed(0)}
        </label>
        <input
          id="heelPressure"
          type="range"
          min="0"
          max="100"
          step="1"
          value={state.heelPressure}
          onChange={(e) =>
            setState((prev) => ({
              ...prev,
              heelPressure: Number(e.target.value),
            }))
          }
        />
      </div>

      <div className="control-block">
        <label htmlFor="carVelocityKph">
          {tr("vehicleSpeed")}: {state.carVelocityKph.toFixed(0)} kph
        </label>
        <input
          id="carVelocityKph"
          type="range"
          min="0"
          max="80"
          step="1"
          value={state.carVelocityKph}
          onChange={(e) =>
            setState((prev) => ({
              ...prev,
              carVelocityKph: Number(e.target.value),
            }))
          }
        />
      </div>

      <div className="status-row">
        <span>{tr("pressActive")}</span>
        <strong>{localizeBoolean(lang, isPressing)}</strong>
      </div>

      <div className="status-row">
        <span>{tr("intendedPedal")}</span>
        <strong>
          {geometry?.intendedPedal
            ? localizePedalLabel(lang, geometry.intendedPedal)
            : "-"}
        </strong>
      </div>

      <div className="status-row">
        <span>{tr("pressedPedal")}</span>
        <strong>
          {geometry?.pressedPedal
            ? localizePedalLabel(lang, geometry.pressedPedal)
            : tr("none")}
        </strong>
      </div>

      <div className="control-block">
        <button className="reset-btn" onClick={onReset}>
          {tr("resetFootPosition")}
        </button>
      </div>

      <div className="status-card">
        <div
          className={`status-badge ${String(assessment.label)
            .toLowerCase()
            .replace(/\s+/g, "-")}`}
          style={tone}
        >
          {localizeAssessmentLabel(lang, assessment.label)}
        </div>
        <p>
          {tr("riskScore")}: {assessment.riskScore.toFixed(2)}
        </p>
        <p>
          {tr("inferenceSource")}:{" "}
          <strong>{localizeSourceLabel(lang, assessment.source)}</strong>
        </p>
        <p>
          {tr("modelStatus")}:{" "}
          <strong>{localizeModelStatus(lang, modelStatus)}</strong>
        </p>
      </div>

      <div className="note-card">
        <h3>{tr("howToUse")}</h3>
        <p>{tr("desktopMove1")}</p>
        <p>{tr("desktopMove2")}</p>
        <p>{tr("desktopMove3")}</p>
        <p>{tr("mobileMove1")}</p>
        <p>{tr("mobileMove2")}</p>
        <p>{tr("mobileMove3")}</p>
        <p>{tr("inferNote")}</p>
        <p>{tr("sliderNote")}</p>
      </div>
    </div>
  );
}