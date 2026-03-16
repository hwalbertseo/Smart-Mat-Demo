import numpy as np
import pandas as pd
from scipy.stats import norm

sample_data = {
    "heel_x": [[0.5, 0.7]],
    "heel_y": [[0.2, 0.3]],
    "heel_pressure": [40],
    "brake_overlap": [0],
    "accel_overlap": [30],
    "safety": [0],  # 0=safe, 1=warning, 2=dangerous
}

df = pd.DataFrame(sample_data)


def two_sided_p_value(x, mu, sigma):
    """
    Two-sided tail probability under N(mu, sigma^2).
    Smaller p means more abnormal relative to the safe baseline.
    """
    z = (x - mu) / sigma
    return 2 * norm.sf(np.abs(z))


def generate_synthetic_data(base_df, n=1000, seed=42):
    rng = np.random.default_rng(seed)

    row = base_df.iloc[0]

    # Safe baseline means taken from the provided sample
    x_min_mu, x_max_mu = row["heel_x"]
    y_min_mu, y_max_mu = row["heel_y"]

    means = {
        "heel_x_min": x_min_mu,
        "heel_x_max": x_max_mu,
        "heel_y_min": y_min_mu,
        "heel_y_max": y_max_mu,
        "heel_pressure": float(row["heel_pressure"]),
        "brake_overlap": float(row["brake_overlap"]),
        "accel_overlap": float(row["accel_overlap"]),
    }

    # Chosen standard deviations for a rough normal distribution
    # Adjust these to make data tighter/looser around the safe example
    sigmas = {
        "heel_x_min": 0.07,
        "heel_x_max": 0.07,
        "heel_y_min": 0.05,
        "heel_y_max": 0.05,
        "heel_pressure": 12.0,
        "brake_overlap": 1.5,
        "accel_overlap": 10.0,
    }

    # Generate heel ranges through center/width so min/max stay sensible
    x_center_mu = (x_min_mu + x_max_mu) / 2
    x_width_mu = max(x_max_mu - x_min_mu, 0.02)

    y_center_mu = (y_min_mu + y_max_mu) / 2
    y_width_mu = max(y_max_mu - y_min_mu, 0.02)

    x_center = rng.normal(x_center_mu, 0.06, n)
    x_width = np.abs(rng.normal(x_width_mu, 0.04, n))
    x_width = np.clip(x_width, 0.01, 1.0)

    y_center = rng.normal(y_center_mu, 0.04, n)
    y_width = np.abs(rng.normal(y_width_mu, 0.03, n))
    y_width = np.clip(y_width, 0.01, 1.0)

    heel_x_min = np.clip(x_center - x_width / 2, 0.0, 1.0)
    heel_x_max = np.clip(x_center + x_width / 2, 0.0, 1.0)
    heel_y_min = np.clip(y_center - y_width / 2, 0.0, 1.0)
    heel_y_max = np.clip(y_center + y_width / 2, 0.0, 1.0)

    # Re-enforce ordering in case clipping changes things
    heel_x_min, heel_x_max = np.minimum(heel_x_min, heel_x_max), np.maximum(heel_x_min, heel_x_max)
    heel_y_min, heel_y_max = np.minimum(heel_y_min, heel_y_max), np.maximum(heel_y_min, heel_y_max)

    heel_pressure = np.clip(rng.normal(means["heel_pressure"], sigmas["heel_pressure"], n), 0, 100)

    # Brake overlap: mostly near 0, with some positive abnormal cases
    brake_raw = rng.normal(means["brake_overlap"], sigmas["brake_overlap"], n)
    brake_overlap = np.clip(brake_raw, 0, 100)
    brake_overlap[brake_overlap < 3.0] = 0.0  # snap tiny values to 0

    accel_overlap = np.clip(rng.normal(means["accel_overlap"], sigmas["accel_overlap"], n), 0, 100)

    synthetic = pd.DataFrame({
        "heel_x_min": heel_x_min,
        "heel_x_max": heel_x_max,
        "heel_y_min": heel_y_min,
        "heel_y_max": heel_y_max,
        "heel_pressure": heel_pressure,
        "brake_overlap": brake_overlap,
        "accel_overlap": accel_overlap,
    })

    # Compute p-values feature by feature
    synthetic["p_heel_x_min"] = two_sided_p_value(synthetic["heel_x_min"], means["heel_x_min"], sigmas["heel_x_min"])
    synthetic["p_heel_x_max"] = two_sided_p_value(synthetic["heel_x_max"], means["heel_x_max"], sigmas["heel_x_max"])
    synthetic["p_heel_y_min"] = two_sided_p_value(synthetic["heel_y_min"], means["heel_y_min"], sigmas["heel_y_min"])
    synthetic["p_heel_y_max"] = two_sided_p_value(synthetic["heel_y_max"], means["heel_y_max"], sigmas["heel_y_max"])
    synthetic["p_heel_pressure"] = two_sided_p_value(synthetic["heel_pressure"], means["heel_pressure"], sigmas["heel_pressure"])
    synthetic["p_brake_overlap"] = two_sided_p_value(synthetic["brake_overlap"], means["brake_overlap"], sigmas["brake_overlap"])
    synthetic["p_accel_overlap"] = two_sided_p_value(synthetic["accel_overlap"], means["accel_overlap"], sigmas["accel_overlap"])

    p_cols = [
        "p_heel_x_min",
        "p_heel_x_max",
        "p_heel_y_min",
        "p_heel_y_max",
        "p_heel_pressure",
        "p_brake_overlap",
        "p_accel_overlap",
    ]

    # Labeling rule
    synthetic["safety"] = 0  # default safe

    warning_mask = (synthetic[p_cols] <= 0.10).any(axis=1)
    dangerous_mask = (synthetic[p_cols] <= 0.05).any(axis=1)

    # Extra hard rule:
    # if brake and accel overlap are both positive -> dangerous
    both_positive_mask = (synthetic["brake_overlap"] > 0) & (synthetic["accel_overlap"] > 0)

    synthetic.loc[warning_mask, "safety"] = 1
    synthetic.loc[dangerous_mask | both_positive_mask, "safety"] = 2

    # Put heel_x / heel_y back into your original list-style format
    synthetic["heel_x"] = synthetic[["heel_x_min", "heel_x_max"]].round(4).values.tolist()
    synthetic["heel_y"] = synthetic[["heel_y_min", "heel_y_max"]].round(4).values.tolist()

    # Final column order
    synthetic = synthetic[
        [
            "heel_x",
            "heel_y",
            "heel_pressure",
            "brake_overlap",
            "accel_overlap",
            "safety",
            "p_heel_x_min",
            "p_heel_x_max",
            "p_heel_y_min",
            "p_heel_y_max",
            "p_heel_pressure",
            "p_brake_overlap",
            "p_accel_overlap",
        ]
    ]

    return synthetic


synthetic_df = generate_synthetic_data(df, n=1000, seed=42)

print(synthetic_df.head())
print("\nClass counts:")
print(synthetic_df["safety"].value_counts())

synthetic_df.to_csv("synthetic_data.csv", index=False)
print("Synthetic data saved to synthetic_data.csv")