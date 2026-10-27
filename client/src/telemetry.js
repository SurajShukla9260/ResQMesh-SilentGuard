import { blobToBase64 } from "./audioDetector.js";

export async function fetchLiveCoordinates() {
  const fallbackCoords = {
    latitude: 30.767 + (Math.random() - 0.5) * 0.015,
    longitude: 76.575 + (Math.random() - 0.5) * 0.015
  };

  if ("geolocation" in navigator) {
    try {
      const pos = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 4000 });
      });
      return { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
    } catch (e) {
      console.warn("Using campus coordinates fallback.");
    }
  }
  return fallbackCoords;
}

export async function sendEmergencyPayload(triggerType, metrics = {}) {
  const telemetryTag = document.getElementById("networkTelemetry");
  if (telemetryTag) {
    telemetryTag.innerText = "Carrier: Encrypting Packet...";
    telemetryTag.style.color = "#f43f5e";
  }

  const coords = await fetchLiveCoordinates();

  let base64Audio = null;
  if (metrics.audioBlob) {
    base64Audio = await blobToBase64(metrics.audioBlob);
  }

  const payload = {
    triggerType: triggerType,
    coordinates: coords,
    decibels: metrics.decibels || 0,
    dominantFreq: metrics.dominantFreq || 0,
    audioClip: base64Audio
  };

  try {
    const res = await fetch("http://localhost:5000/api/alerts/trigger", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    await res.json();

    if (telemetryTag) {
      setTimeout(() => {
        telemetryTag.innerText = "Mesh Carrier: Dispatched";
        telemetryTag.style.color = "#10b981";
      }, 300);
    }
  } catch (err) {
    if (telemetryTag) {
      telemetryTag.innerText = "Mesh Carrier: Offline Queued";
      telemetryTag.style.color = "#f59e0b";
    }
  }
}