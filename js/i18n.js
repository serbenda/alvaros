// User-facing text in English and Spanish. Code and docs stay in English.

const STRINGS = {
  en: {
    title: "Rush Hour at Álvaro's",
    subtitle: 'Serve the regulars before they lose their patience!',
    play: 'Play',
    daily: 'Daily challenge',
    album: 'Regulars album',
    howTo: 'How to play',
    gotIt: 'Got it!',
    back: 'Back',
    best: 'Best',
    paused: 'Paused',
    resume: 'Resume',
    quit: 'Quit to menu',
    gameOver: 'Closing time!',
    retry: 'Play again',
    share: 'Share',
    menu: 'Menu',
    newRecord: 'New record!',
    served: 'Customers served',
    bestCombo: 'Best combo',
    totalTips: 'Total tips',
    modeClassic: 'Classic shift',
    modeDaily: 'Daily challenge · {twist}',
    dailyBest: "Today's best",
    shareText: "I made {score} in tips at Álvaro's! Can you beat me?",
    copied: 'Link copied!',
    soundOn: 'Sound: on',
    soundOff: 'Sound: off',
    team: 'Choose who works the shift',
    unlockAt: 'Unlocks at {tips} total tips',
    unlocked: 'New teammate unlocked: {name}!',
    trayFull: 'TRAY FULL!',
    newCustomer: 'NEW: {name}!',
    combo: 'x{n} COMBO!',
    onFire: '{name} ON FIRE!',
    bossArrives: 'THE BOSS IS HERE!',
    bossLeaves: 'PHEW, THE BOSS LEFT',
    albumCount: '{n} of {total} regulars met',
    locked: '???',
    howToSteps: [
      'Customers sit at the bar and show their order in a bubble.',
      'Tap a station (coffee, beer, toast…) to prepare an item. It goes to the tray when it is ready.',
      'Tap a customer to hand over the items on your tray that they ordered.',
      'Serve full orders fast for bigger tips. Chain orders to build your combo multiplier.',
      'When Pepe Nacho, the boss, shows up, tips are doubled. Do not let him down!',
      'Tap an item on the tray to throw it away.',
      'If 3 customers leave angry, the bar closes. How long can you last?',
    ],
    keyboardHint: 'Keyboard: 1-6 stations · Q W E R customers · Z X C V tray · P pause',
    items: { coffee: 'Coffee', juice: 'Juice', toast: 'Toast', beer: 'Beer', tapa: 'Tapa', menu: 'Menu' },
    phase: { breakfast: 'BREAKFAST!', lunch: 'LUNCH TIME!', afternoon: 'AFTERNOON!' },
    customers: {
      regular: { name: 'The Regular', desc: 'Comes every day. Easy-going.' },
      hurry: { name: 'In a Hurry', desc: 'Short patience, double tips.' },
      kid: { name: 'The Kid', desc: 'Juice and toast. Very patient.' },
      tourist: { name: 'The Tourist', desc: 'Orders a bit of everything.' },
      critic: { name: 'The Critic', desc: 'Big orders, little patience, huge tips.' },
    },
    staff: {
      blanca: 'The heart of the bar. Customers love her: +10% tips.',
      mari: 'Coffee master: coffee and juice ready much faster.',
      andrea: 'Calms everyone down: customers wait 25% longer.',
      alejandro: 'Carries the big tray: room for 4 items.',
    },
    twists: {
      coffeeRush: 'Coffee rush',
      impatient: 'Impatient day',
      bigGroups: 'Big orders',
      festival: 'Local festival',
      critics: 'Critics in town',
      bossDay: 'The boss is around',
    },
    phrases: {
      start: ["We're open!", "Let's go!"],
      good: ['Coming right up!', 'Enjoy!', "That's it!", 'Smooth!', 'Next!'],
      bad: ['Oops, lost one!', 'Sorry, love!', 'Hang on!'],
      boss: ['Come on, people waiting!', 'Faster, faster!'],
    },
  },
  es: {
    title: "Hora punta en Álvaro's",
    subtitle: '¡Atiende a la clientela antes de que se le acabe la paciencia!',
    play: 'Jugar',
    daily: 'Reto del día',
    album: 'Álbum de clientes',
    howTo: 'Cómo se juega',
    gotIt: '¡Entendido!',
    back: 'Volver',
    best: 'Récord',
    paused: 'Pausa',
    resume: 'Seguir',
    quit: 'Salir al menú',
    gameOver: '¡Cerramos!',
    retry: 'Otra vez',
    share: 'Compartir',
    menu: 'Menú',
    newRecord: '¡Nuevo récord!',
    served: 'Clientes atendidos',
    bestCombo: 'Mejor combo',
    totalTips: 'Propinas totales',
    modeClassic: 'Turno clásico',
    modeDaily: 'Reto del día · {twist}',
    dailyBest: 'Récord de hoy',
    shareText: "¡He sacado {score} de propinas en Álvaro's! ¿Me ganas?",
    copied: '¡Enlace copiado!',
    soundOn: 'Sonido: sí',
    soundOff: 'Sonido: no',
    team: 'Elige quién hace el turno',
    unlockAt: 'Se desbloquea con {tips} de propinas',
    unlocked: '¡Nuevo compañero desbloqueado: {name}!',
    trayFull: '¡BANDEJA LLENA!',
    newCustomer: '¡NUEVO: {name}!',
    combo: '¡COMBO x{n}!',
    onFire: '¡{name} ON FIRE!',
    bossArrives: '¡QUE VIENE EL JEFE!',
    bossLeaves: 'UF, YA SE FUE EL JEFE',
    albumCount: '{n} de {total} clientes conocidos',
    locked: '???',
    howToSteps: [
      'Los clientes se sientan en la barra y enseñan su pedido en un bocadillo.',
      'Toca un puesto (café, caña, tostada…) para prepararlo. Cuando esté listo, pasa a la bandeja.',
      'Toca a un cliente para darle lo que haya pedido de tu bandeja.',
      'Sirve pedidos completos rápido para sacar más propina. Encadénalos para subir el combo.',
      'Cuando aparece Pepe Nacho, el jefe, las propinas valen el doble. ¡No le falles!',
      'Toca algo de la bandeja para tirarlo.',
      'Si 3 clientes se van enfadados, se cierra el bar. ¿Cuánto aguantas?',
    ],
    keyboardHint: 'Teclado: 1-6 puestos · Q W E R clientes · Z X C V bandeja · P pausa',
    items: { coffee: 'Café', juice: 'Zumo', toast: 'Tostada', beer: 'Caña', tapa: 'Tapa', menu: 'Menú' },
    phase: { breakfast: '¡DESAYUNOS!', lunch: '¡HORA DE COMER!', afternoon: '¡SOBREMESA!' },
    customers: {
      regular: { name: 'El de siempre', desc: 'Viene todos los días. Tranquilo.' },
      hurry: { name: 'El que va con prisa', desc: 'Poca paciencia, propina doble.' },
      kid: { name: 'El peque', desc: 'Zumo y tostada. Muy paciente.' },
      tourist: { name: 'El turista', desc: 'Pide un poco de todo.' },
      critic: { name: 'El crítico', desc: 'Pedidos grandes, poca paciencia, propinón.' },
    },
    staff: {
      blanca: 'El alma del bar. La clientela la adora: +10 % de propina.',
      mari: 'Maestra cafetera: café y zumo salen mucho más rápido.',
      andrea: 'Lo calma todo: los clientes esperan un 25 % más.',
      alejandro: 'Lleva la bandeja grande: caben 4 cosas.',
    },
    twists: {
      coffeeRush: 'Fiebre del café',
      impatient: 'Día de prisas',
      bigGroups: 'Pedidos grandes',
      festival: 'Fiestas del pueblo',
      critics: 'Críticos en la ciudad',
      bossDay: 'El jefe anda cerca',
    },
    phrases: {
      start: ['¡Abrimos!', '¡Vamos allá!'],
      good: ['¡Marchando!', '¡Que aproveche!', '¡Eso es!', '¡Qué arte!', '¡Siguiente!'],
      bad: ['¡Ay, que se me va!', '¡Perdona, cielo!', '¡Un momentito!'],
      boss: ['¡Venga, que hay gente!', '¡Más rápido, más rápido!'],
    },
  },
};

export const LANGUAGES = Object.keys(STRINGS);

let current = 'en';

export function detectLang() {
  const nav = (typeof navigator !== 'undefined' && navigator.language) || 'en';
  return nav.toLowerCase().startsWith('es') ? 'es' : 'en';
}

export function setLang(lang) {
  current = STRINGS[lang] ? lang : 'en';
}

export function getLang() {
  return current;
}

function lookup(table, key) {
  return key.split('.').reduce((obj, part) => (obj == null ? undefined : obj[part]), table);
}

/** Translates a dotted key. `{name}` placeholders are filled from `params`. */
export function t(key, params) {
  let value = lookup(STRINGS[current], key);
  if (value === undefined) value = lookup(STRINGS.en, key);
  if (value === undefined) return key;
  if (typeof value === 'string' && params) {
    return value.replace(/\{(\w+)\}/g, (_, name) => (params[name] !== undefined ? params[name] : ''));
  }
  return value;
}

/** Formats an amount of tips as money for the current language. */
export function money(amount) {
  return current === 'es' ? `${amount} €` : `€${amount}`;
}
