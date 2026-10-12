# ResQMesh: SilentGuard 🛡️
> **Autonomous Transit Corridor & Acoustic Distress Sentinel**  
> *Track: Smart & Sustainable Cities (Mobility & Safety) | Code Yudh 2026 (Phase 1)*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Progressive%20Web%20App%20(PWA)-orange.svg)]()
[![Status](https://img.shields.io/badge/Status-Architecture%20%26%20Phase%201%20Proposal-brightgreen.svg)]()

---

## 📌 Executive Summary
**ResQMesh (SilentGuard)** is an autonomous, zero-touch safety system engineered to bypass the fatal flaws of conventional SOS applications. Designed as a 100% client-edge Progressive Web App (PWA), ResQMesh requires **zero physical user interaction**. It continuously evaluates transit corridors using dynamic geofencing and arms on-device acoustic feature extraction only when an unmapped deviation occurs, preventing both perpetrator alerting and battery drain.

---

## 🚨 The Systemic Vulnerabilities (Problem Statement)
Standard panic systems fail in active coercion scenarios due to three critical gaps:

1. **The Hostage Blindspot (Coercion Prevents Action):**  
   Victims cannot safely unlock screens or hold panic buttons under threat. Physical triggers alert attackers immediately.
2. **Driver Evasion Tactics (Driver-Centric Tracking Fails):**  
   Commercial ride-hailing tracking relies on driver hardware, which can be turned off, muted, or detoured through blind alleys without immediate server alarm.
3. **Alert Fatigue (Unreliable Sound Triggers):**  
   Continuous acoustic listeners suffer from false positives (honking, bumps, laughter) and cause heavy battery drain, leading central authorities to distrust automated pings.

---

## ⚙️ Core Technical Pillars

### 1. Elastic Transit Corridor (Haversine Geofencing)
* Projects a dynamic, flexible bounding polygon along the commuter's planned route vector.
* Silently flags unauthorized path diversions exceeding > 150 m.
* Preserves user privacy by evaluating relative deviation bounds locally rather than constantly streaming raw coordinates.

### 2. Gated Biomechanical Acoustic Sentinel
* **Zero Idle Drain:** The device microphone and digital signal processing (DSP) workers remain completely dormant during nominal travel, consuming less than  3.5% battery per commute hour.
* **Gated Activation:** The audio listener arms *only* when a Level 1 route breach is flagged.
* **On-Device DSP:** Web Audio API (`AnalyserNode`) processes frequency bands to isolate distress spikes (F0 > 1.2 kHz) and extracts 13-band Mel-Frequency Cepstral Coefficients (MFCCs) client-side without transmitting raw commuter audio.

### 3. Camouflaged UI & Covert Dispatch
* **Decoy Mode:** Displays a completely functional, interactive calculator or note-taking interface if the phone screen is inspected by an aggressor.
* **Telemetry Streaming:** Dispatches low-overhead encrypted incident telemetry via WebSockets (`Socket.io`) to emergency/campus command consoles in under < 1 second.

---

## 🏗️ System Architecture & Edge Data Flow

```text
[ Commuter Phone: Client Edge ]
        │
        ├── State 0: Normal Transit (GPS Corridor Check; Audio Asleep)
        │
        ├── State 1: Route Detour (>150m) ──> Web Audio Worker Arms Locally
        │
        └── State 2: Acoustic Distress Spike (F0 > 1.2 kHz)
                     │
                     ▼
             [ Encrypted Packet ]
         (GPS Bounds + Telemetry Token)
                     │
                     ▼
           [ Socket.io / Node.js ]
                     │
        ┌────────────┴────────────┐
        ▼                         ▼
[ Campus / Police Console ]   [ Trusted Webhooks ]
   (Live Vector Map)          (SMS / IVR Alerts)
