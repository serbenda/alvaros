// Game state and rules. No drawing and no DOM here, so it can be tested in Node.

import {
  ITEMS,
  STATIONS,
  MENUS,
  CLOCK,
  CUSTOMER_TYPES,
  DIFFICULTY,
  SEATS,
  BOSS,
  RUSH_LEVEL,
} from './config.js';
import { W, HUD_H, SEAT_X, TRAY, BOSS_X, stationRect, traySlotRect, inside, seatAt } from './layout.js';
import { makeLook } from './sprites.js';

const lerp = (a, b, k) => a + (b - a) * k;
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const cosmetic = (arr) => arr[Math.floor(Math.random() * arr.length)];

/** Seconds a customer spends walking in, enjoying their order and walking out. */
export const ENTER_TIME = 0.9;
export const ENJOY_TIME = 1.1;
export const LEAVE_TIME = 1.0;

export const COLORS = {
  gold: '#f5c542',
  orange: '#ff9f43',
  red: '#e74c3c',
  green: '#2ecc71',
  cream: '#f5e6c8',
};

export class Game {
  /**
   * @param {object} opts
   * @param {object} opts.staff     Entry from STAFF.
   * @param {Function} opts.t       Translation function.
   * @param {Function} [opts.rng]   Random function (seeded for the daily challenge).
   * @param {object} [opts.twist]   Daily twist from DAILY_TWISTS.
   * @param {object} [opts.level]   A day from WEEK, or RUSH_LEVEL (default).
   * @param {Function} [opts.isNewType] Returns true if a customer type was never met.
   * @param {Function} [opts.onEvent] Receives (type, data) for sound, vibration and UI.
   */
  constructor({ staff, t, rng = Math.random, twist = null, level = RUSH_LEVEL, isNewType = () => false, onEvent = () => {} }) {
    this.level = level;
    this.available = new Set(level.stations || STATIONS);
    this.staff = staff;
    this.t = t;
    this.rng = rng;
    this.twist = twist || {};
    this.isNewType = isNewType;
    this.emit = onEvent;

    this.time = 0;
    this.score = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.multiplier = 1;
    this.strikes = 0;
    this.served = 0;
    this.over = false;
    this.overTime = 0;

    this.seats = new Array(SEATS).fill(null);
    this.stations = {};
    for (const id of STATIONS) this.stations[id] = { busy: false, t: 0, dur: 1, flash: 0 };
    this.tray = [];
    this.trayCapacity = staff.trayCapacity;

    this.spawnTimer = 1;
    this.nextId = 1;
    this.floats = [];
    // Cosmetic effects for the renderer to pick up (particles, confetti...).
    this.fx = [];
    this.speech = null;
    this.shake = 0;
    this.onFireShown = false;
    this.player = { x: W / 2, target: W / 2 };
    this.boss = { active: false, t: 0, next: BOSS.firstAfter * this.bossFactor(), x: -14 };
    this.currentPhase = this.phase();

    this.say(cosmetic(t('phrases.start')));
    if (twist) this.float(W / 2, 122, t(`twists.${twist.id}`), COLORS.gold, 6, 2.4);
    if (level.intro && level.intro.length) {
      const names = level.intro.map((id) => t(`items.${id}`)).join(', ');
      this.float(W / 2, 140, t('newItem', { name: names }), COLORS.green, 5, 3);
    }
  }

  // ---- Derived values -------------------------------------------------------

  startMinutes() {
    return this.level.startMinutes !== undefined ? this.level.startMinutes : CLOCK.startMinutes;
  }

  clockMinutes() {
    return (this.startMinutes() + this.time * CLOCK.minutesPerSecond) % (24 * 60);
  }

  /** Seconds left in a timed shift, or null in endless mode. */
  timeLeft() {
    return this.level.duration ? Math.max(0, this.level.duration - this.time) : null;
  }

  /** How far through the shift we are, from 0 to 1. */
  progress() {
    return this.level.duration ? clamp01(this.time / this.level.duration) : this.ramp();
  }

  phase() {
    const m = this.startMinutes() + this.time * CLOCK.minutesPerSecond;
    if (m < CLOCK.lunchAt) return 'breakfast';
    if (m < CLOCK.afternoonAt) return 'lunch';
    return 'afternoon';
  }

  ramp() {
    return clamp01(this.time / DIFFICULTY.rampSeconds);
  }

  spawnInterval() {
    if (this.level.spawn) return lerp(this.level.spawn[0], this.level.spawn[1], this.progress());
    return lerp(DIFFICULTY.spawnStart, DIFFICULTY.spawnMin, this.ramp()) * (this.twist.spawn || 1);
  }

  patienceFactor() {
    if (this.level.patience) return this.level.patience * this.staff.patienceBonus;
    return lerp(1, DIFFICULTY.patienceMinFactor, this.ramp()) * this.staff.patienceBonus * (this.twist.patience || 1);
  }

