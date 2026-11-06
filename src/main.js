// Entry point: wires the canvas, menus, input, sound and saved progress.

import { PLAYER, HELPERS, BOSS, STATIONS, DAILY_TWISTS, CUSTOMER_TYPES, WEEK, RUSH_LEVEL } from './config.js';
import { W, H } from './core/layout.js';
import { Game } from './modes/bar/game.js';
import { render, setRenderScale, drawStar } from './modes/bar/renderer.js';
import { MiniRun, MINIGAME_IDS } from './modes/minigames/run.js';
import { renderMini } from './modes/minigames/render.js';
import { ChinosGame, renderChinos } from './modes/chinos/chinos.js';
import { Sfx } from './core/audio.js';
import { t, setLang, getLang, detectLang, money } from './core/i18n.js';
import { load, save } from './core/storage.js';
import { makeLook, drawPerson, drawIcon } from './graphics/sprites.js';
import { mulberry32, hashString } from './core/rng.js';
import { fullscreenSupported, isFullscreen, enterFullscreen, exitFullscreen, autoFullscreen } from './ui/fullscreen.js';
import { drawLogo } from './ui/logo.js';
import { shareCard } from './ui/share.js';

const PORTRAIT_SCALE = 4;
let SCALE = 4;
const SCREENS = ['title', 'week', 'howto', 'album', 'pause', 'over'];

const $ = (id) => document.getElementById(id);
const canvas = $('game');
const ctx = canvas.getContext('2d');

/** Matches the canvas resolution to the screen so it stays sharp on tablets. */
function resize() {
  const rect = $('stage').getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const scale = Math.max(2, Math.min(8, Math.ceil((rect.height * dpr) / H)));
  if (scale === SCALE && canvas.width === W * scale) return;
  SCALE = scale;
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  setRenderScale(SCALE);
}
resize();
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', () => setTimeout(resize, 200));

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
let lastChinosHer = 0;

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
  c.width = size * PORTRAIT_SCALE;
  c.height = size * PORTRAIT_SCALE;
  const cctx = c.getContext('2d');
  cctx.setTransform(PORTRAIT_SCALE, 0, 0, PORTRAIT_SCALE, 0, 0);
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
  $('title-best').textContent = `${t('best')}: ${money(state.best)}`;
  $('title-mini').textContent = String(state.miniBest || 0);
  $('title-chinos').textContent = String(state.chinosWins || 0);
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
  $('btn-lang').innerHTML = `<span class="tool-icon">🌐</span><span>${getLang() === 'es' ? 'English' : 'Español'}</span>`;
  updateSoundButton();
  drawMenuIcons();
  updateFullscreenButton();
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
    case 'miniWin':
      sfx.play('complete');
      vibrate(25);
      break;
    case 'miniLose':
      sfx.play('angry');
      vibrate([60, 40, 60]);
      break;
    case 'speedup':
      sfx.tempo = Math.min(1.6, data.speed);
      sfx.play('combo');
      vibrate([20, 30, 20]);
      break;
    case 'tick':
      sfx.play('tick');
      break;
    case 'miniIntro':
    case 'chinosCall':
      sfx.play('ready');
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
  sfx.tempo = 1;
  autoFullscreen();
  mode = newMode;
  day = dayIndex;
  paused = false;
  hideScreens();
  state.plays++;
  save(state);
  if (mode === 'mini' || mode === 'chinos') {
    // ?mini=<id> in the URL plays a single mini-game, handy to show or test one.
    const only = new URLSearchParams(location.search).get('mini');
    game = mode === 'mini' ? new MiniRun({ t, onEvent, only: MINIGAME_IDS.includes(only) ? only : null }) : new ChinosGame({ t, onEvent });
    sfx.play('start');
    sfx.startMusic();
    return;
  }
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
  sfx.play('start');
  sfx.startMusic();
}

