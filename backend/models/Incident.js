const mongoose = require("mongoose");
const incidentSchema = new mongoose.Schema({
  incidentId: {
    type: String,
    required: true,
    unique: true
  },
  triggerType: {
    type: String,
    enum: ["COVERT_PIN_TRIGGER", "ACOUSTIC_DISTRESS", "MANUAL_SOS"],
    default: "COVERT_PIN_TRIGGER"
  },
  coordinates: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  metrics: {
    decibels: { type: Number, default: 0 },
    dominantFreq: { type: Number, default: 0 }
  },
  audioClip: {
    type: String, // Base64 audio snippet
    default: null
  },
  status: {
    type: String,
    enum: ["ACTIVE", "DISPATCHED", "RESOLVED", "FALSE_ALARM"],
    default: "ACTIVE"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Incident", incidentSchema);
