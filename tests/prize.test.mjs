import test from 'node:test';
import assert from 'node:assert/strict';
import { makeCode, readCode, dayNumber } from '../src/core/prize.js';

const date = new Date(2026, 10, 6, 21, 0);

test('a code reads back as the same mode, score and day', () => {
  const code = makeCode('mini', 14, date);
  assert.match(code, /^M14-[2-9A-Z]{3}-[2-9A-Z]{3}$/);
  const read = readCode(code);
  assert.equal(read.mode, 'mini');
  assert.equal(read.score, 14);
  assert.equal(read.day, dayNumber(date));
  assert.equal(read.date.getDate(), 6);
});

test('codes are read without dashes and in lower case', () => {
  const code = makeCode('rush', 320, date);
  assert.equal(readCode(code.replace(/-/g, '').toLowerCase()).score, 320);
});

test('editing the score or the day makes the code invalid', () => {
  const code = makeCode('mini', 14, date);
  assert.equal(readCode(code.replace('M14', 'M41')), null);
  assert.equal(readCode(code.replace('M14', 'R14')), null);
  const parts = code.split('-');
  const otherDay = makeCode('mini', 14, new Date(2026, 10, 7)).split('-')[1];
  assert.equal(readCode(`${parts[0]}-${otherDay}-${parts[2]}`), null);
});

test('no code for modes without prizes or for zero', () => {
  assert.equal(makeCode('chinos', 3, date), null);
  assert.equal(makeCode('mini', 0, date), null);
  assert.equal(readCode('hello'), null);
});
