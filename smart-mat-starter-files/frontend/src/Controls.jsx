export default function Controls({
  state,
  setState,
  onReset,
  assessment,
  modelStatus,
}) {
  return (
    <div className="panel">
      <h2>Smart Mat Controls</h2>

      <div className="control-block">
        <label htmlFor="intended">Intended pedal</label>
        <select
          id="intended"
          value={state.intendedPedal}
          onChange={(e) =>
            setState((prev) => ({ ...prev, intendedPedal: e.target.value }))
          }
        >
          <option value="brake">Brake</option>
          <option value="accel">Accelerator</option>
        </select>
      </div>

      <div className="control-block">
        <label htmlFor="angle">Foot angle: {state.angle}°</label>
        <input
          id="angle"
          type="range"
          min="-60"
          max="60"
          step="1"
          value={state.angle}
          onChange={(e) =>
            setState((prev) => ({ ...prev, angle: Number(e.target.value) }))
          }
        />
      </div>

      <div className="control-block">
        <label htmlFor="size">Foot size scale: {state.size.toFixed(2)}</label>
        <input
          id="size"
          type="range"
          min="0.70"
          max="1.35"
          step="0.01"
          value={state.size}
          onChange={(e) =>
            setState((prev) => ({ ...prev, size: Number(e.target.value) }))
          }
        />
      </div>

      <div className="control-check">
        <input
          id="mouseFollow"
          type="checkbox"
          checked={state.mouseFollow}
          onChange={(e) =>
            setState((prev) => ({ ...prev, mouseFollow: e.target.checked }))
          }
        />
        <label htmlFor="mouseFollow">Mouse-follow mode</label>
      </div>

      <div className="control-block">
        <button className="reset-btn" onClick={onReset}>
          Reset foot position
        </button>
      </div>

      <div className="status-card">
        <div className={`status-badge ${assessment.label.toLowerCase()}`}>
          {assessment.label}
        </div>
        <p>Risk score: {assessment.riskScore.toFixed(2)}</p>
        <p>
          Inference source:{" "}
          <strong>{assessment.source === "model" ? "ONNX model" : "Rule-based fallback"}</strong>
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
        <p>Drag the foot around, or turn on mouse-follow mode.</p>
        <p>
          The app converts the foot state into a small feature vector and predicts
          a live pedal-misapplication risk.
        </p>
      </div>
    </div>
  );
}
