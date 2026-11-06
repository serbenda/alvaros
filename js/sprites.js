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

  // Silhouette shapes, outlined first so the outline sits behind everything.
  const body = [];
  if (look.hairStyle === 'long') body.push([-1, 2, 14, 15, hair]);
  if (look.hairStyle === 'ponytail') body.push([10, 2, 4, 10, hair]);
  if (opts.legs) {
    const s = opts.step || 0;
    body.push([1, 25 + Math.max(0, s), 4, 8 - Math.max(0, s), '#2b2f3a']);
    body.push([7, 25 + Math.max(0, -s), 4, 8 - Math.max(0, -s), '#2b2f3a']);
    body.push([0, 32, 5, 2, '#141414']);
    body.push([7, 32, 5, 2, '#141414']);
  }
  body.push([-5, 13, 4, 11, shirt]);
  body.push([13, 13, 4, 11, shirt]);
  body.push([-3, 11, 18, 15, shirt]);
  body.push([0, 0, 12, 11, skin]);
  body.push([-1, 4, 1, 3, skin]);
  body.push([12, 4, 1, 3, skin]);

  for (const [dx, dy, w, h] of body) fill(dx - 1, dy - 1, w + 2, h + 2, OUTLINE);
  for (const [dx, dy, w, h, c] of body) fill(dx, dy, w, h, c);
  if (sil) return;

  // Torso shading and details
  fill(11, 12, 4, 14, shirtDark);
  fill(-3, 11, 18, 1, shirtLight);
  fill(-5, 13, 1, 11, shirtLight);
  fill(14, 13, 3, 11, shirtDark);
  fill(-5, 23, 4, 2, skin);
  fill(13, 23, 4, 2, skin);
  fill(4, 10, 4, 2, skinDark);
  fill(3, 11, 6, 1, shirtDark);
  fill(4, 11, 4, 2, skinDark);

  if (look.apron) {
    const apronDark = shade(look.apron, -0.12);
    fill(0, 15, 12, 11, look.apron);
    fill(9, 15, 3, 11, apronDark);
    fill(1, 11, 1, 4, look.apron);
    fill(10, 11, 1, 4, look.apron);
    fill(3, 19, 6, 3, apronDark);
  }

  // Head shading
  fill(0, 9, 12, 2, skinDark);
  fill(10, 1, 2, 9, skinDark);

  // Hair
  switch (look.hairStyle) {
    case 'short':
      fill(-0.5, -1.5, 13, 3.5, hair);
      fill(-0.5, 2, 2, 3, hair);
      fill(10.5, 2, 2, 2, hair);
      fill(3, -1, 4, 1, hairLight);
      break;
    case 'long':
      fill(-0.5, -1.5, 13, 3.5, hair);
      fill(-1, 1, 3, 10, hair);
      fill(10, 1, 3, 10, hair);
      fill(2, -1, 5, 1, hairLight);
      fill(-0.5, 3, 1, 6, hairLight);
      break;
    case 'ponytail':
      fill(-0.5, -1.5, 13, 3.5, hair);
      fill(-0.5, 2, 1.5, 3, hair);
      fill(11, 0, 3, 4, hair);
      fill(3, -1, 4, 1, hairLight);
      break;
    case 'bun':
      fill(3, -5, 6, 4, OUTLINE);
      fill(3.5, -4.5, 5, 3.5, hair);
      fill(-0.5, -1.5, 13, 3.5, hair);
      fill(-0.5, 2, 1.5, 2, hair);
      fill(11, 2, 1.5, 2, hair);
      fill(4.5, -4, 2, 1, hairLight);
      break;
    case 'curly':
      fill(-1.5, -2.5, 15, 4.5, hair);
      fill(-1.5, 2, 3, 5, hair);
      fill(10.5, 2, 3, 5, hair);
      fill(0, -3.5, 2, 1, hair);
      fill(4, -3.5, 2, 1, hair);
      fill(8, -3.5, 2, 1, hair);
      fill(2, -1.5, 1, 1, hairLight);
      fill(6, -1.5, 1, 1, hairLight);
      break;
    case 'bald':
      fill(-0.5, 3, 1.5, 4, hair);
      fill(11, 3, 1.5, 4, hair);
      fill(3, 0.5, 3, 1, shade(skin, 0.3));
      break;
    default:
      break;
  }

  // Eyes
  if (opts.blink) {
    fill(2.5, 5.5, 2.5, 0.75, OUTLINE);
    fill(7, 5.5, 2.5, 0.75, OUTLINE);
  } else {
    fill(2.5, 4.5, 2.5, 2.5, '#ffffff');
    fill(7, 4.5, 2.5, 2.5, '#ffffff');
    fill(3.25, 5, 1.75, 2, OUTLINE);
    fill(7.75, 5, 1.75, 2, OUTLINE);
    fill(3.5, 5.25, 0.6, 0.6, '#ffffff');
    fill(8, 5.25, 0.6, 0.6, '#ffffff');
  }
  // Nose
  fill(5.5, 6.5, 1, 1.5, skinDark);

  if (look.beard) {
    fill(-0.5, 6, 1.5, 4, hair);
    fill(11, 6, 1.5, 4, hair);
    fill(0.5, 8.5, 11, 2.5, hair);
    fill(4, 8.5, 4, 0.75, skin);
  }

  switch (mood) {
    case 'happy':
      fill(4, 8.5, 4, 1.25, OUTLINE);
      fill(3.25, 8, 1, 1, OUTLINE);
      fill(7.75, 8, 1, 1, OUTLINE);
      fill(4.5, 9, 3, 0.75, '#e8706a');
      fill(1.5, 7.5, 1.5, 1, '#f08c80');
      fill(9, 7.5, 1.5, 1, '#f08c80');
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
      fill(2.5, 3, 2.5, 1, OUTLINE);
      fill(7, 3, 2.5, 1, OUTLINE);
      fill(4, 3.5, 1, 1, OUTLINE);
      fill(7, 3.5, 1, 1, OUTLINE);
      fill(4, 8.5, 4, 1, OUTLINE);
      fill(3.5, 9.5, 1, 1, OUTLINE);
      fill(7.5, 9.5, 1, 1, OUTLINE);
      ctx.globalAlpha *= 0.4;
      fill(0, 0, 12, 11, '#e74c3c');
      ctx.globalAlpha /= 0.4;
      break;
    default:
      fill(4.5, 8.5, 3, 1, OUTLINE);
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

  switch (look.accessory) {
    case 'tie':
      fill(4, 11, 4, 1, '#ffffff');
      fill(5, 12, 2, 9, '#c0392b');
      fill(5, 21, 2, 1, '#8e2a1f');
      break;
    case 'boss':
      fill(3, 11, 6, 1, '#ffffff');
      fill(5, 12, 2, 9, '#2c3e50');
      fill(2.5, 7.5, 7, 1.25, hair);
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
