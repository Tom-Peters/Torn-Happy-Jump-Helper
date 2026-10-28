# Torn Happy Jump Helper — Android-compatible recovery (v0.10.9)

## Current phone-tested recovery build

**v0.10.9 compatibility trial: the floating HJ launcher is confirmed visible on Android TornPDA (28 October 2026).** The full dashboard, live API refresh, observed-gain accounting and sleep/refill controls still require separate on-device verification. This is **not** a claim of full feature stability.

**[Install v0.10.9 compatibility script](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper-v0.10.9-compat.user.js)**

- Based on screenshot-confirmed v0.10.4, keeping the original startup structure and compact code size (58,695 characters).
- Main v0.10.8 had no startup markers on the affected phone despite being enabled; v0.10.4 and the new v0.10.9 both displayed a floating HJ button.
- Adds detection of rapid stat changes, cache-busting for four changing API endpoints, a one-hour awake override and a timestamped manually marked refill.
- Keep v0.10.9 **separate** rather than replacing the known-working v0.10.4 rollback. Do not clear TornPDA saved storage.
- The optional HJ Startup Test can be disabled after troubleshooting; avoid simultaneously enabling multiple main HJ variants.
- Next: confirm full dashboard and live refresh on the phone, then restore copied training-log recovery and reliable off-schedule event reconciliation in small increments.

The default main script remains experimental v0.10.8 and is **not** the recommended Android installer until its startup problem is resolved.

---

**v0.10.8: experimental startup build — NOT YET VERIFIED ON ANDROID · Author: IamEEKY**

**[Install / update the main TornPDA userscript](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper.user.js)**

## Missing HJ button: test the main script and tiny diagnostic together

Both **v0.10.6 and v0.10.7 failed to show the HJ launcher** on the affected Android TornPDA. The exact reason remains unknown. Tests that run after injection cannot tell whether TornPDA rejected the userscript entirely.

**[Install the HJ Startup Test userscript (under 3 KB)](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/diagnostics/HJ-Startup-Test.user.js)**. This is a separate, simple script with a green **HJ TEST** launcher. It never requests an API key, uses no network, saves no user data and performs no game actions.

1. **Enable exactly one main Happy Jump Helper** (v0.10.8 or the known-good v0.10.4 rollback). Keep other main HJ variants disabled. Do not clear saved storage.
2. **Also enable** the standalone HJ Startup Test with injection **END**. Both the main script and the diagnostic must be enabled simultaneously for this test.
3. Open/reload the Gym page in TornPDA. Tap the green **HJ TEST** to check whether the main script boot markers and actual launcher appeared. If the main helper was disabled, all `NO` / `none` results are expected and prove nothing about its compatibility.
4. If HJ TEST appears but the main markers still show `none` with a main HJ version definitely enabled, verify its installed version, domain matching and injection **END**; try the phone-confirmed v0.10.4 rollback to isolate a regression in the larger builds.
5. Disable the diagnostic after checking. Keep only the one working main HJ helper enabled.

**[Restore the screenshot-confirmed v0.10.4 userscript](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/archive/Torn-Happy-Jump-Helper-v0.10.4-screenshot-confirmed.user.js)** if you need the familiar working button while this is investigated. Keep only one main HJ userscript enabled, and **do not clear TornPDA storage**.

## v0.10.8 experimental early launcher

Unlike previous builds, the main v0.10.8 userscript mounts a lightweight **HJ ◉** launcher before initialising user settings or the training planner. If the planner then stops, pressing the button shows **HJ STARTUP** instead of silently disappearing. A DOM replacement fallback also avoids relying entirely on `Element.replaceWith`.

**103/103 focused mock tests pass**, including an isolated test proving the early launcher mounts before the planner. At **60,775 characters**, however, this experimental build is larger than the 58,580-character phone-confirmed v0.10.4 rollback. It is **not claimed fixed** until TornPDA device injection is verified. Do not treat a passed test as proof of phone compatibility.

The main development script attempts to fix missed live training gains caused by quick consecutive API checks, accounts for off-schedule point refills, and supports staying awake later than the configured UK bedtime. It preserves the working floating HJ launcher, eight tabs, local records, approximate gym-gain model, budget and read-only gameplay.

