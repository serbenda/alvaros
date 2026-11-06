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

export function counter(ctx, y) {
  rect(ctx, 0, y, W, 5, '#d9a868');
  rect(ctx, 0, y, W, 1, '#ecc48d');
  rect(ctx, 0, y + 5, W, H - y - 5, '#7d5a45');
  for (let x = 2; x < W; x += 30) {
    rect(ctx, x, y + 8, 26, H - y - 10, '#6e4c3a');
    rect(ctx, x + 26, y + 5, 4, H - y - 5, '#d9a868');
  }
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

