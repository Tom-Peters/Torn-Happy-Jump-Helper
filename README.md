# Torn Happy Jump Helper — v0.9.2

**Current incremental Android release: v0.9.2 · Author: IamEEKY**

**[Install/update v0.9.2 TornPDA main userscript](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper.user.js)**

v0.9.1's full-screen floating HJ launcher was **confirmed working on Android**. v0.9.2 deliberately retains that launcher/startup design and reintroduces **only** sleep-aware scheduling as a small, independently testable change.

## v0.9.2 — sleep-aware planning

- Sleep preference enabled by default, **22:00–08:00 in the device's local time**.
- Under **Settings → Sleep schedule**, edit bedtime/wake time or disable the restriction entirely.
- The same sleep rules apply to regular training, Xanax, and single Happy jump forecasts; manual actions are never scheduled within the chosen sleep window.
- When feasible, the model trains surplus energy **just before bedtime** and **on waking** to reduce time spent at the full energy cap.
- **Today** shows predicted regeneration loss over 24 hours and seven days, including how much is projected to occur overnight.
- **Schedule** reports energy loss for the exact 24-hour or seven-day time window selected. These are *simulated estimates*, not observed losses.
- A ready point refill is labelled **postpone until awake** when the dashboard is viewed during quiet hours. No actions are executed automatically.

All existing per-train/24-hour/seven-day gym calculations, eight tabs, and your stored **Torn $50m/week** budget remain intact.

**[Download independently installable v0.9.1 known-good rollback](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/archive/Torn-Happy-Jump-Helper-v0.9.1-known-good.user.js)** — this separate userscript has unique identity metadata and does not automatically update to the experimental version. Keep only **one** HJ userscript enabled.

## Install

1. In TornPDA's userscript manager, update the single enabled main Torn Happy Jump Helper script from the current main raw link.
2. Use **END** injection, disable duplicate or experimental HJ scripts and reload Torn.
3. Confirm the floating **HJ ◉** launcher opens the page and displays **v0.9.2**.
4. Under **Settings**, confirm Sleep schedule defaults to **22:00–08:00**; then refresh live Torn data and inspect Schedule.

If the button disappears, disable v0.9.2, install/enable the independent **v0.9.1 known-good rollback** and reload; do **not** clear local storage. Report whether the rollback button reappears.

## Test and release status

- **22/22 targeted regression tests passed**, covering startup without an API call, tabs/launcher, gym dot values, market/refill calculations, sleep-window boundaries, pre-bed training, waking training, overnight waste and disabling quiet hours.
- The v0.9.2 main script is about **49.8 KB**, versus 46.7 KB for phone-confirmed v0.9.1 and 58 KB for the previous non-launching v0.9.0 experiment.
- **v0.9.2 is not yet confirmed on a real Android TornPDA installation**, and script size alone has not been proven to cause the earlier non-launch.
- Full GitHub Actions suite has not been independently confirmed.

### Features preserved for later incremental reintroduction

Rolling actual-vs-forecast stat verification, seven-day observed gains, scheduled 15-minute checks, and advanced verified-gym ranking are **not** in v0.9.2. The earlier experimental implementation is preserved in [archived v0.9.0 code](archive/Torn-Happy-Jump-Helper-v0.9.0-experimental.user.js) and [tests](archive/tests/compact-v0.9.0.test.js). Those changes will be restored only after the smaller sleep release is confirmed on the phone.

Historical development: [archived release notes](docs/legacy-release-notes.md).

This script is **read-only**, makes manual recommendations and does not publish real API keys, player records or account details. MIT · IamEEKY.
