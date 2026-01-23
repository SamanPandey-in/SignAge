/**
 * Camera Screen (Web Version)
 * Guided ASL (A–Z) detection using MediaPipe + TensorFlow.js
 */

import React, { useState, useEffect, useRef } from "react";
import {
  IoCameraReverse,
  IoInformationCircle,
  IoPlay,
  IoStop
} from "react-icons/io5";

import mlModelService from "../services/mlModel";
import { saveLetterProgress } from "../services/progressService";
import "./CameraScreen.css";

/* ─────────────────────────────
   Letter-specific guidance tips
───────────────────────────── */
const LETTER_TIPS = {
  A: "Make a fist with your thumb outside",
  B: "Keep fingers straight and together",
  C: "Curve fingers like holding a cup",
  D: "Index finger up, others touching thumb",
  L: "Index finger up, thumb sideways",
};

const CameraScreen = () => {
  const [hasPermission, setHasPermission] = useState(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);

  const [prediction, setPrediction] = useState(null);
  const [confidence, setConfidence] = useState(0);

  const [targetLetter, setTargetLetter] = useState(null);
  const [feedback, setFeedback] = useState("");

  // 🔐 prevent multiple saves
  const savedRef = useRef(false);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  /* ─────────────────────────────
     Load ML model
  ───────────────────────────── */
  useEffect(() => {
    const init = async () => {
      try {
        await mlModelService.loadModel();
        setIsModelLoaded(true);
      } catch (err) {
        console.error("Model load error:", err);
      }
    };

    init();

    return () => {
      stopCamera();
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  /* ─────────────────────────────
     Camera
  ───────────────────────────── */
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false
      });

      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      setHasPermission(true);
    } catch (err) {
      console.error("Camera permission denied:", err);
      setHasPermission(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  /* ─────────────────────────────
     Start / Stop Prediction
  ───────────────────────────── */
  const togglePrediction = async () => {
    if (isPredicting) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setIsPredicting(false);
      setPrediction(null);
      setConfidence(0);
      setFeedback("");
      return;
    }

    if (!hasPermission) await startCamera();
    if (!targetLetter) return;

    setIsPredicting(true);
    savedRef.current = false;

    intervalRef.current = setInterval(async () => {
      if (!videoRef.current) return;

      const result = await mlModelService.predictFromVideo(videoRef.current);
      if (!result) return;

      setPrediction(result.label);
      setConfidence(result.confidence);

      // ✅ CORRECT
      if (result.label === targetLetter && result.confidence >= 0.8) {
        setFeedback("✅ Correct! Great job 🎉");

        if (!savedRef.current) {
          savedRef.current = true;
          await saveLetterProgress(targetLetter, result.confidence);
        }

      // ⚠️ LOW CONFIDENCE
      } else if (result.confidence < 0.5) {
        setFeedback("✋ Keep your hand steady inside the frame");

      // ❌ WRONG LETTER
      } else if (result.label !== targetLetter) {
        setFeedback(
          `❌ This looks like "${result.label}". Practice "${targetLetter}".`
        );

      // 🧠 ALMOST
      } else {
        setFeedback(
          LETTER_TIPS[targetLetter] ||
          "Adjust finger positions slightly"
        );
      }
    }, 900);
  };

  /* ─────────────────────────────
     Auto-start camera
  ───────────────────────────── */
  useEffect(() => {
    if (hasPermission === null) startCamera();
  }, [hasPermission]);

  /* ─────────────────────────────
     UI
  ───────────────────────────── */
  return (
    <div className="camera-screen">

      {/* ───── Letter Selector ───── */}
      <div className="letter-selector">
        <p>Select a letter to practice:</p>
        <div className="letter-grid">
          {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(letter => (
            <button
              key={letter}
              className={`letter-btn ${targetLetter === letter ? "active" : ""}`}
              onClick={() => {
                setTargetLetter(letter);
                setPrediction(null);
                setConfidence(0);
                setFeedback("");
                savedRef.current = false;
              }}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

      {/* ───── Camera ───── */}
      <div className="camera-container">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="camera-video"
        />

        <div className="camera-overlay">
          <div className="guidance-frame"></div>

          {prediction && (
            <div className="prediction-container">
              <div className="prediction-label">Detected Sign</div>
              <div className="prediction-text">{prediction}</div>

              <div className="confidence-bar">
                <div
                  className="confidence-fill"
                  style={{ width: `${confidence * 100}%` }}
                />
              </div>

              <div className="confidence-text">
                {(confidence * 100).toFixed(0)}% confident
              </div>
            </div>
          )}

          {feedback && (
            <div className="feedback-box">{feedback}</div>
          )}
        </div>
      </div>

      {/* ───── Controls ───── */}
      <div className="camera-controls">
        <div className="status-container">
          <div
            className="status-dot"
            style={{ backgroundColor: isModelLoaded ? "#10B981" : "#EF4444" }}
          />
          <span className="status-text">
            {isModelLoaded ? "Model Ready" : "Model Not Loaded"}
          </span>
        </div>

        <div className="action-buttons">
          <button className="control-button">
            <IoCameraReverse size={28} />
          </button>

          <button
            className={`practice-button ${isPredicting ? "active" : ""}`}
            onClick={togglePrediction}
            disabled={!isModelLoaded || !targetLetter}
          >
            {isPredicting ? <IoStop size={32} /> : <IoPlay size={32} />}
          </button>

          <button
            className="control-button"
            onClick={() =>
              alert(
                "How to Practice:\n\n" +
                "1. Select a letter\n" +
                "2. Press Play\n" +
                "3. Hold the sign steady\n" +
                "4. Follow the guidance\n\n" +
                "✔ Guided A–Z learning"
              )
            }
          >
            <IoInformationCircle size={28} />
          </button>
        </div>

        <div className="instructions-container">
          <p className="instructions-text">
            {isPredicting
              ? `🎯 Practicing letter "${targetLetter}"`
              : "▶️ Select a letter and press play"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CameraScreen;
