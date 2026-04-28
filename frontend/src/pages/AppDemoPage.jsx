import { useMemo, useState } from "react";
import PhoneShell from "../components/PhoneShell";
import SpeedometerGauge from "../components/SpeedometerGauge";
import SessionList from "../components/SessionList";
import SessionDetailModal from "../components/SessionDetailModal";
import AccountPanel from "../components/AccountPanel";
import { demoAccount } from "../data/demoAccount";
import { demoSessions } from "../data/demoSessions";
import {
  averageScore,
  getLatestSession,
  localizedText,
  localizedList,
} from "../utils/sessionUtils";
import { t } from "../i18n";

function InfoCard({ title, children, action }) {
  return (
    <section
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 28,
        padding: 18,
        boxShadow: "0 16px 35px rgba(15, 23, 42, 0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 14,
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: 17,
            fontWeight: 950,
            color: "#0f172a",
            letterSpacing: "-0.03em",
          }}
        >
          {title}
        </h3>

        {action}
      </div>

      {children}
    </section>
  );
}

function SmallMetric({ label, value }) {
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
          fontSize: 21,
          fontWeight: 950,
          color: "#0f172a",
          letterSpacing: "-0.03em",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function HomeTab({ account, sessions, onOpenSession, onGoLog, lang }) {
  const latestSession = getLatestSession(sessions);
  const avgScore = averageScore(sessions);
  const latestFeedback = localizedList(latestSession?.feedback, lang);

  return (
    <div style={{ display: "grid", gap: 18 }}>
      <div
        style={{
          background:
            "linear-gradient(135deg, #eff6ff 0%, #ffffff 52%, #f0fdfa 100%)",
          border: "1px solid #e5e7eb",
          borderRadius: 30,
          padding: 20,
          boxShadow: "0 16px 35px rgba(15, 23, 42, 0.06)",
        }}
      >
        <div
          style={{
            fontSize: 13,
            color: "#64748b",
            fontWeight: 700,
            marginBottom: 4,
          }}
        >
          {t(lang, "welcomeBack")}
        </div>

        <div
          style={{
            fontSize: 25,
            color: "#0f172a",
            fontWeight: 950,
            letterSpacing: "-0.04em",
          }}
        >
          {account.name}
        </div>

        <p
          style={{
            margin: "8px 0 0 0",
            color: "#475569",
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          {t(lang, "homeIntro")}
        </p>
      </div>

      <SpeedometerGauge score={latestSession?.score ?? avgScore} lang={lang} />

      <InfoCard title={t(lang, "personalizedAiModel")}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              fontSize: 38,
              fontWeight: 950,
              color: "#2563eb",
              letterSpacing: "-0.06em",
              lineHeight: 1,
            }}
          >
            {account.modelFineTunePercent}%
          </div>

          <div
            style={{
              fontSize: 13,
              color: "#475569",
              lineHeight: 1.45,
            }}
          >
            {t(lang, "fineTunedWithDrivingData")}
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
              width: `${account.modelFineTunePercent}%`,
              height: "100%",
              borderRadius: 999,
              background: "linear-gradient(90deg, #2563eb, #38bdf8)",
            }}
          />
        </div>
      </InfoCard>

      <InfoCard
        title={t(lang, "lastDrivingSession")}
        action={
          <button
            type="button"
            onClick={() => latestSession && onOpenSession(latestSession)}
            style={{
              border: "none",
              background: "#eff6ff",
              color: "#2563eb",
              fontWeight: 900,
              fontSize: 12,
              borderRadius: 999,
              padding: "8px 11px",
              cursor: "pointer",
            }}
          >
            {t(lang, "report")}
          </button>
        }
      >
        {latestSession ? (
          <button
            type="button"
            onClick={() => onOpenSession(latestSession)}
            style={{
              width: "100%",
              border: "none",
              background: "transparent",
              padding: 0,
              textAlign: "left",
              cursor: "pointer",
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
              <div>
                <div
                  style={{
                    color: "#0f172a",
                    fontWeight: 900,
                    fontSize: 15,
                    marginBottom: 4,
                  }}
                >
                  {localizedText(latestSession.title, lang)}
                </div>

                <div
                  style={{
                    color: "#64748b",
                    fontSize: 12,
                    marginBottom: 8,
                  }}
                >
                  {latestSession.date}
                </div>

                <div
                  style={{
                    color: "#334155",
                    fontSize: 13,
                    lineHeight: 1.45,
                  }}
                >
                  {localizedText(latestSession.summary, lang)}
                </div>
              </div>

              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: "50%",
                  background:
                    latestSession.score >= 90
                      ? "#dcfce7"
                      : latestSession.score >= 75
                      ? "#fef3c7"
                      : "#fee2e2",
                  color:
                    latestSession.score >= 90
                      ? "#166534"
                      : latestSession.score >= 75
                      ? "#92400e"
                      : "#991b1b",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 20,
                  fontWeight: 950,
                  flexShrink: 0,
                }}
              >
                {latestSession.score}
              </div>
            </div>
          </button>
        ) : (
          <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>
            {t(lang, "noDrivingSessions")}
          </p>
        )}
      </InfoCard>

      <InfoCard
        title={t(lang, "aiFeedback")}
        action={
          <button
            type="button"
            onClick={onGoLog}
            style={{
              border: "none",
              background: "transparent",
              color: "#2563eb",
              fontWeight: 900,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            {t(lang, "viewAll")}
          </button>
        }
      >
        <div style={{ display: "grid", gap: 10 }}>
          {latestFeedback.slice(0, 3).map((item, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
                color: "#334155",
                fontSize: 13,
                lineHeight: 1.5,
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
                  fontWeight: 950,
                  fontSize: 12,
                }}
              >
                {index + 1}
              </span>

              <span>{item}</span>
            </div>
          ))}
        </div>
      </InfoCard>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        <SmallMetric label={t(lang, "averageScore")} value={`${avgScore}/100`} />
        <SmallMetric label={t(lang, "sessions")} value={sessions.length} />
      </div>
    </div>
  );
}

