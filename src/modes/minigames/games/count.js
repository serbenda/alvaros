// Mini-game: count.
// Andrea: count the drinks and pick the right number.

import { box, text, person, bubble } from '../../../graphics/draw.js';
import { bgTable, LOOKS, pick, shuffle, spots } from '../scenes.js';
import { drawIcon, OUTLINE } from '../../../graphics/sprites.js';

export default {
  id: 'count',
  who: 'andrea',
  create(run) {
    const max = run.score > 8 ? 7 : 5;
    const n = 2 + Math.floor(Math.random() * (max - 1));
    const item = pick(['coffee', 'beer', 'juice', 'toast']);
    const options = new Set([n]);
    while (options.size < 3) {
      const o = n + pick([-2, -1, 1, 2]);
      if (o >= 1) options.add(o);
    }
    return {
      dur: 5,
      n,
      item,
      list: spots(n, 16, 104, 164, 236, 4, 3),
      options: shuffle([...options]),
      down(x, y) {
        if (this.result || y < 250) return;
        const i = Math.floor((x - 10) / 54);
        if (i < 0 || i > 2) return;
        this.chosen = i;
        this.result = this.options[i] === this.n ? 'win' : 'lose';
      },
      draw(ctx, now, run, t) {
        bgTable(ctx, 96);
        person(ctx, LOOKS.andrea, 90, 34, 1.5, { mood: 'happy' });
        bubble(ctx, t('mini.countLine'), 90, 14);
        for (const s of this.list) drawIcon(ctx, this.item, s.x - 12, s.y - 12, 1.5);
        this.options.forEach((o, i) => {
          const x = 10 + i * 54;
          const chosen = this.chosen === i;
          const color = chosen ? (this.result === 'win' ? '#2ecc71' : '#e74c3c') : '#fffaf0';
          box(ctx, x, 252, 50, 50, OUTLINE, 3);
          box(ctx, x + 1, 253, 48, 46, color, 3);
          text(ctx, String(o), x + 25, 266, { size: 16, color: '#3a2518', align: 'center' });
        });
      },
    };
  },
};
