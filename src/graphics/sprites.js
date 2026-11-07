// Pixel art: item icons drawn from 16x16 grids, and people built from shaded
// rectangles with an outline. Coordinates are logical pixels; the canvas is
// drawn at 4x, so fractional values give finer detail where it helps.

export const OUTLINE = '#24160f';

const SIZE = 16;

/** Pads every row to 16 columns so a typo never shifts the drawing. */
function sprite(colors, rows) {
  const grid = rows.map((row) => row.padEnd(SIZE, '.').slice(0, SIZE));
  while (grid.length < SIZE) grid.push('.'.repeat(SIZE));
  return { colors: { o: OUTLINE, ...colors }, grid };
}

const ICONS = {
  coffee: sprite({ w: '#ffffff', s: '#c9c9d4', K: '#5a2e14', C: '#c98a4b', D: '#e8e8ee' }, [
    '................',
    '................',
    '................',
    '...oooooooooo...',
    '..oKCCCCCCCCKo..',
    '..owKKKKKKKKwooo',
    '..owwwwwwwwwwo.o',
    '..owwwwwwwwwso.o',
    '..owwwwwwwwwsooo',
    '...owwwwwwwso...',
    '...owwwwwwsso...',
    'oooooooooooooooo',
    'oDDDDDDDDDDDDDDo',
    '.oooooooooooooo.',
  ]),
  juice: sprite({ L: '#e8f6fb', O: '#f39c12', Y: '#ffd27a', H: '#d35400', G: '#27ae60' }, [
    '...........G....',
    '..........G.....',
    '..oooooooGooo...',
    '..oLLLLLLGLLo...',
    '..oOOOOOGOOHo...',
    '..oOOOOOOOOHo...',
    '..oYOOOOOOOHo...',
    '..oYOOOOOOOHo...',
    '..oYOOOOOOOHo...',
    '..oYOOOOOOOHo...',
    '..oYOOOOOOOHo...',
    '...oYOOOOOHo....',
    '...oLLLLLLLo....',
    '....ooooooo.....',
  ]),
  toast: sprite({ B: '#b5651d', T: '#f3d29b', R: '#e74c3c', r: '#ff8a7a', P: '#f4f4f8' }, [
    '................',
    '................',
    '...oooooooooo...',
    '..oBBBBBBBBBBo..',
    '.oBTTTTTTTTTTBo.',
    '.oBTRRRTTRRRTBo.',
    '.oBTRrRTTRrRTBo.',
    '.oBTRRRRRRRRTBo.',
    '.oBTTRRRRRRTTBo.',
    '.oBTTTTTTTTTTBo.',
    '..oBBBBBBBBBBo..',
    'oooooooooooooooo',
    'oPPPPPPPPPPPPPPo',
    '.oooooooooooooo.',
  ]),
  beer: sprite({ F: '#ffffff', f: '#e9e4d8', A: '#f1c40f', Y: '#fff3a8', H: '#d68910', b: '#fff8d0', L: '#dfeff5' }, [
    '................',
    '....oooooooo....',
    '...oFFFFFFFFo...',
    '..oFFFFFFFFFFo..',
    '..oFfFFFFfFFFo..',
    '..oAAAAAAAAAAo..',
    '..oYAAAAAAAAHo..',
    '..oYAbAAAAAAHo..',
    '..oYAAAAAbAAHo..',
    '...oYAAAAAAHo...',
    '...oYAAbAAAHo...',
    '...oYAAAAAAHo...',
    '....oYAAAAHo....',
    '....oLLLLLLo....',
    '.....oooooo.....',
  ]),
  tapa: sprite({ Y: '#f7d154', y: '#e8b84a', C: '#d9952f', D: '#b8741f', P: '#f4f4f8', S: '#c9c9d4' }, [
    '................',
    '................',
    '................',
    '......oo........',
    '.....oYYoo......',
    '....oYYYYYoo....',
    '...oYyYYYYYYoo..',
    '..oYYYYYyYYYYYo.',
    '..oCCCCCCCCCCCo.',
    '..oDDDDDDDDDDDo.',
    'oooooooooooooooo',
    'oPPPPPPPPPPPPPPo',
    '.oSSSSSSSSSSSSo.',
    '..oooooooooooo..',
  ]),
  menu: sprite({ P: '#f4f4f8', G: '#2ecc71', g: '#1e8449', M: '#8b4513', m: '#c27a3e', F: '#f7c948' }, [
    '................',
    '................',
    '...oooooooooo...',
    '..oPPPPPPPPPPo..',
    '.oPPGGgPPMMMPPo.',
    '.oPGGGGPMMMMMPo.',
    '.oPGgGGPMmMMMPo.',
    '.oPPGGPPMMMMMPo.',
    '.oPPPPPPPMMMPPo.',
    '.oPFFFFFFPPPPPo.',
    '.oPPFFFFFFPPPPo.',
    '..oPPPPPPPPPPo..',
    '...oooooooooo...',
  ]),
};

