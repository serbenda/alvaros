// Screen layout in logical pixels. The canvas is drawn at 180x320 and scaled up.

export const W = 180;
export const H = 320;

export const HUD_H = 18;
export const SEAT_X = [24, 68, 112, 156];
export const BUBBLE_Y = 33;
export const PATIENCE_Y = 52;
export const CUSTOMER_TOP = 60;
export const COUNTER_Y = 84;
export const COUNTER_H = 20;
export const FLOOR_Y = COUNTER_Y + COUNTER_H;
export const STAFF_TOP = 120;
export const BOSS_X = 13;
export const SPEECH_Y = 104;

export const TRAY = { y: 170, slot: 22, h: 24 };
export const STATION_PANEL_Y = 200;
export const STATION_GRID = { x: 6, y: 206, w: 52, h: 48, gap: 6, cols: 3 };

export function traySlotRect(i, capacity) {
  const total = capacity * TRAY.slot;
  const x0 = Math.round(W / 2 - total / 2);
  return { x: x0 + i * TRAY.slot, y: TRAY.y, w: TRAY.slot, h: TRAY.h };
}

export function stationRect(i) {
  const g = STATION_GRID;
  const col = i % g.cols;
  const row = Math.floor(i / g.cols);
  return { x: g.x + col * (g.w + g.gap), y: g.y + row * (g.h + g.gap), w: g.w, h: g.h };
}

export function inside(r, x, y) {
  return x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;
}

/** Returns the seat index under (x, y), or -1. */
export function seatAt(x, y) {
  if (y < BUBBLE_Y - 8 || y > FLOOR_Y) return -1;
  for (let i = 0; i < SEAT_X.length; i++) {
    if (Math.abs(x - SEAT_X[i]) <= 22) return i;
  }
  return -1;
}
