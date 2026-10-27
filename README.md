# Torn Happy Jump Helper — v0.10.0

**Current Android test release: v0.10.0 · Author: IamEEKY**

[**Install or update the main TornPDA HJ userscript**](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper.user.js)

v0.9.9's floating HJ button, full-screen dashboard, eight tabs, on-open refresh and next-action panel were confirmed loading on Android. v0.10.0 preserves that launcher and corrects two display/schedule problems revealed by screenshots.

## Fixed: a multi-train session is not one normal train

**Latest visible gym session** now reads a gym result on the Torn Gym page and:

- Extracts an **explicit repetition count** only when the gym result actually says how many repetitions you completed.
- When no count is present, compares the total gain to the current **one-train** estimate. If it is close to a whole-number multiple (within 12% per inferred train, maximum 150), shows an **equivalent number of normal trains**, clearly labelled *inferred, not verified*. Enhanced happiness, boosts or changed gym conditions may produce a similar gain.
- Compares the session total against the equivalent **total projected gain**, not blindly against one 10 E exercise. If the result is not meaningfully comparable with current conditions, the UI reports **Not comparable** rather than a spurious percentage such as +599%.
- Correctly uses the current gym's energy-per-train in the comparison, including specialist gyms.

This does **not** reconstruct individual gym training actions or silently grant progress. The **Just happened → Next action** section continues to label large increases across API-refresh checkpoints as *snapshot interval changes*, not individual trains.

## Fixed: UK quiet hours (GMT and BST)

- The simulator now explicitly calculates **Europe/London local time** using the last-Sunday-in-March and last-Sunday-in-October UK daylight-saving transitions (01:00 UTC).
- This avoids reliance on an embedded WebView that may report a different timezone from the user's actual UK wall clock. The default sleep window remains **22:00–08:00 UK time**, configurable or disableable in Settings.
- Any suggested next action in a configured sleep window is excluded from the next-action card. Normal training, Xanax, jump supplies and refill actions remain manual.
- A 22:59 UTC suggestion on 27 October **would conflict** with the default 22:00 start and is suppressed. However, if the user has *explicitly set bedtime to 23:00*, a 22:59 training suggestion may be appropriate. The action card now displays the active quiet-hours configuration to make this visible.
- UK summer-time starts/ends are covered by tests, including the October return to GMT.

## Existing features retained

- Full-screen phone interface with the **Today, Compare, Schedule, Supplies, Gyms, Perks & books, Progress and Settings** tabs.
- Accurate Torn API v2 gym-dot normalisation and per-train/24-hour/seven-day maximum-gain forecasts.
- The restored independent four-stat comparison matrix.
- Read-only Happy jump/Xanax planning, market estimates and the saved **Torn $50 million weekly budget** by default.
- A configurable quiet-hours schedule, projected energy wasted at the cap, manual point-refill safeguards.
- Progress charts, partial-day coverage toggle, on-device training snapshots, and **Just happened → Next action** with undoable manual completion notes.
- Live API data refresh on every opening; no automatic background polling or automated Torn game actions.

## Install and rollback

1. Keep only **one** main HJ helper script enabled. Disable duplicate Advanced/Preview/Companion scripts.
2. Update its source using the [raw v0.10.0 script](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper.user.js) and keep TornPDA injection set to **END**.
3. Reload Torn and confirm the HJ button opens a dashboard marked **v0.10.0**. Press HJ to refresh the current Torn data.
4. On the Gym page, train a small batch if appropriate, then check **Latest visible gym session**. With default quiet hours verify no recommendations between 22:00 and 08:00 UK time.

If anything prevents HJ from opening, disable v0.10.0 and install the independent [**v0.9.9 phone-confirmed rollback**](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/archive/Torn-Happy-Jump-Helper-v0.9.9-known-good.user.js). Leave only one enabled and **do not clear your local data**.

## Validation, privacy and limits

**52/52 focused mocked TornPDA regression tests passed**, including loader startup, click-to-refresh, stat ledger, multi-train result parsing, session totals, ambiguous single boosted training, DST transitions, default 22:00–08:00 restrictions, an intentionally changed 23:00 bedtime, refill checks, Progress charts and four-stat comparison. The self-contained main script remains below the **57 KB compact guard**.

Live Android v0.10.0 behaviour and the full GitHub Actions suite are not yet independently confirmed. The detected session's repetition count is a **model-derived equivalent** unless Torn explicitly provides a repetition count. Stat snapshots can include many different actions between refreshes.

No real user API keys, individual personal stats, item inventories, money balances or private player records are included in this public repo. Torn actions remain manual, API calls are read-only, and optional gym-log reconciliation still requires a separate opt-in design.

MIT · IamEEKY · [Historical release notes](docs/legacy-release-notes.md)
