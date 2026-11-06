// Mini-game: watch.
// Find Alejandro's gold watch among the others.

import { rect, box, person, bubble, sparkle } from '../../../graphics/draw.js';
import { bgTable, LOOKS, rand, pick, dist, spots } from '../scenes.js';
import { OUTLINE } from '../../../graphics/sprites.js';

export default {
  id: 'watch',
  who: 'alejandro',
  create(run) {
    const n = Math.min(12, 5 + Math.floor(run.score / 3));
    const list = spots(n, 14, 110, 166, 300, 4, 4);
    const gold = Math.floor(Math.random() * n);
    const colors = ['#c9ced2', '#b87333', '#4a4a4a', '#c9ced2'];
    list.forEach((s, i) => {
      s.gold = i === gold;
      s.color = s.gold ? '#f5c542' : pick(colors);
      s.tilt = rand(-0.4, 0.4);
    });
    return {
      dur: 4.5,
      list,
      down(x, y) {
        if (this.result) return;
        const hit = this.list.find((s) => dist(x, y, s.x, s.y) < 15);
        if (!hit) return;
        this.picked = hit;
        this.result = hit.gold ? 'win' : 'lose';
      },
      draw(ctx, now, run, t) {
        bgTable(ctx, 96);
        person(ctx, LOOKS.alejandro, 90, 34, 1.5, { mood: this.result === 'win' ? 'happy' : 'worried' });
        bubble(ctx, t(this.result === 'win' ? 'mini.watchFound' : 'mini.watchLine'), 90, 14);
        for (const s of this.list) {
          ctx.save();
          ctx.translate(s.x, s.y);
          ctx.rotate(s.tilt);
          rect(ctx, -4, -15, 8, 30, OUTLINE);
          rect(ctx, -3.5, -14.5, 7, 29, s.gold ? '#d4a017' : '#6b5a50');
          box(ctx, -9, -9, 18, 18, OUTLINE, 3);
          box(ctx, -8, -8, 16, 16, s.color, 3);
          box(ctx, -5.5, -5.5, 11, 11, '#fffaf0', 2);
          rect(ctx, -0.5, -4.5, 1, 5, OUTLINE);
          rect(ctx, -0.5, -0.5, 4, 1, OUTLINE);
          ctx.restore();
          if (s.gold && Math.sin(now * 6 + s.x) > 0.3) sparkle(ctx, s.x + 8, s.y - 9, 2.5);
          if (this.picked === s) {
            ctx.globalAlpha = 0.6;
            box(ctx, s.x - 14, s.y - 18, 28, 36, s.gold ? '#2ecc71' : '#e74c3c', 4);
            ctx.globalAlpha = 1;
          }
        }
      },
    };
  },
};
