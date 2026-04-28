import {
  STAGE_WIDTH,
  STAGE_HEIGHT,
  clamp,
  getFootDimensions,
  normalizeX,
  normalizeY,
} from "./pedalGeometry";

export const FEATURE_NAMES = [
  "heel_x_min",
  "heel_x_max",
  "heel_y_min",
  "heel_y_max",
  "heel_center_x",
  "heel_center_y",
  "heel_width",
  "heel_height",
  "heel_area",
  "heel_pressure",
  "brake_pressed",
  "accel_pressed",
  "car_velocity_kph",
  "heel_anchor_dx",
  "heel_anchor_dy",
  "heel_motion_mag",
  "heel_lateral_offset",
  "heel_brake_side_bias",
  "heel_accel_side_bias",
  "pressure_velocity",
  "intended_is_brake",
  "intended_is_accel",
  "actual_is_none",
  "intended_pressed_match",
  "intended_pedal_code",
  "pressed_state_code",
];

// These constants match your synthetic data generator.
const TRAINING_PEDALS = {
  brake: {
    cx: 0.32,
    cy: 0.44,
    w: 0.13,
    h: 0.28,
    heel_target_y: 0.83,
  },
  accel: {
    cx: 0.73,
    cy: 0.46,
    w: 0.08,
    h: 0.32,
    heel_target_y: 0.84,
  },
};

const TRAINING_HEEL_ANCHOR = {
  x:
    0.68 * TRAINING_PEDALS.brake.cx +
    0.32 * TRAINING_PEDALS.accel.cx,
  y:
    (TRAINING_PEDALS.brake.heel_target_y +
      TRAINING_PEDALS.accel.heel_target_y) /
    2,
};

function inferForefootPoint(state) {
  const { length } = getFootDimensions(state.size);
  const rad = ((Number(state.angle) || 0) * Math.PI) / 180;

  return {
    x: state.footX + Math.sin(rad) * (length * 0.62),
    y: state.footY - Math.cos(rad) * (length * 0.62),
  };
}

function normalizedDistanceToRect(point, rect) {
  const closestX = clamp(point.x, rect.x, rect.x + rect.width);
  const closestY = clamp(point.y, rect.y, rect.y + rect.height);
  return Math.hypot(point.x - closestX, point.y - closestY) /
    Math.hypot(STAGE_WIDTH, STAGE_HEIGHT);
}

function pointInRectScore(point, rect, pad = 36) {
  const closestX = clamp(point.x, rect.x, rect.x + rect.width);
  const closestY = clamp(point.y, rect.y, rect.y + rect.height);
  const d = Math.hypot(point.x - closestX, point.y - closestY);

  if (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  ) {
    return 1;
  }

  return clamp(1 - d / pad, 0, 1);
}

function buildVector(features) {
  return FEATURE_NAMES.map((name) => {
    const value = features[name];

    if (typeof value === "string") {
      if (value === "brake") return 0;
      if (value === "accel") return 1;
      if (value === "none") return 0;
      return 0;
    }

    return Number(value ?? 0);
  });
}

