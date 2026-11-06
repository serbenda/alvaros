// Mini-game: coffee.
// Mari: tap when the sliding cup is right under the coffee machine.

import { rect, box, text, person } from '../../../graphics/draw.js';
import { bgRoom, counter, LOOKS, rand } from '../scenes.js';
import { drawIcon, OUTLINE } from '../../../graphics/sprites.js';

export default {
  id: 'coffee',
  who: 'mari',
  create() {
    return {
      dur: 4.5,
      x: rand(20, 40),
      dir: 1,
      v: rand(70, 95),
      down() {
        if (this.result) return;
        this.result = Math.abs(this.x - 90) <= 9 ? 'win' : 'lose';
      },
      update(dt) {
        if (this.result) return;
        this.x += this.dir * this.v * dt;
        if (this.x > 162) this.dir = -1;
        if (this.x < 18) this.dir = 1;
      },
      draw(ctx, now, run, t) {
        bgRoom(ctx, 240);
        // Coffee machine
        box(ctx, 44, 56, 92, 90, OUTLINE, 3);
        rect(ctx, 46, 58, 88, 86, '#c9ced2');
        rect(ctx, 46, 58, 88, 4, '#eef1f3');
        rect(ctx, 46, 74, 88, 2, '#8a9398');
        rect(ctx, 84, 146, 12, 10, OUTLINE);
        rect(ctx, 85, 146, 10, 9, '#4a4a4a');
        rect(ctx, 60, 90, 10, 10, '#2ecc71');
        rect(ctx, 110, 90, 10, 10, '#e74c3c');
        person(ctx, LOOKS.mari, 152, 150, 1.3, { mood: 'happy' });
        // Target marker under the spout
        ctx.globalAlpha = 0.5 + Math.sin(now * 8) * 0.3;
        rect(ctx, 80, 228, 20, 2, '#2ecc71');
        ctx.globalAlpha = 1;
        counter(ctx, 230);
        const won = this.result === 'win';
        if (won) rect(ctx, 89, 156, 2, 52, '#6f3b1e');
        drawIcon(ctx, 'coffee', this.x - 12, 204, 1.5);
        if (this.result === 'lose') text(ctx, t('mini.spill'), this.x, 190, { size: 6, color: '#e74c3c', align: 'center', outline: OUTLINE });
      },
    };
  },
};
