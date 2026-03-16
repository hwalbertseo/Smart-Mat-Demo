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

export default function MatCanvas({ state, setState, assessment, geometry }) {
  const { length, width } = getFootDimensions(state.size);

  function moveFootTo(x, y) {
    const clamped = clampFootCenter(x, y, state.size);
    setState((prev) => ({
      ...prev,
      footX: clamped.x,
      footY: clamped.y,
    }));
  }

  function handleStageMouseMove(event) {
    if (!state.mouseFollow) return;
    const stage = event.target.getStage();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    moveFootTo(pointer.x, pointer.y);
  }

  function handleDragMove(event) {
    const { x, y } = event.target.position();
    moveFootTo(x, y);
  }

  const footOutlineColor =
    assessment.label === "SAFE"
      ? "#22c55e"
      : assessment.label === "RISK"
      ? "#f59e0b"
      : "#ef4444";

  return (
    <div className="canvas-shell">
      <Stage
        width={STAGE_WIDTH}
        height={STAGE_HEIGHT}
        onMouseMove={handleStageMouseMove}
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
            x={525}
            y={24}
            text={`Intent: ${state.intendedPedal.toUpperCase()}`}
            fill="#e2e8f0"
            fontSize={18}
            fontStyle="bold"
          />

          {Object.entries(pedals).map(([name, rect]) => (
            <Group key={name}>
              <Rect
                x={rect.x}
                y={rect.y}
                width={rect.width}
                height={rect.height}
                cornerRadius={18}
                fill={pedalFill(name)}
                opacity={0.45}
                stroke="#e5e7eb"
                strokeWidth={2}
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
          ))}

          {geometry?.aabb && (
            <Rect
              x={geometry.aabb.x}
              y={geometry.aabb.y}
              width={geometry.aabb.width}
              height={geometry.aabb.height}
              dash={[8, 6]}
              stroke="#f8fafc"
              opacity={0.5}
            />
          )}

          <Group
            x={state.footX}
            y={state.footY}
            rotation={state.angle}
            draggable={!state.mouseFollow}
            onDragMove={handleDragMove}
          >
            <Rect
              x={-length / 2}
              y={-width / 2}
              width={length}
              height={width}
              cornerRadius={width / 2}
              fill="#f4d6c2"
              stroke={footOutlineColor}
              strokeWidth={4}
              shadowBlur={12}
              shadowOpacity={0.35}
            />
            <Circle
              x={length / 2 - width * 0.18}
              y={0}
              radius={width * 0.28}
              fill="#f8e2d1"
              stroke={footOutlineColor}
              strokeWidth={3}
            />
            <Line
              points={[-length * 0.42, 0, length * 0.42, 0]}
              stroke="#7c2d12"
              strokeWidth={2}
              opacity={0.35}
            />
          </Group>

          <Text
            x={24}
            y={418}
            text="Dashed box = approximate rotated-foot hitbox used for overlap calculations"
            fill="#cbd5e1"
            fontSize={14}
          />
        </Layer>
      </Stage>
    </div>
  );
}
