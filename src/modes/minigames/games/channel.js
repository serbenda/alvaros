// Mini-game: channel.
// Zap through the TV channels and stop on the football.

import { rect, box, person, bubble } from '../../../graphics/draw.js';
import { bgRoom, LOOKS, shuffle } from '../scenes.js';
import { OUTLINE } from '../../../graphics/sprites.js';

export default {
  id: 'channel',
  who: 'boss',
  create() {
    const others = shuffle(['news', 'cooking', 'weather', 'cartoon']);
    const order = [others[0], others[1], 'football', others[2], others[3], 'football'];
    return {
      dur: 5,
      order,
      index: 0,
      every: 0.7,
      timer: 0,
      current() {
        return this.order[this.index % this.order.length];
      },
      down() {
        if (this.result) return;
        this.result = this.current() === 'football' ? 'win' : 'lose';
      },
      update(dt) {
        if (this.result) return;
        this.timer += dt;
        if (this.timer >= this.every) {
          this.timer = 0;
          this.index++;
        }
      },
      draw(ctx, now, run, t) {
        bgRoom(ctx, 262);
        const x = 22;
        const y = 64;
        const w = 136;
        const h = 92;
        rect(ctx, x + w / 2 - 6, 24, 2, y - 24, '#3a3a3a');
        rect(ctx, x + w / 2 + 4, 24, 2, y - 24, '#3a3a3a');
        box(ctx, x - 5, y - 5, w + 10, h + 10, '#151515', 3);
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.clip();
        const ch = this.current();
        if (ch === 'football') {
          rect(ctx, x, y, w, h, '#2e8b3e');
          for (let i = 0; i < w; i += 16) rect(ctx, x + i, y, 8, h, '#339945');
          rect(ctx, x + w / 2, y, 1, h, '#d8f0d8');
          box(ctx, x + w / 2 - 12, y + h / 2 - 12, 24, 24, '#d8f0d8', 6);
          box(ctx, x + w / 2 - 11, y + h / 2 - 11, 22, 22, '#2e8b3e', 6);
          const bx = x + w / 2 + Math.sin(now * 3) * 40;
          for (const [dx, c] of [[-14, '#ffffff'], [10, '#e74c3c'], [-4, '#e74c3c'], [18, '#ffffff']]) {
            rect(ctx, bx + dx, y + 40 + Math.sin(now * 4 + dx) * 10, 4, 7, c);
          }
          box(ctx, bx, y + 50, 4, 4, '#ffffff', 1);
        } else if (ch === 'news') {
          rect(ctx, x, y, w, h, '#1f4e8c');
          rect(ctx, x, y + h - 18, w, 18, '#c0392b');
          rect(ctx, x + 6, y + h - 13, 70, 3, '#ffffff');
          person(ctx, { skin: '#f1c27d', hair: '#4a3020', hairStyle: 'short', shirt: '#2c3e50', accessory: 'tie' }, x + w / 2, y + 14, 2);
        } else if (ch === 'cooking') {
          rect(ctx, x, y, w, h, '#f6e3c4');
          box(ctx, x + 40, y + 46, 56, 30, OUTLINE, 6);
          box(ctx, x + 41, y + 47, 54, 28, '#9aa3a8', 6);
          rect(ctx, x + 41, y + 47, 54, 5, '#e67e22');
          for (let i = 0; i < 3; i++) box(ctx, x + 52 + i * 12, y + 30 - ((now * 20 + i * 8) % 20), 6, 6, 'rgba(255,255,255,0.8)', 2);
        } else if (ch === 'weather') {
          rect(ctx, x, y, w, h, '#5dade2');
          box(ctx, x + 20, y + 20, 56, 56, '#58a55c', 18);
          box(ctx, x + 70, y + 30, 44, 40, '#58a55c', 12);
          box(ctx, x + 40, y + 30, 16, 16, '#f5c542', 8);
          box(ctx, x + 84, y + 40, 18, 10, '#ffffff', 5);
        } else {
          rect(ctx, x, y, w, h, '#ff9ff3');
          box(ctx, x + 46, y + 20, 44, 44, OUTLINE, 18);
          box(ctx, x + 47, y + 21, 42, 42, '#f8d75a', 18);
          rect(ctx, x + 58, y + 34, 5, 7, OUTLINE);
          rect(ctx, x + 74, y + 34, 5, 7, OUTLINE);
          box(ctx, x + 60, y + 48, 16, 6, '#c0392b', 3);
        }
        // Static between channels
        if (this.timer < 0.08 && !this.result) {
          for (let i = 0; i < 160; i++) rect(ctx, x + Math.random() * w, y + Math.random() * h, 2, 1, Math.random() > 0.5 ? '#ffffff' : '#555555');
        }
        ctx.globalAlpha = 0.08;
        for (let yy = y; yy < y + h; yy += 2) rect(ctx, x, yy, w, 0.7, '#000000');
        ctx.globalAlpha = 1;
        ctx.restore();
        // Remote control
        box(ctx, 74, 196, 32, 60, OUTLINE, 6);
        box(ctx, 75, 197, 30, 58, '#2b2b2b', 6);
        box(ctx, 83, 204, 14, 14, this.result ? '#2ecc71' : '#e74c3c', 7);
        for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) box(ctx, 80 + c * 12, 226 + r * 9, 8, 5, '#5a5a5a', 2);
        person(ctx, LOOKS.boss, 150, 186, 1.3, { mood: this.result === 'win' ? 'happy' : this.result === 'lose' ? 'angry' : 'neutral' });
        if (this.result === 'win') bubble(ctx, t('goal'), 150, 162, '#ffe9e4');
      },
    };
  },
};
