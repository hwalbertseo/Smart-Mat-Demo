
import numpy as np
import pandas as pd

PEDALS = {
    "brake": {
        "cx": 0.32,
        "cy": 0.44,
        "w": 0.13,
        "h": 0.28,
        "heel_target_y": 0.83,
    },
    "accel": {
        "cx": 0.73,
        "cy": 0.46,
        "w": 0.08,
        "h": 0.32,
        "heel_target_y": 0.84,
    },
}

# Safe posture assumption:
# the heel pivots on the floor between brake and accelerator, but sits
# somewhat closer to the brake so the driver can cover the brake quickly.
HEEL_ANCHOR = {
    "x": 0.68 * PEDALS["brake"]["cx"] + 0.32 * PEDALS["accel"]["cx"],
    "y": float(np.mean([PEDALS["brake"]["heel_target_y"], PEDALS["accel"]["heel_target_y"]])),
}

HEEL_CORRIDOR = {
    "x_min": PEDALS["brake"]["cx"] + 0.02,
    "x_max": PEDALS["accel"]["cx"] - 0.09,
    "y_min": 0.74,
    "y_max": 0.90,
}

CLASS_TO_SCENARIOS = {
    0: [
        "safe_brake_cover",
        "safe_centered",
        "safe_slight_right",
    ],
    1: [
        "heel_left_warning",
        "heel_right_warning",
        "heel_too_far_warning",
        "heel_too_close_warning",
        "brake_press_low_speed_warning",
        "accel_press_high_speed_warning",
    ],
    2: [
        "heel_left_danger",
        "heel_right_danger",
        "wrong_pedal_danger",
        "no_pedal_danger",
        "panic_random_danger",
    ],
}

DEFAULT_CLASS_PROBS = {
    0: 0.45,
    1: 0.30,
    2: 0.25,
}


def clamp(x, lo=0.0, hi=1.0):
    return float(np.clip(x, lo, hi))


def make_heel_box(rng, heel_cx, heel_cy):
    heel_w = float(np.clip(rng.normal(0.10, 0.015), 0.06, 0.16))
    heel_h = float(np.clip(rng.normal(0.07, 0.012), 0.04, 0.12))

    x_min = clamp(heel_cx - heel_w / 2)
    x_max = clamp(heel_cx + heel_w / 2)
    y_min = clamp(heel_cy - heel_h / 2)
    y_max = clamp(heel_cy + heel_h / 2)

    return [round(x_min, 4), round(x_max, 4)], [round(y_min, 4), round(y_max, 4)]


def mutually_exclusive_pedal_state(actual_pressed_pedal):
    if actual_pressed_pedal == "brake":
        return 1, 0
    if actual_pressed_pedal == "accel":
        return 0, 1
    return 0, 0


def sample_velocity_kph(rng, intended_pedal, actual_pressed_pedal, scenario, target_class):
    """
    Car velocity is measurable, so we synthesize it directly.
    Heuristic:
    - braking typically happens at medium/high speed
    - acceleration typically happens from low/medium speed
    - wrong-pedal events often happen at low speed but can extend higher
    """
    if scenario == "wrong_pedal_danger":
        return float(np.clip(rng.normal(18, 10), 0, 55))
    if scenario == "panic_random_danger":
        return float(np.clip(rng.normal(35, 20), 0, 90))
    if scenario == "no_pedal_danger":
        return float(np.clip(rng.normal(42, 18), 5, 100))
    if scenario == "accel_press_high_speed_warning":
        return float(np.clip(rng.normal(62, 12), 25, 110))
    if scenario == "brake_press_low_speed_warning":
        return float(np.clip(rng.normal(6, 4), 0, 20))

    if actual_pressed_pedal == "brake":
        if target_class == 0:
            return float(np.clip(rng.normal(38, 14), 5, 90))
        if target_class == 1:
            return float(np.clip(rng.normal(32, 16), 0, 90))
        return float(np.clip(rng.normal(40, 18), 0, 100))

    if actual_pressed_pedal == "accel":
        if target_class == 0:
            return float(np.clip(rng.normal(24, 12), 0, 65))
        if target_class == 1:
            return float(np.clip(rng.normal(34, 16), 0, 85))
        return float(np.clip(rng.normal(28, 18), 0, 80))

    # no pedal pressed
    return float(np.clip(rng.normal(12, 10), 0, 45))


