import { localizeAssessmentLabel } from "../i18n";
import { localizedText } from "../utils/sessionUtils";

function getScoreStyle(score) {
  if (score >= 90) {
    return {
      background: "#dcfce7",
      color: "#166534",
      border: "1px solid #bbf7d0",
    };
  }

  if (score >= 75) {
    return {
      background: "#fef3c7",
      color: "#92400e",
      border: "1px solid #fde68a",
    };
  }

  return {
    background: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fecaca",
  };
}

export default function SessionList({ sessions = [], onSelect, lang = "en" }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {sessions.map((session) => {
        const scoreStyle = getScoreStyle(session.score);

        return (
          <button
            key={session.id}
            type="button"
            onClick={() => onSelect?.(session)}
            style={{
              width: "100%",
              border: "1px solid #e5e7eb",
              background: "#ffffff",
              borderRadius: 24,
              padding: 16,
              cursor: "pointer",
              textAlign: "left",
              boxShadow: "0 12px 26px rgba(15, 23, 42, 0.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 14,
                alignItems: "center",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 900,
                    color: "#0f172a",
                    marginBottom: 4,
                  }}
                >
                  {localizedText(session.title, lang)}
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: "#64748b",
                    marginBottom: 8,
                  }}
                >
                  {session.date}
                </div>

                <div
                  style={{
                    fontSize: 13,
                    color: "#334155",
                    lineHeight: 1.45,
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {localizedText(session.summary, lang)}
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  justifyItems: "end",
                  gap: 8,
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    ...scoreStyle,
                    minWidth: 58,
                    height: 58,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 20,
                    fontWeight: 950,
                  }}
                >
                  {session.score}
                </div>

                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 900,
                    color: "#64748b",
                  }}
                >
                  {localizeAssessmentLabel(lang, session.safetyLabel)}
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}