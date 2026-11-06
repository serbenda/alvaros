// Draws the bar on a canvas already scaled to logical pixels (180x320).

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
import { STATIONS, MAX_STRIKES, STAFF, BOSS } from './config.js';
import { drawIcon, drawPerson, drawHeart, drawCoin } from './sprites.js';

export const FONT = '"Press Start 2P", ui-monospace, monospace';

const BOTTLES = ['#27ae60', '#8e44ad', '#c0392b', '#d4a017', '#16a085', '#7f8c8d', '#e67e22'];

function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function text(ctx, str, x, y, { size = 6, color = '#fff', align = 'left', outline = null } = {}) {
  ctx.font = `${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  if (outline) {
    ctx.fillStyle = outline;
    for (const [dx, dy] of [[-0.75, 0], [0.75, 0], [0, -0.75], [0, 0.75]]) ctx.fillText(str, x + dx, y + dy);
  }
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function drawBackground(ctx) {
  rect(ctx, 0, 0, W, COUNTER_Y, '#e7c38f');
  for (let x = 0; x < W; x += 12) rect(ctx, x, HUD_H, 1, COUNTER_Y - HUD_H, '#dcb47c');

  // Upper shelf with bottles
  for (let i = 0; i < 15; i++) {
    const x = 4 + i * 12;
    const h = 6 + ((i * 7) % 5);
    const color = BOTTLES[i % BOTTLES.length];
    rect(ctx, x, 46 - h, 4, h, color);
    rect(ctx, x + 1, 44 - h, 2, 2, color);
  }
  rect(ctx, 0, 46, W, 3, '#6b3f22');

  // Lower shelf with glasses
  for (let i = 0; i < 18; i++) rect(ctx, 3 + i * 10, 68, 5, 6, '#cfe8ef');
  rect(ctx, 0, 74, W, 3, '#6b3f22');

  // Sign
  rect(ctx, 50, 21, 80, 13, '#2b1d14');
  rect(ctx, 51, 22, 78, 11, '#3a271b');
  text(ctx, "ÁLVARO'S", W / 2, 24, { size: 7, color: '#f5c542', align: 'center' });
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
      top -= (1 - k) * 10;
      alpha = k;
    } else if (c.state === 'leave') {
      const k = Math.min(1, c.st / 0.7);
      top -= k * 8;
      alpha = 1 - k;
    } else {
      top += Math.round(Math.sin(now * 3 + c.seat * 1.7) * 0.6);
      const f = c.patience / c.maxPatience;
      if (f < 0.35) mood = 'worried';
      if (f < 0.2) dx = Math.sin(now * 40) * 0.7;
    }
    ctx.globalAlpha = alpha;
    drawPerson(ctx, c.look, SEAT_X[c.seat] + dx, top, { mood });
    ctx.globalAlpha = 1;
  }
}

function drawCounter(ctx) {
  rect(ctx, 0, COUNTER_Y, W, 4, '#d39a5f');
  rect(ctx, 0, COUNTER_Y + 4, W, COUNTER_H - 4, '#8b5a33');
  for (let x = 15; x < W; x += 30) rect(ctx, x, COUNTER_Y + 6, 1, COUNTER_H - 9, '#6e4426');
  rect(ctx, 0, FLOOR_Y - 2, W, 2, '#5a361d');
}

function drawBubbles(ctx, game) {
  for (const c of game.seats) {
    if (!c || c.state === 'leave') continue;
    const sx = SEAT_X[c.seat];
    const bw = c.order.length * 10 + 4;
    const bx = clamp(Math.round(sx - bw / 2), 1, W - bw - 1);
    const by = BUBBLE_Y;
    rect(ctx, bx - 1, by - 1, bw + 2, 16, '#2b1d14');
    rect(ctx, bx, by, bw, 14, '#fffaf0');
    rect(ctx, sx - 1, by + 14, 3, 2, '#fffaf0');
    rect(ctx, sx - 2, by + 15, 1, 1, '#2b1d14');
    rect(ctx, sx + 2, by + 15, 1, 1, '#2b1d14');
    c.order.forEach((id, k) => {
      const ix = bx + 3 + k * 10;
      ctx.globalAlpha = c.served[k] ? 0.25 : 1;
      drawIcon(ctx, id, ix, by + 3);
      ctx.globalAlpha = 1;
      if (c.served[k]) rect(ctx, ix, by + 11, 8, 1, '#27ae60');
    });

    const f = Math.max(0, c.patience / c.maxPatience);
    const color = f > 0.5 ? '#2ecc71' : f > 0.25 ? '#f1c40f' : '#e74c3c';
    rect(ctx, sx - 15, PATIENCE_Y, 30, 3, '#2b1d14');
    rect(ctx, sx - 14, PATIENCE_Y + 1, Math.round(28 * f), 1, color);
  }
}

function drawFloor(ctx) {
  rect(ctx, 0, FLOOR_Y, W, STATION_PANEL_Y - FLOOR_Y, '#4a3328');
  for (let y = FLOOR_Y + 8; y < STATION_PANEL_Y; y += 10) rect(ctx, 0, y, W, 1, '#3f2a20');
}

function drawBoss(ctx, game, now) {
  if (!game || game.boss.x <= -13) return;
  const top = STAFF_TOP - 4 + (game.boss.active ? Math.round(Math.sin(now * 2) * 0.6) : 0);
  drawPerson(ctx, BOSS.look, game.boss.x, top, { mood: 'neutral' });
  if (game.boss.active) {
    text(ctx, 'x2', game.boss.x, top - 9, { size: 5, color: '#f5c542', align: 'center', outline: '#2b1d14' });
  }
}

function drawPlayer(ctx, game, now) {
  const staff = game ? game.staff : STAFF[0];
  let x = W / 2 + Math.sin(now * 0.8) * 40;
  let top = STAFF_TOP;
  let mood = 'happy';
  if (game) {
    x = game.player.x;
    const walking = Math.abs(game.player.target - game.player.x) > 0.5;
    if (walking) top -= Math.round(Math.abs(Math.sin(now * 14)));
    if (game.multiplier >= 4) {
      for (let i = 0; i < 6; i++) {
        const fx = x - 8 + i * 3;
        const fh = 3 + Math.round(Math.abs(Math.sin(now * 12 + i * 1.3)) * 4);
        rect(ctx, Math.round(fx), top - 4 - fh, 2, fh, i % 2 ? '#ff6b35' : '#f5c542');
      }
    }
    if (game.strikes > 0 && game.shake > 0) mood = 'worried';
  }
  drawPerson(ctx, staff.look, x, top, { mood });
}

function drawSpeech(ctx, game) {
  if (!game.speech) return;
  ctx.font = `5px ${FONT}`;
  const w = Math.ceil(ctx.measureText(game.speech.text).width) + 6;
  const x = clamp(Math.round(game.player.x - w / 2), 2, W - w - 2);
  rect(ctx, x - 1, SPEECH_Y - 1, w + 2, 11, '#2b1d14');
  rect(ctx, x, SPEECH_Y, w, 9, '#fffaf0');
  text(ctx, game.speech.text, x + 3, SPEECH_Y + 2, { size: 5, color: '#2b1d14' });
}

function drawTray(ctx, game) {
  const cap = game ? game.trayCapacity : STAFF[0].trayCapacity;
  const first = traySlotRect(0, cap);
  const total = cap * TRAY.slot;
  rect(ctx, first.x - 4, TRAY.y + 2, total + 8, TRAY.h - 2, '#7f8c8d');
  rect(ctx, first.x - 3, TRAY.y + 3, total + 6, TRAY.h - 5, '#bdc3c7');
  for (let i = 0; i < cap; i++) {
    const r = traySlotRect(i, cap);
    if (game && i < game.tray.length) drawIcon(ctx, game.tray[i], r.x + 3, r.y + 4, 2);
    else rect(ctx, r.x + 6, r.y + 10, 10, 5, '#aab3b8');
  }
}

function drawStations(ctx, game, t) {
  rect(ctx, 0, STATION_PANEL_Y, W, H - STATION_PANEL_Y, '#2a1c15');
  rect(ctx, 0, STATION_PANEL_Y, W, 2, '#1a110c');
  const full = game && game.reservedSlots() >= game.trayCapacity;
  STATIONS.forEach((id, i) => {
    const r = stationRect(i);
    const s = game ? game.stations[id] : null;
    const busy = s && s.busy;
    rect(ctx, r.x, r.y, r.w, r.h, '#1a110c');
    rect(ctx, r.x + 1, r.y + 1, r.w - 2, r.h - 2, busy ? '#6d4a36' : '#5a3b2b');
    rect(ctx, r.x + 1, r.y + 1, r.w - 2, 2, '#7a5440');
    ctx.globalAlpha = full && !busy ? 0.45 : 1;
    drawIcon(ctx, id, r.x + r.w / 2 - 12, r.y + 6, 3);
    text(ctx, t(`items.${id}`), r.x + r.w / 2, r.y + r.h - 9, { size: 5, color: '#f5e6c8', align: 'center' });
    ctx.globalAlpha = 1;
    if (busy) {
      const f = Math.min(1, s.t / s.dur);
      rect(ctx, r.x + 4, r.y + r.h - 14, r.w - 8, 3, '#1a110c');
      rect(ctx, r.x + 5, r.y + r.h - 13, Math.round((r.w - 10) * f), 1, '#f5c542');
    }
    if (s && s.flash > 0) {
      ctx.globalAlpha = (s.flash / 0.3) * 0.5;
      rect(ctx, r.x, r.y, r.w, r.h, '#ffffff');
      ctx.globalAlpha = 1;
    }
  });
}

function drawHud(ctx, game, now) {
  rect(ctx, 0, 0, W, HUD_H, '#1d1410');
  rect(ctx, 0, HUD_H, W, 1, '#000');
  drawCoin(ctx, 4, 5);
  text(ctx, String(game.score), 14, 5, { size: 7, color: '#f5c542' });

  rect(ctx, 86, 5, 3, 8, '#f5e6c8');
  rect(ctx, 91, 5, 3, 8, '#f5e6c8');

  const m = Math.floor(game.clockMinutes());
  const clock = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
  text(ctx, clock, W - 4, 5, { size: 7, color: '#f5e6c8', align: 'right' });

  if (game.multiplier > 1) {
    const size = game.multiplier >= 4 && Math.sin(now * 10) > 0 ? 8 : 7;
    text(ctx, `x${game.multiplier}`, 4, 22, { size, color: '#ff9f43', outline: '#2b1d14' });
  }
  for (let i = 0; i < MAX_STRIKES; i++) drawHeart(ctx, W - 11 - i * 9, 23, i < MAX_STRIKES - game.strikes);
}

function drawFloats(ctx, game) {
  for (const f of game.floats) {
    const k = f.t / f.life;
    ctx.globalAlpha = k > 0.7 ? (1 - k) / 0.3 : 1;
    text(ctx, f.text, f.x, f.y - k * 12, { size: f.size, color: f.color, align: 'center', outline: '#1d1410' });
    ctx.globalAlpha = 1;
  }
}

/** Draws one frame. `game` can be null to draw the empty bar behind the menus. */
export function render(ctx, game, { t, now }) {
  ctx.save();
  if (game && game.shake > 0) ctx.translate(Math.round((Math.random() - 0.5) * 3), Math.round((Math.random() - 0.5) * 3));
  drawBackground(ctx);
  if (game) drawCustomers(ctx, game, now);
  drawCounter(ctx);
  if (game) drawBubbles(ctx, game);
  drawFloor(ctx);
  drawBoss(ctx, game, now);
  drawPlayer(ctx, game, now);
  drawTray(ctx, game);
  drawStations(ctx, game, t);
  if (game) {
    drawHud(ctx, game, now);
    drawSpeech(ctx, game);
    drawFloats(ctx, game);
  }
  ctx.restore();
}
