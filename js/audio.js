// Tiny chiptune sound effects with the Web Audio API. No audio files needed.

export class Sfx {
  constructor() {
    this.ctx = null;
    this.muted = false;
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
      case 'gameover':
        this.arpeggio([523, 392, 330, 262], 0.16, { type: 'triangle', vol: 0.07 });
        break;
      default:
        break;
    }
  }
}
