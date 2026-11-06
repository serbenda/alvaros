// Mini-game: wipe.
// Mari: tap every coffee stain to wipe the counter clean.

import { rect, box, person, bubble, sparkle } from '../../../graphics/draw.js';
import { bgTable, LOOKS, rand, dist, spots } from '../scenes.js';

export default {
  id: 'wipe',
  who: 'mari',
  create(run) {
    const n = Math.min(9, 4 + Math.floor(run.score / 4));
    return {
      dur: 5,
      stains: spots(n, 14, 112, 166, 300, 3, 4).map((s) => ({ ...s, r: rand(7, 11), clean: 0 })),
      down(x, y) {
        if (this.result) return;
        const s = this.stains.find((st) => !st.clean && dist(x, y, st.x, st.y) < st.r + 8);
        if (s) s.clean = 0.01;
        if (this.stains.every((st) => st.clean)) this.result = 'win';
      },
      update(dt) {
        for (const s of this.stains) if (s.clean) s.clean += dt;
      },
      draw(ctx, now, run, t) {
        bgTable(ctx, 98);
        person(ctx, LOOKS.mari, 90, 34, 1.5, { mood: 'happy' });
        bubble(ctx, t('mini.wipeLine'), 90, 14);
        for (const s of this.stains) {
          if (s.clean) {
            if (s.clean < 0.4) sparkle(ctx, s.x, s.y, 7 * (1 - s.clean / 0.4));
            continue;
          }
          box(ctx, s.x - s.r, s.y - s.r * 0.75, s.r * 2, s.r * 1.5, '#8a5a32', 3);
          box(ctx, s.x - s.r + 2, s.y - s.r * 0.75 + 2, s.r * 2 - 4, s.r * 1.5 - 4, '#6f3b1e', 2);
          rect(ctx, s.x + s.r - 2, s.y + s.r * 0.5, 3, 3, '#6f3b1e');
        }
      },
    };
  },
};
