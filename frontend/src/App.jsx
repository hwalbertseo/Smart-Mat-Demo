import { useEffect, useState } from "react";
import SiteTabs from "./components/SiteTabs";
import DrivingDemoPage from "./pages/DrivingDemoPage";
import AppDemoPage from "./pages/AppDemoPage";
import { t } from "./i18n";
import "./App.css";

function getInitialLanguage() {
  if (typeof window === "undefined") return "ko";

  const saved = window.localStorage.getItem("solemate_lang");
  if (saved === "ko" || saved === "en") return saved;

  return window.navigator.language?.startsWith("ko") ? "ko" : "en";
}

export default function App() {
  const [activeTab, setActiveTab] = useState("driving");
  const [lang, setLang] = useState(getInitialLanguage);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("solemate_lang", lang);
    }

    if (typeof document !== "undefined") {
      document.title = t(lang, "siteTitle");
    }
  }, [lang]);

  return (
    <div className="site-shell">
      <div className="site-topbar">
        <div>
          <div className="site-kicker">{t(lang, "siteKicker")}</div>
          <h1 className="site-title">{t(lang, "siteTitle")}</h1>
          <p className="site-subtitle">{t(lang, "siteSubtitle")}</p>
        </div>

        <SiteTabs activeTab={activeTab} onChange={setActiveTab} lang={lang} />
      </div>

      {activeTab === "driving" && (
        <DrivingDemoPage lang={lang} setLang={setLang} />
      )}

      {activeTab === "app" && <AppDemoPage lang={lang} />}
    </div>
  );
}