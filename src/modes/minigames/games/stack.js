// Mini-game: stack.
// Stack three cups: tap to drop the sliding cup on top of the pile.

import { rect, text, person } from '../../../graphics/draw.js';
import { bgRoom, counter, LOOKS } from '../scenes.js';
import { drawIcon } from '../../../graphics/sprites.js';

export default {
  id: 'stack',
  who: 'mari',
  create() {
    return {
      dur: 7,
      need: 3,
      pile: [90],
      x: 30,
      dir: 1,
      v: 70,
      drop: null,
      down() {
        if (this.result || this.drop) return;
        this.drop = { x: this.x, y: 70 };
      },
      update(dt) {
        if (this.result) return;
        if (this.drop) {
          const target = 250 - this.pile.length * 18;
          this.drop.y += dt * 260;
          if (this.drop.y >= target) {
            const top = this.pile[this.pile.length - 1];
            if (Math.abs(this.drop.x - top) <= 8) {
              this.pile.push(this.drop.x);
              this.drop = null;
              this.v *= 1.25;
              if (this.pile.length > this.need) this.result = 'win';
            } else {
              this.fallen = { x: this.drop.x, y: target };
              this.result = 'lose';
            }
          }
          return;
        }
        this.x += this.dir * this.v * dt;
        if (this.x > 150) this.dir = -1;
        if (this.x < 30) this.dir = 1;
      },
      draw(ctx, now, run, t) {
        bgRoom(ctx, 268);
        counter(ctx, 264);
        person(ctx, LOOKS.mari, 26, 166, 1.4, { mood: this.result === 'lose' ? 'worried' : 'happy' });
        const cup = (x, y, tilt = 0) => {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(tilt);
          drawIcon(ctx, 'coffee', -12, -14, 1.5);
          ctx.restore();
        };
        this.pile.forEach((x, i) => cup(x, 250 - i * 18));
        if (this.drop) cup(this.drop.x, this.drop.y);
        else if (!this.result) {
          cup(this.x, 70);
          rect(ctx, this.x - 0.5, 84, 1, 140, 'rgba(46,204,113,0.35)');
        }
        if (this.fallen) cup(this.fallen.x + 10, this.fallen.y + 6, 1.2);
        text(ctx, `${Math.min(this.need, this.pile.length - 1)}/${this.need}`, 160, 40, { size: 7, color: '#3a2518', align: 'right' });
      },
    };
  },
};
