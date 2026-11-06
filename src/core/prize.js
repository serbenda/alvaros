// Prize codes: a short code shown at the end of a game that the bar staff can
// check on verify.html, with no server. The code carries the mode, the score
// and the day, plus a check that changes completely if any of them is edited.
// It stops casual cheating (typing a made-up score), not a determined one:
// the rules are in public code.

const ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // no 0/O or 1/I, easy to read aloud
const MODES = { mini: 'M', rush: 'R', daily: 'D' };
const EPOCH = Date.UTC(2026, 0, 1);
const DAY = 86400000;
const SALT = 'alvaros-gastrobar';

function hash(text) {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

function encode(n, width) {
  let out = '';
  for (let i = 0; i < width; i++) {
    out = ALPHABET[n % 32] + out;
    n = Math.floor(n / 32);
  }
  return out;
}

function decode(text) {
  let n = 0;
  for (const ch of text) {
    const v = ALPHABET.indexOf(ch);
    if (v < 0) return -1;
    n = n * 32 + v;
  }
  return n;
}

/** Day number since 1 January 2026, in local time. */
export function dayNumber(date = new Date()) {
  const local = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.floor((local - EPOCH) / DAY);
}

/** The date for a day number. */
export function dayDate(day) {
  const d = new Date(EPOCH + day * DAY);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/** Whether a mode gives prize codes. */
export function hasPrize(mode) {
  return mode in MODES;
}

/** Makes a code like "M14-2KD-7QX" for a score, or null for modes without codes. */
export function makeCode(mode, score, date = new Date()) {
  const letter = MODES[mode];
  if (!letter || !(score > 0)) return null;
  const day = encode(dayNumber(date), 3);
  const check = encode(hash(`${SALT}|${letter}|${score}|${day}`) % 32768, 3);
  return `${letter}${score}-${day}-${check}`;
}

/** Reads a code typed by the staff. Returns { mode, score, date } or null if it is not valid. */
export function readCode(input) {
  const code = String(input || '').toUpperCase().replace(/[^0-9A-Z]/g, '');
  const m = code.match(/^([MRD])(\d{1,5})([2-9A-Z]{3})([2-9A-Z]{3})$/);
  if (!m) return null;
  const [, letter, digits, day, check] = m;
  const score = Number(digits);
  if (String(score) !== digits) return null;
  if (encode(hash(`${SALT}|${letter}|${score}|${day}`) % 32768, 3) !== check) return null;
  const mode = Object.keys(MODES).find((k) => MODES[k] === letter);
  const dayN = decode(day);
  if (dayN < 0) return null;
  return { mode, score, day: dayN, date: dayDate(dayN) };
}
