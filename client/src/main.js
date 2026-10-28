import { io } from "socket.io-client";
import { setupCalculator } from "./calculator.js";
import { sendEmergencyPayload } from "./telemetry.js";
import { initTacticalDashboard, renderIncomingIncident } from "./dashboard.js";
import { AudioDistressDetector } from "./audioDetector.js";

// 1. Initialize Tactical Leaflet Map
initTacticalDashboard();

// 2. Initialize Decoy Calculator Duress Hook
setupCalculator((triggerType) => {
  sendEmergencyPayload(triggerType);
});

// 3. Initialize Audio Distress Listener
const audioDetector = new AudioDistressDetector({
  volumeThreshold: 62,
  freqThreshold: 1200,
  onDistressDetected: (audioMetrics) => {
    sendEmergencyPayload("ACOUSTIC_DISTRESS", audioMetrics);
  }
});

const micBtn = document.getElementById("toggleMicBtn");
if (micBtn) {
  micBtn.addEventListener("click", async () => {
    if (!audioDetector.isListening) {
      try {
        await audioDetector.start();
        micBtn.classList.add("active");
        const btnText = micBtn.querySelector(".btn-text");
        if (btnText) btnText.innerText = "SafeSense: ARMED";
      } catch {
        alert("Microphone permission required for acoustic detection!");
      }
    } else {
      audioDetector.stop();
      micBtn.classList.remove("active");
      const btnText = micBtn.querySelector(".btn-text");
      if (btnText) btnText.innerText = "SafeSense: OFF";
    }
  });
}

// 4. Connect to Backend WebSocket Gateway with Polling Fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const socket = io(API_BASE_URL, {
  transports: ["websocket", "polling"]
});

const engineStatus = document.getElementById("engineStatus");

socket.on("connect", () => {
  console.log("[Socket.io] Connected to backend on port 5000");
  if (engineStatus) {
    engineStatus.innerText = "ONLINE (WS)";
    engineStatus.className = "val green";
  }
});

socket.on("disconnect", () => {
  console.warn("[Socket.io] Disconnected from backend");
  if (engineStatus) {
    engineStatus.innerText = "OFFLINE";
    engineStatus.className = "val";
  }
});

socket.on("incident:incoming", (incident) => {
  console.log("[Socket.io] Incoming incident payload received:", incident);
  renderIncomingIncident(incident);
});