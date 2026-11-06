// Every mini-game, in the order they were added. Each module exports one
// definition: { id, who, create(run) }. See run.js for the contract.

import pour from './pour.js';
import watch from './watch.js';
import hide from './hide.js';
import calm from './calm.js';
import toast from './toast.js';
import wipe from './wipe.js';
import coffee from './coffee.js';
import penalty from './penalty.js';
import count from './count.js';
import order from './order.js';
import stack from './stack.js';
import fly from './fly.js';
import channel from './channel.js';
import tips from './tips.js';
import shutter from './shutter.js';

export const GAMES = [pour, watch, hide, calm, toast, wipe, coffee, penalty, count, order, stack, fly, channel, tips, shutter];

export const MINIGAME_IDS = GAMES.map((g) => g.id);
