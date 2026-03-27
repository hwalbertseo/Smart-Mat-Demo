import ast
import json
from pathlib import Path
from typing import Dict, List, Tuple

import os

import pandas as pd
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset


INTENDED_MAP = {"brake": 0, "accel": 1}
PRESSED_STATE_MAP = {"none": 0, "brake": 1, "accel": 2}
LABEL_NAMES = ["safe", "warning", "dangerous"]

# Avoid thread-related stalls on some CPU environments.
torch.set_num_threads(max(1, min(4, os.cpu_count() or 1)))
try:
    torch.set_num_interop_threads(1)
except RuntimeError:
    pass


class SmartMatDataset(Dataset):
    def __init__(self, x_num: torch.Tensor, x_cat: torch.Tensor, y: torch.Tensor):
        self.x_num = x_num
        self.x_cat = x_cat
        self.y = y

    def __len__(self):
        return self.y.shape[0]

    def __getitem__(self, idx):
        return self.x_num[idx], self.x_cat[idx], self.y[idx]


class ResidualBlock(nn.Module):
    def __init__(self, dim: int, dropout: float = 0.15):
        super().__init__()
        self.block = nn.Sequential(
            nn.Linear(dim, dim),
            nn.GELU(),
            nn.LayerNorm(dim),
            nn.Dropout(dropout),
            nn.Linear(dim, dim),
            nn.GELU(),
            nn.LayerNorm(dim),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return x + self.block(x)


class SmartMatNet(nn.Module):
    def __init__(
        self,
        num_numeric: int,
        intended_cardinality: int,
        pressed_state_cardinality: int,
        out_dim: int = 3,
    ):
        super().__init__()

        self.intended_emb = nn.Embedding(intended_cardinality, 4)
        self.pressed_state_emb = nn.Embedding(pressed_state_cardinality, 4)

        self.numeric_stem = nn.Sequential(
            nn.Linear(num_numeric, 64),
            nn.GELU(),
            nn.LayerNorm(64),
            nn.Dropout(0.10),
        )
        self.res1 = ResidualBlock(64, dropout=0.15)
        self.res2 = ResidualBlock(64, dropout=0.15)

        self.head = nn.Sequential(
            nn.Linear(64 + 4 + 4, 64),
            nn.GELU(),
            nn.LayerNorm(64),
            nn.Dropout(0.20),
            nn.Linear(64, 32),
            nn.GELU(),
            nn.Dropout(0.10),
            nn.Linear(32, out_dim),
        )

    def forward(self, x_num: torch.Tensor, x_cat: torch.Tensor) -> torch.Tensor:
        intended_code = x_cat[:, 0]
        pressed_state_code = x_cat[:, 1]

        z_num = self.numeric_stem(x_num)
        z_num = self.res1(z_num)
        z_num = self.res2(z_num)

        z_intended = self.intended_emb(intended_code)
        z_pressed = self.pressed_state_emb(pressed_state_code)

        z = torch.cat([z_num, z_intended, z_pressed], dim=1)
        return self.head(z)


class EarlyStopper:
    def __init__(self, patience: int = 20, mode: str = "max"):
        self.patience = patience
        self.mode = mode
        self.best_value = None
        self.num_bad_epochs = 0

    def step(self, value: float) -> bool:
        if self.best_value is None:
            self.best_value = value
            self.num_bad_epochs = 0
            return False

        improved = value > self.best_value if self.mode == "max" else value < self.best_value
        if improved:
            self.best_value = value
            self.num_bad_epochs = 0
        else:
            self.num_bad_epochs += 1

        return self.num_bad_epochs >= self.patience


def parse_list_cell(value):
    if isinstance(value, str):
        return ast.literal_eval(value)
    return value


def load_training_dataframe(csv_path: Path) -> pd.DataFrame:
    df = pd.read_csv(csv_path)

    for col in ["heel_x", "heel_y"]:
        if col in df.columns:
            df[col] = df[col].apply(parse_list_cell)

    required = {
        "intended_pedal",
        "heel_x",
        "heel_y",
        "heel_center_x",
        "heel_center_y",
        "heel_pressure",
        "brake_pressed",
        "accel_pressed",
        "car_velocity_kph",
        "heel_anchor_dx",
        "heel_anchor_dy",
        "safety",
    }
    missing = sorted(required - set(df.columns))
    if missing:
        raise ValueError(f"CSV is missing required columns: {missing}")

    return df


def derive_pressed_state(df: pd.DataFrame) -> pd.Series:
    brake = df["brake_pressed"].astype(int)
    accel = df["accel_pressed"].astype(int)

    state = []
    for b, a in zip(brake, accel):
        if b == 1 and a == 0:
            state.append("brake")
        elif a == 1 and b == 0:
            state.append("accel")
        else:
            state.append("none")
    return pd.Series(state, index=df.index)


def build_feature_matrices(df: pd.DataFrame):
    heel_x_min = df["heel_x"].apply(lambda v: float(v[0]))
    heel_x_max = df["heel_x"].apply(lambda v: float(v[1]))
    heel_y_min = df["heel_y"].apply(lambda v: float(v[0]))
    heel_y_max = df["heel_y"].apply(lambda v: float(v[1]))

    heel_center_x = df["heel_center_x"].astype(float)
    heel_center_y = df["heel_center_y"].astype(float)
    heel_pressure = df["heel_pressure"].astype(float)
    brake_pressed = df["brake_pressed"].astype(float)
    accel_pressed = df["accel_pressed"].astype(float)
    velocity = df["car_velocity_kph"].astype(float)
    anchor_dx = df["heel_anchor_dx"].astype(float)
    anchor_dy = df["heel_anchor_dy"].astype(float)

    heel_width = heel_x_max - heel_x_min
    heel_height = heel_y_max - heel_y_min
    heel_area = heel_width * heel_height
    between_pedals_center = 0.5 * (0.32 + 0.73)
    heel_lateral_offset = heel_center_x - between_pedals_center
    heel_brake_side_bias = heel_center_x - 0.32
    heel_accel_side_bias = heel_center_x - 0.73
    pressure_velocity = heel_pressure * velocity
    heel_motion_mag = (anchor_dx.pow(2) + anchor_dy.pow(2)).pow(0.5)
    intended_is_brake = df["intended_pedal"].map(lambda x: 1.0 if x == "brake" else 0.0).astype(float)
    intended_is_accel = df["intended_pedal"].map(lambda x: 1.0 if x == "accel" else 0.0).astype(float)
    pressed_state = derive_pressed_state(df)
    actual_is_none = pressed_state.map(lambda x: 1.0 if x == "none" else 0.0).astype(float)
    intended_pressed_match = (
        ((df["intended_pedal"] == "brake") & (brake_pressed == 1))
        | ((df["intended_pedal"] == "accel") & (accel_pressed == 1))
    ).astype(float)

    numeric_df = pd.DataFrame(
        {
            "heel_x_min": heel_x_min,
            "heel_x_max": heel_x_max,
            "heel_y_min": heel_y_min,
            "heel_y_max": heel_y_max,
            "heel_center_x": heel_center_x,
            "heel_center_y": heel_center_y,
            "heel_width": heel_width,
            "heel_height": heel_height,
            "heel_area": heel_area,
            "heel_pressure": heel_pressure,
            "brake_pressed": brake_pressed,
            "accel_pressed": accel_pressed,
            "car_velocity_kph": velocity,
            "heel_anchor_dx": anchor_dx,
            "heel_anchor_dy": anchor_dy,
            "heel_motion_mag": heel_motion_mag,
            "heel_lateral_offset": heel_lateral_offset,
            "heel_brake_side_bias": heel_brake_side_bias,
            "heel_accel_side_bias": heel_accel_side_bias,
            "pressure_velocity": pressure_velocity,
            "intended_is_brake": intended_is_brake,
            "intended_is_accel": intended_is_accel,
            "actual_is_none": actual_is_none,
            "intended_pressed_match": intended_pressed_match,
        }
    )

    categorical_df = pd.DataFrame(
        {
            "intended_pedal_code": df["intended_pedal"].map(INTENDED_MAP).astype(int),
            "pressed_state_code": pressed_state.map(PRESSED_STATE_MAP).astype(int),
        }
    )

    labels = df["safety"].astype(int)
    return numeric_df, categorical_df, labels


def stratified_split_indices(y: torch.Tensor, train_ratio: float, seed: int) -> Tuple[torch.Tensor, torch.Tensor]:
    g = torch.Generator().manual_seed(seed)
    train_indices: List[int] = []
    val_indices: List[int] = []

    for cls in range(int(y.max().item()) + 1):
        cls_idx = torch.where(y == cls)[0]
        perm = cls_idx[torch.randperm(len(cls_idx), generator=g)]
        n_train = max(1, int(len(perm) * train_ratio))
        n_train = min(n_train, len(perm) - 1) if len(perm) > 1 else len(perm)
        train_indices.extend(perm[:n_train].tolist())
        val_indices.extend(perm[n_train:].tolist())

    train_indices = torch.tensor(train_indices, dtype=torch.long)
    val_indices = torch.tensor(val_indices, dtype=torch.long)
    train_indices = train_indices[torch.randperm(len(train_indices), generator=g)]
    val_indices = val_indices[torch.randperm(len(val_indices), generator=g)]
    return train_indices, val_indices


def standardize_train_val(X_train: torch.Tensor, X_val: torch.Tensor):
    mean = X_train.mean(dim=0)
    std = X_train.std(dim=0)
    std = torch.where(std < 1e-6, torch.ones_like(std), std)
    return (X_train - mean) / std, (X_val - mean) / std, mean, std


def make_class_weights(y: torch.Tensor, num_classes: int = 3) -> torch.Tensor:
    counts = torch.bincount(y, minlength=num_classes).float()
    weights = counts.sum() / torch.clamp(counts, min=1.0)
    weights = weights / weights.mean()
    return weights


def confusion_matrix(y_true: torch.Tensor, y_pred: torch.Tensor, num_classes: int = 3) -> torch.Tensor:
    cm = torch.zeros((num_classes, num_classes), dtype=torch.int64)
    for t, p in zip(y_true, y_pred):
        cm[int(t), int(p)] += 1
    return cm


def macro_f1_from_cm(cm: torch.Tensor) -> float:
    f1s = []
    for c in range(cm.shape[0]):
        tp = cm[c, c].item()
        fp = cm[:, c].sum().item() - tp
        fn = cm[c, :].sum().item() - tp
        precision = tp / (tp + fp) if (tp + fp) > 0 else 0.0
        recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
        if precision + recall == 0:
            f1 = 0.0
        else:
            f1 = 2 * precision * recall / (precision + recall)
        f1s.append(f1)
    return sum(f1s) / len(f1s)


@torch.no_grad()
def evaluate(model: nn.Module, loader: DataLoader, loss_fn: nn.Module, device: torch.device):
    model.eval()
    loss_sum = 0.0
    total = 0
    ys = []
    preds_all = []

    for x_num, x_cat, y in loader:
        x_num = x_num.to(device)
        x_cat = x_cat.to(device)
        y = y.to(device)
        logits = model(x_num, x_cat)
        loss = loss_fn(logits, y)

        loss_sum += loss.item() * y.size(0)
        total += y.size(0)
        ys.append(y.cpu())
        preds_all.append(logits.argmax(dim=1).cpu())

    y_true = torch.cat(ys)
    y_pred = torch.cat(preds_all)
    cm = confusion_matrix(y_true, y_pred, num_classes=3)
    acc = (y_true == y_pred).float().mean().item()
    macro_f1 = macro_f1_from_cm(cm)
    return {
        "loss": loss_sum / total,
        "acc": acc,
        "macro_f1": macro_f1,
        "cm": cm,
    }


def train_model(
    csv_path: Path,
    out_path: Path,
    metrics_out_path: Path,
    epochs: int = 180,
    batch_size: int = 256,
    lr: float = 8e-4,
    weight_decay: float = 1e-4,
    train_ratio: float = 0.8,
    seed: int = 7,
):
    torch.manual_seed(seed)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    df = load_training_dataframe(csv_path)
    numeric_df, categorical_df, labels = build_feature_matrices(df)

    numeric_feature_names = numeric_df.columns.tolist()
    categorical_feature_names = categorical_df.columns.tolist()

    X_num = torch.tensor(numeric_df.values, dtype=torch.float32)
    X_cat = torch.tensor(categorical_df.values, dtype=torch.long)
    y = torch.tensor(labels.values, dtype=torch.long)

    train_idx, val_idx = stratified_split_indices(y, train_ratio=train_ratio, seed=seed)

    X_num_train = X_num[train_idx]
    X_num_val = X_num[val_idx]
    X_cat_train = X_cat[train_idx]
    X_cat_val = X_cat[val_idx]
    y_train = y[train_idx]
    y_val = y[val_idx]

    X_num_train, X_num_val, mean, std = standardize_train_val(X_num_train, X_num_val)

    train_dataset = SmartMatDataset(X_num_train, X_cat_train, y_train)
    val_dataset = SmartMatDataset(X_num_val, X_cat_val, y_val)

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)

    model = SmartMatNet(
        num_numeric=X_num.shape[1],
        intended_cardinality=len(INTENDED_MAP),
        pressed_state_cardinality=len(PRESSED_STATE_MAP),
        out_dim=3,
    ).to(device)

    class_weights = make_class_weights(y_train, num_classes=3).to(device)
    loss_fn = nn.CrossEntropyLoss(weight=class_weights, label_smoothing=0.03)
    optimizer = optim.AdamW(model.parameters(), lr=lr, weight_decay=weight_decay)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(
        optimizer,
        mode="max",
        factor=0.5,
        patience=8,
        min_lr=1e-5,
    )
    early_stopper = EarlyStopper(patience=20, mode="max")

    best_val_f1 = -1.0
    best_state = None
    history: List[Dict] = []

    for epoch in range(epochs):
        model.train()
        train_loss_sum = 0.0
        train_total = 0
        train_correct = 0

        for x_num_batch, x_cat_batch, y_batch in train_loader:
            x_num_batch = x_num_batch.to(device)
            x_cat_batch = x_cat_batch.to(device)
            y_batch = y_batch.to(device)

            optimizer.zero_grad()
            logits = model(x_num_batch, x_cat_batch)
            loss = loss_fn(logits, y_batch)
            loss.backward()
            nn.utils.clip_grad_norm_(model.parameters(), max_norm=2.0)
            optimizer.step()

            train_loss_sum += loss.item() * y_batch.size(0)
            train_correct += (logits.argmax(dim=1) == y_batch).sum().item()
            train_total += y_batch.size(0)

        train_metrics = {
            "loss": train_loss_sum / train_total,
            "acc": train_correct / train_total,
        }
        val_metrics = evaluate(model, val_loader, loss_fn, device)
        scheduler.step(val_metrics["macro_f1"])

        row = {
            "epoch": epoch,
            "train_loss": train_metrics["loss"],
            "train_acc": train_metrics["acc"],
            "val_loss": val_metrics["loss"],
            "val_acc": val_metrics["acc"],
            "val_macro_f1": val_metrics["macro_f1"],
            "lr": optimizer.param_groups[0]["lr"],
        }
        history.append(row)

        if val_metrics["macro_f1"] > best_val_f1:
            best_val_f1 = val_metrics["macro_f1"]
            best_state = {
                "model_state_dict": model.state_dict(),
                "numeric_feature_names": numeric_feature_names,
                "categorical_feature_names": categorical_feature_names,
                "mean": mean,
                "std": std,
                "label_names": LABEL_NAMES,
                "intended_map": INTENDED_MAP,
                "pressed_state_map": PRESSED_STATE_MAP,
                "num_numeric": X_num.shape[1],
                "intended_cardinality": len(INTENDED_MAP),
                "pressed_state_cardinality": len(PRESSED_STATE_MAP),
                "best_val_macro_f1": best_val_f1,
                "best_val_confusion_matrix": val_metrics["cm"],
            }

        if epoch % 10 == 0 or epoch == epochs - 1:
            print(
                f"epoch={epoch:03d} "
                f"train_loss={train_metrics['loss']:.4f} train_acc={train_metrics['acc']:.3f} "
                f"val_loss={val_metrics['loss']:.4f} val_acc={val_metrics['acc']:.3f} "
                f"val_macro_f1={val_metrics['macro_f1']:.3f}"
            )

        if early_stopper.step(val_metrics["macro_f1"]):
            print(f"Early stopping at epoch {epoch}.")
            break

    torch.save(best_state, out_path)

    metrics_payload = {
        "best_val_macro_f1": float(best_val_f1),
        "history": history,
        "best_val_confusion_matrix": best_state["best_val_confusion_matrix"].tolist(),
        "numeric_feature_names": numeric_feature_names,
        "categorical_feature_names": categorical_feature_names,
        "label_names": LABEL_NAMES,
    }
    metrics_out_path.write_text(json.dumps(metrics_payload, indent=2), encoding="utf-8")

    print(f"\nBest val macro F1: {best_val_f1:.3f}")
    print(f"Saved model checkpoint to: {out_path}")
    print(f"Saved training metrics to: {metrics_out_path}")


def main():
    base_dir = Path(__file__).resolve().parent
    csv_path = base_dir / "data/synthetic_intention_data_binary.csv"
    out_path = base_dir / "smart_mat_binary_model.pt"
    metrics_out_path = base_dir / "smart_mat_binary_metrics.json"

    train_model(
        csv_path=csv_path,
        out_path=out_path,
        metrics_out_path=metrics_out_path,
        epochs=180,
        batch_size=256,
        lr=8e-4,
        weight_decay=1e-4,
        train_ratio=0.8,
        seed=7,
    )


if __name__ == "__main__":
    main()
