from pathlib import Path
import json
import importlib.util
import sys

import torch
import torch.nn as nn


def load_smart_mat_net(base: Path):
    """Load SmartMatNet from train_model.py if present, otherwise from revised_train_smart_mat.py."""
    for filename in ["train_model.py", "revised_train_smart_mat.py"]:
        module_path = base / filename
        if module_path.exists():
            spec = importlib.util.spec_from_file_location(module_path.stem, module_path)
            if spec is None or spec.loader is None:
                continue
            module = importlib.util.module_from_spec(spec)
            sys.modules[module_path.stem] = module
            spec.loader.exec_module(module)
            if hasattr(module, "SmartMatNet"):
                return module.SmartMatNet
    raise ImportError(
        "Could not find SmartMatNet in train_model.py or revised_train_smart_mat.py."
    )


class OnnxExportWrapper(nn.Module):
    """
    Accepts one flat float input in this order:
      [raw numeric features..., intended_pedal_code, pressed_state_code]

    It standardizes numeric features internally and converts the final two values
    into integer categorical inputs for the actual model.
    """

    def __init__(
        self,
        model: nn.Module,
        mean: torch.Tensor,
        std: torch.Tensor,
        num_numeric: int,
        intended_cardinality: int,
        pressed_state_cardinality: int,
    ):
        super().__init__()
        self.model = model
        self.num_numeric = int(num_numeric)
        self.intended_cardinality = int(intended_cardinality)
        self.pressed_state_cardinality = int(pressed_state_cardinality)

        mean = mean.detach().float().view(1, -1)
        std = std.detach().float().view(1, -1)
        std = torch.where(std < 1e-6, torch.ones_like(std), std)

        self.register_buffer("mean", mean)
        self.register_buffer("std", std)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        x_num_raw = x[:, : self.num_numeric]
        x_cat_raw = x[:, self.num_numeric :]

        x_num = (x_num_raw - self.mean) / self.std

        intended_code = torch.clamp(
            torch.round(x_cat_raw[:, 0]),
            min=0,
            max=self.intended_cardinality - 1,
        ).to(torch.long)
        pressed_state_code = torch.clamp(
            torch.round(x_cat_raw[:, 1]),
            min=0,
            max=self.pressed_state_cardinality - 1,
        ).to(torch.long)

        x_cat = torch.stack([intended_code, pressed_state_code], dim=1)
        return self.model(x_num, x_cat)


def export_onnx_model(export_model: nn.Module, dummy: torch.Tensor, onnx_path: Path):
    export_kwargs = dict(
        model=export_model,
        args=dummy,
        f=onnx_path.as_posix(),
        input_names=["input"],
        output_names=["output"],
        dynamic_axes={"input": {0: "batch"}, "output": {0: "batch"}},
        opset_version=13,
        export_params=True,
        dynamo=False,
    )

    # Force single-file ONNX. Different torch versions use different argument names.
    try:
        torch.onnx.export(**export_kwargs, external_data=False)
    except TypeError:
        try:
            torch.onnx.export(**export_kwargs, use_external_data_format=False)
        except TypeError:
            torch.onnx.export(**export_kwargs)
    except ModuleNotFoundError as e:
        missing_name = getattr(e, "name", "a required ONNX package")
        raise ModuleNotFoundError(
            f"ONNX export requires additional packages that are not installed: {missing_name}. "
            "Install them first, for example:\n"
            "pip install onnx onnxscript\n"
            "Then run this exporter again."
        ) from e


def main():
    base = Path(__file__).resolve().parent
    weights_path = base / "smart_mat_binary_model.pt"
    target_dir = base.parent / "frontend" / "public"
    onnx_path = target_dir / "smart_mat.onnx"
    meta_path = target_dir / "smart_mat_meta.json"

    if not weights_path.exists():
        raise FileNotFoundError(
            f"Could not find {weights_path}. Run the training script first."
        )

    target_dir.mkdir(parents=True, exist_ok=True)

    SmartMatNet = load_smart_mat_net(base)
    checkpoint = torch.load(weights_path, map_location="cpu")

    required_keys = {
        "model_state_dict",
        "numeric_feature_names",
        "categorical_feature_names",
        "mean",
        "std",
        "label_names",
        "num_numeric",
        "intended_cardinality",
        "pressed_state_cardinality",
        "intended_map",
        "pressed_state_map",
    }
    missing = sorted(required_keys - set(checkpoint.keys()))
    if missing:
        raise KeyError(
            "Checkpoint is missing keys required for ONNX export: "
            f"{missing}. Make sure you are using the revised trainer output."
        )

    model = SmartMatNet(
        num_numeric=checkpoint["num_numeric"],
        intended_cardinality=checkpoint["intended_cardinality"],
        pressed_state_cardinality=checkpoint["pressed_state_cardinality"],
        out_dim=len(checkpoint["label_names"]),
    )
    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()

    export_model = OnnxExportWrapper(
        model=model,
        mean=checkpoint["mean"],
        std=checkpoint["std"],
        num_numeric=checkpoint["num_numeric"],
        intended_cardinality=checkpoint["intended_cardinality"],
        pressed_state_cardinality=checkpoint["pressed_state_cardinality"],
    )
    export_model.eval()

    feature_names = (
        list(checkpoint["numeric_feature_names"])
        + list(checkpoint["categorical_feature_names"])
    )
    input_dim = len(feature_names)
    dummy = torch.zeros(1, input_dim, dtype=torch.float32)

    export_onnx_model(export_model, dummy, onnx_path)

    meta = {
        "input_feature_names": feature_names,
        "numeric_feature_names": checkpoint["numeric_feature_names"],
        "categorical_feature_names": checkpoint["categorical_feature_names"],
        "label_names": checkpoint["label_names"],
        "mean": checkpoint["mean"].tolist(),
        "std": checkpoint["std"].tolist(),
        "num_numeric": checkpoint["num_numeric"],
        "num_categorical": len(checkpoint["categorical_feature_names"]),
        "input_dim": input_dim,
        "intended_map": checkpoint["intended_map"],
        "pressed_state_map": checkpoint["pressed_state_map"],
        "categorical_cardinalities": {
            "intended_pedal_code": checkpoint["intended_cardinality"],
            "pressed_state_code": checkpoint["pressed_state_cardinality"],
        },
        "expects_raw_combined_input": True,
        "notes": (
            "Pass one float input row ordered exactly as input_feature_names. "
            "Numeric features should be raw, unnormalized values. "
            "The final two inputs are categorical codes as numeric values; "
            "the ONNX wrapper rounds and clamps them internally."
        ),
    }

    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(meta, f, indent=2)

    print(f"Exported ONNX model to {onnx_path}")
    print(f"Exported metadata to {meta_path}")


if __name__ == "__main__":
    main()
