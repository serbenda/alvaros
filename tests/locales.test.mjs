import test from 'node:test';
import assert from 'node:assert/strict';

import en from '../src/core/locales/en.js';
import es from '../src/core/locales/es.js';

function keys(obj, prefix = '') {
  return Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' && !Array.isArray(v) ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`],
  );
}

test('English and Spanish have the same keys', () => {
  const a = keys(en);
  const b = keys(es);
  assert.deepEqual(a.filter((k) => !b.includes(k)), [], 'missing in Spanish');
  assert.deepEqual(b.filter((k) => !a.includes(k)), [], 'missing in English');
});

test('every mini-game has a title and an instruction in both languages', async () => {
  const { MINIGAME_IDS } = await import('../src/modes/minigames/run.js');
  for (const id of MINIGAME_IDS) {
    for (const lang of [en, es]) {
      assert.ok(lang.mini[id] && lang.mini[id].title && lang.mini[id].sub, `mini.${id}`);
    }
  }
});
