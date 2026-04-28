import { t } from "../i18n";

function polarToCartesian(cx, cy, r, angleDeg) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;

  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M",
    start.x,
    start.y,
    "A",
    r,
    r,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(" ");
}

function scoreColor(score) {
  if (score >= 90) return "#16a34a";
  if (score >= 75) return "#f59e0b";
  return "#ef4444";
}

export default function SpeedometerGauge({
  score = 92,
  label,
  size = 260,
  lang = "en",
}) {
  const safeScore = Math.max(0, Math.min(100, score));
  const color = scoreColor(safeScore);

  const cx = 130;
  const cy = 132;
  const r = 96;

  const startAngle = -115;
  const endAngle = 115;
  const totalAngle = endAngle - startAngle;
  const scoreAngle = startAngle + (safeScore / 100) * totalAngle;

  const backgroundArc = describeArc(cx, cy, r, startAngle, endAngle);
  const valueArc = describeArc(cx, cy, r, startAngle, scoreAngle);

  // shortened needle so it does not overlap the score text
  const needleEnd = polarToCartesian(cx, cy, 60, scoreAngle);

  let caption = t(lang, "gaugeCaptionLow");
  if (safeScore >= 90) caption = t(lang, "gaugeCaptionExcellent");
  else if (safeScore >= 75) caption = t(lang, "gaugeCaptionGood");

  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: 30,
        padding: 20,
        boxShadow: "0 18px 40px rgba(15, 23, 42, 0.07)",
      }}
    >
      <div
        style={{
          fontSize: 15,
          fontWeight: 900,
          color: "#0f172a",
          marginBottom: 10,
        }}
      >
        {label ?? t(lang, "drivingSafetyScore")}
      </div>

      <svg
        width="100%"
        viewBox="0 0 260 210"
        role="img"
        aria-label={`${label ?? t(lang, "drivingSafetyScore")}: ${safeScore}`}
        style={{
          display: "block",
          maxWidth: size,
          margin: "0 auto",
        }}
      >
        <path
          d={backgroundArc}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="18"
          strokeLinecap="round"
        />

        <path
          d={valueArc}
          fill="none"
          stroke={color}
          strokeWidth="18"
          strokeLinecap="round"
        />

        <line
          x1={cx}
          y1={cy}
          x2={needleEnd.x}
          y2={needleEnd.y}
          stroke="#0f172a"
          strokeWidth="5"
          strokeLinecap="round"
        />

        <circle cx={cx} cy={cy} r="9" fill="#0f172a" />

        <text
          x={cx}
          y={176}
          textAnchor="middle"
          fontSize="38"
          fontWeight="900"
          fill="#0f172a"
          letterSpacing="-2"
        >
          {safeScore}
        </text>

        <text
          x={cx}
          y={198}
          textAnchor="middle"
          fontSize="13"
          fontWeight="700"
          fill="#64748b"
        >
          {t(lang, "outOf100")}
        </text>

        <text x="48" y="198" fontSize="11" fontWeight="800" fill="#94a3b8">
          0
        </text>

        <text x="200" y="198" fontSize="11" fontWeight="800" fill="#94a3b8">
          100
        </text>
      </svg>

      <div
        style={{
          marginTop: 6,
          padding: "12px 14px",
          borderRadius: 18,
          background: "#f8fafc",
          color: "#334155",
          fontSize: 13,
          lineHeight: 1.45,
        }}
      >
        {caption}
      </div>
    </div>
  );
}