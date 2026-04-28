export const demoSessions = [
  {
    id: "session-006",
    title: {
      en: "Afternoon Drive",
      ko: "오후 주행",
    },
    date: "2026-04-29 14:20",
    shortDate: "Apr 29",
    score: 92,
    safetyLabel: "SAFE",
    summary: {
      en: "Strong pedal control with stable heel anchoring and low misapplication risk.",
      ko: "안정적인 뒤꿈치 고정과 우수한 페달 조작을 보였으며, 오조작 위험이 낮았습니다.",
    },
    feedback: {
      en: [
        "Brake intent matched the actual brake press consistently.",
        "Heel position stayed stable during most pedal transitions.",
        "The model detected one short caution moment near the accelerator zone.",
        "Overall behavior suggests low pedal misapplication risk.",
      ],
      ko: [
        "브레이크 의도와 실제 브레이크 입력이 안정적으로 일치했습니다.",
        "대부분의 페달 전환에서 뒤꿈치 위치가 안정적으로 유지되었습니다.",
        "가속 페달 근처에서 짧은 주의 구간이 한 번 감지되었습니다.",
        "전체적으로 페달 오조작 위험이 낮은 주행 패턴입니다.",
      ],
    },
    detailedReport: {
      modelConfidence: 98,
      brakingAccuracy: 95,
      accelAccuracy: 91,
      heelStability: 93,
      riskMoments: 1,
    },
  },
  {
    id: "session-005",
    title: {
      en: "Evening Commute",
      ko: "저녁 퇴근 주행",
    },
    date: "2026-04-28 18:10",
    shortDate: "Apr 28",
    score: 84,
    safetyLabel: "RISK",
    summary: {
      en: "Good overall driving, but several pedal transitions showed increased risk.",
      ko: "전반적으로 양호했지만, 일부 페달 전환에서 위험도가 높아졌습니다.",
    },
    feedback: {
      en: [
        "The foot moved quickly from the brake side toward the accelerator region.",
        "Heel anchoring was less stable during one deceleration event.",
        "The model recommends slowing down foot transitions between pedals.",
        "Keep the heel closer to the brake-side anchor zone when braking.",
      ],
      ko: [
        "발이 브레이크 쪽에서 가속 페달 영역으로 빠르게 이동한 구간이 있었습니다.",
        "감속 상황 중 한 번 뒤꿈치 고정이 불안정했습니다.",
        "모델은 페달 간 발 전환 속도를 줄일 것을 권장합니다.",
        "브레이크 입력 시 뒤꿈치를 브레이크 기준 영역에 더 가깝게 유지하세요.",
      ],
    },
    detailedReport: {
      modelConfidence: 97,
      brakingAccuracy: 88,
      accelAccuracy: 86,
      heelStability: 79,
      riskMoments: 4,
    },
  },
  {
    id: "session-004",
    title: {
      en: "Morning Drive",
      ko: "아침 주행",
    },
    date: "2026-04-26 09:40",
    shortDate: "Apr 26",
    score: 88,
    safetyLabel: "SAFE",
    summary: {
      en: "Safe pedal behavior with a few minor instability moments during acceleration.",
      ko: "안전한 페달 조작을 보였으며, 가속 중 일부 작은 불안정 구간이 있었습니다.",
    },
    feedback: {
      en: [
        "Pedal intent and actual pedal press were mostly aligned.",
        "Acceleration behavior was smooth and predictable.",
        "Heel pressure dropped slightly during one transition.",
        "No major misapplication pattern was detected.",
      ],
      ko: [
        "의도한 페달과 실제 페달 입력이 대부분 일치했습니다.",
        "가속 동작은 부드럽고 예측 가능했습니다.",
        "한 번의 전환 구간에서 뒤꿈치 압력이 약간 낮아졌습니다.",
        "주요 오조작 패턴은 감지되지 않았습니다.",
      ],
    },
    detailedReport: {
      modelConfidence: 98,
      brakingAccuracy: 91,
      accelAccuracy: 89,
      heelStability: 86,
      riskMoments: 2,
    },
  },
  {
    id: "session-003",
    title: {
      en: "Parking Lot Practice",
      ko: "주차장 연습",
    },
    date: "2026-04-24 16:05",
    shortDate: "Apr 24",
    score: 76,
    safetyLabel: "RISK",
    summary: {
      en: "Low-speed driving remained controlled, but foot placement was inconsistent.",
      ko: "저속 주행은 통제되어 있었지만, 발 위치가 일정하지 않았습니다.",
    },
    feedback: {
      en: [
        "The model detected unstable heel placement during low-speed movement.",
        "Brake and accelerator transitions were slower but less centered.",
        "Practice keeping the heel planted while rotating the forefoot.",
        "Risk was moderate, especially during repeated stop-and-go movement.",
      ],
      ko: [
        "저속 이동 중 뒤꿈치 위치가 불안정한 구간이 감지되었습니다.",
        "브레이크와 가속 페달 간 전환은 느렸지만 중심이 다소 흔들렸습니다.",
        "앞발만 회전하고 뒤꿈치는 고정하는 연습이 필요합니다.",
        "반복적인 정지-출발 상황에서 중간 수준의 위험이 나타났습니다.",
      ],
    },
    detailedReport: {
      modelConfidence: 96,
      brakingAccuracy: 81,
      accelAccuracy: 78,
      heelStability: 72,
      riskMoments: 5,
    },
  },
  {
    id: "session-002",
    title: {
      en: "Short City Drive",
      ko: "짧은 시내 주행",
    },
    date: "2026-04-21 12:30",
    shortDate: "Apr 21",
    score: 94,
    safetyLabel: "SAFE",
    summary: {
      en: "Excellent driving session with clear intent and very low risk patterns.",
      ko: "의도가 명확하고 위험 패턴이 매우 낮은 우수한 주행이었습니다.",
    },
    feedback: {
      en: [
        "Pedal selection was clear throughout the session.",
        "Heel anchoring was highly stable.",
        "No dangerous accelerator-over-brake movement was detected.",
        "The model classified this as a highly safe session.",
      ],
      ko: [
        "주행 내내 페달 선택이 명확했습니다.",
        "뒤꿈치 고정이 매우 안정적이었습니다.",
        "브레이크 대신 가속 페달로 향하는 위험 움직임은 감지되지 않았습니다.",
        "모델은 이 주행을 매우 안전한 세션으로 분류했습니다.",
      ],
    },
    detailedReport: {
      modelConfidence: 99,
      brakingAccuracy: 96,
      accelAccuracy: 94,
      heelStability: 95,
      riskMoments: 0,
    },
  },
  {
    id: "session-001",
    title: {
      en: "Initial Calibration Drive",
      ko: "초기 보정 주행",
    },
    date: "2026-04-18 10:15",
    shortDate: "Apr 18",
    score: 81,
    safetyLabel: "RISK",
    summary: {
      en: "Initial calibration completed. The model found several useful personalization signals.",
      ko: "초기 보정이 완료되었고, 모델이 개인화에 필요한 주요 주행 신호를 학습했습니다.",
    },
    feedback: {
      en: [
        "Your baseline driving pattern was successfully recorded.",
        "Heel pressure varied more than expected during braking.",
        "The personalized model improved after this session.",
        "Future sessions should make the feedback more accurate.",
      ],
      ko: [
        "기본 주행 패턴이 성공적으로 기록되었습니다.",
        "브레이크 입력 중 뒤꿈치 압력 변화가 예상보다 컸습니다.",
        "이 세션 이후 개인화 모델의 정확도가 향상되었습니다.",
        "추가 주행 데이터가 쌓이면 피드백이 더 정확해집니다.",
      ],
    },
    detailedReport: {
      modelConfidence: 93,
      brakingAccuracy: 84,
      accelAccuracy: 82,
      heelStability: 76,
      riskMoments: 4,
    },
  },
];