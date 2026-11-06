// Pixel art: item icons drawn from small grids, and people drawn from rectangles.

const DARK = '#2b1d14';

const ICONS = {
  coffee: {
    colors: { s: '#d9d9d9', w: '#fdfdfd', c: '#6f3b1e', h: '#e6e6e6', k: '#b0b0b0' },
    grid: [
      '..s.s...',
      '...s.s..',
      '.wwwww..',
      '.wcccwhh',
      '.wcccw.h',
      '.wwwwwhh',
      'kkkkkkk.',
      '........',
    ],
  },
  juice: {
    colors: { t: '#d8eef5', o: '#f39c12', g: '#27ae60' },
    grid: [
      '.....g..',
      '.ttttgt.',
      '.toooot.',
      '.toooot.',
      '.toooot.',
      '.toooot.',
      '..tttt..',
      '........',
    ],
  },
  toast: {
    colors: { b: '#a0522d', l: '#f3d29b', r: '#e74c3c' },
    grid: [
      '........',
      '.bbbbbb.',
      'bllllllb',
      'blrrrllb',
      'bllrrrlb',
      'bllllllb',
      '.bbbbbb.',
      '........',
    ],
  },
  beer: {
    colors: { f: '#ffffff', t: '#d8eef5', y: '#f1c40f' },
    grid: [
      '.ffff...',
      'ffffff..',
      '.tyyyt..',
      '.tyyyt..',
      '.tyyyt..',
      '.tyyyt..',
      '.tyyyt..',
      '..ttt...',
    ],
  },
  tapa: {
    colors: { y: '#f7d154', b: '#c0843d', w: '#fdfdfd', k: '#bdbdbd' },
    grid: [
      '........',
      '...yy...',
      '..yyyy..',
      '.yyyyyy.',
      '.bbbbbb.',
      'wwwwwwww',
      '.kkkkkk.',
      '........',
    ],
  },
  menu: {
    colors: { w: '#fdfdfd', r: '#e74c3c', g: '#2ecc71', m: '#8b4513', k: '#bdbdbd' },
    grid: [
      '........',
      '..wwww..',
      '.wrrggw.',
      'wrrrgggw',
      'wrrmmggw',
      '.wmmmmw.',
      '..kkkk..',
      '........',
    ],
  },
};

const HEART = {
  colors: { r: '#e74c3c' },
  grid: ['.rr.rr.', 'rrrrrrr', 'rrrrrrr', '.rrrrr.', '..rrr..', '...r...'],
};

const COIN = {
  colors: { o: '#b7791f', y: '#f5c542' },
  grid: ['..ooo..', '.oyyyo.', 'oyyoyyo', 'oyyoyyo', 'oyyoyyo', '.oyyyo.', '..ooo..'],
};

function drawGrid(ctx, sprite, x, y, scale = 1, override = null) {
  const { grid, colors } = sprite;
  for (let r = 0; r < grid.length; r++) {
    const row = grid[r];
    for (let c = 0; c < row.length; c++) {
      const ch = row[c];
      if (ch === '.') continue;
      ctx.fillStyle = override || colors[ch];
      ctx.fillRect(x + c * scale, y + r * scale, scale, scale);
    }
  }
}

export function drawIcon(ctx, id, x, y, scale = 1) {
  const sprite = ICONS[id];
  if (sprite) drawGrid(ctx, sprite, Math.round(x), Math.round(y), scale);
}

export function drawHeart(ctx, x, y, full) {
  drawGrid(ctx, HEART, x, y, 1, full ? null : '#5a4036');
}

export function drawCoin(ctx, x, y) {
  drawGrid(ctx, COIN, x, y, 1);
}

const SKINS = ['#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#ffdbac'];
const HAIRS = ['#2c1b10', '#5a3825', '#a0522d', '#d4a017', '#7f7f7f', '#111111'];
const SHIRTS = ['#2980b9', '#27ae60', '#8e44ad', '#c0392b', '#16a085', '#d35400', '#34495e', '#e84393'];

/** Creates a random look for a customer of the given type. */
export function makeLook(rng, type) {
  const pick = (arr) => arr[Math.floor(rng() * arr.length)];
  const look = {
    skin: pick(SKINS),
    hair: pick(HAIRS),
    hairStyle: pick(['short', 'short', 'long', 'bun', 'curly', 'bald']),
    shirt: pick(SHIRTS),
    accessory: 'none',
    offset: 0,
  };
  switch (type) {
    case 'hurry':
      look.shirt = '#2c3e50';
      look.hairStyle = 'short';
      look.accessory = 'tie';
      break;
    case 'kid':
      look.offset = 6;
      look.hairStyle = pick(['short', 'bun', 'curly']);
      look.hair = pick(HAIRS.slice(0, 4));
      break;
    case 'tourist':
      look.accessory = 'tourist';
      look.shirt = pick(['#f1c40f', '#e67e22', '#1abc9c']);
      break;
    case 'critic':
      look.accessory = 'critic';
      look.shirt = '#111111';
      look.hair = '#7f7f7f';
      look.hairStyle = 'short';
      break;
    default:
      break;
  }
  return look;
}

