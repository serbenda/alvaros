// Game content and tuning.
// Most changes to adapt the game to the bar (menu, staff, difficulty) happen here.

/** Items that can be prepared at a station. `prep` is seconds, `tip` is the base tip. */
export const ITEMS = {
  coffee: { prep: 1.4, tip: 2 },
  juice: { prep: 1.0, tip: 2 },
  toast: { prep: 2.0, tip: 3 },
  beer: { prep: 0.8, tip: 2 },
  tapa: { prep: 1.6, tip: 3 },
  menu: { prep: 2.6, tip: 5 },
};

/** Stations in on-screen order (3 columns x 2 rows). */
export const STATIONS = ['coffee', 'juice', 'toast', 'beer', 'tapa', 'menu'];

/** What customers order at each time of day. Repeated entries are more likely. */
export const MENUS = {
  breakfast: ['coffee', 'coffee', 'coffee', 'juice', 'toast', 'toast'],
  lunch: ['beer', 'beer', 'tapa', 'tapa', 'menu', 'menu', 'coffee'],
  afternoon: ['coffee', 'coffee', 'beer', 'tapa', 'juice'],
};

/** In-game clock. The shift starts at 08:00 and time runs faster than real time. */
export const CLOCK = {
  startMinutes: 8 * 60,
  minutesPerSecond: 3,
  lunchAt: 13 * 60,
  afternoonAt: 16 * 60 + 30,
};

/**
 * Customer types. `patience` is seconds, `items` is the [min, max] order size,
 * `minTime` is how many seconds into the shift the type can start appearing.
 */
export const CUSTOMER_TYPES = {
  regular: { weight: 6, patience: 14, items: [1, 2], tipMult: 1 },
  hurry: { weight: 2, patience: 8, items: [1, 1], tipMult: 2, minTime: 15 },
  kid: { weight: 2, patience: 18, items: [1, 1], tipMult: 1, menu: ['juice', 'toast'] },
  tourist: { weight: 2, patience: 15, items: [2, 3], tipMult: 1.5, minTime: 25 },
  critic: { weight: 0.5, patience: 12, items: [3, 3], tipMult: 3, minTime: 45 },
};

/** Difficulty ramps linearly from start to end values over `rampSeconds`. */
export const DIFFICULTY = {
  spawnStart: 4.5,
  spawnMin: 1.6,
  patienceMinFactor: 0.75,
  rampSeconds: 240,
};

export const SEATS = 4;
export const MAX_STRIKES = 3;

/**
 * The boss event: Pepe Nacho shows up to keep an eye on things.
 * While he is around, tips are multiplied.
 */
export const BOSS = {
  name: 'Pepe Nacho',
  firstAfter: 15,
  every: [20, 35],
  duration: 12,
  tipMult: 2,
  look: { skin: '#e0ac69', hair: '#151515', hairStyle: 'short', shirt: '#ecf0f1', accessory: 'boss' },
};

/**
 * Blanca, the player. She is the only playable character.
 *
 * - prepSpeed: multiplier for every station.
 * - patienceBonus: multiplier for customer patience.
 * - trayCapacity: how many items fit on the tray.
 * - tipBonus: multiplier for every tip.
 */
export const PLAYER = {
  id: 'blanca',
  name: 'Blanca',
  prepSpeed: 1,
  patienceBonus: 1,
  trayCapacity: 3,
  tipBonus: 1.1,
  look: { skin: '#f6cfa5', hair: '#e6be5a', hairStyle: 'long', shirt: '#1f1f1f', apron: '#f4ecd8' },
};

/**
 * Blanca's teammates. They are not playable: they move around the bar doing
 * their own things and help in their own way. Looks are placeholders except
 * for the details we know (Alejandro's gold watch).
 *
 * - Mari goes between the coffee machine and the counter: coffee and juice are ready faster.
 * - Alejandro strolls around checking his gold watch and now and then takes a
 *   dish from Blanca's tray to the customer who ordered it.
 * - Andrea looks after the customers: every so often she chats with the one
 *   who has been waiting the longest and gives them back some patience.
 */
export const HELPERS = {
  mari: {
    name: 'Mari',
    prepBonus: { coffee: 1.6, juice: 1.6 },
    look: { skin: '#ffdbac', hair: '#8b4513', hairStyle: 'bun', shirt: '#1f1f1f', apron: '#f4ecd8' },
  },
  andrea: {
    name: 'Andrea',
    every: [13, 20],
    patienceBoost: 0.5,
    look: { skin: '#e0ac69', hair: '#1a1a1a', hairStyle: 'ponytail', shirt: '#1f1f1f', apron: '#f4ecd8' },
  },
  alejandro: {
    name: 'Alejandro',
    every: [9, 15],
    look: { skin: '#f1c27d', hair: '#2c1b10', hairStyle: 'short', shirt: '#1f1f1f', apron: '#f4ecd8', beard: true, watch: true },
  },
};

