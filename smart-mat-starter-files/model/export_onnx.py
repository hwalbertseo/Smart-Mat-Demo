from pathlib import Path

import torch
import torch.nn as nn


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
    base = Path(__file__).resolve().parent
    weights_path = base / "smart_mat.pt"
    onnx_path = base / "smart_mat.onnx"

    if not weights_path.exists():
        raise FileNotFoundError(
            f"Could not find {weights_path}. Run train_model.py first."
        )

    model = SmartMatMLP()
    model.load_state_dict(torch.load(weights_path, map_location="cpu"))
    model.eval()

    dummy = torch.randn(1, 10)

    torch.onnx.export(
        model,
        dummy,
        onnx_path.as_posix(),
        input_names=["input"],
        output_names=["output"],
        dynamic_axes={"input": {0: "batch"}, "output": {0: "batch"}},
        opset_version=12,
    )

    print(f"Exported ONNX model to {onnx_path}")


if __name__ == "__main__":
    main()
