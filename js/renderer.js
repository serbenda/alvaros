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
import { STATIONS, MAX_STRIKES, PLAYER, BOSS, CLOCK, HELPERS } from './config.js';
import { drawIcon, drawPerson, drawHeart, drawCoin, shade, OUTLINE } from './sprites.js';
import { ENTER_TIME, ENJOY_TIME, LEAVE_TIME } from './game.js';

export const FONT = '"Press Start 2P", ui-monospace, monospace';
let layerScale = 4;

const STATION_ACCENTS = {
  coffee: '#8b4a2b',
  juice: '#e67e22',
  toast: '#c0392b',
  beer: '#d49a0c',
  tapa: '#8e5f9e',
  menu: '#27ae60',
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

const easeInOut = (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);

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

/** Sets the pixel density of the cached layers, so big screens stay sharp. */
export function setRenderScale(scale) {
  if (scale === layerScale) return;
  layerScale = scale;
  for (const name of Object.keys(layers)) delete layers[name];
}

function layer(name, paint) {
  if (!layers[name]) {
    const c = document.createElement('canvas');
    c.width = W * layerScale;
    c.height = H * layerScale;
    const lctx = c.getContext('2d');
    lctx.setTransform(layerScale, 0, 0, layerScale, 0, 0);
    lctx.imageSmoothingEnabled = false;
    paint(lctx);
    layers[name] = c;
  }
  return layers[name];
}

// Colours taken from the real bar: warm white walls, light wood beams, mustard
// and mauve armchairs, grey brick, terracotta floor, copper lamps.
const PALETTE = {
  wall: '#fdf9f1',
  wallShade: '#f1e8d8',
  wood: '#dcae74',
  woodLight: '#f0cc94',
  woodDark: '#a8713a',
  woodDeep: '#7d4f26',
  panel: '#7a523b',
  panelDark: '#5e3d2a',
  panelLight: '#94684c',
  mustard: '#e9b820',
  mustardLight: '#f8d75a',
  mustardDark: '#b88a0e',
  mauve: '#8c7279',
  mauveLight: '#ab929a',
  mauveDark: '#6a5359',
  copper: '#c8794a',
  copperLight: '#f0a874',
  tile: '#cf8e5c',
  tileDark: '#b8754a',
  brick: '#aaa49b',
  mortar: '#8b857c',
};

const SEAT_CHAIRS = ['mustard', 'mauve', 'mustard', 'mauve'];
const DOWNLIGHTS = [24, 68, 112, 156];

/** Deterministic pseudo-random value in [0, 1) for texture variation. */
function noise(a, b) {
  const v = Math.sin(a * 12.9898 + b * 78.233) * 43758.5453;
  return v - Math.floor(v);
}

function paintWall(ctx) {
  // Warm white plaster with soft vertical light
  const g = ctx.createLinearGradient(0, HUD_H, 0, COUNTER_Y);
  g.addColorStop(0, '#f3eadb');
  g.addColorStop(0.35, PALETTE.wall);
  g.addColorStop(1, '#f4ecde');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, COUNTER_Y);

  // Ceiling: light wood beams with white panels, like the bar's ceiling
  rect(ctx, 0, HUD_H, W, 7, PALETTE.wood);
  rect(ctx, 0, HUD_H, W, 1, PALETTE.woodLight);
  rect(ctx, 0, HUD_H + 6, W, 1, PALETTE.woodDark);
  for (let x = 8; x < W; x += 44) {
    rect(ctx, x, HUD_H, 3, 7, PALETTE.woodDark);
    rect(ctx, x + 0.5, HUD_H, 1, 7, PALETTE.woodLight);
    rect(ctx, x - 0.5, HUD_H + 2, 4, 3, PALETTE.woodLight);
    rect(ctx, x + 0.5, HUD_H + 2.5, 2, 2, '#c4935a');
  }
  // Recessed downlights with a warm cone of light
  for (const x of DOWNLIGHTS) {
    rect(ctx, x - 2.5, HUD_H + 7, 5, 1.5, '#9a8f80');
    rect(ctx, x - 2, HUD_H + 7, 4, 1, '#fffbe8');
    const cone = ctx.createLinearGradient(0, HUD_H + 8, 0, 70);
    cone.addColorStop(0, 'rgba(255,236,190,0.45)');
    cone.addColorStop(1, 'rgba(255,236,190,0)');
    ctx.fillStyle = cone;
    ctx.beginPath();
    ctx.moveTo(x - 2, HUD_H + 8);
    ctx.lineTo(x + 2, HUD_H + 8);
    ctx.lineTo(x + 16, 70);
    ctx.lineTo(x - 16, 70);
    ctx.closePath();
    ctx.fill();
  }

  // Grey brick strip behind the customers, each brick slightly different
  const by = 56;
  rect(ctx, 0, by, W, COUNTER_Y - by, PALETTE.mortar);
  for (let row = 0; by + row * 4 < COUNTER_Y; row++) {
    const y = by + row * 4;
    for (let x = row % 2 ? -4 : 0; x < W; x += 8) {
      const v = noise(x, row);
      const color = v > 0.66 ? '#b6b0a7' : v > 0.33 ? PALETTE.brick : '#9f988e';
      rect(ctx, x + 0.5, y + 0.5, 7, 3, color);
      rect(ctx, x + 0.5, y + 0.5, 7, 0.6, 'rgba(255,255,255,0.18)');
    }
  }
  rect(ctx, 0, by - 2, W, 2, PALETTE.wood);
  rect(ctx, 0, by - 2, W, 0.6, PALETTE.woodLight);
  rect(ctx, 0, by - 0.5, W, 0.5, PALETTE.woodDark);

  // Shelf with cups, jars and boxes under the sign
  rect(ctx, 52, 47, 76, 2.5, PALETTE.wood);
  rect(ctx, 52, 47, 76, 0.75, PALETTE.woodLight);
  rect(ctx, 52, 49.5, 76, 0.75, PALETTE.woodDeep);
  const shelf = ['cup', 'cup', 'jar', 'box', 'bottle', 'cup', 'jar', 'box', 'cup', 'bottle', 'jar'];
  const jarLids = ['#c0392b', '#27ae60', '#e67e22'];
  const boxes = ['#2f7dc1', '#e9b820', '#c0392b'];
  shelf.forEach((kind, i) => {
    const x = 54 + i * 6.8;
    if (kind === 'cup') {
      rect(ctx, x - 0.5, 42.5, 5, 4.5, OUTLINE);
      rect(ctx, x, 43, 4, 4, '#ffffff');
      rect(ctx, x + 3, 43, 1, 4, '#dcdce4');
      rect(ctx, x + 4.5, 44, 1, 2, OUTLINE);
    } else if (kind === 'jar') {
      rect(ctx, x - 0.5, 40.5, 5, 6.5, OUTLINE);
      rect(ctx, x, 41, 4, 6, '#f4d7a1');
      rect(ctx, x, 43, 4, 3.5, '#d9a066');
      rect(ctx, x, 41, 4, 1.5, jarLids[i % 3]);
      rect(ctx, x + 0.5, 42.5, 0.75, 4, 'rgba(255,255,255,0.5)');
    } else if (kind === 'box') {
      const c = boxes[i % 3];
      rect(ctx, x - 0.5, 38.5, 5.5, 8.5, OUTLINE);
      rect(ctx, x, 39, 4.5, 8, c);
      rect(ctx, x, 41, 4.5, 2.5, '#fffaf0');
      rect(ctx, x + 3.5, 39, 1, 8, shade(c, -0.25));
    } else {
      rect(ctx, x + 0.5, 37.5, 3, 9.5, OUTLINE);
      rect(ctx, x + 1, 38, 2, 9, '#6b1d2a');
      rect(ctx, x + 1, 41.5, 2, 2.5, '#f3ead3');
      rect(ctx, x + 1.2, 38, 0.6, 3, 'rgba(255,255,255,0.35)');
    }
  });

  // Sign board in light wood
  rect(ctx, 56, 26, 68, 13, OUTLINE);
  rect(ctx, 57, 27, 66, 11, PALETTE.wood);
  rect(ctx, 58, 28, 64, 9, '#fffaf0');
  rect(ctx, 57, 27, 66, 0.75, PALETTE.woodLight);

  // Framed picture: a sunny street
  rect(ctx, 133, 27, 22, 18, OUTLINE);
  rect(ctx, 134, 28, 20, 16, PALETTE.woodDark);
  rect(ctx, 135.5, 29.5, 17, 13, '#8cc4ee');
  rect(ctx, 135.5, 37, 17, 5.5, '#d9a066');
  rect(ctx, 137, 33, 4, 4, '#e8d4b0');
  rect(ctx, 142, 31, 5, 6, '#c7785a');
  rect(ctx, 148, 34, 3.5, 3, '#e8d4b0');
  rect(ctx, 149, 30.5, 2, 2, '#f8d75a');

  // Colourful straw hat on the wall, like the one in the bar
  const hx = 166;
  const hy = 34;
  box(ctx, hx - 11, hy + 2, 22, 6, OUTLINE, 3);
  box(ctx, hx - 10, hy + 2.5, 20, 5, '#e84393', 2.5);
  rect(ctx, hx - 9, hy + 3.5, 18, 1, '#f8d75a');
  rect(ctx, hx - 7, hy + 5.5, 14, 1, '#27ae60');
  box(ctx, hx - 5, hy - 5, 10, 9, OUTLINE, 3);
  box(ctx, hx - 4, hy - 4.5, 8, 8, '#f0cc94', 2.5);
  rect(ctx, hx - 4, hy - 0.5, 8, 1.2, '#e84393');
  rect(ctx, hx - 4, hy + 1, 8, 1, '#27ae60');

  // Wine display fridge on the right, behind the last seat
  const fx = 158;
  const fy = 50;
  rect(ctx, fx - 1, fy - 1, W - fx + 1, COUNTER_Y - fy + 1, OUTLINE);
  rect(ctx, fx, fy, W - fx, COUNTER_Y - fy, '#c9ced2');
  rect(ctx, fx + 2, fy + 2, W - fx - 2, COUNTER_Y - fy - 2, '#2a2f35');
  const wines = ['#6b1d2a', '#2e5a2e', '#6b1d2a', '#d9c27a', '#6b1d2a', '#2e5a2e'];
  for (let row = 0; row < 3; row++) {
    const y = fy + 4 + row * 10;
    rect(ctx, fx + 2, y + 8, W - fx - 2, 1, '#9aa3a8');
    for (let i = 0; i < 6; i++) {
      const x = fx + 3.5 + i * 3.6;
      const c = wines[(i + row) % wines.length];
      rect(ctx, x, y + 2, 2.6, 6, c);
      rect(ctx, x + 0.6, y, 1.4, 2, c);
      rect(ctx, x, y + 4, 2.6, 1.5, '#f3ead3');
    }
  }
  ctx.globalAlpha = 0.15;
  rect(ctx, fx + 4, fy + 2, 3, COUNTER_Y - fy - 2, '#ffffff');
  ctx.globalAlpha = 1;
  rect(ctx, fx + 1, fy + 14, 1, 6, '#eef1f3');
}

