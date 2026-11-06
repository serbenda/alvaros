// User-facing text in English and Spanish. Code and docs stay in English.

const STRINGS = {
  en: {
    title: "Rush Hour at Álvaro's",
    subtitle: 'Serve the regulars before they lose their patience!',
    play: 'Play',
    totalStars: 'Stars',
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
    unlockAt: 'Unlocks with {n} stars',
    unlocked: 'New teammate unlocked: {name}!',
    trayFull: 'TRAY FULL!',
    week: "A week at Álvaro's",
    chooseDay: 'Choose a day',
    rush: 'Rush hour',
    rushDesc: 'Endless, with 3 lives. For the competitive ones.',
    dayLocked: 'Get 1 star on the previous day',
    shiftOver: 'End of shift!',
    nextDay: 'Next day',
    newItem: 'NEW: {name}!',
    noTip: 'NO TIP',
    goal: 'GOAL!',
    helperToday: '{name} is working today!',
    teamTitle: "The Álvaro's team",
    music: 'Music',
    stars: 'Stars',
    starTargets: 'Stars at {a} · {b} · {c}',
    modeRush: 'Rush hour',
    tryAgainStar: 'Get 1 star to unlock the next day!',
    weekDone: 'You completed the week!',
    days: {
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday',
    },
    newCustomer: 'NEW: {name}!',
    combo: 'x{n} COMBO!',
    onFire: '{name} ON FIRE!',
    bossArrives: 'THE BOSS IS HERE!',
    bossLeaves: 'PHEW, THE BOSS LEFT',
    albumCount: '{n} of {total} regulars met',
    locked: '???',
    howToSteps: [
      'Customers sit at the bar and show what they want in a bubble.',
      'Tap a station (coffee, toast…) to prepare it. When it is ready it goes to the tray.',
      'Tap the customer to give it to them. A customer you can serve glows green.',
      'On Monday and Tuesday a little hand shows you what to tap.',
      'Serve quickly for bigger tips. Each day earns 1 to 3 stars and opens the next one.',
      'No rush: if a customer gets tired, they just leave without a tip.',
      'Rush hour is endless with 3 lives, for the competitive ones. Pepe Nacho, the boss, doubles the tips when he shows up!',
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
      blanca: 'You play as Blanca, the heart of the bar.',
      mari: 'Runs the coffee machine: coffee and juice come out faster.',
      andrea: 'Looks after the customers and calms down the ones who wait too long.',
      alejandro: 'Cooks in the kitchen: toast, tapas and menus come out faster.',
      boss: 'The boss. When he shows up, tips are doubled.',
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
      boss: ['Come on, people waiting!', 'Faster, faster!', 'Smile, team!', 'That table is waiting!', 'Good, good…'],
    },
  },
  es: {
    title: "Hora punta en Álvaro's",
    subtitle: '¡Atiende a la clientela antes de que se le acabe la paciencia!',
    play: 'Jugar',
    totalStars: 'Estrellas',
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
    unlockAt: 'Se desbloquea con {n} estrellas',
    unlocked: '¡Nuevo compañero desbloqueado: {name}!',
    trayFull: '¡BANDEJA LLENA!',
    week: "Una semana en Álvaro's",
    chooseDay: 'Elige un día',
    rush: 'Hora punta',
    rushDesc: 'Sin fin y con 3 vidas. Para los más picados.',
    dayLocked: 'Consigue 1 estrella el día anterior',
    shiftOver: '¡Fin del turno!',
    nextDay: 'Siguiente día',
    newItem: '¡NUEVO: {name}!',
    noTip: 'SIN PROPINA',
    goal: '¡GOOOL!',
    helperToday: '¡Hoy trabaja {name}!',
    teamTitle: "El equipo de Álvaro's",
    music: 'Música',
    stars: 'Estrellas',
    starTargets: 'Estrellas con {a} · {b} · {c}',
    modeRush: 'Hora punta',
    tryAgainStar: '¡Consigue 1 estrella para abrir el día siguiente!',
    weekDone: '¡Has completado la semana!',
    days: {
      monday: 'Lunes',
      tuesday: 'Martes',
      wednesday: 'Miércoles',
      thursday: 'Jueves',
      friday: 'Viernes',
      saturday: 'Sábado',
      sunday: 'Domingo',
    },
    newCustomer: '¡NUEVO: {name}!',
    combo: '¡COMBO x{n}!',
    onFire: '¡{name} ON FIRE!',
    bossArrives: '¡QUE VIENE EL JEFE!',
    bossLeaves: 'UF, YA SE FUE EL JEFE',
    albumCount: '{n} de {total} clientes conocidos',
    locked: '???',
    howToSteps: [
      'Los clientes se sientan en la barra y enseñan lo que quieren en un bocadillo.',
      'Toca un puesto (café, tostada…) para prepararlo. Cuando esté listo pasa a la bandeja.',
      'Toca al cliente para dárselo. El cliente al que puedes servir brilla en verde.',
      'El lunes y el martes una manita te enseña qué tocar.',
      'Sirve rápido para sacar más propina. Cada día da de 1 a 3 estrellas y abre el siguiente.',
      'Sin agobios: si un cliente se cansa, solo se va sin dejar propina.',
      'La Hora punta es sin fin y con 3 vidas, para los más picados. ¡Pepe Nacho, el jefe, dobla las propinas cuando aparece!',
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
      blanca: 'Juegas con Blanca, el alma del bar.',
      mari: 'Lleva la cafetera: el café y el zumo salen más rápido.',
      andrea: 'Atiende a la clientela y calma a quien lleva rato esperando.',
      alejandro: 'Cocina en la cocina: tostadas, tapas y menús salen más rápido.',
      boss: 'El jefe. Cuando aparece, las propinas valen el doble.',
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
      boss: ['¡Venga, que hay gente!', '¡Más rápido, más rápido!', '¡Esa sonrisa, equipo!', '¡Que esperan ahí!', 'Bien, bien…'],
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