export function computeFeatures(state, pedals) {
  const forefoot = inferForefootPoint(state);

  const heelCenterX = normalizeX(Number(state.footX) || 0);
  const heelCenterY = normalizeY(Number(state.footY) || 0);

  // Match generator-style heel box:
  // width around 0.10, height around 0.07.
  // We let foot size slightly affect it, but keep it near training distribution.
  const safeSize = Number(state.size) || 1.35;
  const heelWidth = clamp(0.1 * (safeSize / 1.35), 0.06, 0.16);
  const heelHeight = clamp(0.07 * (safeSize / 1.35), 0.04, 0.12);

  const heelXMin = clamp(heelCenterX - heelWidth / 2, 0, 1);
  const heelXMax = clamp(heelCenterX + heelWidth / 2, 0, 1);
  const heelYMin = clamp(heelCenterY - heelHeight / 2, 0, 1);
  const heelYMax = clamp(heelCenterY + heelHeight / 2, 0, 1);

  const heelArea = heelWidth * heelHeight;

  const intendedPedal = state.intendedPedal ?? "brake";
  const pressedPedal = state.pressedPedal ?? "none";

  const brakePressed = pressedPedal === "brake" ? 1 : 0;
  const accelPressed = pressedPedal === "accel" ? 1 : 0;
  const actualIsNone = pressedPedal === "none" ? 1 : 0;

  const intendedIsBrake = intendedPedal === "brake" ? 1 : 0;
  const intendedIsAccel = intendedPedal === "accel" ? 1 : 0;

  const intendedPressedMatch =
    pressedPedal !== "none" && pressedPedal === intendedPedal ? 1 : 0;

  // Critical: these must be signed raw normalized differences,
  // NOT normalizeX/normalizeY, because the model was trained on signed dx/dy.
  const heelAnchorDx = heelCenterX - TRAINING_HEEL_ANCHOR.x;
  const heelAnchorDy = heelCenterY - TRAINING_HEEL_ANCHOR.y;

  const heelMotionMag = Math.hypot(heelAnchorDx, heelAnchorDy);

  // Likely derived features from your training pipeline.
  // These keep values in the same small, raw normalized scale.
  const heelLateralOffset = heelAnchorDx;
  const heelBrakeSideBias = Math.max(0, -heelAnchorDx);
  const heelAccelSideBias = Math.max(0, heelAnchorDx);

  const heelPressure = Number(state.heelPressure) || 0;
  const carVelocityKph = Number(state.carVelocityKph) || 0;
  const pressureVelocity = heelPressure * carVelocityKph;

  const brakeOverlap = pointInRectScore(forefoot, pedals.brake);
  const accelOverlap = pointInRectScore(forefoot, pedals.accel);

  const features = {
    heel_x_min: heelXMin,
    heel_x_max: heelXMax,
    heel_y_min: heelYMin,
    heel_y_max: heelYMax,
    heel_center_x: heelCenterX,
    heel_center_y: heelCenterY,
    heel_width: heelWidth,
    heel_height: heelHeight,
    heel_area: heelArea,
    heel_pressure: heelPressure,
    brake_pressed: brakePressed,
    accel_pressed: accelPressed,
    car_velocity_kph: carVelocityKph,
    heel_anchor_dx: heelAnchorDx,
    heel_anchor_dy: heelAnchorDy,
    heel_motion_mag: heelMotionMag,
    heel_lateral_offset: heelLateralOffset,
    heel_brake_side_bias: heelBrakeSideBias,
    heel_accel_side_bias: heelAccelSideBias,
    pressure_velocity: pressureVelocity,
    intended_is_brake: intendedIsBrake,
    intended_is_accel: intendedIsAccel,
    actual_is_none: actualIsNone,
    intended_pressed_match: intendedPressedMatch,

    // Categorical raw values. modelRunner.js will encode these using metadata maps.
    intended_pedal_code: intendedPedal,
    pressed_state_code: pressedPedal,

    // Backward-compatible aliases for UI/rule-based fallback.
    heel_x: heelCenterX,
    heel_y: heelCenterY,
    forefoot_x: normalizeX(forefoot.x),
    forefoot_y: normalizeY(forefoot.y),
    foot_angle_deg: Number(state.angle) || 0,
    foot_size: safeSize,
    brake_overlap: brakeOverlap,
    accel_overlap: accelOverlap,
    brake_distance: normalizedDistanceToRect(forefoot, pedals.brake),
    accel_distance: normalizedDistanceToRect(forefoot, pedals.accel),
    intended_brake: intendedIsBrake,
    intended_accel: intendedIsAccel,
    pressed_brake: brakePressed,
    pressed_accel: accelPressed,
    intended_pedal: intendedPedal,
    pressed_state: pressedPedal,
    pressed_pedal: pressedPedal,
  };

  const geometry = {
    intendedPedal,
    pressedPedal,
    forefootX: forefoot.x,
    forefootY: forefoot.y,
    heelCenterX,
    heelCenterY,
    heelAnchorX: TRAINING_HEEL_ANCHOR.x,
    heelAnchorY: TRAINING_HEEL_ANCHOR.y,
    heelXMin,
    heelXMax,
    heelYMin,
    heelYMax,
  };

  return {
    features,
    geometry,
    vector: buildVector(features),
    featureNames: FEATURE_NAMES,
  };
}

export function ruleBasedAssessment(featureResult) {
  const features = featureResult.features;
  const geometry = featureResult.geometry;

  const speed = Number(features.car_velocity_kph) || 0;
  const heelPressure = Number(features.heel_pressure) || 0;

  const intended = geometry.intendedPedal;
  const pressed = geometry.pressedPedal;

  const isPressingPedal = pressed === "brake" || pressed === "accel";
  const mismatch = isPressingPedal && intended !== pressed;

  const fastVehicle = speed >= 20;
  const veryFastVehicle = speed >= 45;

  const unstableHeel =
    Math.abs(features.heel_anchor_dx) > 0.07 ||
    Math.abs(features.heel_anchor_dy) > 0.09 ||
    heelPressure < 18;

  const accelPressedWhenBrakeIntended =
    intended === "brake" && pressed === "accel";

  let riskScore = 0.05;

  if (!isPressingPedal) riskScore += 0.1;
  if (unstableHeel) riskScore += 0.22;
  if (fastVehicle) riskScore += 0.14;
  if (veryFastVehicle) riskScore += 0.12;
  if (mismatch) riskScore += 0.38;
  if (accelPressedWhenBrakeIntended) riskScore += 0.22;

  riskScore = clamp(riskScore, 0, 1);

  let label = "SAFE";

  if (riskScore >= 0.72 || accelPressedWhenBrakeIntended) {
    label = "MISAPPLICATION";
  } else if (riskScore >= 0.38 || mismatch || unstableHeel) {
    label = "RISK";
  }

  return {
    label,
    riskScore,
    probs:
      label === "SAFE"
        ? [1 - riskScore, riskScore * 0.75, riskScore * 0.25]
        : label === "RISK"
        ? [0.2, Math.max(0.55, riskScore), 0.25]
        : [0.08, 0.2, Math.max(0.72, riskScore)],
    source: "rules",
  };
}