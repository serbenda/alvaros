// Mini-games mode: quick one-gesture challenges featuring the whole team.
// A run plays random mini-games one after another, faster and faster, until
// the player runs out of lives. The score is the number of challenges won.
//
// Each mini-game is a small object created by a factory in GAMES. It gets the
// elapsed time already scaled by the run speed, so everything speeds up evenly.
//   dur          seconds (at speed 1) before the time runs out
//   update(dt)   advance the game; set `result` to 'win' or 'lose' to finish early
//   down(x, y)   finger pressed; up(x, y): finger released
//   timeout()    result when the time runs out (default 'lose')
//   draw(ctx, now, run, t)

import { W, H } from './layout.js';
import { drawIcon, drawPerson, drawHeart, makeLook, OUTLINE } from './sprites.js';
import { PLAYER, HELPERS, BOSS } from './config.js';

export const FONT = '"Press Start 2P", ui-monospace, monospace';
export const LIVES = 4;
const HUD_H = 18;
const INTRO_TIME = 1.2;
const RESULT_TIME = 0.9;
const SPEEDUP_TIME = 1.2;
const WINS_PER_SPEEDUP = 4;

export const LOOKS = {
  blanca: PLAYER.look,
  mari: HELPERS.mari.look,
  andrea: HELPERS.andrea.look,
  alejandro: HELPERS.alejandro.look,
  boss: BOSS.look,
};

// ---- Drawing helpers ----------------------------------------------------------

export function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

export function box(ctx, x, y, w, h, color, r = 1) {
  ctx.fillStyle = color;
  ctx.fillRect(x + r, y, w - r * 2, h);
  ctx.fillRect(x, y + r, w, h - r * 2);
}

