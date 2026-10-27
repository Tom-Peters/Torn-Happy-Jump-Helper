# Torn Happy Jump Helper — v0.9.8

**Current incremental test release: v0.9.8 · Author: IamEEKY**

[**Update the main TornPDA userscript**](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper.user.js)

This release validates the existing **7-day Progress chart and Show partial days toggle** without changing the HJ floating-button startup, automatic refresh on opening, training formula, eight-tab full-screen UI, 22:00–08:00 local quiet hours, or your saved **Torn $50m weekly budget**.

## Progress: trustworthy observations and comparisons

The **Progress → 7-day [stat] · observed vs planned** chart shows:

- **Observed (matched):** real API stat differences only during saved intervals whose *original forecast* targeted the displayed stat.
- **Scheduled (matched):** projected gains from that original forecast over **those same intervals**. A forecast is a hypothetical plan, not a record of actual gym actions.
- **Recorded:** a single observed bar on days that have measurements but no trustworthy same-stat forecast. No invented zero-gain forecast is shown.
- **Recorded today / Latest recorded gain:** previously working snapshot-based totals remain intact; a zero-change refresh cannot overwrite your latest meaningful gain.

**Important fix:** v0.9.7 inferred the interval's `stat` from whichever battle stat changed, but could keep the forecast from a *different* training stat. In v0.9.8, new checkpoints explicitly store `forecastStat` separately from the observed stat. Only a genuinely matching forecastStat is used for paired bars. Old v0.9.3–0.9.7 checkpoints that lack `forecastStat` remain visible as recorded observations, but are **not retroactively assumed comparable**.

### Coverage toggle

**Show partial days** is ON by default, is stored locally as `show-partial`, and remains set after an HJ reload:

- **ON · Show all:** show days with actual recorded observations, labelled Partial or Covered.
- **OFF · Covered only:** show only days that meet coverage rules; when none qualify, explain that and allow switching partial days back on.
- **Covered:** a **completed UTC day**, observations starting within 15 minutes of midnight and ending within 15 minutes of the day's end, at least **23 hours of distinct interval coverage**, no checkpoint interval longer than 2 hours, no gap longer than 2 hours, and at least one matching focus-stat forecast interval. Overlapping or duplicate checkpoints cannot inflate coverage.
- Covered is **snapshot coverage**, not proof every Torn gym action was performed or individually logged. Current/unfinished UTC days remain Partial. Missing days aren't interpreted as zero training.

The chart toggle changes **display only**. It never removes your verification ledger, old training observations, saved budget or settings. Cross-midnight refresh intervals are assigned to the day of the ending refresh and cannot make that date qualify as fully covered.

## Optional Torn-log reconciliation — planned, disabled

Torn offers a restricted log API and scoped-key possibilities. **v0.9.8 does not call `/user/log`, request extra permissions, read other user activity, or import historical gym sessions.** An opt-in gym-log reconciliation design is documented in [docs/optional-gym-log-reconciliation.md](docs/optional-gym-log-reconciliation.md). The exact permission scopes and log schemas must be verified before a separate implementation. Individual session history is deferred.

## Existing features unchanged

- HJ ◉ floating launcher with a full-screen **Today, Compare, Schedule, Supplies, Gyms, Perks & books, Progress, Settings** interface.
- **Refresh Torn data every time HJ opens**, with no background API polling.
- Gym modifiers normalized correctly for Torn v2, accurate single-train gain estimates and per-train, 24-hour and seven-day planning.
- Happy jump and regular training comparison, market/budget estimates and point-refill safeguards.
- Configurable **22:00–08:00 local sleep hours** and estimated wasted regeneration during sleep.
- Locally stored stat checkpoints and rolling verification (bounded history). All gameplay remains read-only/manual.

## Install and recovery

1. Keep **one** main HJ helper enabled. Disable any duplicate/Advanced/Companion versions.
2. Update it from the [v0.9.8 raw userscript](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper.user.js), injection **END**.
3. Reload Torn, tap HJ ◉ and confirm the header says **v0.9.8**.
4. In **Progress**, toggle **Show partial days** off and on. Confirm the observed totals remain unchanged; reopen HJ to verify the preference persists.

If the button disappears, disable the new version and use the independently installable [**v0.9.6 phone-confirmed recovery script**](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/archive/Torn-Happy-Jump-Helper-v0.9.6-known-good.user.js). An independent [v0.9.7 previous-chart build](archive/Torn-Happy-Jump-Helper-v0.9.7-previous.user.js) is also archived, but was not independently confirmed on the phone. **Never clear local storage when rolling back.**

## Validation and privacy

**39/39 targeted v0.9.8 regression tests passed** using simulated TornPDA/Torn API responses, including:

- Floating launcher, on-open refresh, existing gym/energy calculations and sleep rules.
- Persisted toggle state across fresh injection and preserved local history.
- Correct observed/forecast pairing when the *actual trained stat differs from the planned stat*.
- Accurate legacy observations without inventing comparable old forecasts.
- Duplicate/overlapping checkpoints staying Partial, and an actually near-full tracked UTC day qualifying as Covered.

Source parses as JavaScript and stays below the existing compact-helper size guard (**55.9 KB**). **Live v0.9.8 Android behaviour and the full GitHub Actions suite are not yet independently confirmed.** Source size has not been established as the earlier launcher regression cause.

No real Torn API keys, private account records, balances or personal observations are included in this public repository; checkpoints remain on-device.

MIT · IamEEKY · [Historical release notes](docs/legacy-release-notes.md).
