// Mini-game: shutter.
// Morning! Tap fast to pull the shutter up before opening time.

import { rect, box, text, person, bubble } from '../../../graphics/draw.js';
import { LOOKS } from '../scenes.js';
import { drawIcon, OUTLINE } from '../../../graphics/sprites.js';
import { W, H } from '../../../core/layout.js';

export default {
  id: 'shutter',
  who: 'blanca',
  create() {
    return {
      dur: 4.5,
      raised: 0,
      down() {
        if (this.result) return;
        this.raised += 0.075;
        if (this.raised >= 1) this.result = 'win';
      },
      update(dt) {
        if (this.result) return;
        this.raised = Math.max(0, this.raised - dt * 0.16);
      },
      draw(ctx, now, run, t) {
        // Street facade at sunrise
        const sky = ctx.createLinearGradient(0, 0, 0, 120);
        sky.addColorStop(0, '#8cc4ee');
        sky.addColorStop(1, '#f8d9b0');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, W, H);
        rect(ctx, 0, 40, W, 240, '#e8d4b0');
        for (let y = 40; y < 280; y += 8) rect(ctx, 0, y, W, 0.5, '#d4bd94');
        // Sign above the door
        box(ctx, 30, 50, 120, 22, OUTLINE, 2);
        box(ctx, 32, 52, 116, 18, '#fffaf0', 2);
        text(ctx, "ÁLVARO'S", 90, 56, { size: 9, color: '#c0392b', align: 'center' });
        // Shop window behind the shutter: the bar inside
        const sx = 26;
        const sy = 78;
        const sw = 128;
        const sh = 168;
        rect(ctx, sx, sy, sw, sh, '#fdf9f1');
        rect(ctx, sx, sy + sh - 50, sw, 50, '#a8713a');
        rect(ctx, sx, sy + sh - 52, sw, 4, '#dcae74');
        box(ctx, sx + 20, sy + 60, 20, 18, '#e9b820', 5);
        box(ctx, sx + 86, sy + 60, 20, 18, '#8c7279', 5);
        drawIcon(ctx, 'coffee', sx + 52, sy + sh - 72, 1.5);
        // Shutter
        const covered = sh * (1 - this.raised);
        for (let y = sy; y < sy + covered; y += 6) {
          rect(ctx, sx, y, sw, 6, '#9aa3a8');
          rect(ctx, sx, y, sw, 1, '#d5dbde');
          rect(ctx, sx, y + 4.5, sw, 1.5, '#6e777c');
        }
        rect(ctx, sx, sy + covered - 4, sw, 4, '#4a5155');
        box(ctx, sx + sw / 2 - 10, sy + covered - 7, 20, 3, '#3a3f42', 1);
        rect(ctx, sx - 4, sy - 4, 4, sh + 4, '#8a5a32');
        rect(ctx, sx + sw, sy - 4, 4, sh + 4, '#8a5a32');
        // Pavement
        rect(ctx, 0, 250, W, 70, '#b8b0a0');
        for (let x = 0; x < W; x += 20) rect(ctx, x, 250, 0.5, 70, '#a39b8a');
        person(ctx, LOOKS.blanca, 150, 210, 1.4, { mood: this.result === 'win' ? 'happy' : 'neutral', legs: true });
        if (this.result === 'win') bubble(ctx, t('mini.shutterOk'), 150, 188);
        // Progress
        box(ctx, 20, 290, 140, 12, OUTLINE, 2);
        rect(ctx, 22, 292, 136, 8, '#4a3a33');
        rect(ctx, 22, 292, 136 * Math.min(1, this.raised), 8, '#2ecc71');
      },
    };
  },
};
