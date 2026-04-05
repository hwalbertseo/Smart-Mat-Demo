export const translations = {
  en: {
    appTitle: "Sole-Mate Demo",
    appSubtitle:
      "A browser prototype for intention-aware foot placement and pedal misapplication detection.",
    language: "Language",

    controlsTitle: "Sole-Mate Controls",
    footSizeScale: "Foot size scale",
    footAngle: "Foot angle",
    heelPressure: "Heel pressure",
    vehicleSpeed: "Vehicle speed",
    pressActive: "Press active",
    intendedPedal: "Intended pedal",
    pressedPedal: "Pressed pedal",
    resetFootPosition: "Reset foot position",
    riskScore: "Risk score",
    inferenceSource: "Inference source",
    modelStatus: "Model status",
    howToUse: "How to use",

    desktopMove1: "Desktop: move the mouse to reposition the foot.",
    desktopMove2: "Desktop: hold the mouse button down to simulate an active press.",
    desktopMove3: "Desktop: scroll over the mat to rotate the foot.",
    mobileMove1: "Mobile: drag with your finger to move the foot.",
    mobileMove2: "Mobile: use the angle slider to rotate the foot.",
    mobileMove3: "Mobile: the foot stays in an active press state automatically.",
    inferNote: "The app automatically infers intended and pressed pedal from pose.",
    sliderNote: "Use heel pressure and vehicle speed sliders to change the input state.",

    currentStatus: "Current status",
    driverApp: "Driver App",
    liveFeedbackPreview: "Live feedback preview",
    appLinked: "APP LINKED",
    aiReady: "AI READY",
    ruleMode: "RULE MODE",
    modelScore: "Model Score",
    liveFootView: "Live foot view",
    speed: "Speed",
    pressed: "Pressed",
    intent: "Intent",
    recommendedAction: "Recommended action",
    recentAlerts: "Recent alerts",
    noRiskEvents: "No risk events logged yet.",
    heelAnchorDx: "Heel anchor dx",
    heelAnchorDy: "Heel anchor dy",

    seatSide: "Seat side",
    moveMouseHelp:
      "Move mouse = reposition foot | Hold click = active press | Scroll = rotate foot",
    moveTouchHelp:
      "Drag with finger = move foot | Use slider = rotate | Press stays active on mobile",
    heelLegend:
      "Pink dot = heel anchor | Cyan box/dot = estimated heel contact region",
    pinkLegend: "Pink = heel anchor",
    cyanLegend: "Cyan = forefoot estimate",

    yes: "YES",
    no: "NO",
    none: "NONE",
    unknown: "UNKNOWN",

    onnxModel: "ONNX model",
    idle: "Idle",
    ruleBasedFallback: "Rule-based fallback",

    loaded: "loaded",
    fallbackStatus: "not found / using rules",
    loading: "loading...",

    brake: "Brake",
    accel: "Accel",

    safe: "SAFE",
    risk: "RISK",
    misapplication: "MISAPPLICATION",
    notPressing: "NOT PRESSING",

    modelScoreCaptionModel:
      "Confidence in the current assessment from the ONNX model.",
    modelScoreCaptionRules:
      "Using the rule-based fallback estimate right now.",
    modelScoreCaptionIdle:
      "The model score will appear when pedal input becomes active.",

    feedbackWrongAccelMoving:
      "Wrong pedal input detected. Release the accelerator and move the foot back toward the brake.",
    feedbackWrongAccelStopped:
      "Wrong pedal input detected. Lift and reposition the foot before moving.",
    feedbackWrongBrake:
      "Pedal mismatch detected. Reposition the foot carefully before applying input.",
    feedbackUnsafe:
      "Unsafe pedal application detected. Reposition the foot and confirm heel alignment.",
    feedbackRisk:
      "Foot posture looks unstable. Adjust heel position and apply pedal input more deliberately.",
    feedbackSafe:
      "Foot placement looks stable and consistent with the intended pedal.",
    feedbackIdle: "Waiting for pedal input.",
  },

  ko: {
    appTitle: "솔메이트 데모",
    appSubtitle:
      "발 위치 기반 페달 오조작 위험 감지 브라우저 프로토타입",
    language: "언어",

    controlsTitle: "솔메이트 제어 패널",
    footSizeScale: "발 크기 비율",
    footAngle: "발 각도",
    heelPressure: "발뒤꿈치 압력",
    vehicleSpeed: "차량 속도",
    pressActive: "입력 활성",
    intendedPedal: "의도된 페달",
    pressedPedal: "실제 입력 페달",
    resetFootPosition: "발 위치 초기화",
    riskScore: "위험 점수",
    inferenceSource: "판정 방식",
    modelStatus: "모델 상태",
    howToUse: "사용 방법",

    desktopMove1: "데스크톱: 마우스를 움직여 발 위치를 바꿉니다.",
    desktopMove2: "데스크톱: 마우스 버튼을 누르고 있으면 입력 상태를 시뮬레이션합니다.",
    desktopMove3: "데스크톱: 매트 위에서 스크롤하면 발을 회전합니다.",
    mobileMove1: "모바일: 손가락으로 드래그해 발을 이동합니다.",
    mobileMove2: "모바일: 각도 슬라이더로 발을 회전합니다.",
    mobileMove3: "모바일: 발은 자동으로 입력 활성 상태를 유지합니다.",
    inferNote: "앱은 발 자세를 바탕으로 의도한 페달과 실제 입력 페달을 자동 추정합니다.",
    sliderNote: "발뒤꿈치 압력과 차량 속도 슬라이더로 입력 상태를 바꿔볼 수 있습니다.",

    currentStatus: "현재 상태",
    driverApp: "운전자 앱",
    liveFeedbackPreview: "실시간 피드백 미리보기",
    appLinked: "앱 연동",
    aiReady: "AI 준비 완료",
    ruleMode: "규칙 모드",
    modelScore: "모델 점수",
    liveFootView: "실시간 발 상태",
    speed: "속도",
    pressed: "입력",
    intent: "의도",
    recommendedAction: "권장 조치",
    recentAlerts: "최근 경고",
    noRiskEvents: "아직 기록된 위험 이벤트가 없습니다.",
    heelAnchorDx: "뒤꿈치 기준점 dx",
    heelAnchorDy: "뒤꿈치 기준점 dy",

    seatSide: "좌석 방향",
    moveMouseHelp:
      "마우스 이동 = 발 위치 이동 | 클릭 유지 = 입력 활성 | 스크롤 = 발 회전",
    moveTouchHelp:
      "손가락 드래그 = 발 이동 | 슬라이더 = 회전 | 모바일에서는 입력이 항상 활성",
    heelLegend:
      "분홍 점 = 뒤꿈치 기준점 | 하늘색 박스/점 = 추정 뒤꿈치 접촉 영역",
    pinkLegend: "분홍 = 뒤꿈치 기준점",
    cyanLegend: "하늘색 = 전족부 추정 위치",

    yes: "예",
    no: "아니오",
    none: "없음",
    unknown: "알 수 없음",

    onnxModel: "ONNX 모델",
    idle: "대기 상태",
    ruleBasedFallback: "규칙 기반 대체 판정",

    loaded: "불러옴",
    fallbackStatus: "모델 없음 / 규칙 사용",
    loading: "불러오는 중...",

    brake: "브레이크",
    accel: "가속",

    safe: "안전",
    risk: "주의",
    misapplication: "오조작 위험",
    notPressing: "미입력",

    modelScoreCaptionModel:
      "현재 판정에 대한 ONNX 모델의 확신 정도입니다.",
    modelScoreCaptionRules:
      "현재는 규칙 기반 대체 추정값을 사용하고 있습니다.",
    modelScoreCaptionIdle:
      "페달 입력이 활성화되면 모델 점수가 표시됩니다.",

    feedbackWrongAccelMoving:
      "잘못된 페달 입력이 감지되었습니다. 가속 페달에서 발을 떼고 브레이크 쪽으로 다시 이동하세요.",
    feedbackWrongAccelStopped:
      "잘못된 페달 입력이 감지되었습니다. 출발 전에 발을 들어 올려 다시 위치시키세요.",
    feedbackWrongBrake:
      "페달 의도와 입력이 일치하지 않습니다. 입력 전에 발 위치를 다시 맞추세요.",
    feedbackUnsafe:
      "불안전한 페달 입력이 감지되었습니다. 발을 다시 놓고 뒤꿈치 정렬을 확인하세요.",
    feedbackRisk:
      "발 자세가 불안정합니다. 뒤꿈치 위치를 조정하고 더 정확하게 입력하세요.",
    feedbackSafe:
      "발 위치가 안정적이며 의도한 페달과 일치합니다.",
    feedbackIdle: "페달 입력을 기다리는 중입니다.",
  },
};

