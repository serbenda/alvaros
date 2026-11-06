// Entry point: wires the canvas, menus, input, sound and saved progress.

import { PLAYER, HELPERS, BOSS, STATIONS, DAILY_TWISTS, CUSTOMER_TYPES, WEEK, RUSH_LEVEL } from './config.js';
import { W, H } from './layout.js';
import { Game } from './game.js';
import { render } from './renderer.js';
import { Sfx } from './audio.js';
import { t, setLang, getLang, detectLang, money } from './i18n.js';
import { load, save } from './storage.js';
import { makeLook, drawPerson } from './sprites.js';
import { mulberry32, hashString } from './rng.js';

const SCALE = 4;
const SCREENS = ['title', 'week', 'howto', 'album', 'pause', 'over'];

const $ = (id) => document.getElementById(id);
const canvas = $('game');
const ctx = canvas.getContext('2d');
canvas.width = W * SCALE;
canvas.height = H * SCALE;

const state = load();
setLang(state.lang || detectLang());
const sfx = new Sfx();
sfx.muted = state.muted;

let game = null;
let mode = 'week';
let day = 0;
let paused = false;
let lastFrame = performance.now();
let lastScore = 0;

// ---- Helpers ----------------------------------------------------------------

function todayKey() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function dailyTwist() {
  return DAILY_TWISTS[hashString(todayKey()) % DAILY_TWISTS.length];
}

function dailyBest() {
  return state.daily.date === todayKey() ? state.daily.best : 0;
}

function vibrate(pattern) {
  if (state.muted) return;
  try {
    if (navigator.vibrate) navigator.vibrate(pattern);
  } catch {
    // Not supported.
  }
}

function show(name) {
  for (const s of SCREENS) $(`screen-${s}`).classList.toggle('hidden', s !== name);
}

function hideScreens() {
  for (const s of SCREENS) $(`screen-${s}`).classList.add('hidden');
}

function toast(message) {
  const el = $('toast');
  el.textContent = message;
  el.classList.add('visible');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove('visible'), 2200);
}

function weekStars() {
  if (!Array.isArray(state.weekStars)) state.weekStars = WEEK.map(() => 0);
  return state.weekStars;
}

function totalStars() {
  return weekStars().reduce((a, b) => a + b, 0);
}

function dayUnlocked(index) {
  return index === 0 || weekStars()[index - 1] > 0;
}

function starsText(n, max = 3) {
  return '★'.repeat(n) + '☆'.repeat(max - n);
}

function selectedStaff() {
  return PLAYER;
}

function portrait(look, size = 32, silhouette = false) {
  const c = document.createElement('canvas');
  c.width = size * SCALE;
  c.height = size * SCALE;
  const cctx = c.getContext('2d');
  cctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
  drawPerson(cctx, look, size / 2, 6 + (look.offset || 0), { mood: 'happy', silhouette });
  return c;
}

// ---- Menus --------------------------------------------------------------------

/** The Álvaro's team, shown on the title screen. Only Blanca is playable. */
function renderTeam() {
  const list = $('team-list');
  list.innerHTML = '';
  const team = [
    { id: 'blanca', name: PLAYER.name, look: PLAYER.look },
    ...Object.entries(HELPERS).map(([id, h]) => ({ id, name: h.name, look: h.look })),
    { id: 'boss', name: BOSS.name, look: BOSS.look },
  ];
  for (const member of team) {
    const button = document.createElement('button');
    button.className = member.id === 'blanca' ? 'member selected' : 'member';
    button.type = 'button';
    button.appendChild(portrait(member.look, 32));
    const name = document.createElement('span');
    name.className = 'member-name';
    name.textContent = member.name;
    button.appendChild(name);
    button.addEventListener('click', () => {
      $('team-desc').textContent = `${member.name}: ${t(`staff.${member.id}`)}`;
    });
    list.appendChild(button);
  }
  $('team-desc').textContent = `${PLAYER.name}: ${t('staff.blanca')}`;
}

function renderTitle() {
  $('title-best').textContent = money(state.best);
  $('title-total').textContent = `${totalStars()} / ${WEEK.length * 3} ★`;
  $('daily-twist').textContent = t(`twists.${dailyTwist().id}`);
  renderTeam();
}

function renderWeek() {
  const list = $('week-list');
  list.innerHTML = '';
  WEEK.forEach((level, index) => {
    const open = dayUnlocked(index);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = open ? 'day' : 'day locked';
    const name = document.createElement('span');
    name.className = 'day-name';
    name.textContent = t(`days.${level.id}`);
    const info = document.createElement('span');
    info.className = 'day-info';
    info.textContent = open ? level.stations.map((id) => t(`items.${id}`)).join(' · ') : t('dayLocked');
    const stars = document.createElement('span');
    stars.className = 'day-stars';
    stars.textContent = open ? starsText(weekStars()[index]) : '🔒';
    button.append(name, stars, info);
    button.addEventListener('click', () => {
      if (!open) {
        toast(t('dayLocked'));
        return;
      }
      startGame('week', index);
    });
    list.appendChild(button);
  });
}