## v0.10.7 — HJ launcher recovery

This is a **recovery build** after the HJ floating button failed to appear with v0.10.6 on Android TornPDA. The exact device-specific cause has **not** been confirmed. The two startup weaknesses addressed are:

- A previous same-version injection could stop all subsequent initialisation, even if the launcher had disappeared. A reinjection now attempts to **remount the existing launcher**, and can retry after a failed previous boot.
- Torn's page transitions could detach the full-screen panel while the helper still considered it open, leaving the floating button hidden. The periodic mount now **resets this detached state** and restores the button.
- The main userscript was reduced from roughly **63.3 KB to 59,994 characters** without removing Copy Log imports, point-refill checks, saved history, the eight tabs, estimates, or sleep scheduling. The guard now enforces **under 60,000 characters**.
- These paths are covered by **102/102 passing focused mock-TornPDA tests**, including simulated reinjection and page-panel replacement. The build still needs confirmation on an actual Android TornPDA device.

**Install:** Disable any duplicate HJ user scripts, update the main script using the raw link above, then **fully reload the Torn page** (or restart its TornPDA WebView if needed). The floating **HJ ◉** button should reappear. Confirm the panel displays **READ ONLY · v0.10.7**.

**Rollback:** If it still does not load, disable v0.10.7 and install the [v0.10.4 screenshot-confirmed release](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/archive/Torn-Happy-Jump-Helper-v0.10.4-screenshot-confirmed.user.js). Keep only one HJ script enabled. **Do not clear TornPDA storage**: the updated script uses the same local saved-settings and observation keys.

## Existing v0.10.6 improvements retained

## What was wrong with the gym gain tracking?

Previous versions could reset a stat baseline on a refresh occurring within 30 seconds of the previous check **without first recording an intervening increase**. This could permanently omit a real gym gain from the interval-based Progress history.

