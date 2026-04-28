const translations = {
  en: {
    siteKicker: "SoleMate Smart Mat",
    siteTitle: "Pedal Misapplication Prevention Demo",
    siteSubtitle:
      "Test the smart mat simulator or preview the official driver app experience.",
    drivingDemoTab: "Driving Demo",
    drivingDemoTabDescription: "Interactive smart mat simulation",
    appDemoTab: "App Demo",
    appDemoTabDescription: "Official smartphone app preview",

    appTitle: "SoleMate Smart Mat",
    appSubtitle:
      "Move the virtual foot and press toward a pedal to test misapplication detection before full pedal actuation.",
    language: "Language",

    controlsTitle: "Demo Controls",
    footSizeScale: "Foot size scale",
    footAngle: "Foot angle",
    heelPressure: "Heel pressure",
    vehicleSpeed: "Vehicle speed",
    resetFootPosition: "Reset foot position",

    pressActive: "Press active",
    intendedPedal: "Intended pedal",
    pressedPedal: "Pressed pedal",
    riskScore: "Risk score",
    inferenceSource: "Inference source",
    modelStatus: "Model status",

    howToUse: "How to use",
    desktopMove1: "Desktop: move your mouse over the mat to move the foot.",
    desktopMove2: "Desktop: hold the mouse button to simulate pedal press.",
    desktopMove3: "Desktop: use the mouse wheel or angle slider to rotate the foot.",
    mobileMove1: "Mobile: touch and drag to move the foot.",
    mobileMove2: "Mobile: touching the mat simulates active pressing.",
    mobileMove3: "Use the sliders below to change driving conditions.",
    inferNote:
      "The demo infers intended pedal from foot direction and distance.",
    sliderNote:
      "Speed and heel pressure act like simplified vehicle/sensor inputs.",

    seatSide: "Seat side",
    intent: "Intent",
    pressed: "Pressed",
    unknown: "Unknown",
    none: "None",
    brake: "Brake",
    accel: "Accelerator",

    moveMouseHelp:
      "Move mouse to position foot · Hold click to press · Scroll to rotate",
    moveTouchHelp: "Touch and drag to move and press",
    heelLegend: "Cyan box = heel sensor area · Pink dot = heel anchor",

    currentStatus: "Current status",
    modelScore: "Model score",
    recentAlerts: "Recent alerts",
    recommendedAction: "Recommended action",

    heelAnchorDx: "Heel anchor dx",
    heelAnchorDy: "Heel anchor dy",

    safeFeedback:
      "Pedal intent and actual press are aligned. No immediate misapplication pattern detected.",
    riskFeedback:
      "The system detected unstable foot position or a possible risky transition. Keep your heel anchored and slow the pedal transition.",
    misapplicationFeedback:
      "Possible pedal misapplication detected. Release pressure and re-center the foot before pressing again.",
    idleFeedback: "No active pedal press detected.",

    sourceIdle: "Idle",
    sourceRules: "Rule fallback",
    sourceModel: "AI model",

    statusLoading: "Loading",
    statusLoaded: "AI model ready",
    statusFallback: "Rule fallback",

    scoreCaptionIdle: "The score appears after an active pedal press.",
    scoreCaptionRules:
      "The ONNX model is unavailable, so the demo is using fast rule-based assessment.",
    scoreCaptionModel:
      "The score is based on the current AI model prediction confidence.",

    mobileAppTitle: "SoleMate",
    mobileAppSubtitle: "Personalized driving safety dashboard",
    sessionLog: "Session Log",
    savedDrivingReports: "Saved driving reports",
    account: "Account",
    profileAndPersonalization: "Profile and personalization",

    bottomTabLog: "Log",
    bottomTabHome: "Home",
    bottomTabAccount: "Account",

    welcomeBack: "Welcome back,",
    homeIntro:
      "Your personalized SoleMate model is ready to review your latest driving behavior.",
    personalizedAiModel: "Personalized AI Model",
    fineTunedWithDrivingData:
      "Model fine-tuned with your personal driving data.",
    fineTuneDescription:
      "The model is currently highly personalized. Future driving sessions will continue improving feedback accuracy.",
    lastDrivingSession: "Last Driving Session",
    report: "Report",
    noDrivingSessions: "No driving sessions yet.",
    aiFeedback: "AI Feedback",
    viewAll: "View all",
    averageScore: "Average Score",
    sessions: "Sessions",

    drivingSessionLog: "Driving Session Log",
    sessionLogIntro:
      "Tap a session to open the detailed AI report and safety feedback.",

    drivingReport: "Driving Report",
    overallScore: "Overall Score",
    modelConfidence: "Model Confidence",
    brakeAccuracy: "Brake Accuracy",
    accelAccuracy: "Accel Accuracy",
    heelStability: "Heel Stability",
    outOf100: "out of 100",

    drivingSafetyScore: "Driving Safety Score",
    gaugeCaptionExcellent:
      "Excellent pedal control and low misapplication risk.",
    gaugeCaptionGood:
      "Good overall control, with a few moments that need attention.",
    gaugeCaptionLow:
      "Review recent risky moments and improve pedal transition stability.",

    demoAccount: "Demo Account",
    totalSessions: "Total Sessions",
    lastSession: "Last Session",
    lastScore: "Last Score",
    drivingAlerts: "Driving Alerts",
    drivingAlertsSubtitle: "Receive warnings for risky pedal behavior.",
    weeklySafetyReport: "Weekly Safety Report",
    weeklySafetyReportSubtitle: "Summarize your driving pattern every week.",
    languageSubtitle: "App display language.",
    dataSync: "Data Sync",
    dataSyncSubtitle: "Upload session data to improve personalization.",
  },

  ko: {
    siteKicker: "솔메이트 스마트 매트",
    siteTitle: "페달 오조작 예방 데모",
    siteSubtitle:
      "스마트 매트 시뮬레이터를 테스트하거나 공식 운전자 앱 화면을 미리 볼 수 있습니다.",
    drivingDemoTab: "주행 데모",
    drivingDemoTabDescription: "스마트 매트 인터랙티브 시뮬레이션",
    appDemoTab: "앱 데모",
    appDemoTabDescription: "공식 스마트폰 앱 미리보기",

    appTitle: "솔메이트 스마트 매트",
    appSubtitle:
      "가상 발을 움직이고 페달을 누르며 페달 오조작 사전 감지 과정을 테스트합니다.",
    language: "언어",

    controlsTitle: "데모 조작",
    footSizeScale: "발 크기",
    footAngle: "발 각도",
    heelPressure: "뒤꿈치 압력",
    vehicleSpeed: "차량 속도",
    resetFootPosition: "발 위치 초기화",

    pressActive: "페달 입력 중",
    intendedPedal: "의도 페달",
    pressedPedal: "실제 입력 페달",
    riskScore: "위험 점수",
    inferenceSource: "판단 방식",
    modelStatus: "모델 상태",

    howToUse: "사용 방법",
    desktopMove1: "데스크톱: 마우스를 움직여 발 위치를 조정합니다.",
    desktopMove2: "데스크톱: 마우스를 누르면 페달 입력 상태가 됩니다.",
    desktopMove3: "데스크톱: 마우스 휠 또는 각도 슬라이더로 발을 회전합니다.",
    mobileMove1: "모바일: 터치하고 드래그해 발을 움직입니다.",
    mobileMove2: "모바일: 터치 중에는 페달 입력 상태로 간주합니다.",
    mobileMove3: "아래 슬라이더로 주행 조건을 바꿀 수 있습니다.",
    inferNote: "데모는 발 방향과 거리로 의도 페달을 추정합니다.",
    sliderNote: "속도와 뒤꿈치 압력은 단순화된 차량/센서 입력입니다.",

    seatSide: "운전석",
    intent: "의도",
    pressed: "입력",
    unknown: "알 수 없음",
    none: "없음",
    brake: "브레이크",
    accel: "가속 페달",

    moveMouseHelp:
      "마우스로 발 이동 · 클릭 유지로 페달 입력 · 휠로 발 회전",
    moveTouchHelp: "터치하고 드래그해 발 이동 및 입력",
    heelLegend: "청록색 박스 = 뒤꿈치 센서 영역 · 분홍색 점 = 기준 앵커",

    currentStatus: "현재 상태",
    modelScore: "모델 점수",
    recentAlerts: "최근 경고",
    recommendedAction: "권장 조치",

    heelAnchorDx: "뒤꿈치 기준 dx",
    heelAnchorDy: "뒤꿈치 기준 dy",

    safeFeedback:
      "의도한 페달과 실제 입력이 일치합니다. 즉각적인 오조작 패턴은 감지되지 않았습니다.",
    riskFeedback:
      "불안정한 발 위치 또는 위험한 전환 가능성이 감지되었습니다. 뒤꿈치를 고정하고 페달 전환을 천천히 하세요.",
    misapplicationFeedback:
      "페달 오조작 가능성이 감지되었습니다. 압력을 풀고 발을 다시 정렬한 뒤 입력하세요.",
    idleFeedback: "활성 페달 입력이 없습니다.",

    sourceIdle: "대기 상태",
    sourceRules: "규칙 기반",
    sourceModel: "AI 모델",

    statusLoading: "불러오는 중",
    statusLoaded: "AI 모델 준비됨",
    statusFallback: "규칙 기반 대체",

    scoreCaptionIdle: "페달 입력이 시작되면 점수가 표시됩니다.",
    scoreCaptionRules:
      "ONNX 모델을 사용할 수 없어 빠른 규칙 기반 판단을 사용 중입니다.",
    scoreCaptionModel: "현재 AI 모델 예측 신뢰도를 기반으로 한 점수입니다.",

    mobileAppTitle: "솔메이트",
    mobileAppSubtitle: "개인화된 주행 안전 대시보드",
    sessionLog: "주행 기록",
    savedDrivingReports: "저장된 주행 리포트",
    account: "계정",
    profileAndPersonalization: "프로필 및 개인화 설정",

    bottomTabLog: "기록",
    bottomTabHome: "홈",
    bottomTabAccount: "계정",

    welcomeBack: "다시 오신 것을 환영합니다,",
    homeIntro:
      "개인화된 솔메이트 모델이 최근 주행 행동을 분석할 준비가 되어 있습니다.",
    personalizedAiModel: "개인화 AI 모델",
    fineTunedWithDrivingData: "사용자의 주행 데이터로 미세 조정된 모델입니다.",
    fineTuneDescription:
      "현재 모델은 높은 수준으로 개인화되어 있습니다. 향후 주행 세션이 쌓이면 피드백 정확도가 계속 향상됩니다.",
    lastDrivingSession: "최근 주행 세션",
    report: "리포트",
    noDrivingSessions: "아직 주행 세션이 없습니다.",
    aiFeedback: "AI 피드백",
    viewAll: "전체 보기",
    averageScore: "평균 점수",
    sessions: "세션 수",

    drivingSessionLog: "주행 세션 기록",
    sessionLogIntro:
      "세션을 누르면 자세한 AI 리포트와 안전 피드백을 확인할 수 있습니다.",

    drivingReport: "주행 리포트",
    overallScore: "종합 점수",
    modelConfidence: "모델 신뢰도",
    brakeAccuracy: "브레이크 정확도",
    accelAccuracy: "가속 정확도",
    heelStability: "뒤꿈치 안정성",
    outOf100: "100점 만점",

    drivingSafetyScore: "주행 안전 점수",
    gaugeCaptionExcellent:
      "페달 조작이 매우 안정적이며 오조작 위험이 낮습니다.",
    gaugeCaptionGood:
      "전반적으로 양호하지만 일부 주의가 필요한 구간이 있습니다.",
    gaugeCaptionLow:
      "최근 위험 구간을 확인하고 페달 전환 안정성을 개선하세요.",

    demoAccount: "데모 계정",
    totalSessions: "전체 세션",
    lastSession: "최근 세션",
    lastScore: "최근 점수",
    drivingAlerts: "주행 경고",
    drivingAlertsSubtitle: "위험한 페달 행동이 감지되면 경고를 받습니다.",
    weeklySafetyReport: "주간 안전 리포트",
    weeklySafetyReportSubtitle: "매주 주행 패턴을 요약합니다.",
    languageSubtitle: "앱 표시 언어입니다.",
    dataSync: "데이터 동기화",
    dataSyncSubtitle: "개인화 성능 향상을 위해 세션 데이터를 업로드합니다.",
  },
};

