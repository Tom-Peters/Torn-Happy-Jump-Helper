# Torn Happy Jump Helper — v0.9.5

**Current incremental Android release: v0.9.5 · Author: IamEEKY**

[**Install or update the main TornPDA Happy Jump Helper userscript**](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper.user.js)

The **v0.9.4 launcher, full-screen interface and read-only planning** were confirmed working on Android. v0.9.5 retains the same launcher mount and UI architecture and adds two requested improvements.

## What changed

### Every time you open HJ, refresh current Torn data

- Tapping **HJ ◉ to open the full-screen dashboard** immediately launches one Torn API refresh cycle, including current stats, gym, energy, happiness, cooldowns, prices and inventory.
- The UI can initially show **Refreshing…** while updated data is retrieved. Opening a second time after closing starts another refresh.
- Injection/page load **does not fetch data** until the HJ button is pressed. Simply closing HJ does not fetch data.
- Manual **Refresh data** still works, and requests are guarded against overlap while one refresh is already in progress. There is no 15-minute background polling.
- The refresh also captures a rolling verification checkpoint if a previous stat baseline exists. Re-rendering keeps the selected tab and scroll position.

### Observed daily gains chart in Progress

- **Progress → Daily [focused stat] gains · observed only** displays local day-by-day bars using only observed stat changes from the rolling ledger.
- Uses the current stat selection (Strength, Defense, Speed or Dexterity). Select a different focus stat in Today or Compare to see another series.
- No synthetic missing-day bars and no seven-day forecast disguised as observed data.
- Existing daily totals and cautious per-train estimate below the chart are unchanged.

## Still included

- Accurate Torn API v2 gym dots and observed one-train comparison.
- Maximum-gain read-only regular and Happy jump forecasts with full per-train/24-hour/seven-day breakdowns.
- Default **Torn $50,000,000 weekly budget**, local manual market prices, refills and shopping estimates.
- Sleep-aware training (local **22:00–08:00** default), estimated nighttime energy-cap waste and safe waking/bedtime scheduling.
- Eight tabs, full-screen Android interface, on-device rolling verification history and existing saved settings.
- No gym switching, drug-taking or other gameplay actions are automated. Advanced gym ranking is deferred.

## Install and fallback

1. Update your **single enabled main** Torn Happy Jump Helper script from the current raw file linked above, with injection set to **END**.
2. Disable other Advanced/Preview/Companion/duplicate HJ scripts, and reload Torn.
3. Press HJ ◉ and confirm **v0.9.5**. The button should open the dashboard and start refreshing automatically.
4. To check charts, open **Progress** after collecting at least two successful stat snapshots across real play sessions.

If HJ disappears on this version, restore the independently installable [**phone-verified v0.9.4 rollback**](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/archive/Torn-Happy-Jump-Helper-v0.9.4-known-good.user.js) and disable v0.9.5. Preserve device storage and your existing data.

## Testing and limits

**30/30 targeted userscript regression tests passed**, including immediate launcher creation, auto-refresh once per opening, no refresh on closing or injection, second refresh on reopening, correct per-train estimates, safe refills, time-window summaries, sleep windows, local verification and charts of genuinely observed stat data.

The v0.9.5 file is approximately **54 KB**, compared with approximately 53 KB for phone-confirmed v0.9.4. **Live Android behavior of v0.9.5 and full GitHub Actions status remain unverified.** Size alone has not been established as the cause of earlier launcher failures.

The script never commits real Torn API keys, personal stat records, inventory or account funds to GitHub. Observed stat data is saved locally on the device and used for display and forecast comparisons only.

MIT · IamEEKY · [Historical release notes](docs/legacy-release-notes.md)
