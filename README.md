# Torn Happy Jump Helper — v0.9.1 launcher recovery

**Current stable mobile release: v0.9.1 · author: IamEEKY**

**[Install/update the main TornPDA HJ script](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper.user.js)**

## Android hotfix — missing HJ floating button

Version 0.9.0 stopped showing the HJ button on the real phone. The main userscript had grown to approximately 58 KB, versus the last confirmed-working v0.8.1 (approximately 46.7 KB). The specific on-device startup failure has **not been proven**: source size, re-injection or a runtime problem remain possibilities.

**v0.9.1 intentionally restores the previously working v0.8.1 launcher and full-screen dashboard code**, with a new higher version number so TornPDA can update the existing script. It does not require clearing any saved local data.

### Install or recover

1. In TornPDA, open **Settings → Userscripts / Manage scripts** (the name may vary by app version).
2. Keep **one** enabled **Torn Happy Jump Helper** main script. Disable any older Enhanced, Advanced Preview, Companion or duplicate HJ scripts, as their launchers can conflict.
3. Update/replace that main script's code with the **[raw v0.9.1 source](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper.user.js)**.
4. Keep injection time set to **END**.
5. Fully reload Torn in TornPDA and check for **HJ ◉** at the right edge. Open it and confirm **v0.9.1**, then press **Refresh data**.

If it still doesn't appear, verify the script is enabled, inspect the script's error/diagnostic information from TornPDA's Userscripts/Dev Tools, and try disabling and re-enabling the script before reloading. If needed, the separately installable [v0.7.1 recovery script](Torn-Happy-Jump-Helper-v0.7.1-backup.user.js) remains available as an emergency fallback.

## Features in this recovery release

The existing full-screen **Today, Compare, Schedule, Supplies, Gyms, Perks & books, Progress, Settings** tabs are preserved, including:

- Estimated training gains per 10 E gym train, 24 hours and seven days.
- Corrected Torn API v2 gym-dot units, with real Gym-page train-result comparison.
- Maximum-gain regular and single Happy jump alternatives, with item pricing.
- Existing weekly Torn $50 million default and saved budget preferences.
- Manual daily point refill status, gym eligibility and verified access safeguards.
- Basic history, plus one-time predicted gain / stat progress views.

**Temporarily deferred to restore mobile reliability:** the v0.9.0 experimental rolling interval ledger, automated checks, configurable 22:00–08:00 sleep mode, predicted overnight regeneration waste and expanded verified-gym ranking. The full experimental source and its 25-test regression suite are preserved separately at [archive/Torn-Happy-Jump-Helper-v0.9.0-experimental.user.js](archive/Torn-Happy-Jump-Helper-v0.9.0-experimental.user.js) and [archive/tests/compact-v0.9.0.test.js](archive/tests/compact-v0.9.0.test.js). They are **not** part of the current reliable main build. Those features should be reintroduced incrementally only after the launcher is confirmed on-device.

## Verification and privacy

**18/18 focused recovery tests passed** in a simulated TornPDA/DOM environment, including immediate launcher creation without API requests, open/close, visible full-screen panel, the working gym-dot model, forecast totals, refill safety and item calculations. **v0.9.1 has not yet been confirmed working on the real phone.**

No real API keys, player inventory, financial balances, training observations or other personal records are committed. All actions are read-only recommendations; the helper doesn't train or consume items automatically.

Older technical release notes: [Historical archive](docs/legacy-release-notes.md).

MIT · IamEEKY