  /** Stars earned so far (0-3) in a day with targets, otherwise null. */
  stars() {
    const targets = this.level.targets;
    if (!targets) return null;
    return targets.filter((target) => this.score >= target).length;
  }

  bossFactor() {
    return this.twist.bossEvery || 1;
  }

  tipFactor() {
    const boss = this.boss.active ? BOSS.tipMult : 1;
    return (this.staff.tipBonus || 1) * (this.twist.tip || 1) * boss;
  }

  reservedSlots() {
    let busy = 0;
    for (const id of STATIONS) if (this.stations[id].busy) busy++;
    return this.tray.length + busy;
  }

  /** True if the tray holds something this waiting customer still needs. */
  canServe(c) {
    if (!c || c.state !== 'wait') return false;
    return c.order.some((id, k) => !c.served[k] && this.tray.includes(id));
  }

  /**
   * Suggests the next tap for beginners: a customer to serve, or a station to use.
   * Returns { seat }, { station } (station index) or { tray } (slot to empty), or null.
   */
  hint() {
    const waiting = this.seats.filter((c) => c && c.state === 'wait').sort((a, b) => a.patience - b.patience);
    for (const c of waiting) if (this.canServe(c)) return { seat: c.seat };
    if (this.reservedSlots() >= this.trayCapacity) {
      // Tray full of things nobody is waiting for: suggest throwing one away.
      const needed = [];
      for (const c of this.seats) {
        if (!c || (c.state !== 'wait' && c.state !== 'enter')) continue;
        c.order.forEach((id, k) => {
          if (!c.served[k]) needed.push(id);
        });
      }
      for (let i = 0; i < this.tray.length; i++) {
        const at = needed.indexOf(this.tray[i]);
        if (at >= 0) needed.splice(at, 1);
        else return { tray: i };
      }
      return null;
    }
    const pending = [...this.tray];
    for (const id of STATIONS) if (this.stations[id].busy) pending.push(id);
    for (const c of waiting) {
      for (let k = 0; k < c.order.length; k++) {
        if (c.served[k]) continue;
        const id = c.order[k];
        const at = pending.indexOf(id);
        if (at >= 0) {
          pending.splice(at, 1);
          continue;
        }
        return { station: STATIONS.indexOf(id) };
      }
    }
    return null;
  }

  // ---- Helpers ------------------------------------------------------------

  randInt(min, max) {
    return min + Math.floor(this.rng() * (max - min + 1));
  }

  pick(arr) {
    return arr[Math.floor(this.rng() * arr.length)];
  }

  float(x, y, text, color = COLORS.cream, size = 6, life = 1.1) {
    this.floats.push({ x, y, text, color, size, life, t: 0 });
  }

  say(text, duration = 1.6) {
    this.speech = { text, t: duration };
  }

  // ---- Customers ----------------------------------------------------------

  chooseType() {
    const allowed = this.level.customers;
    const entries = Object.entries(CUSTOMER_TYPES).filter(([id, def]) =>
      allowed ? allowed.includes(id) : (def.minTime || 0) <= this.time,
    );
    const weights = entries.map(([id, def]) => (id === 'critic' ? def.weight * (this.twist.criticWeight || 1) : def.weight));
    const total = weights.reduce((a, b) => a + b, 0);
    let roll = this.rng() * total;
    for (let i = 0; i < entries.length; i++) {
      roll -= weights[i];
      if (roll <= 0) return entries[i][0];
    }
    return entries[entries.length - 1][0];
  }

  makeOrder(def) {
    let menu = def.menu || MENUS[this.phase()];
    if (!def.menu && this.twist.coffeeBias) menu = menu.concat(new Array(this.twist.coffeeBias).fill('coffee'));
    menu = menu.filter((id) => this.available.has(id));
    if (!menu.length) menu = [...this.available];
    let count = this.randInt(def.items[0], def.items[1]);
    if (this.twist.extraItem && this.rng() < this.twist.extraItem) count++;
    if (this.level.endless && this.time > 90 && this.rng() < 0.3) count++;
    count = Math.min(count, this.level.maxOrder || 3);
    const order = [];
    for (let i = 0; i < count; i++) order.push(this.pick(menu));
    return order;
  }

