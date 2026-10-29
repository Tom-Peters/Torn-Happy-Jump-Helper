# v0.12.2 — seven-day training optimiser

**Author:** IamEEKY · **Release channel:** versioned preview candidate. Stable and permanent preview are unchanged.

## Delivered
The Compare tab now offers four **like-for-like seven-day** regular training estimates:
- Natural regeneration **without** daily points refill
- Natural regeneration **with** daily points refill
- Xanax training **without** daily points refill
- Xanax training **with** daily points refill

All four use the current gym, stat, energy, happiness, relevant perks, cooldowns, sleep hours and purchase inventory. Each scenario is budget-constrained using the existing weekly spending setting; owned inventory contributes zero **additional purchase** cost. Manual gameplay is never automated. A plan requiring Xanax or a points refill is not marked feasible unless at least one corresponding action actually schedules within the budget.

The optimiser presents:
- **Maximum gains:** highest 7-day predicted stat increase among feasible candidates.
- **Lower-cost plan near maximum:** cheapest scenario achieving at least 95% of max forecast gains.
- **Incremental economics:** when the plans differ, expected extra stat for extra cash and approximate cost per additional 1,000 stats.
- Four individual summaries including seven-day gain, spend, trained energy, Xanax/refill counts, plus a selectable **Use this schedule** button.
- Simple efficient trade-off markings for nondominated scenarios.

Selecting a scenario changes only local settings (daily refill on/off), focuses Regular training, and opens the existing Schedule tab. It cannot select a scenario that is missing market prices or exceeds the weekly budget. The normal default planning choice remains **maximum predicted gains**, and manually selected plans are not overwritten. All preview UI, the HJ launcher, log reconciliation, stat snapshots and existing upgrade lab are preserved.

## Important caveats
- These are **model-based estimates**, not verified future gains or a guaranteed optimal game strategy.
- This specifically compares **regular** methods over seven days; Happy Jump is still a distinct one-session plan in the pre-existing comparison, because comparing single-jump and repeatable seven-day figures as though they were equivalent would mislead.
- The 95% threshold is a decision heuristic, not a Torn rule.
- Owned stock is valued at **zero new cash spent**; the lost opportunity to sell owned consumables is not valued.
- Missing Xanax or point prices make those dependent scenarios unavailable rather than silently treating a no-drug or no-refill outcome as successful.
- Risk of overdose, addiction/rehab, market movement, simultaneous training on other stats, imperfect attendance and other uncertain effects are not priced. The original simulator retains its existing mechanics and limitations.
- Market/cooldown and forecast freshness still follow v0.12.1's safe refresh policy. To use current results, open the helper and refresh.

## Testing
Dedicated mocked cases cover the four scenarios, max-gain and 95%-value rankings, zero-cash budgets, missing listings, owned stock, safe application and UI/launcher preservation. CI checks the versioned script and all prior tests. Do not publish private API keys or account records.

## Next phase
After TornPDA device testing, implement verified per-stat gym opportunity costs, scenario reliability ranges, and owned-book timing across 31-day training plans.

**Installation:** versioned preview `Torn-Happy-Jump-Helper-v0.12.2-preview.user.js`. Leave stable `Torn-Happy-Jump-Helper.user.js` and permanent `Torn-Happy-Jump-Helper-preview.user.js` untouched until the user approves mobile promotion.