export function t(lang, key) {
  return translations[lang]?.[key] ?? translations.en[key] ?? key;
}

export function localizeAssessmentLabel(lang, label) {
  const v = String(label ?? "").trim().toUpperCase();
  if (v === "SAFE") return t(lang, "safe");
  if (v === "RISK" || v === "WARNING" || v === "CAUTION") return t(lang, "risk");
  if (
    v === "MISAPPLICATION" ||
    v === "DANGEROUS" ||
    v === "DANGER" ||
    v === "UNSAFE"
  ) {
    return t(lang, "misapplication");
  }
  if (v === "NOT PRESSING") return t(lang, "notPressing");
  return label;
}

export function localizePedalLabel(lang, pedal) {
  const v = String(pedal ?? "").trim().toLowerCase();
  if (v === "brake") return t(lang, "brake");
  if (v === "accel" || v === "accelerator") return t(lang, "accel");
  if (v === "none") return t(lang, "none");
  if (v === "unknown") return t(lang, "unknown");
  return pedal;
}

export function localizeSourceLabel(lang, source) {
  if (source === "model") return t(lang, "onnxModel");
  if (source === "idle") return t(lang, "idle");
  return t(lang, "ruleBasedFallback");
}

export function localizeModelStatus(lang, status) {
  if (status === "loaded") return t(lang, "loaded");
  if (status === "fallback") return t(lang, "fallbackStatus");
  return t(lang, "loading");
}

