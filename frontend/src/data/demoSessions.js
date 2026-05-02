export const demoSessions = [
  {
    id: "session-012",
    accountId: "driver-001",
    title: { en: "Afternoon Drive", ko: "오후 주행" },
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
      ],
      ko: [
        "브레이크 의도와 실제 브레이크 입력이 안정적으로 일치했습니다.",
        "대부분의 페달 전환에서 뒤꿈치 위치가 안정적으로 유지되었습니다.",
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
    id: "session-011",
    accountId: "driver-002",
    title: { en: "Evening Commute", ko: "저녁 퇴근 주행" },
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
      ],
      ko: [
        "발이 브레이크 쪽에서 가속 페달 영역으로 빠르게 이동한 구간이 있었습니다.",
        "감속 상황 중 한 번 뒤꿈치 고정이 불안정했습니다.",
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
    id: "session-010",
    accountId: "driver-003",
    title: { en: "Morning Drive", ko: "아침 주행" },
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
      ],
      ko: [
        "의도한 페달과 실제 페달 입력이 대부분 일치했습니다.",
        "가속 동작은 부드럽고 예측 가능했습니다.",
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
    id: "session-009",
    accountId: "driver-003",
    title: { en: "Late Night Return", ko: "야간 귀가 주행" },
    date: "2026-04-24 21:15",
    shortDate: "Apr 24",
    score: 81,
    safetyLabel: "RISK",
    summary: {
      en: "Stable overall, but several late braking transitions raised moderate concern.",
      ko: "전반적으로 안정적이었지만, 늦은 브레이크 전환이 몇 차례 감지되었습니다.",
    },
    feedback: {
      en: [
        "Heel drifted right during one braking sequence.",
        "Pedal transitions became sharper toward the end of the drive.",
      ],
      ko: [
        "한 번의 브레이크 구간에서 뒤꿈치가 오른쪽으로 이동했습니다.",
        "주행 후반부로 갈수록 페달 전환이 더 급해졌습니다.",
      ],
    },
    detailedReport: {
      modelConfidence: 95,
      brakingAccuracy: 85,
      accelAccuracy: 87,
      heelStability: 80,
      riskMoments: 3,
    },
  },

  {
    id: "session-008",
    accountId: "driver-002",
    title: { en: "City Traffic Test", ko: "도심 정체 구간 주행" },
    date: "2026-04-23 17:05",
    shortDate: "Apr 23",
    score: 79,
    safetyLabel: "RISK",
    summary: {
      en: "Frequent stop-and-go traffic caused less stable heel positioning.",
      ko: "잦은 정지와 출발로 인해 뒤꿈치 위치가 다소 불안정했습니다.",
    },
    feedback: {
      en: [
        "Repeated low-speed pedal transitions reduced consistency.",
        "The model suggests keeping the heel more planted during traffic.",
      ],
      ko: [
        "반복적인 저속 페달 전환으로 일관성이 떨어졌습니다.",
        "정체 구간에서는 뒤꿈치를 더 고정한 상태로 유지하는 것이 좋습니다.",
      ],
    },
    detailedReport: {
      modelConfidence: 96,
      brakingAccuracy: 82,
      accelAccuracy: 80,
      heelStability: 74,
      riskMoments: 5,
    },
  },

  {
    id: "session-007",
    accountId: "driver-003",
    title: { en: "Highway Entry", ko: "고속도로 진입 주행" },
    date: "2026-04-22 08:50",
    shortDate: "Apr 22",
    score: 90,
    safetyLabel: "SAFE",
    summary: {
      en: "Strong accelerator control and smooth transition into higher speed driving.",
      ko: "가속 제어가 안정적이었고 고속 주행 진입 전환도 매끄러웠습니다.",
    },
    feedback: {
      en: [
        "Accelerator intent was clearly reflected in actual pedal input.",
        "Heel position remained centered throughout the merge.",
      ],
      ko: [
        "가속 의도가 실제 페달 입력에 명확하게 반영되었습니다.",
        "합류 구간 내내 뒤꿈치 위치가 안정적으로 유지되었습니다.",
      ],
    },
    detailedReport: {
      modelConfidence: 99,
      brakingAccuracy: 89,
      accelAccuracy: 94,
      heelStability: 92,
      riskMoments: 1,
    },
  },

  {
    id: "session-006",
    accountId: "driver-001",
    title: { en: "Parking Lot Practice", ko: "주차장 연습 주행" },
    date: "2026-04-21 11:30",
    shortDate: "Apr 21",
    score: 86,
    safetyLabel: "SAFE",
    summary: {
      en: "Low-speed practice showed good control with occasional rightward heel drift.",
      ko: "저속 연습 주행에서 전반적으로 좋은 제어를 보였지만, 가끔 뒤꿈치가 오른쪽으로 이동했습니다.",
    },
    feedback: {
      en: [
        "Brake coverage remained reliable during low-speed motion.",
        "One transition toward the accelerator was slightly too quick.",
      ],
      ko: [
        "저속 주행 중 브레이크 커버 자세는 안정적으로 유지되었습니다.",
        "가속 페달 쪽으로 한 번의 전환이 다소 빨랐습니다.",
      ],
    },
    detailedReport: {
      modelConfidence: 94,
      brakingAccuracy: 90,
      accelAccuracy: 84,
      heelStability: 85,
      riskMoments: 2,
    },
  },

  {
    id: "session-005",
    accountId: "driver-003",
    title: { en: "Rainy Day Drive", ko: "우천 주행" },
    date: "2026-04-20 19:10",
    shortDate: "Apr 20",
    score: 77,
    safetyLabel: "RISK",
    summary: {
      en: "Driving remained controlled, but wet conditions led to more hesitant pedal transitions.",
      ko: "주행은 통제되었지만, 비 오는 환경에서 페달 전환이 더 주저되는 경향이 있었습니다.",
    },
    feedback: {
      en: [
        "Heel stability decreased slightly during braking.",
        "The model detected delayed transitions under reduced confidence.",
      ],
      ko: [
        "브레이크 입력 시 뒤꿈치 안정성이 약간 감소했습니다.",
        "모델은 자신감이 낮은 지연 전환 패턴을 감지했습니다.",
      ],
    },
    detailedReport: {
      modelConfidence: 93,
      brakingAccuracy: 80,
      accelAccuracy: 82,
      heelStability: 73,
      riskMoments: 4,
    },
  },

  {
    id: "session-004",
    accountId: "driver-002",
    title: { en: "School Zone Drive", ko: "스쿨존 주행" },
    date: "2026-04-19 15:25",
    shortDate: "Apr 19",
    score: 91,
    safetyLabel: "SAFE",
    summary: {
      en: "Excellent low-speed brake control and stable heel anchoring.",
      ko: "저속 브레이크 제어가 우수했고 뒤꿈치 고정도 안정적이었습니다.",
    },
    feedback: {
      en: [
        "Brake intent and actual braking stayed well aligned.",
        "No major misapplication pattern was detected.",
      ],
      ko: [
        "브레이크 의도와 실제 브레이크 입력이 잘 일치했습니다.",
        "주요 오조작 패턴은 감지되지 않았습니다.",
      ],
    },
    detailedReport: {
      modelConfidence: 98,
      brakingAccuracy: 94,
      accelAccuracy: 89,
      heelStability: 91,
      riskMoments: 1,
    },
  },

  {
    id: "session-003",
    accountId: "driver-003",
    title: { en: "Weekend Grocery Trip", ko: "주말 장보기 주행" },
    date: "2026-04-18 13:40",
    shortDate: "Apr 18",
    score: 87,
    safetyLabel: "SAFE",
    summary: {
      en: "Consistent pedal behavior with only minor instability during parking maneuvers.",
      ko: "전반적으로 일관된 페달 조작을 보였고, 주차 과정에서만 약간의 불안정성이 있었습니다.",
    },
    feedback: {
      en: [
        "Pedal transitions were smooth during regular motion.",
        "One parking adjustment caused slight heel drift.",
      ],
      ko: [
        "일반 주행 중 페달 전환은 부드러웠습니다.",
        "한 번의 주차 조정 과정에서 뒤꿈치가 약간 이동했습니다.",
      ],
    },
    detailedReport: {
      modelConfidence: 95,
      brakingAccuracy: 89,
      accelAccuracy: 88,
      heelStability: 84,
      riskMoments: 2,
    },
  },

  {
    id: "session-002",
    accountId: "driver-002",
    title: { en: "Initial Calibration", ko: "초기 보정 주행" },
    date: "2026-04-17 10:05",
    shortDate: "Apr 17",
    score: 82,
    safetyLabel: "RISK",
    summary: {
      en: "Baseline driving pattern was captured, but several transitions were not yet stable.",
      ko: "기본 주행 패턴은 잘 기록되었지만, 몇몇 페달 전환은 아직 안정적이지 않았습니다.",
    },
    feedback: {
      en: [
        "The model detected uneven heel positioning during early braking.",
        "More sessions will help improve personalized feedback accuracy.",
      ],
      ko: [
        "초기 브레이크 입력 구간에서 뒤꿈치 위치가 일정하지 않았습니다.",
        "추가 주행 데이터가 쌓이면 개인화 피드백 정확도가 향상됩니다.",
      ],
    },
    detailedReport: {
      modelConfidence: 92,
      brakingAccuracy: 83,
      accelAccuracy: 81,
      heelStability: 76,
      riskMoments: 4,
    },
  },

  {
    id: "session-001",
    accountId: "driver-003",
    title: { en: "First Demo Session", ko: "첫 데모 주행" },
    date: "2026-04-16 09:00",
    shortDate: "Apr 16",
    score: 89,
    safetyLabel: "SAFE",
    summary: {
      en: "Solid starting performance with clear brake coverage and controlled acceleration.",
      ko: "브레이크 커버 자세와 가속 제어가 명확해 전반적으로 좋은 시작을 보였습니다.",
    },
    feedback: {
      en: [
        "The driver showed strong baseline pedal awareness.",
        "Heel anchoring was stable across most of the session.",
      ],
      ko: [
        "기본적인 페달 인지와 조작 능력이 좋았습니다.",
        "세션 대부분에서 뒤꿈치 고정이 안정적이었습니다.",
      ],
    },
    detailedReport: {
      modelConfidence: 97,
      brakingAccuracy: 90,
      accelAccuracy: 88,
      heelStability: 87,
      riskMoments: 1,
    },
  },
];