// Draws the bar on a canvas already scaled to logical pixels (180x320).
// Static parts of the scene are painted once into cached layers; customers,
// staff, effects and the HUD are drawn every frame on top.

import {
  W,
  H,
  HUD_H,
  SEAT_X,
  BUBBLE_Y,
  PATIENCE_Y,
  CUSTOMER_TOP,
  COUNTER_Y,
  COUNTER_H,
  FLOOR_Y,
  STAFF_TOP,
  SPEECH_Y,
  TRAY,
  STATION_PANEL_Y,
  stationRect,
  traySlotRect,
} from './layout.js';
import { STATIONS, MAX_STRIKES, STAFF, BOSS, CLOCK } from './config.js';
import { drawIcon, drawPerson, drawHeart, drawCoin, shade, OUTLINE } from './sprites.js';

export const FONT = '"Press Start 2P", ui-monospace, monospace';
const LAYER_SCALE = 4;

const LAMPS = [36, 144];
const STATION_ACCENTS = {
  coffee: '#8b5a2b',
  juice: '#e67e22',
  toast: '#c0843d',
  beer: '#d4a017',
  tapa: '#c9a227',
  menu: '#2e9e5b',
};

// ---- Drawing helpers ------------------------------------------------------------

function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

/** Pixel-style rounded box: a rectangle with its four corner pixels cut off. */
function box(ctx, x, y, w, h, color, radius = 1) {
  ctx.fillStyle = color;
  ctx.fillRect(x + radius, y, w - radius * 2, h);
  ctx.fillRect(x, y + radius, w, h - radius * 2);
}

