// Mini-game: hide.
// Blanca is on her phone: hide it the moment Pepe Nacho walks in.

import { rect, text, person, bubble } from '../../../graphics/draw.js';
import { bgRoom, counter, LOOKS, rand } from '../scenes.js';
import { OUTLINE } from '../../../graphics/sprites.js';

export default {
  id: 'hide',
  who: 'boss',
  create() {
    const appearAt = rand(0.9, 3);
    return {
      dur: appearAt + 1.4,
      appearAt,
      window: 1,
      appeared: false,
      down() {
        if (this.result) return;
        if (!this.appeared) {
          this.early = true;
          this.result = 'lose';
        } else {
          this.result = 'win';
        }
      },
      update(dt, run) {
        if (!this.appeared && this.elapsed >= this.appearAt) {
          this.appeared = true;
          run.emit('bossArrives', {});
        }
        if (this.appeared && !this.result && this.elapsed - this.appearAt > this.window) this.result = 'lose';
      },
      draw(ctx, now, run, t) {
        bgRoom(ctx, 230);
        // Door
        const open = this.appeared;
        rect(ctx, 112, 56, 58, 176, '#a8743e');
        rect(ctx, 116, 60, 50, 172, open ? '#3a2a20' : '#8a5a32');
        if (open) {
          person(ctx, LOOKS.boss, 141, 92, 1.7, { mood: this.result === 'lose' ? 'angry' : 'neutral', legs: true });
          if (this.result === 'lose') bubble(ctx, t('mini.caught'), 141, 66, '#ffe9e4');
          else if (this.result === 'win') bubble(ctx, t('mini.bossOk'), 141, 66, '#ffe9e4');
          else text(ctx, '!', 160, 70, { size: 12, color: '#e74c3c', outline: OUTLINE });
        } else {
          rect(ctx, 124, 70, 34, 40, '#bfe1f7');
          rect(ctx, 140.5, 70, 1, 40, '#8a5a32');
          rect(ctx, 156, 150, 4, 8, '#d4a017');
        }
        counter(ctx, 196);
        // Blanca behind the counter, on her phone until she hides it
        const hidden = this.result === 'win';
        person(ctx, LOOKS.blanca, 52, 142, 1.8, { mood: this.result === 'lose' ? 'worried' : 'happy' });
        if (!hidden) {
          rect(ctx, 30, 176, 9, 14, OUTLINE);
          rect(ctx, 31, 177, 7, 12, '#2c3e50');
          rect(ctx, 32, 178, 5, 8, '#5dade2');
          if (!this.result) text(ctx, '♪', 22, 160 + Math.sin(now * 6) * 2, { size: 7, color: '#8e44ad' });
        } else {
          const sway = Math.sin(now * 14) * 4;
          rect(ctx, 44 + sway, 192, 14, 6, OUTLINE);
          rect(ctx, 45 + sway, 193, 12, 4, '#e8f4f8');
        }
      },
    };
  },
};
