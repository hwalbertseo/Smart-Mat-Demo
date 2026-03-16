import math
import random
from pathlib import Path

import torch
import torch.nn as nn
import torch.optim as optim

STAGE_WIDTH = 700
STAGE_HEIGHT = 450

PEDALS = {
    "brake": {"x": 180, "y": 110, "width": 110, "height": 170},
    "accel": {"x": 470, "y": 130, "width": 70, "height": 190},
}


def get_foot_dimensions(size: float = 1.0):
    return {
        "length": 140 * size,
        "width": 54 * size,
    }


def rect_center(rect):
    return rect["x"] + rect["width"] / 2, rect["y"] + rect["height"] / 2


def clamp01(value: float) -> float:
    return max(0.0, min(1.0, value))


def foot_aabb(foot_x, foot_y, angle_deg, size):
    dims = get_foot_dimensions(size)
    length = dims["length"]
    width = dims["width"]
    rad = math.radians(angle_deg)

    aabb_width = abs(length * math.cos(rad)) + abs(width * math.sin(rad))
    aabb_height = abs(length * math.sin(rad)) + abs(width * math.cos(rad))

    return {
        "x": foot_x - aabb_width / 2,
        "y": foot_y - aabb_height / 2,
        "width": aabb_width,
        "height": aabb_height,
        "area": aabb_width * aabb_height,
    }


def overlap_ratio(aabb, rect):
    x_overlap = max(
        0.0,
        min(aabb["x"] + aabb["width"], rect["x"] + rect["width"]) - max(aabb["x"], rect["x"]),
    )
    y_overlap = max(
        0.0,
        min(aabb["y"] + aabb["height"], rect["y"] + rect["height"]) - max(aabb["y"], rect["y"]),
    )
    return clamp01((x_overlap * y_overlap) / max(aabb["area"], 1e-6))


def normalized_distance(x1, y1, x2, y2):
    dist = math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)
    max_dist = math.sqrt(STAGE_WIDTH ** 2 + STAGE_HEIGHT ** 2)
    return clamp01(dist / max_dist)


def make_sample():
    intended_pedal = random.choice(["brake", "accel"])
    intended_rect = PEDALS[intended_pedal]
    wrong_pedal = "accel" if intended_pedal == "brake" else "brake"
    wrong_rect = PEDALS[wrong_pedal]

    scenario = random.choices(
        population=["safe", "risk", "misapplication"],
        weights=[0.52, 0.28, 0.20],
        k=1,
    )[0]

    intended_cx, intended_cy = rect_center(intended_rect)
    wrong_cx, wrong_cy = rect_center(wrong_rect)

    if scenario == "safe":
        foot_x = random.gauss(intended_cx, 28)
        foot_y = random.gauss(intended_cy, 34)
        angle = random.gauss(0, 10)
        size = random.uniform(0.85, 1.18)
    elif scenario == "risk":
        foot_x = random.gauss((intended_cx + wrong_cx) / 2, 40)
        foot_y = random.gauss((intended_cy + wrong_cy) / 2, 42)
        angle = random.choice([random.gauss(24, 10), random.gauss(-24, 10)])
        size = random.uniform(0.90, 1.25)
    else:
        foot_x = random.gauss(wrong_cx, 30)
        foot_y = random.gauss(wrong_cy, 34)
        angle = random.choice([random.gauss(18, 14), random.gauss(-18, 14)])
        size = random.uniform(0.85, 1.22)

    foot_x = max(40, min(STAGE_WIDTH - 40, foot_x))
    foot_y = max(40, min(STAGE_HEIGHT - 40, foot_y))
    angle = max(-60, min(60, angle))

    aabb = foot_aabb(foot_x, foot_y, angle, size)
    brake_overlap = overlap_ratio(aabb, PEDALS["brake"])
    accel_overlap = overlap_ratio(aabb, PEDALS["accel"])

    brake_cx, brake_cy = rect_center(PEDALS["brake"])
    accel_cx, accel_cy = rect_center(PEDALS["accel"])
    intended_cx, intended_cy = rect_center(intended_rect)

    dist_brake = normalized_distance(foot_x, foot_y, brake_cx, brake_cy)
    dist_accel = normalized_distance(foot_x, foot_y, accel_cx, accel_cy)
    dist_intended = normalized_distance(foot_x, foot_y, intended_cx, intended_cy)
    angle_penalty = clamp01(max(0.0, abs(angle) - 15.0) / 45.0)

    features = [
        foot_x / STAGE_WIDTH,
        foot_y / STAGE_HEIGHT,
        angle / 90.0,
        size,
        brake_overlap,
        accel_overlap,
        dist_brake,
        dist_accel,
        dist_intended,
        angle_penalty,
    ]

    if scenario == "safe":
        label = 0
    elif scenario == "risk":
        label = 1
    else:
        label = 2

    return features, label


class SmartMatMLP(nn.Module):
    def __init__(self, in_dim=10, hidden1=16, hidden2=8, out_dim=3):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(in_dim, hidden1),
            nn.ReLU(),
            nn.Linear(hidden1, hidden2),
            nn.ReLU(),
            nn.Linear(hidden2, out_dim),
        )

    def forward(self, x):
        return self.net(x)


def main():
    random.seed(7)
    torch.manual_seed(7)

    train_samples = 7000
    X = []
    y = []

    for _ in range(train_samples):
        feats, label = make_sample()
        X.append(feats)
        y.append(label)

    X = torch.tensor(X, dtype=torch.float32)
    y = torch.tensor(y, dtype=torch.long)

    model = SmartMatMLP()
    optimizer = optim.Adam(model.parameters(), lr=1e-3)
    loss_fn = nn.CrossEntropyLoss()

    for epoch in range(400):
        optimizer.zero_grad()
        logits = model(X)
        loss = loss_fn(logits, y)
        loss.backward()
        optimizer.step()

        if epoch % 50 == 0:
            preds = logits.argmax(dim=1)
            acc = (preds == y).float().mean().item()
            print(f"epoch={epoch:03d} loss={loss.item():.4f} acc={acc:.3f}")

    out_path = Path(__file__).resolve().parent / "smart_mat.pt"
    torch.save(model.state_dict(), out_path)
    print(f"Saved weights to {out_path}")


if __name__ == "__main__":
    main()
