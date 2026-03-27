import { Stage, Layer, Rect, Group, Circle, Text, Line } from "react-konva";
import {
  STAGE_WIDTH,
  STAGE_HEIGHT,
  pedals,
  getFootDimensions,
  clampFootCenter,
} from "./pedalGeometry";

function pedalFill(name) {
  return name === "brake" ? "#8b5cf6" : "#0ea5e9";
}

export default function MatCanvas({
  state,
  setState,
  assessment,
  geometry,
  isPressing,
  setIsPressing,
}) {
  const { length, width } = getFootDimensions(state.size);

  function moveFootTo(x, y) {
    const clamped = clampFootCenter(x, y, state.size, state.angle);
    setState((prev) => ({
      ...prev,
      footX: clamped.x,
      footY: clamped.y,
    }));
  }

  function updateFromStagePointer(stage) {
    const pointer = stage?.getPointerPosition();
    if (!pointer) return;
    moveFootTo(pointer.x, pointer.y);
  }

  function handleStageMouseMove(event) {
    const stage = event.target.getStage();
    updateFromStagePointer(stage);
  }

  function handleStageMouseDown(event) {
    const stage = event.target.getStage();
    updateFromStagePointer(stage);
    setIsPressing(true);
  }

  function handleStageMouseUp() {
    setIsPressing(false);
  }

  function handleStageMouseLeave() {
    setIsPressing(false);
  }

  function handleStageWheel(event) {
    event.evt.preventDefault();
    const delta = event.evt.deltaY;
    const step = 8;

    setState((prev) => ({
      ...prev,
      angle: ((prev.angle + (delta > 0 ? step : -step)) % 360 + 360) % 360,
    }));
  }

  const normalizedLabel = String(assessment?.label ?? "").toUpperCase();

  const footOutlineColor =
    normalizedLabel === "SAFE"
      ? "#22c55e"
      : normalizedLabel === "RISK" || normalizedLabel === "WARNING"
      ? "#f59e0b"
      : normalizedLabel === "MISAPPLICATION" ||
        normalizedLabel === "DANGEROUS" ||
        normalizedLabel === "DANGER"
      ? "#ef4444"
      : "#94a3b8";

  const footFill = isPressing ? "#f8e2d1" : "#f4d6c2";

  const intendedLabel =
    geometry?.intendedPedal != null
      ? geometry.intendedPedal.toUpperCase()
      : "UNKNOWN";

  const pressedLabel =
    geometry?.pressedPedal != null
      ? geometry.pressedPedal.toUpperCase()
      : "NONE";

  const heelXMinPx =
    geometry?.heelXMin != null ? geometry.heelXMin * STAGE_WIDTH : null;
  const heelXMaxPx =
    geometry?.heelXMax != null ? geometry.heelXMax * STAGE_WIDTH : null;
  const heelYMinPx =
    geometry?.heelYMin != null ? geometry.heelYMin * STAGE_HEIGHT : null;
  const heelYMaxPx =
    geometry?.heelYMax != null ? geometry.heelYMax * STAGE_HEIGHT : null;

  const heelCenterXPx =
    geometry?.heelCenterX != null ? geometry.heelCenterX * STAGE_WIDTH : null;
  const heelCenterYPx =
    geometry?.heelCenterY != null ? geometry.heelCenterY * STAGE_HEIGHT : null;

  const heelAnchorXPx =
    geometry?.heelAnchorX != null ? geometry.heelAnchorX * STAGE_WIDTH : null;
  const heelAnchorYPx =
    geometry?.heelAnchorY != null ? geometry.heelAnchorY * STAGE_HEIGHT : null;

  const heelHalfW = width * 0.30;
  const archHalfW = width * 0.20;
  const ballHalfW = width * 0.34;
  const toeHalfW = width * 0.24;

  const outlinePoints = [
    -heelHalfW,
    0,
    -heelHalfW * 1.05,
    -length * 0.08,
    -archHalfW,
    -length * 0.34,
    -ballHalfW,
    -length * 0.72,
    -toeHalfW * 0.95,
    -length * 0.90,
    0,
    -length,
    toeHalfW * 0.95,
    -length * 0.90,
    ballHalfW,
    -length * 0.72,
    archHalfW,
    -length * 0.34,
    heelHalfW * 1.05,
    -length * 0.08,
    heelHalfW,
    0,
  ];

  return (
    <div className="canvas-shell">
      <Stage
        width={STAGE_WIDTH}
        height={STAGE_HEIGHT}
        onMouseMove={handleStageMouseMove}
        onMouseDown={handleStageMouseDown}
        onMouseUp={handleStageMouseUp}
        onMouseLeave={handleStageMouseLeave}
        onWheel={handleStageWheel}
      >
        <Layer>
          <Rect
            x={18}
            y={18}
            width={STAGE_WIDTH - 36}
            height={STAGE_HEIGHT - 36}
            cornerRadius={28}
            fill="#1f2937"
            stroke="#475569"
            strokeWidth={3}
          />

          <Rect
            x={48}
            y={42}
            width={145}
            height={360}
            cornerRadius={24}
            fill="#111827"
            opacity={0.55}
          />
          <Text
            x={64}
            y={54}
            text="Seat side"
            fill="#cbd5e1"
            fontSize={18}
            fontStyle="bold"
          />

          <Text
            x={505}
            y={24}
            text={`Intent: ${intendedLabel}`}
            fill="#e2e8f0"
            fontSize={18}
            fontStyle="bold"
          />

          <Text
            x={470}
            y={46}
            text={`Press: ${pressedLabel}`}
            fill="#cbd5e1"
            fontSize={16}
            fontStyle="bold"
          />

          {Object.entries(pedals).map(([name, rect]) => {
            const isPressed = geometry?.pressedPedal === name;
            const isIntended = geometry?.intendedPedal === name;

            return (
              <Group key={name}>
                <Rect
                  x={rect.x}
                  y={rect.y}
                  width={rect.width}
                  height={rect.height}
                  cornerRadius={18}
                  fill={pedalFill(name)}
                  opacity={isPressed ? 0.72 : 0.45}
                  stroke={isPressed ? "#f8fafc" : isIntended ? "#fde68a" : "#e5e7eb"}
                  strokeWidth={isPressed ? 4 : isIntended ? 3 : 2}
                />
                <Text
                  x={rect.x}
                  y={rect.y - 26}
                  width={rect.width}
                  align="center"
                  text={rect.label}
                  fill="#e5e7eb"
                  fontSize={16}
                  fontStyle="bold"
                />
              </Group>
            );
          })}

          {heelXMinPx != null &&
            heelXMaxPx != null &&
            heelYMinPx != null &&
            heelYMaxPx != null && (
              <Rect
                x={heelXMinPx}
                y={heelYMinPx}
                width={heelXMaxPx - heelXMinPx}
                height={heelYMaxPx - heelYMinPx}
                stroke="#22d3ee"
                strokeWidth={2}
                dash={[5, 4]}
                opacity={0.9}
              />
            )}

          {heelAnchorXPx != null &&
            heelAnchorYPx != null &&
            heelCenterXPx != null &&
            heelCenterYPx != null && (
              <Line
                points={[
                  heelAnchorXPx,
                  heelAnchorYPx,
                  heelCenterXPx,
                  heelCenterYPx,
                ]}
                stroke="#fca5a5"
                dash={[4, 4]}
                opacity={0.85}
              />
            )}

          {heelAnchorXPx != null && heelAnchorYPx != null && (
            <Circle
              x={heelAnchorXPx}
              y={heelAnchorYPx}
              radius={6}
              fill="#fda4af"
              stroke="#881337"
              strokeWidth={2}
            />
          )}

          {heelCenterXPx != null && heelCenterYPx != null && (
            <Circle
              x={heelCenterXPx}
              y={heelCenterYPx}
              radius={6}
              fill="#67e8f9"
              stroke="#155e75"
              strokeWidth={2}
            />
          )}

          {heelCenterXPx != null && heelCenterYPx != null && (
            <Group x={heelCenterXPx} y={heelCenterYPx} rotation={state.angle}>
              <Line
                points={outlinePoints}
                closed
                tension={0.35}
                fill={footFill}
                stroke={footOutlineColor}
                strokeWidth={4}
                shadowBlur={12}
                shadowOpacity={0.35}
              />

              <Circle
                x={0}
                y={-length * 0.04}
                radius={width * 0.16}
                fill="#efc8b3"
                opacity={0.45}
              />

              <Circle
                x={0}
                y={-length * 0.73}
                radius={width * 0.18}
                fill="#efc8b3"
                opacity={0.30}
              />

              <Circle
                x={-width * 0.16}
                y={-length * 0.93}
                radius={width * 0.07}
                fill="#f8e2d1"
                stroke={footOutlineColor}
                strokeWidth={2}
              />
              <Circle
                x={-width * 0.07}
                y={-length * 0.965}
                radius={width * 0.078}
                fill="#f8e2d1"
                stroke={footOutlineColor}
                strokeWidth={2}
              />
              <Circle
                x={width * 0.02}
                y={-length * 0.98}
                radius={width * 0.085}
                fill="#f8e2d1"
                stroke={footOutlineColor}
                strokeWidth={2}
              />
              <Circle
                x={width * 0.12}
                y={-length * 0.95}
                radius={width * 0.075}
                fill="#f8e2d1"
                stroke={footOutlineColor}
                strokeWidth={2}
              />
              <Circle
                x={width * 0.20}
                y={-length * 0.90}
                radius={width * 0.062}
                fill="#f8e2d1"
                stroke={footOutlineColor}
                strokeWidth={2}
              />

              <Line
                points={[0, -length * 0.08, 0, -length * 0.92]}
                stroke="#7c2d12"
                strokeWidth={2}
                opacity={0.22}
              />
            </Group>
          )}

          <Text
            x={24}
            y={392}
            text="Move mouse = reposition foot | Hold click = active press | Scroll = rotate foot"
            fill="#cbd5e1"
            fontSize={14}
          />
          <Text
            x={24}
            y={412}
            text="Pink dot = heel anchor | Cyan box/dot = estimated heel contact region"
            fill="#cbd5e1"
            fontSize={14}
          />
        </Layer>
      </Stage>
    </div>
  );
}