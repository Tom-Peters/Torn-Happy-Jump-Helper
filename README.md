# Torn Happy Jump Helper — v0.9.4

**Current main test release: v0.9.4 · Author: IamEEKY**

**[Update the main TornPDA userscript](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper.user.js)**

The main launcher, full-screen mobile dashboard and sleeping-hours planner retain the designs confirmed working on Android in v0.9.3.

## v0.9.4 — make rolling verification meaningful

The phone-confirmed v0.9.3 Progress screenshot showed a genuine **one-train Strength increase**, but displayed it beside the simulator's entire **hypothetical interval schedule**, which was not a like-for-like comparison. The old once-per-day snapshot card also showed zero for "Observed changes" despite a successful rolling observation.

**Fixed:**

- **Progress → Observed stat gains · last seven days** becomes the source of truth for measured stat changes. The obsolete once-per-day zero-value "Observed changes" card has been removed.
- Every successful live refresh continues storing observed changes for all four stats, grouped by the **UTC date the refresh ended**. Missing intervals and the period before the first baseline are not invented as zero gains.
- At a successful refresh the helper captures the current gym ID and estimated **gain for a single normal gym train** for each stat, alongside the regular forecast.
- After the next refresh, when **exactly one stat has increased**, the gym hasn't changed, and the measured increase is within **12% per inferred train** of the saved standard-train estimate, Progress can show the **inferred number of normal trains** and the estimated/observed gain per train. The inferred count is never presented as confirmed gameplay data.
- Unusual gains, multiple changing stats, changed gyms and missing historical baselines are labelled **not reliably comparable**. They do not generate a misleading calibration score.
- Existing v0.9.3 ledger entries remain readable. Where their old baseline lacks single-train data, the UI may show a clearly labelled **current single-train reference**; this is **not** a matched historical estimate.
- The simulator's unverified full-interval theoretical gains are no longer placed next to one observed train as though they should match.

This is an observation and plausibility check, not proof of which gym actions, bonuses, books or Xanax were used. Your stored observations remain local. The bounded 30-day/120-entry rolling ledger, seven-day Progress view and manual **Clear rolling history** action are unchanged.

## What remains working

- Floating **HJ ◉** launcher, edge-to-edge full-screen UI and eight tabs.
- **10pm–8am local** default sleep preference, editable in Settings.
- Sleep-aware manual schedule and predicted capped energy waste.
- Correct Torn v2 gym dots, verified per-train model and current gym result comparison.
- Read-only seven-day training strategies, refill checks, costs, and **Torn $50 million weekly budget**.

## Install / rollback

1. In TornPDA keep exactly **one** enabled main HJ script; disable duplicate/Advanced/Companion variants.
2. Update the existing script with the [current raw v0.9.4 source](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper.user.js), injection **END**.
3. Reload Torn and check that the floating button launches a full-screen panel marked **v0.9.4**.
4. Refresh live data, train in Torn, refresh again, and inspect the **Progress** tab. The existing v0.9.3 observation history will still be displayed.

If this update fails on Android, disable it and use the independently installable **[v0.9.3 confirmed-working recovery script](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/archive/Torn-Happy-Jump-Helper-v0.9.3-known-good.user.js)**. Do not clear local storage.

## Tests and remaining limitations

**27/27 focused mock TornPDA regression tests passed**, including immediate HJ launcher boot, the full-screen panel, gym-unit scale, sleep hours, refill handling, budget, unchanged legacy observations, synthetic one-train matching, and deliberate rejection of ambiguous multi-stat comparisons. The main file remains approximately **53 KB**.

Android behaviour of v0.9.4 and the GitHub Actions full suite are **not yet independently verified**. Automatic 15-minute checks and expanded verified-gym ranking are still deferred to separate, small releases. Estimated seven-day training gains depend on realistic future activity, cooldowns and available resources; rolling verification should not be used as a score of adherence.

No private API keys, personal training records or financial data are committed. Read-only, manual actions only. MIT · IamEEKY.

[Historical release notes](docs/legacy-release-notes.md)
