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
}) {
  const tone = getAssessmentTone(assessment.label);

  return (
    <div className="panel">
      <h2>Smart Mat Controls</h2>

      <div className="control-block">
        <label htmlFor="size">Foot size scale: {state.size.toFixed(2)}</label>
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
        <label htmlFor="angle">Foot angle: {state.angle}°</label>
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
          Heel pressure: {state.heelPressure.toFixed(0)}
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
          Vehicle speed: {state.carVelocityKph.toFixed(0)} kph
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
        <span>Press active</span>
        <strong>{isPressing ? "YES" : "NO"}</strong>
      </div>

      <div className="status-row">
        <span>Intended pedal</span>
        <strong>{geometry?.intendedPedal?.toUpperCase?.() ?? "-"}</strong>
      </div>

      <div className="status-row">
        <span>Pressed pedal</span>
        <strong>{geometry?.pressedPedal?.toUpperCase?.() ?? "NONE"}</strong>
      </div>

      <div className="control-block">
        <button className="reset-btn" onClick={onReset}>
          Reset foot position
        </button>
      </div>

      <div className="status-card">
        <div
          className={`status-badge ${assessment.label
            .toLowerCase()
            .replace(/\s+/g, "-")}`}
          style={tone}
        >
          {assessment.label}
        </div>
        <p>Risk score: {assessment.riskScore.toFixed(2)}</p>
        <p>
          Inference source:{" "}
          <strong>
            {assessment.source === "model"
              ? "ONNX model"
              : assessment.source === "idle"
              ? "Idle"
              : "Rule-based fallback"}
          </strong>
        </p>
        <p>
          Model status:{" "}
          <strong>
            {modelStatus === "loaded"
              ? "loaded"
              : modelStatus === "fallback"
              ? "not found / using rules"
              : "loading..."}
          </strong>
        </p>
      </div>

      <div className="note-card">
        <h3>How to use</h3>
        <p>Desktop: move the mouse to reposition the foot.</p>
        <p>Desktop: hold the mouse button down to simulate an active press.</p>
        <p>Desktop: scroll over the mat to rotate the foot.</p>
        <p>Mobile: drag with your finger to move the foot.</p>
        <p>Mobile: use the angle slider to rotate the foot.</p>
        <p>Mobile: the foot stays in an active press state automatically.</p>
        <p>The app automatically infers intended and pressed pedal from pose.</p>
        <p>Use heel pressure and vehicle speed sliders to change the input state.</p>
      </div>
    </div>
  );
}