function finishGame(summary) {
  lastScore = summary.score;
  if (mode === 'mini' || mode === 'chinos') {
    finishExtraMode(summary);
    return;
  }
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
    $('over-served-label').textContent = t('served');
    $('over-combo-label').textContent = t('bestCombo');
    $('over-total-row').classList.remove('hidden');
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

/** End screen for the mini-games and the chinos. */
function finishExtraMode(summary) {
  const mini = mode === 'mini';
  lastChinosHer = summary.bestCombo;
  let isRecord = false;
  if (mini && summary.score > (state.miniBest || 0)) {
    state.miniBest = summary.score;
    isRecord = true;
  }
  if (!mini && summary.won) {
    state.chinosWins = (state.chinosWins || 0) + 1;
    isRecord = true;
  }
  save(state);
  setTimeout(() => {
    $('over-title').textContent = mini ? t('miniOver') : summary.won ? t('chinosWon') : t('chinosLost');
    $('over-mode').textContent = mini ? t('minigames') : t('chinosMode');
    $('over-score').textContent = mini ? String(summary.score) : `${summary.score} - ${summary.bestCombo}`;
    $('over-stars').classList.add('hidden');
    $('over-hint').classList.add('hidden');
    $('over-record').classList.toggle('hidden', !isRecord || (mini && summary.score === 0));
    $('over-served-label').textContent = mini ? t('miniScore') : t('chinosScore');
    $('over-served').textContent = String(summary.served);
    $('over-combo-label').textContent = mini ? t('miniSpeed') : t('chinosHer');
    $('over-combo').textContent = mini ? `x${summary.speed.toFixed(2)}` : String(summary.bestCombo);
    $('over-best-label').textContent = mini ? t('best') : t('chinosWins');
    $('over-best').textContent = String(mini ? state.miniBest || 0 : state.chinosWins || 0);
    $('over-total-row').classList.add('hidden');
    $('btn-next').classList.add('hidden');
    $('btn-retry').classList.add('primary');
    show('over');
  }, 1300);
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

function lastScoreText() {
  if (mode === 'mini') return lastScore;
  if (mode === 'chinos') return `${lastScore}-${lastChinosHer}`;
  return money(lastScore);
}

async function share() {
  let text = t('shareText', { score: money(lastScore) });
  let label = t('modeRush');
  if (mode === 'mini') {
    text = t('shareMini', { score: lastScore });
    label = t('miniScore');
  } else if (mode === 'chinos') {
    text = t('shareChinos');
    label = t('chinosMode');
  } else if (mode === 'week') {
    label = t(`days.${WEEK[day].id}`);
  }
  try {
    const result = await shareCard({
      title: t('title'),
      text,
      label: label.toUpperCase(),
      score: lastScoreText(),
      look: PLAYER.look,
      url: location.href.split('#')[0].split('?')[0],
    });
    if (result === 'copied') toast(t('copied'));
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
  if (game.down) game.down(x, y);
  else game.tap(x, y);
});

function pointerUp(event) {
  if (!game || paused || !game.up) return;
  const r = canvas.getBoundingClientRect();
  game.up(((event.clientX - r.left) / r.width) * W, ((event.clientY - r.top) / r.height) * H);
}
canvas.addEventListener('pointermove', (event) => {
  if (!game || paused || !game.move || !event.buttons) return;
  const r = canvas.getBoundingClientRect();
  game.move(((event.clientX - r.left) / r.width) * W, ((event.clientY - r.top) / r.height) * H);
});
canvas.addEventListener('pointerup', pointerUp);
canvas.addEventListener('pointercancel', pointerUp);
canvas.addEventListener('pointerleave', pointerUp);

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
  if (!game.tapStation) {
    // Mini-games: the space bar works as a tap in the middle of the screen
    if (key === ' ' && game.down && !event.repeat) game.down(W / 2, H / 2);
    return;
  }
  const station = Number(key) - 1;
  if (station >= 0 && station < STATIONS.length) game.tapStation(station);
  else if (SEAT_KEYS.includes(key)) game.tapSeat(SEAT_KEYS.indexOf(key));
  else if (TRAY_KEYS.includes(key)) game.tapTray(TRAY_KEYS.indexOf(key));
});

window.addEventListener('keyup', (event) => {
  if (game && game.up && event.key === ' ') game.up(W / 2, H / 2);
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) pauseGame();
});

$('btn-play').addEventListener('click', () => {
  renderWeek();
  show('week');
});
$('btn-rush').addEventListener('click', () => startGame('rush'));
$('btn-mini').addEventListener('click', () => startGame('mini'));
$('btn-more').addEventListener('click', () => {
  const panel = $('more-modes');
  panel.hidden = !panel.hidden;
  $('btn-more').setAttribute('aria-expanded', String(!panel.hidden));
  $('btn-more').classList.toggle('open', !panel.hidden);
});
$('btn-chinos').addEventListener('click', () => startGame('chinos'));
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

