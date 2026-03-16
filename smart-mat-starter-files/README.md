# Smart Mat Demo Starter Files

This starter pack gives you the core files for a **React + Vite + react-konva** demo plus a tiny **PyTorch -> ONNX** model flow.

## 1) Create the frontend scaffold in Cloud Shell

```bash
mkdir smart-mat-demo
cd smart-mat-demo
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install konva react-konva onnxruntime-web
```

Then replace the generated `src/` files with the files from `frontend/src/` in this pack.

Also create the public placeholder file below:

- `frontend/public/put-smart_mat.onnx-here.txt`

## 2) Run the frontend

From the `frontend/` folder:

```bash
npm run dev -- --host 0.0.0.0 --port 8080
```

Then open **Cloud Shell Web Preview** on port `8080`.

## 3) Train and export the tiny model

In a second terminal:

```bash
cd smart-mat-demo
python3 -m venv .venv
source .venv/bin/activate
pip install torch onnx
python model/train_model.py
python model/export_onnx.py
cp model/smart_mat.onnx frontend/public/smart_mat.onnx
```

If the ONNX file is missing, the app still works and falls back to rule-based logic.

## 4) What this demo does

- shows a floor-mat-like UI
- lets you drag the foot or enable mouse-follow mode
- lets you change foot angle and size
- computes pedal overlap and distance features
- shows a live risk assessment
- uses the ONNX model if present, otherwise uses rule-based scoring

## 5) Suggested next improvements

- replace the simple foot shape with a shoe PNG
- add clutch mode or manual-transmission layout
- log sessions to CSV / JSON
- collect real human test data to replace synthetic labels