function paintCounter(ctx) {
  const y = COUNTER_Y;
  rect(ctx, 0, y - 1.5, W, 1.5, 'rgba(60,30,10,0.2)');
  // Thick light wood counter top with a glossy edge
  const top = ctx.createLinearGradient(0, y, 0, y + 5);
  top.addColorStop(0, PALETTE.woodLight);
  top.addColorStop(1, PALETTE.wood);
  ctx.fillStyle = top;
  ctx.fillRect(0, y, W, 5);
  rect(ctx, 0, y + 0.5, W, 0.6, '#fbe2b8');
  rect(ctx, 0, y + 4.5, W, 1, PALETTE.woodDeep);
  for (let x = 6; x < W; x += 23) rect(ctx, x, y + 2, 9, 0.4, '#c4935a');

  // Front: dark brown plank panels framed with light wood posts
  rect(ctx, 0, y + 5.5, W, COUNTER_H - 5.5, PALETTE.wood);
  for (let x = 3; x < W; x += 30) {
    rect(ctx, x, y + 7, 25, COUNTER_H - 10, PALETTE.panelDark);
    rect(ctx, x + 0.5, y + 7.5, 24, COUNTER_H - 11, PALETTE.panel);
    for (let k = 0; k < 4; k++) {
      const py = y + 8 + k * 2.6;
      rect(ctx, x + 0.5, py + 2, 24, 0.5, PALETTE.panelDark);
      for (let b = (k % 2) * 4; b < 24; b += 8) rect(ctx, x + 0.5 + b, py, 0.5, 2, PALETTE.panelDark);
      rect(ctx, x + 1 + noise(x, k) * 12, py + 0.4, 6, 0.4, PALETTE.panelLight);
    }
    rect(ctx, x - 2.5, y + 5.5, 2.5, COUNTER_H - 5.5, PALETTE.woodLight);
    rect(ctx, x - 0.5, y + 5.5, 0.5, COUNTER_H - 5.5, PALETTE.woodDark);
  }
  rect(ctx, 0, y + COUNTER_H - 2.5, W, 2.5, PALETTE.woodDeep);

  // Little things on the counter between seats: sunflowers, napkins, sugar
  const napkins = (cx) => {
    rect(ctx, cx - 3.5, y - 5.5, 7, 6, OUTLINE);
    rect(ctx, cx - 3, y - 5, 6, 5, '#c0392b');
    rect(ctx, cx - 2, y - 7, 4, 2.5, '#ffffff');
    rect(ctx, cx - 3, y - 3, 6, 1, '#ffffff');
    rect(ctx, cx + 1.5, y - 5, 1.5, 5, '#9b2c20');
  };
  const sugar = (cx) => {
    rect(ctx, cx - 2, y - 5.5, 4, 6, OUTLINE);
    rect(ctx, cx - 1.5, y - 5, 3, 5, '#f4f4f8');
    rect(ctx, cx - 1.5, y - 6.5, 3, 1.5, '#9aa3a8');
  };
  const sunflowers = (cx) => {
    rect(ctx, cx - 2.5, y - 7.5, 5, 8, OUTLINE);
    rect(ctx, cx - 2, y - 7, 4, 7, '#d8eef5');
    rect(ctx, cx - 1.2, y - 6.5, 0.8, 6, 'rgba(255,255,255,0.7)');
    rect(ctx, cx - 0.25, y - 15, 0.75, 8, '#2e7d32');
    rect(ctx, cx - 3.5, y - 13, 0.75, 6, '#2e7d32');
    rect(ctx, cx + 2.5, y - 12, 0.75, 5, '#2e7d32');
    rect(ctx, cx - 2.5, y - 10, 2, 1, '#43a047');
    for (const [fx, fy] of [[cx, y - 16.5], [cx - 4, y - 14], [cx + 3.5, y - 13]]) {
      for (const [dx, dy] of [[-2, 0], [2, 0], [0, -2], [0, 2], [-1.4, -1.4], [1.4, 1.4], [-1.4, 1.4], [1.4, -1.4]]) {
        rect(ctx, fx + dx - 0.9, fy + dy - 0.9, 1.8, 1.8, PALETTE.mustard);
      }
      rect(ctx, fx - 1.2, fy - 1.2, 2.4, 2.4, '#6b3f1d');
      rect(ctx, fx - 0.6, fy - 0.9, 0.8, 0.6, '#9a6233');
    }
  };
  sunflowers(46);
  napkins(88);
  sugar(93);
  napkins(134);
}