In addition, Torn API responses have a **service cache of up to 30 seconds**. Their [official API documentation](https://www.torn.com/api.html) allows a changing `timestamp` query parameter to request uncached service data.

**v0.10.6:**
- Checks positive and negative stat changes **even a few seconds** after the preceding sample, and immediately stores observed changes.
- Retains the prior checkpoint baseline if a fast refresh returns unchanged stats. It does not abandon that baseline before a real increase is recorded.
- Preserves the baseline through failed stat API responses; another successful reading can still detect the intervening change.
- Uses a changing Unix-seconds `timestamp` query parameter for live **battle stats, energy/happiness bars, cooldowns, refills and player inventory**. Global market prices retain normal caching.
- Recalculates the schedule using **actual fresh Torn values** rather than treating the old scheduled training, refill or Xanax action as performed.
- Continues to require user interaction for all Torn actions. There is no background polling, no gameplay automation and no new API permission.

**Progress** also displays **Current API [stat]** and **Since first check today** independently from the existing interval-based observed totals. This can reveal changes that older releases failed to capture without adding them twice. An early or late first API check is not a full UTC-day activity history. Positive increases never require the user to have followed the forecast.

## Refills taken whenever you want

The planner should not tell you to use your point refill at 08:00 if you already used that UTC day's refill at midnight. It now checks a fresh `/user/refills` response whenever HJ is opened or refreshed.

- When Torn reports the daily energy refill **used**, no extra refill is scheduled that day.
- If the API still shows **ready** just after you used it, **Today → Mark today's refill used** lets you record that fact locally and replan immediately.
- Your manually recorded used status takes priority over an outdated API reading for the rest of the current **UTC day**. On a new UTC day, availability is checked anew.
- **Sleep 23:00–08:00 UK time** is not an instruction to delay a real refill until waking. Actual actions are reflected through Torn's latest state regardless of the planned bedtime.

## Still awake after midnight?

On **Today → Sleep-aware schedule**, when you are within the configured quiet hours, use **Still awake · next hour** to temporarily allow training recommendations for the next 60 minutes. **Return to normal hours** cancels the exception immediately.

This does not modify the user's saved sleep window, does not schedule gameplay automatically and expires on its own. A later bedtime is never inferred merely because HJ was opened during sleep hours.

## Recover a gym session missed by an older release

A previously overwritten API baseline may be unrecoverable as a specific training event. v0.10.6 includes an **optional, local-only Torn Copy Log import** for that one-time historical recovery:

1. In Torn's activity log, tap **Copy Log** on the missing gym-training entry.
2. Open **HJ → Progress** and expand **Torn Copy Log · historical recovery**.
3. Paste the copied training entry and tap **Save copied gym log**.
4. The actual awarded gain, energy used and number of repetitions appear in a separate activity record. Re-importing the same post-train result is deduplicated. **Undo latest copied entry** removes only the latest import for the currently displayed stat.

The original text is not stored; only the parsed stat, energy, repetitions, post-training value and imported timestamp are saved locally on the device. **The original gym-training time is not inferred.** Imported results do **not** get added into the API snapshot totals, preventing the same training from being counted twice if both sources cover it.

This feature does not require the Full Access Torn `user/log` API selection or a change to your API key.

## Other existing features

- **Today:** up to three recommended actions, live estimated gym gains, current bars and cooldowns, daily refill status, resource waste and temporary awake option
- **Compare:** budget-feasible regular, Xanax, candy and DVD Happy-jump strategy comparisons for the relevant stats
- **Schedule:** next 24 hours or rolling seven-day plan, including daily action overview and exact forecast costs *after owned items*
- **Supplies:** items already owned versus estimated additional purchases
- **Gyms:** better accessible or manually verified gyms only; hidden/locked gyms are excluded
- **Perks & books:** relevant gym/cooldown/energy effects
- **Progress:** 30-day stored stat checkpoints, seven-day matched/unmatched observations, latest live stat value, manual copied gym results and refresh button
- **Settings:** editable weekly spending budget (default $50 million Torn dollars), gym modifiers and UK-time sleep window (previously saved 23:00–08:00 is preserved)

The tool still distinguishes **detected stat changes**, **manual action confirmations**, **inferred trains**, **missed-action annotations**, and **hypothetical forecast events**. No other category is silently presented as verified gameplay.

## Installation and rollback

1. In TornPDA, keep exactly **one main HJ userscript** enabled. Disable duplicate Advanced/Preview/Companion copies.
2. Install/update [v0.10.6 from the raw GitHub file](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper.user.js) with injection set to **END**.
3. Reload Torn. Open the floating **HJ ◉** button and verify **v0.10.6** in the full-screen header.
4. Under **Progress**, use **↻ Check new gains** and inspect **Current API value** and **Since first check today**. For an older missing gym result, use Torn **Copy Log** once.
5. On **Today**, verify the point refill is **USED TODAY** if you already spent it. If it isn't, use **Mark today's refill used**. If still awake during the quiet window, choose **Still awake · next hour**.

If v0.10.6 fails to open, disable it and restore the separate **[v0.10.5 rollback userscript](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/archive/Torn-Happy-Jump-Helper-v0.10.5-rollback.user.js)** or the **[v0.10.4 screenshot-confirmed rollback](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/archive/Torn-Happy-Jump-Helper-v0.10.4-screenshot-confirmed.user.js)**. Leave only one main HJ script enabled and **do not clear local device storage**.

## Validation and privacy

**99/99 focused mocked TornPDA tests passed**, including an unchanged rapid sample followed by two real off-schedule gains only seconds apart, post-midnight refills, duplicate-free local copied logs, incorrect API response safeguards, one-hour awake overrides, all original eight tabs and launcher tests, gym comparisons, and selected strategy tracking.

Main script: **63,254 characters**, under the **65,000-character compact safeguard** and substantially smaller than the earlier broken ~78 KB userscript. Syntax verified. **Live Android behaviour of v0.10.6 and the complete GitHub Actions CI suite have not yet been independently verified.**

All test examples are synthetic. No player's live stat values, personal logs, item inventories, bank balances or API keys are committed to this public repository. Stored user activity stays on the device.

MIT · IamEEKY.
