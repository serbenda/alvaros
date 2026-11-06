// Mini-game: calm.
// Tap very fast to calm Blanca down.

import { rect, box, text, person, bubble } from '../../../graphics/draw.js';
import { bgRoom, LOOKS } from '../scenes.js';
import { drawHeart, OUTLINE } from '../../../graphics/sprites.js';

export default {
  id: 'calm',
  who: 'blanca',
  create() {
    return {
      dur: 4.5,
      calm: 0,
      taps: [],
      down(x, y) {
        if (this.result) return;
        this.calm += 0.075;
        this.taps.push({ x, y, t: 0 });
        if (this.calm >= 1) this.result = 'win';
      },
      update(dt) {
        this.calm = Math.max(0, this.calm - dt * 0.12);
        for (const p of this.taps) p.t += dt;
        this.taps = this.taps.filter((p) => p.t < 0.6);
      },
      draw(ctx, now, run, t) {
        bgRoom(ctx, 250);
        const c = this.calm;
        const mood = this.result === 'win' || c > 0.75 ? 'happy' : c > 0.35 ? 'neutral' : 'angry';
        const shake = c < 0.4 && !this.result ? Math.sin(now * 40) * 1.5 : 0;
        person(ctx, LOOKS.blanca, 90 + shake, 120, 2.6, { mood, legs: true });
        if (c < 0.6 && !this.result) {
          // Stress scribble over her head
          for (let i = 0; i < 7; i++) {
            const a = now * 6 + i;
            rect(ctx, 90 + Math.cos(a) * 14 - 1, 106 + Math.sin(a * 1.3) * 5, 3, 1.5, '#e74c3c');
          }
          bubble(ctx, t('mini.calmLine'), 90, 84);
        } else if (this.result === 'win') {
          bubble(ctx, t('mini.calmOk'), 90, 84);
        }
        for (const p of this.taps) {
          ctx.globalAlpha = 1 - p.t / 0.6;
          drawHeart(ctx, p.x - 3.5, p.y - 4 - p.t * 30, true);
          ctx.globalAlpha = 1;
        }
        // Calm meter
        box(ctx, 20, 268, 140, 14, OUTLINE, 2);
        rect(ctx, 22, 270, 136, 10, '#4a3a33');
        rect(ctx, 22, 270, 136 * Math.min(1, c), 10, c > 0.75 ? '#2ecc71' : c > 0.35 ? '#f1c40f' : '#e74c3c');
        rect(ctx, 22, 270, 136 * Math.min(1, c), 3, 'rgba(255,255,255,0.35)');
        text(ctx, t('mini.calmBar'), 90, 288, { size: 6, color: '#3a2518', align: 'center' });
      },
    };
  },
};
