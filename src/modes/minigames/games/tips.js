// Mini-game: tips.
// Move the tip jar to catch the falling coins.

import { rect, box, text, person } from '../../../graphics/draw.js';
import { bgRoom, LOOKS, rand } from '../scenes.js';
import { OUTLINE } from '../../../graphics/sprites.js';

export default {
  id: 'tips',
  who: 'blanca',
  create() {
    return {
      dur: 6,
      need: 4,
      caught: 0,
      jar: 90,
      target: 90,
      coins: [],
      spawn: 0.2,
      down(x) {
        this.target = x;
      },
      move(x) {
        this.target = x;
      },
      update(dt) {
        if (this.result) return;
        this.jar += Math.max(-260 * dt, Math.min(260 * dt, this.target - this.jar));
        this.jar = Math.max(20, Math.min(160, this.jar));
        this.spawn -= dt;
        if (this.spawn <= 0) {
          this.coins.push({ x: rand(20, 160), y: 40, vy: rand(60, 90) });
          this.spawn = rand(0.45, 0.8);
        }
        for (const c of this.coins) {
          c.y += c.vy * dt;
          c.vy += 60 * dt;
          if (!c.done && c.y > 236 && c.y < 252 && Math.abs(c.x - this.jar) < 16) {
            c.done = true;
            this.caught++;
            if (this.caught >= this.need) this.result = 'win';
          }
        }
        this.coins = this.coins.filter((c) => !c.done && c.y < 300);
      },
      draw(ctx, now, run, t) {
        bgRoom(ctx, 262);
        person(ctx, LOOKS.blanca, 26, 166, 1.3, { mood: 'happy' });
        for (const c of this.coins) {
          box(ctx, c.x - 5, c.y - 5, 10, 10, OUTLINE, 3);
          box(ctx, c.x - 4, c.y - 4, 8, 8, '#f5c542', 3);
          rect(ctx, c.x - 2, c.y - 3, 1.5, 4, '#fff1a8');
        }
        // Tip jar
        const jx = this.jar;
        box(ctx, jx - 17, 232, 34, 32, OUTLINE, 5);
        box(ctx, jx - 16, 233, 32, 30, '#d8eef5', 5);
        rect(ctx, jx - 16, 252, 32, 11, '#f5c542');
        rect(ctx, jx - 18, 230, 36, 4, '#a8713a');
        rect(ctx, jx - 13, 240, 22, 8, '#fffaf0');
        text(ctx, t('mini.tipsJar'), jx - 2, 241.5, { size: 4, color: '#c0392b', align: 'center' });
        rect(ctx, jx - 13, 236, 2, 22, 'rgba(255,255,255,0.6)');
        text(ctx, `${this.caught}/${this.need}`, 160, 40, { size: 7, color: '#3a2518', align: 'right' });
      },
    };
  },
};
