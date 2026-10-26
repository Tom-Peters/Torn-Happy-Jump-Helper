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

## v0.2 — Delivered usability, API resilience and goal controls

- [x] High-contrast dark mode + optional bright mode
- [x] Overview, Compare, Steps, Settings tabs, large tap targets and readable plan cards
- [x] Automatically target the weakest battle stat or focus an individual stat
- [x] Choose maximum stat growth or best incremental return on spending
- [x] Optimise across both point-refill and no-refill training methods under one budget
- [x] Category-specific inventory fetch; graceful fallback for Torn API error 21 or incomplete pages
- [x] Travel destination read from Torn API with visible abroad/flying warning
- [x] Simulated TornPDA UI test for navigation, API error 21, travel and no gameplay writes
- [x] 15 engine/UI tests passing in local simulation

## v0.6.2 — Correct refill-used semantics on real account (implemented)

- [x] Reverse misinterpreted Torn v2 `refills.energy` boolean: `true` = used, `false` = unused
- [x] Fail closed if refill status is missing or unexpected
- [x] Unify Today, next-action, schedule and insights via one refill-status resolver
- [x] Local manual `Mark today's refill used` override expires at UTC midnight
- [x] Exclude pre-refill training and refill actions after the user already consumed today's refill
- [x] 49 simulated regression tests (including live-screen error reproduction)

## v0.6.1 — Android Today screen review and refill correctness (implemented)

- [x] 30-point energy refill restores the energy bar *to* its normal cap rather than adding max energy
- [x] Verify actual today's refill availability before proposing training 40 E prior to it
- [x] UTC scheduled-next-action timer with explicit time passed / refreshing status
- [x] Horizontally scrollable 7-tab navigation and condensed recommendations
- [x] Manual recheck interval 15s, keeping Torn API refresh user-initiated
- [x] Regression tests for first-day refill available/used/unknown and unaffordable points
- [x] Confirm 44 engine/UI tests passing; leave live action validation pending

## v0.6 — Read-only Happy Jump Helper full feature overhaul (implemented)

- [x] Preserve 5KB lazy TornPDA launcher with runtime key token and actionable errors
- [x] Next manual training action with countdown and direct 24-hour timetable access
- [x] Seven-tab mobile app, quick stat focus and independent All / Regular / Happy method comparison
- [x] Weighted consumable market quotes, category-paged inventory, partial source provenance and conservative owned-item costs
- [x] Faster request batching with API failures isolated and source-coverage details
- [x] UTC 24-hour / seven-day actions with per-day gains, shopping checklist, and two cooldown-bound scenarios
- [x] Read-only gym improvement prompt for owned or confirmed unlocked-but-unpurchased gyms
- [x] Training-relevant perks and books with 200m cap timing and optional book review thresholds
- [x] Locally saved base stat history and goal projections without key or account uploads
- [x] Memoised simulation and no-Torn-write source assertions
- [x] Engine, pricing, inventory, UI and lazy-load regression tests

### Known v0.6 limitations

- [ ] Live mobile acceptance test of full engine loading, actual Torn API data and visible Gym capture
- [ ] Calibrate expected gains against real completed gym actions and unusual perks or events
- [ ] Train multiple stats within one precisely optimised week instead of recomputing the lowest stat only after refresh
- [ ] Optional attendance/sleep-hour constraints and adaptation after missed actions
- [ ] More advanced probabilistic overdose and addiction/rehab cost scenarios with explicit uncertainty

## v0.4 — Shipped: gym-verified training planner and future targets

- [x] Replace Per week / Per jump display selector with **Training schedule** vs **Happy-jump schedule**
- [x] Next **24 hours** of UTC action steps shown by default; optional **full seven days**
- [x] Use official `torn/gyms` gym multiplier and energy-cost records while distinguishing them from user-specific access
- [x] Manual read-only Gym-page capture and explicit verification of owned / visible-to-buy gyms; 24-hour local verification expiry
- [x] Include **visible unlocked but unpurchased** gyms in comparisons, displaying their one-off membership price
- [x] Exclude locked, unverified or unseen gyms, specialist gyms failing stat ratios and gyms not training the target stat
- [x] Compare better confirmed gyms by gain for the same energy session; never switch or buy automatically
- [x] Filter Perks down to descriptions affecting gym, training, energy, Happy, consumables and cooldowns
- [x] 50m, 100m and 1b single-stat forecasts with compounding gain estimates, dates and projected ongoing spend
- [x] Book activation month/threshold guidance, including 200m for capped 5%-stat books and a configurable gym-book review milestone
- [x] Unit tests for gym visibility/access constraints, specialist eligibility, perk relevance and targets; simulated mobile rendering

