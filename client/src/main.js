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
micBtn.addEventListener("click", async () => {
  if (!audioDetector.isListening) {
    try {
      await audioDetector.start();
      micBtn.classList.add("active");
      micBtn.querySelector(".btn-text").innerText = "SafeSense: ARMED";
    } catch {
      alert("Microphone permission required for acoustic detection!");
    }
  } else {
    audioDetector.stop();
    micBtn.classList.remove("active");
    micBtn.querySelector(".btn-text").innerText = "SafeSense: OFF";
  }
});

// 4. Connect to Backend WebSocket Gateway
const socket = io("http://localhost:5000");

const engineStatus = document.getElementById("engineStatus");
socket.on("connect", () => {
  if (engineStatus) {
    engineStatus.innerText = "ONLINE (WS)";
    engineStatus.className = "val green";
  }
});

socket.on("disconnect", () => {
  if (engineStatus) {
    engineStatus.innerText = "OFFLINE";
    engineStatus.className = "val";
  }
});

socket.on("incident:incoming", (incident) => {
  renderIncomingIncident(incident);
});
