export const STAGE_WIDTH = 700;
export const STAGE_HEIGHT = 450;

export const pedals = {
  brake: {
    label: "Brake",
    x: 190,
    y: 118,
    width: 95,
    height: 158,
  },
  accel: {
    label: "Accel",
    x: 400,
    y: 126,
    width: 72,
    height: 176,
  },
};

function clamp(value, lo, hi) {
  return Math.max(lo, Math.min(hi, value));
}

export function getFootDimensions(size = 1.0) {
  return {
    length: 140 * size,
    width: 54 * size,
  };
}

export function rectCenter(rect) {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2,
  };
}

export function rectBottom(rect) {
  return rect.y + rect.height;
}

export function getPedalCenters(layout = pedals) {
  return {
    brake: rectCenter(layout.brake),
    accel: rectCenter(layout.accel),
  };
}

export function getHeelAnchorTarget(size = 1.0, layout = pedals) {
  const centers = getPedalCenters(layout);
  const brakeCenter = centers.brake;
  const accelCenter = centers.accel;

  const brakeBottom = rectBottom(layout.brake);
  const accelBottom = rectBottom(layout.accel);

  const { length } = getFootDimensions(size);
  const pedalGap = accelCenter.x - brakeCenter.x;

  // Still between the pedals, but not as brake-biased as before.
  const heelAnchorX = brakeCenter.x + pedalGap * 0.43;

  const anchorYOffset = clamp(length * 0.22, 40, 56);
  const heelAnchorY = clamp(
    Math.max(brakeBottom, accelBottom) + anchorYOffset,
    Math.max(brakeBottom, accelBottom) + 26,
    STAGE_HEIGHT - 28
  );

  return {
    x: heelAnchorX,
    y: heelAnchorY,
    normalizedX: heelAnchorX / STAGE_WIDTH,
    normalizedY: heelAnchorY / STAGE_HEIGHT,
    betweenPedalsCenterX: (brakeCenter.x + accelCenter.x) / 2,
    brakeCenterX: brakeCenter.x,
    accelCenterX: accelCenter.x,
  };
}

export function getRecommendedFootStart(size = 1.0, layout = pedals) {
  const anchor = getHeelAnchorTarget(size, layout);
  return clampFootCenter(anchor.x, anchor.y, size, 0);
}

export function clampFootCenter(x, y, size = 1.0, angle = 0) {
  const { length, width } = getFootDimensions(size);
  const rad = (angle * Math.PI) / 180;

  const localPoints = [
    [-width * 0.30, 0],
    [width * 0.30, 0],
    [-width * 0.20, -length * 0.34],
    [width * 0.20, -length * 0.34],
    [-width * 0.34, -length * 0.72],
    [width * 0.34, -length * 0.72],
    [-width * 0.24, -length * 0.90],
    [width * 0.24, -length * 0.90],
    [0, -length],
  ];

  const rotated = localPoints.map(([px, py]) => {
    const rx = px * Math.cos(rad) - py * Math.sin(rad);
    const ry = px * Math.sin(rad) + py * Math.cos(rad);
    return { x: rx, y: ry };
  });

  const minX = Math.min(...rotated.map((p) => p.x));
  const maxX = Math.max(...rotated.map((p) => p.x));
  const minY = Math.min(...rotated.map((p) => p.y));
  const maxY = Math.max(...rotated.map((p) => p.y));

  return {
    x: clamp(x, -minX, STAGE_WIDTH - maxX),
    y: clamp(y, -minY, STAGE_HEIGHT - maxY),
  };
}