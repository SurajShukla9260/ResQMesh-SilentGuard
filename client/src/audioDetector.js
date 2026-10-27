export class AudioDistressDetector {
  constructor(options = {}) {
    this.volumeThreshold = options.volumeThreshold || 65;
    this.freqThreshold = options.freqThreshold || 1200; // 1.2 kHz scream/whistle cutoff
    this.onDistressDetected = options.onDistressDetected || null;
    
    this.audioCtx = null;
    this.analyser = null;
    this.micStream = null;
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.latestAudioBlob = null;
    this.isListening = false;
    this.animationFrameId = null;
    this.lastTriggerTime = 0;
  }

  async start() {
    if (this.isListening) return;
    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContextClass();
      
      const source = this.audioCtx.createMediaStreamSource(this.micStream);
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 2048;
      source.connect(this.analyser);

      this.setupRecorder();
      this.isListening = true;
      this.detectLoop();
    } catch (err) {
      console.error("[SilentGuard Audio] Mic access error:", err);
      throw err;
    }
  }

  setupRecorder() {
    try {
      this.mediaRecorder = new MediaRecorder(this.micStream);
      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.recordedChunks.push(e.data);
          if (this.recordedChunks.length > 5) this.recordedChunks.shift();
          this.latestAudioBlob = new Blob(this.recordedChunks, { type: 'audio/webm' });
        }
      };
      this.mediaRecorder.start(1000);
    } catch (e) {
      console.warn("MediaRecorder buffer not available:", e);
    }
  }

  detectLoop() {
    if (!this.isListening) return;
    const bufferLength = this.analyser.frequencyBinCount;
    const timeData = new Uint8Array(bufferLength);
    const freqData = new Uint8Array(bufferLength);

    this.analyser.getByteTimeDomainData(timeData);
    this.analyser.getByteFrequencyData(freqData);

    let sumSquares = 0;
    for (let i = 0; i < bufferLength; i++) {
      const normalized = (timeData[i] - 128) / 128;
      sumSquares += normalized * normalized;
    }
    const rms = Math.sqrt(sumSquares / bufferLength);
    const currentVolume = Math.round(20 * Math.log10(rms + 1e-6) + 100);

    let maxEnergy = -1;
    let maxBinIndex = -1;
    for (let i = 0; i < bufferLength; i++) {
      if (freqData[i] > maxEnergy) {
        maxEnergy = freqData[i];
        maxBinIndex = i;
      }
    }
    const dominantFreq = Math.round((maxBinIndex * this.audioCtx.sampleRate) / this.analyser.fftSize);

    const now = Date.now();
    if (
      currentVolume >= this.volumeThreshold &&
      dominantFreq >= this.freqThreshold &&
      now - this.lastTriggerTime > 6000
    ) {
      this.lastTriggerTime = now;
      if (this.onDistressDetected) {
        this.onDistressDetected({
          triggerType: "ACOUSTIC_DISTRESS",
          decibels: currentVolume,
          dominantFreq: dominantFreq,
          audioBlob: this.latestAudioBlob,
          timestamp: now
        });
      }
    }

    this.animationFrameId = requestAnimationFrame(() => this.detectLoop());
  }

  stop() {
    this.isListening = false;
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') this.mediaRecorder.stop();
    if (this.micStream) this.micStream.getTracks().forEach(t => t.stop());
    if (this.audioCtx && this.audioCtx.state !== 'closed') this.audioCtx.close();
  }
}

export async function blobToBase64(blob) {
  if (!blob) return null;
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}