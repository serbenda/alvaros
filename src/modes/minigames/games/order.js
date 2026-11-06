// Mini-game: order.
// Andrea: tap what the customer asked for.

import { rect, box, person, bubble } from '../../../graphics/draw.js';
import { bgRoom, counter, LOOKS, pick, shuffle } from '../scenes.js';
import { drawIcon, makeLook, OUTLINE } from '../../../graphics/sprites.js';

export default {
  id: 'order',
  who: 'andrea',
  create(run) {
    const all = ['coffee', 'juice', 'toast', 'beer', 'tapa', 'menu'];
    const count = run.score > 8 ? 4 : 3;
    const options = shuffle([...all]).slice(0, count);
    const wanted = pick(options);
    return {
      dur: 3.5,
      wanted,
      options,
      look: makeLook(Math.random, pick(['regular', 'kid', 'tourist', 'hurry'])),
      down(x, y) {
        if (this.result || y < 220) return;
        const w = 160 / this.options.length;
        const i = Math.floor((x - 10) / w);
        if (i < 0 || i >= this.options.length) return;
        this.chosen = i;
        this.result = this.options[i] === this.wanted ? 'win' : 'lose';
      },
      draw(ctx, now, run, t) {
        bgRoom(ctx, 200);
        counter(ctx, 186);
        person(ctx, this.look, 90, 112, 2.2, { mood: this.result === 'win' ? 'happy' : this.result === 'lose' ? 'angry' : 'neutral' });
        // Order bubble
        box(ctx, 64, 48, 52, 42, OUTLINE, 4);
        box(ctx, 65, 49, 50, 40, '#fffaf0', 4);
        rect(ctx, 86, 89, 8, 4, '#fffaf0');
        rect(ctx, 89, 93, 2, 3, OUTLINE);
        drawIcon(ctx, this.wanted, 74, 53, 2);
        person(ctx, LOOKS.andrea, 26, 210, 1.1, { mood: 'happy' });
        const w = 160 / this.options.length;
        this.options.forEach((id, i) => {
          const x = 10 + i * w;
          const chosen = this.chosen === i;
          const color = chosen ? (this.result === 'win' ? '#2ecc71' : '#e74c3c') : '#fffaf0';
          box(ctx, x + 2, 240, w - 4, w - 4, OUTLINE, 3);
          box(ctx, x + 3, 241, w - 6, w - 6, color, 3);
          const s = (w - 14) / 16;
          drawIcon(ctx, id, x + 7, 245, s);
        });
      },
    };
  },
};
