// Run with: node --test tests/
import test from 'node:test';
import assert from 'node:assert/strict';

import { Game, ENTER_TIME } from '../js/game.js';
import { STAFF, STATIONS, ITEMS, MAX_STRIKES, BOSS, WEEK } from '../js/config.js';
import { t } from '../js/i18n.js';
import { mulberry32 } from '../js/rng.js';

function newGame(overrides = {}) {
  const events = [];
  const game = new Game({
    staff: STAFF[0],
    t,
    rng: mulberry32(42),
    onEvent: (type, data) => events.push({ type, data }),
    ...overrides,
  });
  return { game, events };
}

function run(game, seconds, step = 0.05) {
  for (let s = 0; s < seconds; s += step) game.update(step);
}

test('a customer arrives at an empty bar', () => {
  const { game } = newGame();
  run(game, 1.5);
  assert.ok(game.seats.some(Boolean));
});

test('preparing an item puts it on the tray', () => {
  const { game } = newGame();
  game.tapStation(STATIONS.indexOf('coffee'));
  assert.equal(game.stations.coffee.busy, true);
  run(game, ITEMS.coffee.prep + 0.1);
  assert.deepEqual(game.tray, ['coffee']);
});

test('the tray cannot hold more than its capacity', () => {
  const { game, events } = newGame();
  for (let i = 0; i < STATIONS.length; i++) game.tapStation(i);
  const busy = STATIONS.filter((id) => game.stations[id].busy).length;
  assert.equal(busy, STAFF[0].trayCapacity);
  assert.ok(events.some((e) => e.type === 'nope'));
});

test('serving a full order pays a tip and builds the combo', () => {
  const { game, events } = newGame();
  const c = game.spawn();
  run(game, ENTER_TIME + 0.05);
  game.tray = [...c.order];
  game.tapSeat(c.seat);
  assert.equal(c.state, 'enjoy');
  assert.ok(game.score > 0);
  assert.equal(game.combo, 1);
  assert.ok(events.some((e) => e.type === 'complete'));
});

test('a customer who runs out of patience costs a strike', () => {
  const { game } = newGame();
  const c = game.spawn();
  run(game, ENTER_TIME + c.maxPatience + 1);
  assert.ok(game.strikes >= 1);
  assert.equal(game.combo, 0);
});

test('the shift ends after too many strikes', () => {
  const { game, events } = newGame();
  run(game, 120);
  assert.equal(game.over, true);
  assert.equal(game.strikes, MAX_STRIKES);
  assert.ok(events.some((e) => e.type === 'gameover'));
});

test('the boss doubles tips while he is around', () => {
  const { game } = newGame();
  const normal = game.tipFactor();
  game.boss.next = 0;
  game.updateBoss(0.01);
  assert.equal(game.boss.active, true);
  assert.equal(game.tipFactor(), normal * BOSS.tipMult);
});

test('Alejandro carries a bigger tray', () => {
  const alejandro = STAFF.find((s) => s.id === 'alejandro');
  const { game } = newGame({ staff: alejandro });
  for (let i = 0; i < STATIONS.length; i++) game.tapStation(i);
  const busy = STATIONS.filter((id) => game.stations[id].busy).length;
  assert.equal(busy, 4);
});

test('the daily challenge is the same for everyone', () => {
  const a = newGame({ rng: mulberry32(7) }).game;
  const b = newGame({ rng: mulberry32(7) }).game;
  const ca = a.spawn();
  const cb = b.spawn();
  assert.deepEqual(ca.order, cb.order);
  assert.equal(ca.type, cb.type);
});

test('Monday only uses coffee and toast, and other stations are locked', () => {
  const { game, events } = newGame({ level: WEEK[0] });
  for (let i = 0; i < 5; i++) {
    const c = game.spawn();
    if (!c) break;
    assert.ok(c.order.every((id) => WEEK[0].stations.includes(id)));
    assert.equal(c.order.length, 1);
  }
  game.tapStation(STATIONS.indexOf('beer'));
  assert.equal(game.stations.beer.busy, false);
  assert.ok(events.some((e) => e.type === 'nope'));
});

test('on relaxed days a tired customer costs no life', () => {
  const { game, events } = newGame({ level: WEEK[0] });
  const c = game.spawn();
  run(game, ENTER_TIME + c.maxPatience + 1);
  assert.equal(game.strikes, 0);
  assert.equal(game.over, false);
  assert.ok(events.some((e) => e.type === 'missed'));
});

test('a day ends when the shift time is up and gives stars', () => {
  const { game, events } = newGame({ level: WEEK[0] });
  run(game, WEEK[0].duration + 0.2);
  assert.equal(game.over, true);
  const end = events.find((e) => e.type === 'gameover');
  assert.equal(typeof end.data.stars, 'number');
});

test('the hint points to a station first and then to the customer', () => {
  const { game } = newGame({ level: WEEK[0] });
  const c = game.spawn();
  run(game, ENTER_TIME + 0.05);
  const first = game.hint();
  assert.equal(first.station, STATIONS.indexOf(c.order[0]));
  game.tapStation(first.station);
  run(game, 3);
  assert.deepEqual(game.hint(), { seat: c.seat });
});