const HEART = sprite({ r: '#e74c3c', h: '#ff8a7a' }, [
  '.oo.oo.',
  'orrorro',
  'ohrrrro',
  'orrrrro',
  '.orrro.',
  '..oro..',
  '...o...',
]);

const COIN = sprite({ y: '#f5c542', h: '#fff1a8', d: '#b7791f' }, [
  '..ooo..',
  '.oyyyo.',
  'oyhydyo',
  'oyhydyo',
  'oyyydyo',
  '.oyyyo.',
  '..ooo..',
]);

function drawGrid(ctx, spr, x, y, scale, override) {
  const { grid, colors } = spr;
  for (let r = 0; r < grid.length; r++) {
    const row = grid[r];
    for (let c = 0; c < row.length; c++) {
      const ch = row[c];
      if (ch === '.') continue;
      ctx.fillStyle = override && ch !== 'o' ? override : colors[ch];
      ctx.fillRect(x + c * scale, y + r * scale, scale + 0.02, scale + 0.02);
    }
  }
}

/** Draws a 16x16 item icon. `scale` 1 = 16 logical pixels. */
export function drawIcon(ctx, id, x, y, scale = 1) {
  const spr = ICONS[id];
  if (spr) drawGrid(ctx, spr, x, y, scale);
}

export function drawHeart(ctx, x, y, full) {
  drawGrid(ctx, HEART, x, y, 1, full ? null : '#4a3a33');
}

export function drawCoin(ctx, x, y, scale = 1) {
  drawGrid(ctx, COIN, x, y, scale);
}

// ---- People -------------------------------------------------------------------

const SKINS = ['#f6cfa5', '#eab88a', '#d39a6a', '#a8714a', '#7a4e33'];
const HAIRS = ['#2c1b10', '#5a3825', '#8b5a2b', '#c99a3c', '#9a9a9a', '#151515', '#7a2e1c'];
const SHIRTS = ['#2f7dc1', '#2e9e5b', '#8e44ad', '#c0392b', '#16a085', '#d35400', '#34495e', '#e84393', '#f0b429'];

