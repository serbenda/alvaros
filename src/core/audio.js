// Tiny chiptune sound effects with the Web Audio API. No audio files needed.

export class Sfx {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.musicTimer = null;
    this.musicStep = 0;
    this.nextNoteTime = 0;
    this.tempo = 1;
  }

  /** Must be called from a user gesture before sounds can play on mobile. */
  unlock() {
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') this.ctx.resume();
    } catch {
      this.ctx = null;
    }
  }

  tone(freq, dur, { type = 'square', vol = 0.06, delay = 0, to = null } = {}) {
    if (this.muted || !this.ctx) return;
    const c = this.ctx;
    const t0 = c.currentTime + delay;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (to) osc.frequency.exponentialRampToValueAtTime(to, t0 + dur);
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  arpeggio(freqs, step, opts) {
    freqs.forEach((f, i) => this.tone(f, step * 1.4, { ...opts, delay: i * step }));
  }

  play(name) {
    switch (name) {
      case 'prep':
        this.tone(520, 0.05, { vol: 0.03 });
        break;
      case 'ready':
        this.tone(880, 0.06, { vol: 0.04 });
        break;
      case 'serve':
        this.tone(1320, 0.07, { type: 'triangle', vol: 0.08 });
        this.tone(1760, 0.08, { type: 'triangle', vol: 0.05, delay: 0.04 });
        break;
      case 'complete':
        this.arpeggio([660, 880, 1320], 0.06, { vol: 0.05 });
        break;
      case 'combo':
        this.arpeggio([523, 659, 784, 1046], 0.05, { vol: 0.05 });
        break;
      case 'onfire':
        this.tone(200, 0.4, { type: 'sawtooth', vol: 0.05, to: 1200 });
        break;
      case 'nope':
        this.tone(180, 0.08, { vol: 0.04 });
        break;
      case 'discard':
        this.tone(400, 0.12, { type: 'triangle', vol: 0.05, to: 120 });
        break;
      case 'angry':
        this.tone(220, 0.25, { type: 'sawtooth', vol: 0.06, to: 90 });
        break;
      case 'boss':
        this.arpeggio([196, 196, 262], 0.12, { type: 'sawtooth', vol: 0.05 });
        break;
      case 'phase':
        this.arpeggio([784, 988, 1175], 0.08, { vol: 0.05 });
        break;
      case 'start':
        this.arpeggio([392, 523, 659, 784], 0.07, { vol: 0.05 });
        break;
      case 'bell':
        this.tone(1568, 0.5, { type: 'triangle', vol: 0.07 });
        this.tone(2093, 0.4, { type: 'sine', vol: 0.04, delay: 0.01 });
        break;
      case 'goal':
        this.arpeggio([523, 659, 784, 1046, 784, 1046], 0.07, { vol: 0.05 });
        this.tone(150, 0.5, { type: 'sawtooth', vol: 0.02, to: 300 });
        break;
      case 'andrea':
        this.arpeggio([880, 1175], 0.08, { type: 'triangle', vol: 0.05 });
        break;
      case 'tick':
        this.tone(1200, 0.03, { vol: 0.03 });
        break;
      case 'gameover':
        this.arpeggio([523, 392, 330, 262], 0.16, { type: 'triangle', vol: 0.07 });
        break;
      default:
        break;
    }
  }

  // ---- Background music ----------------------------------------------------
  // A cheerful little loop: bass on the beat and a melody on top, scheduled a
  // little ahead of time so it stays in rhythm.

  startMusic() {
    if (this.musicTimer || !this.ctx) return;
    this.nextNoteTime = this.ctx.currentTime + 0.05;
    this.musicTimer = setInterval(() => this.scheduleMusic(), 50);
  }

  stopMusic() {
    clearInterval(this.musicTimer);
    this.musicTimer = null;
  }

  scheduleMusic() {
    if (!this.ctx) return;
    const stepTime = 60 / (132 * this.tempo) / 2; // eighth notes at 132 bpm, faster with the game
    // C - Am - F - G, two bars each
    const bass = [131, 131, 110, 110, 87, 87, 98, 98];
    const melody = [
      523, 0, 659, 784, 659, 0, 523, 0, 440, 0, 523, 659, 523, 0, 440, 0,
      349, 0, 440, 523, 440, 0, 349, 0, 392, 0, 494, 587, 494, 0, 392, 494,
    ];
    while (this.nextNoteTime < this.ctx.currentTime + 0.2) {
      const step = this.musicStep % 64;
      const when = this.nextNoteTime - this.ctx.currentTime;
      if (!this.muted) {
        if (step % 2 === 0) this.tone(bass[Math.floor(step / 8)], stepTime * 1.6, { type: 'triangle', vol: 0.035, delay: Math.max(0, when) });
        const note = melody[step % 32];
        if (note) this.tone(note, stepTime * 0.9, { type: 'square', vol: 0.012, delay: Math.max(0, when) });
        if (step % 4 === 2) this.tone(4000, 0.03, { type: 'square', vol: 0.006, delay: Math.max(0, when) });
      }
      this.nextNoteTime += stepTime;
      this.musicStep++;
    }
  }
}