function updateSoundButton() {
  const button = $('btn-sound');
  button.innerHTML = `<span class="tool-icon">${state.muted ? '🔇' : '🔊'}</span><span>${t('soundShort')}</span>`;
  button.title = state.muted ? t('soundOff') : t('soundOn');
}

function updateFullscreenButton() {
  const button = $('btn-fullscreen');
  button.classList.toggle('hidden', !fullscreenSupported());
  button.innerHTML = `<span class="tool-icon">${isFullscreen() ? '🗗' : '⛶'}</span><span>${t('screenShort')}</span>`;
  button.title = isFullscreen() ? t('exitFullscreen') : t('fullscreen');
}

$('btn-fullscreen').addEventListener('click', () => {
  if (isFullscreen()) exitFullscreen();
  else enterFullscreen();
});
document.addEventListener('fullscreenchange', () => {
  updateFullscreenButton();
  setTimeout(resize, 100);
});
document.addEventListener('webkitfullscreenchange', () => {
  updateFullscreenButton();
  setTimeout(resize, 100);
});

$('btn-sound').addEventListener('click', () => {
  state.muted = !state.muted;
  sfx.muted = state.muted;
  save(state);
  updateSoundButton();
});

// ---- Menu icons -----------------------------------------------------------------

/** Pixel-art icons for the mode buttons on the title screen. */
function drawMenuIcons() {
  for (const c of document.querySelectorAll('canvas[data-icon]')) {
    const g = c.getContext('2d');
    const s = c.width / 32;
    g.setTransform(s, 0, 0, s, 0, 0);
    g.clearRect(0, 0, 32, 32);
    const R = (x, y, w, h, color) => {
      g.fillStyle = color;
      g.fillRect(x, y, w, h);
    };
    switch (c.dataset.icon) {
      case 'mini':
        drawIcon(g, 'beer', 1, 4, 1.5);
        g.save();
        g.translate(14, 10);
        g.rotate(0.25);
        drawIcon(g, 'coffee', 0, 0, 1.1);
        g.restore();
        R(24, 2, 2, 6, '#ffffff');
        R(22, 4, 6, 2, '#ffffff');
        break;
      case 'chinos':
        for (const [x, y] of [[6, 18], [14, 12], [20, 20], [11, 22]]) {
          R(x - 5, y - 5, 10, 10, '#24160f');
          R(x - 4, y - 4, 8, 8, '#d4a017');
          R(x - 3, y - 3, 6, 6, '#f5c542');
          R(x - 2, y - 2, 1.5, 3, '#fff1a8');
        }
        break;
      case 'week':
        R(3, 5, 26, 24, '#24160f');
        R(4, 6, 24, 22, '#fffaf0');
        R(4, 6, 24, 6, '#27ae60');
        R(9, 3, 2, 5, '#24160f');
        R(21, 3, 2, 5, '#24160f');
        for (let i = 0; i < 9; i++) R(7 + (i % 3) * 7, 14 + Math.floor(i / 3) * 4.5, 4, 3, i < 4 ? '#f5c542' : '#d9c7a6');
        break;
      case 'rush':
        R(6, 5, 20, 22, '#24160f');
        R(7, 6, 18, 20, '#ffffff');
        R(15.5, 8, 1.5, 9, '#24160f');
        R(15.5, 15.5, 7, 1.5, '#24160f');
        R(10, 1, 4, 3, '#e74c3c');
        R(18, 1, 4, 3, '#e74c3c');
        R(2, 26, 4, 4, '#ff9f43');
        R(26, 26, 4, 4, '#ff9f43');
        break;
      case 'daily':
        drawStar(g, 2, 2, true, 4);
        break;
      default:
        break;
    }
  }
}

// ---- Title logo -----------------------------------------------------------------

const logoCtx = $('logo').getContext('2d');

// ---- Loop -----------------------------------------------------------------------

function frame(now) {
  const dt = Math.min(0.05, (now - lastFrame) / 1000);
  lastFrame = now;
  if (game && !paused) game.update(dt);
  ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
  ctx.imageSmoothingEnabled = false;
  const opts = { t, now: now / 1000, dt: paused ? 0 : dt };
  if (!$('screen-title').classList.contains('hidden')) drawLogo(logoCtx, now / 1000);
  if (game && mode === 'mini') renderMini(ctx, game, opts);
  else if (game && mode === 'chinos') renderChinos(ctx, game, opts);
  else render(ctx, game && game.seats ? game : null, opts);
  requestAnimationFrame(frame);
}

applyLanguage();
show('title');
requestAnimationFrame(frame);
