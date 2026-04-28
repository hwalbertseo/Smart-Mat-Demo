export function getLatestSession(sessions = []) {
  if (!Array.isArray(sessions) || sessions.length === 0) return null;

  return [...sessions].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  })[0];
}

export function averageScore(sessions = []) {
  if (!Array.isArray(sessions) || sessions.length === 0) return 0;

  const total = sessions.reduce((sum, session) => {
    return sum + Number(session.score ?? 0);
  }, 0);

  return Math.round(total / sessions.length);
}

export function getSafetyLabelFromScore(score) {
  if (score >= 90) return "SAFE";
  if (score >= 75) return "RISK";
  return "MISAPPLICATION";
}

export function getScoreColor(score) {
  if (score >= 90) return "#16a34a";
  if (score >= 75) return "#f59e0b";
  return "#ef4444";
}

export function getScoreBackground(score) {
  if (score >= 90) return "#dcfce7";
  if (score >= 75) return "#fef3c7";
  return "#fee2e2";
}

export function formatSessionCount(count) {
  if (count === 1) return "1 session";
  return `${count} sessions`;
}

export function localizedText(value, lang = "en") {
  if (value == null) return "";
  if (typeof value === "string") return value;
  return value[lang] ?? value.en ?? "";
}

export function localizedList(value, lang = "en") {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return value[lang] ?? value.en ?? [];
}