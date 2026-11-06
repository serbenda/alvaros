// Mini-game: tortilla.
// The tortilla browns in the pan: tap to flip it when it is golden, not raw and not burnt.

import { rect, box, text, person, bubble } from '../../../graphics/draw.js';
import { bgRoom, counter, LOOKS, rand } from '../scenes.js';
import { OUTLINE } from '../../../graphics/sprites.js';

/** Mixes two hex colours. */
function mix(a, b, k) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (shift) => Math.round(((pa >> shift) & 255) + ((((pb >> shift) & 255) - ((pa >> shift) & 255)) * k));
  return `rgb(${ch(16)},${ch(8)},${ch(0)})`;
}

/** Colour of the tortilla for a cooking level from 0 (raw) to 1 (burnt). */
function cookColor(level) {
  if (level < 0.6) return mix('#f7e08a', '#e9b44c', level / 0.6);
  return mix('#e9b44c', '#5a3a1a', Math.min(1, (level - 0.6) / 0.4));
}

export default {
  id: 'tortilla',
  who: 'blanca',
  create() {
    const from = rand(0.52, 0.6);
    return {
      dur: 5,
      level: 0,
      rate: rand(0.2, 0.26),
      from,
      to: from + 0.2,
      flip: 0,
      down() {
        if (this.result) return;
        if (this.level >= this.from && this.level <= this.to) {
          this.result = 'win';
        } else {
          this.verdict = this.level < this.from ? 'raw' : 'burnt';
          this.result = 'lose';
        }
      },
      update(dt) {
        if (this.result === 'win') {
          this.flip = Math.min(1, this.flip + dt * 2.2);
          return;
        }
        if (this.result) return;
        this.level += dt * this.rate;
        if (this.level >= 1) {
          this.verdict = 'burnt';
          this.result = 'lose';
        }
      },
      timeout() {
        this.verdict = 'burnt';
        return 'lose';
      },
      draw(ctx, now, run, t) {
        bgRoom(ctx, 250);
        counter(ctx, 214);
        person(ctx, LOOKS.blanca, 30, 120, 1.6, { mood: this.result === 'lose' ? 'worried' : 'happy' });
        if (this.result === 'win') bubble(ctx, t('mini.tortillaOk'), 30, 98);
        if (this.result === 'lose') bubble(ctx, t(`mini.${this.verdict || 'burnt'}`), 30, 98);

        // Hob and pan
        box(ctx, 64, 196, 104, 20, OUTLINE, 3);
        box(ctx, 65, 197, 102, 18, '#3a3a3a', 3);
        const flameOn = !this.result || this.result === 'lose';
        if (flameOn) {
          for (let i = 0; i < 6; i++) {
            const h = 3 + Math.abs(Math.sin(now * 14 + i)) * 3;
            rect(ctx, 90 + i * 10, 196 - h, 3, h, i % 2 ? '#3498db' : '#5dade2');
          }
        }
        box(ctx, 76, 168, 80, 30, OUTLINE, 12);
        box(ctx, 78, 170, 76, 26, '#2b2b2b', 11);
        rect(ctx, 154, 178, 26, 6, OUTLINE);
        rect(ctx, 155, 179, 24, 4, '#6b3f1d');

        // Tortilla (flies up and turns over when flipped)
        const color = cookColor(this.level);
        const k = this.flip;
        const ty = 172 - Math.sin(k * Math.PI) * 70;
        const squash = Math.abs(Math.cos(k * Math.PI));
        const th = Math.max(3, 20 * squash);
        box(ctx, 82, ty + (20 - th) / 2, 68, th, OUTLINE, 9 * squash + 1);
        box(ctx, 84, ty + (20 - th) / 2 + 1, 64, Math.max(1, th - 2), k > 0.5 ? '#e9b44c' : color, 8 * squash + 1);
        if (th > 8) {
          for (let i = 0; i < 5; i++) rect(ctx, 92 + i * 11, ty + 6 + (i % 2) * 5, 3, 2, 'rgba(255,255,255,0.25)');
        }
        if (this.level > 0.85 && this.result !== 'win') {
          for (let i = 0; i < 3; i++) {
            const sy = 150 - ((now * 30 + i * 12) % 40);
            box(ctx, 98 + i * 14 + Math.sin(now * 4 + i) * 3, sy, 6, 6, 'rgba(60,60,60,0.5)', 2);
          }
        }

        // Cooking meter with the golden zone
        const mx = 64;
        const my = 260;
        const mw = 104;
        box(ctx, mx - 1, my - 1, mw + 2, 12, OUTLINE, 2);
        const g = ctx.createLinearGradient(mx, 0, mx + mw, 0);
        g.addColorStop(0, '#f7e08a');
        g.addColorStop(0.6, '#e9b44c');
        g.addColorStop(1, '#5a3a1a');
        ctx.fillStyle = g;
        ctx.fillRect(mx, my, mw, 10);
        ctx.globalAlpha = 0.5 + Math.sin(now * 8) * 0.2;
        rect(ctx, mx + mw * this.from, my - 3, mw * (this.to - this.from), 16, '#2ecc71');
        ctx.globalAlpha = 1;
        rect(ctx, mx + mw * Math.min(1, this.level) - 1, my - 5, 2, 20, OUTLINE);
        text(ctx, t('mini.tortillaBar'), mx + mw / 2, my + 14, { size: 5, color: '#fffaf0', align: 'center', outline: OUTLINE });
      },
    };
  },
};