/** Mixes a hex colour towards black (amount < 0) or white (amount > 0). */
export function shade(hex, amount) {
  const n = parseInt(hex.slice(1), 16);
  const target = amount < 0 ? 0 : 255;
  const k = Math.abs(amount);
  const mix = (v) => Math.round(v + (target - v) * k);
  const r = mix((n >> 16) & 255);
  const g = mix((n >> 8) & 255);
  const b = mix(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

/** Creates a random look for a customer of the given type. */
export function makeLook(rng, type) {
  const pick = (arr) => arr[Math.floor(rng() * arr.length)];
  const look = {
    skin: pick(SKINS),
    hair: pick(HAIRS),
    hairStyle: pick(['short', 'short', 'long', 'bun', 'curly', 'bald', 'ponytail']),
    shirt: pick(SHIRTS),
    accessory: 'none',
    offset: 0,
  };
  if (rng() < 0.15) look.glasses = true;
  switch (type) {
    case 'hurry':
      look.shirt = '#2c3e50';
      look.hairStyle = 'short';
      look.accessory = 'tie';
      break;
    case 'kid':
      look.offset = 7;
      look.hairStyle = pick(['short', 'bun', 'curly', 'ponytail']);
      look.hair = pick(HAIRS.slice(0, 4));
      look.glasses = false;
      break;
    case 'tourist':
      look.accessory = 'tourist';
      look.shirt = pick(['#f1c40f', '#e67e22', '#1abc9c', '#ff7eb6']);
      break;
    case 'critic':
      look.accessory = 'critic';
      look.shirt = '#1c1c1c';
      look.hair = '#9a9a9a';
      look.hairStyle = 'short';
      look.glasses = true;
      break;
    default:
      break;
  }
  return look;
}

/**
 * Draws a person seen from the front. `cx` is the horizontal centre and `top`
 * the top of the head. The head is 12 px wide and the torso ends at top + 26.
 *
 * opts.mood: 'neutral' | 'happy' | 'worried' | 'angry'
 * opts.legs: draw legs and shoes (for staff walking on the floor)
 * opts.step: walking phase in [-1, 1]
 * opts.blink: close the eyes
 * opts.silhouette: draw a dark shape only (locked characters)
 */
export function drawPerson(ctx, look, cx, top, opts = {}) {
  const mood = opts.mood || 'neutral';
  const sil = !!opts.silhouette;
  const x = Math.round(cx) - 6;
  const y = Math.round(top);
  const fill = (dx, dy, w, h, color) => {
    ctx.fillStyle = sil ? '#2a2320' : color;
    ctx.fillRect(x + dx, y + dy, w, h);
  };

  const skin = look.skin;
  const skinDark = shade(skin, -0.18);
  const hair = look.hair;
  const hairLight = shade(hair, 0.25);
  const shirt = look.shirt;
  const shirtDark = shade(shirt, -0.25);
  const shirtLight = shade(shirt, 0.18);

  // Rounded rectangle: a rectangle with its corners cut, the pixel-art way.
  const rfill = (dx, dy, w, h, color, r = 0) => {
    if (r <= 0) return fill(dx, dy, w, h, color);
    const k = Math.min(r, w / 2, h / 2);
    fill(dx + k, dy, w - k * 2, h, color);
    fill(dx, dy + k, w, h - k * 2, color);
    fill(dx + k * 0.3, dy + k * 0.3, w - k * 0.6, h - k * 0.6, color);
  };

  // Silhouette shapes, outlined first so the outline sits behind everything.
  const body = [];
  if (look.hairStyle === 'long') body.push([-1.5, 1, 15, 16, hair, 3]);
  if (look.hairStyle === 'ponytail') body.push([10, 1, 4.5, 11, hair, 2]);
  if (opts.legs) {
    const s = opts.step || 0;
    body.push([1, 25 + Math.max(0, s), 4, 8 - Math.max(0, s), '#2b2f3a', 1]);
    body.push([7, 25 + Math.max(0, -s), 4, 8 - Math.max(0, -s), '#2b2f3a', 1]);
    body.push([-0.5, 31.5, 6, 2.5, '#141414', 1]);
    body.push([6.5, 31.5, 6, 2.5, '#141414', 1]);
  }
  body.push([-5, 13, 4, 11, shirt, 1.5]);
  body.push([13, 13, 4, 11, shirt, 1.5]);
  body.push([-3, 11, 18, 15, shirt, 3]);
  body.push([-5.5, 22.5, 5, 3, skin, 1.2]);
  body.push([12.5, 22.5, 5, 3, skin, 1.2]);
  body.push([-1.5, 4, 2, 3.5, skin, 0.8]);
  body.push([11.5, 4, 2, 3.5, skin, 0.8]);
  body.push([-0.5, -0.5, 13, 12, skin, 3.5]);

  for (const [dx, dy, w, h, , r] of body) rfill(dx - 1, dy - 1, w + 2, h + 2, OUTLINE, r + 0.5);
  for (const [dx, dy, w, h, c, r] of body) rfill(dx, dy, w, h, c, r);
  if (sil) return;

  // Torso shading and details
  fill(11, 13, 3.5, 12, shirtDark);
  fill(-1, 11, 14, 1, shirtLight);
  fill(-4.5, 14, 1, 9, shirtLight);
  fill(14.5, 14, 2, 9, shirtDark);
  fill(-5.5, 21.5, 4.5, 1, shirtDark);
  fill(12.5, 21.5, 4.5, 1, shirtDark);
  fill(-4.5, 23, 1.5, 1, shade(skin, 0.25));
  // Neck and collar
  fill(4, 10.5, 4, 2, skinDark);
  fill(4.5, 11.5, 3, 1.5, skin);
  fill(3, 11, 1.5, 2, shirtLight);
  fill(7.5, 11, 1.5, 2, shirtLight);

  if (look.apron) {
    const apronDark = shade(look.apron, -0.12);
    rfill(0, 15, 12, 11, look.apron, 1.5);
    fill(9.5, 15.5, 2.5, 10, apronDark);
    fill(1, 11.5, 1, 4, look.apron);
    fill(10, 11.5, 1, 4, look.apron);
    fill(-3, 15.5, 3, 1, look.apron);
    fill(12, 15.5, 3, 1, look.apron);
    rfill(3.5, 19, 5, 3, apronDark, 0.6);
    fill(3.5, 19, 5, 0.6, shade(look.apron, -0.25));
  }

  // Head shading: soft shadow on the right and under the chin
  fill(9.5, 1.5, 2.5, 8.5, skinDark);
  fill(1.5, 9.5, 9.5, 1.5, skinDark);
  fill(1, 1.5, 1, 3, shade(skin, 0.18));

  // Hair
  switch (look.hairStyle) {
    case 'short':
      rfill(-1, -2, 14, 5, hair, 2.5);
      fill(-0.8, 2, 2.3, 3, hair);
      fill(10, 2, 2.5, 2.2, hair);
      fill(1.5, 2.5, 4.5, 1.3, hair);
      fill(3, -1.2, 5, 0.8, hairLight);
      fill(2, -0.4, 1, 0.8, hairLight);
      break;
    case 'long':
      rfill(-1, -2, 14, 5, hair, 2.5);
      rfill(-1.5, 1, 3.5, 12, hair, 1.5);
      rfill(10, 1, 3.5, 12, hair, 1.5);
      fill(0.5, 2.5, 5.5, 1.4, hair);
      fill(2, -1.2, 4.5, 0.8, hairLight);
      fill(-0.9, 4, 0.8, 7, hairLight);
      fill(1, -0.3, 1, 0.8, hairLight);
      break;
    case 'ponytail':
      rfill(-1, -2, 14, 5, hair, 2.5);
      fill(-0.8, 2, 2, 3, hair);
      fill(1.5, 2.5, 4, 1.3, hair);
      fill(11, 0.5, 2, 1.5, '#c0392b');
      fill(3, -1.2, 5, 0.8, hairLight);
      break;
    case 'bun':
      rfill(2.5, -6, 7, 5, OUTLINE, 2);
      rfill(3, -5.5, 6, 4, hair, 1.5);
      rfill(-1, -2, 14, 5, hair, 2.5);
      fill(-0.8, 2, 2, 2.5, hair);
      fill(10.8, 2, 2, 2.5, hair);
      fill(4, -4.8, 2.5, 0.8, hairLight);
      fill(3, -1.2, 5, 0.8, hairLight);
      break;
    case 'curly':
      for (const [bx, by] of [[-2, -2], [2, -3.5], [6, -3.5], [10, -2], [-2.5, 2], [10.5, 2]]) rfill(bx - 0.5, by - 0.5, 5, 5, OUTLINE, 2);
      for (const [bx, by] of [[-2, -2], [2, -3.5], [6, -3.5], [10, -2], [-2.5, 2], [10.5, 2]]) rfill(bx, by, 4, 4, hair, 1.8);
      rfill(-1, -1, 14, 3.5, hair, 1.5);
      fill(3, -2.8, 1, 0.8, hairLight);
      fill(7, -2.8, 1, 0.8, hairLight);
      fill(-1.2, 3, 0.8, 1.5, hairLight);
      break;
    case 'bald':
      fill(-0.8, 3, 1.8, 4, hair);
      fill(11, 3, 1.8, 4, hair);
      rfill(3, 0.3, 3.5, 1.2, shade(skin, 0.35), 0.5);
      break;
    default:
      break;
  }

  // Eyebrows (moods below can override them)
  const brow = shade(hair === undefined ? '#2b1d14' : hair, -0.15);
  if (mood === 'neutral' || mood === 'happy') {
    fill(2.2, 3.3, 3, 0.7, brow);
    fill(6.8, 3.3, 3, 0.7, brow);
  }

  // Eyes: white, coloured iris and a catch-light
  if (opts.blink) {
    fill(2.4, 5.6, 2.8, 0.8, OUTLINE);
    fill(6.8, 5.6, 2.8, 0.8, OUTLINE);
  } else {
    rfill(2.2, 4.2, 3, 3, '#ffffff', 0.8);
    rfill(6.8, 4.2, 3, 3, '#ffffff', 0.8);
    rfill(3, 4.6, 2.1, 2.6, look.eyes || '#4a3020', 0.5);
    rfill(7.6, 4.6, 2.1, 2.6, look.eyes || '#4a3020', 0.5);
    fill(3.5, 5.3, 1.2, 1.5, OUTLINE);
    fill(8.1, 5.3, 1.2, 1.5, OUTLINE);
    fill(3.3, 4.9, 0.7, 0.7, '#ffffff');
    fill(7.9, 4.9, 0.7, 0.7, '#ffffff');
  }
  // Nose
  fill(5.6, 6.8, 0.9, 1.2, skinDark);
  fill(5.4, 7.7, 1.3, 0.5, skinDark);

  if (look.beard) {
    fill(-0.5, 6, 1.5, 4, hair);
    fill(11, 6, 1.5, 4, hair);
    fill(0.5, 8.5, 11, 2.5, hair);
    fill(4, 8.5, 4, 0.75, skin);
  }

  switch (mood) {
    case 'happy':
      rfill(3.9, 8.3, 4.2, 2, OUTLINE, 0.7);
      rfill(4.3, 8.6, 3.4, 1.4, '#9b2f2f', 0.5);
      fill(4.5, 8.6, 3, 0.5, '#ffffff');
      fill(5, 9.4, 2, 0.6, '#e8706a');
      fill(3.3, 7.9, 0.9, 0.9, OUTLINE);
      fill(7.8, 7.9, 0.9, 0.9, OUTLINE);
      rfill(0.8, 7.2, 2.2, 1.3, '#f4a29a', 0.5);
      rfill(9, 7.2, 2.2, 1.3, '#f4a29a', 0.5);
      break;
    case 'worried':
      fill(2.5, 3.5, 2.5, 0.75, OUTLINE);
      fill(7, 3.5, 2.5, 0.75, OUTLINE);
      fill(4, 9, 1, 1, OUTLINE);
      fill(5, 8.5, 2, 1, OUTLINE);
      fill(7, 9, 1, 1, OUTLINE);
      fill(12.5, 0, 1.5, 2.5, '#7ec8e3');
      break;
    case 'angry':
      // Frowning brows, a gritted-teeth mouth and red cheeks (no tint over the hair)
      fill(2, 3, 3, 0.9, OUTLINE);
      fill(4.2, 3.6, 1, 0.9, OUTLINE);
      fill(7, 3, 3, 0.9, OUTLINE);
      fill(6.8, 3.6, 1, 0.9, OUTLINE);
      rfill(3.6, 8.2, 4.8, 2.3, OUTLINE, 0.6);
      fill(4.1, 8.7, 3.8, 1.3, '#ffffff');
      fill(5.3, 8.7, 0.4, 1.3, '#c9c2b8');
      fill(6.4, 8.7, 0.4, 1.3, '#c9c2b8');
      rfill(0.4, 6.8, 2.6, 1.8, '#ef6b5e', 0.6);
      rfill(9, 6.8, 2.6, 1.8, '#ef6b5e', 0.6);
      // Little anger mark on the forehead
      fill(9.5, -0.5, 0.8, 2.4, '#e74c3c');
      fill(8.7, 0.3, 2.4, 0.8, '#e74c3c');
      break;
    default:
      fill(4.5, 8.8, 3, 0.8, OUTLINE);
      fill(4, 8.4, 0.7, 0.6, OUTLINE);
      fill(7.3, 8.4, 0.7, 0.6, OUTLINE);
      break;
  }

  if (look.glasses) {
    fill(2, 4, 3.5, 0.5, OUTLINE);
    fill(6.5, 4, 3.5, 0.5, OUTLINE);
    fill(2, 4, 0.5, 3.5, OUTLINE);
    fill(5, 4, 0.5, 3.5, OUTLINE);
    fill(6.5, 4, 0.5, 3.5, OUTLINE);
    fill(9.5, 4, 0.5, 3.5, OUTLINE);
    fill(2, 7, 3.5, 0.5, OUTLINE);
    fill(6.5, 7, 3.5, 0.5, OUTLINE);
    fill(5.5, 5, 1, 0.5, OUTLINE);
  }

  if (look.watch) {
    // Gold watch on the left wrist
    fill(-5.5, 21, 5, 2, OUTLINE);
    fill(-5, 21.25, 4, 1.5, '#f5c542');
    fill(-4, 21.25, 1.5, 0.75, '#fff6d0');
  }

  switch (look.accessory) {
    case 'tie':
      fill(4, 11, 4, 1, '#ffffff');
      fill(5, 12, 2, 9, '#c0392b');
      fill(5, 21, 2, 1, '#8e2a1f');
      break;
    case 'boss':
      fill(3, 11, 6, 1, '#ffffff');
      fill(5, 12, 2, 9, '#2c3e50');
      fill(-3, 18, 18, 2, '#3a2a20');
      fill(5, 18, 2, 2, '#d4a017');
      break;
    case 'tourist':
      fill(0, 15, 7, 6, OUTLINE);
      fill(0.5, 15.5, 6, 5, '#2b2b2b');
      fill(2, 16.5, 3, 3, '#7fb3c8');
      fill(2.5, 17, 1, 1, '#ffffff');
      fill(-3, -2.5, 18, 2, OUTLINE);
      fill(-2.5, -2.5, 17, 1.5, '#f6e58d');
      fill(1, -5, 10, 3, OUTLINE);
      fill(1.5, -4.5, 9, 2.5, '#f6e58d');
      fill(1.5, -2.5, 9, 0.75, '#e17055');
      break;
    case 'critic':
      fill(-1.5, -4, 15, 3.5, OUTLINE);
      fill(-1, -3.5, 14, 3, '#2c2c54');
      fill(5, -5, 1.5, 1.5, '#2c2c54');
      fill(3, 7.75, 6, 1, hair);
      fill(9, 15, 3, 5, '#ffffff');
      fill(9.5, 16, 2, 0.5, '#999999');
      fill(9.5, 17, 2, 0.5, '#999999');
      break;
    default:
      break;
  }
}
