// User-facing text in English and Spanish. Code and docs stay in English.

import en from './locales/en.js';
import es from './locales/es.js';

const STRINGS = { en, es };

export const LANGUAGES = Object.keys(STRINGS);

let current = 'en';

export function detectLang() {
  const nav = (typeof navigator !== 'undefined' && navigator.language) || 'en';
  return nav.toLowerCase().startsWith('es') ? 'es' : 'en';
}

export function setLang(lang) {
  current = STRINGS[lang] ? lang : 'en';
}

export function getLang() {
  return current;
}

function lookup(table, key) {
  return key.split('.').reduce((obj, part) => (obj == null ? undefined : obj[part]), table);
}

/** Translates a dotted key. `{name}` placeholders are filled from `params`. */
export function t(key, params) {
  let value = lookup(STRINGS[current], key);
  if (value === undefined) value = lookup(STRINGS.en, key);
  if (value === undefined) return key;
  if (typeof value === 'string' && params) {
    return value.replace(/\{(\w+)\}/g, (_, name) => (params[name] !== undefined ? params[name] : ''));
  }
  return value;
}

/** Formats an amount of tips as money for the current language. */
export function money(amount) {
  return current === 'es' ? `${amount} €` : `€${amount}`;
}
