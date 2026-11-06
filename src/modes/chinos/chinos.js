// "Los chinos" against Blanca, the classic Spanish bar game.
// Each player hides 0 to 3 coins in their fist. Then, taking turns, each one
// calls the total number of coins in both hands. A number already called
// cannot be repeated. Whoever guesses right wins the round; the first to
// reach POINTS_TO_WIN wins the match.

import { W, H } from '../../core/layout.js';
import { OUTLINE, shade } from '../../graphics/sprites.js';
import { rect, box, text, bubble, person, fitSize, vignette } from '../../graphics/draw.js';
import { bgTable, LOOKS } from '../minigames/scenes.js';

export const MAX_COINS = 3;
export const POINTS_TO_WIN = 3;
const HUD_H = 18;
const cosmetic = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Blanca's call. She knows her own coins and, if the player already called,
 * reads a hint from that call (people tend to call their own coins plus about
 * 1.5). She never repeats the number already called.
 */
export function blancaGuess(ownCoins, playerCall = null, rng = Math.random) {
  let guess;
  if (playerCall === null) {
    guess = ownCoins + Math.round(1 + rng() * 1.2);
  } else {
    const estimate = Math.max(0, Math.min(MAX_COINS, Math.round(playerCall - 1.5)));
    guess = ownCoins + estimate;
  }
  guess = Math.max(ownCoins, Math.min(ownCoins + MAX_COINS, guess));
  if (guess === playerCall) {
    const options = [];
    for (let g = ownCoins; g <= ownCoins + MAX_COINS; g++) if (g !== playerCall) options.push(g);
    options.sort((a, b) => Math.abs(a - guess) - Math.abs(b - guess));
    guess = options[0];
  }
  return guess;
}

export class ChinosGame {
  constructor({ t, onEvent = () => {}, rng = Math.random }) {
    this.t = t;
    this.emit = onEvent;
    this.rng = rng;
    this.player = 0;
    this.blanca = 0;
    this.round = 0;
    this.over = false;
    this.overTime = 0;
    this.time = 0;
    this.newRound();
  }

  newRound() {
    this.round++;
    // Who calls first alternates every round; the player starts.
    this.playerFirst = this.round % 2 === 1;
    this.myCoins = null;
    this.herCoins = Math.floor(this.rng() * (MAX_COINS + 1));
    this.myCall = null;
    this.herCall = null;
    this.phase = 'pick';
    this.pt = 0;
    this.winner = null;
    this.line = null;
  }

  say(key) {
    this.line = { text: cosmetic(this.t(`chinos.lines.${key}`)), t: 2.2 };
  }

  update(dt) {
    this.time += dt;
    this.pt += dt;
    if (this.line) {
      this.line.t -= dt;
      if (this.line.t <= 0) this.line = null;
    }
    if (this.over) {
      this.overTime += dt;
      return;
    }
    if (this.phase === 'thinking' && this.pt >= 1.1) {
      this.herCall = blancaGuess(this.herCoins, this.myCall, this.rng);
      this.emit('chinosCall', {});
      if (this.myCall === null) {
        this.phase = 'call';
        this.pt = 0;
      } else {
        this.reveal();
      }
    } else if (this.phase === 'reveal' && this.pt >= 2.6) {
      if (this.player >= POINTS_TO_WIN || this.blanca >= POINTS_TO_WIN) {
        this.over = true;
        this.say(this.player > this.blanca ? 'lostMatch' : 'wonMatch');
        this.emit('gameover', this.summary());
      } else {
        this.newRound();
      }
    }
  }

  reveal() {
    const total = this.myCoins + this.herCoins;
    this.total = total;
    this.phase = 'reveal';
    this.pt = 0;
    if (this.myCall === total) {
      this.winner = 'player';
      this.player++;
      this.say('playerWins');
      this.emit('miniWin', {});
    } else if (this.herCall === total) {
      this.winner = 'blanca';
      this.blanca++;
      this.say('blancaWins');
      this.emit('miniLose', {});
    } else {
      this.winner = 'none';
      this.say('nobody');
      this.emit('nope', {});
    }
  }

  /** Buttons for the current phase: { x, y, w, h, value, disabled }. */
  buttons() {
    if (this.phase === 'pick') {
      return [0, 1, 2, 3].map((v, i) => ({ x: 8 + i * 42, y: 254, w: 38, h: 48, value: v }));
    }
    if (this.phase === 'call') {
      const w = 23;
      return [0, 1, 2, 3, 4, 5, 6].map((v, i) => ({
        x: 5 + i * (w + 1.3),
        y: 262,
        w,
        h: 36,
        value: v,
        // Your own coins set a minimum and a maximum, and Blanca's call cannot be repeated
        disabled: v === this.herCall || v < this.myCoins || v > this.myCoins + MAX_COINS,
      }));
    }
    return [];
  }

