// Mini-game: fly.
// A fly buzzes over the tapa: tap it to shoo it away.

import { rect, box, person, bubble } from '../../../graphics/draw.js';
import { bgTable, LOOKS, rand, dist } from '../scenes.js';
import { drawIcon, OUTLINE } from '../../../graphics/sprites.js';

export default {
  id: 'fly',
  who: 'andrea',
  create() {
    return {
      dur: 4,
      x: rand(40, 140),
      y: rand(150, 220),
      vx: rand(-60, 60),
      vy: rand(-60, 60),
      down(x, y) {
        if (this.result) return;
        if (dist(x, y, this.x, this.y) < 16) this.result = 'win';
      },
      update(dt) {
        if (this.result === 'win') {
          this.y -= dt * 120;
          this.x += dt * 60;
          return;
        }
        this.vx += rand(-400, 400) * dt;
        this.vy += rand(-400, 400) * dt;
        const sp = Math.hypot(this.vx, this.vy);
        const max = 95;
        if (sp > max) {
          this.vx *= max / sp;
          this.vy *= max / sp;
        }
        this.x += this.vx * dt;
        this.y += this.vy * dt;
        if (this.x < 20 || this.x > 160) this.vx *= -1;
        if (this.y < 110 || this.y > 250) this.vy *= -1;
        this.x = Math.max(20, Math.min(160, this.x));
        this.y = Math.max(110, Math.min(250, this.y));
      },
      draw(ctx, now, run, t) {
        bgTable(ctx, 100);
        person(ctx, LOOKS.andrea, 90, 34, 1.5, { mood: this.result === 'win' ? 'happy' : 'worried' });
        bubble(ctx, t('mini.flyLine'), 90, 14);
        // Plate with the tapa
        box(ctx, 50, 190, 80, 34, OUTLINE, 12);
        box(ctx, 51, 191, 78, 32, '#f4f4f8', 12);
        box(ctx, 58, 196, 64, 22, '#dcdce4', 9);
        drawIcon(ctx, 'tapa', 66, 186, 3);
        // The fly
        const wing = Math.sin(now * 60) > 0 ? 1 : 0;
        ctx.globalAlpha = 0.6;
        box(ctx, this.x - 6, this.y - 4 - wing * 2, 5, 4, '#d8eef5', 2);
        box(ctx, this.x + 1, this.y - 4 - wing * 2, 5, 4, '#d8eef5', 2);
        ctx.globalAlpha = 1;
        box(ctx, this.x - 3, this.y - 2, 6, 5, '#1a1a1a', 2);
        rect(ctx, this.x - 2, this.y - 1, 1, 1, '#c0392b');
        rect(ctx, this.x + 1, this.y - 1, 1, 1, '#c0392b');
        if (!this.result) {
          for (let i = 0; i < 2; i++) {
            const a = now * 9 + i * 3;
            rect(ctx, this.x + Math.cos(a) * 10, this.y + Math.sin(a) * 6, 2, 0.6, '#3a2518');
          }
        }
      },
    };
  },
};
