import { t, localizeAssessmentLabel } from "../i18n";
import { localizedText, localizedList } from "../utils/sessionUtils";

function scoreColor(score) {
  if (score >= 90) return "#16a34a";
  if (score >= 75) return "#f59e0b";
  return "#ef4444";
}

function DetailMetric({ label, value }) {
  return (
    <div
      style={{
        background: "#f8fafc",
        border: "1px solid #e5e7eb",
        borderRadius: 18,
        padding: 14,
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: "#64748b",
          fontWeight: 700,
          marginBottom: 6,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 20,
          fontWeight: 900,
          color: "#0f172a",
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default function SessionDetailModal({ session, onClose, lang = "en" }) {
  if (!session) return null;

  const color = scoreColor(session.score);
  const feedback = localizedList(session.feedback, lang);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(15, 23, 42, 0.32)",
        backdropFilter: "blur(5px)",
        zIndex: 40,
        display: "flex",
        alignItems: "flex-end",
      }}
      onClick={onClose}
    >
      <section
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxHeight: "88%",
          overflowY: "auto",
          background: "#ffffff",
          borderTopLeftRadius: 32,
          borderTopRightRadius: 32,
          padding: "18px 20px 28px 20px",
          boxShadow: "0 -20px 50px rgba(15, 23, 42, 0.2)",
        }}
      >
        <div
          style={{
            width: 52,
            height: 5,
            borderRadius: 999,
            background: "#cbd5e1",
            margin: "0 auto 18px auto",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 14,
            marginBottom: 18,
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                color: "#0f172a",
                fontSize: 23,
                letterSpacing: "-0.04em",
              }}
            >
              {t(lang, "drivingReport")}
            </h2>

            <p
              style={{
                margin: "6px 0 0 0",
                color: "#64748b",
                fontSize: 13,
              }}
            >
              {session.date}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              border: "none",
              background: "#f1f5f9",
              color: "#334155",
              borderRadius: 14,
              width: 38,
              height: 38,
              cursor: "pointer",
              fontWeight: 900,
              fontSize: 18,
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            borderRadius: 26,
            padding: 20,
            background: "#f8fafc",
            border: "1px solid #e5e7eb",
            marginBottom: 16,
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
                  color: "#64748b",
                  fontSize: 12,
                  fontWeight: 800,
                  marginBottom: 5,
                }}
              >
                {t(lang, "overallScore")}
              </div>

              <div
                style={{
                  color,
                  fontSize: 48,
                  fontWeight: 950,
                  lineHeight: 1,
                  letterSpacing: "-0.06em",
                }}
              >
                {session.score}
              </div>
            </div>

            <div
              style={{
                padding: "8px 12px",
                borderRadius: 999,
                background:
                  session.safetyLabel === "SAFE"
                    ? "#dcfce7"
                    : session.safetyLabel === "RISK"
                    ? "#fef3c7"
                    : "#fee2e2",
                color:
                  session.safetyLabel === "SAFE"
                    ? "#166534"
                    : session.safetyLabel === "RISK"
                    ? "#92400e"
                    : "#991b1b",
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              {localizeAssessmentLabel(lang, session.safetyLabel)}
            </div>
          </div>

          <p
            style={{
              margin: "14px 0 0 0",
              fontSize: 14,
              lineHeight: 1.55,
              color: "#334155",
            }}
          >
            {localizedText(session.summary, lang)}
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 16,
          }}
        >
          <DetailMetric
            label={t(lang, "modelConfidence")}
            value={`${session.detailedReport?.modelConfidence ?? 98}%`}
          />
          <DetailMetric
            label={t(lang, "brakeAccuracy")}
            value={`${session.detailedReport?.brakingAccuracy ?? 94}%`}
          />
          <DetailMetric
            label={t(lang, "accelAccuracy")}
            value={`${session.detailedReport?.accelAccuracy ?? 91}%`}
          />
          <DetailMetric
            label={t(lang, "heelStability")}
            value={`${session.detailedReport?.heelStability ?? 90}%`}
          />
        </div>

        <div
          style={{
            background: "#ffffff",
            border: "1px solid #e5e7eb",
            borderRadius: 24,
            padding: 18,
          }}
        >
          <div
            style={{
              fontSize: 16,
              fontWeight: 900,
              color: "#0f172a",
              marginBottom: 12,
            }}
          >
            {t(lang, "aiFeedback")}
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {feedback.map((item, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                  fontSize: 14,
                  lineHeight: 1.5,
                  color: "#334155",
                }}
              >
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "#eff6ff",
                    color: "#2563eb",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                    fontSize: 12,
                    fontWeight: 900,
                  }}
                >
                  {index + 1}
                </span>

                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}