# v0.12.7 — First-overdose dose breakdown and safer recovery hold

**Author:** IamEEKY. **Channel:** independent, versioned TornPDA preview. Prior stable, permanent preview, and versioned URLs unchanged.

## What's new

- A small, **collapsed dose-by-dose breakdown** is now available for both candy and eDVD Happy Jumps under **Compare → Happy Jump break-even**. It shows the modeled chance that the **first** overdose occurs on each of four Xanax tablets or the final Ecstasy, the cash purchased up to that dose, replacement buying-price value of consumables already used, pre-OD gym gains, and Energy/Happiness lost.
- The first-OD probabilities are calculated as survival of all prior doses multiplied by the user's **assumed** chance of overdose for that dose. The sum of all first-OD probabilities plus the full-stack success probability should be 100% (up to numerical rounding).
- The dose that causes an overdose **still counts as consumed**. A probability-weighted total of purchase spending and replacement buying-price value on failed attempts is exposed internally to test and audit; unknown replacement prices stay **unknown**, never zero.
- An overdose reported via **Today → Report Xanax/Ecstasy OD** now hides the normally encouraging Happy Jump card and *suspends the entire Schedule view*. This avoids stale due-now pills, refills or training times being mistaken for real instructions while recovering. The floating HJ button continues to display its warning.
- A Xanax OD hold shows the estimated **5,000-minute untreated reference hospital window** from the manually recorded time, alongside recently refreshed Energy, Happiness and drug cooldown where available. **It is not the actual hospital timer.** Medical treatment, revives, true event timing and other game effects can alter the user's real hospital state.
- An Ecstasy OD hold does **not** incorrectly borrow Xanax's long hospital penalty. It explicitly notes the Energy/Happiness reset and the need to inspect actual status.
- **Clear hold is a two-stage action**: first review the warning, then separately confirm that Torn has been checked and the player has recovered. The user can cancel. On confirmation, the script refreshes Torn data to rebuild its forecasts. No auto-detection of an OD from empty bars; no automatic clearance.
- All features are read-only as to Torn gameplay. The manual OD report stays in the script's local storage only.

## Important modeling boundaries

- The per-dose overdose percentages are **optional user what-if values**. Do not represent them as live or official odds, actual personal odds, or a reliable safety guarantee. The user must account for faction or company perks in their own assumption; the script never invents those modifiers.
- The numerical forecast still stops its training branch at first overdose; it **does not model training that might be recovered later**. The expanded breakdown makes this conservatism transparent; particularly for Ecstasy, the actual losses could be less than a no-recovery forecast when enough time remains.
- The item replacement valuation uses market **asking/buying prices**, not a verified resale opportunity cost. It is shown separately from actual purchases and is not double-counted in gains.
- **Xanax OD:** according to the Torn Wiki, loses Energy, Happiness and Nerve, normally ~5,000 minutes hospitalized, with increased drug cooldown/addiction. **Ecstasy OD:** loses Energy and Happiness without a documented Xanax-type hospital penalty. The script does not simulate rehabilitation, hospital treatments, revival or medical advice.
- UI checks only the existence and freshness of the current read-only API bars and cooldowns; these selections do not authoritatively confirm hospital release. Always check Torn directly.
- No scheduled automatic actions, automatic drug use, remote notifications or API key publication.

## QA

`test/overdose-stages-recovery-0127.test.js` tests five-stage first-OD probabilities and consumed costs, unknown-price handling, recovery reference times, fresh versus stale bars, interruption of Today/Schedule, explicit two-step confirmation and cancellation, plus existing v0.12.6 tests. GitHub Actions checks syntax and all tests.

## References

- [Torn Wiki — Drugs](https://wiki.torn.com/wiki/Drugs)
- [Torn Wiki — Ecstasy](https://wiki.torn.com/wiki/Ecstasy)