  spawn() {
    const free = [];
    for (let i = 0; i < SEATS; i++) if (!this.seats[i]) free.push(i);
    if (!free.length) return null;
    const seat = this.pick(free);
    const type = this.chooseType();
    const def = CUSTOMER_TYPES[type];
    const order = this.makeOrder(def);
    const maxPatience = (def.patience + order.length * 2) * this.patienceFactor();
    const customer = {
      id: this.nextId++,
      type,
      seat,
      order,
      served: order.map(() => false),
      patience: maxPatience,
      maxPatience,
      state: 'enter',
      st: 0,
      mood: 'neutral',
      look: makeLook(this.rng, type),
    };
    this.seats[seat] = customer;
    if (this.isNewType(type)) {
      this.float(SEAT_X[seat], 30, this.t('newCustomer', { name: this.t(`customers.${type}.name`) }), COLORS.green, 5, 1.8);
    }
    this.emit('meet', { type });
    return customer;
  }

  loseCustomer(c) {
    c.state = 'leave';
    c.st = 0;
    c.mood = 'angry';
    this.combo = 0;
    this.multiplier = 1;
    this.onFireShown = false;
    this.fx.push({ kind: 'puff', x: SEAT_X[c.seat], y: 68 });
    if (!this.level.strikes) {
      // Relaxed days: no lives to lose, the customer just leaves without a tip.
      this.float(SEAT_X[c.seat], 64, this.t('noTip'), COLORS.cream, 5);
      this.emit('missed', { type: c.type });
      return;
    }
    this.strikes++;
    this.shake = 0.3;
    this.float(SEAT_X[c.seat], 64, 'X', COLORS.red, 8);
    this.say(cosmetic(this.t('phrases.bad')));
    this.emit('angry', { type: c.type });
  }

  completeOrder(c) {
    const def = CUSTOMER_TYPES[c.type];
    const speed = clamp01(c.patience / c.maxPatience);
    const base = c.order.reduce((sum, id) => sum + ITEMS[id].tip, 0);

    this.combo++;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    const previous = this.multiplier;
    this.multiplier = Math.min(5, 1 + Math.floor(this.combo / 3));

    const tip = Math.max(1, Math.round(base * def.tipMult * (1 + speed) * this.multiplier * this.tipFactor()));
    this.score += tip;
    this.served++;

    c.state = 'enjoy';
    c.st = 0;
    c.mood = 'happy';
    this.float(SEAT_X[c.seat], 60, `+${tip}`, COLORS.gold, 7);
    this.fx.push({ kind: 'sparkle', x: SEAT_X[c.seat], y: 70 });
    this.fx.push({ kind: 'coins', x: SEAT_X[c.seat], y: 70, n: Math.min(10, 2 + Math.floor(tip / 3)) });

    if (this.multiplier > previous) {
      this.float(W / 2, 112, this.t('combo', { n: this.multiplier }), COLORS.orange, 7, 1.3);
      this.fx.push({ kind: 'confetti' });
      this.emit('combo', { multiplier: this.multiplier });
    }
    if (this.multiplier >= 4 && !this.onFireShown) {
      this.onFireShown = true;
      this.float(W / 2, 96, this.t('onFire', { name: this.staff.name.toUpperCase() }), '#ff6b35', 6, 1.8);
      this.emit('onfire', {});
    }
    if (Math.random() < 0.35) this.say(cosmetic(this.t('phrases.good')));
    this.emit('complete', { tip });
  }

  // ---- Boss ---------------------------------------------------------------

  updateBoss(dt) {
    const b = this.boss;
    if (!this.level.boss) return;
    if (b.active) {
      b.t -= dt;
      b.x = Math.min(BOSS_X, b.x + dt * 60);
      if (b.t <= 0) {
        b.active = false;
        b.next = (BOSS.every[0] + this.rng() * (BOSS.every[1] - BOSS.every[0])) * this.bossFactor();
        this.float(W / 2, 122, this.t('bossLeaves'), COLORS.cream, 5, 1.6);
        this.emit('bossLeaves', {});
      }
    } else {
      b.x = Math.max(-14, b.x - dt * 60);
      b.next -= dt;
      if (b.next <= 0) {
        b.active = true;
        b.t = BOSS.duration;
        this.float(W / 2, 122, this.t('bossArrives'), COLORS.red, 6, 2);
        this.say(cosmetic(this.t('phrases.boss')), 2);
        this.emit('bossArrives', {});
      }
    }
  }

  // ---- Main update --------------------------------------------------------

