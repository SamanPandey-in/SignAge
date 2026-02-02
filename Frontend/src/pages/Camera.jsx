/**
 * Camera Page
 * AI-powered sign language practice with real-time ML feedback
 */

import { useState, useEffect, useRef } from "react";
import { useUserData } from "@hooks/useUserData";
import { useNotification } from "@hooks/useNotification";
import {
  IoCamera,
  IoVideocam,
  IoVideocamOff,
  IoRefresh,
  IoTrophy,
} from "react-icons/io5";
import Button from "@components/common/Button";
import Card from "@components/common/Card";
import mlModelService from "@/services/mlModel";
import { hardwareFeedback } from "@/utils/hardwareSimulation"; // ✅ ADDED

const Camera = () => {
  const videoRef = useRef(null);
  const intervalRef = useRef(null);
  const progressSavedRef = useRef(false);

  const { updateProgress } = useUserData();
  const notification = useNotification({ silent: true });

  const [stream, setStream] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedSign, setSelectedSign] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [score, setScore] = useState(null);
  const [practiceHistory, setPracticeHistory] = useState([]);
  const [modelReady, setModelReady] = useState(false);

  /* ───────────── A–Z Alphabet List ───────────── */
  const ALPHABETS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const allSigns = ALPHABETS.map((letter) => ({
    id: letter,
    word: letter,
    description: `Practice the ASL sign for letter "${letter}"`,
  }));

  /* ───────────── Load ML Model ───────────── */
  useEffect(() => {
    const initModel = async () => {
      try {
        await mlModelService.loadModel();
        setModelReady(true);
      } catch (err) {
        console.error("ML model load error:", err);
      }
    };

    initModel();

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  /* ───────────── Camera Handling ───────────── */
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      setStream(mediaStream);

      if (!videoRef.current) return;

      videoRef.current.srcObject = mediaStream;
      videoRef.current.muted = true;
      videoRef.current.playsInline = true;
      await videoRef.current.play();
    } catch (error) {
      console.error("Camera error:", error);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
      if (videoRef.current) videoRef.current.srcObject = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setIsRecording(false);
  };

  /* ───────────── SAFE Progress Save ───────────── */
  const saveCameraProgressOnce = async () => {
    if (progressSavedRef.current) return;
    progressSavedRef.current = true;

    try {
      await updateProgress({ todayProgress: 1, source: "camera" });
    } catch {
      // silent
    }
  };

  /* ───────────── ML Practice Logic ───────────── */
  const handleStartPractice = async () => {
    progressSavedRef.current = false;

    if (!modelReady || !selectedSign) return;
    if (!stream) await startCamera();

    setIsRecording(true);
    setFeedback(null);
    setScore(null);

    intervalRef.current = setInterval(async () => {
      if (!videoRef.current) return;

      const result = await mlModelService.predictFromVideo(videoRef.current);
      if (!result) return;

      const { label, confidence } = result;
      const accuracy = Math.round(confidence * 100);
      setScore(accuracy);

      const target = selectedSign.word;

      if (label === target && confidence >= 0.8) {
        hardwareFeedback("CORRECT"); // ✅ HARDWARE SIMULATION

        setFeedback({
          message: "Great job! Your sign is accurate!",
          suggestions: ["Nice hand shape", "Good positioning"],
        });

        setPracticeHistory((prev) => [
          { sign: target, score: accuracy },
          ...prev.slice(0, 4),
        ]);

        await saveCameraProgressOnce();

        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsRecording(false);
      } else {
        hardwareFeedback("INCORRECT"); // ❌ HARDWARE SIMULATION

        setFeedback({
          message: `Detected "${label}". Try again.`,
          suggestions: ["Adjust finger positions"],
        });
      }
    }, 1000);
  };

  /* ───────────── UI ───────────── */
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold mb-4">Practice with Camera</h1>

      {/* 🔧 Hardware Feedback Simulation Indicator */}
      <div
        id="hardware-indicator"
        style={{
          display: "none",
          position: "fixed",
          bottom: "20px",
          right: "20px",
          padding: "12px 16px",
          color: "white",
          fontWeight: "bold",
          borderRadius: "8px",
          zIndex: 9999,
        }}
      ></div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Camera */}
        <div className="lg:col-span-2">
          <Card padding="large">
            <div className="bg-black rounded-xl aspect-video relative overflow-hidden">
              <video
                ref={videoRef}
                className={`w-full h-full object-cover scale-x-[-1] ${
                  stream ? "block" : "hidden"
                }`}
                muted
                playsInline
              />

              {!stream && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button onClick={startCamera}>
                    <IoVideocam className="mr-2" /> Turn On Camera
                  </Button>
                </div>
              )}

              {score !== null && (
                <div className="absolute top-4 left-4 bg-black/70 text-white px-4 py-2 rounded">
                  Accuracy: {score}%
                </div>
              )}
            </div>

            <div className="flex gap-4 mt-4">
              <Button
                onClick={handleStartPractice}
                disabled={!selectedSign || isRecording || !modelReady}
                fullWidth
              >
                <IoCamera className="mr-2" />
                {isRecording ? "Analyzing..." : "Start Practice"}
              </Button>

              <Button onClick={stopCamera} variant="danger">
                <IoVideocamOff className="mr-2" /> Stop
              </Button>
            </div>

            {feedback && (
              <Card padding="medium" className="mt-6">
                <h3 className="font-semibold">{feedback.message}</h3>
                <ul className="text-sm mt-2">
                  {feedback.suggestions.map((s, i) => (
                    <li key={i}>• {s}</li>
                  ))}
                </ul>
                <Button
                  onClick={handleStartPractice}
                  variant="outline"
                  size="small"
                  className="mt-4"
                >
                  <IoRefresh className="mr-2" /> Try Again
                </Button>
              </Card>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div>
          <Card padding="medium">
            <h3 className="font-semibold mb-4">Select a Letter</h3>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {allSigns.map((sign) => (
                <button
                  key={sign.id}
                  onClick={() => {
                    setSelectedSign(sign);
                    setFeedback(null);
                    setScore(null);
                  }}
                  className={`w-full p-3 text-left rounded ${
                    selectedSign?.id === sign.id
                      ? "bg-primary-100 border-2 border-primary-500"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  {sign.word}
                </button>
              ))}
            </div>
          </Card>

          {practiceHistory.length > 0 && (
            <Card padding="medium" className="mt-6">
              <h3 className="font-semibold mb-3 flex items-center">
                <IoTrophy className="mr-2" /> Recent Practice
              </h3>
              {practiceHistory.map((p, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span>{p.sign}</span>
                  <span>{p.score}%</span>
                </div>
              ))}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Camera;
