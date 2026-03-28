function isTouchPrimaryDevice() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(hover: none) and (pointer: coarse)").matches;
}

export default function App() {
  const [state, setState] = useState(INITIAL_STATE);
  const [isPressing, setIsPressing] = useState(false);
  const [isTouchPrimary, setIsTouchPrimary] = useState(isTouchPrimaryDevice());
  const [modelStatus, setModelStatus] = useState("loading");
  const [assessment, setAssessment] = useState(IDLE_ASSESSMENT);

  useEffect(() => {
    let active = true;

    loadModel()
      .then(() => {
        if (active) setModelStatus("loaded");
      })
      .catch((err) => {
        console.error("Model load failed:", err);
        if (active) setModelStatus("fallback");
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;

    const media = window.matchMedia("(hover: none) and (pointer: coarse)");
    const updateTouchMode = () => setIsTouchPrimary(media.matches);

    updateTouchMode();
    media.addEventListener?.("change", updateTouchMode);

    return () => {
      media.removeEventListener?.("change", updateTouchMode);
    };
  }, []);

  const pressActive = isTouchPrimary || isPressing;

  const inferredPedalState = useMemo(
    () => inferPedalState(state, pressActive),
    [state, pressActive]
  );

  const effectiveState = useMemo(
    () => ({
      ...state,
      intendedPedal: inferredPedalState.intendedPedal,
      pressedPedal: inferredPedalState.pressedPedal,
    }),
    [state, inferredPedalState]
  );

  const featureResult = useMemo(
    () => computeFeatures(effectiveState, pedals),
    [effectiveState]
  );

  const geometry = featureResult.geometry;
  const features = featureResult.features;

  useEffect(() => {
    let active = true;

    if (!pressActive) {
      setAssessment(IDLE_ASSESSMENT);
      return () => {
        active = false;
      };
    }

    const fallback = ruleBasedAssessment(featureResult, effectiveState, pedals);

    async function runAssessment() {
      if (modelStatus !== "loaded") {
        setAssessment({
          ...fallback,
          source: "rules",
        });
        return;
      }

      try {
        const { logits, meta } = await predictWithMeta(featureResult.vector);
        if (!active) return;

        const probs = softmax(logits);
        const rawLabelNames =
          Array.isArray(meta?.label_names) && meta.label_names.length === probs.length
            ? meta.label_names
            : DEFAULT_LABELS;

        const labelNames = rawLabelNames.map(canonicalizeLabel);
        const bestIndex = probs.indexOf(Math.max(...probs));

        setAssessment({
          label: labelNames[bestIndex] ?? "SAFE",
          riskScore: riskScoreFromProbs(probs, labelNames),
          probs,
          source: "model",
        });
      } catch (error) {
        if (!active) return;
        console.error("Falling back to rules because model inference failed:", error);
        setModelStatus("fallback");
        setAssessment({
          ...fallback,
          source: "rules",
        });
      }
    }

    runAssessment();

    return () => {
      active = false;
    };
  }, [featureResult, effectiveState, modelStatus, pressActive]);

  function resetFoot() {
    const clamped = clampFootCenter(
      INITIAL_STATE.footX,
      INITIAL_STATE.footY,
      INITIAL_STATE.size,
      INITIAL_STATE.angle
    );

    setState({
      ...INITIAL_STATE,
      footX: clamped.x,
      footY: clamped.y,
    });
    setIsPressing(false);
    setAssessment(isTouchPrimary ? ruleBasedAssessment(featureResult, effectiveState, pedals) : IDLE_ASSESSMENT);
  }

  return (
    <div className="app-shell">
      <div className="header">
        <div>
          <h1>Smart Mat Demo</h1>
          <p>
            A browser prototype for intention-aware foot placement and pedal
            misapplication detection.
          </p>
        </div>
      </div>

      <div className="workspace">
        <MatCanvas
          state={state}
          setState={setState}
          assessment={assessment}
          geometry={geometry}
          isPressing={pressActive}
          setIsPressing={setIsPressing}
          isTouchPrimary={isTouchPrimary}
        />

        <Controls
          state={state}
          setState={setState}
          onReset={resetFoot}
          assessment={assessment}
          modelStatus={modelStatus}
          isPressing={pressActive}
          geometry={geometry}
        />
      </div>

      <div className="metrics-row">
        <div className="metric">
          <span>Intended pedal</span>
          <strong>{geometry?.intendedPedal?.toUpperCase?.() ?? "-"}</strong>
        </div>

        <div className="metric">
          <span>Pressed pedal</span>
          <strong>{geometry?.pressedPedal?.toUpperCase?.() ?? "NONE"}</strong>
        </div>

        <div className="metric">
          <span>Vehicle speed</span>
          <strong>{features.car_velocity_kph.toFixed(0)} kph</strong>
        </div>

        <div className="metric">
          <span>Heel pressure</span>
          <strong>{features.heel_pressure.toFixed(0)}</strong>
        </div>

        <div className="metric">
          <span>Heel anchor dx</span>
          <strong>{features.heel_anchor_dx.toFixed(3)}</strong>
        </div>

        <div className="metric">
          <span>Heel anchor dy</span>
          <strong>{features.heel_anchor_dy.toFixed(3)}</strong>
        </div>

        <div className="metric">
          <span>Press active</span>
          <strong>{pressActive ? "YES" : "NO"}</strong>
        </div>
      </div>
    </div>
  );
}