function LogTab({ sessions, onSelect, lang }) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section
        style={{
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: 28,
          padding: 18,
          boxShadow: "0 16px 35px rgba(15, 23, 42, 0.06)",
        }}
      >
        <h3
          style={{
            margin: "0 0 6px 0",
            fontSize: 18,
            fontWeight: 950,
            color: "#0f172a",
            letterSpacing: "-0.03em",
          }}
        >
          {t(lang, "drivingSessionLog")}
        </h3>

        <p
          style={{
            margin: 0,
            fontSize: 13,
            color: "#64748b",
            lineHeight: 1.5,
          }}
        >
          {t(lang, "sessionLogIntro")}
        </p>
      </section>

      <SessionList sessions={sessions} onSelect={onSelect} lang={lang} />
    </div>
  );
}

export default function AppDemoPage({ lang = "en" }) {
  const [activeTab, setActiveTab] = useState("home");
  const [selectedSession, setSelectedSession] = useState(null);

  const title = useMemo(() => {
    if (activeTab === "log") return t(lang, "sessionLog");
    if (activeTab === "account") return t(lang, "account");
    return t(lang, "mobileAppTitle");
  }, [activeTab, lang]);

  const subtitle = useMemo(() => {
    if (activeTab === "log") return t(lang, "savedDrivingReports");
    if (activeTab === "account") return t(lang, "profileAndPersonalization");
    return t(lang, "mobileAppSubtitle");
  }, [activeTab, lang]);

  return (
    <div
      style={{
        minHeight: "calc(100vh - 120px)",
        display: "grid",
        placeItems: "center",
        padding: "24px 16px 40px 16px",
      }}
    >
      <PhoneShell
        activeTab={activeTab}
        onTabChange={setActiveTab}
        title={title}
        subtitle={subtitle}
        lang={lang}
      >
        {activeTab === "home" && (
          <HomeTab
            account={demoAccount}
            sessions={demoSessions}
            onOpenSession={setSelectedSession}
            onGoLog={() => setActiveTab("log")}
            lang={lang}
          />
        )}

        {activeTab === "log" && (
          <LogTab
            sessions={demoSessions}
            onSelect={setSelectedSession}
            lang={lang}
          />
        )}

        {activeTab === "account" && (
          <AccountPanel
            account={demoAccount}
            sessions={demoSessions}
            lang={lang}
          />
        )}

        <SessionDetailModal
          session={selectedSession}
          onClose={() => setSelectedSession(null)}
          lang={lang}
        />
      </PhoneShell>
    </div>
  );
}