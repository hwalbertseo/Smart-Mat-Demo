import {
  STAGE_WIDTH,
  STAGE_HEIGHT,
  getFootDimensions,
  rectCenter,
} from "./pedalGeometry";

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function aabbFromFoot(state) {
  const { footX, footY, angle, size } = state;
  const { length, width } = getFootDimensions(size);

  const rad = (angle * Math.PI) / 180;
  const aabbWidth = Math.abs(length * Math.cos(rad)) + Math.abs(width * Math.sin(rad));
  const aabbHeight = Math.abs(length * Math.sin(rad)) + Math.abs(width * Math.cos(rad));

  return {
    x: footX - aabbWidth / 2,
    y: footY - aabbHeight / 2,
    width: aabbWidth,
    height: aabbHeight,
    area: aabbWidth * aabbHeight,
    length,
    widthRaw: width,
  };
}

function overlapRatio(aabb, rect) {
  const xOverlap = Math.max(
    0,
    Math.min(aabb.x + aabb.width, rect.x + rect.width) - Math.max(aabb.x, rect.x)
  );
  const yOverlap = Math.max(
    0,
    Math.min(aabb.y + aabb.height, rect.y + rect.height) - Math.max(aabb.y, rect.y)
  );

  const area = xOverlap * yOverlap;
  return clamp01(area / Math.max(aabb.area, 1));
}

function normalizedDistance(x1, y1, x2, y2) {
  const dx = x1 - x2;
  const dy = y1 - y2;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const maxDist = Math.sqrt(STAGE_WIDTH ** 2 + STAGE_HEIGHT ** 2);
  return clamp01(dist / maxDist);
}

export function computeFeatures(state, pedals) {
  const aabb = aabbFromFoot(state);
  const brakeCenter = rectCenter(pedals.brake);
  const accelCenter = rectCenter(pedals.accel);

  const brakeOverlap = overlapRatio(aabb, pedals.brake);
  const accelOverlap = overlapRatio(aabb, pedals.accel);
  const maxOverlap = Math.max(brakeOverlap, accelOverlap);
  const bothOverlap = Math.min(brakeOverlap, accelOverlap);

  const distBrake = normalizedDistance(state.footX, state.footY, brakeCenter.x, brakeCenter.y);
  const distAccel = normalizedDistance(state.footX, state.footY, accelCenter.x, accelCenter.y);
  const angleAbs = Math.abs(state.angle);
  const anglePenalty = clamp01(Math.max(0, angleAbs - 15) / 45);

  const intendedRect = state.intendedPedal === "brake" ? pedals.brake : pedals.accel;
  const intendedCenter = rectCenter(intendedRect);
  const distIntended = normalizedDistance(
    state.footX,
    state.footY,
    intendedCenter.x,
    intendedCenter.y
  );

  const vector = [
    state.footX / STAGE_WIDTH,
    state.footY / STAGE_HEIGHT,
    state.angle / 90,
    state.size,
    brakeOverlap,
    accelOverlap,
    distBrake,
    distAccel,
    distIntended,
    anglePenalty,
  ];

  return {
    vector,
    geometry: {
      aabb,
      brakeOverlap,
      accelOverlap,
      bothOverlap,
      distBrake,
      distAccel,
      distIntended,
      maxOverlap,
      anglePenalty,
    },
  };
}

export function ruleBasedAssessment(featureResult, state) {
  const { brakeOverlap, accelOverlap, bothOverlap, anglePenalty, distIntended, maxOverlap } =
    featureResult.geometry;

  const intendedIsBrake = state.intendedPedal === "brake";
  const wrongOverlap = intendedIsBrake ? accelOverlap : brakeOverlap;
  const rightOverlap = intendedIsBrake ? brakeOverlap : accelOverlap;

  let riskScore =
    0.10 +
    bothOverlap * 0.60 +
    wrongOverlap * 0.45 +
    anglePenalty * 0.18 +
    distIntended * 0.25 -
    rightOverlap * 0.12 -
    maxOverlap * 0.08;

  riskScore = clamp01(riskScore);

  let label = "SAFE";
  if (wrongOverlap > 0.18 && wrongOverlap > rightOverlap) {
    label = "MISAPPLICATION";
  } else if (riskScore > 0.48 || bothOverlap > 0.12) {
    label = "RISK";
  }

  return {
    label,
    riskScore,
    probs: label === "SAFE" ? [0.8, 0.15, 0.05] : label === "RISK" ? [0.15, 0.7, 0.15] : [0.05, 0.1, 0.85],
    source: "rules",
  };
}
