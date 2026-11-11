# TrainingStaxx calculation audit · 0.36.0

Audited 11 November 2026. Author: IamEEKY.

Training forecasts are estimates. Torn has random gym gains, random happiness loss, variable drug cooldowns, overdoses, changing perks and player actions. Neither a forecast nor its proposed timing is an observed result. No claim of 100% exact predictions is made.

## Changes to the live engine

| Area | Previous behaviour | 0.36.0 |
| --- | --- | --- |
| Gym gain | Older common formula, identical stat offsets; unrestricted linear stat term | Vladar/JTS V2 rounded happy multiplier and separate strength, defense, speed and dexterity offsets |
| Stats above 50m | Applied uncapped stats directly | Approximate diminishing-growth term from the original author's linked calculator, Sheet256 M3; no hard cap on stat growth |
| Training perks | Added percentages | Each eligible active perk multiplies the gain; stat-specific bonuses apply only to that stat |
| Happiness loss | Always 50% of energy | 50% mean, reduced by a verified happiness-loss perk, including 3-star Fitness Center; applied sequentially to every train and the simulator |
| Historical calibration | Could silently scale forecasts from unlike sessions | Disabled. Observed sessions stay visible, but unknown pre-train happy/perks cannot calibrate a current forecast |
| Future Xanax cooldown | A fixed seven-hour assumption without a useful range | Seven-hour nominal plan plus separate six/eight-hour sensitivity scenarios; actual current cooldown takes precedence |
| First regular action | Could add drugs before spending existing energy | Models training available energy before drugs and refills |
| Existing jump energy | Could spend the stack and schedule four new Xanax | Preserves full 250-E stack portions, trains only the remainder, and schedules missing doses; a full 1,000-E stack needs no additional Xanax |
| Jump supplies | Four DVDs or 48 lollipops regardless of perks | Uses verified booster capacity, candy/DVD bonuses and candy cooldown reductions. Default five DVDs / 49 lollipops assumes the cooldown ticks below its limit before the final booster |
| Existing Ecstasy boost | Could rebuild the jump after it was already used | A verified Ecstasy event in the current happy-reset window enables training/refilling without scheduling another dose; Xanax happy or DVDs alone do not trigger advice to spend a jump stack |
| Jump refill | Not included | Affordable, available daily refill followed by training at boosted happiness, after the first jump training |
| Long targets | Invented extra acceleration based on distance from initial stat | Clearly labelled constant-weekly-rate references; no predicted completion date |
| Live data | Current gym could remain unchanged between full refreshes | Mini reads re-fetch gym; gym-page reads also update battle stats; perks refresh periodically |
| Action protection | Some screens could rely on older full snapshots | Main coach and hub action feed require recent bars, cooldowns and perks; boosted happy expires across the next quarter-hour boundary |
| Inputs | Zero train cost or invalid regeneration could cause loops | Invalid/incomplete numeric input blocks calculations |

## Formula and sources

The expected gain for one train is:

`(effectiveStat * round4(1 + 0.07 * round4(ln(1 + happy / 250))) + 8 * happy^1.05 + (1 - (happy / 99999)^2) * A + B) / 200000 * gymDots * energyPerTrain * perkMultiplier`

| Stat | A | B |
| --- | ---: | ---: |
| Strength | 1600 | 1700 |
| Defense | 2100 | -600 |
| Speed | 1600 | 2000 |
| Dexterity | 1800 | 1500 |

A batch compounds each individual train and deducts mean happiness loss before the next. Happiness is bounded at 99,999. API gym modifiers are normalised to gym dots. Random noise is deliberately excluded from the mean.

For stats above 50m, the approximation is:

`effectiveStat = 50000000 + (stat - 50000000) / (8.77635 * log10(stat))`

This is a community approximation, not a published Torn server formula. The author's linked workbook contains both old capped sheets and a newer approximation in **Sheet256, M3**. The old hard-capped sheet must not be treated as the current rule. The public announcement confirms continued diminishing growth, but does not disclose the exact formula.

Sources checked:

