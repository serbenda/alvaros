// Mini-game: pour.
// Hold to pour a beer and let go inside the green zone.

import { rect, box, text, person } from '../../../graphics/draw.js';
import { bgRoom, LOOKS, rand } from '../scenes.js';
import { OUTLINE } from '../../../graphics/sprites.js';
import { W } from '../../../core/layout.js';

export default {
  id: 'pour',
  who: 'blanca',
  create() {
    return {
      dur: 5,
      band: rand(0.5, 0.72),
      size: 0.14,
      level: 0,
      pouring: false,
      down() {
        if (!this.result) this.pouring = true;
      },
      up() {
        if (!this.pouring || this.result) return;
        this.pouring = false;
        this.result = this.level >= this.band && this.level <= this.band + this.size ? 'win' : 'lose';
      },
      update(dt) {
        if (this.pouring) this.level += dt * 0.42;
        if (this.level > 1.02) this.result = 'lose';
      },
      draw(ctx, now, run, t) {
        bgRoom(ctx, 250);
        // Beer tap
        rect(ctx, 70, 40, 40, 10, OUTLINE);
        rect(ctx, 71, 41, 38, 8, '#c9ced2');
        rect(ctx, 86, 50, 8, 22, OUTLINE);
        rect(ctx, 87, 50, 6, 21, '#9aa3a8');
        rect(ctx, 84, 22, 12, 19, OUTLINE);
        rect(ctx, 85, 23, 10, 17, '#c0392b');
        rect(ctx, 86, 24, 3, 15, '#e74c3c');
        // Glass
        const gx = 58;
        const gy = 110;
        const gw = 64;
        const gh = 128;
        const inner = gh - 8;
        rect(ctx, gx - 1.5, gy - 1.5, gw + 3, gh + 3, OUTLINE);
        rect(ctx, gx, gy, gw, gh, '#e3f2f7');
        // Target zone
        const zt = gy + gh - 4 - (this.band + this.size) * inner;
        const zh = this.size * inner;
        ctx.globalAlpha = 0.45;
        rect(ctx, gx, zt, gw, zh, '#2ecc71');
        ctx.globalAlpha = 1;
        rect(ctx, gx - 6, zt, 5, 1.5, '#1e8449');
        rect(ctx, gx - 6, zt + zh - 1.5, 5, 1.5, '#1e8449');
        rect(ctx, gx + gw + 1, zt, 5, 1.5, '#1e8449');
        rect(ctx, gx + gw + 1, zt + zh - 1.5, 5, 1.5, '#1e8449');
        // Beer
        const lv = Math.min(1.05, this.level);
        if (lv > 0) {
          const top = gy + gh - 4 - lv * inner;
          rect(ctx, gx + 3, top, gw - 6, gy + gh - 4 - top, '#f1c40f');
          rect(ctx, gx + 3, top, 4, gy + gh - 4 - top, '#fff3a8');
          for (let i = 0; i < 5; i++) {
            const by = gy + gh - 8 - ((now * 30 + i * 23) % Math.max(4, gy + gh - 8 - top));
            rect(ctx, gx + 12 + i * 10, by, 1.5, 1.5, '#fff8d0');
          }
          box(ctx, gx + 2, top - 5, gw - 4, 7, '#ffffff', 2);
          if (lv > 1) box(ctx, gx - 3, top - 8, gw + 6, 10, '#ffffff', 3);
        }
        if (this.pouring) rect(ctx, 89, 71, 2, gy + gh - 4 - Math.max(0, lv) * inner - 71, '#f1c40f');
        rect(ctx, gx + gw - 8, gy + 6, 3, gh - 16, 'rgba(255,255,255,0.6)');
        person(ctx, LOOKS.blanca, 22, 180, 1.4, { mood: this.result === 'lose' ? 'worried' : 'happy' });
        if (!this.pouring && !this.result) text(ctx, t('mini.hold'), W / 2, 280, { size: 6, color: '#3a2518', align: 'center' });
      },
    };
  },
};
