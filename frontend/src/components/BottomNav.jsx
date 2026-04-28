import { t } from "../i18n";

export default function BottomNav({ activeTab, onChange, lang }) {
  const tabs = [
    {
      id: "log",
      label: t(lang, "bottomTabLog"),
      icon: "📋",
    },
    {
      id: "home",
      label: t(lang, "bottomTabHome"),
      icon: "⌂",
      primary: true,
    },
    {
      id: "account",
      label: t(lang, "bottomTabAccount"),
      icon: "👤",
    },
  ];

  return (
    <nav
      style={{
        position: "absolute",
        left: 14,
        right: 14,
        bottom: 14,
        height: 74,
        borderRadius: 26,
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        boxShadow: "0 -10px 30px rgba(15, 23, 42, 0.08)",
        display: "grid",
        gridTemplateColumns: "1fr 1.15fr 1fr",
        alignItems: "center",
        padding: "8px 10px",
        zIndex: 20,
      }}
    >
      {tabs.map((tab) => {
        const active = activeTab === tab.id;

        if (tab.primary) {
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                display: "grid",
                justifyItems: "center",
                gap: 5,
                color: active ? "#2563eb" : "#64748b",
                fontWeight: 900,
              }}
            >
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: "50%",
                  background: active
                    ? "linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)"
                    : "#f1f5f9",
                  color: active ? "#ffffff" : "#64748b",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 25,
                  boxShadow: active
                    ? "0 14px 28px rgba(37, 99, 235, 0.3)"
                    : "none",
                  transform: "translateY(-16px)",
                }}
              >
                {tab.icon}
              </div>

              <span
                style={{
                  fontSize: 11,
                  marginTop: -15,
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            style={{
              border: "none",
              background: "transparent",
              cursor: "pointer",
              display: "grid",
              justifyItems: "center",
              gap: 4,
              color: active ? "#2563eb" : "#94a3b8",
              fontWeight: active ? 900 : 700,
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 16,
                background: active ? "#eff6ff" : "transparent",
                display: "grid",
                placeItems: "center",
                fontSize: 20,
              }}
            >
              {tab.icon}
            </div>

            <span style={{ fontSize: 11 }}>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}