export const STAGE_WIDTH = 700;
export const STAGE_HEIGHT = 450;

export const pedals = {
  brake: {
    x: 210,
    y: 105,
    width: 105,
    height: 165,
  },
  accel: {
    x: 400,
    y: 125,
    width: 68,
    height: 185,
  },
};

export function rectCenter(rect) {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2,
  };
}

export function getFootDimensions(size = 1.25) {
  const safeSize = Math.max(1, Math.min(1.5, Number(size) || 1.25));

  return {
    length: 160 * safeSize,
    width: 58 * safeSize,
  };
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function clampFootCenter(x, y, size = 1.25, angle = 0) {
  const { length, width } = getFootDimensions(size);

  const margin = Math.max(length, width) * 0.52;

  return {
    x: clamp(x, margin, STAGE_WIDTH - margin),
    y: clamp(y, margin, STAGE_HEIGHT - 24),
  };
}

export function normalizeX(x) {
  return clamp(x / STAGE_WIDTH, 0, 1);
}

export function normalizeY(y) {
  return clamp(y / STAGE_HEIGHT, 0, 1);
}

export function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}