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
  spawnStart: 4.0,
  spawnMin: 1.3,
  patienceMinFactor: 0.7,
  rampSeconds: 180,
};

export const SEATS = 4;
export const MAX_STRIKES = 3;

/**
 * The boss event: Pepe Nacho shows up to keep an eye on things.
 * While he is around, tips are multiplied.
 */
export const BOSS = {
  name: 'Pepe Nacho',
  firstAfter: 35,
  every: [55, 85],
  duration: 12,
  tipMult: 2,
  look: { skin: '#e0ac69', hair: '#4a4a4a', hairStyle: 'bald', shirt: '#ecf0f1', accessory: 'boss' },
};

/**
 * Bar staff. Blanca is the main character and is always available.
 * The rest unlock with the total tips earned across all shifts (`unlock`).
 * Looks are placeholders until we have each person's description.
 *
 * Abilities:
 * - prepSpeed: multiplier for every station.
 * - prepBonus: extra multiplier for specific items.
 * - patienceBonus: multiplier for customer patience.
 * - trayCapacity: how many items fit on the tray.
 * - tipBonus: multiplier for every tip.
 */
export const STAFF = [
  {
    id: 'blanca',
    name: 'Blanca',
    unlock: 0,
    prepSpeed: 1,
    patienceBonus: 1,
    trayCapacity: 3,
    tipBonus: 1.1,
    look: { skin: '#f6cfa5', hair: '#e6be5a', hairStyle: 'long', shirt: '#1f1f1f', apron: '#f4ecd8' },
  },
  {
    id: 'mari',
    name: 'Mari',
    unlock: 150,
    prepSpeed: 1,
    prepBonus: { coffee: 1.7, juice: 1.7 },
    patienceBonus: 1,
    trayCapacity: 3,
    tipBonus: 1,
    look: { skin: '#ffdbac', hair: '#8b4513', hairStyle: 'bun', shirt: '#1f1f1f', apron: '#f4ecd8' },
  },
  {
    id: 'andrea',
    name: 'Andrea',
    unlock: 400,
    prepSpeed: 1,
    patienceBonus: 1.25,
    trayCapacity: 3,
    tipBonus: 1,
    look: { skin: '#e0ac69', hair: '#1a1a1a', hairStyle: 'long', shirt: '#1f1f1f', apron: '#f4ecd8' },
  },
  {
    id: 'alejandro',
    name: 'Alejandro',
    unlock: 800,
    prepSpeed: 1,
    patienceBonus: 1,
    trayCapacity: 4,
    tipBonus: 1,
    look: { skin: '#f1c27d', hair: '#2c1b10', hairStyle: 'short', shirt: '#1f1f1f', apron: '#f4ecd8', beard: true },
  },
];

/** Daily challenge twists. One is picked per day and applied to everyone. */
export const DAILY_TWISTS = [
  { id: 'coffeeRush', coffeeBias: 4 },
  { id: 'impatient', patience: 0.8, tip: 1.3 },
  { id: 'bigGroups', extraItem: 0.5 },
  { id: 'festival', spawn: 0.8, tip: 1.5 },
  { id: 'critics', criticWeight: 6 },
  { id: 'bossDay', bossEvery: 0.5 },
];
