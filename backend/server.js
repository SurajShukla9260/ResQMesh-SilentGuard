const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const Incident = require("./models/Incident");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json({ limit: "15mb" }));

const MONGO_URI = "mongodb://127.0.0.1:27017/silentguard";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("[MongoDB] Connected successfully to local database"))
  .catch((err) => console.warn("[MongoDB] Fallback active (DB notice):", err.message));

app.get("/", (req, res) => {
  res.json({ service: "ResQMesh Dispatch Engine", status: "ONLINE" });
});

// Trigger Alert Ingestion
app.post("/api/alerts/trigger", async (req, res) => {
  try {
    const { triggerType, coordinates, decibels, dominantFreq, audioClip } = req.body;

    const incidentData = {
      incidentId: "INC-" + Math.floor(1000 + Math.random() * 9000),
      triggerType: triggerType || "COVERT_PIN_TRIGGER",
      coordinates: coordinates || { latitude: 30.767, longitude: 76.575 },
      metrics: { decibels: decibels || 0, dominantFreq: dominantFreq || 0 },
      audioClip: audioClip || null,
      status: "ACTIVE"
    };

    let savedIncident = incidentData;
    try {
      savedIncident = await Incident.create(incidentData);
    } catch (e) {
      console.warn("DB save bypassed, broadcasting in-memory:", e.message);
    }

    io.emit("incident:incoming", savedIncident);
    console.log(`[ALERT BROADCAST] ${savedIncident.incidentId} | ${savedIncident.triggerType}`);

    return res.status(201).json({ success: true, incident: savedIncident });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Query Past Alerts
app.get("/api/alerts", async (req, res) => {
  try {
    const incidents = await Incident.find().sort({ createdAt: -1 }).limit(25);
    return res.json(incidents);
  } catch (err) {
    return res.json([]);
  }
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`SilentGuard Dispatch Server listening on http://localhost:${PORT}`);
});