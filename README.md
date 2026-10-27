# Torn Happy Jump Helper — v0.10.1

**Current Android test release: v0.10.1 · Author: IamEEKY**

[**Install/update the main TornPDA Happy Jump Helper**](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper.user.js)

This is a narrow UI update on top of **v0.10.0**, which was confirmed opening on Android. It does **not** change the underlying training formula, the budget, the Xanax/point inventory deductions, UK sleep hours or the working launcher.

## Clarification from the real Android screenshots

- The configured sleep schedule was **23:00–08:00 UK time**, chosen by the player. At 22:19 UK time, training before bedtime is an appropriate recommendation. The default for new installations remains 22:00–08:00 until changed in Settings.
- The projected **Torn $0 spending** is correct when sufficient Xanax and points are already owned. The simulation estimates **additional purchases**, not the replacement value of existing inventory. Do not treat the items as free.

## Improvements in v0.10.1

- **Today → Your training numbers:** The weekly cost summary now says **Additional purchases $0 (covered by owned supplies)** when it uses saved owned Xanax/points and the actual incremental purchase cost is zero. Positive costs and unpriced unavailable inventory remain subject to the original cost model.
- **Just happened → Next action:** Alongside the immediate upcoming recommended action, the card now shows **Then: [following action]**. For example, with a usable energy bar and an available point refill, it can show *TRAIN* followed by *REFILL*. Actions remain hypothetical until completed manually, with optional self-reported confirmation and Undo.
- **Mobile navigation:** Removed the negative top margin from the sticky tab bar and added CSS layer isolation/accelerated composition to mitigate partially drawn duplicate-looking tabs on Android WebView. This is an **on-device visual fix to verify**, not proof that no WebView can display a ghost tab row.
- The independently tested **on-open API refresh, all eight tabs and full-screen panel** remain intact.

## Existing features retained

The per-train, 24-hour and seven-day forecast, accurate Torn API v2 gym-dot normalization, multi-train gym comparison, UK GMT/BST-aware configurable sleep rules, Progress charts with the partial-day toggle, rolling stat observations, Xanax/Happy-jump plans, daily refill checks and existing Torn **$50m/week** planning limit remain unchanged.

## Install and rollback

1. Keep **only one main HJ userscript** enabled. Disable duplicate Advanced/Preview/Companion HJ variants.
2. Update the source using the raw main link above; injection should remain **END** in TornPDA.
3. Reload Torn, open the floating **HJ ◉** button and confirm **v0.10.1** in the full-screen header.
4. Check that the extra partial tab row has disappeared. On Today, find *Just happened → Next action* and, where available, a *Then* action. Under *Your training numbers*, check that zero cash expenditure due to owned supplies is labelled as **additional purchases**.

If v0.10.1 fails to open or creates another layout regression, disable it and install the separately packaged **[v0.10.0 phone-confirmed rollback](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/archive/Torn-Happy-Jump-Helper-v0.10.0-known-good.user.js)**. Keep one HJ script enabled and **do not clear device storage**.

## Validation

**55/55 focused userscript regression tests passed**, covering launcher startup, tabs, sleep boundaries, actual gym gains, all-stat comparisons, rolling observations, action tracking, owned-points zero incremental spending and the train-before-refill follow-up action. JavaScript syntax passed and the main script remains **56,995 bytes**, under the 57,000-byte compact-source guard.

Live Android behaviour of v0.10.1 and the complete GitHub Actions test suite are **not yet verified**. CSS repaint bugs vary with WebView versions and devices.

Read-only Torn gameplay; API requests retrieve live data but do not train, consume items or spend points. No real player API keys, personal account records or balances are committed to this public repository.

MIT · IamEEKY · [Historical release notes](docs/legacy-release-notes.md).
