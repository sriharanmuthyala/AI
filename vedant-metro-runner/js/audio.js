/**
 * audio.js
 * All sound is synthesized on the fly with the Web Audio API, so the game
 * needs zero external audio files to feel complete. Drop real .mp3/.ogg
 * files into assets/audio/ and swap them in here later if you want -
 * see the AudioEngine.play() note below for how.
 */

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem(CONFIG.LS_MUTE) === "true";
    this.musicNodes = null;
    this.musicTimer = null;
  }

  // Lazily create the AudioContext on first user gesture (required by
  // browser autoplay policies).
  ensureContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
  }

  setMuted(m) {
    this.muted = m;
    localStorage.setItem(CONFIG.LS_MUTE, String(m));
    if (m) this.stopMusic();
    else this.startMusic();
  }

  toggleMute() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  // Generic tone/blip synth used by all one-shot SFX.
  _tone({ freq = 440, dur = 0.12, type = "sine", vol = 0.18, slideTo = null, delay = 0 }) {
    if (this.muted) return;
    this.ensureContext();
    const t0 = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  // ---- Named SFX (replace bodies with <audio> playback if you add files) ----
  jump() {
    this._tone({ freq: 420, slideTo: 720, dur: 0.16, type: "square", vol: 0.15 });
  }
  slide() {
    this._tone({ freq: 300, slideTo: 140, dur: 0.14, type: "sawtooth", vol: 0.1 });
  }
  coin() {
    this._tone({ freq: 880, slideTo: 1320, dur: 0.09, type: "triangle", vol: 0.16 });
    this._tone({ freq: 1320, dur: 0.09, type: "triangle", vol: 0.12, delay: 0.05 });
  }
  powerup() {
    [660, 880, 1100, 1320].forEach((f, i) =>
      this._tone({ freq: f, dur: 0.12, type: "square", vol: 0.14, delay: i * 0.06 })
    );
  }
  shieldBreak() {
    this._tone({ freq: 700, slideTo: 900, dur: 0.1, type: "sine", vol: 0.16 });
    this._tone({ freq: 500, slideTo: 200, dur: 0.18, type: "sine", vol: 0.14, delay: 0.08 });
  }
  crash() {
    this._tone({ freq: 180, slideTo: 40, dur: 0.35, type: "sawtooth", vol: 0.22 });
    this._tone({ freq: 90, dur: 0.4, type: "square", vol: 0.16, delay: 0.03 });
  }
  click() {
    this._tone({ freq: 520, dur: 0.06, type: "sine", vol: 0.12 });
  }
  caught() {
    // Comic "gotcha!" descending honk for the dad catching Vedant.
    this._tone({ freq: 300, slideTo: 120, dur: 0.5, type: "sawtooth", vol: 0.2 });
  }
  levelUp() {
    [523, 659, 784, 1046].forEach((f, i) =>
      this._tone({ freq: f, dur: 0.15, type: "triangle", vol: 0.15, delay: i * 0.09 })
    );
  }

  // ---- Simple looping chiptune-style background music ----
  startMusic() {
    if (this.muted || this.musicTimer) return;
    this.ensureContext();
    const melody = [523, 659, 784, 659, 587, 659, 784, 880, 784, 659, 587, 523];
    let i = 0;
    const stepMs = 220;
    const playStep = () => {
      if (this.muted) return;
      const f = melody[i % melody.length];
      this._tone({ freq: f, dur: 0.18, type: "square", vol: 0.05 });
      this._tone({ freq: f / 2, dur: 0.18, type: "triangle", vol: 0.04 });
      i++;
    };
    playStep();
    this.musicTimer = setInterval(playStep, stepMs);
  }

  stopMusic() {
    if (this.musicTimer) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }
}

const Audio = new AudioEngine();
