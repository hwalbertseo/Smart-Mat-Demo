import { t } from "../i18n";
import { averageScore, getLatestSession } from "../utils/sessionUtils";

function StatCard({ label, value }) {
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
          fontSize: 22,
          fontWeight: 900,
          color: "#0f172a",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function SettingRow({ title, subtitle, right }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "14px 0",
        borderBottom: "1px solid #f1f5f9",
      }}
    >
      <div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: "#0f172a",
          }}
        >
          {title}
        </div>

        {subtitle && (
          <div
            style={{
              fontSize: 12,
              color: "#64748b",
              marginTop: 3,
              lineHeight: 1.4,
            }}
          >
            {subtitle}
          </div>
        )}
      </div>

      <div>{right}</div>
    </div>
  );
}

function FakeToggle({ active = true }) {
  return (
    <div
      style={{
        width: 46,
        height: 26,
        borderRadius: 999,
        background: active ? "#2563eb" : "#cbd5e1",
        padding: 3,
        display: "flex",
        justifyContent: active ? "flex-end" : "flex-start",
      }}
    >
      <div
        style={{
          width: 20,
          height: 20,
          borderRadius: "50%",
          background: "#ffffff",
          boxShadow: "0 2px 8px rgba(15, 23, 42, 0.18)",
        }}
      />
    </div>
  );
}

export default function AccountPanel({ account, sessions = [], lang = "en" }) {
  const latestSession = getLatestSession(sessions);
  const avgScore = averageScore(sessions);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <section
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: 28,
          padding: 20,
          boxShadow: "0 16px 35px rgba(15, 23, 42, 0.06)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          <div
            style={{
              width: 66,
              height: 66,
              borderRadius: "50%",
              background:
                "linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)",
              display: "grid",
              placeItems: "center",
              color: "#ffffff",
              fontSize: 24,
              fontWeight: 900,
              boxShadow: "0 12px 24px rgba(37, 99, 235, 0.22)",
              overflow: "hidden",
            }}
          >
            {account?.avatar ? (
              <img
                src={account.avatar}
                alt="Profile"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              account?.name?.slice(0, 1) ?? "S"
            )}
          </div>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: 20,
                fontWeight: 900,
                color: "#0f172a",
                lineHeight: 1.15,
              }}
            >
              {account?.name ?? "Demo User"}
            </div>

            <div
              style={{
                fontSize: 13,
                color: "#64748b",
                marginTop: 4,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: 210,
              }}
            >
              {account?.email ?? "demo@solemate.ai"}
            </div>

            <div
              style={{
                marginTop: 8,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 10px",
                borderRadius: 999,
                background: "#eff6ff",
                color: "#1d4ed8",
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              {t(lang, "demoAccount")}
            </div>
          </div>
        </div>
      </section>

      <section
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: 28,
          padding: 20,
          boxShadow: "0 16px 35px rgba(15, 23, 42, 0.06)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            alignItems: "center",
            marginBottom: 14,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 17,
                fontWeight: 900,
                color: "#0f172a",
              }}
            >
              {t(lang, "personalizedAiModel")}
            </div>

            <div
              style={{
                fontSize: 13,
                color: "#64748b",
                marginTop: 4,
                lineHeight: 1.45,
              }}
            >
              {t(lang, "fineTunedWithDrivingData")}
            </div>
          </div>

          <div
            style={{
              fontSize: 26,
              fontWeight: 900,
              color: "#2563eb",
            }}
          >
            {account?.modelFineTunePercent ?? 98}%
          </div>
        </div>

        <div
          style={{
            height: 12,
            borderRadius: 999,
            background: "#e2e8f0",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${account?.modelFineTunePercent ?? 98}%`,
              height: "100%",
              borderRadius: 999,
              background: "linear-gradient(90deg, #2563eb, #38bdf8)",
            }}
          />
        </div>

        <p
          style={{
            margin: "12px 0 0 0",
            fontSize: 13,
            color: "#64748b",
            lineHeight: 1.5,
          }}
        >
          {t(lang, "fineTuneDescription")}
        </p>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        <StatCard label={t(lang, "totalSessions")} value={sessions.length} />
        <StatCard label={t(lang, "averageScore")} value={`${avgScore}/100`} />
        <StatCard
          label={t(lang, "lastSession")}
          value={latestSession?.shortDate ?? "—"}
        />
        <StatCard
          label={t(lang, "lastScore")}
          value={latestSession ? `${latestSession.score}` : "—"}
        />
      </section>

      <section
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: 28,
          padding: "6px 20px",
          boxShadow: "0 16px 35px rgba(15, 23, 42, 0.06)",
        }}
      >
        <SettingRow
          title={t(lang, "drivingAlerts")}
          subtitle={t(lang, "drivingAlertsSubtitle")}
          right={<FakeToggle active />}
        />

        <SettingRow
          title={t(lang, "weeklySafetyReport")}
          subtitle={t(lang, "weeklySafetyReportSubtitle")}
          right={<FakeToggle active />}
        />

        <SettingRow
          title={t(lang, "language")}
          subtitle={t(lang, "languageSubtitle")}
          right={
            <span
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: "#2563eb",
              }}
            >
              {lang === "ko" ? "한국어" : "English"}
            </span>
          }
        />

        <SettingRow
          title={t(lang, "dataSync")}
          subtitle={t(lang, "dataSyncSubtitle")}
          right={<FakeToggle active />}
        />
      </section>
    </div>
  );
}