- [Vladar / Journal of Torn Science: Training Formula V2.0](https://www.torn.com/forums.php?p=threads&t=16182535) — coefficients, nested rounding, separate multiplicative perks and model limitations.
- [Author's linked calculator](https://docs.google.com/spreadsheets/d/1krVMgZT-NKAvPFPl-gjtkJYgcy7c9Ki5S7ZuYA7EAbI/edit) — post-cap approximation above; original forum links this workbook.
- [Chedburn: stat cap removal](https://www.torn.com/forums.php?p=threads&t=16288778) — 2022 change and rough monthly scale examples.
- [Official Gym wiki](https://wiki.torn.com/wiki/Gym) — API dots, 40–60% happiness loss and gym prerequisites. Its displayed old gain formula predates the V2 research above.
- [Fitness Center](https://wiki.torn.com/wiki/Fitness_Center) — 3-star happiness-loss reduction; 10-star gym perk is separate.
- [Drug wiki](https://wiki.torn.com/wiki/Drug) — Xanax energy/happy and 360–480-minute baseline cooldown.
- [Happy](https://wiki.torn.com/wiki/Happy), [Candy](https://wiki.torn.com/wiki/Candy), [Erotic DVD](https://wiki.torn.com/wiki/Erotic_DVD) — reset, cap and booster effects.
- [Item cooldowns](https://wiki.torn.com/wiki/Item_Cooldowns) — capacity and requirement to be below capacity before the next use.
- [Adult Novelties](https://wiki.torn.com/wiki/Adult_Novelties) — 10-star DVD bonus.
- [Points Building](https://wiki.torn.com/wiki/Points_Building) — daily 30-point energy refill and UTC reset.

## What the estimates do not know

- Gym outcomes and happy loss vary randomly. Above-50m and very-high-happy estimates are less certain.
- The minute-resolution schedule assumes you follow its actions. Six/eight-hour results are sensitivity scenarios, not statistical confidence bounds. Special drug cooldown reductions can change actual timers.
- Current perk text is used only when it names an identifiable effect. Unknown descriptions, event bonuses absent from the API, job-point spending, future books/perk changes and future gym unlocks are not invented.
- The booster kit waits for an empty booster timer and permits the final item after cooldown ticks below the cap. Confirm actual Torn controls and finish before the next happy reset. This is a preparation scenario, not automated item use.
- Supplies already owned have zero additional cash cost in the basket, but still have opportunity cost. Prices can change. Free/special refills are not fabricated; check them before spending points.
- Training the stat with the most raw gain per energy is not necessarily the best combat balance. Every stat is shown separately; changing focus only changes this planner.
- API logs without starting happiness, starting stat and active perks cannot safely calibrate a current model. Actual logs, off-plan gains and snapshot deltas remain separate evidence.

## Native placement and verification

Gym coach mounts only inside Torn's `#gymroot`. It shows gain for current usable energy, gain per E, energy-cap timing, boosted-happy expiry, drug cooldown and refill headroom. A new visible gym result invalidates the old coach snapshot and requests a bounded read-only refresh.

Item notes mount only in identified native item rows for Xanax 206, Ecstasy 197 and Erotic DVD 366. Refill notes require an energy-refill control inside a native list/table row on `/points.php`. If an exact supported row is absent, no generic banner is added. Context preference, module-open state, war and recovery holds are respected. This conservative selector policy may leave notes absent on different Torn layouts.

Release validation includes the repository test suite, current-engine numerical regression cases, invalid inputs, sequential Fitness Center loss, UTC refill boundaries, preservation of existing stack, jump refill order, budgets, war/recovery/stale holds, matching immutable snapshot, and PDA quote-normalisation parsing. An isolated DOM fixture exercised all workspace views, native stat selection/disclosure, gym/items/points placement and cleanup on unrelated pages without activating native game buttons.

On-device Torn PDA and real-account API validation remains pending. The local Chromium renderer could not start because the environment denied its socket; DOM checks are not a substitute for an on-device visual pass.


## 0.37.0 - World Diabetes Day

The official [calendar](https://wiki.torn.com/wiki/Calendar) lists triple candy happiness with a personalised 48-hour event slot. Timing comes from the official API v2 `/torn/calendar` and `/user/calendar`, checked against the schemas in [Torn OpenAPI](https://www.torn.com/swagger/openapi.json). Variable events use the personal TCT time on the earliest-start date, plus 48 hours, and must fit inside the published earliest/latest bounds. A malformed/missing personal time cannot activate the multiplier. Reads are foreground-only, hourly after success, with retry backoff; calendar evidence expires after six hours.

Candy gains multiply by three at the simulated consumption timestamp; event-named perk text is excluded from the generic perk multiplier to avoid counting the event twice. Existing book/faction candy perks still multiply normally. The event never triples DVDs or gym gains directly. No future book ownership or activation is assumed.

The value check compares a quick unstacked lollipop boost and a stacked lollipop jump against the strongest feasible regular scenario with the same start/end. It reports additional cash, stat difference, the isolated event bonus, energy-regeneration losses and manual action steps. For an upcoming event, the quick-boost result tells the player to continue regular training and recheck at the start; it does not recommend holding a full bar for days. The stacked scenario explicitly models starting now and waiting. It is not an optimisation of every possible future stacking start time.

Only the existing lollipop basket is priced in this check; higher-happiness candy may offer a different best outcome. The result is explicitly a scenario comparison, not a universal judgment about all Diabetes Day strategies. Ecstasy risk is labelled unknown unless supported by the existing risk model, and owned supplies retain opportunity cost. War, recovery and freshness holds suppress the recommendation.

Validation: three added grouped event cases in the existing current-engine file cover personal slots/boundaries, candy-only multiplication with books and no double count, actual future consumption time, budgets, same-period comparison, upcoming quick-boost advice and war holds. The existing PDA parser and installer parity checks also passed. Live phone validation remains pending.
