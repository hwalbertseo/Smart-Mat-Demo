import { t } from "../i18n";

export default function SiteTabs({ activeTab, onChange, lang }) {
  const tabs = [
    {
      id: "driving",
      label: t(lang, "drivingDemoTab"),
      description: t(lang, "drivingDemoTabDescription"),
    },
    {
      id: "app",
      label: t(lang, "appDemoTab"),
      description: t(lang, "appDemoTabDescription"),
    },
  ];

  return (
    <div
      style={{
        display: "inline-flex",
        padding: 6,
        background: "rgba(15, 23, 42, 0.78)",
        border: "1px solid rgba(148, 163, 184, 0.2)",
        borderRadius: 18,
        gap: 6,
      }}
    >
      {tabs.map((tab) => {
        const active = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            style={{
              border: "none",
              borderRadius: 14,
              padding: "11px 16px",
              cursor: "pointer",
              background: active ? "#2563eb" : "transparent",
              color: active ? "#ffffff" : "#cbd5e1",
              minWidth: 150,
              textAlign: "left",
              boxShadow: active
                ? "0 12px 28px rgba(37, 99, 235, 0.28)"
                : "none",
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 900,
                marginBottom: 3,
              }}
            >
              {tab.label}
            </div>

            <div
              style={{
                fontSize: 11,
                opacity: active ? 0.9 : 0.7,
                lineHeight: 1.3,
              }}
            >
              {tab.description}
            </div>
          </button>
        );
      })}
    </div>
  );
}