export function text(ctx, str, x, y, { size = 6, color = '#fff', align = 'left', outline = null } = {}) {
  ctx.font = `${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  if (outline) {
    ctx.fillStyle = outline;
    const o = size > 7 ? 1 : 0.75;
    for (const [dx, dy] of [[-o, 0], [o, 0], [0, -o], [0, o], [-o, -o], [o, o], [-o, o], [o, -o]]) {
      ctx.fillText(str, x + dx, y + dy);
    }
  }
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
}

/** Largest font size (up to `max`) at which the text fits in `width`. */
export function fitSize(ctx, str, width, max) {
  let size = max;
  ctx.font = `${size}px ${FONT}`;
  while (size > 4 && ctx.measureText(str).width > width) {
    size -= 0.5;
    ctx.font = `${size}px ${FONT}`;
  }
  return size;
}

export function wrap(ctx, str, width, size) {
  ctx.font = `${size}px ${FONT}`;
  const words = str.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > width && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function person(ctx, look, x, y, scale = 1, opts = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  drawPerson(ctx, look, 0, 0, opts);
  ctx.restore();
}

export function bubble(ctx, str, cx, y, color = '#fffaf0') {
  ctx.font = `5px ${FONT}`;
  const w = Math.ceil(ctx.measureText(str).width) + 8;
  const x = Math.max(2, Math.min(W - w - 2, Math.round(cx - w / 2)));
  const tail = Math.max(x + 3, Math.min(x + w - 4, Math.round(cx)));
  box(ctx, x - 1, y - 1, w + 2, 12, OUTLINE, 2);
  box(ctx, x, y, w, 10, color, 2);
  rect(ctx, tail - 1, y + 10, 3, 1.5, color);
  rect(ctx, tail - 2, y + 10, 1, 1, OUTLINE);
  rect(ctx, tail + 2, y + 10, 1, 1, OUTLINE);
  rect(ctx, tail - 1, y + 11.5, 3, 1, OUTLINE);
  text(ctx, str, x + 4, y + 2.5, { size: 5, color: '#3a2518' });
}

export function sparkle(ctx, x, y, size, color = '#ffffff') {
  rect(ctx, x - size, y - 0.4, size * 2, 0.8, color);
  rect(ctx, x - 0.4, y - size, 0.8, size * 2, color);
}

/** Warm glow, like the copper lamps of the bar. */
function glow(ctx, x, y, radius, color, alpha) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = alpha;
  ctx.fillStyle = g;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  ctx.globalAlpha = 1;
}

function lamp(ctx, x) {
  rect(ctx, x - 0.25, 18, 0.5, 9, '#5a4030');
  box(ctx, x - 6, 26, 12, 6, OUTLINE, 1);
  box(ctx, x - 5, 27, 10, 4, '#c8794a', 1);
  rect(ctx, x - 5, 27, 10, 1, '#e8a57a');
  rect(ctx, x - 2, 31, 4, 1.5, '#fff6c0');
  glow(ctx, x, 38, 50, '#ffe2a8', 0.35);
}

/** White wall with a wooden beam, copper lamps, a grey brick strip and a terracotta floor. */
export function bgRoom(ctx, floorY) {
  rect(ctx, 0, 0, W, H, '#fbf8f2');
  for (let x = 0; x < W; x += 30) rect(ctx, x, 0, 0.5, floorY, '#efe9de');
  // Beam
  rect(ctx, 0, 18, W, 6, '#d9a868');
  rect(ctx, 0, 18, W, 1, '#ecc48d');
  rect(ctx, 0, 23, W, 1, '#a8743e');
  // Brick strip above the floor
  const by = floorY - 34;
  rect(ctx, 0, by, W, 31, '#b3ada4');
  for (let row = 0; row < 8; row++) {
    const y = by + row * 4;
    rect(ctx, 0, y, W, 0.5, '#8f8981');
    for (let x = row % 2 ? 4 : 0; x < W; x += 8) rect(ctx, x, y, 0.5, 4, '#8f8981');
  }
  rect(ctx, 0, by - 1.5, W, 1.5, '#d9a868');
  rect(ctx, 0, floorY - 3, W, 3, '#d9a868');
  rect(ctx, 0, floorY - 3, W, 0.75, '#ecc48d');
  // Floor
  for (let y = floorY; y < H; y += 12) {
    for (let x = ((y - floorY) / 12) % 2 ? -6 : 0; x < W; x += 12) {
      rect(ctx, x, y, 12, 12, (x + y) % 24 ? '#d39a6a' : '#c88d5c');
      rect(ctx, x, y, 12, 0.75, '#e2b48a');
      rect(ctx, x, y, 0.75, 12, '#a86f45');
    }
  }
  const shadow = ctx.createLinearGradient(0, floorY, 0, floorY + 16);
  shadow.addColorStop(0, 'rgba(60,30,10,0.3)');
  shadow.addColorStop(1, 'rgba(60,30,10,0)');
  ctx.fillStyle = shadow;
  ctx.fillRect(0, floorY, W, 16);
  lamp(ctx, 34);
  lamp(ctx, 146);
}

/** A wooden table top seen from above, under a warm lamp, filling the area below `top`. */
export function bgTable(ctx, top) {
  rect(ctx, 0, 0, W, top, '#fbf8f2');
  rect(ctx, 0, 18, W, 6, '#d9a868');
  rect(ctx, 0, 18, W, 1, '#ecc48d');
  rect(ctx, 0, top, W, H - top, '#c98d55');
  for (let y = top + 6; y < H; y += 9) {
    rect(ctx, 0, y, W, 0.5, '#b07a45');
    rect(ctx, (y * 37) % W, y + 3, 20, 0.5, '#d9a066');
    rect(ctx, (y * 71 + 60) % W, y + 5, 12, 0.5, '#b88350');
  }
  rect(ctx, 0, top, W, 3, '#a8743e');
  rect(ctx, 0, top, W, 1, '#e8b37c');
  glow(ctx, W / 2, top + (H - top) / 2, 120, '#ffe9c0', 0.35);
}

function counter(ctx, y) {
  rect(ctx, 0, y, W, 5, '#d9a868');
  rect(ctx, 0, y, W, 1, '#ecc48d');
  rect(ctx, 0, y + 5, W, H - y - 5, '#7d5a45');
  for (let x = 2; x < W; x += 30) {
    rect(ctx, x, y + 8, 26, H - y - 10, '#6e4c3a');
    rect(ctx, x + 26, y + 5, 4, H - y - 5, '#d9a868');
  }
}

const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Random non-overlapping spots on a grid inside the given area. */
function spots(n, x0, y0, x1, y1, cols, rows) {
  const cells = [];
  const cw = (x1 - x0) / cols;
  const ch = (y1 - y0) / rows;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cells.push([c, r]);
  return shuffle(cells)
    .slice(0, n)
    .map(([c, r]) => ({ x: x0 + cw * (c + 0.5) + rand(-cw * 0.15, cw * 0.15), y: y0 + ch * (r + 0.5) + rand(-ch * 0.15, ch * 0.15) }));
}

// ---- The mini-games ---------------------------------------------------------------

const GAMES = [
  {
    // Hold to pour a beer and let go inside the green zone.
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
  },
  {
    // Find Alejandro's gold watch among the others.
    id: 'watch',
    who: 'alejandro',
    create(run) {
      const n = Math.min(12, 5 + Math.floor(run.score / 3));
      const list = spots(n, 14, 110, 166, 300, 4, 4);
      const gold = Math.floor(Math.random() * n);
      const colors = ['#c9ced2', '#b87333', '#4a4a4a', '#c9ced2'];
      list.forEach((s, i) => {
        s.gold = i === gold;
        s.color = s.gold ? '#f5c542' : pick(colors);
        s.tilt = rand(-0.4, 0.4);
      });
      return {
        dur: 4.5,
        list,
        down(x, y) {
          if (this.result) return;
          const hit = this.list.find((s) => dist(x, y, s.x, s.y) < 15);
          if (!hit) return;
          this.picked = hit;
          this.result = hit.gold ? 'win' : 'lose';
        },
        draw(ctx, now, run, t) {
          bgTable(ctx, 96);
          person(ctx, LOOKS.alejandro, 90, 34, 1.5, { mood: this.result === 'win' ? 'happy' : 'worried' });
          bubble(ctx, t(this.result === 'win' ? 'mini.watchFound' : 'mini.watchLine'), 90, 14);
          for (const s of this.list) {
            ctx.save();
            ctx.translate(s.x, s.y);
            ctx.rotate(s.tilt);
            rect(ctx, -4, -15, 8, 30, OUTLINE);
            rect(ctx, -3.5, -14.5, 7, 29, s.gold ? '#d4a017' : '#6b5a50');
            box(ctx, -9, -9, 18, 18, OUTLINE, 3);
            box(ctx, -8, -8, 16, 16, s.color, 3);
            box(ctx, -5.5, -5.5, 11, 11, '#fffaf0', 2);
            rect(ctx, -0.5, -4.5, 1, 5, OUTLINE);
            rect(ctx, -0.5, -0.5, 4, 1, OUTLINE);
            ctx.restore();
            if (s.gold && Math.sin(now * 6 + s.x) > 0.3) sparkle(ctx, s.x + 8, s.y - 9, 2.5);
            if (this.picked === s) {
              ctx.globalAlpha = 0.6;
              box(ctx, s.x - 14, s.y - 18, 28, 36, s.gold ? '#2ecc71' : '#e74c3c', 4);
              ctx.globalAlpha = 1;
            }
          }
        },
      };
    },
  },
  {
    // Blanca is on her phone: hide it the moment Pepe Nacho walks in.
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
  },
  {
    // Tap very fast to calm Blanca down.
    id: 'calm',
    who: 'blanca',
    create() {
      return {
        dur: 4.5,
        calm: 0,
        taps: [],
        down(x, y) {
          if (this.result) return;
          this.calm += 0.075;
          this.taps.push({ x, y, t: 0 });
          if (this.calm >= 1) this.result = 'win';
        },
        update(dt) {
          this.calm = Math.max(0, this.calm - dt * 0.12);
          for (const p of this.taps) p.t += dt;
          this.taps = this.taps.filter((p) => p.t < 0.6);
        },
        draw(ctx, now, run, t) {
          bgRoom(ctx, 250);
          const c = this.calm;
          const mood = this.result === 'win' || c > 0.75 ? 'happy' : c > 0.35 ? 'neutral' : 'angry';
          const shake = c < 0.4 && !this.result ? Math.sin(now * 40) * 1.5 : 0;
          person(ctx, LOOKS.blanca, 90 + shake, 120, 2.6, { mood, legs: true });
          if (c < 0.6 && !this.result) {
            // Stress scribble over her head
            for (let i = 0; i < 7; i++) {
              const a = now * 6 + i;
              rect(ctx, 90 + Math.cos(a) * 14 - 1, 106 + Math.sin(a * 1.3) * 5, 3, 1.5, '#e74c3c');
            }
            bubble(ctx, t('mini.calmLine'), 90, 84);
          } else if (this.result === 'win') {
            bubble(ctx, t('mini.calmOk'), 90, 84);
          }
          for (const p of this.taps) {
            ctx.globalAlpha = 1 - p.t / 0.6;
            drawHeart(ctx, p.x - 3.5, p.y - 4 - p.t * 30, true);
            ctx.globalAlpha = 1;
          }
          // Calm meter
          box(ctx, 20, 268, 140, 14, OUTLINE, 2);
          rect(ctx, 22, 270, 136, 10, '#4a3a33');
          rect(ctx, 22, 270, 136 * Math.min(1, c), 10, c > 0.75 ? '#2ecc71' : c > 0.35 ? '#f1c40f' : '#e74c3c');
          rect(ctx, 22, 270, 136 * Math.min(1, c), 3, 'rgba(255,255,255,0.35)');
          text(ctx, t('mini.calmBar'), 90, 288, { size: 6, color: '#3a2518', align: 'center' });
        },
      };
    },
  },
  {
    // Catch the toast while it flies out of the toaster.
    id: 'toast',
    who: 'blanca',
    create(run) {
      const count = run.speed >= 1.3 ? 2 : 1;
      const toasts = [];
      for (let i = 0; i < count; i++) {
        toasts.push({ x: 90 + (i ? 14 : -6), y: 238, vx: rand(-40, 40), vy: -rand(185, 215), delay: 0.35 + i * 0.45, caught: false, spin: rand(-6, 6) });
      }
      return {
        dur: 4.2,
        toasts,
        down(x, y) {
          if (this.result) return;
          for (const p of this.toasts) {
            if (p.caught || this.elapsed < p.delay) continue;
            if (dist(x, y, p.x, p.y) < 20) {
              p.caught = true;
              break;
            }
          }
          if (this.toasts.every((p) => p.caught)) this.result = 'win';
        },
        update(dt) {
          for (const p of this.toasts) {
            if (p.caught || this.elapsed < p.delay) continue;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += 150 * dt;
            if (p.x < 12 || p.x > W - 12) p.vx *= -1;
            if (p.y > 250 && p.vy > 0) this.result = 'lose';
          }
        },
        draw(ctx, now) {
          bgRoom(ctx, 262);
          counter(ctx, 258);
          // Toaster
          box(ctx, 62, 222, 56, 38, OUTLINE, 4);
          box(ctx, 63, 223, 54, 36, '#c9ced2', 4);
          rect(ctx, 66, 226, 48, 3, '#eef1f3');
          rect(ctx, 70, 230, 16, 3, OUTLINE);
          rect(ctx, 94, 230, 16, 3, OUTLINE);
          rect(ctx, 114, 240, 5, 4, OUTLINE);
          for (const p of this.toasts) {
            if (this.elapsed < p.delay) continue;
            if (p.caught) {
              sparkle(ctx, p.x, p.y, 6, '#f5c542');
              continue;
            }
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(this.elapsed * p.spin);
            drawIcon(ctx, 'toast', -12, -12, 1.5);
            ctx.restore();
          }
        },
      };
    },
  },
  {
    // Mari: tap every coffee stain to wipe the counter clean.
    id: 'wipe',
    who: 'mari',
    create(run) {
      const n = Math.min(9, 4 + Math.floor(run.score / 4));
      return {
        dur: 5,
        stains: spots(n, 14, 112, 166, 300, 3, 4).map((s) => ({ ...s, r: rand(7, 11), clean: 0 })),
        down(x, y) {
          if (this.result) return;
          const s = this.stains.find((st) => !st.clean && dist(x, y, st.x, st.y) < st.r + 8);
          if (s) s.clean = 0.01;
          if (this.stains.every((st) => st.clean)) this.result = 'win';
        },
        update(dt) {
          for (const s of this.stains) if (s.clean) s.clean += dt;
        },
        draw(ctx, now, run, t) {
          bgTable(ctx, 98);
          person(ctx, LOOKS.mari, 90, 34, 1.5, { mood: 'happy' });
          bubble(ctx, t('mini.wipeLine'), 90, 14);
          for (const s of this.stains) {
            if (s.clean) {
              if (s.clean < 0.4) sparkle(ctx, s.x, s.y, 7 * (1 - s.clean / 0.4));
              continue;
            }
            box(ctx, s.x - s.r, s.y - s.r * 0.75, s.r * 2, s.r * 1.5, '#8a5a32', 3);
            box(ctx, s.x - s.r + 2, s.y - s.r * 0.75 + 2, s.r * 2 - 4, s.r * 1.5 - 4, '#6f3b1e', 2);
            rect(ctx, s.x + s.r - 2, s.y + s.r * 0.5, 3, 3, '#6f3b1e');
          }
        },
      };
    },
  },
  {
    // Mari: tap when the sliding cup is right under the coffee machine.
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
  },
  {
    // The match on the bar's TV: shoot where the keeper is not.
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
  },
  {
    // Andrea: count the drinks and pick the right number.
    id: 'count',
    who: 'andrea',
    create(run) {
      const max = run.score > 8 ? 7 : 5;
      const n = 2 + Math.floor(Math.random() * (max - 1));
      const item = pick(['coffee', 'beer', 'juice', 'toast']);
      const options = new Set([n]);
      while (options.size < 3) {
        const o = n + pick([-2, -1, 1, 2]);
        if (o >= 1) options.add(o);
      }
      return {
        dur: 5,
        n,
        item,
        list: spots(n, 16, 104, 164, 236, 4, 3),
        options: shuffle([...options]),
        down(x, y) {
          if (this.result || y < 250) return;
          const i = Math.floor((x - 10) / 54);
          if (i < 0 || i > 2) return;
          this.chosen = i;
          this.result = this.options[i] === this.n ? 'win' : 'lose';
        },
        draw(ctx, now, run, t) {
          bgTable(ctx, 96);
          person(ctx, LOOKS.andrea, 90, 34, 1.5, { mood: 'happy' });
          bubble(ctx, t('mini.countLine'), 90, 14);
          for (const s of this.list) drawIcon(ctx, this.item, s.x - 12, s.y - 12, 1.5);
          this.options.forEach((o, i) => {
            const x = 10 + i * 54;
            const chosen = this.chosen === i;
            const color = chosen ? (this.result === 'win' ? '#2ecc71' : '#e74c3c') : '#fffaf0';
            box(ctx, x, 252, 50, 50, OUTLINE, 3);
            box(ctx, x + 1, 253, 48, 46, color, 3);
            text(ctx, String(o), x + 25, 266, { size: 16, color: '#3a2518', align: 'center' });
          });
        },
      };
    },
  },
  {
    // Andrea: tap what the customer asked for.
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
  },
  {
    // Stack three cups: tap to drop the sliding cup on top of the pile.
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
  },
  {
    // A fly buzzes over the tapa: tap it to shoo it away.
    id: 'fly',
    who: 'andrea',
    create() {
      return {
        dur: 4,
        x: rand(40, 140),
        y: rand(150, 220),
        vx: rand(-60, 60),
        vy: rand(-60, 60),
        down(x, y) {
          if (this.result) return;
          if (dist(x, y, this.x, this.y) < 16) this.result = 'win';
        },
        update(dt) {
          if (this.result === 'win') {
            this.y -= dt * 120;
            this.x += dt * 60;
            return;
          }
          this.vx += rand(-400, 400) * dt;
          this.vy += rand(-400, 400) * dt;
          const sp = Math.hypot(this.vx, this.vy);
          const max = 95;
          if (sp > max) {
            this.vx *= max / sp;
            this.vy *= max / sp;
          }
          this.x += this.vx * dt;
          this.y += this.vy * dt;
          if (this.x < 20 || this.x > 160) this.vx *= -1;
          if (this.y < 110 || this.y > 250) this.vy *= -1;
          this.x = Math.max(20, Math.min(160, this.x));
          this.y = Math.max(110, Math.min(250, this.y));
        },
        draw(ctx, now, run, t) {
          bgTable(ctx, 100);
          person(ctx, LOOKS.andrea, 90, 34, 1.5, { mood: this.result === 'win' ? 'happy' : 'worried' });
          bubble(ctx, t('mini.flyLine'), 90, 14);
          // Plate with the tapa
          box(ctx, 50, 190, 80, 34, OUTLINE, 12);
          box(ctx, 51, 191, 78, 32, '#f4f4f8', 12);
          box(ctx, 58, 196, 64, 22, '#dcdce4', 9);
          drawIcon(ctx, 'tapa', 66, 186, 3);
          // The fly
          const wing = Math.sin(now * 60) > 0 ? 1 : 0;
          ctx.globalAlpha = 0.6;
          box(ctx, this.x - 6, this.y - 4 - wing * 2, 5, 4, '#d8eef5', 2);
          box(ctx, this.x + 1, this.y - 4 - wing * 2, 5, 4, '#d8eef5', 2);
          ctx.globalAlpha = 1;
          box(ctx, this.x - 3, this.y - 2, 6, 5, '#1a1a1a', 2);
          rect(ctx, this.x - 2, this.y - 1, 1, 1, '#c0392b');
          rect(ctx, this.x + 1, this.y - 1, 1, 1, '#c0392b');
          if (!this.result) {
            for (let i = 0; i < 2; i++) {
              const a = now * 9 + i * 3;
              rect(ctx, this.x + Math.cos(a) * 10, this.y + Math.sin(a) * 6, 2, 0.6, '#3a2518');
            }
          }
        },
      };
    },
  },
  {
    // Zap through the TV channels and stop on the football.
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
  },
  {
    // Move the tip jar to catch the falling coins.
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
  },
  {
    // Morning! Tap fast to pull the shutter up before opening time.
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
  },
];

export const MINIGAME_IDS = GAMES.map((g) => g.id);

// ---- A run of mini-games ----------------------------------------------------------

export class MiniRun {
  constructor({ t, onEvent = () => {}, only = null }) {
    this.t = t;
    this.emit = onEvent;
    this.only = only;
    this.lives = LIVES;
    this.score = 0;
    this.speed = 1;
    this.over = false;
    this.overTime = 0;
    this.time = 0;
    this.phase = 'intro';
    this.pt = 0;
    this.game = null;
    this.last = null;
    this.shake = 0;
    this.confetti = [];
    this.streak = 0;
    this.bump = 0;
    this.tickT = 0;
    this.next();
  }

  next() {
    const pool = GAMES.filter((g) => (this.only ? g.id === this.only : g.id !== this.last));
    const def = pool[Math.floor(Math.random() * pool.length)];
    this.last = def.id;
    this.def = def;
    this.game = def.create(this);
    this.game.elapsed = 0;
    this.game.result = null;
    this.phase = 'intro';
    this.pt = 0;
    this.emit('miniIntro', { id: def.id });
  }

  introTime() {
    return INTRO_TIME / Math.sqrt(this.speed);
  }

  /** Fraction of time left in the current mini-game, from 1 to 0. */
  timeLeft() {
    if (!this.game) return 0;
    return Math.max(0, 1 - this.game.elapsed / this.game.dur);
  }

  update(dt) {
    for (const c of this.confetti) {
      c.t += dt;
      c.x += c.vx * dt;
      c.y += c.vy * dt;
      c.vy += 60 * dt;
    }
    this.confetti = this.confetti.filter((c) => c.t < c.life);
    this.shake = Math.max(0, this.shake - dt);
    this.bump = Math.max(0, this.bump - dt);
    if (this.over) {
      this.overTime += dt;
      return;
    }
    this.time += dt;
    this.pt += dt;
    const g = this.game;
    if (this.phase === 'intro') {
      if (this.pt >= this.introTime()) {
        this.phase = 'play';
        this.pt = 0;
      }
    } else if (this.phase === 'play') {
      const sdt = dt * this.speed;
      g.elapsed += sdt;
      // Ticking clock when time is running out
      if (this.timeLeft() < 0.3) {
        this.tickT -= dt;
        if (this.tickT <= 0) {
          this.tickT = 0.25;
          this.emit('tick', {});
        }
      }
      if (g.update) g.update(sdt, this);
      if (g.result) this.finish(g.result);
      else if (g.elapsed >= g.dur) this.finish(g.timeout ? g.timeout(this) : 'lose');
    } else if (this.phase === 'result') {
      // Let the mini-game keep animating its ending
      if (g.update) g.update(dt * this.speed * 0.5, this);
      if (this.pt >= RESULT_TIME) {
        if (this.lives <= 0) {
          this.over = true;
          this.emit('gameover', this.summary());
        } else if (this.result === 'win' && this.score % WINS_PER_SPEEDUP === 0) {
          this.speed = Math.round((this.speed + 0.15) * 100) / 100;
          this.phase = 'speedup';
          this.pt = 0;
          this.emit('speedup', { speed: this.speed });
        } else {
          this.next();
        }
      }
    } else if (this.phase === 'speedup' && this.pt >= SPEEDUP_TIME) {
      this.next();
    }
  }

  finish(result) {
    this.phase = 'result';
    this.pt = 0;
    this.result = result;
    this.game.result = result;
    this.closeCall = result === 'win' && this.timeLeft() < 0.2;
    if (result === 'win') {
      this.score++;
      this.streak++;
      this.bump = 0.35;
      for (let i = 0; i < 30; i++) {
        this.confetti.push({
          x: Math.random() * W,
          y: HUD_H + Math.random() * 20,
          vx: (Math.random() - 0.5) * 30,
          vy: 20 + Math.random() * 40,
          t: 0,
          life: 1.2,
          color: ['#e74c3c', '#f5c542', '#2ecc71', '#3498db', '#ff9f43', '#e84393'][i % 6],
        });
      }
      this.emit('miniWin', { score: this.score });
    } else {
      this.lives--;
      this.streak = 0;
      this.shake = 0.35;
      this.emit('miniLose', { lives: this.lives });
    }
  }

  /** Finger pressed, in logical coordinates. */
  down(x, y) {
    if (this.over) return;
    if (y < HUD_H) {
      this.emit('pause', {});
      return;
    }
    if (this.phase === 'play' && this.game.down) this.game.down(x, y, this);
  }

  /** Finger moved while pressed. */
  move(x, y) {
    if (this.phase === 'play' && this.game.move) this.game.move(x, y, this);
  }

  /** Finger released. */
  up(x, y) {
    if (this.phase === 'play' && this.game.up) this.game.up(x, y, this);
  }

  summary() {
    return { score: this.score, served: this.score, bestCombo: 0, speed: this.speed, stars: null };
  }
}

// ---- Drawing a run ----------------------------------------------------------------

function drawHud(ctx, run, now) {
  const g = ctx.createLinearGradient(0, 0, 0, HUD_H);
  g.addColorStop(0, '#8a5a32');
  g.addColorStop(1, '#6e4426');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, HUD_H);
  rect(ctx, 0, HUD_H, W, 1, OUTLINE);
  for (let i = 0; i < LIVES; i++) drawHeart(ctx, 4 + i * 9, 5.5, i < run.lives);
  box(ctx, 66, 3, 48, 12, 'rgba(0,0,0,0.35)', 2);
  const bump = 1 + run.bump * 1.2;
  ctx.save();
  ctx.translate(90, 9);
  ctx.scale(bump, bump);
  text(ctx, String(run.score), 0, -3.5, { size: 7, color: '#f5c542', align: 'center' });
  ctx.restore();
  rect(ctx, 165, 5.5, 3, 7, '#f5e6c8');
  rect(ctx, 170, 5.5, 3, 7, '#f5e6c8');
  text(ctx, `x${run.speed.toFixed(2).replace(/0$/, '')}`, 158, 6.5, { size: 5, color: '#ffd9b0', align: 'right' });
  // Time left
  if (run.phase === 'play' || run.phase === 'result') {
    const left = run.timeLeft();
    const hurry = left < 0.3 && run.phase === 'play' && Math.sin(now * 16) > 0;
    rect(ctx, 0, HUD_H + 1, W, 4, '#3a2a20');
    rect(ctx, 0, HUD_H + 1, W * left, 4, hurry ? '#ffffff' : left < 0.3 ? '#e74c3c' : '#2ecc71');
  }
}

function drawIntro(ctx, run, t) {
  const k = Math.min(1, run.pt / 0.25);
  // Mustard curtain sliding away to reveal the next scene
  const wipe = Math.min(1, run.pt / 0.3);
  if (wipe < 1) {
    const e = wipe * wipe;
    rect(ctx, -e * W * 1.2, 0, W * 1.2, H, '#e8c21c');
    rect(ctx, -e * W * 1.2 + W * 1.2 - 4, 0, 4, H, '#b8930a');
  }
  ctx.globalAlpha = 0.55 * k;
  rect(ctx, 0, 0, W, H, '#2b1a10');
  ctx.globalAlpha = 1;
  const who = run.def.who;
  if (LOOKS[who]) person(ctx, LOOKS[who], 90, 70 - (1 - k) * 20, 2.4, { mood: 'happy', legs: who === 'boss' });
  const title = t(`mini.${run.def.id}.title`);
  const y = 170;
  const pop = k < 1 ? 0.6 + k * 0.5 : 1 + Math.sin(run.pt * 10) * 0.03;
  ctx.save();
  ctx.translate(W / 2, y);
  ctx.scale(pop, pop);
  box(ctx, -86, -16, 172, 32, OUTLINE, 4);
  box(ctx, -85, -15, 170, 30, '#e8c21c', 4);
  const size = fitSize(ctx, title, 160, 10);
  text(ctx, title, 0, -size / 2, { size, color: '#ffffff', align: 'center', outline: '#7a4a10' });
  ctx.restore();
  const lines = wrap(ctx, t(`mini.${run.def.id}.sub`), 160, 6);
  lines.forEach((line, i) => text(ctx, line, W / 2, 200 + i * 10, { size: 6, color: '#fffaf0', align: 'center', outline: OUTLINE }));
}

function drawResult(ctx, run, t) {
  const win = run.result === 'win';
  const k = Math.min(1, run.pt / 0.2);
  const pop = k < 1 ? 0.4 + k * 0.8 : 1.2 - Math.min(0.2, (run.pt - 0.2) * 0.6);
  ctx.save();
  ctx.translate(W / 2, 150);
  ctx.scale(pop, pop);
  const label = win ? t('mini.good') : t('mini.bad');
  const size = fitSize(ctx, label, 170, 16);
  text(ctx, label, 0, -size / 2, { size, color: win ? '#2ecc71' : '#e74c3c', align: 'center', outline: OUTLINE });
  ctx.restore();
  if (win && run.closeCall) {
    text(ctx, t('mini.closeCall'), W / 2, 172, { size: 7, color: '#f5c542', align: 'center', outline: OUTLINE });
  } else if (win && run.streak >= 3) {
    text(ctx, t('mini.streak', { n: run.streak }), W / 2, 172, { size: 7, color: '#ff9f43', align: 'center', outline: OUTLINE });
  }
}

function drawSpeedup(ctx, run, t, now) {
  rect(ctx, 0, 0, W, H, '#e8c21c');
  for (let i = 0; i < 14; i++) {
    const y = (i * 37 + now * 400) % H;
    rect(ctx, 0, y, W, 2, '#f5d75a');
  }
  person(ctx, LOOKS.boss, 90, 70, 2.2, { mood: 'happy', legs: true });
  const label = t('mini.faster');
  const size = fitSize(ctx, label, 168, 14);
  const pop = 1 + Math.sin(now * 12) * 0.06;
  ctx.save();
  ctx.translate(W / 2, 200);
  ctx.scale(pop, pop);
  text(ctx, label, 0, -size / 2, { size, color: '#ffffff', align: 'center', outline: '#7a4a10' });
  ctx.restore();
  text(ctx, `x${run.speed.toFixed(2)}`, W / 2, 230, { size: 8, color: '#7a4a10', align: 'center' });
}

export function vignette(ctx) {
  const v = ctx.createRadialGradient(W / 2, H / 2, 90, W / 2, H / 2, 210);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(60,30,10,0.28)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
}

/** Draws one frame of a mini-games run. */
export function renderMini(ctx, run, { t, now }) {
  ctx.save();
  if (run.shake > 0) ctx.translate((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4);
  if (run.phase === 'speedup') {
    drawSpeedup(ctx, run, t, now);
  } else {
    run.game.draw(ctx, now, run, t);
    vignette(ctx);
    if (run.phase === 'intro') drawIntro(ctx, run, t);
    if (run.phase === 'result') drawResult(ctx, run, t);
  }
  for (const c of run.confetti) {
    ctx.globalAlpha = c.t > c.life * 0.8 ? (c.life - c.t) / (c.life * 0.2) : 1;
    rect(ctx, c.x, c.y, 2, 1.5, c.color);
  }
  ctx.globalAlpha = 1;
  drawHud(ctx, run, now);
  if (run.over) {
    const k = Math.min(1, run.overTime / 0.5);
    ctx.globalAlpha = 0.6 * k;
    rect(ctx, 0, 0, W, H, '#2b1a10');
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}
