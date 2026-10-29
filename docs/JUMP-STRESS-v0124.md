# v0.12.4 — Sensitivity and confidence guard for Happy Jump decisions

**Author:** IamEEKY. **Status:** versioned preview only. Do not promote the stable or permanent preview without real TornPDA testing.

## What's implemented

The Happy Jump adviser in v0.12.3 compared a candy or eDVD jump with the strongest regular-training plan over the **same amount of time**. v0.12.4 adds an explicit **scenario stress check** before labelling a jump *Potentially worthwhile*.

For each affordable, schedulable jump:
- **Base forecast** stays identical: predicted jump and regular gains, out-of-pocket costs, jump completion window and normal marginal costs per additional 1,000 stat points.
- **Pessimistic gain scenario:** reduce the jump's forecast gain by 10% and increase regular training's forecast gain by 10%.
- **Optimistic gain scenario:** increase jump gains by 10% and reduce regular gains by 10%.
- **Price stress:** increase the jump's predicted new-cash expenditure by 20% while keeping the regular baseline unchanged.
- **Guard:** a previous *Potentially worthwhile* verdict becomes *Gain, but poor/unknown value* unless the pessimistic scenario still provides at least 5% incremental gain over its stressed regular baseline **and** the stressed marginal cost remains justified against regular training, or incurs no greater new cash cost.
- Display **energy regeneration lost by jump completion** under both alternatives using their equal-time simulations, without double-counting the energy loss in the gains.

Percentages are illustrative **stress assumptions**, not calibrated measurement error or statistical confidence intervals. These stress checks do not represent the probability of success or failure. They deliberately make it harder to issue an optimistic jump verdict based on a fragile point estimate.

## What still limits an accurate real-money recommendation

1. Torn overdose odds, rehab/addiction impacts, item resale opportunity costs, and unexpected gameplay interruptions are not in the expected gain calculations.
2. Owned consumables are treated as no **additional cash spent**, even though items have potential resale value.
3. Market estimates can shift; missing prices block scenarios rather than being interpreted as $0.
4. Happy and gym gain formulas and cooldown timing are models. The stress check is algebraic around the final predictions; it is not a full re-simulation of a changed Torn formula.
5. Calibration from comparable verified gym logs is not statistically complete enough to justify numeric confidence intervals. The displayed best/worst are *sensitivity examples* only.
6. Real TornPDA validation is still outstanding; do not replace a working HJ installation automatically.

## Regression coverage

- v0.12.4 script boots and retains the HJ launcher.
- Validates deterministic stress math on known scenarios.
- Ensures a previously favourable but fragile point estimate is **downgraded**, not advertised as safe.
- Verifies the equal-time energy loss calculations are nonnegative, and the complete comparator UI labels their limitations.
- Preserves stale-data guards, unknown-price blocking, high-stat caution and all prior tests.

## Next development options

With device verification, add a meaningful **31-day owned-book timing adviser** which only recommends books actually owned and verifiably usable, and compares their capped benefits against a time-window-matched training forecast. Separately, explore better-stats-per-dollar gym purchase decisions with strict owned/unlocked eligibility.
