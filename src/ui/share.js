// Shareable score card: a square image with the bar's sign, Blanca, the score
// and the link, ready for WhatsApp or Instagram.

import { drawPerson } from '../graphics/sprites.js';
import { drawLogo } from './logo.js';

/** Builds a square score card image: the sign, Blanca, the score and the link. */
export function makeCard({ text, label, score, look }) {
  const S = 4;
  const size = 270;
  const c = document.createElement('canvas');
  c.width = size * S;
  c.height = size * S;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;
  g.setTransform(S, 0, 0, S, 0, 0);
  // Background: the bar's wall, brick strip and wooden floor
  g.fillStyle = '#fdf9f1';
  g.fillRect(0, 0, size, size);
  g.fillStyle = '#aaa49b';
  g.fillRect(0, 150, size, 40);
  g.fillStyle = '#8b857c';
  for (let y = 150; y < 190; y += 5) g.fillRect(0, y, size, 0.6);
  g.fillStyle = '#cf8e5c';
  g.fillRect(0, 190, size, 80);
  g.fillStyle = '#dcae74';
  g.fillRect(0, 186, size, 5);
  // Sign
  const sign = document.createElement('canvas');
  sign.width = 720;
  sign.height = 240;
  drawLogo(sign.getContext('2d'), 0.2, 4);
  g.drawImage(sign, 45, 6, 180, 60);
  // Blanca, big and happy
  g.save();
  g.translate(64, 98);
  g.scale(3.2, 3.2);
  drawPerson(g, look, 0, 0, { mood: 'happy', legs: true });
  g.restore();
  // Score
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = '7px "Press Start 2P", monospace';
  g.fillStyle = '#8a5a32';
  g.fillText(label, 178, 96);
  g.font = '30px "Press Start 2P", monospace';
  g.fillStyle = '#e9b820';
  g.fillText(String(score), 180, 128);
  g.fillStyle = '#c0392b';
  g.fillText(String(score), 178, 126);
  // Challenge line and link
  g.fillStyle = 'rgba(36,22,15,0.85)';
  g.fillRect(0, 222, size, 48);
  g.font = '7px "Press Start 2P", monospace';
  g.fillStyle = '#fffaf0';
  const words = text.split(' ');
  let line = '';
  const lines = [];
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (g.measureText(test).width > 250 && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  lines.push(line);
  lines.slice(0, 2).forEach((l, i) => g.fillText(l, size / 2, 234 + i * 11));
  g.font = '6px "Press Start 2P", monospace';
  g.fillStyle = '#f8d75a';
  g.fillText(location.host + location.pathname.replace(/index\.html$/, ''), size / 2, 260);
  return c;
}

/**
 * Shares the card as an image when the device supports it (phones), or as a
 * link otherwise; on desktop it downloads the card and copies the text.
 * Returns 'copied' when the text was copied to the clipboard.
 */
export async function shareCard({ title, text, label, score, look, url }) {
  const card = makeCard({ text, label, score, look });
  const blob = await new Promise((resolve) => card.toBlob(resolve, 'image/png'));
  const file = blob && new File([blob], 'alvaros.png', { type: 'image/png' });
  if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
    await navigator.share({ files: [file], title, text: `${text} ${url}` });
    return 'shared';
  }
  if (navigator.share) {
    await navigator.share({ title, text, url });
    return 'shared';
  }
  if (blob) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'alvaros.png';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  await navigator.clipboard.writeText(`${text} ${url}`);
  return 'copied';
}
