// Shared scenery and helpers for the mini-games: the bar's room, table and
// counter, the team's looks and small random helpers.

import { W, H } from '../../core/layout.js';
import { OUTLINE } from '../../graphics/sprites.js';
import { rect, box, glow } from '../../graphics/draw.js';
import { PLAYER, HELPERS, BOSS } from '../../config.js';

export const LOOKS = {
  blanca: PLAYER.look,
  mari: HELPERS.mari.look,
  andrea: HELPERS.andrea.look,
  alejandro: HELPERS.alejandro.look,
  boss: BOSS.look,
};

const BUNTING = ['#e9b820', '#e0664a', '#8c7279', '#3aa58c', '#5b8fd6'];

/** Deterministic pseudo-random value in [0, 1) for texture variation. */
function noise(a, b) {
  const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
  return v - Math.floor(v);
}

/**
 * Draws a static background once into an offscreen canvas at the current
 * render scale, and reuses it on later frames.
 */
const cache = new Map();
function cached(ctx, key, paint) {
  const scale = ctx.getTransform().a || 1;
  const id = `${key}@${scale}`;
  let layer = cache.get(id);
  if (!layer) {
    layer = document.createElement('canvas');
    layer.width = Math.round(W * scale);
    layer.height = Math.round(H * scale);
    const lctx = layer.getContext('2d');
    lctx.imageSmoothingEnabled = false;
    lctx.setTransform(scale, 0, 0, scale, 0, 0);
    paint(lctx);
    cache.set(id, layer);
  }
  ctx.drawImage(layer, 0, 0, W, H);
}

function lamp(ctx, x) {
  rect(ctx, x - 0.25, 24, 0.5, 17, '#5a4030');
  box(ctx, x - 7, 40, 14, 7, OUTLINE, 2);
  box(ctx, x - 6, 41, 12, 5, '#c8794a', 2);
  rect(ctx, x - 5, 41, 4, 1, '#f0a874');
  rect(ctx, x - 3, 46, 6, 1.5, '#fff6c0');
  glow(ctx, x, 54, 46, 'rgba(255,226,168,1)', 0.45);
}

/** Warm wall, wooden ceiling beam and a colourful bunting garland. */
function wall(ctx, bottom) {
  const g = ctx.createLinearGradient(0, 0, 0, bottom);
  g.addColorStop(0, '#fff3dc');
  g.addColorStop(1, '#fbe9cc');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, bottom);
  // Soft wallpaper stripes
  for (let x = 6; x < W; x += 14) rect(ctx, x, 24, 5, bottom - 24, 'rgba(233,184,32,0.07)');
  // Ceiling beam with joists
  rect(ctx, 0, 16, W, 9, '#dcae74');
  rect(ctx, 0, 16, W, 1.5, '#f0cc94');
  rect(ctx, 0, 24, W, 1, '#a8713a');
  for (let x = 10; x < W; x += 40) {
    rect(ctx, x, 16, 4, 9, '#c4935a');
    rect(ctx, x, 16, 1, 9, '#f0cc94');
  }
  // Bunting
  ctx.strokeStyle = '#7d4f26';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  for (let x = 0; x <= W; x += 2) {
    const y = 28 + Math.sin((x / W) * Math.PI * 2) * 3 + 3;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  for (let i = 0, x = 4; x < W; x += 11, i++) {
    const y = 28 + Math.sin(((x + 4) / W) * Math.PI * 2) * 3 + 3;
    ctx.fillStyle = BUNTING[i % BUNTING.length];
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 8, y);
    ctx.lineTo(x + 4, y + 8);
    ctx.closePath();
    ctx.fill();
    rect(ctx, x + 1, y, 6, 0.75, 'rgba(255,255,255,0.35)');
  }
}

/** A small potted plant standing on a ledge. */
function plant(ctx, x, y) {
  const leaves = ['#3f9a4f', '#58b860', '#2f7d3d'];
  for (let i = 0; i < 7; i++) {
    const a = -Math.PI / 2 + (i - 3) * 0.42;
    const len = 9 + (i % 3) * 2;
    ctx.strokeStyle = leaves[i % 3];
    ctx.lineWidth = 2.4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y - 2);
    ctx.quadraticCurveTo(x + Math.cos(a) * len * 0.4, y - 2 + Math.sin(a) * len * 0.8, x + Math.cos(a) * len, y - 2 + Math.sin(a) * len);
    ctx.stroke();
  }
  box(ctx, x - 5, y - 3, 10, 8, OUTLINE, 1);
  box(ctx, x - 4, y - 2, 8, 6, '#e0664a', 1);
  rect(ctx, x - 4, y - 2, 8, 1.5, '#f08a6e');
}

/** Grey brick strip, like the bar's wall, with each brick in a slightly different tone. */
function bricks(ctx, by, h) {
  rect(ctx, 0, by, W, h, '#8b857c');
  for (let row = 0; row * 4 < h; row++) {
    const y = by + row * 4;
    for (let x = row % 2 ? -4 : 0; x < W; x += 8) {
      const n = noise(x, row);
      const tone = n < 0.33 ? '#b3ada4' : n < 0.66 ? '#aaa49b' : '#bdb6ac';
      rect(ctx, x + 0.5, y + 0.5, 7, 3.25, tone);
      rect(ctx, x + 0.5, y + 0.5, 7, 0.6, 'rgba(255,255,255,0.18)');
    }
  }
}

