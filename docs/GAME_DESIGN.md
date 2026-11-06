# Game design

## Goal

A fun, highly replayable game that the regulars of Álvaro's play on their phones, and that promotes the bar: people play while they wait, share their scores and come back to claim prizes.

## Audience

Everyone who goes to the bar: children, grandparents and the competitive regulars. The main mode must be fun at a slow pace; speed is only required in the competitive modes.

## Design pillars

1. **Short sessions.** A shift lasts one to three minutes. Losing is fast and starting again is one tap.
2. **Always one more go.** Every day gives stars, which open the next day and unlock teammates. Records, the daily challenge and the album give reasons to come back.
3. **Recognisable.** The bar, the menu, the staff and their catchphrases are the real ones.
4. **Easy to learn.** One-finger controls: tap a station, tap a customer.

## Core loop

1. A customer sits down with an order of one to three items.
2. The player prepares items at the stations. Each one takes a short time and needs a free slot on the tray.
3. The player taps the customer to hand over the matching items.
4. A full order pays a tip that depends on the items, the customer type, how fast it was served, the combo multiplier and active bonuses.
5. If a customer's patience runs out they leave and the combo is lost. In the week mode that only costs the tip; in rush hour it costs one of three lives.

## A week at Álvaro's

The main mode teaches the game day by day instead of with instructions:

| Day | Stations | Notes |
| --- | --- | --- |
| Monday | Coffee, toast | One item per order, very patient customers, pointing hand |
| Tuesday | + Juice | Orders of up to two items, pointing hand |
| Wednesday | + Beer, tapa | Lunch time starts |
| Thursday | + Menu | All stations |
| Friday | All | Busier, orders of up to three items |
| Saturday | All | The boss shows up, critics appear |
| Sunday | All | The busiest day |

Shifts last 90–120 seconds and always end. A customer who runs out of patience leaves without a tip but costs no life. Star targets were set by simulating players who take 0.8 s, 1.4 s and 2.2 s per tap: a slow player gets at least one star on every weekday.

## Rush hour difficulty

Over the first four minutes, customers arrive more often (from every ~4.5 s to every ~1.6 s) and have less patience (down to 75%). Orders get bigger after 90 seconds. The in-game clock moves from breakfast to lunch to the afternoon, changing what people order.

## Customer types

| Type | Patience | Order size | Tip | Notes |
| --- | --- | --- | --- | --- |
| Regular | Normal | 1–2 | x1 | |
| In a hurry | Short | 1 | x2 | From 15 s |
| Kid | Long | 1 | x1 | Juice or toast only |
| Tourist | Normal | 2–3 | x1.5 | From 25 s |
| Critic | Short | 3 | x3 | Rare, from 45 s |

## Staff

Blanca is the main character and is always available. Her teammates unlock with stars from the week mode and change how the game plays, so each one suits a different strategy:

- **Blanca**: +10% tips.
- **Mari**: coffee and juice prepare much faster.
- **Andrea**: customers are more patient.
- **Alejandro**: carries a tray with four slots.

**Pepe Nacho**, the boss, appears as an event every minute or so. While he is around, tips are doubled. A daily twist can make him show up more often.

## Daily challenge

Uses a random seed based on the date and one twist per day, so every player gets the same challenge on the same day. This is the basis for a fair daily ranking.

## Roadmap

- [ ] Real looks and catchphrases for Mari, Andrea, Alejandro and Pepe Nacho.
- [ ] Shared weekly ranking with Supabase, tournaments and points per staff member.
- [ ] Score card image to share on WhatsApp and Instagram.
- [ ] Real menu items and names from the bar.
- [ ] Prize codes: reach a score to get a code to show at the till.
- [ ] QR poster for the bar.
- [ ] Bar upgrades bought with tips (faster coffee machine, more seats, terrace).
- [ ] Teammates as in-game helpers during rush hour.
- [ ] Random events: a bus of tourists, a football match on TV, the coffee machine breaks.
- [ ] Background music.
- [ ] Installable as an app (web manifest and offline support).
