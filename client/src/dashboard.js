import L from "leaflet";

let mapInstance = null;
let markersLayer = null;
let alertCount = 0;

export function initTacticalDashboard() {
  const CU_COORDS = [30.767, 76.575];

  mapInstance = L.map("tacticalMap", { zoomControl: false }).setView(CU_COORDS, 14);
  L.control.zoom({ position: "bottomright" }).addTo(mapInstance);

  // Free OpenStreetMap Tiles (Clean, reliable, no watermark or API key required)
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).addTo(mapInstance);

  markersLayer = L.layerGroup().addTo(mapInstance);

  L.circle(CU_COORDS, {
    color: "#38bdf8",
    fillColor: "#0284c7",
    fillOpacity: 0.15,
    radius: 800
  }).addTo(mapInstance);
}

export function renderIncomingIncident(incident) {
  alertCount++;
  const activeCounter = document.getElementById("activeIncidentsCount");
  if (activeCounter) activeCounter.innerText = `${alertCount} ALERTS`;

  const lat = incident.coordinates?.latitude || 30.767;
  const lng = incident.coordinates?.longitude || 76.575;

  const focalCoords = document.getElementById("coordsDisplay") || document.getElementById("focalCoords");
  if (focalCoords) focalCoords.innerText = `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`;

  const customPulseIcon = L.divIcon({
    className: "radar-pulse-marker",
    html: `<div style="
      width: 22px; 
      height: 22px; 
      background: #f43f5e; 
      border-radius: 50%; 
      border: 3px solid #ffffff; 
      box-shadow: 0 0 20px #f43f5e, 0 0 40px #f43f5e;
      animation: radarBlip 1.2s infinite;
    "></div>`,
    iconSize: [22, 22]
  });

  const marker = L.marker([lat, lng], { icon: customPulseIcon }).addTo(markersLayer);
  marker.bindPopup(`
    <div style="font-family: sans-serif; font-size: 12px; color: #0f172a;">
      <strong style="color: #e11d48;">${incident.incidentId}</strong><br/>
      <b>Trigger:</b> ${incident.triggerType}<br/>
      <b>Coords:</b> ${lat.toFixed(4)}, ${lng.toFixed(4)}
    </div>
  `).openPopup();

  if (mapInstance) {
    mapInstance.flyTo([lat, lng], 15, { duration: 1.2 });
  }

  // Matches either incidentStreamList from index.html or fallback incidentFeed
  const feedList = document.getElementById("incidentStreamList") || document.getElementById("incidentFeed");
  if (!feedList) return;

  const card = document.createElement("li");
  card.className = `incident-card ${incident.triggerType === "COVERT_PIN_TRIGGER" ? "covert-pin" : ""}`;
  
  card.innerHTML = `
    <div class="card-headline">
      <span class="incident-id-tag">${incident.incidentId}</span>
      <span class="badge-tag">${incident.triggerType}</span>
    </div>
    <div class="incident-meta-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px; margin-top: 6px; color: #cbd5e1;">
      <span>Time: <strong>${incident.createdAt ? new Date(incident.createdAt).toLocaleTimeString() : "Just Now"}</strong></span>
      <span>Status: <strong style="color: #ef4444;">ACTIVE SOS</strong></span>
      <span>Lat/Lng: <strong>${lat.toFixed(3)}, ${lng.toFixed(3)}</strong></span>
      <span>Metrics: <strong>${incident.metrics?.decibels || 0}dB / ${incident.metrics?.dominantFreq || 0}Hz</strong></span>
    </div>
    ${
      incident.audioClip
        ? `
      <div class="audio-proof-wrapper" style="margin-top: 8px;">
        <span class="audio-proof-label" style="font-size: 11px; color: #38bdf8;">● 5s Audio Evidence Snapshot:</span>
        <audio controls src="${incident.audioClip}" style="width: 100%; height: 32px; margin-top: 4px;"></audio>
      </div>
      `
        : ""
    }
  `;

  feedList.prepend(card);
}