import test from 'node:test';
import assert from 'node:assert/strict';

import { MiniRun, MINIGAME_IDS, LIVES } from '../src/modes/minigames/run.js';
import { ChinosGame, blancaGuess, MAX_COINS, POINTS_TO_WIN } from '../src/modes/chinos/chinos.js';
import { t } from '../src/core/i18n.js';

function step(run, seconds, dt = 0.05) {
  for (let s = 0; s < seconds; s += dt) run.update(dt);
}

test('every mini-game runs to an end without input', () => {
  for (const id of MINIGAME_IDS) {
    const run = new MiniRun({ t, only: id });
    step(run, 12);
    assert.ok(run.score + (LIVES - run.lives) >= 1, `${id} never finished`);
  }
});

test('losing every mini-game ends the run after all lives', () => {
  const events = [];
  const run = new MiniRun({ t, onEvent: (type) => events.push(type) });
  step(run, 120);
  assert.equal(run.over, true);
  assert.equal(run.lives, 0);
  assert.ok(events.includes('gameover'));
});

test('winning speeds the run up', () => {
  const run = new MiniRun({ t, only: 'calm' });
  for (let i = 0; i < 4; i++) {
    step(run, 1.5);
    for (let k = 0; k < 20; k++) run.down(90, 200);
    step(run, 2.5);
  }
  assert.ok(run.score >= 4);
  assert.ok(run.speed > 1);
});

test('the coffee mini-game is won when tapping with the cup under the spout', () => {
  const run = new MiniRun({ t, only: 'coffee' });
  step(run, 1.5);
  run.game.x = 90;
  run.down(90, 200);
  assert.equal(run.game.result, 'win');
});

test('Blanca never repeats the call and stays within possible totals', () => {
  for (let own = 0; own <= MAX_COINS; own++) {
    for (let call = 0; call <= MAX_COINS * 2; call++) {
      const g = blancaGuess(own, call);
      assert.notEqual(g, call);
      assert.ok(g >= own && g <= own + MAX_COINS);
    }
    const first = blancaGuess(own, null);
    assert.ok(first >= own && first <= own + MAX_COINS);
  }
});

test('a chinos match ends when someone reaches the points to win', () => {
  const events = [];
  const game = new ChinosGame({ t, onEvent: (type) => events.push(type) });
  for (let i = 0; i < 200 && !game.over; i++) {
    const buttons = game.buttons().filter((b) => !b.disabled);
    if (buttons.length) {
      const b = buttons[0];
      game.down(b.x + 1, b.y + 1);
    }
    game.update(0.5);
  }
  assert.equal(game.over, true);
  assert.ok(game.player === POINTS_TO_WIN || game.blanca === POINTS_TO_WIN);
  assert.ok(events.includes('gameover'));
});