function renderHowTo() {
  const list = $('howto-list');
  list.innerHTML = '';
  for (const step of t('howToSteps')) {
    const li = document.createElement('li');
    li.textContent = step;
    list.appendChild(li);
  }
}

function renderAlbum() {
  const grid = $('album-grid');
  grid.innerHTML = '';
  const types = Object.keys(CUSTOMER_TYPES);
  let seen = 0;
  types.forEach((type, i) => {
    const met = !!state.album[type];
    if (met) seen++;
    const card = document.createElement('div');
    card.className = met ? 'card' : 'card locked';
    card.appendChild(portrait(makeLook(mulberry32(i + 7), type), 32, !met));
    const name = document.createElement('strong');
    name.textContent = met ? t(`customers.${type}.name`) : t('locked');
    const desc = document.createElement('span');
    desc.textContent = met ? t(`customers.${type}.desc`) : '';
    card.append(name, desc);
    grid.appendChild(card);
  });
  $('album-count').textContent = t('albumCount', { n: seen, total: types.length });
}

function applyLanguage() {
  document.documentElement.lang = getLang();
  document.title = t('title');
  for (const el of document.querySelectorAll('[data-i18n]')) el.textContent = t(el.dataset.i18n);
  $('btn-lang').textContent = getLang() === 'es' ? 'English' : 'Español';
  $('btn-sound').textContent = state.muted ? t('soundOff') : t('soundOn');
  renderTitle();
  renderWeek();
  renderHowTo();
}

// ---- Game flow ------------------------------------------------------------------

function onEvent(type, data) {
  switch (type) {
    case 'prep':
    case 'ready':
    case 'nope':
    case 'discard':
    case 'phase':
      sfx.play(type);
      break;
    case 'serve':
      sfx.play('serve');
      vibrate(10);
      break;
    case 'complete':
      sfx.play('complete');
      vibrate(25);
      break;
    case 'combo':
      sfx.play('combo');
      vibrate([20, 30, 20]);
      break;
    case 'onfire':
      sfx.play('onfire');
      break;
    case 'alejandro':
      sfx.play('serve');
      vibrate(10);
      break;
    case 'goal':
      sfx.play('goal');
      vibrate([30, 40, 30, 40, 60]);
      break;
    case 'andrea':
      sfx.play('andrea');
      break;
    case 'missed':
      sfx.play('discard');
      break;
    case 'angry':
      sfx.play('angry');
      vibrate([60, 40, 60]);
      break;
    case 'bossArrives':
      sfx.play('boss');
      vibrate(80);
      break;
    case 'meet':
      if (!state.album[data.type]) {
        state.album[data.type] = true;
        save(state);
      }
      break;
    case 'pause':
      pauseGame();
      break;
    case 'gameover':
      sfx.stopMusic();
      sfx.play('gameover');
      vibrate(200);
      finishGame(data);
      break;
    default:
      break;
  }
}

function startGame(newMode, dayIndex = day) {
  sfx.unlock();
  mode = newMode;
  day = dayIndex;
  let rng = Math.random;
  let twist = null;
  const level = mode === 'week' ? WEEK[day] : RUSH_LEVEL;
  if (mode === 'daily') {
    twist = dailyTwist();
    rng = mulberry32(hashString(`alvaros-${todayKey()}`));
  }
  game = new Game({
    staff: selectedStaff(),
    t,
    rng,
    twist,
    level,
    isNewType: (type) => !state.album[type],
    onEvent,
  });
  paused = false;
  state.plays++;
  save(state);
  hideScreens();
  sfx.play('start');
  sfx.startMusic();
}

function finishGame(summary) {
  lastScore = summary.score;
  state.totalTips += summary.score;

  let isRecord = false;
  if (mode === 'week') {
    const stars = weekStars();
    if (summary.stars > stars[day]) {
      stars[day] = summary.stars;
      isRecord = true;
    }
  } else if (mode === 'daily') {
    if (state.daily.date !== todayKey()) state.daily = { date: todayKey(), best: 0 };
    if (summary.score > state.daily.best) {
      state.daily.best = summary.score;
      isRecord = true;
    }
  } else if (summary.score > state.best) {
    state.best = summary.score;
    isRecord = true;
  }
  save(state);

  setTimeout(() => {
    const week = mode === 'week';
    $('over-title').textContent = week ? t('shiftOver') : t('gameOver');
    let label = t('modeRush');
    if (mode === 'daily') label = t('modeDaily', { twist: t(`twists.${dailyTwist().id}`) });
    if (week) label = t(`days.${WEEK[day].id}`);
    $('over-mode').textContent = label;
    $('over-score').textContent = money(summary.score);

    const starsEl = $('over-stars');
    starsEl.classList.toggle('hidden', !week);
    starsEl.textContent = week ? starsText(summary.stars) : '';
    const hint = $('over-hint');
    if (week) {
      const [a, b, c] = WEEK[day].targets;
      let message = t('starTargets', { a: money(a), b: money(b), c: money(c) });
      if (summary.stars === 0) message = t('tryAgainStar');
      else if (day === WEEK.length - 1) message = t('weekDone');
      hint.textContent = message;
    }
    hint.classList.toggle('hidden', !week);

    $('over-record').classList.toggle('hidden', !isRecord || summary.score === 0);
    $('over-served').textContent = String(summary.served);
    $('over-combo').textContent = String(summary.bestCombo);
    $('over-best-label').textContent = week ? t('totalStars') : mode === 'daily' ? t('dailyBest') : t('best');
    $('over-best').textContent = week ? `${totalStars()} / ${WEEK.length * 3}` : money(mode === 'daily' ? dailyBest() : state.best);
    $('over-total').textContent = money(state.totalTips);

    const canAdvance = week && summary.stars > 0 && day < WEEK.length - 1;
    $('btn-next').classList.toggle('hidden', !canAdvance);
    $('btn-retry').classList.toggle('primary', !canAdvance);

    show('over');
  }, 1200);
}