def rule_based_safety(
    intended_pedal,
    heel_cx,
    heel_cy,
    brake_pressed,
    accel_pressed,
    car_velocity_kph,
):
    """
    Safety logic based only on measurable or directly derived features:
    - heel location / heel box
    - binary pedal states
    - vehicle speed
    """
    if brake_pressed and accel_pressed:
        raise ValueError("Binary pedal setup should not allow both pedals pressed at once.")

    actual_pressed_pedal = "brake" if brake_pressed else "accel" if accel_pressed else "none"

    heel_dx = heel_cx - HEEL_ANCHOR["x"]
    heel_dy = heel_cy - HEEL_ANCHOR["y"]

    risk = 0.0

    # Heel should remain in the shared corridor between the pedals,
    # but the preferred anchor is biased toward the brake.
    risk += 1.0 * max(0.0, HEEL_CORRIDOR["x_min"] - heel_cx) / 0.03
    risk += 1.0 * max(0.0, heel_cx - HEEL_CORRIDOR["x_max"]) / 0.03
    risk += 0.8 * max(0.0, HEEL_CORRIDOR["y_min"] - heel_cy) / 0.04
    risk += 0.8 * max(0.0, heel_cy - HEEL_CORRIDOR["y_max"]) / 0.04

    risk += 0.6 * max(0.0, abs(heel_dx) - 0.04) / 0.03
    risk += 0.5 * max(0.0, abs(heel_dy) - 0.05) / 0.04

    if intended_pedal == "brake":
        # braking from a heel parked too far right is especially risky
        risk += 1.0 * max(0.0, heel_dx - 0.015) / 0.025
        if accel_pressed:
            risk += 3.0
        if not brake_pressed:
            risk += 2.5
        if brake_pressed and car_velocity_kph < 3:
            risk += 0.8
    else:
        # acceleration with a heel too far left suggests poor pivot posture
        risk += 0.8 * max(0.0, -heel_dx - 0.03) / 0.03
        if brake_pressed:
            risk += 3.0
        if not accel_pressed:
            risk += 2.5
        if accel_pressed and car_velocity_kph > 55:
            risk += 1.0

    if actual_pressed_pedal == "none" and car_velocity_kph > 20:
        risk += 1.4

    if risk >= 2.8:
        safety = 2
    elif risk >= 1.2:
        safety = 1
    else:
        safety = 0

    return {
        "rule_safety": safety,
        "risk_score": round(risk, 3),
        "actual_pressed_pedal": actual_pressed_pedal,
        "heel_anchor_dx": round(float(heel_dx), 4),
        "heel_anchor_dy": round(float(heel_dy), 4),
    }


def sample_state_for_scenario(rng, intended_pedal, scenario):
    """
    Synthetic geometry for a binary pedal detector.
    We no longer generate toe position or pedal overlap.
    """
    heel_cx = rng.normal(HEEL_ANCHOR["x"], 0.012)
    heel_cy = rng.normal(HEEL_ANCHOR["y"], 0.015)

    if intended_pedal == "brake":
        actual_pressed_pedal = "brake"
    else:
        actual_pressed_pedal = "accel"

    if scenario == "safe_brake_cover":
        heel_cx -= rng.uniform(0.004, 0.018)

    elif scenario == "safe_centered":
        pass

    elif scenario == "safe_slight_right":
        heel_cx += rng.uniform(0.003, 0.015)

    elif scenario == "heel_left_warning":
        heel_cx -= rng.uniform(0.045, 0.07)

    elif scenario == "heel_right_warning":
        heel_cx += rng.uniform(0.045, 0.07)

    elif scenario == "heel_too_far_warning":
        heel_cy += rng.uniform(0.07, 0.10)

    elif scenario == "heel_too_close_warning":
        heel_cy -= rng.uniform(0.07, 0.09)

    elif scenario == "brake_press_low_speed_warning":
        actual_pressed_pedal = "brake"

    elif scenario == "accel_press_high_speed_warning":
        actual_pressed_pedal = "accel"

    elif scenario == "heel_left_danger":
        heel_cx -= rng.uniform(0.09, 0.15)

    elif scenario == "heel_right_danger":
        heel_cx += rng.uniform(0.09, 0.15)

    elif scenario == "wrong_pedal_danger":
        actual_pressed_pedal = "accel" if intended_pedal == "brake" else "brake"

    elif scenario == "no_pedal_danger":
        actual_pressed_pedal = "none"

    elif scenario == "panic_random_danger":
        heel_cx = rng.uniform(0.08, 0.92)
        heel_cy = rng.uniform(0.65, 0.95)
        actual_pressed_pedal = rng.choice(["brake", "accel", "none"], p=[0.35, 0.35, 0.30])

    else:
        raise ValueError(f"Unknown scenario: {scenario}")

    heel_cx = clamp(heel_cx)
    heel_cy = clamp(heel_cy)

    brake_pressed, accel_pressed = mutually_exclusive_pedal_state(actual_pressed_pedal)

    return heel_cx, heel_cy, brake_pressed, accel_pressed, actual_pressed_pedal


