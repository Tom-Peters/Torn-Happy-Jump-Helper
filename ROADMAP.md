# Roadmap — Torn Happy Jump Helper

**Author: IamEEKY** · The script is strictly read-only. Nothing here authorises automated Torn actions.

## v0.1 — Delivered

- [x] TornPDA userscript with floating mobile dashboard
- [x] Manual-only API refresh, live countdowns between refreshes
- [x] API v2 energy/happy/cooldowns/battle stats/gym/inventory/refill status
- [x] Global-cached item-market listings with quantity-weighted basket costs
- [x] Candies, eDVDs, Xanax and daily points refill comparisons
- [x] Cost/value-ranked and speed-ranked weekly training estimates
- [x] Booster limit enforcement, Candy modifier, eDVD perk, happy-loss perk
- [x] Rules-compliant player-operated step-by-step checklists
- [x] Model warnings, missing-price detection, rate limiter, local preferences
- [x] Unit tests for price depth, boost limits, stats, and missing data

## v0.2 — Priority accuracy work

- [ ] **Calibrate gym gains**: manually entered actual train observations (energy, happy, exact gain), compare predicted vs actual and generate confidence bands; do not store raw player history in repository.
- [ ] **Discrete event 7-day schedule simulation**, with actual reset boundaries, intermittent online hours, drug cooldown as interval (6–8h Xanax, 200–231 min Ecstasy), booster cooldown rollover, natural energy ticks, daily refill timing and Happy expiry. Separate sustained strategy from one-off jump.
- [ ] **Optimise mixtures**, rather than predefined recipes: bounded integer optimiser over booster combinations, drug timing, energy drinks, points and inventory; Pareto frontier of dollars, stat gains, sleep/activity time and OD/addiction exposure.
- [ ] **Refill availability today** incorporated into a dated schedule (the current weekly model assumes an average of seven available future refills).
- [ ] **Inventory pagination** beyond 250 items and API cache age display per category.
- [ ] **Gym eligibility / unlocked state**: source actual eligibility before recommending swaps; never assume every gym in global listing can be selected.
- [ ] **Market slippage**: compute affordable weekly purchase quantities, fallback for missing depth and partial buys, option to compare city-shop candy separately (purchases always manual).

## v0.3 — Broader stat growth strategy

- [ ] Side-by-side normal training, regular Xanax, low-addiction candy jumps, full eDVD jumps, FHC/energy drinks, books, gym changes, point-refill strategies and stat enhancers.
- [ ] Realistic addiction/rehab cost and time budget, overdose probability ranges and lost-energy scenarios.
- [ ] Optional, permission-scoped detection of *current* applicable faction, job, education and book perks with manual override.
- [ ] Seasonal event calendars for World Diabetes Day, special books and time-limited perks, with estimates clearly marked.
- [ ] Housing-rental ROI including private island happiness, staff costs, and payback time.
- [ ] Graduation alert: stop Happy jumping when expected incremental gains no longer beat direct energy training after opportunity cost.
- [ ] Goal planner: choose target stats/ratios and budget horizon, simulate time and spending to reach them.

## v0.4 — Insights & tracking

- [ ] Optional opt-in **on-device** manual gain diary, sparklines, projection-vs-observed error, weekly stat velocity and spend efficiency.
- [ ] Local export/import without keys, tokens or personal details in publicly published assets.
- [ ] Different profiles by stage (new player, returning player, advanced, endgame), all data opt-in and local.

## Engineering acceptance gates

1. Zero POST/PUT/PATCH/DELETE traffic, zero Torn gameplay clicks/actions, zero background page scraping.
2. Native TornPDA request bridge works on Android and iOS (integration test required on device).
3. Key never stored, logged, added to query strings, or transmitted to any host other than Torn's official API.
4. Missing/stale market data never silently represented as a live price.
5. Golden simulation fixtures cover quarter-hour resets, cooldown boundaries, partial stock, donor/non-donor and dynamic perk changes.
6. Model errors and assumptions always visible; no unsupported precision or guaranteed gains.
7. Cite the API contract and official wiki when mechanics change.
