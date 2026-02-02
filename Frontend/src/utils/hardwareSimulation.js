// src/utils/hardwareSimulation.js

function beep(frequency, duration) {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioCtx.createOscillator();

  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  oscillator.connect(audioCtx.destination);

  oscillator.start();

  setTimeout(() => {
    oscillator.stop();
    audioCtx.close();
  }, duration);
}

export function hardwareFeedback(result) {
  console.log("📡 SIGNAL SENT TO HARDWARE:", result);

  const indicator = document.getElementById("hardware-indicator");
  if (!indicator) return;

  if (result === "CORRECT") {
    indicator.style.display = "block";
    indicator.style.background = "green";
    indicator.innerText = "✔ CORRECT SIGN";

    // 🔊 pleasant higher-pitch sound
    beep(900, 300);

    // longer visibility for correct
    setTimeout(() => {
      indicator.style.display = "none";
    }, 1500);
  } else {
    indicator.style.display = "block";
    indicator.style.background = "red";
    indicator.innerText = "✖ INCORRECT SIGN";

    // 🔊 lower-pitch error sound
    beep(300, 200);

    setTimeout(() => {
      indicator.style.display = "none";
    }, 800);
  }
}
