// Stickers: small achievements players collect, shown in the album.
// Each sticker has an icon and a rule that receives the event and the saved state.

import { WEEK } from '../config.js';
import { MINIGAME_IDS } from '../modes/minigames/run.js';

export const STICKERS = [
  { id: 'first', icon: '⭐', when: (e) => e.type === 'miniWin' },
  { id: 'ten', icon: '🔟', when: (e) => e.type === 'miniWin' && e.data.score >= 10 },
  { id: 'twentyfive', icon: '🏆', when: (e) => e.type === 'miniWin' && e.data.score >= 25 },
  { id: 'streak', icon: '🔥', when: (e) => e.type === 'miniWin' && e.data.streak >= 5 },
  { id: 'closeCall', icon: '😅', when: (e) => e.type === 'miniWin' && e.data.closeCall },
  { id: 'beer', icon: '🍺', when: (e) => e.type === 'miniWin' && e.data.id === 'pour' },
  { id: 'tortilla', icon: '🍳', when: (e) => e.type === 'miniWin' && e.data.id === 'tortilla' },
  { id: 'watch', icon: '⌚', when: (e) => e.type === 'miniWin' && e.data.id === 'watch' },
  { id: 'boss', icon: '🙈', when: (e) => e.type === 'miniWin' && e.data.id === 'hide' },
  { id: 'all', icon: '🎖️', when: (e, s) => MINIGAME_IDS.every((id) => s.miniWon && s.miniWon[id]) },
  { id: 'fast', icon: '⚡', when: (e) => e.type === 'speedup' && e.data.speed >= 1.6 },
  { id: 'chinos', icon: '🪙', when: (e, s) => e.type === 'chinosWon' && (s.chinosWins || 0) >= 1 },
  { id: 'chinos5', icon: '💰', when: (e, s) => e.type === 'chinosWon' && (s.chinosWins || 0) >= 5 },
  { id: 'week', icon: '📅', when: (e, s) => Array.isArray(s.weekStars) && s.weekStars.length === WEEK.length && s.weekStars.every((n) => n > 0) },
];

/**
 * Checks every sticker against an event and the saved state.
 * Marks new ones in `state.stickers` and returns them.
 */
export function checkStickers(event, state) {
  if (event.type === 'miniWin' && event.data.id) {
    state.miniWon = state.miniWon || {};
    state.miniWon[event.data.id] = true;
  }
  state.stickers = state.stickers || {};
  const earned = [];
  for (const sticker of STICKERS) {
    if (state.stickers[sticker.id]) continue;
    if (sticker.when(event, state)) {
      state.stickers[sticker.id] = true;
      earned.push(sticker);
    }
  }
  return earned;
}
