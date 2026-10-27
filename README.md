# Torn Happy Jump Helper — v0.9.7

**Current incremental Android release: v0.9.7 · Author: IamEEKY**

**[Install / update the main TornPDA userscript](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper.user.js)**

v0.9.6 was confirmed working on Android. This update keeps its floating launcher, full-screen panel, automatic refresh on each HJ opening, eight tabs, corrected gym-gain formula and **Torn $50m weekly budget**.

## v0.9.7 — better Progress charts

**Progress → 7-day Strength / Defense / Speed / Dexterity · observed vs planned** shows paired bars:

- **Observed**: only actual stat differences captured between successful API refreshes.
- **Scheduled**: only the hypothetical gains from the **same saved refresh intervals**, when the previously selected training stat matches the chart's focus stat. It is not an assertion that those gym actions occurred.
- Different focus-stat forecasts are not mixed together; days with no matching intervals show 0 comparable intervals rather than fabricated gains.

A persistent **Show partial days** toggle is **ON** by default:

- **ON · Show all**: shows any day that contains usable recorded observations; bars are labelled **Partial** or **Covered**.
- **OFF · Covered only**: hides partial bars. If no day qualifies, it explains why and lets the user switch partial days back on. Observed gain totals and existing data are never deleted by the toggle.
- **Covered** is deliberately stringent: snapshot intervals must span almost the entire UTC day (near 00:00 through 24:00), contain at least 23 hours of interval coverage, have no gap between recorded endpoints longer than two hours, and include at least one comparable interval. It is **not** a guarantee that every manual Torn gym action was independently logged. The current, unfinished UTC day normally stays **Partial**.

The previous **Recorded today**, **Latest recorded gain**, no-change-check explanations, observed stat history and rolling one-train comparisons remain in Progress.

### Why the chart may be partial

Stat differences from Torn API snapshots cannot reconstruct every individual training event if tracking only began after training or a refresh interval spans midnight. The partial-day toggle changes *display only*, not observations or estimates.

## Planned optional gym-log reconciliation (not enabled)

Torn has a restricted `/user/log` API, and custom keys can be scoped to selected log categories. We will consider a separate **explicit opt-in** gym-only reconciliation feature that safely deduplicates logs against stat snapshots, but **v0.9.7 does not access user logs or require any new API permissions**. Individual session-history screens are deferred.

Implementation outline: [Optional gym-log reconciliation design](docs/optional-gym-log-reconciliation.md).

## Existing features

- Read-only maximum-gain regular and single Happy-jump planning with per-train, 24-hour and seven-day forecasts, market estimates, refills and supply checks.
- Sleep-aware **22:00–08:00 local** default schedule with editable hours and predicted regeneration-cap waste.
- Full-screen **Today, Compare, Schedule, Supplies, Gyms, Perks & books, Progress, Settings** tabs.
- User-confirmed gym access safeguards; gym optimisation upgrades remain deferred.
- Automatic refresh when the HJ launcher is pressed to open, with no background API polling.

## Install and rollback

1. Keep exactly **one** main HJ script enabled in TornPDA. Disable duplicate, Enhanced, Advanced or Companion scripts.
2. Update it using the main raw link above, set injection to **END**, reload Torn and confirm **v0.9.7**.
3. Visit **Progress** to inspect the paired chart and tap **Show partial days** to filter coverage. Tap again to restore all recorded days.

If this update causes the HJ button to disappear, disable it and use the [**phone-confirmed v0.9.6 independent rollback**](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/archive/Torn-Happy-Jump-Helper-v0.9.6-known-good.user.js). Keep only one enabled script and **do not clear local data**.

## Test status and privacy

**35/35 targeted userscript checks passed** in a simulated TornPDA/DOM environment, covering launch, opening refresh, correct gym dots, item and refill arithmetic, sleep rules, existing rolling observations, partial/covered toggling, persistence, and focus-matched observed/planned comparison. The userscript is approximately **55.4 KB**, below the prior roughly 58 KB experimental build whose launcher failed, although file size was never proven to be the cause. **Android v0.9.7 and GitHub Actions are not yet independently confirmed.**

Real keys, player records, finances and gym activity are never committed to the public repository. All observations remain local, all gameplay actions remain manual. MIT · IamEEKY.

[Historical release notes](docs/legacy-release-notes.md)
