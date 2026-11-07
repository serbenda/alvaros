// Mini-game: where is Valentina?
// Blanca's daughter plays hide and seek in the bar: tap her when she peeks out.

import { rect, box, person, bubble, text } from '../../../graphics/draw.js';
import { bgRoom, LOOKS, dist } from '../scenes.js';
import { OUTLINE } from '../../../graphics/sprites.js';

const FLOOR = 250;
const SCALE = 1.4;

// Hiding places: centre x and the top edge she peeks over
const SPOTS = [
  { x: 33, top: 200, kind: 'armchair', color: '#e3b52c' },
  { x: 82, top: 212, kind: 'plant' },
  { x: 123, top: 206, kind: 'barrel' },
  { x: 158, top: 200, kind: 'armchair', color: '#8c7279' },
];

function armchair(ctx, s) {
  const dark = s.color === '#e3b52c' ? '#b8891a' : '#6d555c';
  box(ctx, s.x - 22, s.top - 1, 44, FLOOR - s.top + 1, OUTLINE, 6);
  box(ctx, s.x - 21, s.top, 42, 30, s.color, 6);
  box(ctx, s.x - 24, s.top + 18, 10, 30, OUTLINE, 3);
  box(ctx, s.x + 14, s.top + 18, 10, 30, OUTLINE, 3);
  box(ctx, s.x - 23, s.top + 19, 8, 28, dark, 3);
  box(ctx, s.x + 15, s.top + 19, 8, 28, dark, 3);
  box(ctx, s.x - 15, s.top + 28, 30, 18, dark, 3);
  rect(ctx, s.x - 16, s.top + 3, 32, 1.5, 'rgba(255,255,255,0.3)');
  rect(ctx, s.x - 18, FLOOR - 3, 4, 3, '#5a3a22');
  rect(ctx, s.x + 14, FLOOR - 3, 4, 3, '#5a3a22');
}

function plantLeaves(ctx, s, now) {
  const leaves = ['#2f7d3d', '#3f9a4f', '#58b860'];
  for (let i = 0; i < 9; i++) {
    const a = -Math.PI / 2 + (i - 4) * 0.33 + Math.sin(now * 1.5 + i) * 0.03;
    const len = 26 + (i % 3) * 5;
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(s.x + (i - 4) * 2, s.top + 4);
    ctx.lineTo(s.x + (i - 4) * 2 + Math.cos(a) * len, s.top + 4 + Math.sin(a) * len);
    ctx.stroke();
    ctx.strokeStyle = leaves[i % 3];
    ctx.lineWidth = 4.5;
    ctx.stroke();
  }
}

function plantPot(ctx, s) {
  box(ctx, s.x - 17, s.top - 1, 34, FLOOR - s.top + 1, OUTLINE, 3);
  box(ctx, s.x - 16, s.top, 32, FLOOR - s.top - 1, '#e0664a', 3);
  rect(ctx, s.x - 16, s.top, 32, 4, '#f08a6e');
  rect(ctx, s.x - 16, s.top + 4, 32, 1, '#b94a33');
}

function barrel(ctx, s) {
  box(ctx, s.x - 17, s.top - 1, 34, FLOOR - s.top + 1, OUTLINE, 7);
  box(ctx, s.x - 16, s.top, 32, FLOOR - s.top - 1, '#a8713a', 7);
  for (let i = 0; i < 5; i++) rect(ctx, s.x - 12 + i * 6, s.top + 2, 1, FLOOR - s.top - 5, '#8a5a32');
  rect(ctx, s.x - 16, s.top + 8, 32, 3, '#5a5a5a');
  rect(ctx, s.x - 16, FLOOR - 14, 32, 3, '#5a5a5a');
  rect(ctx, s.x - 16, s.top + 8, 32, 1, '#9a9a9a');
}

export default {
  id: 'valentina',
  who: 'valentina',
  create() {
    return {
      dur: 5.5,
      spot: Math.floor(Math.random() * SPOTS.length),
      // Each peek: 0.2 s up, `stay` s out, 0.2 s down, then a short pause
      stay: 0.85,
      phase: 0,
      peek: 0,
      giggle: null,
      next() {
        let n;
        do n = Math.floor(Math.random() * SPOTS.length);
        while (n === this.spot);
        this.spot = n;
        this.phase = 0;
      },
      head() {
        const s = SPOTS[this.spot];
        return { x: s.x, y: s.top - this.peek * 15 * SCALE + 9 };
      },
      down(x, y) {
        if (this.result) return;
        const h = this.head();
        if (this.peek > 0.4 && dist(x, y, h.x, h.y) < 18) {
          this.result = 'win';
          this.peek = 1;
        } else {
          this.giggle = { x, y, t: 0.7 };
        }
      },
      update(dt) {
        if (this.giggle && (this.giggle.t -= dt) <= 0) this.giggle = null;
        if (this.result === 'win') return;
        this.phase += dt;
        const up = 0.2;
        const total = up + this.stay + up + 0.35;
        const p = this.phase;
        if (p < up) this.peek = p / up;
        else if (p < up + this.stay) this.peek = 1;
        else if (p < up * 2 + this.stay) this.peek = 1 - (p - up - this.stay) / up;
        else this.peek = 0;
        if (p >= total) this.next();
      },
      timeout() {
        this.peek = 1;
        return 'lose';
      },
      draw(ctx, now, run, t) {
        bgRoom(ctx, FLOOR);
        // Valentina behind the hiding place, so it covers her body
        const s = SPOTS[this.spot];
        plantLeaves(ctx, SPOTS[1], now);
        if (this.peek > 0) {
          const h = this.head();
          const mood = this.result === 'lose' ? 'happy' : this.result === 'win' ? 'worried' : 'happy';
          person(ctx, LOOKS.valentina, h.x, h.y - 8, SCALE, { mood, blink: now % 2.4 < 0.1 });
          // Pink hair clip
          box(ctx, h.x + 4, h.y - 8, 4, 3, '#ff80ab', 1);
          // Little hands holding on to the edge
          if (this.peek > 0.6) {
            box(ctx, h.x - 11, s.top - 2, 5, 4, LOOKS.valentina.skin, 1.5);
            box(ctx, h.x + 6, s.top - 2, 5, 4, LOOKS.valentina.skin, 1.5);
          }
        }
        for (const spot of SPOTS) {
          if (spot.kind === 'armchair') armchair(ctx, spot);
          else if (spot.kind === 'plant') plantPot(ctx, spot);
          else barrel(ctx, spot);
        }
        if (this.giggle) text(ctx, t('mini.giggle'), this.giggle.x, this.giggle.y - 14, { size: 6, color: '#e91e63', align: 'center', outline: '#fffaf0' });
        if (this.result === 'win') bubble(ctx, t('mini.foundYou'), s.x, s.top - 44);
        if (this.result === 'lose') bubble(ctx, t('mini.notFound'), s.x, s.top - 44);
        // Blanca looking for her
        if (!this.result) text(ctx, t('mini.whereIs'), 90, 92, { size: 7, color: '#c0392b', align: 'center', outline: '#fffaf0' });
      },
    };
  },
};