function pauseGame() {
  if (!game || game.over || paused) return;
  paused = true;
  sfx.stopMusic();
  show('pause');
}

function resumeGame() {
  paused = false;
  sfx.startMusic();
  hideScreens();
  lastFrame = performance.now();
}

function quitToTitle() {
  sfx.stopMusic();
  game = null;
  paused = false;
  renderTitle();
  if (mode === 'week') {
    renderWeek();
    show('week');
  } else {
    show('title');
  }
}

async function share() {
  const text = t('shareText', { score: money(lastScore) });
  const url = location.href.split('#')[0].split('?')[0];
  try {
    if (navigator.share) {
      await navigator.share({ title: t('title'), text, url });
      return;
    }
    await navigator.clipboard.writeText(`${text} ${url}`);
    toast(t('copied'));
  } catch {
    // Cancelled or not allowed.
  }
}

// ---- Input --------------------------------------------------------------------

canvas.addEventListener('pointerdown', (event) => {
  if (!game || paused) return;
  event.preventDefault();
  sfx.unlock();
  const r = canvas.getBoundingClientRect();
  const x = ((event.clientX - r.left) / r.width) * W;
  const y = ((event.clientY - r.top) / r.height) * H;
  game.tap(x, y);
});

const SEAT_KEYS = ['q', 'w', 'e', 'r'];
const TRAY_KEYS = ['z', 'x', 'c', 'v'];

window.addEventListener('keydown', (event) => {
  if (!game) return;
  const key = event.key.toLowerCase();
  if (key === 'p' || key === 'escape') {
    if (paused) resumeGame();
    else pauseGame();
    return;
  }
  if (paused) return;
  const station = Number(key) - 1;
  if (station >= 0 && station < STATIONS.length) game.tapStation(station);
  else if (SEAT_KEYS.includes(key)) game.tapSeat(SEAT_KEYS.indexOf(key));
  else if (TRAY_KEYS.includes(key)) game.tapTray(TRAY_KEYS.indexOf(key));
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) pauseGame();
});

$('btn-play').addEventListener('click', () => {
  renderWeek();
  show('week');
});
$('btn-rush').addEventListener('click', () => startGame('rush'));
$('btn-next').addEventListener('click', () => startGame('week', day + 1));
$('btn-daily').addEventListener('click', () => startGame('daily'));
$('btn-retry').addEventListener('click', () => startGame(mode));
$('btn-howto').addEventListener('click', () => show('howto'));
$('btn-album').addEventListener('click', () => {
  renderAlbum();
  show('album');
});
$('btn-resume').addEventListener('click', resumeGame);
$('btn-quit').addEventListener('click', quitToTitle);
$('btn-menu').addEventListener('click', quitToTitle);
$('btn-share').addEventListener('click', share);
for (const el of document.querySelectorAll('[data-back]')) el.addEventListener('click', () => show('title'));

$('btn-lang').addEventListener('click', () => {
  setLang(getLang() === 'es' ? 'en' : 'es');
  state.lang = getLang();
  save(state);
  applyLanguage();
});

$('btn-sound').addEventListener('click', () => {
  state.muted = !state.muted;
  sfx.muted = state.muted;
  save(state);
  $('btn-sound').textContent = state.muted ? t('soundOff') : t('soundOn');
});

// ---- Loop -----------------------------------------------------------------------

function frame(now) {
  const dt = Math.min(0.05, (now - lastFrame) / 1000);
  lastFrame = now;
  if (game && !paused) game.update(dt);
  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
  ctx.imageSmoothingEnabled = false;
  render(ctx, game, { t, now: now / 1000, dt: paused ? 0 : dt });
  requestAnimationFrame(frame);
}

applyLanguage();
show('title');
requestAnimationFrame(frame);