function paintFloor(ctx) {
  const top = FLOOR_Y;
  const bottom = STATION_PANEL_Y;
  // Warm terracotta tiles with natural variation, like the bar's floor
  const T = 12;
  const tones = ['#d3925f', PALETTE.tile, '#c58552', PALETTE.tileDark, '#d99b68'];
  for (let ty = top; ty < bottom; ty += T) {
    for (let tx = ((ty - top) / T) % 2 ? -6 : 0; tx < W; tx += T) {
      const v = noise(tx, ty);
      rect(ctx, tx, ty, T, T, tones[Math.floor(v * tones.length)]);
      // Mottled spots
      for (let k = 0; k < 3; k++) {
        const sx = tx + 1 + noise(tx + k, ty) * 9;
        const sy = ty + 1 + noise(ty + k, tx) * 9;
        rect(ctx, sx, sy, 1.5, 1, k % 2 ? 'rgba(120,60,20,0.18)' : 'rgba(255,230,200,0.18)');
      }
      rect(ctx, tx, ty, T, 0.7, '#e7b88e');
      rect(ctx, tx, ty, 0.7, T, '#9e6640');
    }
  }
  const g = ctx.createLinearGradient(0, top, 0, top + 16);
  g.addColorStop(0, 'rgba(60,30,10,0.35)');
  g.addColorStop(1, 'rgba(60,30,10,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, top, W, 16);
  // Soft reflection of the lights on the floor
  for (const x of DOWNLIGHTS) {
    const r = ctx.createRadialGradient(x, top + 40, 0, x, top + 40, 26);
    r.addColorStop(0, 'rgba(255,240,210,0.22)');
    r.addColorStop(1, 'rgba(255,240,210,0)');
    ctx.fillStyle = r;
    ctx.fillRect(x - 26, top + 14, 52, 52);
  }
}

function paintPanel(ctx) {
  const g = ctx.createLinearGradient(0, STATION_PANEL_Y, 0, H);
  g.addColorStop(0, PALETTE.woodLight);
  g.addColorStop(1, PALETTE.wood);
  ctx.fillStyle = g;
  ctx.fillRect(0, STATION_PANEL_Y, W, H - STATION_PANEL_Y);
  rect(ctx, 0, STATION_PANEL_Y, W, 2, PALETTE.woodDeep);
  rect(ctx, 0, STATION_PANEL_Y + 2, W, 1, '#fbe2b8');
  for (let x = 0; x < W; x += 22) {
    rect(ctx, x, STATION_PANEL_Y + 3, 0.5, H, 'rgba(120,70,30,0.18)');
    rect(ctx, x + 6, STATION_PANEL_Y + 20 + noise(x, 1) * 80, 8, 0.4, 'rgba(120,70,30,0.15)');
  }
}

/** Upholstered mustard and mauve armchairs behind each seat, like the real bar. */
function drawChairs(ctx) {
  SEAT_X.forEach((x, i) => {
    const kind = SEAT_CHAIRS[i];
    const base = PALETTE[kind];
    const light = PALETTE[`${kind}Light`];
    const dark = PALETTE[`${kind}Dark`];
    box(ctx, x - 13, 63, 26, 23, OUTLINE, 6);
    const g = ctx.createLinearGradient(0, 64, 0, 86);
    g.addColorStop(0, light);
    g.addColorStop(0.5, base);
    g.addColorStop(1, dark);
    ctx.fillStyle = g;
    ctx.fillRect(x - 12 + 5, 64, 24 - 10, 21);
    ctx.fillRect(x - 12, 64 + 5, 24, 21 - 5);
    ctx.fillRect(x - 12 + 2, 64 + 1.5, 24 - 4, 21);
    // Piping and tufting
    box(ctx, x - 9, 67, 18, 16, 'rgba(0,0,0,0.12)', 4);
    box(ctx, x - 8.5, 67.5, 17, 15, base, 4);
    rect(ctx, x - 7, 68, 14, 1, 'rgba(255,255,255,0.35)');
    for (const [tx, ty] of [[-4, 72], [4, 72], [0, 77]]) {
      rect(ctx, x + tx - 0.6, ty - 0.6, 1.2, 1.2, dark);
      rect(ctx, x + tx - 0.6, ty - 1.2, 1.2, 0.6, light);
    }
    rect(ctx, x + 8, 69, 2.5, 15, dark);
  });
}

/** A cluster of copper pendant lamps hanging from the beam, as in the bar. */
function drawLamps(ctx, now) {
  const lamps = [
    [44, 6],
    [49.5, 10],
    [55, 4],
  ];
  for (const [lx, drop] of lamps) {
    const ly = HUD_H + 7 + drop;
    rect(ctx, lx - 0.25, HUD_H + 7, 0.5, drop, '#5a4030');
    box(ctx, lx - 3.5, ly, 7, 5, OUTLINE, 1.5);
    const g = ctx.createLinearGradient(lx - 3, 0, lx + 3, 0);
    g.addColorStop(0, PALETTE.copperLight);
    g.addColorStop(0.5, PALETTE.copper);
    g.addColorStop(1, '#8f4f2a');
    ctx.fillStyle = g;
    ctx.fillRect(lx - 3, ly + 0.5, 6, 4);
    rect(ctx, lx - 2, ly + 0.5, 1, 3, '#f8c9a4');
    rect(ctx, lx - 1.5, ly + 4.5, 3, 1, '#fff6c0');
    glow(ctx, lx, ly + 10, 22, '#ffe2a8', 0.28 + Math.sin(now * 3 + lx) * 0.02);
  }
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
      case 'deliver': {
        const cap = game.trayCapacity;
        const tray = traySlotRect(Math.floor(cap / 2), cap);
        fx.items.forEach((id, i) => {
          const sx = fx.from !== undefined ? fx.from - 8 : tray.x + 3 + (i - 1) * 8;
          const sy = fx.from !== undefined ? STAFF_TOP + 2 : tray.y + 3;
          addParticle({ kind: 'item', id, sx, sy, tx: SEAT_X[fx.seat] - 6, ty: COUNTER_Y - 12, delay: i * 0.06, life: 0.45 + i * 0.06 });
        });
        break;
      }
      case 'hearts':
        for (let i = 0; i < 4; i++) {
          addParticle({ kind: 'heart', x: fx.x + (Math.random() - 0.5) * 14, y: fx.y, vx: (Math.random() - 0.5) * 6, vy: -18 - Math.random() * 8, life: 1 });
        }
        break;
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
    const isFront = p.kind === 'coin' || p.kind === 'confetti' || p.kind === 'item' || p.kind === 'heart';
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
      case 'item': {
        const local = clamp((p.t - p.delay) / (p.life - p.delay), 0, 1);
        if (local <= 0) break;
        const e = easeInOut(local);
        const x = p.sx + (p.tx - p.sx) * e;
        const y = p.sy + (p.ty - p.sy) * e - Math.sin(local * Math.PI) * 30;
        const sc = 1 - local * 0.35;
        ctx.globalAlpha = 0.3;
        box(ctx, x + 2, p.sy + (p.ty - p.sy) * e + 14, 12 * sc, 2, '#000', 0.5);
        ctx.globalAlpha = 1;
        drawIcon(ctx, p.id, x, y, sc);
        break;
      }
      case 'heart':
        ctx.globalAlpha = 1 - k;
        drawHeart(ctx, p.x - 3.5, p.y - 3, true);
        break;
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
  text(ctx, "ÁLVARO'S", W / 2, 26, { size: 7, color: '#c0392b', align: 'center', shadow: '#f0c9a0' });
  // Marquee bulbs around the sign
  const bulbs = [];
  for (let x = 58; x <= 122; x += 4) {
    bulbs.push([x, 22.5]);
    bulbs.push([x, 36.5]);
  }
  const speed = game && game.multiplier >= 3 ? 10 : 4;
  const phase = Math.floor(now * speed);
  bulbs.forEach(([x, y], i) => {
    const on = (i + phase) % 3 !== 0;
    rect(ctx, x - 0.5, y - 0.5, 1, 1, on ? '#fff3b0' : '#7a5a2a');
  });
}

/** Where a customer stands right now: walking in, sitting, or walking out. */
function customerPose(c, now) {
  const seatX = SEAT_X[c.seat];
  const door = c.seat < 2 ? -16 : W + 16;
  let x = seatX;
  let top = CUSTOMER_TOP + (c.look.offset || 0);
  let mood = c.mood;
  let walking = false;
  if (c.state === 'enter') {
    const k = Math.min(1, c.st / ENTER_TIME);
    x = door + (seatX - door) * easeInOut(k);
    walking = k < 0.95;
    mood = 'neutral';
  } else if (c.state === 'leave') {
    const k = Math.min(1, c.st / LEAVE_TIME);
    const speed = c.mood === 'angry' ? 1.4 : 1;
    x = seatX + (door - seatX) * Math.min(1, easeInOut(k) * speed);
    walking = true;
  } else if (c.state === 'wait') {
    top += Math.round(Math.sin(now * 3 + c.seat * 1.7) * 0.6);
    const f = c.patience / c.maxPatience;
    if (f < 0.35) mood = 'worried';
    if (f < 0.15) {
      mood = 'angry';
      x += Math.sin(now * 40) * 0.7;
    }
  } else if (c.state === 'enjoy') {
    top += Math.round(Math.sin(c.st * 10) * 0.5);
  }
  if (c.cheer > 0 && c.state === 'wait') {
    top -= Math.abs(Math.sin(c.cheer * 12)) * 4;
    mood = 'happy';
  }
  if (walking) top -= Math.abs(Math.sin(now * 14 + c.id)) * 1.5;
  return { x, top, mood };
}

function drawEmote(ctx, kind, x, y, now) {
  const bob = Math.sin(now * 6) * 0.75;
  if (kind === 'heart') {
    drawHeart(ctx, x - 3.5, y + bob, true);
  } else if (kind === 'anger') {
    const c = '#e74c3c';
    rect(ctx, x - 3, y - 3 + bob, 2, 2, c);
    rect(ctx, x + 1, y - 3 + bob, 2, 2, c);
    rect(ctx, x - 3, y + 1 + bob, 2, 2, c);
    rect(ctx, x + 1, y + 1 + bob, 2, 2, c);
  } else if (kind === 'note') {
    rect(ctx, x, y - 4 + bob, 0.75, 5, OUTLINE);
    rect(ctx, x - 2, y + bob, 2.5, 2, OUTLINE);
    rect(ctx, x, y - 4 + bob, 2.5, 1, OUTLINE);
  }
}

function drawCustomers(ctx, game, now) {
  // Sitting customers first, walking ones on top so they pass in front.
  const list = game.seats.filter(Boolean).sort((a, b) => (a.state === 'wait' || a.state === 'enjoy' ? 0 : 1) - (b.state === 'wait' || b.state === 'enjoy' ? 0 : 1));
  for (const c of list) {
    const pose = customerPose(c, now);
    const blink = (now + c.id * 0.7) % 3.5 < 0.12;
    drawPerson(ctx, c.look, pose.x, pose.top, { mood: pose.mood, blink });
    if (c.state === 'enjoy') {
      // Lift the first item to the mouth now and then
      const sip = Math.max(0, Math.sin(c.st * 5));
      if (sip > 0.2) drawIcon(ctx, c.order[0], pose.x - 5 + 6, pose.top + 12 - sip * 4, 0.6);
      drawEmote(ctx, 'heart', pose.x + 9, pose.top - 6, now);
    } else if (c.state === 'leave' && c.mood === 'angry') {
      drawEmote(ctx, 'anger', pose.x + 8, pose.top - 4, now);
    } else if (c.state === 'leave' && c.mood === 'happy') {
      drawEmote(ctx, 'note', pose.x + 8, pose.top - 3, now);
    }
  }
}

/** Plates and glasses left on the counter while a customer enjoys their order. */
function drawCounterItems(ctx, game) {
  for (const c of game.seats) {
    if (!c || c.state !== 'enjoy') continue;
    const n = c.order.length;
    const start = SEAT_X[c.seat] - (n * 11) / 2;
    c.order.forEach((id, k) => {
      if (k === 0 && Math.sin(c.st * 5) > 0.2) return;
      ctx.globalAlpha = 0.3;
      box(ctx, start + k * 11 + 1, COUNTER_Y + 1, 10, 1.5, '#000', 0.5);
      ctx.globalAlpha = 1;
      drawIcon(ctx, id, start + k * 11, COUNTER_Y - 10, 0.75);
    });
  }
}

function drawBubbles(ctx, game, now) {
  for (const c of game.seats) {
    if (!c || c.state !== 'wait') continue;
    const sx = SEAT_X[c.seat];
    const n = c.order.length;
    const bw = n * 13 + 3;
    const bx = clamp(Math.round(sx - bw / 2), 1, W - bw - 1);
    const pop = Math.min(1, c.st / 0.2);
    const by = BUBBLE_Y + (1 - pop) * 4;
    ctx.globalAlpha = pop;
    if (game.canServe(c)) {
      const a = 0.55 + Math.sin(now * 10) * 0.45;
      ctx.globalAlpha = pop * a;
      box(ctx, bx - 3, by - 3, bw + 6, 22, '#2ecc71', 3);
      ctx.globalAlpha = pop;
    }
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

function speechBubble(ctx, str, cx, y, color = '#fffaf0') {
  ctx.font = `5px ${FONT}`;
  const w = Math.ceil(ctx.measureText(str).width) + 8;
  const x = clamp(Math.round(cx - w / 2), 2, W - w - 2);
  const tail = clamp(Math.round(cx), x + 3, x + w - 4);
  box(ctx, x - 1, y - 1, w + 2, 12, OUTLINE, 2);
  box(ctx, x, y, w, 10, color, 2);
  rect(ctx, tail - 1, y + 10, 3, 1, color);
  rect(ctx, tail, y + 11, 1, 1, color);
  rect(ctx, tail - 2, y + 10, 1, 1, OUTLINE);
  rect(ctx, tail + 2, y + 10, 1, 1, OUTLINE);
  rect(ctx, tail - 1, y + 11, 1, 1, OUTLINE);
  rect(ctx, tail + 1, y + 11, 1, 1, OUTLINE);
  rect(ctx, tail, y + 12, 1, 1, OUTLINE);
  text(ctx, str, x + 4, y + 2.5, { size: 5, color: '#3a2518' });
}

function nameTag(ctx, name, cx, y, color) {
  ctx.font = `4px ${FONT}`;
  const w = Math.ceil(ctx.measureText(name).width) + 4;
  box(ctx, cx - w / 2 - 0.5, y - 0.5, w + 1, 7, OUTLINE, 1);
  box(ctx, cx - w / 2, y, w, 6, color, 1);
  text(ctx, name, cx, y + 1, { size: 4, color: '#ffffff', align: 'center' });
}

function drawBoss(ctx, game, now) {
  if (!game || game.boss.x <= -13) return;
  const b = game.boss;
  const walking = b.active ? b.target !== undefined && Math.abs(b.target - b.x) > 0.5 : true;
  const step = walking ? Math.round(Math.sin(now * 10) * 2) : 0;
  const top = STAFF_TOP - 6 - (walking ? Math.abs(step) * 0.4 : 0);
  drawShadow(ctx, b.x, top + 34, 14);
  drawPerson(ctx, BOSS.look, b.x, top, { mood: b.active && !walking ? 'happy' : 'neutral', legs: true, step, blink: now % 4 < 0.12 });
  // Clipboard in his hand
  rect(ctx, b.x + 6.5, top + 16.5, 5, 7, OUTLINE);
  rect(ctx, b.x + 7, top + 17, 4, 6, '#f4f4f8');
  rect(ctx, b.x + 7.5, top + 18.5, 3, 0.5, '#9aa3a8');
  rect(ctx, b.x + 7.5, top + 20, 3, 0.5, '#9aa3a8');
  nameTag(ctx, BOSS.name, b.x, top + 36, '#c0392b');
  if (b.active) {
    box(ctx, b.x - 7, top - 12, 14, 9, OUTLINE, 1);
    box(ctx, b.x - 6, top - 11, 12, 7, '#c0392b', 1);
    text(ctx, 'x2', b.x, top - 10, { size: 5, color: '#fff6c0', align: 'center' });
  }
}

/** The coffee machine on the back bar, on the left. */
function drawCoffeeMachine(ctx, game, now) {
  if (!game) return;
  const busy = game.stations.coffee.busy || game.stations.juice.busy;
  const my = STAFF_TOP + 4;
  box(ctx, -1, my - 1, 24, 18, OUTLINE, 1);
  rect(ctx, 0, my, 22, 16, '#c9ced2');
  rect(ctx, 0, my, 22, 1.5, '#eef1f3');
  rect(ctx, 0, my + 4, 22, 1, '#8a9398');
  rect(ctx, 3, my + 6, 3, 4, '#2b2b2b');
  rect(ctx, 15, my + 6, 3, 4, '#2b2b2b');
  rect(ctx, 9, my + 2, 4, 2, busy ? '#2ecc71' : '#7f8c8d');
  if (busy) {
    rect(ctx, 4, my + 10, 1, 3, '#6f3b1e');
    rect(ctx, 16, my + 10, 1, 3, '#6f3b1e');
    if (Math.random() < 0.15) addParticle({ kind: 'steam', x: 6 + Math.random() * 10, y: my - 2, vx: 0, vy: -10, life: 0.6, size: 2 });
  }
  rect(ctx, 2, my + 13, 5, 2, '#ffffff');
  rect(ctx, 14, my + 13, 5, 2, '#ffffff');
  rect(ctx, -1, my + 17, 24, 2, PALETTE.woodDark);
}

/** Mari or Alejandro walking around the floor and doing their things. */
function drawCrewMember(ctx, game, name, now) {
  const w = game.crew[name];
  if (!w || w.task === 'away' || w.x < -16 || w.x > W + 16) return;
  const def = HELPERS[name];
  const walking = w.task === 'walk';
  const step = walking ? Math.round(Math.sin(now * 14 + name.length) * 2) : 0;
  const top = STAFF_TOP - 7 - (walking ? Math.abs(step) * 0.4 : 0);
  const mood = w.task === 'watch' ? 'neutral' : 'happy';
  drawShadow(ctx, w.x, top + 34, 14);
  drawPerson(ctx, def.look, w.x, top, { mood, legs: true, step, blink: (now + name.length) % 3.6 < 0.12 });

  if (w.task === 'wipe') {
    const sway = Math.sin(now * 12) * 4;
    rect(ctx, w.x + 4 + sway, top + 19, 6, 4, OUTLINE);
    rect(ctx, w.x + 4.5 + sway, top + 19.5, 5, 3, '#e8f4f8');
    if (Math.random() < 0.1) addParticle({ kind: 'star', x: w.x + 6 + sway, y: top + 18, vx: 0, vy: -12, life: 0.4, color: '#ffffff' });
  } else if (w.task === 'coffee') {
    rect(ctx, w.x - 9, top + 18, 5, 4, OUTLINE);
    rect(ctx, w.x - 8.5, top + 18.5, 4, 3, '#ffffff');
  } else if (w.task === 'watch') {
    // Checks the gold watch, which sparkles
    const gx = w.x - 6;
    const gy = top - 10 + Math.sin(now * 5);
    box(ctx, gx - 4, gy - 4, 9, 9, OUTLINE, 2);
    box(ctx, gx - 3.5, gy - 3.5, 8, 8, '#f5c542', 2);
    box(ctx, gx - 2, gy - 2, 5, 5, '#fff6d0', 1);
    rect(ctx, gx + 0.25, gy - 1.5, 0.5, 2, OUTLINE);
    rect(ctx, gx + 0.25, gy + 0.25, 1.5, 0.5, OUTLINE);
    if (Math.sin(now * 8) > 0.6) {
      rect(ctx, gx + 4, gy - 5, 0.5, 3, '#ffffff');
      rect(ctx, gx + 3, gy - 4, 2.5, 0.5, '#ffffff');
    }
  }
  if (w.carry) {
    rect(ctx, w.x - 7, top + 20, 14, 1.5, OUTLINE);
    rect(ctx, w.x - 6.5, top + 20.25, 13, 1, '#c8d1d7');
    drawIcon(ctx, w.carry, w.x - 6, top + 12, 0.75);
  }
  nameTag(ctx, def.name, w.x, top + 36, name === 'mari' ? '#8b4a2b' : '#27ae60');
  if (w.speech && !game.over) speechBubble(ctx, w.speech.text, w.x, top - 14, name === 'mari' ? '#fff1e0' : '#e8f8ee');
}

/** Andrea walks over to a customer, chats with them and walks away. */
function drawAndrea(ctx, game, now) {
  if (!game || !game.helpers.has('andrea')) return;
  const a = game.andrea;
  if (a.state === 'off') return;
  const seatX = SEAT_X[a.seat] + (a.seat < 2 ? 14 : -14);
  let x = seatX;
  let walking = false;
  if (a.state === 'walk') {
    x = a.from + (seatX - a.from) * easeInOut(Math.min(1, a.t));
    walking = true;
  } else if (a.state === 'leave') {
    x = seatX + (a.from - seatX) * easeInOut(Math.min(1, a.t));
    walking = true;
  }
  const top = CUSTOMER_TOP - 2 - (walking ? Math.abs(Math.sin(now * 14)) * 1.5 : 0);
  drawPerson(ctx, HELPERS.andrea.look, x, top, { mood: 'happy', blink: now % 3 < 0.12 });
  // Notepad
  rect(ctx, x - 7.5, top + 15.5, 4, 5, OUTLINE);
  rect(ctx, x - 7, top + 16, 3, 4, '#ffffff');
  if (a.state === 'chat') {
    drawEmote(ctx, 'heart', x, top - 8, now);
  }
  if (a.speech && !game.over) speechBubble(ctx, a.speech.text, x, top + 28, '#f3e8ff');
}

function drawPlayer(ctx, game, now) {
  const staff = game ? game.staff : PLAYER;
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
  if (walking && game && Math.random() < 0.3) {
    addParticle({ kind: 'smoke', x: x + (Math.random() - 0.5) * 6, y: STAFF_TOP + 33, vx: 0, vy: -4, life: 0.4, size: 1.5 });
  }
  drawShadow(ctx, x, STAFF_TOP + 34, 16);
  drawPerson(ctx, staff.look, x, top, { mood, legs: true, step, blink: now % 3.2 < 0.12 });
  // Blanca carries what is on the tray
  if (game && game.tray.length) {
    const ty = top + 20;
    rect(ctx, x - 11, ty + 3.5, 22, 2, OUTLINE);
    rect(ctx, x - 10.5, ty + 3.75, 21, 1.25, '#c8d1d7');
    game.tray.forEach((id, i) => {
      drawIcon(ctx, id, x - 10 + i * (20 / Math.max(1, game.tray.length)), ty - 4 + Math.sin(now * 16 + i) * (walking ? 0.5 : 0), 0.5);
    });
  }
  nameTag(ctx, staff.name, x, STAFF_TOP + 37, '#d49a0c');
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
  const cap = game ? game.trayCapacity : PLAYER.trayCapacity;
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
  const hint = game && !game.over ? game.hint() : null;
  STATIONS.forEach((id, i) => {
    const r = stationRect(i);
    if (game && !game.available.has(id)) {
      drawLockedStation(ctx, r);
      return;
    }
    const s = game ? game.stations[id] : null;
    const busy = s && s.busy;
    const accent = STATION_ACCENTS[id];
    const disabled = full && !busy;
    const suggested = hint && hint.station === i;

    // Card with bevel
    ctx.globalAlpha = 0.5;
    box(ctx, r.x + 1, r.y + 2, r.w, r.h, '#000', 2);
    ctx.globalAlpha = 1;
    box(ctx, r.x - 1, r.y - 1, r.w + 2, r.h + 2, OUTLINE, 2);
    const g = ctx.createLinearGradient(0, r.y, 0, r.y + r.h);
    g.addColorStop(0, busy ? '#fff4d6' : '#fffaf0');
    g.addColorStop(1, busy ? '#f6d98f' : '#f1dfc0');
    ctx.fillStyle = g;
    ctx.fillRect(r.x + 1, r.y, r.w - 2, r.h);
    ctx.fillRect(r.x, r.y + 1, r.w, r.h - 2);
    rect(ctx, r.x + 1, r.y, r.w - 2, 3, accent);
    rect(ctx, r.x + 1, r.y, r.w - 2, 0.75, shade(accent, 0.35));
    rect(ctx, r.x, r.y + 3, 0.75, r.h - 4, 'rgba(255,255,255,0.6)');

    // Icon with a soft spotlight and shadow
    glow(ctx, r.x + r.w / 2, r.y + 18, 18, busy ? '#ffd27a' : '#ffffff', busy ? 0.35 : 0.12);
    ctx.globalAlpha = 0.35;
    box(ctx, r.x + r.w / 2 - 10, r.y + 29, 20, 2.5, '#000', 1);
    ctx.globalAlpha = 1;
    const bob = busy ? Math.sin(now * 12) * 0.75 : 0;
    const ix = r.x + r.w / 2 - 12;
    const iy = r.y + 6 + bob;
    if (busy) {
      // The item builds up from the bottom as it is prepared
      const f = Math.min(1, s.t / s.dur);
      ctx.globalAlpha = 0.25;
      drawIcon(ctx, id, ix, iy, 1.5);
      ctx.globalAlpha = 1;
      ctx.save();
      ctx.beginPath();
      ctx.rect(ix - 1, iy + 24 - 24 * f, 26, 24 * f + 1);
      ctx.clip();
      drawIcon(ctx, id, ix, iy, 1.5);
      ctx.restore();
      rect(ctx, ix, iy + 24 - 24 * f, 24, 0.5, 'rgba(255,255,255,0.7)');
    } else {
      drawIcon(ctx, id, ix, iy, 1.5);
    }

    // Label plate
    box(ctx, r.x + 4, r.y + r.h - 11, r.w - 8, 8, accent, 1);
    text(ctx, t(`items.${id}`), r.x + r.w / 2, r.y + r.h - 9.5, { size: 5, color: '#ffffff', align: 'center', shadow: shade(accent, -0.35) });

    if (busy) {
      const f = Math.min(1, s.t / s.dur);
      box(ctx, r.x + 4, r.y + r.h - 16, r.w - 8, 4, OUTLINE, 1);
      rect(ctx, r.x + 5, r.y + r.h - 15, r.w - 10, 2, '#2b1d14');
      rect(ctx, r.x + 5, r.y + r.h - 15, (r.w - 10) * f, 2, '#f5c542');
      rect(ctx, r.x + 5, r.y + r.h - 15, (r.w - 10) * f, 0.5, '#fff1a8');
    }
    if (disabled) {
      ctx.globalAlpha = 0.55;
      box(ctx, r.x, r.y, r.w, r.h, '#7a6a5a', 2);
      ctx.globalAlpha = 1;
    }
    if (s && s.flash > 0) {
      ctx.globalAlpha = (s.flash / 0.3) * 0.6;
      box(ctx, r.x, r.y, r.w, r.h, '#ffffff', 2);
      ctx.globalAlpha = 1;
    }
    if (suggested && game.level.guide) {
      const a = 0.5 + Math.sin(now * 8) * 0.5;
      ctx.globalAlpha = a;
      outline(ctx, r.x - 2, r.y - 2, r.w + 4, r.h + 4, '#2ecc71', 1.5);
      ctx.globalAlpha = 1;
    }
  });
  if (hint && game.level.guide) drawGuideHand(ctx, game, hint, now);
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
  g.addColorStop(0, '#8a5a32');
  g.addColorStop(1, '#6e4426');
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
    ctx.translate(game.stars() !== null ? W - 47 : W - 14, 26);
    ctx.scale(pulse, pulse);
    box(ctx, -12, -5, 24, 11, OUTLINE, 2);
    box(ctx, -11, -4, 22, 9, game.multiplier >= 4 ? '#e74c3c' : '#ff9f43', 2);
    text(ctx, label, 0, -3, { size: 7, color: '#fff6c0', align: 'center' });
    ctx.restore();
  }
  if (game.level.strikes) {
    for (let i = 0; i < game.level.strikes; i++) drawHeart(ctx, 102 + i * 9, 5.5, i < game.level.strikes - game.strikes);
  } else if (game.level.duration) {
    // Time left in the shift
    const left = game.timeLeft() / game.level.duration;
    const hurry = game.timeLeft() < 10 && Math.sin(now * 10) > 0;
    box(ctx, 100, 6, 34, 6, OUTLINE, 1);
    rect(ctx, 101, 7, 32, 4, '#3a2a20');
    rect(ctx, 101, 7, 32 * left, 4, hurry ? '#e74c3c' : '#5dade2');
    rect(ctx, 101, 7, 32 * left, 1, 'rgba(255,255,255,0.4)');
  }
  const stars = game.stars();
  if (stars !== null) {
    box(ctx, W - 33, 20, 31, 10, 'rgba(0,0,0,0.45)', 2);
    for (let i = 0; i < 3; i++) drawStar(ctx, W - 31 + i * 9.5, 21.5, i < stars, 1);
  }
}

const STAR = [
  '...o...',
  '..oyo..',
  'ooyyyoo',
  'oyyyyyo',
  '.oyyyo.',
  '.oyoyo.',
  'oo...oo',
];

/** Pixel star, filled (gold) or empty (dark). */
export function drawStar(ctx, x, y, filled, scale = 1) {
  for (let r = 0; r < STAR.length; r++) {
    for (let c = 0; c < STAR[r].length; c++) {
      const ch = STAR[r][c];
      if (ch === '.') continue;
      ctx.fillStyle = ch === 'o' ? OUTLINE : filled ? (r < 3 ? '#fff1a8' : '#f5c542') : '#4a3a33';
      ctx.fillRect(x + c * scale, y + r * scale, scale + 0.02, scale + 0.02);
    }
  }
}

function outline(ctx, x, y, w, h, color, t = 1) {
  rect(ctx, x, y, w, t, color);
  rect(ctx, x, y + h - t, w, t, color);
  rect(ctx, x, y, t, h, color);
  rect(ctx, x + w - t, y, t, h, color);
}

function drawLockedStation(ctx, r) {
  box(ctx, r.x - 1, r.y - 1, r.w + 2, r.h + 2, OUTLINE, 2);
  box(ctx, r.x, r.y, r.w, r.h, '#e6d6bd', 2);
  const cx = r.x + r.w / 2;
  const cy = r.y + r.h / 2 - 2;
  rect(ctx, cx - 4, cy - 7, 8, 1.5, '#b3a28c');
  rect(ctx, cx - 4, cy - 7, 1.5, 6, '#b3a28c');
  rect(ctx, cx + 2.5, cy - 7, 1.5, 6, '#b3a28c');
  box(ctx, cx - 6, cy - 2, 12, 9, '#b3a28c', 1);
  rect(ctx, cx - 1, cy + 1, 2, 3, '#e6d6bd');
}

const HAND = [
  '...oo.....',
  '..owwo....',
  '..owwo....',
  '..owwoooo.',
  '..owwowwoo',
  'oooowwwwwo',
  'owwowwwwwo',
  'owwwwwwwwo',
  '.owwwwwwso',
  '..owwwwsso',
  '...owwsso.',
  '....oooo..',
];

/** A white glove pointing at the suggested tap, for beginners. */
function drawGuideHand(ctx, game, hint, now) {
  let x;
  let y;
  if (hint.station !== undefined) {
    const r = stationRect(hint.station);
    x = r.x + r.w / 2 + 2;
    y = r.y + 22;
  } else if (hint.tray !== undefined) {
    const r = traySlotRect(hint.tray, game.trayCapacity);
    x = r.x + 10;
    y = r.y + 12;
  } else {
    x = SEAT_X[hint.seat] + 2;
    y = CUSTOMER_TOP + 14;
  }
  const bob = Math.abs(Math.sin(now * 5)) * 3;
  for (let r = 0; r < HAND.length; r++) {
    for (let c = 0; c < HAND[r].length; c++) {
      const ch = HAND[r][c];
      if (ch === '.') continue;
      ctx.fillStyle = ch === 'o' ? OUTLINE : ch === 's' ? '#c9c9d4' : '#ffffff';
      ctx.fillRect(x + c, y + r + bob, 1.02, 1.02);
    }
  }
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


// ---- Window to the street and TV ---------------------------------------------------

const WINDOW = { x: 3, y: 20, w: 41, h: 26 };
const TV = { x: 4, y: 27, w: 38, h: 22 };

function skyColors(game) {
  if (!game) return ['#7fb6e0', '#cfe6f5'];
  const m = CLOCK.startMinutes + game.time * CLOCK.minutesPerSecond;
  if (m < 10 * 60) return ['#8cc4ee', '#f8d9b0'];
  if (m < CLOCK.afternoonAt) return ['#5aa6e6', '#bfe1f7'];
  if (m < 19 * 60) return ['#e8885a', '#f8c77a'];
  return ['#2c3e6b', '#7a5a8a'];
}

function drawWindow(ctx, game, now) {
  const { x, y, w, h } = WINDOW;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  const [skyTop, skyBottom] = skyColors(game);
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, skyTop);
  g.addColorStop(1, skyBottom);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  // Buildings across the street
  const fronts = [['#d9a066', 12], ['#c7785a', 16], ['#e3c08a', 10], ['#b5866a', 14]];
  let bx = x - 4;
  for (const [color, bh] of fronts) {
    rect(ctx, bx, y + h - 10 - bh, 13, bh + 10, color);
    for (let wy = y + h - 8 - bh; wy < y + h - 12; wy += 5) {
      rect(ctx, bx + 2, wy, 3, 3, '#5d7a8c');
      rect(ctx, bx + 8, wy, 3, 3, '#5d7a8c');
    }
    bx += 13;
  }
  // Cloud
  const cx = x + ((now * 3) % (w + 30)) - 15;
  box(ctx, cx, y + 3, 10, 3, 'rgba(255,255,255,0.85)', 1);
  box(ctx, cx + 3, y + 1.5, 5, 2, 'rgba(255,255,255,0.85)', 1);
  // Pavement and road
  rect(ctx, x, y + h - 8, w, 3, '#b8b0a0');
  rect(ctx, x, y + h - 5, w, 5, '#55585e');
  rect(ctx, x, y + h - 2.75, w, 0.5, '#e8e2c8');
  // Passers-by walking on the pavement
  const walkers = [
    [0, 9, '#c0392b'],
    [17, 7, '#2f7dc1'],
    [31, 11, '#2e9e5b'],
  ];
  for (const [offset, speed, color] of walkers) {
    const px = x + ((now * speed + offset * 3) % (w + 10)) - 5;
    const step = Math.sin(now * 10 + offset) > 0 ? 0.5 : 0;
    rect(ctx, px, y + h - 13, 2.5, 2.5, '#e0ac69');
    rect(ctx, px - 0.5, y + h - 10.5, 3.5, 3.5, color);
    rect(ctx, px, y + h - 7 + step, 1, 1.5, '#2b2f3a');
    rect(ctx, px + 1.5, y + h - 7 + (0.5 - step), 1, 1.5, '#2b2f3a');
  }
  // A car every few seconds
  const carT = now % 7;
  if (carT < 2) {
    const carX = x + w + 6 - (carT / 2) * (w + 22);
    rect(ctx, carX, y + h - 5.5, 14, 3, '#f1c40f');
    rect(ctx, carX + 3, y + h - 7.5, 7, 2.5, '#f1c40f');
    rect(ctx, carX + 4, y + h - 7, 2, 1.5, '#bfe1f7');
    rect(ctx, carX + 7, y + h - 7, 2, 1.5, '#bfe1f7');
    rect(ctx, carX + 2, y + h - 2.5, 2.5, 2.5, '#151515');
    rect(ctx, carX + 10, y + h - 2.5, 2.5, 2.5, '#151515');
  }
  // Reflection on the glass
  ctx.globalAlpha = 0.18;
  rect(ctx, x + 4, y, 3, h, '#ffffff');
  rect(ctx, x + 9, y, 1.5, h, '#ffffff');
  ctx.globalAlpha = 1;
  ctx.restore();
  // Frame
  rect(ctx, x - 2, y - 2, w + 4, 2, OUTLINE);
  rect(ctx, x - 1.5, y - 1.5, w + 3, 1.5, PALETTE.wood);
  rect(ctx, x - 1.5, y + h, w + 3, 2, PALETTE.wood);
  rect(ctx, x - 1.5, y - 1.5, 1.5, h + 3, PALETTE.wood);
  rect(ctx, x + w, y - 1.5, 1.5, h + 3, PALETTE.wood);
  rect(ctx, x + w / 2 - 0.5, y, 1, h, PALETTE.wood);
  rect(ctx, x, y + h / 2 - 3, w, 1, PALETTE.wood);
  rect(ctx, x - 2, y + h + 1.5, w + 4, 1, PALETTE.woodDark);
  // Daylight on the wall
  glow(ctx, x + w / 2, y + h / 2 + 8, 34, '#fff1c8', 0.22);
}

function drawTv(ctx, game, now) {
  const { x, y, w, h } = TV;
  rect(ctx, x + w / 2 - 3, HUD_H, 1, y - HUD_H, '#3a3a3a');
  rect(ctx, x + w / 2 + 2, HUD_H, 1, y - HUD_H, '#3a3a3a');
  box(ctx, x - 2, y - 2, w + 4, h + 4, '#151515', 1);
  rect(ctx, x - 1, y - 1, w + 2, 0.75, '#3a3a3a');
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  // Football pitch
  rect(ctx, x, y, w, h, '#2e8b3e');
  for (let i = 0; i < w; i += 6) rect(ctx, x + i, y, 3, h, '#339945');
  rect(ctx, x + w / 2 - 0.25, y, 0.5, h, '#d8f0d8');
  box(ctx, x + w / 2 - 4, y + h / 2 - 4, 8, 8, '#d8f0d8', 2);
  box(ctx, x + w / 2 - 3.5, y + h / 2 - 3.5, 7, 7, '#2e8b3e', 2);
  rect(ctx, x, y + h / 2 - 5, 3, 10, 'rgba(216,240,216,0.8)');
  rect(ctx, x + w - 3, y + h / 2 - 5, 3, 10, 'rgba(216,240,216,0.8)');
  // Players chasing the ball
  const bx = x + w / 2 + Math.sin(now * 0.9) * (w / 2 - 6) + Math.sin(now * 2.3) * 3;
  const by = y + h / 2 + Math.sin(now * 1.4) * (h / 2 - 4);
  const players = [
    [-6, -3, '#e74c3c'], [5, 4, '#e74c3c'], [-3, 6, '#ffffff'], [7, -5, '#ffffff'],
  ];
  for (const [dx, dy, color] of players) {
    const px = bx + dx * (1 + Math.sin(now + dx) * 0.3);
    const py = by + dy;
    rect(ctx, px - 1, py - 1.5, 2, 3, color);
    rect(ctx, px - 0.5, py - 2.5, 1, 1, '#e0ac69');
  }
  rect(ctx, bx - 0.75, by - 0.75, 1.5, 1.5, '#ffffff');
  // Scoreboard
  rect(ctx, x + 1, y + 1, 15, 4, 'rgba(0,0,0,0.6)');
  const goals = game ? game.tv.goals || 0 : 1;
  ctx.font = `3px ${FONT}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`${goals}-${Math.max(0, goals - 1)}`, x + 3, y + 1.6);
  if (game && game.tv.cheer > 0 && Math.sin(now * 12) > -0.3) {
    rect(ctx, x, y + h / 2 - 5, w, 10, 'rgba(0,0,0,0.55)');
    text(ctx, 'GOL', x + w / 2, y + h / 2 - 3.5, { size: 7, color: '#f5c542', align: 'center' });
  }
  // Screen sheen and scanlines
  ctx.globalAlpha = 0.12;
  for (let i = 0; i < h; i += 1.5) rect(ctx, x, y + i, w, 0.5, '#000');
  ctx.globalAlpha = 0.1;
  rect(ctx, x, y, w, h / 3, '#ffffff');
  ctx.globalAlpha = 1;
  ctx.restore();
  glow(ctx, x + w / 2, y + h / 2, 30, '#9fe0a8', 0.12 + Math.sin(now * 7) * 0.02);
}

// ---- Metal shutter (persiana) ---------------------------------------------------------

function drawShutter(ctx, game) {
  let closed = 1;
  if (game) {
    if (game.over) closed = Math.min(1, Math.max(0, (game.overTime - 0.2) / 0.6));
    else closed = Math.max(0, 1 - game.time / 0.8);
  }
  if (closed <= 0) return;
  const top = HUD_H;
  const fullH = STATION_PANEL_Y - HUD_H;
  const h = fullH * easeInOut(closed);
  const y0 = top + fullH - h;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, top, W, h);
  ctx.clip();
  for (let y = y0 - fullH; y < top + h; y += 6) {
    rect(ctx, 0, y, W, 6, '#9aa3a8');
    rect(ctx, 0, y, W, 1, '#d5dbde');
    rect(ctx, 0, y + 1, W, 1, '#b8c0c4');
    rect(ctx, 0, y + 4.5, W, 1.5, '#6e777c');
  }
  const ty = top + h - fullH / 2 - 12;
  text(ctx, "ÁLVARO'S", W / 2, ty, { size: 12, color: '#c0392b', align: 'center', shadow: '#5a1a12' });
  text(ctx, 'BAR · CAFETERÍA', W / 2, ty + 17, { size: 5, color: '#2b1d14', align: 'center' });
  ctx.restore();
  rect(ctx, 0, top + h - 4, W, 4, '#4a5155');
  rect(ctx, 0, top + h - 4, W, 1, '#8a9398');
  box(ctx, W / 2 - 10, top + h - 7, 20, 3, '#3a3f42', 1);
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
  v.addColorStop(1, 'rgba(60,30,10,0.12)');
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
  drawTv(ctx, game, now);
  drawLamps(ctx, now);
  drawChairs(ctx);
  if (game) drawCustomers(ctx, game, now);
  drawAndrea(ctx, game, now);
  ctx.drawImage(layer('counter', paintCounter), 0, 0, W, H);
  if (game) drawCounterItems(ctx, game);
  ctx.drawImage(layer('floor', paintFloor), 0, 0, W, H);
  drawCoffeeMachine(ctx, game, now);
  if (game) {
    drawCrewMember(ctx, game, 'mari', now);
    drawCrewMember(ctx, game, 'alejandro', now);
  }
  drawBoss(ctx, game, now);
  drawPlayer(ctx, game, now);
  drawParticles(ctx, false);
  drawTray(ctx, game);
  drawLighting(ctx, game);
  if (game) drawBubbles(ctx, game, now);
  drawShutter(ctx, game);
  ctx.drawImage(layer('panel', paintPanel), 0, 0, W, H);
  drawStations(ctx, game, t, now);
  if (game) {
    drawHud(ctx, game, now, dt);
    if (!game.over) drawSpeech(ctx, game);
    if (!game.over && game.boss.active && game.boss.speech && !game.speech) {
      speechBubble(ctx, game.boss.speech, game.boss.x, SPEECH_Y - 6, '#ffe9e4');
    }
    drawFloats(ctx, game);
  }
  drawParticles(ctx, true);
  ctx.restore();
}
