// Counts games played with GoatCounter, the visit counter used by every game on
// bendi.dev. Only anonymous page paths are sent: no cookies and no personal data.
// If the counter script is blocked or has not loaded, nothing happens.

function count(path, title) {
  try {
    globalThis.goatcounter?.count?.({ path, title, event: true });
  } catch {
    // Counting must never break the game.
  }
}

/** A game started: counted as a match, and per game mode. */
export function trackGameStart(mode) {
  count('partida/alvaros', 'Partida empezada');
  count(`partida/alvaros/${mode}`, `Partida empezada: ${mode}`);
}

/** The share button was used. */
export function trackShare(mode) {
  count(`compartir/alvaros/${mode}`, `Compartido: ${mode}`);
}

export function trackSponsor() { count('sponsor/alvaros', 'Café para el creador'); }