/** Football on the TV: now and then there is a goal and the customers cheer. */
export const TV_GOALS = { every: [28, 45], patienceBoost: 0.15 };

/** Daily challenge twists. One is picked per day and applied to everyone. */
export const DAILY_TWISTS = [
  { id: 'coffeeRush', coffeeBias: 4 },
  { id: 'impatient', patience: 0.8, tip: 1.3 },
  { id: 'bigGroups', extraItem: 0.5 },
  { id: 'festival', spawn: 0.8, tip: 1.5 },
  { id: 'critics', criticWeight: 6 },
  { id: 'bossDay', bossEvery: 0.5 },
];

/**
 * Endless rush hour: the original arcade mode with lives and a difficulty ramp.
 * Used for the competitive modes (rush hour and the daily challenge).
 */
export const RUSH_LEVEL = {
  id: 'rush',
  stations: STATIONS,
  strikes: MAX_STRIKES,
  boss: true,
  endless: true,
  helpers: ['mari', 'andrea', 'alejandro'],
};

const ALL = STATIONS;

/**
 * A week at Álvaro's: one level per day, introducing items little by little.
 * Shifts have a fixed length, customers who get tired just leave without a tip
 * (no lives), and the score earns 1 to 3 stars (`targets`).
 *
 * spawn: seconds between customers at the start and at the end of the shift.
 * patience: multiplier for customer patience. maxOrder: biggest order size.
 * guide: show a pointing hand that suggests the next tap.
 */
export const WEEK = [
  {
    id: 'monday',
    boss: true,
    helpers: ['mari', 'andrea', 'alejandro'],
    stations: ['coffee', 'toast'],
    customers: ['regular', 'kid'],
    duration: 90,
    spawn: [7, 5.5],
    patience: 2.2,
    maxOrder: 1,
    startMinutes: 8 * 60,
    guide: true,
    targets: [60, 170, 270],
  },
  {
    id: 'tuesday',
    boss: true,
    helpers: ['mari', 'andrea', 'alejandro'],
    stations: ['coffee', 'juice', 'toast'],
    customers: ['regular', 'kid'],
    duration: 100,
    spawn: [6.5, 5],
    patience: 2,
    maxOrder: 2,
    startMinutes: 8 * 60,
    guide: true,
    targets: [70, 190, 380],
  },
  {
    id: 'wednesday',
    boss: true,
    helpers: ['mari', 'andrea', 'alejandro'],
    stations: ['coffee', 'juice', 'toast', 'beer', 'tapa'],
    customers: ['regular', 'kid', 'hurry'],
    duration: 110,
    spawn: [6, 4.5],
    patience: 1.8,
    maxOrder: 2,
    startMinutes: 11 * 60 + 30,
    targets: [100, 270, 500],
  },
  {
    id: 'thursday',
    boss: true,
    helpers: ['mari', 'andrea', 'alejandro'],
    stations: ALL,
    customers: ['regular', 'kid', 'hurry', 'tourist'],
    duration: 120,
    spawn: [5.5, 4],
    patience: 1.6,
    maxOrder: 2,
    startMinutes: 12 * 60 + 30,
    targets: [130, 320, 800],
  },
  {
    id: 'friday',
    boss: true,
    helpers: ['mari', 'andrea', 'alejandro'],
    stations: ALL,
    customers: ['regular', 'kid', 'hurry', 'tourist'],
    duration: 120,
    spawn: [5, 3.5],
    patience: 1.45,
    maxOrder: 3,
    startMinutes: 13 * 60,
    targets: [100, 260, 800],
  },
  {
    id: 'saturday',
    boss: true,
    helpers: ['mari', 'andrea', 'alejandro'],
    stations: ALL,
    customers: ['regular', 'kid', 'hurry', 'tourist', 'critic'],
    duration: 120,
    spawn: [4.8, 3.3],
    patience: 1.35,
    maxOrder: 3,
    startMinutes: 12 * 60,
    targets: [90, 250, 1050],
  },
  {
    id: 'sunday',
    boss: true,
    helpers: ['mari', 'andrea', 'alejandro'],
    stations: ALL,
    customers: ['regular', 'kid', 'hurry', 'tourist', 'critic'],
    duration: 120,
    spawn: [4.5, 3],
    patience: 1.3,
    maxOrder: 3,
    startMinutes: 10 * 60,
    targets: [80, 220, 950],
  },
];

// Items each day introduces, so the game can announce them.
WEEK.forEach((day, i) => {
  const before = new Set(i > 0 ? WEEK[i - 1].stations : []);
  day.intro = i > 0 ? day.stations.filter((id) => !before.has(id)) : [];

});
