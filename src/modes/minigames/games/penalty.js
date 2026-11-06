// Mini-game: penalty.
// The match on the bar's TV: shoot where the keeper is not.

import { rect, box, text, person } from '../../../graphics/draw.js';
import { rand } from '../scenes.js';
import { OUTLINE } from '../../../graphics/sprites.js';
import { W, H } from '../../../core/layout.js';

export default {
  id: 'penalty',
  who: 'tv',
  create() {
    return {
      dur: 4,
      kx: 90,
      kdir: Math.random() < 0.5 ? -1 : 1,
      kv: rand(55, 80),
      shot: null,
      down(x) {
        if (this.shot || this.result) return;
        this.shot = { tx: Math.max(46, Math.min(134, x)), t: 0, sx: 90 };
      },
      update(dt) {
        if (this.result) return;
        this.kx += this.kdir * this.kv * dt;
        if (this.kx > 128) this.kdir = -1;
        if (this.kx < 52) this.kdir = 1;
        if (this.shot) {
          this.shot.t += dt / 0.4;
          if (this.shot.t >= 1) this.result = Math.abs(this.kx - this.shot.tx) < 17 ? 'lose' : 'win';
        }
      },
      draw(ctx, now, run, t) {
        // TV frame around a football pitch
        rect(ctx, 0, 0, W, H, '#151515');
        rect(ctx, 6, 40, W - 12, 250, '#2e8b3e');
        for (let x = 6; x < W - 6; x += 16) rect(ctx, x, 40, 8, 250, '#339945');
        rect(ctx, 6, 40, W - 12, 0.75, '#d8f0d8');
        // Goal
        rect(ctx, 40, 66, 100, 3, '#ffffff');
        rect(ctx, 40, 66, 3, 48, '#ffffff');
        rect(ctx, 137, 66, 3, 48, '#ffffff');
        ctx.globalAlpha = 0.35;
        for (let x = 44; x < 137; x += 6) rect(ctx, x, 69, 0.5, 45, '#ffffff');
        for (let y = 72; y < 114; y += 6) rect(ctx, 43, y, 94, 0.5, '#ffffff');
        ctx.globalAlpha = 1;
        rect(ctx, 6, 114, W - 12, 1, '#d8f0d8');
        // Keeper
        person(ctx, { skin: '#e0ac69', hair: '#151515', hairStyle: 'short', shirt: '#f1c40f' }, this.kx, 80, 1.2, { legs: true, mood: this.result === 'lose' ? 'happy' : 'neutral' });
        // Ball
        let bx = 90;
        let by = 250;
        let bs = 1;
        if (this.shot) {
          const k = Math.min(1, this.shot.t);
          bx = this.shot.sx + (this.shot.tx - this.shot.sx) * k;
          by = 250 + (95 - 250) * k;
          bs = 1 - k * 0.4;
        }
        box(ctx, bx - 6 * bs, by - 6 * bs, 12 * bs, 12 * bs, OUTLINE, 3 * bs);
        box(ctx, bx - 5 * bs, by - 5 * bs, 10 * bs, 10 * bs, '#ffffff', 3 * bs);
        rect(ctx, bx - 1.5 * bs, by - 1.5 * bs, 3 * bs, 3 * bs, '#2b2b2b');
        if (this.result === 'win') text(ctx, t('goal'), 90, 150, { size: 12, color: '#f5c542', align: 'center', outline: OUTLINE });
        if (this.result === 'lose') text(ctx, t('mini.saved'), 90, 150, { size: 8, color: '#ffffff', align: 'center', outline: OUTLINE });
        // TV frame and scoreboard
        rect(ctx, 6, 290, W - 12, 20, '#151515');
        rect(ctx, 10, 44, 34, 9, 'rgba(0,0,0,0.6)');
        text(ctx, `${run.score}-0`, 14, 46, { size: 5, color: '#ffffff' });
        ctx.globalAlpha = 0.08;
        for (let y = 40; y < 290; y += 2) rect(ctx, 6, y, W - 12, 0.75, '#000000');
        ctx.globalAlpha = 1;
      },
    };
  },
};