  update(dt) {
    this.updateFloats(dt);
    if (this.over) {
      this.overTime += dt;
      return;
    }
    this.time += dt;

    for (const id of STATIONS) {
      const s = this.stations[id];
      if (s.flash > 0) s.flash = Math.max(0, s.flash - dt);
      if (!s.busy) continue;
      const bonus = (this.staff.prepBonus && this.staff.prepBonus[id]) || 1;
      s.t += dt * this.staff.prepSpeed * bonus;
      if (s.t >= s.dur) {
        s.busy = false;
        s.flash = 0.3;
        this.tray.push(id);
        this.fx.push({ kind: 'pop', station: STATIONS.indexOf(id) });
        this.emit('ready', { item: id });
      }
    }

    const occupied = this.seats.filter(Boolean).length;
    this.spawnTimer -= dt;
    if (occupied === 0) this.spawnTimer = Math.min(this.spawnTimer, 0.5);
    const closing = this.level.duration && this.level.duration - this.time < 5;
    if (this.spawnTimer <= 0 && !closing) {
      if (occupied < SEATS) this.spawn();
      this.spawnTimer = this.spawnInterval() * (0.7 + this.rng() * 0.6);
    }

    for (let i = 0; i < SEATS; i++) {
      const c = this.seats[i];
      if (!c) continue;
      c.st += dt;
      if (c.state === 'enter' && c.st >= ENTER_TIME) {
        c.state = 'wait';
        c.st = 0;
      } else if (c.state === 'enjoy' && c.st >= ENJOY_TIME) {
        c.state = 'leave';
        c.st = 0;
      } else if (c.state === 'wait') {
        c.patience -= dt;
        if (c.patience <= 0) this.loseCustomer(c);
      } else if (c.state === 'leave' && c.st >= LEAVE_TIME) {
        this.seats[i] = null;
      }
    }

    this.updateBoss(dt);

    const p = this.player;
    const step = dt * 170;
    const d = p.target - p.x;
    p.x = Math.abs(d) <= step ? p.target : p.x + Math.sign(d) * step;

    if (this.speech) {
      this.speech.t -= dt;
      if (this.speech.t <= 0) this.speech = null;
    }
    this.shake = Math.max(0, this.shake - dt);

    const phase = this.phase();
    if (phase !== this.currentPhase) {
      this.currentPhase = phase;
      this.float(W / 2, 122, this.t(`phase.${phase}`), COLORS.gold, 7, 1.8);
      this.emit('phase', { phase });
    }

    const outOfLives = this.level.strikes && this.strikes >= this.level.strikes;
    const timeUp = this.level.duration && this.time >= this.level.duration;
    if (outOfLives || timeUp) {
      this.over = true;
      this.emit('gameover', this.summary());
    }
  }

  updateFloats(dt) {
    for (const f of this.floats) f.t += dt;
    this.floats = this.floats.filter((f) => f.t < f.life);
  }

  summary() {
    return { score: this.score, served: this.served, bestCombo: this.bestCombo, time: this.time, stars: this.stars() };
  }

  // ---- Input --------------------------------------------------------------

  /** Handles a tap in logical coordinates. */
  tap(x, y) {
    if (this.over) return;
    if (y < HUD_H) {
      this.emit('pause', {});
      return;
    }
    for (let i = 0; i < STATIONS.length; i++) {
      if (inside(stationRect(i), x, y)) {
        this.tapStation(i);
        return;
      }
    }
    for (let i = 0; i < this.trayCapacity; i++) {
      if (inside(traySlotRect(i, this.trayCapacity), x, y)) {
        this.tapTray(i);
        return;
      }
    }
    const seat = seatAt(x, y);
    if (seat >= 0) this.tapSeat(seat);
  }

  tapStation(index) {
    if (this.over) return;
    const id = STATIONS[index];
    const s = this.stations[id];
    const r = stationRect(index);
    if (!this.available.has(id)) {
      this.emit('nope', {});
      return;
    }
    this.player.target = r.x + r.w / 2;
    if (s.busy) {
      this.emit('nope', {});
      return;
    }
    if (this.reservedSlots() >= this.trayCapacity) {
      this.float(W / 2, TRAY.y - 6, this.t('trayFull'), COLORS.red, 5);
      this.emit('nope', {});
      return;
    }
    s.busy = true;
    s.t = 0;
    s.dur = ITEMS[id].prep;
    this.emit('prep', { item: id });
  }

  tapTray(index) {
    if (this.over || index >= this.tray.length) return;
    this.tray.splice(index, 1);
    this.emit('discard', {});
  }

  tapSeat(index) {
    if (this.over) return;
    this.player.target = SEAT_X[index];
    const c = this.seats[index];
    if (!c || c.state !== 'wait') return;
    let matched = 0;
    const delivered = [];
    for (let k = 0; k < c.order.length; k++) {
      if (c.served[k]) continue;
      const at = this.tray.indexOf(c.order[k]);
      if (at >= 0) {
        this.tray.splice(at, 1);
        c.served[k] = true;
        matched++;
        delivered.push(c.order[k]);
      }
    }
    if (!matched) {
      this.float(SEAT_X[index], 64, '?', COLORS.cream, 7, 0.6);
      this.emit('nope', {});
      return;
    }
    this.fx.push({ kind: 'deliver', seat: index, items: delivered });
    if (c.served.every(Boolean)) {
      this.completeOrder(c);
    } else {
      c.patience = Math.min(c.maxPatience, c.patience + 2);
      this.emit('serve', {});
    }
  }
}
