import BottomNav from "./BottomNav";

export default function PhoneShell({
  activeTab,
  onTabChange,
  title,
  subtitle,
  children,
  lang,
}) {
  return (
    <div
      style={{
        width: "min(390px, 100%)",
        height: 760,
        borderRadius: 42,
        background: "#0f172a",
        padding: 12,
        boxShadow: "0 30px 80px rgba(15, 23, 42, 0.28)",
        border: "1px solid rgba(15, 23, 42, 0.18)",
        position: "relative",
      }}
    >
      <div
        style={{
          height: "100%",
          borderRadius: 34,
          overflow: "hidden",
          background: "#f8fafc",
          position: "relative",
        }}
      >
        <div
          style={{
            height: 28,
            display: "grid",
            placeItems: "center",
            background: "#ffffff",
          }}
        >
          <div
            style={{
              width: 86,
              height: 6,
              borderRadius: 999,
              background: "#0f172a",
              opacity: 0.9,
            }}
          />
        </div>

        <header
          style={{
            background: "#ffffff",
            padding: "16px 22px 14px 22px",
            borderBottom: "1px solid #eef2f7",
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 950,
              color: "#0f172a",
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
            }}
          >
            {title}
          </div>

          {subtitle && (
            <div
              style={{
                marginTop: 6,
                fontSize: 13,
                color: "#64748b",
                lineHeight: 1.4,
              }}
            >
              {subtitle}
            </div>
          )}
        </header>

        <main
          style={{
            height: "calc(100% - 28px - 86px)",
            overflowY: "auto",
            padding: "18px 18px 108px 18px",
          }}
        >
          {children}
        </main>

        <BottomNav activeTab={activeTab} onChange={onTabChange} lang={lang} />
      </div>
    </div>
  );
}