import React from "react";

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

function formatValue(value, fallback = "-") {
  if (value == null || Number.isNaN(value)) return fallback;
  return value;
}

function SectionCard({ title, children }) {
  return (
    <div
      style={{
        background: "rgba(15, 23, 42, 0.72)",
        border: "1px solid rgba(148, 163, 184, 0.18)",
        borderRadius: 18,
        padding: 14,
        boxShadow: "0 12px 28px rgba(0,0,0,0.24)",
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: "#cbd5e1",
          marginBottom: 10,
          letterSpacing: "0.02em",
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function MetricTile({ label, value, accent }) {
  return (
    <div
      style={{
        background: "rgba(30, 41, 59, 0.9)",
        border: `1px solid ${accent ?? "rgba(148, 163, 184, 0.20)"}`,
        borderRadius: 14,
        padding: "10px 12px",
      }}
    >
      <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: "#f8fafc" }}>
        {value}
      </div>
    </div>
  );
}

export default function AppDashboard({
  connected = true,
  assessment,
  speed,
  pressedPedal,
  intendedPedal,
  features,
  alerts,
  feedbackText,
}) {
  const tone = getAssessmentTone(assessment?.label);
  const riskPercent = Math.round((assessment?.riskScore ?? 0) * 100);

  return (
    <div
      style={{
        width: 360,
        minWidth: 320,
        maxWidth: 380,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          borderRadius: 28,
          padding: 14,
          background:
            "linear-gradient(180deg, rgba(15,23,42,0.98) 0%, rgba(2,6,23,0.98) 100%)",
          border: "1px solid rgba(148, 163, 184, 0.20)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
          color: "#f8fafc",
        }}
      >
        <div
          style={{
            width: 90,
            height: 6,
            borderRadius: 999,
            background: "rgba(148, 163, 184, 0.32)",
            margin: "2px auto 14px auto",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>Driver Feedback</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
              Live mobile app preview
            </div>
          </div>

          <div
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 700,
              color: connected ? "#bbf7d0" : "#fecaca",
              background: connected
                ? "rgba(34, 197, 94, 0.14)"
                : "rgba(239, 68, 68, 0.14)",
              border: connected
                ? "1px solid rgba(34, 197, 94, 0.35)"
                : "1px solid rgba(239, 68, 68, 0.35)",
            }}
          >
            {connected ? "Connected" : "Disconnected"}
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
          <div style={{ fontSize: 12, opacity: 0.9, marginBottom: 6 }}>
            Current status
          </div>
          <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
            {assessment?.label ?? "NOT PRESSING"}
          </div>
          <div style={{ fontSize: 13, lineHeight: 1.45 }}>
            {feedbackText}
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 14,
          }}
        >
          <MetricTile
            label="Risk Score"
            value={`${riskPercent}%`}
            accent="rgba(245, 158, 11, 0.30)"
          />
          <MetricTile
            label="Vehicle Speed"
            value={`${formatValue(speed, 0)} km/h`}
            accent="rgba(59, 130, 246, 0.30)"
          />
          <MetricTile
            label="Pressed Pedal"
            value={String(pressedPedal ?? "none").toUpperCase()}
            accent="rgba(168, 85, 247, 0.30)"
          />
          <MetricTile
            label="Intent"
            value={String(intendedPedal ?? "unknown").toUpperCase()}
            accent="rgba(34, 197, 94, 0.30)"
          />
        </div>

        <div
          style={{
            display: "grid",
            gap: 14,
          }}
        >
          <SectionCard title="Telemetry">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
              }}
            >
              <MetricTile
                label="Heel X"
                value={Number.isFinite(features?.heel_x) ? features.heel_x.toFixed(2) : "-"}
              />
              <MetricTile
                label="Heel Y"
                value={Number.isFinite(features?.heel_y) ? features.heel_y.toFixed(2) : "-"}
              />
              <MetricTile
                label="Foot Angle"
                value={Number.isFinite(features?.foot_angle_deg) ? `${features.foot_angle_deg.toFixed(0)}°` : "-"}
              />
              <MetricTile
                label="Foot Size"
                value={Number.isFinite(features?.foot_size) ? features.foot_size.toFixed(2) : "-"}
              />
            </div>
          </SectionCard>

          <SectionCard title="Recommended Action">
            <div
              style={{
                color: "#e2e8f0",
                fontSize: 14,
                lineHeight: 1.55,
              }}
            >
              {feedbackText}
            </div>
          </SectionCard>

          <SectionCard title="Recent Alerts">
            <div
              style={{
                display: "grid",
                gap: 8,
                maxHeight: 180,
                overflowY: "auto",
              }}
            >
              {(alerts ?? []).length === 0 ? (
                <div style={{ color: "#94a3b8", fontSize: 13 }}>
                  No alerts yet.
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
                        }}
                      >
                        <strong style={{ fontSize: 13 }}>{alert.label}</strong>
                        <span style={{ fontSize: 11, opacity: 0.9 }}>
                          {alert.time}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, lineHeight: 1.45 }}>
                        {alert.message}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}