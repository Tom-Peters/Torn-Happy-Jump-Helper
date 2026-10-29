# v0.12 Training Intelligence — approved design

Status: approved scope, not implemented. Keep stable v0.10.22 and preview v0.11.3 untouched until working API integrations and tests are available. Attribution: IamEEKY.

## Goal
One actionable recommendation on Today, with expandable evidence. Never conflate a theoretically useful bonus with one that the player owns, has unlocked, or should activate now. Read-only; no Torn actions or automatic purchases.

## 1. Education
Use the user's completed/current education and the official course catalogue, respecting prerequisites and course time. Recommend the highest expected incremental training benefit for the focused stat (currently Strength), accounting for course duration and other bonuses. Clearly distinguish 'available to start', 'prerequisite needed', 'in progress', and 'already completed'. No fabricated percentages.

## 2. Owned books, with timing logic
Only books confirmed in current inventory. Match each item ID to verified game effects, thresholds, duration, cooldowns, stacking/exclusions, and one-time consumption. Recommend **USE NOW** only if the effect's actual trigger or stat threshold is met and the expected realised benefit over its duration is materially better than waiting. Otherwise show **HOLD — reason** or **UNKNOWN — cannot verify**. For stat-capped effects, check the exact stat and threshold, never substitute an unrelated '200m' heuristic. For time-limited training effects, compare the coming period's realistically scheduled energy/training against later opportunities, with uncertainty shown. Do not suggest consuming an item simply because the player has low stats. Never perform consumption.

## 3. Faction/company unlock opportunities
Read actual faction/company perks where authorised; include active bonuses in forecast only when confirmed. Show unowned perks only as optional unlocks, with exact requirements and incremental training effects, no speculative stacking. Never label locked perks as active. Keep unlock opportunity separate from due-now action.

## 4. Stat-enhancer prices
Retrieve current market price from the Torn API for each applicable item ID (with refresh timestamp and source). Show **price unavailable** when market data cannot be retrieved, rather than fallback to a stale hardcoded price. Compute expected absolute stat increase at the player's current value and relevant stat cap, compare cost per expected extra stat, account for cooldown and opportunity cost; never promise permanent percent gains when capped. Mark market prices as quotes/observations, not guaranteed executable trades. Do not auto-buy.

## 5. Today and launcher
Only one top recommendation, prioritised by verified urgency, impact, opportunity cost, and time sensitivity. Preserve the existing imminent Xanax/training/refill/jump button badge; optionally add a small opportunity marker when there is a genuinely actionable owned book or imminent time-sensitive unlock, but do not let a nonurgent recommendation override due actions. Collapsible 'Why?' explanation. No manual 'I did it' buttons; use verified logs and inventory changes where possible. Unknown state must remain unknown.

## Acceptance tests
- No books in inventory => no book recommendation.
- Owned book whose effect activates only at a specific stat threshold => HOLD until exact threshold; then USE NOW only when timing is beneficial.
- Owned training book during a low-training week => HOLD when a later high-training window is materially better.
- Education recommendations exclude completed courses and correctly handle prerequisites.
- Locked faction/company perks do not alter current gain forecasts.
- Live price unavailable => no made-up cost/ROI.
- A due Xanax action outranks a generic education suggestion on the floating launcher.
- Unknown API fields/permissions => graceful explanation, not fabricated confidence.
- No keys, private account snapshots, employee data or personal information in public tests.
- Stable release unchanged; existing preview functionality and automatic log tracking remain intact.

## Release plan
Implement as a separate versioned preview candidate, add mocked Torn v2 fixtures and deterministic tests, verify CI, then promote to the existing permanent preview URL for phone testing. Keep API calls throttled and refresh only on user opening the helper or an appropriate cache expiry.