  down(x, y) {
    if (this.over) return;
    if (y < HUD_H) {
      this.emit('pause', {});
      return;
    }
    const hit = this.buttons().find((b) => !b.disabled && x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h);
    if (!hit) return;
    if (this.phase === 'pick') {
      this.myCoins = hit.value;
      this.emit('prep', {});
      if (this.playerFirst) {
        this.phase = 'call';
      } else {
        this.phase = 'thinking';
        this.say('thinking');
      }
      this.pt = 0;
    } else if (this.phase === 'call') {
      this.myCall = hit.value;
      this.emit('prep', {});
      if (this.herCall === null) {
        this.phase = 'thinking';
        this.pt = 0;
        this.say('thinking');
      } else {
        this.reveal();
      }
    }
  }

  summary() {
    return { score: this.player, served: this.player, bestCombo: this.blanca, won: this.player > this.blanca, stars: null };
  }
}

// ---- Drawing ----------------------------------------------------------------------

function coin(ctx, x, y, s = 1) {
  box(ctx, x - 4.5 * s, y - 4.5 * s, 9 * s, 9 * s, OUTLINE, 3 * s);
  box(ctx, x - 3.75 * s, y - 3.75 * s, 7.5 * s, 7.5 * s, '#d4a017', 2.5 * s);
  box(ctx, x - 2.75 * s, y - 2.75 * s, 5.5 * s, 5.5 * s, '#f5c542', 2 * s);
  rect(ctx, x - 1.75 * s, y - 2 * s, 1 * s, 2 * s, '#fff1a8');
  rect(ctx, x - 0.5 * s, y - 1.5 * s, 1 * s, 3 * s, '#b7791f');
}

/** A fist on the table, closed (knuckles and thumb) or open showing its coins. */
function hand(ctx, x, y, skin, coins, open, flip) {
  const dark = shade(skin, -0.2);
  const light = shade(skin, 0.15);
  const dir = flip ? -1 : 1;
  if (!open) {
    box(ctx, x - 17, y - 12, 34, 25, OUTLINE, 7);
    box(ctx, x - 16, y - 11, 32, 23, skin, 7);
    // Knuckles facing the other player
    const ky = flip ? y + 5 : y - 9;
    for (let i = 0; i < 4; i++) {
      box(ctx, x - 13 + i * 7, ky, 6, 5, light, 2);
      rect(ctx, x - 7.5 + i * 7, ky + 1, 0.75, 4, dark);
    }
    // Thumb across the fist
    box(ctx, x - 10, y - 2 * dir - 2, 18, 5, OUTLINE, 2);
    box(ctx, x - 9.5, y - 2 * dir - 1.5, 17, 4, skin, 2);
    rect(ctx, x + 5, y - 2 * dir - 1, 2, 3, light);
    // Sleeve
    box(ctx, x - 12, y + 12 * dir - (flip ? 6 : 0), 24, 6, OUTLINE, 1);
    box(ctx, x - 11, y + 12 * dir - (flip ? 5 : -1), 22, 4, flip ? '#1f1f1f' : '#2f7dc1', 1);
    return;
  }
  // Open palm with fingers and the coins
  box(ctx, x - 22, y - 13, 44, 28, OUTLINE, 9);
  box(ctx, x - 21, y - 12, 42, 26, skin, 9);
  for (let i = 0; i < 4; i++) {
    const fx = x - 15 + i * 8.5;
    const fy = flip ? y + 12 : y - 18;
    box(ctx, fx - 3.5, fy - 1, 7, 9, OUTLINE, 3);
    box(ctx, fx - 2.5, fy, 5, 8, skin, 2.5);
  }
  box(ctx, x - 15, y - 7, 30, 16, dark, 6);
  for (let i = 0; i < coins; i++) coin(ctx, x - 9.5 + i * 9.5, y + 1, 1.05);
  if (coins === 0) text(ctx, '0', x, y - 3, { size: 7, color: OUTLINE, align: 'center' });
}

