// Draws a run of mini-games: the current game, its intro and result, the
// speed-up screen and the top bar.

import { W, H } from '../../core/layout.js';
import { drawHeart, OUTLINE } from '../../graphics/sprites.js';
import { rect, box, text, fitSize, wrap, person, vignette } from '../../graphics/draw.js';
import { LOOKS } from './scenes.js';
import { LIVES, HUD_H } from './run.js';

function drawHud(ctx, run, now) {
  const g = ctx.createLinearGradient(0, 0, 0, HUD_H);
  g.addColorStop(0, '#8a5a32');
  g.addColorStop(1, '#6e4426');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, HUD_H);
  rect(ctx, 0, HUD_H, W, 1, OUTLINE);
  for (let i = 0; i < LIVES; i++) drawHeart(ctx, 4 + i * 9, 5.5, i < run.lives);
  box(ctx, 66, 3, 48, 12, 'rgba(0,0,0,0.35)', 2);
  const bump = 1 + run.bump * 1.2;
  ctx.save();
  ctx.translate(90, 9);
  ctx.scale(bump, bump);
  text(ctx, String(run.score), 0, -3.5, { size: 7, color: '#f5c542', align: 'center' });
  ctx.restore();
  rect(ctx, 165, 5.5, 3, 7, '#f5e6c8');
  rect(ctx, 170, 5.5, 3, 7, '#f5e6c8');
  text(ctx, `x${run.speed.toFixed(2).replace(/0$/, '')}`, 158, 6.5, { size: 5, color: '#ffd9b0', align: 'right' });
  // Time left
  if (run.phase === 'play' || run.phase === 'result') {
    const left = run.timeLeft();
    const hurry = left < 0.3 && run.phase === 'play' && Math.sin(now * 16) > 0;
    rect(ctx, 0, HUD_H + 1, W, 4, '#3a2a20');
    rect(ctx, 0, HUD_H + 1, W * left, 4, hurry ? '#ffffff' : left < 0.3 ? '#e74c3c' : '#2ecc71');
  }
}

function drawIntro(ctx, run, t) {
  const k = Math.min(1, run.pt / 0.25);
  // Mustard curtain sliding away to reveal the next scene
  const wipe = Math.min(1, run.pt / 0.3);
  if (wipe < 1) {
    const e = wipe * wipe;
    rect(ctx, -e * W * 1.2, 0, W * 1.2, H, '#e8c21c');
    rect(ctx, -e * W * 1.2 + W * 1.2 - 4, 0, 4, H, '#b8930a');
  }
  ctx.globalAlpha = 0.55 * k;
  rect(ctx, 0, 0, W, H, '#2b1a10');
  ctx.globalAlpha = 1;
  const who = run.def.who;
  if (LOOKS[who]) person(ctx, LOOKS[who], 90, 70 - (1 - k) * 20, 2.4, { mood: 'happy', legs: who === 'boss' });
  const title = t(`mini.${run.def.id}.title`);
  const y = 170;
  const pop = k < 1 ? 0.6 + k * 0.5 : 1 + Math.sin(run.pt * 10) * 0.03;
  ctx.save();
  ctx.translate(W / 2, y);
  ctx.scale(pop, pop);
  box(ctx, -86, -16, 172, 32, OUTLINE, 4);
  box(ctx, -85, -15, 170, 30, '#e8c21c', 4);
  const size = fitSize(ctx, title, 160, 10);
  text(ctx, title, 0, -size / 2, { size, color: '#ffffff', align: 'center', outline: '#7a4a10' });
  ctx.restore();
  const lines = wrap(ctx, t(`mini.${run.def.id}.sub`), 160, 6);
  lines.forEach((line, i) => text(ctx, line, W / 2, 200 + i * 10, { size: 6, color: '#fffaf0', align: 'center', outline: OUTLINE }));
}

function drawResult(ctx, run, t) {
  const win = run.result === 'win';
  const k = Math.min(1, run.pt / 0.2);
  const pop = k < 1 ? 0.4 + k * 0.8 : 1.2 - Math.min(0.2, (run.pt - 0.2) * 0.6);
  ctx.save();
  ctx.translate(W / 2, 150);
  ctx.scale(pop, pop);
  const label = win ? t('mini.good') : t('mini.bad');
  const size = fitSize(ctx, label, 170, 16);
  text(ctx, label, 0, -size / 2, { size, color: win ? '#2ecc71' : '#e74c3c', align: 'center', outline: OUTLINE });
  ctx.restore();
  if (win && run.closeCall) {
    text(ctx, t('mini.closeCall'), W / 2, 172, { size: 7, color: '#f5c542', align: 'center', outline: OUTLINE });
  } else if (win && run.streak >= 3) {
    text(ctx, t('mini.streak', { n: run.streak }), W / 2, 172, { size: 7, color: '#ff9f43', align: 'center', outline: OUTLINE });
  }
}

function drawSpeedup(ctx, run, t, now) {
  rect(ctx, 0, 0, W, H, '#e8c21c');
  for (let i = 0; i < 14; i++) {
    const y = (i * 37 + now * 400) % H;
    rect(ctx, 0, y, W, 2, '#f5d75a');
  }
  person(ctx, LOOKS.boss, 90, 70, 2.2, { mood: 'happy', legs: true });
  const label = t('mini.faster');
  const size = fitSize(ctx, label, 168, 14);
  const pop = 1 + Math.sin(now * 12) * 0.06;
  ctx.save();
  ctx.translate(W / 2, 200);
  ctx.scale(pop, pop);
  text(ctx, label, 0, -size / 2, { size, color: '#ffffff', align: 'center', outline: '#7a4a10' });
  ctx.restore();
  text(ctx, `x${run.speed.toFixed(2)}`, W / 2, 230, { size: 8, color: '#7a4a10', align: 'center' });
}

/** Keeps the instruction on screen during a beginner's first mini-games. */
function drawGuide(ctx, run, t, now) {
  const lines = wrap(ctx, t(`mini.${run.def.id}.sub`), 164, 6);
  const h = lines.length * 9 + 8;
  const y = H - h - 4 + Math.sin(now * 3) * 1;
  ctx.globalAlpha = 0.9;
  box(ctx, 6, y, W - 12, h, OUTLINE, 3);
  box(ctx, 7, y + 1, W - 14, h - 2, '#e8c21c', 3);
  ctx.globalAlpha = 1;
  lines.forEach((line, i) => text(ctx, line, W / 2, y + 5 + i * 9, { size: 6, color: '#3a2416', align: 'center' }));
}

/** Draws one frame of a mini-games run. */
export function renderMini(ctx, run, { t, now }) {
  ctx.save();
  if (run.shake > 0) ctx.translate((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4);
  if (run.phase === 'speedup') {
    drawSpeedup(ctx, run, t, now);
  } else {
    run.game.draw(ctx, now, run, t);
    vignette(ctx);
    if (run.phase === 'play' && run.guided()) drawGuide(ctx, run, t, now);
    if (run.phase === 'intro') drawIntro(ctx, run, t);
    if (run.phase === 'result') drawResult(ctx, run, t);
  }
  for (const c of run.confetti) {
    ctx.globalAlpha = c.t > c.life * 0.8 ? (c.life - c.t) / (c.life * 0.2) : 1;
    rect(ctx, c.x, c.y, 2, 1.5, c.color);
  }
  ctx.globalAlpha = 1;
  drawHud(ctx, run, now);
  if (run.over) {
    const k = Math.min(1, run.overTime / 0.5);
    ctx.globalAlpha = 0.6 * k;
    rect(ctx, 0, 0, W, H, '#2b1a10');
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}
