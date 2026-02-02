import * as tf from "@tensorflow/tfjs";
import { Hands } from "@mediapipe/hands";

let model = null;
let hands = null;
let latestResult = null; // ✅ FIX 1: declare variable

const LABELS = [
  "A","B","C","D","E","F","G","H","I","J",
  "K","L","M","N","O","P","Q","R","S","T",
  "U","V","W","X","Y","Z"
];

const mlModelService = {
  async loadModel() {
    if (model && hands) return true;

    // Load TF.js model
    model = await tf.loadLayersModel("/asl_model/model.json");

    // Initialize MediaPipe Hands ONCE
    hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
      maxNumHands: 1,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.7,
    });

    // ✅ Register onResults ONLY ONCE
    hands.onResults((results) => {
      const landmarks = results?.multiHandLandmarks?.[0];

      if (!landmarks || !Array.isArray(landmarks)) {
        latestResult = null;
        return;
      }

      const input = [];

      for (let i = 0; i < landmarks.length; i++) {
        const lm = landmarks[i];
        input.push(lm.x, lm.y, lm.z);
      }

      const tensor = tf.tensor([input]);
      const prediction = model.predict(tensor);
      const scores = prediction.dataSync();

      const maxIndex = scores.indexOf(Math.max(...scores));

      latestResult = {
        label: LABELS[maxIndex],
        confidence: scores[maxIndex],
      };
    });

    return true;
  },

  async predictFromVideo(videoEl) {
    if (!hands || !videoEl) return null;

    await hands.send({ image: videoEl });
    return latestResult;
  },
};

export default mlModelService;