export function localizeBoolean(lang, value) {
  return value ? t(lang, "yes") : t(lang, "no");
}

export function getModelScoreCaption(lang, source) {
  if (source === "model") return t(lang, "modelScoreCaptionModel");
  if (source === "rules") return t(lang, "modelScoreCaptionRules");
  return t(lang, "modelScoreCaptionIdle");
}

export function buildFeedbackText(
  lang,
  { label, pressedPedal, intendedPedal, speed }
) {
  const v = String(label ?? "").toUpperCase();
  const pressed = String(pressedPedal ?? "none").toLowerCase();
  const intended = String(intendedPedal ?? "unknown").toLowerCase();
  const currentSpeed = Number(speed ?? 0);

  if (v === "MISAPPLICATION") {
    if (pressed === "accel" && intended === "brake") {
      return currentSpeed > 0
        ? t(lang, "feedbackWrongAccelMoving")
        : t(lang, "feedbackWrongAccelStopped");
    }

    if (pressed === "brake" && intended === "accel") {
      return t(lang, "feedbackWrongBrake");
    }

    return t(lang, "feedbackUnsafe");
  }

  if (v === "RISK") return t(lang, "feedbackRisk");
  if (v === "SAFE") return t(lang, "feedbackSafe");
  return t(lang, "feedbackIdle");
}