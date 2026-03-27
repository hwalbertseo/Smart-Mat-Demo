import {
  STAGE_WIDTH,
  STAGE_HEIGHT,
  getFootDimensions,
  getHeelAnchorTarget,
} from "./pedalGeometry";

const INTENDED_MAP = { brake: 0, accel: 1 };
const PRESSED_STATE_MAP = { none: 0, brake: 1, accel: 2 };

function clamp(value, lo, hi) {
  return Math.max(lo, Math.min(hi, value));
}

function clamp01(value) {
  return clamp(value, 0, 1);
}

function normalizeX(px) {
  return clamp01(px / STAGE_WIDTH);
}

function normalizeY(py) {
  return clamp01(py / STAGE_HEIGHT);
}

function estimateHeelPatch(state) {
  const heelCenterXPx = state.footX;
  const heelCenterYPx = state.footY;

  const { length, width } = getFootDimensions(state.size ?? 1.0);

  const heelBoxWidthPx = width * 0.95;
  const heelBoxHeightPx = length * 0.22;

  const heelXMin = normalizeX(heelCenterXPx - heelBoxWidthPx / 2);
  const heelXMax = normalizeX(heelCenterXPx + heelBoxWidthPx / 2);
  const heelYMin = normalizeY(heelCenterYPx - heelBoxHeightPx / 2);
  const heelYMax = normalizeY(heelCenterYPx + heelBoxHeightPx / 2);

  return {
    heelCenterX: normalizeX(heelCenterXPx),
    heelCenterY: normalizeY(heelCenterYPx),
    heelXMin,
    heelXMax,
    heelYMin,
    heelYMax,
    heelWidth: heelXMax - heelXMin,
    heelHeight: heelYMax - heelYMin,
    heelArea: (heelXMax - heelXMin) * (heelYMax - heelYMin),
  };
}

function buildHeelAnchor(state, pedals) {
  const anchor = getHeelAnchorTarget(state.size ?? 1.0, pedals);

  return {
    brakeX: anchor.brakeCenterX / STAGE_WIDTH,
    accelX: anchor.accelCenterX / STAGE_WIDTH,
    betweenPedalsCenter: anchor.betweenPedalsCenterX / STAGE_WIDTH,
    heelAnchorX: anchor.normalizedX,
    heelAnchorY: anchor.normalizedY,
  };
}

function pressedPedalToBinary(pressedPedal) {
  return {
    brakePressed: pressedPedal === "brake" ? 1 : 0,
    accelPressed: pressedPedal === "accel" ? 1 : 0,
  };
}

function buildFeatureObject(state, pedals) {
  const intendedPedal = state.intendedPedal === "accel" ? "accel" : "brake";
  const pressedPedal =
    state.pressedPedal === "brake" || state.pressedPedal === "accel"
      ? state.pressedPedal
      : "none";

  const velocity = Math.max(
    0,
    Number(state.carVelocityKph ?? state.carVelocity ?? 0)
  );
  const heelPressure = clamp(Number(state.heelPressure ?? 45), 0, 100);

  const heel = estimateHeelPatch(state);
  const anchor = buildHeelAnchor(state, pedals);
  const { brakePressed, accelPressed } = pressedPedalToBinary(pressedPedal);

  const heelAnchorDx = heel.heelCenterX - anchor.heelAnchorX;
  const heelAnchorDy = heel.heelCenterY - anchor.heelAnchorY;
  const heelMotionMag = Math.hypot(heelAnchorDx, heelAnchorDy);
  const heelLateralOffset = heel.heelCenterX - anchor.betweenPedalsCenter;
  const heelBrakeSideBias = heel.heelCenterX - anchor.brakeX;
  const heelAccelSideBias = heel.heelCenterX - anchor.accelX;
  const pressureVelocity = heelPressure * velocity;
  const intendedIsBrake = intendedPedal === "brake" ? 1 : 0;
  const intendedIsAccel = intendedPedal === "accel" ? 1 : 0;
  const actualIsNone = pressedPedal === "none" ? 1 : 0;
  const intendedPressedMatch =
    (intendedPedal === "brake" && brakePressed === 1) ||
    (intendedPedal === "accel" && accelPressed === 1)
      ? 1
      : 0;

  return {
    heel_x_min: heel.heelXMin,
    heel_x_max: heel.heelXMax,
    heel_y_min: heel.heelYMin,
    heel_y_max: heel.heelYMax,
    heel_center_x: heel.heelCenterX,
    heel_center_y: heel.heelCenterY,
    heel_width: heel.heelWidth,
    heel_height: heel.heelHeight,
    heel_area: heel.heelArea,
    heel_pressure: heelPressure,
    brake_pressed: brakePressed,
    accel_pressed: accelPressed,
    car_velocity_kph: velocity,
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
    intended_pedal_code: INTENDED_MAP[intendedPedal],
    pressed_state_code: PRESSED_STATE_MAP[pressedPedal],
  };
}

