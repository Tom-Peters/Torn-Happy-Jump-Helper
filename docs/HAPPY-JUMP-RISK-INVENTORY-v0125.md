# v0.12.5 — Happy Jump risk, consumed inventory and equal-time energy value

**Author:** IamEEKY. **Channel:** independently installed versioned preview. Existing stable and generic preview installers remain unmodified.

## Change summary

Extends the v0.12.4 stress-tested equal-time Happy Jump comparison with:

1. **Optional, explicit user-supplied full-jump completion chance (0–100%)**, blank by default. The chance refers to successfully completing all drugs and the jump workout, not an individual pill's overdose rate. Torn API data does **not** supply a calibrated chance. The adviser never fills one in.
2. **Conditional risk-weighted gain**: when a percentage is entered, expected gain is `chance * full-jump forecast + (1-chance) * pre-jump training gains`. The failed-attempt forecast is deliberately pessimistic and does **not** predict actual overdose aftermath.
3. **Break-even completion chance** to reach **5% more** forecast stats than the best regular-training model over exactly the same window. When this threshold exceeds 100%, the target cannot be met in the simplified model.
4. **Consumed-item opportunity cost**: a second cash value estimates how much it would cost to *replace* all forecast-consumed Xanax, Ecstasy, DVDs/candy and regular-training items, including those already owned. This is a buying-price **proxy**, not a resale-price quote. It is distinct from the existing **out-of-pocket purchase budget** and does not change the affordability of an existing kit.
5. **Energy opportunity comparison**: display actual forecast energy trained during the jump versus the paired same-period regular option. These numbers are **already accounted for** in the stat forecast. Do not double-count them as an extra loss.
6. **Conservative verdict gating**: absent success assumptions, missing item market prices, or unfavourable risk-weighted gain/value all prevent an unconditional "Potentially worthwhile" recommendation. The pre-existing hypothetical gain/price stress test and current-stats gym recommendations remain unchanged.

## Limitations — important

- No official probability estimates were invented. A user-entered value is a **scenario input**, never evidence about the game. Leave it empty unless knowingly experimenting.
- Full-jump failure is approximated as receiving only gains completed *before* the jump. Actual OD timing, happiness losses, recovery time, drugs already consumed, addiction, rehab and alternative strategies after overdose are not simulated.
- The **regular alternative may include Xanax** and is also an idealized successful training forecast. Its own drug risk is not modeled. Treat conditional gain percentages as a sensitivity aid, **not a statistically calibrated expected-value comparison**.
- Replacement values are fetched market **buying prices**, not realized resale proceeds. Price gaps and stock limitations may make replacement values unknown; never convert unknown into zero.
- Market prices and current Torn state must be refreshed; pre-existing stale-data gates still apply. No gameplay-changing API calls or in-game automatic actions.
- The calculator's 5% guardrail is a product decision rule, not a Torn mechanic.
- The v0.12.4 version and the permanent preview URL remain unchanged; verify the button, settings persistence and conditional comparison on a real phone before promotion.

## Testing

The v0.12.5 regression fixture exercises launcher boot, both jump methods, old stress tests, stale state, price gating, synthetic odds arithmetic, missing odds, invalid inputs, zero additional spending with nonzero inventory opportunity cost, unpriced stock and cache invalidation. GitHub Actions also checks `node --check` and the repository's no-mutation safeguard.
