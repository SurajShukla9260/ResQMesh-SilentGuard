import L from "leaflet";

let mapInstance = null;
let markersLayer = null;
let alertCount = 0;

export function initTacticalDashboard() {
  const CU_COORDS = [30.767, 76.575];

  mapInstance = L.map("tacticalMap", { zoomControl: false }).setView(CU_COORDS, 14);
  L.control.zoom({ position: "bottomright" }).addTo(mapInstance);

  L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
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

  const lat = incident.coordinates.latitude;
  const lng = incident.coordinates.longitude;

  const focalCoords = document.getElementById("focalCoords");
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

  mapInstance.flyTo([lat, lng], 15, { duration: 1.2 });

  const feedList = document.getElementById("incidentFeed");
  const card = document.createElement("li");
  card.className = `incident-card ${incident.triggerType === "COVERT_PIN_TRIGGER" ? "covert-pin" : ""}`;
  
  card.innerHTML = `
    <div class="card-headline">
      <span class="incident-id-tag">${incident.incidentId}</span>
      <span class="badge-tag">${incident.triggerType}</span>
    </div>
    <div class="incident-meta-grid">
      <span>Time: <strong>${incident.timestamp || "Just Now"}</strong></span>
      <span>Status: <strong>ACTIVE SOS</strong></span>
      <span>Lat/Lng: <strong>${lat.toFixed(3)}, ${lng.toFixed(3)}</strong></span>
      <span>dB/Freq: <strong>${incident.metrics?.decibels || "--"}dB / ${incident.metrics?.dominantFreq || "--"}Hz</strong></span>
    </div>
    ${
      incident.audioClip
        ? `
      <div class="audio-proof-wrapper">
        <span class="audio-proof-label">● 5s Audio Evidence Snapshot:</span>
        <audio controls src="${incident.audioClip}"></audio>
      </div>
      `
        : ""
    }
  `;

  feedList.prepend(card);
}