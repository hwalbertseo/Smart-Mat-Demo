export const STAGE_WIDTH = 700;
export const STAGE_HEIGHT = 450;

export const pedals = {
  brake: {
    label: "Brake",
    x: 180,
    y: 110,
    width: 110,
    height: 170,
  },
  accel: {
    label: "Accelerator",
    x: 470,
    y: 130,
    width: 70,
    height: 190,
  },
};

export function getFootDimensions(size = 1.0) {
  return {
    length: 140 * size,
    width: 54 * size,
  };
}

export function clampFootCenter(x, y, size = 1.0) {
  const { length, width } = getFootDimensions(size);
  const pad = Math.max(length, width) * 0.55;

  return {
    x: Math.min(STAGE_WIDTH - pad, Math.max(pad, x)),
    y: Math.min(STAGE_HEIGHT - pad, Math.max(pad, y)),
  };
}

export function rectCenter(rect) {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2,
  };
}
