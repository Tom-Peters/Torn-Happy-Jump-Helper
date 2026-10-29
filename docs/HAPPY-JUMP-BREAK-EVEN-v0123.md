# v0.12.3 — Happy Jump break-even and stop-jumping advice

**Author:** IamEEKY. **Channel:** independently installed versioned preview; stable and permanent preview channels remain untouched.

## Implemented

The existing 7-day regular optimiser is preserved. The Compare screen now leads with **Happy Jump break-even** for candy and eDVD jumps, and the Today screen has a concise "Is a Happy Jump worth it?" result.

For each affordable, schedulable kit, forecast the Happy Jump to its actual simulated completion time, then calculate four feasible regular-training counterfactuals over **exactly the same time window** (natural/Xanax, with/without point refills). Compare the jump with the **highest-gain affordable** regular alternative. This correctly includes the opportunity cost of natural energy regeneration that would otherwise be trained while waiting for Xanax cooldowns.

Show the paired predicted gains, additional gains and percentage, additional out-of-pocket spend, completion time, and cost per *incremental* 1,000 stats. When an independently priced regular-training improvement exists, compare the incremental prices. Classify the result as:
- **Potentially worthwhile:** projected incremental gain >= 5% and no more new cash, or incremental cost/1,000 gains is no worse than the regular-training upgrade.
- **Regular training preferred:** no incremental gains or projected increase less than 5%.
- **Gain, but poor/unknown value:** gains are positive but extra money is worse value than the regular training upgrade, or no defensible dollar-value benchmark exists.
- **Unable to assess:** essential API data, item prices, kit, cooldown or a complete jump forecast is unavailable.

The 5% edge is a **cautious product decision threshold**, not an official Torn game rule. It is deliberately conservative: model error, item opportunity costs, overdose/addiction and rehab may alter the optimum. There is **no hardcoded stat threshold**; the verdict responds to live stat, happy and gym modifiers.

In Happy Jump mode, a jump currently classed as anything except "Potentially worthwhile" triggers a "Review jump value before stacking" recommendation instead of blindly showing a pill/training instruction on the Today screen. The user can still manually inspect an available jump schedule; no gameplay actions are automated.

## Scope and limitations

- Equal-time forecast comparison is not an unbiased real-world experiment; estimates use the prior simulator's simplifications, including fixed cooldown assumptions, hypothetical perfect action timing, and a modeled happy reset.
- **No overdose probability** is factored into expected stats; as a result, a "Potentially worthwhile" result is not a safe or guaranteed jump recommendation.
- Owned consumables count as zero **new cash spend**, but their resale value and rehabilitation/addiction costs are omitted.
- Market prices, owned items and character data must be refreshed; missing information does not become zero.
- Data collected stays local; do not commit actual player records or real Torn API keys.
- Do not compare a single jump against seven days' regular training and present the result as a direct alternative. The original seven-day scenario optimiser remains available alongside the new equal-time comparison.
- Opening the launcher still triggers full refresh; history, badge, scheduling, gym comparisons and previous features are preserved.

## Reference background

- Torn Wiki, [Happy](https://wiki.torn.com/wiki/Happy) — 15-minute happiness reset and gym relevance.
- Torn Wiki, [Gym](https://wiki.torn.com/wiki/Gym) — community-estimated gain formula and modifiers.
- [Torning, How to Grow Stats When Happy Jumps Stop Paying?](https://torn.ing/guides/how-to-grow-stats-when-happy-jumps-stop-paying) — community context for diminishing happiness value and regular-energy training.

**Test plan:** GitHub Actions checks the new preview, tests boot, equal-time parity, missing-price gating, high-stat declining value, zero-out-of-pocket stock and Happy-mode caution. Verify the HJ button in real TornPDA before changing the permanent preview alias.