function text(ctx, str, x, y, { size = 6, color = '#fff', align = 'left', outline = null, shadow = null } = {}) {
  ctx.font = `${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  if (shadow) {
    ctx.fillStyle = shadow;
    ctx.fillText(str, x + 0.75, y + 0.75);
  }
  if (outline) {
    ctx.fillStyle = outline;
    for (const [dx, dy] of [[-0.75, 0], [0.75, 0], [0, -0.75], [0, 0.75], [-0.75, -0.75], [0.75, 0.75], [-0.75, 0.75], [0.75, -0.75]]) {
      ctx.fillText(str, x + dx, y + dy);
    }
  }
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function glow(ctx, x, y, radius, color, alpha) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = alpha;
  ctx.fillStyle = g;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  ctx.globalAlpha = 1;
}

// ---- Cached layers ----------------------------------------------------------------

const layers = {};

function layer(name, paint) {
  if (!layers[name]) {
    const c = document.createElement('canvas');
    c.width = W * LAYER_SCALE;
    c.height = H * LAYER_SCALE;
    const lctx = c.getContext('2d');
    lctx.setTransform(LAYER_SCALE, 0, 0, LAYER_SCALE, 0, 0);
    lctx.imageSmoothingEnabled = false;
    paint(lctx);
    layers[name] = c;
  }
  return layers[name];
}

function paintWall(ctx) {
  // Upper wall: warm plaster with soft vertical boards
  rect(ctx, 0, 0, W, 50, '#ecd2a2');
  for (let x = 0; x < W; x += 10) {
    rect(ctx, x, HUD_H, 1, 32, '#e0c08c');
    rect(ctx, x + 1, HUD_H, 1, 32, '#f3dcb2');
  }
  const top = ctx.createLinearGradient(0, HUD_H, 0, 50);
  top.addColorStop(0, 'rgba(60,30,10,0.25)');
  top.addColorStop(1, 'rgba(60,30,10,0)');
  ctx.fillStyle = top;
  ctx.fillRect(0, HUD_H, W, 32);

  // Spanish tiles (azulejos) behind the customers
  const T = 9;
  for (let ty = 50; ty < COUNTER_Y; ty += T) {
    for (let tx = 0; tx < W; tx += T) {
      rect(ctx, tx, ty, T, T, '#f4efe2');
      rect(ctx, tx, ty, T, 0.5, '#c9c1ae');
      rect(ctx, tx, ty, 0.5, T, '#c9c1ae');
      const cx = tx + T / 2;
      const cy = ty + T / 2;
      rect(ctx, cx - 0.5, cy - 3, 1, 6, '#2e6fa8');
      rect(ctx, cx - 3, cy - 0.5, 6, 1, '#2e6fa8');
      rect(ctx, cx - 1.5, cy - 1.5, 3, 3, '#2e6fa8');
      rect(ctx, cx - 0.5, cy - 0.5, 1, 1, '#f5c542');
      rect(ctx, tx + 0.5, ty + 0.5, 1.5, 1.5, '#7fb0d8');
      rect(ctx, tx + T - 2, ty + 0.5, 1.5, 1.5, '#7fb0d8');
      rect(ctx, tx + 0.5, ty + T - 2, 1.5, 1.5, '#7fb0d8');
      rect(ctx, tx + T - 2, ty + T - 2, 1.5, 1.5, '#7fb0d8');
    }
  }
  rect(ctx, 0, 49, W, 2, '#8b5a33');
  rect(ctx, 0, 49, W, 0.5, '#c58b52');

  // Shelf with bottles
  const bottles = ['#2e7d32', '#6a1b9a', '#b71c1c', '#c99a1c', '#00796b', '#5d6d7e', '#d35400', '#1b4f72'];
  for (let i = 0; i < 16; i++) {
    const bx = 3 + i * 11;
    if (bx > 46 && bx < 128) continue;
    const color = bottles[i % bottles.length];
    const h = 9 + ((i * 5) % 4);
    const by = 46 - h;
    rect(ctx, bx - 0.5, by - 0.5, 5, h + 1, OUTLINE);
    rect(ctx, bx, by, 4, h, color);
    rect(ctx, bx + 0.5, by + 1, 1, h - 2, shade(color, 0.35));
    rect(ctx, bx + 3, by, 1, h, shade(color, -0.3));
    rect(ctx, bx, by + h / 2 - 1, 4, 2.5, '#f3ead3');
    rect(ctx, bx + 1, by - 3.5, 2, 3.5, color);
    rect(ctx, bx + 1, by - 4.5, 2, 1, '#d4a017');
  }
  rect(ctx, 0, 46, W, 3, '#7a4a28');
  rect(ctx, 0, 46, W, 0.75, '#b07a48');
  rect(ctx, 0, 48.5, W, 0.5, '#4a2c16');

  // Sign board
  rect(ctx, 48, 20, 84, 17, OUTLINE);
  rect(ctx, 49, 21, 82, 15, '#5a361d');
  rect(ctx, 50, 22, 80, 13, '#2f1d12');
  rect(ctx, 50, 22, 80, 1, '#4a2e1c');
  rect(ctx, 89.5, HUD_H, 1, 2, '#3a2a20');
}

function paintCounter(ctx) {
  const y = COUNTER_Y;
  rect(ctx, 0, y - 1, W, 1, 'rgba(0,0,0,0.25)');
  rect(ctx, 0, y, W, 5, '#c98d55');
  rect(ctx, 0, y, W, 1, '#e8b37c');
  rect(ctx, 0, y + 4, W, 1, '#8a5a32');
  rect(ctx, 0, y + 5, W, COUNTER_H - 5, '#86532e');
  for (let x = 0; x < W; x += 20) {
    rect(ctx, x, y + 5, 0.75, COUNTER_H - 7, '#6b3f20');
    rect(ctx, x + 0.75, y + 5, 0.75, COUNTER_H - 7, '#a06a3c');
    rect(ctx, x + 6, y + 9, 6, 0.5, '#76461f');
    rect(ctx, x + 3, y + 14, 8, 0.5, '#76461f');
  }
  rect(ctx, 0, y + COUNTER_H - 3, W, 1, '#d4a017');
  rect(ctx, 0, y + COUNTER_H - 2, W, 2, '#4a2a14');

  // Little things on the counter between seats
  const things = [
    [46, 'napkins'],
    [90, 'sugar'],
    [134, 'napkins'],
  ];
  for (const [cx, kind] of things) {
    if (kind === 'napkins') {
      rect(ctx, cx - 3.5, y - 4.5, 7, 5, OUTLINE);
      rect(ctx, cx - 3, y - 4, 6, 4, '#b0b8bf');
      rect(ctx, cx - 2, y - 6, 4, 2.5, '#ffffff');
      rect(ctx, cx - 3, y - 4, 6, 1, '#dfe5ea');
    } else {
      rect(ctx, cx - 3.5, y - 4.5, 7, 5, OUTLINE);
      rect(ctx, cx - 3, y - 4, 6, 4, '#ffffff');
      rect(ctx, cx - 3, y - 2, 6, 1, '#2e6fa8');
      rect(ctx, cx - 1, y - 6, 2, 1.5, OUTLINE);
    }
  }
}

function paintFloor(ctx) {
  const top = FLOOR_Y;
  const bottom = STATION_PANEL_Y;
  const T = 10;
  for (let ty = top; ty < bottom; ty += T) {
    for (let tx = 0; tx < W; tx += T) {
      const even = ((tx / T) + Math.floor((ty - top) / T)) % 2 === 0;
      rect(ctx, tx, ty, T, T, even ? '#8c4a33' : '#d6c3a1');
      rect(ctx, tx, ty, T, 0.5, even ? '#a35a40' : '#e6d6b8');
    }
  }
  const g = ctx.createLinearGradient(0, top, 0, top + 18);
  g.addColorStop(0, 'rgba(20,10,5,0.55)');
  g.addColorStop(1, 'rgba(20,10,5,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, top, W, 18);
  const g2 = ctx.createLinearGradient(0, bottom - 20, 0, bottom);
  g2.addColorStop(0, 'rgba(20,10,5,0)');
  g2.addColorStop(1, 'rgba(20,10,5,0.4)');
  ctx.fillStyle = g2;
  ctx.fillRect(0, bottom - 20, W, 20);
}

function paintPanel(ctx) {
  const g = ctx.createLinearGradient(0, STATION_PANEL_Y, 0, H);
  g.addColorStop(0, '#3a2518');
  g.addColorStop(1, '#1f130c');
  ctx.fillStyle = g;
  ctx.fillRect(0, STATION_PANEL_Y, W, H - STATION_PANEL_Y);
  rect(ctx, 0, STATION_PANEL_Y, W, 2, OUTLINE);
  rect(ctx, 0, STATION_PANEL_Y + 2, W, 1, '#6b4530');
  for (let x = 0; x < W; x += 14) rect(ctx, x, STATION_PANEL_Y + 3, 0.5, H, 'rgba(0,0,0,0.15)');
}

// ---- Particles --------------------------------------------------------------------

let particles = [];

function addParticle(p) {
  particles.push({ t: 0, life: 1, gravity: 0, ...p });
}

function spawnFx(game) {
  for (const fx of game.fx) {
    switch (fx.kind) {
      case 'sparkle':
        for (let i = 0; i < 10; i++) {
          const a = (i / 10) * Math.PI * 2;
          const v = 25 + Math.random() * 20;
          addParticle({ kind: 'star', x: fx.x, y: fx.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 10, life: 0.6, color: i % 2 ? '#fff6c0' : '#f5c542' });
        }
        break;
      case 'coins':
        for (let i = 0; i < fx.n; i++) {
          addParticle({ kind: 'coin', x: fx.x, y: fx.y, sx: fx.x, sy: fx.y, delay: i * 0.05, life: 0.7 + i * 0.05, arc: 20 + Math.random() * 20 });
        }
        break;
      case 'puff':
        for (let i = 0; i < 8; i++) {
          addParticle({ kind: 'smoke', x: fx.x + (Math.random() - 0.5) * 12, y: fx.y, vx: (Math.random() - 0.5) * 10, vy: -15 - Math.random() * 10, life: 0.9, size: 3 + Math.random() * 3 });
        }
        break;
      case 'pop': {
        const r = stationRect(fx.station);
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          addParticle({ kind: 'star', x: r.x + r.w / 2, y: r.y + 18, vx: Math.cos(a) * 30, vy: Math.sin(a) * 30, life: 0.35, color: '#ffffff' });
        }
        break;
      }
      case 'confetti':
        for (let i = 0; i < 40; i++) {
          addParticle({
            kind: 'confetti',
            x: Math.random() * W,
            y: HUD_H - 5 - Math.random() * 20,
            vx: (Math.random() - 0.5) * 20,
            vy: 30 + Math.random() * 40,
            life: 1.6,
            color: ['#e74c3c', '#f5c542', '#2ecc71', '#3498db', '#ff9f43', '#e84393'][i % 6],
            spin: Math.random() * 10,
          });
        }
        break;
      default:
        break;
    }
  }
  game.fx.length = 0;
}

function spawnAmbient(game, dt) {
  // Steam from busy coffee and menu stations, bubbles from the beer tap
  for (let i = 0; i < STATIONS.length; i++) {
    const id = STATIONS[i];
    const s = game.stations[id];
    if (!s.busy) continue;
    const r = stationRect(i);
    if ((id === 'coffee' || id === 'menu' || id === 'toast') && Math.random() < dt * 14) {
      addParticle({ kind: 'steam', x: r.x + r.w / 2 + (Math.random() - 0.5) * 8, y: r.y + 10, vx: (Math.random() - 0.5) * 4, vy: -12, life: 0.8, size: 2 + Math.random() * 1.5 });
    }
    if (id === 'beer' && Math.random() < dt * 10) {
      addParticle({ kind: 'bubble', x: r.x + r.w / 2 + (Math.random() - 0.5) * 6, y: r.y + 26, vx: 0, vy: -14, life: 0.6 });
    }
  }
  // Flames around the player when on fire
  if (game.multiplier >= 4 && Math.random() < dt * 30) {
    addParticle({
      kind: 'flame',
      x: game.player.x + (Math.random() - 0.5) * 18,
      y: STAFF_TOP + 6 + Math.random() * 10,
      vx: (Math.random() - 0.5) * 6,
      vy: -20 - Math.random() * 12,
      life: 0.5,
    });
  }
}

function updateParticles(dt) {
  for (const p of particles) {
    p.t += dt;
    if (p.kind === 'coin') continue;
    p.x += (p.vx || 0) * dt;
    p.y += (p.vy || 0) * dt;
    if (p.kind === 'star') {
      p.vx *= 0.9;
      p.vy = p.vy * 0.9 + 40 * dt;
    }
  }
  particles = particles.filter((p) => p.t < p.life);
}

function drawParticles(ctx, front) {
  for (const p of particles) {
    const k = p.t / p.life;
    const isFront = p.kind === 'coin' || p.kind === 'confetti';
    if (isFront !== front) continue;
    switch (p.kind) {
      case 'star': {
        ctx.globalAlpha = 1 - k;
        const s = 2 * (1 - k) + 0.5;
        rect(ctx, p.x - s / 2, p.y - 0.25, s, 0.5, p.color);
        rect(ctx, p.x - 0.25, p.y - s / 2, 0.5, s, p.color);
        break;
      }
      case 'coin': {
        const local = clamp((p.t - p.delay) / (p.life - p.delay), 0, 1);
        if (local <= 0) break;
        const e = local * local;
        const x = p.sx + (8 - p.sx) * e;
        const y = p.sy + (8 - p.sy) * e - Math.sin(local * Math.PI) * p.arc;
        ctx.globalAlpha = 1;
        drawCoin(ctx, x - 2.5, y - 2.5, 0.7);
        break;
      }
      case 'smoke':
        ctx.globalAlpha = (1 - k) * 0.7;
        box(ctx, p.x - p.size / 2, p.y - p.size / 2, p.size + k * 3, p.size + k * 3, '#6b6b6b');
        break;
      case 'steam':
        ctx.globalAlpha = (1 - k) * 0.6;
        box(ctx, p.x - p.size / 2 + Math.sin(p.t * 8) * 1.5, p.y, p.size, p.size, '#ffffff', 0.5);
        break;
      case 'bubble':
        ctx.globalAlpha = 1 - k;
        rect(ctx, p.x, p.y, 1, 1, '#fff6c0');
        break;
      case 'flame':
        ctx.globalAlpha = 1 - k;
        rect(ctx, p.x - 1, p.y - 1, 2 * (1 - k) + 0.5, 3 * (1 - k) + 0.5, k < 0.4 ? '#f5c542' : '#ff6b35');
        break;
      case 'confetti':
        ctx.globalAlpha = k > 0.8 ? (1 - k) / 0.2 : 1;
        rect(ctx, p.x, p.y, Math.abs(Math.sin(p.t * p.spin)) * 2 + 0.5, 1.5, p.color);
        break;
      default:
        break;
    }
    ctx.globalAlpha = 1;
  }
}

// ---- Scene pieces ----------------------------------------------------------------

function drawSign(ctx, now, game) {
  text(ctx, "ÁLVARO'S", W / 2, 25, { size: 7, color: '#f5c542', align: 'center', shadow: '#7a3a12' });
  // Marquee bulbs around the sign
  const bulbs = [];
  for (let x = 51; x <= 129; x += 4) {
    bulbs.push([x, 21.5]);
    bulbs.push([x, 34.5]);
  }
  const speed = game && game.multiplier >= 3 ? 10 : 4;
  const phase = Math.floor(now * speed);
  bulbs.forEach(([x, y], i) => {
    const on = (i + phase) % 3 !== 0;
    rect(ctx, x - 0.5, y - 0.5, 1, 1, on ? '#fff3b0' : '#7a5a2a');
  });
}

function drawLamps(ctx, now) {
  for (const lx of LAMPS) {
    rect(ctx, lx - 0.25, HUD_H, 0.5, 6, '#2b2b2b');
    rect(ctx, lx - 4.5, HUD_H + 5.5, 9, 4, OUTLINE);
    rect(ctx, lx - 4, HUD_H + 6, 8, 3, '#2f6b4f');
    rect(ctx, lx - 4, HUD_H + 6, 8, 0.75, '#4f9b77');
    rect(ctx, lx - 1.5, HUD_H + 9, 3, 1.5, '#fff6c0');
    const flicker = 0.32 + Math.sin(now * 3 + lx) * 0.02;
    glow(ctx, lx, HUD_H + 14, 34, '#ffd27a', flicker);
  }
}

function drawCustomers(ctx, game, now) {
  for (const c of game.seats) {
    if (!c) continue;
    let top = CUSTOMER_TOP + (c.look.offset || 0);
    let alpha = 1;
    let dx = 0;
    let mood = c.mood;
    if (c.state === 'enter') {
      const k = Math.min(1, c.st / 0.35);
      top += (1 - k) * 14;
      alpha = k;
    } else if (c.state === 'leave') {
      const k = Math.min(1, c.st / 0.7);
      if (c.mood === 'happy') top -= Math.sin(k * Math.PI) * 4;
      else dx = (c.seat < 2 ? -1 : 1) * k * 12;
      alpha = 1 - k * k;
    } else {
      top += Math.round(Math.sin(now * 3 + c.seat * 1.7) * 0.6);
      const f = c.patience / c.maxPatience;
      if (f < 0.35) mood = 'worried';
      if (f < 0.15) {
        mood = 'angry';
        dx = Math.sin(now * 40) * 0.7;
      }
    }
    const blink = (now + c.id * 0.7) % 3.5 < 0.12;
    ctx.globalAlpha = alpha;
    drawPerson(ctx, c.look, SEAT_X[c.seat] + dx, top, { mood, blink });
    ctx.globalAlpha = 1;
  }
}

function drawBubbles(ctx, game, now) {
  for (const c of game.seats) {
    if (!c || c.state === 'leave') continue;
    const sx = SEAT_X[c.seat];
    const n = c.order.length;
    const bw = n * 13 + 3;
    const bx = clamp(Math.round(sx - bw / 2), 1, W - bw - 1);
    const pop = c.state === 'enter' ? Math.min(1, c.st / 0.35) : 1;
    const by = BUBBLE_Y + (1 - pop) * 4;
    ctx.globalAlpha = pop;
    box(ctx, bx - 1, by - 1, bw + 2, 18, OUTLINE, 2);
    box(ctx, bx, by, bw, 16, '#fffaf0', 2);
    rect(ctx, bx + 1, by + 14, bw - 2, 1, '#e8dcc4');
    rect(ctx, sx - 2, by + 16, 4, 1, '#fffaf0');
    rect(ctx, sx - 1, by + 17, 2, 1, '#fffaf0');
    rect(ctx, sx - 3, by + 16, 1, 1, OUTLINE);
    rect(ctx, sx + 2, by + 16, 1, 1, OUTLINE);
    rect(ctx, sx - 2, by + 17, 1, 1, OUTLINE);
    rect(ctx, sx + 1, by + 17, 1, 1, OUTLINE);
    rect(ctx, sx - 1, by + 18, 2, 1, OUTLINE);
    c.order.forEach((id, k) => {
      const ix = bx + 2 + k * 13;
      ctx.globalAlpha = pop * (c.served[k] ? 0.3 : 1);
      drawIcon(ctx, id, ix, by + 2, 0.75);
      ctx.globalAlpha = pop;
      if (c.served[k]) {
        rect(ctx, ix + 3, by + 9, 2, 2, '#27ae60');
        rect(ctx, ix + 5, by + 7, 2, 2, '#27ae60');
        rect(ctx, ix + 7, by + 5, 2, 2, '#27ae60');
        rect(ctx, ix + 1, by + 7, 2, 2, '#27ae60');
      }
    });

    const f = Math.max(0, c.patience / c.maxPatience);
    const color = f > 0.5 ? '#2ecc71' : f > 0.25 ? '#f1c40f' : '#e74c3c';
    const urgent = f < 0.25 && Math.sin(now * 16) > 0;
    box(ctx, sx - 15, PATIENCE_Y, 30, 4, OUTLINE, 1);
    rect(ctx, sx - 14, PATIENCE_Y + 1, 28, 2, '#4a3a33');
    rect(ctx, sx - 14, PATIENCE_Y + 1, Math.round(28 * f * 2) / 2, 2, urgent ? '#ffffff' : color);
    rect(ctx, sx - 14, PATIENCE_Y + 1, Math.round(28 * f * 2) / 2, 0.5, shade(color, 0.4));
    ctx.globalAlpha = 1;
  }
}

function drawShadow(ctx, x, y, w) {
  ctx.globalAlpha = 0.35;
  box(ctx, x - w / 2, y, w, 2, '#000000', 1);
  ctx.globalAlpha = 1;
}

function drawBoss(ctx, game, now) {
  if (!game || game.boss.x <= -13) return;
  const bob = game.boss.active ? Math.round(Math.sin(now * 2) * 0.6) : 0;
  const top = STAFF_TOP + bob;
  drawShadow(ctx, game.boss.x, STAFF_TOP + 34, 14);
  drawPerson(ctx, BOSS.look, game.boss.x, top, { mood: 'neutral', legs: true, blink: now % 4 < 0.12 });
  if (game.boss.active) {
    box(ctx, game.boss.x - 7, top - 12, 14, 9, OUTLINE, 1);
    box(ctx, game.boss.x - 6, top - 11, 12, 7, '#c0392b', 1);
    text(ctx, 'x2', game.boss.x, top - 10, { size: 5, color: '#fff6c0', align: 'center' });
  }
}

function drawPlayer(ctx, game, now) {
  const staff = game ? game.staff : STAFF[0];
  let x = W / 2 + Math.sin(now * 0.8) * 40;
  let walking = true;
  let mood = 'happy';
  if (game) {
    x = game.player.x;
    walking = Math.abs(game.player.target - game.player.x) > 0.5;
    if (game.shake > 0) mood = 'worried';
  }
  const step = walking ? Math.round(Math.sin(now * 16) * 2) : 0;
  const top = STAFF_TOP - (walking ? Math.abs(step) * 0.5 : 0);
  drawShadow(ctx, x, STAFF_TOP + 34, 16);
  drawPerson(ctx, staff.look, x, top, { mood, legs: true, step, blink: now % 3.2 < 0.12 });
}

function drawSpeech(ctx, game) {
  if (!game.speech) return;
  ctx.font = `5px ${FONT}`;
  const w = Math.ceil(ctx.measureText(game.speech.text).width) + 8;
  const x = clamp(Math.round(game.player.x - w / 2), 2, W - w - 2);
  const tail = clamp(Math.round(game.player.x), x + 3, x + w - 4);
  box(ctx, x - 1, SPEECH_Y - 1, w + 2, 12, OUTLINE, 2);
  box(ctx, x, SPEECH_Y, w, 10, '#fffaf0', 2);
  rect(ctx, tail - 1, SPEECH_Y + 10, 3, 1, '#fffaf0');
  rect(ctx, tail, SPEECH_Y + 11, 1, 1, '#fffaf0');
  rect(ctx, tail - 2, SPEECH_Y + 10, 1, 1, OUTLINE);
  rect(ctx, tail + 2, SPEECH_Y + 10, 1, 1, OUTLINE);
  rect(ctx, tail - 1, SPEECH_Y + 11, 1, 1, OUTLINE);
  rect(ctx, tail + 1, SPEECH_Y + 11, 1, 1, OUTLINE);
  rect(ctx, tail, SPEECH_Y + 12, 1, 1, OUTLINE);
  text(ctx, game.speech.text, x + 4, SPEECH_Y + 2.5, { size: 5, color: '#3a2518' });
}

function drawTray(ctx, game) {
  const cap = game ? game.trayCapacity : STAFF[0].trayCapacity;
  const first = traySlotRect(0, cap);
  const total = cap * TRAY.slot;
  const x = first.x - 5;
  const w = total + 10;
  ctx.globalAlpha = 0.35;
  box(ctx, x + 2, TRAY.y + TRAY.h - 1, w - 2, 3, '#000', 1);
  ctx.globalAlpha = 1;
  box(ctx, x - 1, TRAY.y + 1, w + 2, TRAY.h, OUTLINE, 3);
  box(ctx, x, TRAY.y + 2, w, TRAY.h - 2, '#8e9aa3', 3);
  box(ctx, x + 1, TRAY.y + 3, w - 2, TRAY.h - 5, '#c8d1d7', 2);
  rect(ctx, x + 3, TRAY.y + 3.5, w - 6, 0.75, '#ffffff');
  for (let i = 0; i < cap; i++) {
    const r = traySlotRect(i, cap);
    if (game && i < game.tray.length) {
      ctx.globalAlpha = 0.25;
      box(ctx, r.x + 4, r.y + 18, 14, 2, '#000', 1);
      ctx.globalAlpha = 1;
      drawIcon(ctx, game.tray[i], r.x + 3, r.y + 3, 1);
    } else {
      box(ctx, r.x + 5, r.y + 9, 12, 7, '#b3bdc4', 2);
    }
  }
}

function drawStations(ctx, game, t, now) {
  const full = game && game.reservedSlots() >= game.trayCapacity;
  STATIONS.forEach((id, i) => {
    const r = stationRect(i);
    const s = game ? game.stations[id] : null;
    const busy = s && s.busy;
    const accent = STATION_ACCENTS[id];
    const disabled = full && !busy;

    // Card with bevel
    ctx.globalAlpha = 0.5;
    box(ctx, r.x + 1, r.y + 2, r.w, r.h, '#000', 2);
    ctx.globalAlpha = 1;
    box(ctx, r.x - 1, r.y - 1, r.w + 2, r.h + 2, OUTLINE, 2);
    const g = ctx.createLinearGradient(0, r.y, 0, r.y + r.h);
    g.addColorStop(0, busy ? '#7d5640' : '#6a4632');
    g.addColorStop(1, busy ? '#4e3324' : '#3e281c');
    ctx.fillStyle = g;
    ctx.fillRect(r.x + 1, r.y, r.w - 2, r.h);
    ctx.fillRect(r.x, r.y + 1, r.w, r.h - 2);
    rect(ctx, r.x + 1, r.y, r.w - 2, 3, accent);
    rect(ctx, r.x + 1, r.y, r.w - 2, 0.75, shade(accent, 0.35));
    rect(ctx, r.x, r.y + 3, 0.75, r.h - 4, 'rgba(255,255,255,0.12)');

    // Icon with a soft spotlight and shadow
    glow(ctx, r.x + r.w / 2, r.y + 18, 18, busy ? '#ffd27a' : '#ffffff', busy ? 0.35 : 0.12);
    ctx.globalAlpha = 0.35;
    box(ctx, r.x + r.w / 2 - 10, r.y + 29, 20, 2.5, '#000', 1);
    ctx.globalAlpha = 1;
    const bob = busy ? Math.sin(now * 12) * 0.75 : 0;
    drawIcon(ctx, id, r.x + r.w / 2 - 12, r.y + 6 + bob, 1.5);

    // Label plate
    box(ctx, r.x + 4, r.y + r.h - 11, r.w - 8, 8, 'rgba(0,0,0,0.35)', 1);
    text(ctx, t(`items.${id}`), r.x + r.w / 2, r.y + r.h - 9.5, { size: 5, color: '#f5e6c8', align: 'center' });

    if (busy) {
      const f = Math.min(1, s.t / s.dur);
      box(ctx, r.x + 4, r.y + r.h - 16, r.w - 8, 4, OUTLINE, 1);
      rect(ctx, r.x + 5, r.y + r.h - 15, r.w - 10, 2, '#2b1d14');
      rect(ctx, r.x + 5, r.y + r.h - 15, (r.w - 10) * f, 2, '#f5c542');
      rect(ctx, r.x + 5, r.y + r.h - 15, (r.w - 10) * f, 0.5, '#fff1a8');
    }
    if (disabled) {
      ctx.globalAlpha = 0.55;
      box(ctx, r.x, r.y, r.w, r.h, '#120a06', 2);
      ctx.globalAlpha = 1;
    }
    if (s && s.flash > 0) {
      ctx.globalAlpha = (s.flash / 0.3) * 0.6;
      box(ctx, r.x, r.y, r.w, r.h, '#ffffff', 2);
      ctx.globalAlpha = 1;
    }
  });
}

let shownScore = 0;
let scoreBump = 0;

function drawHud(ctx, game, now, dt) {
  if (game.score !== shownScore) {
    shownScore += Math.max(1, Math.ceil((game.score - shownScore) * 0.2));
    if (shownScore > game.score) shownScore = game.score;
    scoreBump = 0.15;
  }
  scoreBump = Math.max(0, scoreBump - dt);

  const g = ctx.createLinearGradient(0, 0, 0, HUD_H);
  g.addColorStop(0, '#3a2518');
  g.addColorStop(1, '#1d1410');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, HUD_H);
  rect(ctx, 0, HUD_H, W, 1, OUTLINE);
  rect(ctx, 0, HUD_H - 1, W, 0.5, '#6b4530');

  box(ctx, 2, 3, 52, 12, 'rgba(0,0,0,0.35)', 2);
  const spin = Math.abs(Math.cos(now * 3));
  drawCoin(ctx, 5 + 3.5 * (1 - spin), 5.5, 1);
  text(ctx, String(shownScore), 15, 6 - (scoreBump > 0 ? 1 : 0), { size: 7, color: '#f5c542', shadow: '#000' });

  box(ctx, 83, 3, 14, 12, 'rgba(0,0,0,0.35)', 2);
  rect(ctx, 86, 5.5, 3, 7, '#f5e6c8');
  rect(ctx, 91, 5.5, 3, 7, '#f5e6c8');

  const m = Math.floor(game.clockMinutes());
  const clock = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  box(ctx, W - 42, 3, 40, 12, 'rgba(0,0,0,0.35)', 2);
  text(ctx, clock, W - 4, 6, { size: 7, color: '#f5e6c8', align: 'right', shadow: '#000' });

  if (game.multiplier > 1) {
    const pulse = 1 + Math.max(0, Math.sin(now * 8)) * (game.multiplier >= 4 ? 0.15 : 0.05);
    const label = `x${game.multiplier}`;
    ctx.save();
    ctx.translate(14, 26);
    ctx.scale(pulse, pulse);
    box(ctx, -12, -5, 24, 11, OUTLINE, 2);
    box(ctx, -11, -4, 22, 9, game.multiplier >= 4 ? '#e74c3c' : '#ff9f43', 2);
    text(ctx, label, 0, -3, { size: 7, color: '#fff6c0', align: 'center' });
    ctx.restore();
  }
  for (let i = 0; i < MAX_STRIKES; i++) drawHeart(ctx, W - 10 - i * 9, 22, i < MAX_STRIKES - game.strikes);
}

function drawFloats(ctx, game) {
  for (const f of game.floats) {
    const k = f.t / f.life;
    const pop = k < 0.12 ? 0.6 + (k / 0.12) * 0.6 : k < 0.2 ? 1.2 - ((k - 0.12) / 0.08) * 0.2 : 1;
    ctx.globalAlpha = k > 0.7 ? (1 - k) / 0.3 : 1;
    ctx.save();
    const y = f.y - k * 12;
    ctx.translate(f.x, y);
    ctx.scale(pop, pop);
    ctx.font = `${f.size}px ${FONT}`;
    const half = ctx.measureText(f.text).width / 2;
    const x = clamp(0, -f.x + half + 2, W - f.x - half - 2);
    text(ctx, f.text, x, 0, { size: f.size, color: f.color, align: 'center', outline: OUTLINE });
    ctx.restore();
    ctx.globalAlpha = 1;
  }
}

/** Warm or cool tint over the whole scene depending on the time of day. */
function drawLighting(ctx, game) {
  let tint = 'rgba(255, 200, 120, 0.06)';
  if (game) {
    const minutes = CLOCK.startMinutes + game.time * CLOCK.minutesPerSecond;
    if (minutes < 10 * 60) tint = 'rgba(160, 200, 255, 0.08)';
    else if (minutes < CLOCK.afternoonAt) tint = 'rgba(255, 245, 220, 0.04)';
    else tint = 'rgba(255, 130, 60, 0.12)';
    if (game.boss.active) tint = 'rgba(255, 60, 40, 0.06)';
  }
  ctx.fillStyle = tint;
  ctx.fillRect(0, HUD_H, W, STATION_PANEL_Y - HUD_H);

  const v = ctx.createRadialGradient(W / 2, 110, 60, W / 2, 110, 150);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = v;
  ctx.fillRect(0, HUD_H, W, STATION_PANEL_Y - HUD_H);
}

/** Draws one frame. `game` can be null to draw the empty bar behind the menus. */
export function render(ctx, game, { t, now, dt = 0 }) {
  if (game) {
    spawnFx(game);
    if (!game.over) spawnAmbient(game, dt);
  } else {
    particles = [];
    shownScore = 0;
  }
  updateParticles(dt);

  ctx.save();
  if (game && game.shake > 0) ctx.translate(Math.round((Math.random() - 0.5) * 3), Math.round((Math.random() - 0.5) * 3));

  ctx.drawImage(layer('wall', paintWall), 0, 0, W, H);
  drawSign(ctx, now, game);
  drawLamps(ctx, now);
  if (game) drawCustomers(ctx, game, now);
  ctx.drawImage(layer('counter', paintCounter), 0, 0, W, H);
  ctx.drawImage(layer('floor', paintFloor), 0, 0, W, H);
  drawBoss(ctx, game, now);
  drawPlayer(ctx, game, now);
  drawParticles(ctx, false);
  drawTray(ctx, game);
  drawLighting(ctx, game);
  if (game) drawBubbles(ctx, game, now);
  ctx.drawImage(layer('panel', paintPanel), 0, 0, W, H);
  drawStations(ctx, game, t, now);
  if (game) {
    drawHud(ctx, game, now, dt);
    drawSpeech(ctx, game);
    drawFloats(ctx, game);
  }
  drawParticles(ctx, true);
  ctx.restore();
}
