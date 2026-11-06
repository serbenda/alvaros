// Drawing primitives shared by every mode. All coordinates are logical pixels
// (the canvas is scaled so the screen is 180x320 logical pixels).

import { W, H } from '../core/layout.js';
import { drawPerson, OUTLINE } from './sprites.js';

export const FONT = '"Press Start 2P", ui-monospace, monospace';

export function rect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

/** Pixel-style rounded box: a rectangle with its corners cut off. */
export function box(ctx, x, y, w, h, color, radius = 1) {
  ctx.fillStyle = color;
  ctx.fillRect(x + radius, y, w - radius * 2, h);
  ctx.fillRect(x, y + radius, w, h - radius * 2);
}

/** Outline of a rectangle, `t` pixels thick. */
export function outline(ctx, x, y, w, h, color, t = 1) {
  rect(ctx, x, y, w, t, color);
  rect(ctx, x, y + h - t, w, t, color);
  rect(ctx, x, y, t, h, color);
  rect(ctx, x + w - t, y, t, h, color);
}

/** Text with optional outline and drop shadow, aligned to the top. */
export function text(ctx, str, x, y, { size = 6, color = '#fff', align = 'left', outline: stroke = null, shadow = null } = {}) {
  ctx.font = `${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  if (shadow) {
    ctx.fillStyle = shadow;
    ctx.fillText(str, x + 0.75, y + 0.75);
  }
  if (stroke) {
    ctx.fillStyle = stroke;
    const o = size > 7 ? 1 : 0.75;
    for (const [dx, dy] of [[-o, 0], [o, 0], [0, -o], [0, o], [-o, -o], [o, o], [-o, o], [o, -o]]) {
      ctx.fillText(str, x + dx, y + dy);
    }
  }
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
}

/** Largest font size (up to `max`) at which the text fits in `width`. */
export function fitSize(ctx, str, width, max) {
  let size = max;
  ctx.font = `${size}px ${FONT}`;
  while (size > 4 && ctx.measureText(str).width > width) {
    size -= 0.5;
    ctx.font = `${size}px ${FONT}`;
  }
  return size;
}

/** Splits text into lines no wider than `width`. */
export function wrap(ctx, str, width, size) {
  ctx.font = `${size}px ${FONT}`;
  const lines = [];
  let line = '';
  for (const word of str.split(' ')) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > width && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

export const easeInOut = (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);

/** A soft radial light. */
export function glow(ctx, x, y, radius, color, alpha) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
  g.addColorStop(0, color);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalAlpha = alpha;
  ctx.fillStyle = g;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  ctx.globalAlpha = 1;
}

/** Darkens the edges of the screen slightly. */
export function vignette(ctx) {
  const v = ctx.createRadialGradient(W / 2, H / 2, 90, W / 2, H / 2, 210);
  v.addColorStop(0, 'rgba(0,0,0,0)');
  v.addColorStop(1, 'rgba(60,30,10,0.28)');
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, W, H);
}

/** Draws a person at any scale. */
export function person(ctx, look, x, y, scale = 1, opts = {}) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  drawPerson(ctx, look, 0, 0, opts);
  ctx.restore();
}

/** Speech bubble centred on `cx`, with its tail pointing down. */
export function bubble(ctx, str, cx, y, color = '#fffaf0') {
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

/** Four-pointed sparkle. */
export function sparkle(ctx, x, y, size, color = '#ffffff') {
  rect(ctx, x - size, y - 0.4, size * 2, 0.8, color);
  rect(ctx, x - 0.4, y - size, 0.8, size * 2, color);
}
