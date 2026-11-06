// Mini-games mode: quick one-gesture challenges featuring the whole team.
// A run plays random mini-games one after another, faster and faster, until
// the player runs out of lives. The score is the number of challenges won.
//
// Each mini-game is a small object created by a factory in GAMES. It gets the
// elapsed time already scaled by the run speed, so everything speeds up evenly.
//   dur          seconds (at speed 1) before the time runs out
//   update(dt)   advance the game; set `result` to 'win' or 'lose' to finish early
//   down(x, y)   finger pressed; up(x, y): finger released
//   timeout()    result when the time runs out (default 'lose')
//   draw(ctx, now, run, t)

import { W } from '../../core/layout.js';
import { GAMES } from './games/index.js';

export { MINIGAME_IDS } from './games/index.js';

export const LIVES = 4;
export const HUD_H = 18;
export const INTRO_TIME = 1.2;
export const RESULT_TIME = 0.9;
export const SPEEDUP_TIME = 1.2;
const WINS_PER_SPEEDUP = 4;
/** Slowest speed: after a few misses the game eases off, so nobody gets stuck. */
export const MIN_SPEED = 0.75;
/** Easy mini-games used to open a beginner's first run. */
const EASY_FIRST = ['calm', 'order', 'coffee', 'fly'];
/** How many mini-games show their instruction during play in a beginner's run. */
const GUIDED_GAMES = 3;

export class MiniRun {
  /**
   * @param {object} opts
   * @param {Function} opts.t          Translation function.
   * @param {Function} [opts.onEvent]  Receives (type, data).
   * @param {string} [opts.only]       Play only this mini-game (for testing or showing one).
   * @param {boolean} [opts.beginner]  First runs: easier start and instructions on screen.
   */
  constructor({ t, onEvent = () => {}, only = null, beginner = false }) {
    this.t = t;
    this.emit = onEvent;
    this.only = only;
    this.beginner = beginner;
    this.played = 0;
    this.lives = LIVES;
    this.score = 0;
    this.speed = beginner ? 0.85 : 1;
    this.topSpeed = this.speed;
    this.over = false;
    this.overTime = 0;
    this.time = 0;
    this.phase = 'intro';
    this.pt = 0;
    this.game = null;
    this.last = null;
    this.shake = 0;
    this.confetti = [];
    this.streak = 0;
    this.bump = 0;
    this.tickT = 0;
    this.next();
  }

  next() {
    let pool = GAMES.filter((g) => (this.only ? g.id === this.only : g.id !== this.last));
    if (this.beginner && !this.only && this.played < 2) {
      const easy = pool.filter((g) => EASY_FIRST.includes(g.id));
      if (easy.length) pool = easy;
    }
    this.played++;
    const def = pool[Math.floor(Math.random() * pool.length)];
    this.last = def.id;
    this.def = def;
    this.game = def.create(this);
    this.game.elapsed = 0;
    this.game.result = null;
    this.phase = 'intro';
    this.pt = 0;
    this.emit('miniIntro', { id: def.id });
  }

  introTime() {
    return (INTRO_TIME * (this.guided() ? 1.5 : 1)) / Math.sqrt(this.speed);
  }

  /** True while the instruction should stay on screen during play. */
  guided() {
    return this.beginner && this.played <= GUIDED_GAMES;
  }

  /** Fraction of time left in the current mini-game, from 1 to 0. */
  timeLeft() {
    if (!this.game) return 0;
    return Math.max(0, 1 - this.game.elapsed / this.game.dur);
  }

  update(dt) {
    for (const c of this.confetti) {
      c.t += dt;
      c.x += c.vx * dt;
      c.y += c.vy * dt;
      c.vy += 60 * dt;
    }
    this.confetti = this.confetti.filter((c) => c.t < c.life);
    this.shake = Math.max(0, this.shake - dt);
    this.bump = Math.max(0, this.bump - dt);
    if (this.over) {
      this.overTime += dt;
      return;
    }
    this.time += dt;
    this.pt += dt;
    const g = this.game;
    if (this.phase === 'intro') {
      if (this.pt >= this.introTime()) {
        this.phase = 'play';
        this.pt = 0;
      }
    } else if (this.phase === 'play') {
      const sdt = dt * this.speed;
      g.elapsed += sdt;
      // Ticking clock when time is running out
      if (this.timeLeft() < 0.3) {
        this.tickT -= dt;
        if (this.tickT <= 0) {
          this.tickT = 0.25;
          this.emit('tick', {});
        }
      }
      if (g.update) g.update(sdt, this);
      if (g.result) this.finish(g.result);
      else if (g.elapsed >= g.dur) this.finish(g.timeout ? g.timeout(this) : 'lose');
    } else if (this.phase === 'result') {
      // Let the mini-game keep animating its ending
      if (g.update) g.update(dt * this.speed * 0.5, this);
      if (this.pt >= RESULT_TIME) {
        if (this.lives <= 0) {
          this.over = true;
          this.emit('gameover', this.summary());
        } else if (this.result === 'win' && this.score % WINS_PER_SPEEDUP === 0) {
          this.speed = Math.round((this.speed + 0.15) * 100) / 100;
          this.topSpeed = Math.max(this.topSpeed, this.speed);
          this.phase = 'speedup';
          this.pt = 0;
          this.emit('speedup', { speed: this.speed });
        } else {
          this.next();
        }
      }
    } else if (this.phase === 'speedup' && this.pt >= SPEEDUP_TIME) {
      this.next();
    }
  }

  finish(result) {
    this.phase = 'result';
    this.pt = 0;
    this.result = result;
    this.game.result = result;
    this.closeCall = result === 'win' && this.timeLeft() < 0.2;
    if (result === 'win') {
      this.score++;
      this.streak++;
      this.bump = 0.35;
      for (let i = 0; i < 30; i++) {
        this.confetti.push({
          x: Math.random() * W,
          y: HUD_H + Math.random() * 20,
          vx: (Math.random() - 0.5) * 30,
          vy: 20 + Math.random() * 40,
          t: 0,
          life: 1.2,
          color: ['#e74c3c', '#f5c542', '#2ecc71', '#3498db', '#ff9f43', '#e84393'][i % 6],
        });
      }
      this.emit('miniWin', { score: this.score, id: this.def.id, streak: this.streak, closeCall: this.closeCall });
    } else {
      this.lives--;
      this.streak = 0;
      this.shake = 0.35;
      // Ease off a little after a miss, so slower players can keep going
      const eased = Math.max(MIN_SPEED, Math.round((this.speed - 0.1) * 100) / 100);
      if (eased !== this.speed) {
        this.speed = eased;
        this.emit('speed', { speed: this.speed });
      }
      this.emit('miniLose', { lives: this.lives, id: this.def.id });
    }
  }

  /** Finger pressed, in logical coordinates. */
  down(x, y) {
    if (this.over) return;
    if (y < HUD_H) {
      this.emit('pause', {});
      return;
    }
    if (this.phase === 'play' && this.game.down) this.game.down(x, y, this);
  }

  /** Finger moved while pressed. */
  move(x, y) {
    if (this.phase === 'play' && this.game.move) this.game.move(x, y, this);
  }

  /** Finger released. */
  up(x, y) {
    if (this.phase === 'play' && this.game.up) this.game.up(x, y, this);
  }

  summary() {
    return { score: this.score, served: this.score, bestCombo: 0, speed: this.topSpeed, stars: null };
  }
}