### Remaining accuracy improvements

- [ ] Validate TornPDA gym-page DOM detection against the live current layout on Android and iOS
- [ ] Expand accurate book inventory typing and distinguish usable books from display-only copies if official read-only API evidence becomes available
- [ ] Re-run an adaptive post-train calibration for the weekly schedule and future ETA model
- [ ] Recompute gym-specific calendar scenarios after a verified *manual* change in current gym; never assume an unpurchased gym has been bought
- [ ] Account for future unlocks, faction upgrades, market trends and events in long-term scenarios rather than holding all settings constant
- [ ] Different per-stat gym/perk profiles for multi-stat balanced progression rather than applying single-stat pace to every target

## v0.3 — Timestamped simulator and perk/book evidence (delivered)

- [x] Minute-resolution UTC action timetable for the next seven days, user-confirmed parameters and 6–8h Xanax cooldown assumption
- [x] Re-rank alternatives by simulated gym energy, stats and actual item spends under a weekly budget, including no-refill alternatives
- [x] Per-week/per-Happy-jump switch (not applicable for non-jump plans)
- [x] Fetch `user/perks` for consolidated active faction, job, property, education, stock, merit and book effect descriptions without game actions
- [x] Apply identifiable positive gym gain effects and selected active book / company / faction bonuses without misclassifying passive effective combat stats
- [x] Fetch Book category and explain consumed-copy uncertainty
- [x] Save-for-200m advice for four stat books and approximate 31-day gym book scenario gains
- [x] Hypothetical schedule warning while abroad; adjustable return-hour offset
- [x] Dynamic explanation for why a normal Xanax schedule beats Happy jumps at higher base stats

## v0.4 — Priority accuracy work

- [ ] **Calibrate gym gains**: manually entered actual train observations (energy, happy, exact gain), compare predicted vs actual and generate confidence bands; do not store raw player history in repository.
- [ ] **Calibrate and optimise exact event schedules**: the v0.3 minute-resolution simulator uses 7h Xanax and ~4h Ecstasy placeholders. Add probabilistic cooldown bounds (6–8h Xanax, 200–231 min Ecstasy), adaptive replanning after each manual game action, configurable attendance/sleep windows and more precise energy/happy ticks. Separate steady-state weeks from one-off inventory-consuming jumps.
- [ ] **Optimise mixtures**, rather than predefined recipes: bounded integer optimiser over booster combinations, drug timing, energy drinks, points and inventory; Pareto frontier of dollars, stat gains, sleep/activity time and OD/addiction exposure.
- [ ] **Refill availability today** incorporated into a dated schedule (v0.2 now compares refill and no-refill strategies, but assumes seven future daily refills when enabled).
- [ ] **Inventory pagination** beyond 250 items and API cache age display per category.
- [ ] **Gym eligibility / unlocked state**: source actual eligibility before recommending swaps; never assume every gym in global listing can be selected.
- [ ] **Market slippage**: compute affordable weekly purchase quantities, fallback for missing depth and partial buys, option to compare city-shop candy separately (purchases always manual).

## v0.5 — Broader stat growth strategy

- [ ] Side-by-side normal training, regular Xanax, low-addiction candy jumps, full eDVD jumps, FHC/energy drinks, books, gym changes, point-refill strategies and stat enhancers.
- [ ] Realistic addiction/rehab cost and time budget, overdose probability ranges and lost-energy scenarios.
- [ ] Optional, permission-scoped detection of *current* applicable faction, job, education and book perks with manual override.
- [ ] Seasonal event calendars for World Diabetes Day, special books and time-limited perks, with estimates clearly marked.
- [ ] Housing-rental ROI including private island happiness, staff costs, and payback time.
- [ ] Graduation alert: stop Happy jumping when expected incremental gains no longer beat direct energy training after opportunity cost.
- [ ] Goal planner: choose target stats/ratios and budget horizon, simulate time and spending to reach them.

## v0.6 — Insights & tracking

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
