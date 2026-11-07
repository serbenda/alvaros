// "Buy the creator a coffee": a pixel-art cup that fills up when tapped and
// then opens GitHub Sponsors. Drawn on its own small canvas.

export const SPONSOR_URL = 'https://github.com/sponsors/serbenda';

const OUTLINE = '#3b2416';

/**
 * Animates the cup on `canvas` (logical 48x48). The first tap pours the coffee;
 * when the cup is full `onFull` is called once.
 */
export function mountCoffee(canvas, onFull) {
  const ctx = canvas.getContext('2d');
  const s = canvas.width / 48;
  let fill = 0;
  let pouring = false;
  let done = false;
  let hearts = [];
  let last = performance.now();

  const R = (x, y, w, h, c) => {
    ctx.fillStyle = c;
    ctx.fillRect(x, y, w, h);
  };

  function pour() {
    if (pouring || done) return;
    pouring = true;
  }

  function frame(now) {
    if (!canvas.isConnected) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (canvas.offsetParent !== null) {
      if (pouring && !done) {
        fill = Math.min(1, fill + dt * 0.9);
        if (fill >= 1) {
          done = true;
          for (let i = 0; i < 6; i++) hearts.push({ x: 14 + Math.random() * 20, y: 18, vy: -12 - Math.random() * 10, t: 0 });
          setTimeout(() => onFull && onFull(), 450);
        }
      }
      draw(now / 1000);
      hearts = hearts.filter((h) => (h.t += dt) < 1.4);
      for (const h of hearts) h.y += h.vy * dt;
    }
    requestAnimationFrame(frame);
  }

  function draw(t) {
    ctx.setTransform(s, 0, 0, s, 0, 0);
    ctx.clearRect(0, 0, 48, 48);
    const bob = done ? 0 : Math.round(Math.sin(t * 3) * 0.6);
    // Saucer
    R(6, 42, 36, 3, OUTLINE);
    R(7, 42, 34, 2, '#fffaf0');
    // Cup
    const top = 20 + bob;
    R(10, top, 26, 22, OUTLINE);
    R(11, top + 1, 24, 20, '#fffaf0');
    R(11, top + 1, 3, 20, '#ffffff');
    // Coffee inside, rising with the fill level
    const level = Math.round(17 * fill);
    if (level > 0) {
      R(12, top + 19 - level, 22, level, '#6b3f1d');
      R(12, top + 19 - level, 22, 2, '#c8915a');
    }
    // Handle
    R(36, top + 5, 6, 11, OUTLINE);
    R(37, top + 7, 3, 7, '#fffaf0');
    // Stripe in the bar's mustard
    R(11, top + 15, 24, 2, '#e8c21c');
    // Stream from above while pouring
    if (pouring && !done) {
      R(21, 0, 4, top + 19 - level, '#6b3f1d');
      R(22, 0, 1, top + 19 - level, '#8a5a32');
    }
    // Steam
    if (fill > 0.3 || !pouring) {
      ctx.globalAlpha = done ? 0.8 : 0.45;
      for (let i = 0; i < 3; i++) {
        const y = top - 4 - ((t * 10 + i * 6) % 14);
        R(15 + i * 7 + Math.round(Math.sin(t * 4 + i) * 1.5), y, 2, 4, '#ffffff');
      }
      ctx.globalAlpha = 1;
    }
    // Hearts when it is full
    for (const h of hearts) {
      ctx.globalAlpha = Math.max(0, 1 - h.t / 1.4);
      const x = Math.round(h.x);
      const y = Math.round(h.y);
      R(x, y, 2, 2, '#ea4aaa');
      R(x + 3, y, 2, 2, '#ea4aaa');
      R(x - 1, y + 1, 7, 2, '#ea4aaa');
      R(x, y + 3, 5, 1, '#ea4aaa');
      R(x + 1, y + 4, 3, 1, '#ea4aaa');
      ctx.globalAlpha = 1;
    }
  }

  requestAnimationFrame(frame);
  return {
    pour,
    reset() {
      fill = 0;
      pouring = false;
      done = false;
      hearts = [];
    },
  };
}
