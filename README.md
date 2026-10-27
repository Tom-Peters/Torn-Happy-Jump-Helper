# Torn Happy Jump Helper — v0.9.9

**Current Android test release: v0.9.9 · Author: IamEEKY**

[**Install/update the main TornPDA userscript**](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper.user.js)

The **v0.9.8 floating HJ launcher, full-screen layout, Progress charts, on-open API refresh, accurate per-train estimates, and eight tabs were confirmed working on a real Android device**. v0.9.9 adds the practical missing link between *what happened* and *what the simulator recommends next*, while retaining the working startup architecture.

## New: Just happened → Next action

A compact **Just happened → Next action** card appears near the top of **Today**, **Schedule** and **Progress**.

It distinguishes three kinds of information:

- **Detected:** the most recent positive battle-stat difference observed between successful Torn API snapshots (for example, a +611 Strength increase). The detection timestamp is the *refresh time*, not the exact gym-train time. A normal-train count is labelled **inferred** only when the existing model's conditions support one. Detection does not prove an individual gym visit, Xanax or a point refill.
- **You marked done:** the latest action *you explicitly confirmed*, including its timestamp. Use **Undo** to remove an accidental note. Self-reports are stored locally and never treated as independently verified gameplay.
- **Next recommended:** the upcoming action from the selected feasible training forecast, including action type, estimated timing, detail and countdown. The **I completed this in Torn** control appears only when a suggested action is due within ten minutes. It does not execute gameplay, spend items or generate fabricated training gains.

Confirming an action stores a local note and refreshes current Torn API data to update the forecast. It **does not assume the API proves you followed the plan**; any delay, other action, overdose, gym change or unspent energy may alter the next recommendation. For a point refill, the existing dedicated refill controls and actual API state remain authoritative; the generic action note never silently marks the refill as used.

**Local notes:** stored under `action-notes` in the same device storage as existing settings, capped at 60 entries for up to 14 days on new confirmations. Existing stat observations, weekly budget, sleep settings, gym confirmations and the seven-day Progress charts are preserved. They are not exported or published to GitHub.

## Existing features

- Read-only per-train, 24-hour and seven-day gym forecasts, with corrected Torn API v2 gym dots.
- Regular Xanax and prepared Happy-jump strategy comparisons, manual scheduling and market estimates.
- Configurable sleep schedule (local **22:00–08:00** default), projected energy regeneration lost at the cap and daily point-refill checks.
- **Progress** seven-day observed-versus-planned chart and persistent **Show partial days** toggle.
- A rolling on-device stat-change ledger; HJ refreshes Torn data **every time it opens** and doesn't poll in the background.
- **Torn $50 million weekly budget** default, preserving any previously saved preference.

## Installation and rollback

1. Keep only **one main Happy Jump Helper** script enabled. Disable older Advanced/Preview/Companion copies.
2. Replace your main userscript with the [current v0.9.9 raw source](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper.user.js); use injection **END**.
3. Reload Torn, press **HJ ◉** and confirm the full-screen header shows **v0.9.9**.
4. In **Today**, check *Just happened → Next action*. If you just trained, refresh or reopen HJ to pick up the observed stat increase. When a suggested action is actually due, you can record its completion. Open **Progress** to see the same card above your chart.

If v0.9.9 fails to load, disable it and install the separately packaged **[v0.9.8 phone-confirmed recovery script](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/archive/Torn-Happy-Jump-Helper-v0.9.8-known-good.user.js)**. Keep just one version enabled and **do not clear local data**.

## Testing, model limits and privacy

**46/46 targeted mock TornPDA regression tests passed**, including early launcher creation, on-open refresh, sleep-window timing, daily progress, stat/forecast alignment, a detected stat change, action confirmation, undo, session persistence, avoiding duplicate self-reports, and refusal to mark distant future actions as completed. JavaScript syntax passed; the main userscript remains **56.9 KB**, below the existing 57 KB compact-file test limit.

**Live Android v0.9.9 behaviour and the complete GitHub Actions suite are not yet verified.** The helper remains entirely read-only with respect to Torn gameplay. Only already-permitted API GET requests are issued; `/user/log` is *not* called. Optional gym-log reconciliation remains an unimplemented, permission-controlled design in [docs/optional-gym-log-reconciliation.md](docs/optional-gym-log-reconciliation.md).

No real Torn API keys, personal stat records, item inventories or account balances are embedded in this public repository.

MIT · IamEEKY · [Historical release notes](docs/legacy-release-notes.md)
