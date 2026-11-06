// The bar's sign, drawn on a canvas: used on the title screen and on the
// shareable score card.

/** The bar's sign: light wood, marquee bulbs and the name in red. */
export function drawLogo(c, now, scale = 4) {
  c.setTransform(scale, 0, 0, scale, 0, 0);
  c.clearRect(0, 0, 180, 60);
  const R = (x, y, w, h, color) => {
    c.fillStyle = color;
    c.fillRect(x, y, w, h);
  };
  // Hanging chains
  R(40, 0, 1, 8, '#5a4030');
  R(139, 0, 1, 8, '#5a4030');
  // Board
  R(6, 7, 168, 46, '#24160f');
  R(8, 9, 164, 42, '#d9a868');
  R(8, 9, 164, 2, '#ecc48d');
  R(8, 49, 164, 2, '#a8743e');
  R(13, 14, 154, 32, '#fffaf0');
  R(13, 14, 154, 1.5, '#efe9de');
  // Marquee bulbs
  const phase = Math.floor(now * 4);
  let i = 0;
  for (let x = 16; x <= 164; x += 6) {
    for (const y of [11.5, 47.5]) {
      const on = (i + phase) % 3 !== 0;
      R(x - 1, y - 1, 2, 2, on ? '#fff3b0' : '#a8743e');
      if (on) {
        c.globalAlpha = 0.35;
        R(x - 2, y - 2, 4, 4, '#ffe08a');
        c.globalAlpha = 1;
      }
      i++;
    }
  }
  // Coffee cup with steam
  R(20, 26, 14, 12, '#24160f');
  R(21, 27, 12, 10, '#ffffff');
  R(21, 27, 12, 2, '#6f3b1e');
  R(33, 29, 4, 6, '#24160f');
  R(34, 30, 2, 4, '#ffffff');
  R(18, 37, 18, 2, '#24160f');
  const s = Math.sin(now * 3);
  R(24 + s, 20, 1.5, 4, '#c9c9d4');
  R(29 - s, 18, 1.5, 5, '#c9c9d4');
  // Name
  c.font = '15px "Press Start 2P", monospace';
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillStyle = '#f0c9a0';
  c.fillText("ÁLVARO'S", 102, 32);
  c.fillStyle = '#c0392b';
  c.fillText("ÁLVARO'S", 101, 31);
  c.font = '5px "Press Start 2P", monospace';
  c.fillStyle = '#8a5a32';
  c.fillText('GASTROBAR', 101, 42);
}