def generate_synthetic_intention_data(n=1000, seed=42, class_probs=None):
    if class_probs is None:
        class_probs = DEFAULT_CLASS_PROBS

    rng = np.random.default_rng(seed)
    class_labels = np.array([0, 1, 2], dtype=int)
    class_p = np.array([class_probs[0], class_probs[1], class_probs[2]], dtype=float)
    class_p = class_p / class_p.sum()

    rows = []

    for _ in range(n):
        intended_pedal = rng.choice(["brake", "accel"])
        target_class = int(rng.choice(class_labels, p=class_p))
        scenario = rng.choice(CLASS_TO_SCENARIOS[target_class])

        heel_cx, heel_cy, brake_pressed, accel_pressed, actual_pressed_pedal = sample_state_for_scenario(
            rng, intended_pedal, scenario
        )

        car_velocity_kph = sample_velocity_kph(
            rng=rng,
            intended_pedal=intended_pedal,
            actual_pressed_pedal=actual_pressed_pedal,
            scenario=scenario,
            target_class=target_class,
        )

        heel_x, heel_y = make_heel_box(rng, heel_cx, heel_cy)

        rule_info = rule_based_safety(
            intended_pedal=intended_pedal,
            heel_cx=heel_cx,
            heel_cy=heel_cy,
            brake_pressed=brake_pressed,
            accel_pressed=accel_pressed,
            car_velocity_kph=car_velocity_kph,
        )

        safety = max(target_class, rule_info["rule_safety"])

        if safety == 0:
            heel_pressure = float(np.clip(rng.normal(44, 8), 10, 90))
        elif safety == 1:
            heel_pressure = float(np.clip(rng.normal(51, 11), 5, 100))
        else:
            heel_pressure = float(np.clip(rng.normal(57, 15), 0, 100))

        rows.append({
            "intended_pedal": intended_pedal,
            "scenario": scenario,
            "heel_x": heel_x,
            "heel_y": heel_y,
            "heel_center_x": round(heel_cx, 4),
            "heel_center_y": round(heel_cy, 4),
            "heel_pressure": round(heel_pressure, 2),
            "brake_pressed": int(brake_pressed),
            "accel_pressed": int(accel_pressed),
            "car_velocity_kph": round(car_velocity_kph, 2),
            "heel_anchor_dx": rule_info["heel_anchor_dx"],
            "heel_anchor_dy": rule_info["heel_anchor_dy"],
            "actual_pressed_pedal": rule_info["actual_pressed_pedal"],
            "risk_score": rule_info["risk_score"],
            "safety": safety,
        })

    return pd.DataFrame(rows)


if __name__ == "__main__":
    synthetic_df = generate_synthetic_intention_data(
        n=3000,
        seed=42,
        class_probs={0: 0.45, 1: 0.30, 2: 0.25},
    )

    print(synthetic_df.head())
    print("\nSafety counts:")
    print(synthetic_df["safety"].value_counts().sort_index())
    print("\nScenario counts:")
    print(synthetic_df["scenario"].value_counts())
    print("\nPressed-state sanity check:")
    print(((synthetic_df["brake_pressed"] + synthetic_df["accel_pressed"]) <= 1).value_counts())

    synthetic_df.to_csv(
        "/home/albertseo206/smart_mat/model/data/synthetic_intention_data_binary.csv",
        index=False,
    )
    print("\nSaved to synthetic_intention_data_binary.csv")