export function computeFeatures(state, pedals) {
  const features = buildFeatureObject(state, pedals);

  const vector = [
    features.heel_x_min,
    features.heel_x_max,
    features.heel_y_min,
    features.heel_y_max,
    features.heel_center_x,
    features.heel_center_y,
    features.heel_width,
    features.heel_height,
    features.heel_area,
    features.heel_pressure,
    features.brake_pressed,
    features.accel_pressed,
    features.car_velocity_kph,
    features.heel_anchor_dx,
    features.heel_anchor_dy,
    features.heel_motion_mag,
    features.heel_lateral_offset,
    features.heel_brake_side_bias,
    features.heel_accel_side_bias,
    features.pressure_velocity,
    features.intended_is_brake,
    features.intended_is_accel,
    features.actual_is_none,
    features.intended_pressed_match,
    features.intended_pedal_code,
    features.pressed_state_code,
  ];

  return {
    vector,
    features,
    geometry: {
      heelCenterX: features.heel_center_x,
      heelCenterY: features.heel_center_y,
      heelXMin: features.heel_x_min,
      heelXMax: features.heel_x_max,
      heelYMin: features.heel_y_min,
      heelYMax: features.heel_y_max,
      heelAnchorX: features.heel_center_x - features.heel_anchor_dx,
      heelAnchorY: features.heel_center_y - features.heel_anchor_dy,
      brakePressed: features.brake_pressed,
      accelPressed: features.accel_pressed,
      pressedPedal:
        features.pressed_state_code === PRESSED_STATE_MAP.brake
          ? "brake"
          : features.pressed_state_code === PRESSED_STATE_MAP.accel
          ? "accel"
          : "none",
      intendedPedal:
        features.intended_pedal_code === INTENDED_MAP.accel
          ? "accel"
          : "brake",
    },
  };
}

export function ruleBasedAssessment(featureResult, state, pedals) {
  const { features, geometry } = featureResult;
  const intended = geometry.intendedPedal;
  const pressedPedal = geometry.pressedPedal;

  const heelXError = Math.abs(features.heel_anchor_dx);
  const heelYError = Math.abs(features.heel_anchor_dy);
  const velocityNorm = clamp(features.car_velocity_kph / 80, 0, 1.5);

  const heelOutsidePedalLane =
    features.heel_center_x < geometry.heelAnchorX - 0.22 ||
    features.heel_center_x > geometry.heelAnchorX + 0.38;

  const wrongPedal = pressedPedal !== "none" && pressedPedal !== intended;
  const noPedalWhileMoving =
    pressedPedal === "none" && features.car_velocity_kph > 8;

  let riskScore = 0;
  riskScore += Math.max(0, heelXError - 0.03) * 7.5;
  riskScore += Math.max(0, heelYError - 0.04) * 5.5;
  riskScore += Math.max(0, features.heel_motion_mag - 0.06) * 4.0;
  riskScore += Math.max(0, Math.abs(features.heel_lateral_offset) - 0.12) * 3.5;
  riskScore += velocityNorm * 0.25;

  if (heelOutsidePedalLane) riskScore += 0.8;
  if (noPedalWhileMoving) riskScore += 0.35;

  if (wrongPedal) {
    riskScore +=
      intended === "brake" ? 2.8 + 0.5 * velocityNorm : 2.2 + 0.35 * velocityNorm;
  }

  if (
    intended === "brake" &&
    pressedPedal === "accel" &&
    features.car_velocity_kph > 20
  ) {
    riskScore += 0.9;
  }

  riskScore = clamp01(riskScore / 3.6);

  let label = "SAFE";
  if (wrongPedal || riskScore >= 0.82) {
    label = "MISAPPLICATION";
  } else if (riskScore >= 0.35) {
    label = "RISK";
  }

  return {
    label,
    riskScore,
    probs:
      label === "SAFE"
        ? [0.84, 0.12, 0.04]
        : label === "RISK"
        ? [0.15, 0.70, 0.15]
        : [0.03, 0.10, 0.87],
    source: "rules",
  };
}