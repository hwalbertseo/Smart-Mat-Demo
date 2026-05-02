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
        minWidth: 0,
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: "#64748b",
          fontWeight: 700,
          marginBottom: 6,
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 22,
          fontWeight: 900,
          color: "#0f172a",
          minWidth: 0,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
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
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
        padding: "14px 0",
        borderBottom: "1px solid #f1f5f9",
        minWidth: 0,
        maxWidth: "100%",
      }}
    >
      <div
        style={{
          flex: "1 1 auto",
          minWidth: 0,
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: "#0f172a",
            minWidth: 0,
            overflowWrap: "anywhere",
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
              minWidth: 0,
              overflowWrap: "anywhere",
            }}
          >
            {subtitle}
          </div>
        )}
      </div>

      <div
        style={{
          flexShrink: 0,
        }}
      >
        {right}
      </div>
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
        flexShrink: 0,
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

function DriverSwitchCard({ candidate, active, onClick, lang }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        border: active ? "2px solid #2563eb" : "1px solid #e5e7eb",
        background: active ? "#eff6ff" : "#ffffff",
        borderRadius: 18,
        padding: "12px 14px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        cursor: "pointer",
        textAlign: "left",
        transition: "all 0.15s ease",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flex: "1 1 auto",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)",
            display: "grid",
            placeItems: "center",
            color: "#ffffff",
            fontSize: 16,
            fontWeight: 900,
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          {candidate?.avatar ? (
            <img
              src={candidate.avatar}
              alt="Driver"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            candidate?.name?.slice(0, 1) ?? "D"
          )}
        </div>

        <div
          style={{
            flex: "1 1 auto",
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 900,
              color: "#0f172a",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {candidate?.name ?? "Driver"}
          </div>

          <div
            style={{
              fontSize: 12,
              color: "#64748b",
              marginTop: 3,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {candidate?.email ?? ""}
          </div>
        </div>
      </div>

      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          color: active ? "#2563eb" : "#94a3b8",
          flexShrink: 0,
          marginLeft: 4,
          whiteSpace: "nowrap",
        }}
      >
        {active
          ? lang === "ko"
            ? "현재 사용 중"
            : "Active"
          : lang === "ko"
          ? "전환"
          : "Switch"}
      </div>
    </button>
  );
}

function SectionCard({ children, padding = 20 }) {
  return (
    <section
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 28,
        padding,
        boxShadow: "0 16px 35px rgba(15, 23, 42, 0.06)",
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        overflow: "hidden",
      }}
    >
      {children}
    </section>
  );
}

export default function AccountPanel({
  account,
  accounts = [],
  sessions = [],
  lang = "en",
  onSwitchAccount,
}) {
  const latestSession = getLatestSession(sessions);
  const avgScore = averageScore(sessions);

  return (
    <div
      style={{
        display: "grid",
        gap: 18,
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        overflowX: "hidden",
      }}
    >
      <SectionCard>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            minWidth: 0,
            maxWidth: "100%",
          }}
        >
          <div
            style={{
              width: 66,
              height: 66,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)",
              display: "grid",
              placeItems: "center",
              color: "#ffffff",
              fontSize: 24,
              fontWeight: 900,
              boxShadow: "0 12px 24px rgba(37, 99, 235, 0.22)",
              overflow: "hidden",
              flexShrink: 0,
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

          <div
            style={{
              flex: "1 1 auto",
              minWidth: 0,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                fontSize: 20,
                fontWeight: 900,
                color: "#0f172a",
                lineHeight: 1.15,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
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
                maxWidth: "100%",
              }}
            >
              {t(lang, "demoAccount")}
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <div
          style={{
            fontSize: 16,
            fontWeight: 900,
            color: "#0f172a",
            marginBottom: 8,
            minWidth: 0,
            overflowWrap: "anywhere",
          }}
        >
          {lang === "ko" ? "드라이버 전환" : "Switch Driver"}
        </div>

        <div
          style={{
            fontSize: 13,
            color: "#64748b",
            lineHeight: 1.45,
            marginBottom: 14,
            minWidth: 0,
            overflowWrap: "anywhere",
          }}
        >
          {lang === "ko"
            ? "공유 차량에서도 빠르게 운전자 프로필을 바꿀 수 있습니다."
            : "Quickly switch driver profiles for shared vehicle use."}
        </div>

        <div
          style={{
            display: "grid",
            gap: 10,
            width: "100%",
            minWidth: 0,
          }}
        >
          {accounts.map((candidate) => {
            const active = candidate.id === account?.id;

            return (
              <DriverSwitchCard
                key={candidate.id}
                candidate={candidate}
                active={active}
                lang={lang}
                onClick={() => onSwitchAccount?.(candidate.id)}
              />
            );
          })}
        </div>
      </SectionCard>

      <SectionCard>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            alignItems: "center",
            marginBottom: 14,
            minWidth: 0,
          }}
        >
          <div
            style={{
              flex: "1 1 auto",
              minWidth: 0,
            }}
          >
            <div
              style={{
                fontSize: 17,
                fontWeight: 900,
                color: "#0f172a",
                overflowWrap: "anywhere",
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
                overflowWrap: "anywhere",
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
              flexShrink: 0,
              whiteSpace: "nowrap",
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
            minWidth: 0,
            overflowWrap: "anywhere",
          }}
        >
          {t(lang, "fineTuneDescription")}
        </p>
      </SectionCard>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 12,
          width: "100%",
          maxWidth: "100%",
          minWidth: 0,
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

      <SectionCard padding="6px 20px">
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
                whiteSpace: "nowrap",
                flexShrink: 0,
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
      </SectionCard>
    </div>
  );
}