// Saves progress in the browser. Every access is guarded: storage can be
// unavailable (private mode, blocked site data) and the game must still work.

const KEY = 'alvaros.v1';

const DEFAULTS = {
  best: 0,
  totalTips: 0,
  plays: 0,
  daily: { date: '', best: 0 },
  album: {},
  staff: 'blanca',
  lang: null,
  muted: false,
};

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULTS);
    const saved = JSON.parse(raw);
    return { ...structuredClone(DEFAULTS), ...saved };
  } catch {
    return structuredClone(DEFAULTS);
  }
}

export function save(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Ignore: progress just won't persist.
  }
}