/**
 * Draws a person seen from the front, head and torso only.
 * `cx` is the horizontal centre, `top` the top of the head.
 * mood: 'neutral' | 'happy' | 'worried' | 'angry'.
 */
export function drawPerson(ctx, look, cx, top, opts = {}) {
  const mood = opts.mood || 'neutral';
  const silhouette = !!opts.silhouette;
  const x = Math.round(cx) - 5;
  const y = Math.round(top);
  const R = (dx, dy, w, h, color) => {
    ctx.fillStyle = silhouette ? '#2a2320' : color;
    ctx.fillRect(x + dx, y + dy, w, h);
  };

  if (look.hairStyle === 'long') R(-1, 2, 12, 13, look.hair);

  // Arms, hands and body
  R(-4, 12, 3, 10, look.shirt);
  R(11, 12, 3, 10, look.shirt);
  R(-4, 21, 3, 2, look.skin);
  R(11, 21, 3, 2, look.skin);
  R(-2, 10, 14, 14, look.shirt);
  R(3, 9, 4, 2, look.skin);

  // Head
  R(0, 0, 10, 10, look.skin);

  switch (look.hairStyle) {
    case 'short':
      R(0, -1, 10, 3, look.hair);
      R(0, 2, 1, 3, look.hair);
      R(9, 2, 1, 3, look.hair);
      break;
    case 'long':
      R(0, -1, 10, 3, look.hair);
      R(-1, 1, 2, 8, look.hair);
      R(9, 1, 2, 8, look.hair);
      break;
    case 'bun':
      R(0, -1, 10, 3, look.hair);
      R(3, -4, 4, 3, look.hair);
      R(0, 2, 1, 2, look.hair);
      R(9, 2, 1, 2, look.hair);
      break;
    case 'curly':
      R(-1, -2, 12, 4, look.hair);
      R(-1, 2, 2, 4, look.hair);
      R(9, 2, 2, 4, look.hair);
      R(1, -3, 2, 1, look.hair);
      R(5, -3, 2, 1, look.hair);
      break;
    case 'bald':
      R(0, 3, 1, 3, look.hair);
      R(9, 3, 1, 3, look.hair);
      break;
    default:
      break;
  }

  if (look.apron) {
    R(0, 14, 10, 10, look.apron);
    R(1, 10, 1, 4, look.apron);
    R(8, 10, 1, 4, look.apron);
  }

  if (silhouette) return;

  // Face
  R(2, 4, 2, 2, DARK);
  R(6, 4, 2, 2, DARK);
  if (look.beard) {
    R(0, 6, 1, 3, look.hair);
    R(9, 6, 1, 3, look.hair);
    R(1, 8, 8, 2, look.hair);
  }
  switch (mood) {
    case 'happy':
      R(3, 7, 4, 1, DARK);
      R(2, 6, 1, 1, DARK);
      R(7, 6, 1, 1, DARK);
      R(1, 6, 1, 1, '#e8907a');
      R(8, 6, 1, 1, '#e8907a');
      break;
    case 'worried':
      R(3, 8, 1, 1, DARK);
      R(4, 7, 2, 1, DARK);
      R(6, 8, 1, 1, DARK);
      R(10, 1, 1, 2, '#7ec8e3');
      break;
    case 'angry':
      R(2, 3, 2, 1, DARK);
      R(6, 3, 2, 1, DARK);
      R(3, 8, 1, 1, DARK);
      R(4, 7, 2, 1, DARK);
      R(6, 8, 1, 1, DARK);
      R(0, 0, 10, 10, 'rgba(231, 76, 60, 0.35)');
      break;
    default:
      R(4, 7, 2, 1, DARK);
      break;
  }

  switch (look.accessory) {
    case 'tie':
      R(4, 10, 2, 9, '#c0392b');
      break;
    case 'boss':
      R(4, 10, 2, 9, '#2c3e50');
      R(2, 6, 6, 1, look.hair);
      R(-2, 18, 14, 2, '#2c3e50');
      break;
    case 'tourist':
      R(1, 15, 6, 5, '#222222');
      R(3, 16, 2, 2, '#88aaaa');
      R(-2, -2, 14, 2, '#f6e58d');
      R(1, -4, 8, 2, '#f6e58d');
      R(1, -2, 8, 1, '#e17055');
      break;
    case 'critic':
      R(-1, -3, 11, 3, '#2c2c54');
      R(4, -4, 1, 1, '#2c2c54');
      R(1, 4, 8, 1, '#111111');
      R(2, 6, 6, 1, look.hair);
      break;
    default:
      break;
  }
}