function getDict(lang) {
  return translations[lang] ?? translations.en;
}

export function t(lang, key) {
  const dict = getDict(lang);
  return dict[key] ?? translations.en[key] ?? key;
}

export function localizePedalLabel(lang, pedal) {
  if (pedal === "brake") return t(lang, "brake");
  if (pedal === "accel") return t(lang, "accel");
  if (pedal === "none") return t(lang, "none");
  return t(lang, "unknown");
}

export function localizeBoolean(lang, value) {
  if (lang === "ko") return value ? "예" : "아니오";
  return value ? "Yes" : "No";
}

export function localizeAssessmentLabel(lang, label) {
  const value = String(label ?? "").toUpperCase();

  if (lang !== "ko") return value;

  if (value === "SAFE") return "안전";
  if (value === "RISK") return "주의";
  if (value === "MISAPPLICATION") return "오조작 위험";
  if (value === "NOT PRESSING") return "입력 없음";

  return value;
}

export function localizeSourceLabel(lang, source) {
  if (source === "idle") return t(lang, "sourceIdle");
  if (source === "rules") return t(lang, "sourceRules");
  if (source === "model") return t(lang, "sourceModel");
  return source ?? "-";
}

export function localizeModelStatus(lang, status) {
  if (status === "loading") return t(lang, "statusLoading");
  if (status === "loaded") return t(lang, "statusLoaded");
  if (status === "fallback") return t(lang, "statusFallback");
  return status ?? "-";
}

export function buildFeedbackText(lang, assessment) {
  const label = String(assessment?.label ?? "").toUpperCase();

  if (label === "SAFE") return t(lang, "safeFeedback");
  if (label === "RISK") return t(lang, "riskFeedback");
  if (label === "MISAPPLICATION") return t(lang, "misapplicationFeedback");

  return t(lang, "idleFeedback");
}

export function getModelScoreCaption(lang, source) {
  if (source === "idle") return t(lang, "scoreCaptionIdle");
  if (source === "rules") return t(lang, "scoreCaptionRules");
  if (source === "model") return t(lang, "scoreCaptionModel");
  return t(lang, "scoreCaptionIdle");
}