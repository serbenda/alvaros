import test from 'node:test';
import assert from 'node:assert/strict';
import { STICKERS, checkStickers } from '../src/ui/stickers.js';
import { MINIGAME_IDS } from '../src/modes/minigames/run.js';

test('every sticker has a unique id and an icon', () => {
  const ids = STICKERS.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const s of STICKERS) assert.ok(s.icon);
});

test('a sticker is earned once', () => {
  const state = {};
  const first = checkStickers({ type: 'miniWin', data: { id: 'pour', score: 1, streak: 1 } }, state);
  assert.deepEqual(first.map((s) => s.id).sort(), ['beer', 'first']);
  const again = checkStickers({ type: 'miniWin', data: { id: 'pour', score: 2, streak: 2 } }, state);
  assert.equal(again.length, 0);
});

test('winning every mini-game earns the all-rounder sticker', () => {
  const state = {};
  let earned = [];
  for (const id of MINIGAME_IDS) earned = earned.concat(checkStickers({ type: 'miniWin', data: { id, score: 1 } }, state));
  assert.ok(earned.some((s) => s.id === 'all'));
});

test('chinos stickers follow the number of wins', () => {
  const state = { chinosWins: 1 };
  assert.deepEqual(checkStickers({ type: 'chinosWon', data: {} }, state).map((s) => s.id), ['chinos']);
  state.chinosWins = 5;
  assert.deepEqual(checkStickers({ type: 'chinosWon', data: {} }, state).map((s) => s.id), ['chinos5']);
});