export function renderChinos(ctx, game, { t, now }) {
  bgTable(ctx, 112);
  // Blanca across the table
  const mood = game.winner === 'blanca' ? 'happy' : game.winner === 'player' ? 'worried' : 'happy';
  person(ctx, LOOKS.blanca, 90, 36, 2.6, { mood, blink: now % 3.2 < 0.12 });
  rect(ctx, 0, 108, W, 6, '#a8743e');

  const reveal = game.phase === 'reveal' || game.over;
  hand(ctx, 90, 134, LOOKS.blanca.skin, game.herCoins, reveal, true);
  if (game.myCoins !== null) {
    const bob = game.phase === 'thinking' ? Math.sin(now * 8) * 1.5 : 0;
    hand(ctx, 90, 214 + bob, '#eab88a', game.myCoins, reveal, false);
  }

  // Calls
  if (game.herCall !== null) {
    box(ctx, 128, 122, 46, 24, OUTLINE, 3);
    box(ctx, 129, 123, 44, 22, '#fffaf0', 3);
    text(ctx, t('chinos.she'), 151, 125, { size: 4, color: '#8a5a32', align: 'center' });
    text(ctx, String(game.herCall), 151, 131, { size: 10, color: '#c0392b', align: 'center' });
  }
  if (game.myCall !== null) {
    box(ctx, 128, 202, 46, 24, OUTLINE, 3);
    box(ctx, 129, 203, 44, 22, '#fffaf0', 3);
    text(ctx, t('chinos.you'), 151, 205, { size: 4, color: '#8a5a32', align: 'center' });
    text(ctx, String(game.myCall), 151, 211, { size: 10, color: '#2e7dc1', align: 'center' });
  }
  if (game.myCoins !== null && !reveal) {
    text(ctx, t('chinos.yourCoins', { n: game.myCoins }), 8, 206, { size: 4, color: '#3a2518' });
  }

  // Result of the round
  if (reveal && game.total !== undefined && game.phase === 'reveal') {
    const label = t('chinos.total', { n: game.total });
    text(ctx, label, W / 2, 162, { size: 8, color: '#ffffff', align: 'center', outline: OUTLINE });
    const res = t(`chinos.result.${game.winner}`);
    const size = fitSize(ctx, res, 170, 9);
    const color = game.winner === 'player' ? '#2ecc71' : game.winner === 'blanca' ? '#e74c3c' : '#f5c542';
    text(ctx, res, W / 2, 178, { size, color, align: 'center', outline: OUTLINE });
  }

  // Prompt and buttons
  const prompts = { pick: 'chinos.pick', call: 'chinos.call', thinking: 'chinos.thinking' };
  if (prompts[game.phase]) {
    const prompt = t(prompts[game.phase]);
    const size = fitSize(ctx, prompt, 170, 6);
    text(ctx, prompt, W / 2, 242, { size, color: '#3a2518', align: 'center' });
  }
  for (const b of game.buttons()) {
    ctx.globalAlpha = b.disabled ? 0.35 : 1;
    box(ctx, b.x, b.y, b.w, b.h, OUTLINE, 3);
    box(ctx, b.x + 1, b.y + 1, b.w - 2, b.h - 3, '#fffaf0', 3);
    rect(ctx, b.x + 1, b.y + b.h - 4, b.w - 2, 2, '#e8dcc4');
    if (game.phase === 'pick') {
      for (let i = 0; i < b.value; i++) coin(ctx, b.x + b.w / 2 - (b.value - 1) * 4.5 + i * 9, b.y + 15, 1);
      if (b.value === 0) rect(ctx, b.x + b.w / 2 - 6, b.y + 15, 12, 1.5, '#9aa3a8');
      text(ctx, String(b.value), b.x + b.w / 2, b.y + 28, { size: 9, color: '#3a2518', align: 'center' });
    } else {
      text(ctx, String(b.value), b.x + b.w / 2, b.y + 12, { size: 10, color: '#3a2518', align: 'center' });
    }
    ctx.globalAlpha = 1;
  }

  vignette(ctx);
  if (game.line) bubble(ctx, game.line.text, 90, 22);

  // Scoreboard
  const g = ctx.createLinearGradient(0, 0, 0, HUD_H);
  g.addColorStop(0, '#8a5a32');
  g.addColorStop(1, '#6e4426');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, HUD_H);
  rect(ctx, 0, HUD_H, W, 1, OUTLINE);
  text(ctx, `${t('chinos.you')} ${game.player}`, 6, 6, { size: 6, color: '#ffffff' });
  text(ctx, `${game.blanca} Blanca`, 160, 6, { size: 6, color: '#ffffff', align: 'right' });
  for (let i = 0; i < POINTS_TO_WIN; i++) {
    coin(ctx, 78 + i * 12, 9, 0.75);
  }
  rect(ctx, 165, 5.5, 3, 7, '#f5e6c8');
  rect(ctx, 170, 5.5, 3, 7, '#f5e6c8');

  if (game.over) {
    const k = Math.min(1, game.overTime / 0.6);
    ctx.globalAlpha = 0.45 * k;
    rect(ctx, 0, 0, W, H, '#2b1a10');
    ctx.globalAlpha = 1;
  }
}