/** The bar's room: warm wall, beam, bunting, copper lamps, bricks, a plant and a terracotta floor. */
export function bgRoom(ctx, floorY) {
  cached(ctx, `room${floorY}`, (c) => {
    wall(c, floorY);
    // Picture frames on the wall, like the colourful hat and the prints in the bar
    const by = floorY - 34;
    if (by > 90) {
      box(c, 10, 52, 22, 18, '#7d4f26', 1);
      box(c, 12, 54, 18, 14, '#5b8fd6', 0);
      box(c, 15, 60, 12, 5, '#e9b820', 2);
      box(c, 18, 57, 6, 5, '#e0664a', 2);
      box(c, 150, 48, 20, 24, '#7d4f26', 1);
      box(c, 152, 50, 16, 20, '#f6d9a8', 0);
      for (let i = 0; i < 4; i++) rect(c, 154, 53 + i * 4, 12 - (i % 2) * 4, 1.5, '#8c7279');
    }
    bricks(c, by, 31);
    rect(c, 0, by - 2, W, 2, '#dcae74');
    rect(c, 0, by - 2, W, 0.6, '#f0cc94');
    rect(c, 0, floorY - 3, W, 3, '#dcae74');
    rect(c, 0, floorY - 3, W, 0.75, '#f0cc94');
    plant(c, 170, by - 3);
    // Terracotta floor
    for (let y = floorY; y < H; y += 12) {
      for (let x = ((y - floorY) / 12) % 2 ? -6 : 0; x < W; x += 12) {
        const n = noise(x, y);
        rect(c, x, y, 12, 12, n < 0.4 ? '#d79c69' : n < 0.8 ? '#cc8f5c' : '#e0a874');
        rect(c, x, y, 12, 0.75, '#ecbd92');
        rect(c, x, y, 0.75, 12, '#a86f45');
      }
    }
    const shadow = c.createLinearGradient(0, floorY, 0, floorY + 18);
    shadow.addColorStop(0, 'rgba(60,30,10,0.32)');
    shadow.addColorStop(1, 'rgba(60,30,10,0)');
    c.fillStyle = shadow;
    c.fillRect(0, floorY, W, 18);
    lamp(c, 50);
    lamp(c, 130);
  });
}

/** A wooden table top seen from above, under a warm lamp, filling the area below `top`. */
export function bgTable(ctx, top) {
  cached(ctx, `table${top}`, (c) => {
    wall(c, top);
    bricks(c, top - 22, 22);
    rect(c, 0, top - 24, W, 2, '#dcae74');
    // Planks with joints, grain and knots
    const plank = 16;
    for (let i = 0, y = top; y < H; y += plank, i++) {
      const n = noise(i, 3);
      rect(c, 0, y, W, plank, n < 0.33 ? '#cf9459' : n < 0.66 ? '#c58a50' : '#d69c62');
      rect(c, 0, y, W, 0.75, '#e8b37c');
      rect(c, 0, y + plank - 0.75, W, 0.75, '#9c6a3a');
      const joint = (noise(i, 7) * 120 + 30) | 0;
      rect(c, joint, y, 0.75, plank, '#9c6a3a');
      for (let k = 0; k < 4; k++) {
        const gx = noise(i, k) * W;
        rect(c, gx, y + 3 + k * 3, 18 + noise(k, i) * 20, 0.5, 'rgba(120,70,30,0.35)');
      }
      if (noise(i, 11) > 0.5) {
        const kx = noise(i, 13) * (W - 20) + 10;
        box(c, kx, y + 6, 5, 3, '#9c6a3a', 1.5);
        box(c, kx + 1, y + 7, 3, 1, '#b07a45', 0.5);
      }
    }
    rect(c, 0, top, W, 4, '#a8713a');
    rect(c, 0, top, W, 1.5, '#f0cc94');
    glow(c, W / 2, top + (H - top) * 0.45, 130, 'rgba(255,233,192,1)', 0.4);
    const edge = c.createLinearGradient(0, 0, W, 0);
    edge.addColorStop(0, 'rgba(70,35,10,0.22)');
    edge.addColorStop(0.18, 'rgba(70,35,10,0)');
    edge.addColorStop(0.82, 'rgba(70,35,10,0)');
    edge.addColorStop(1, 'rgba(70,35,10,0.22)');
    c.fillStyle = edge;
    c.fillRect(0, top, W, H - top);
  });
}

/** The bar counter seen from the front: wood top, panels and a brass foot rail. */
export function counter(ctx, y) {
  rect(ctx, 0, y - 1, W, 7, '#dcae74');
  rect(ctx, 0, y - 1, W, 1.5, '#f6d6a2');
  rect(ctx, 0, y + 5, W, 1, '#8a5a32');
  rect(ctx, 0, y + 6, W, H - y - 6, '#7a523b');
  for (let x = 3; x < W; x += 30) {
    box(ctx, x, y + 10, 24, H - y - 16, '#6a4532', 2);
    rect(ctx, x + 1, y + 11, 22, 1, '#94684c');
    rect(ctx, x + 26, y + 6, 4, H - y - 6, '#dcae74');
    rect(ctx, x + 26, y + 6, 1, H - y - 6, '#f0cc94');
  }
  const rail = Math.min(H - 8, y + 44);
  rect(ctx, 0, rail, W, 2.5, '#d4a640');
  rect(ctx, 0, rail, W, 0.8, '#f8e08a');
}

export const rand = (a, b) => a + Math.random() * (b - a);
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);

export function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Random non-overlapping spots on a grid inside the given area. */
export function spots(n, x0, y0, x1, y1, cols, rows) {
  const cells = [];
  const cw = (x1 - x0) / cols;
  const ch = (y1 - y0) / rows;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cells.push([c, r]);
  return shuffle(cells)
    .slice(0, n)
    .map(([c, r]) => ({ x: x0 + cw * (c + 0.5) + rand(-cw * 0.15, cw * 0.15), y: y0 + ch * (r + 0.5) + rand(-ch * 0.15, ch * 0.15) }));
}

