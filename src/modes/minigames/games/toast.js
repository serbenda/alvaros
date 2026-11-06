// Mini-game: toast.
// Catch the toast while it flies out of the toaster.

import { rect, box, sparkle } from '../../../graphics/draw.js';
import { bgRoom, counter, rand, dist } from '../scenes.js';
import { drawIcon, OUTLINE } from '../../../graphics/sprites.js';
import { W } from '../../../core/layout.js';

export default {
  id: 'toast',
  who: 'blanca',
  create(run) {
    const count = run.speed >= 1.3 ? 2 : 1;
    const toasts = [];
    for (let i = 0; i < count; i++) {
      toasts.push({ x: 90 + (i ? 14 : -6), y: 238, vx: rand(-40, 40), vy: -rand(185, 215), delay: 0.35 + i * 0.45, caught: false, spin: rand(-6, 6) });
    }
    return {
      dur: 4.2,
      toasts,
      down(x, y) {
        if (this.result) return;
        for (const p of this.toasts) {
          if (p.caught || this.elapsed < p.delay) continue;
          if (dist(x, y, p.x, p.y) < 20) {
            p.caught = true;
            break;
          }
        }
        if (this.toasts.every((p) => p.caught)) this.result = 'win';
      },
      update(dt) {
        for (const p of this.toasts) {
          if (p.caught || this.elapsed < p.delay) continue;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vy += 150 * dt;
          if (p.x < 12 || p.x > W - 12) p.vx *= -1;
          if (p.y > 250 && p.vy > 0) this.result = 'lose';
        }
      },
      draw(ctx, now) {
        bgRoom(ctx, 262);
        counter(ctx, 258);
        // Toaster
        box(ctx, 62, 222, 56, 38, OUTLINE, 4);
        box(ctx, 63, 223, 54, 36, '#c9ced2', 4);
        rect(ctx, 66, 226, 48, 3, '#eef1f3');
        rect(ctx, 70, 230, 16, 3, OUTLINE);
        rect(ctx, 94, 230, 16, 3, OUTLINE);
        rect(ctx, 114, 240, 5, 4, OUTLINE);
        for (const p of this.toasts) {
          if (this.elapsed < p.delay) continue;
          if (p.caught) {
            sparkle(ctx, p.x, p.y, 6, '#f5c542');
            continue;
          }
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(this.elapsed * p.spin);
          drawIcon(ctx, 'toast', -12, -12, 1.5);
          ctx.restore();
        }
      },
    };
  },
};
