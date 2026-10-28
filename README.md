# Torn Happy Jump Helper — Android-compatible recovery (v0.10.9)

## v0.10.19 — recovery after missing HJ launcher

**[Install v0.10.19 launcher recovery](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper-v0.10.19-compat.user.js)**

The user reported that **v0.10.18 did not show the floating HJ button** on Android TornPDA. This is a real phone-startup regression even though normal GitHub CI tests succeeded. The exact injection/runtime cause is not proven. **v0.10.16 is the last version confirmed to work on the phone**; v0.10.17 was not separately verified there.

v0.10.19 is a separate lightweight recovery candidate built directly from that **v0.10.16** code rather than from either unconfirmed version. It:
- Retains the original phone-confirmed launcher/bootstrap, live API refresh, eight dashboard tabs, full gym log scanning and verified Strength progress.
- Removes all **I did it**, **Missed it**, **Not sure**, **Mark refill used** and similar manual completion buttons. Actions now show verified gym activity and next recommended plan steps; no automatic Torn actions are performed.
- Adds bounded read-only lookups for personal drug and energy refill logs; a failed lookup does not assume completion. Confirms training only near the scheduled time and refills only on the correct UTC day. Possible jump inference needs Ecstasy and nearby training; it is not definitive proof of a complete Happy Jump stack.
- Retains all local settings, gym logs, API snapshots and historical action-note data without clearing or rewriting them. The old manual notes are not used as action confirmations.
- Is around **57.2 KB**, below the compact phone-injection size of the working v0.10.16. New regression tests validate the launcher and read-only activity detection, and CI passes.
- Deliberately **defers** v0.10.18 automatic calibration, accuracy metrics and better-gym suggestion UI until this launcher is confirmed on the phone. Those unverified changes are not claimed available in v0.10.19.

**Installation:** disable every other main Happy Jump Helper version, leave v0.10.16 installed but disabled as a rollback, set v0.10.19 to injection **END**, and reload a Torn page. Do **not** clear TornPDA storage. Confirm whether the HJ button appears before assessing dashboard features.

## v0.10.18 — automatic activity recognition and cautious optimisation (Android trial)

**[Install v0.10.18](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper-v0.10.18-compat.user.js)**

The user requested **no manual “I did it”, “Missed it”, “Not sure” or “Mark refill used” buttons**, and approved automatic calibration, separate Happy Jump analysis, seven-day forecast accuracy and better-gym suggestions, while deferring a detailed per-gym history page. v0.10.16 was independently confirmed on Android TornPDA. v0.10.17 remains the immediately preceding compatibility baseline; **v0.10.18 is not yet confirmed on the phone**.

Changes:
- **Read-only automatic activity:** when opening/refeshing HJ, request the Torn personal log types 2290 (drug use) and 4900 (energy refill). Recognise time-stamped **Xanax**, **Ecstasy** and **energy refill** events by the log's details.id and title. Store only event ID, type and timestamp in local TornPDA storage. Do not expose or persist the API key.
- **No completion buttons:** remove the old manual action notes and refill-marking controls. Gym TRAIN steps can be recognised from Torn gym logs within ten minutes of their scheduled time; Xanax within thirty minutes; daily refills from real logs or the authoritative daily refill API. A possible completed JUMP requires *both* Ecstasy and nearby gym training and is therefore an **inference**, not proof of a traditional Happy Jump stack. Unsupported actions remain unverified rather than being falsely marked done. The forward plan is based on live bars and cooldowns.
- **Confidence-gated calibration:** compare only same-stat, same-energy-cost logs (and same recorded gym when that identifier is available). Trim per-train outliers beyond 70–130% of the initial median. Apply an automatic measured/model multiplier to **regular natural and Xanax forecasts only** if at least six consistent, comparable sessions are available and the ratio is within 0.65–1.35. No automatic Happy Jump multiplier. If not confident, retain existing formula untouched.
- **Possible boosted/Happy Jump sessions:** report unusual per-train gains separately; this is only a *possible* boosted session, never a definitive jump classification without additional evidence.
- **Limited seven-day forecast accuracy:** compare previously stored planned versus observed stat gains over matching short API snapshot intervals in the last seven days, requiring at least three matching intervals. Label partial coverage explicitly. Do not pretend this is a full seven-day audit.
- **Better gym reminder:** suggest an estimated advantage for gyms **already locally verified owned or unlocked but not purchased**, and eligible for the user's stats; membership and unlocks are not directly available from the Torn API. Never treat locked/unknown gyms as accessible.
- **Compactness and stability:** remains around 58 KB, preserving the known Android-compatible launcher, existing settings, gym log history, Progress chart and read-only behavior. Extensive tests cover action recognition, date boundaries, non-double-counting, calibration, unverified actions and gym eligibility.
- Keep **v0.10.17 installed but disabled** as rollback. Enable exactly one main HJ helper with injection **END**. **Never clear TornPDA storage** as part of the update.

## v0.10.17 — compare measured gains against the gym model (Android trial)

**[Install v0.10.17](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper-v0.10.17-compat.user.js)**

The user confirmed **v0.10.16** launches and works in Android TornPDA. Latest confirmed action shown correctly: **+3,452 Strength, 2 trains, 28 October 07:41 UTC**; next scheduled Xanax after cooldown around 12:30 UTC, used daily refill, and verified seven-day Strength history. Keep v0.10.16 installed but disabled when testing the new version.

The preceding real log screenshots show **27 October: 78 trains / 780 E / +48,099 Strength** (about **10 E per train**) versus **28 October: 25 trains / 625 E / +42,576 Strength** (**25 E per train**). An unqualified cross-gym average would be misleading.

v0.10.17:
- Adds **Measured training efficiency** on both **Today** and **Progress**. It groups recent actual Gym training logs by focused stat **and the current gym's energy-per-train cost**, using only logs within 0.5 E of that cost.
- Needs **three recent comparable sessions** before displaying a typical observed per-train gain. The robust median excludes samples outside 70–130% of the initial median; the card reports how many sessions were included and excluded. It does not assume missing logs prove zero.
- Displays **typical logged per-train gain** alongside **the current gym model's per-train estimate**, with a warning that happiness and perks may differ.
- Does **not** automatically recalibrate the simulator or claim the two values reflect exactly matching conditions. The observed difference can be reviewed before adjusting model coefficients.
- Preserves startup, complete training log history, actions, refill handling, user settings and read-only TornPDA requests. Remains under **60 KB**; automated tests include mixed 10/25 E gyms, very large boosted outliers and missing data. **Not yet tested on phone.**

## v0.10.16 — live action awareness (Android trial)

**[Install v0.10.16](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper-v0.10.16-compat.user.js)**

v0.10.15 and v0.10.16 are confirmed to open on the user's Android TornPDA. This update is built from that compact working code and changes the **Just happened → Next action** panel, not the gym formulas.

- Shows the **latest confirmed training** directly from Torn gym logs (actual stat, gain, timestamp and number of trains). It no longer presents inferred API-checkpoint training as a confirmed individual event.
- Recognizes logged training within **10 minutes either side** of a matching scheduled train (for the focused stat). Such a step is treated as *training observed near that time* rather than creating a false missed-step warning; no assumption about a specific Xanax/Happy Jump method is made.
- Training outside the 10-minute window is still displayed as real training but is **not incorrectly used to complete another planned step**. Next-action recommendations use refreshed live bars, drug cooldown and other current inputs.
- Filters completed/observed actions from the immediately due queue. Does not assume future steps or events happened.
- When Torn reports today's 30-point energy refill as used (or the user manually marked it), shows **USED** without inventing its execution time. This status is only applied to **today's** scheduled refill, not tomorrow's.
- Preserves the Progress page, real-log tracking, manual action notes, sleep settings, local saved history and read-only Torn actions. Prior v0.10.15 remains a rollback; **do not clear TornPDA data**.
- This standalone version is under 60,000 characters. Automated checks cover duplicate-free log consumption, off-schedule actions and daily refill boundaries. **Not yet confirmed on phone.**

Only one main Happy Jump Helper version should be enabled, with injection **END**.

## v0.10.15 — clearer Progress page (optional Android trial)

**[Install v0.10.15](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper-v0.10.15-compat.user.js)**

The user confirmed v0.10.14 on Android TornPDA with real training records: 27 October +48,099 Strength (17 sessions, 78 trains, 780 E) and 28 October +42,576 Strength (5 sessions, 25 trains, 625 E), summing to +90,675. The legacy partial-checkpoint section also displayed a lower +32,466 today; it only captures observations between API refreshes and must not be treated as an additional real gym total.

Changes in v0.10.15:
- Keeps the verified Torn gym-log totals and seven-day daily chart as the primary Progress display.
- Retains the underlying **Observed stat gains** API checkpoint history, but places it inside a collapsed **Advanced · API snapshot history (partial)** section. Users can still inspect and clear that ledger; it is never added to the gym-log totals.
- Collapses verbose scan counts and field-name diagnostics under **Scan diagnostics**, while preserving the **Scan logs** control and local deduplication.
- No API permission, storage format, gym formula, scheduling or automatic Torn actions changed. No personal keys or raw training records have been committed.
- Keeps the previous compact launcher strategy and stays under 60,000 characters. Automated tests pass; v0.10.15 is **not yet verified on phone**. Keep working v0.10.14 installed but disabled as rollback.

## v0.10.14 — recorded daily gym-gain chart (Android trial)

**[Install v0.10.14 compact chart trial](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper-v0.10.14-compat.user.js)**

The user confirmed **v0.10.13** launches in Android TornPDA and recovers gym logs without copy/paste. Screenshot evidence: **+42,576 Strength today, +90,675 in the rolling last seven days**, while the independent API baseline shows **+40,897 since first check**. Their difference **1,679** matches an earlier UTC-midnight training record. Four unrelated or unrecognisable Gym-category entries have only `gym` metadata and do not establish further stat gains.

v0.10.14 preserves the working launcher, eight tabs, raw-log parser, local dedup and on-open refresh, while:
- Replacing the potentially misleading mixed API-checkpoint versus plan chart on **Progress** with a separate daily chart of **actual log-derived gains**, along with sessions, trains and energy.
- Keeping training **forecasts** in Compare and Schedule rather than presenting them as equal to confirmed observed actions.
- Handling dates without confirmed gym logs as **No gym record** rather than assuming zero gain. The existing partial-days toggle controls visibility.
- Clarifying log diagnostics as **without stat data** when the API returns a Gym entry with no stat gain.
- Correcting mobile `justify-content` layout declarations introduced by prior size reduction.
- Remaining under 60 KB as a standalone script; automated mock API tests pass. The new version is **not yet confirmed on Android**. Keep v0.10.13 installed but disabled for rollback; do not clear local storage.

## v0.10.13 — parse Torn's real Gym log fields (phone trial)

**[Install v0.10.13 real Gym log parser](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper-v0.10.13-compat.user.js)**

The v0.10.12 diagnostic confirmed that the Full Access API key can retrieve gym training logs through category **125**, despite the narrow log-type query returning none. Its parser was rejecting real `data` keys like `strength_increased`, `strength_before`, `strength_after`, `trains` and `energy_used`.

- Recognizes `strength_increased`, `speed_increased`, `defense_increased`, and `dexterity_increased`, while retaining legacy `stat` + `stat_gain` compatibility. Discards ambiguous, zero, negative and malformed events.
- Records the API's original event timestamp, ID, positive stat gain, number of gym trains, and energy used. The original raw log response is not stored.
- Deduplicates by event ID and continues showing log-derived totals separately from snapshot-derived gains; those two totals overlap and **must not be added**.
- Refreshes log queries on first launch after upgrading to this version, even if v0.10.12 queried logs recently.
- Fixes a historical snapshot bookkeeping typo that could append multiple same-day baselines. Existing local settings/history keys remain unchanged.
- Retains the compact Android-tested launcher architecture under 60,000 characters. **v0.10.13 has not yet been tested on the phone**; keep v0.10.12 installed but disabled as rollback.

## v0.10.12 — phone-tested foundation with log-filter diagnostics (trial)

**[Install v0.10.12 log fallback trial](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper-v0.10.12-compat.user.js)**

The user's v0.10.11 screenshot confirmed HJ and live stats work, with a +40,897 Strength increase since the first API snapshot but `0 logs · 0 new` in log history. Their test key is **Full Access**. This is not sufficient evidence to blame API permissions. Torn's current Swagger requires Full Access for `GET /user/log`, confirms `log` and `cat` filters, and returns an array of logs in API v2.

The v0.10.12 trial now:
- Checks Gym train log type **5301**, and if no recognizable records, falls back to Gym category **125**. If still unsuccessful, samples one capped page of unfiltered user logs. Each scan uses read-only Torn API requests and is bounded.
- Reports per-filter record counts, number of newly saved recognized gains and, for unrecognized gym events, **field names only** (never raw values, API keys or unrelated log data).
- Keeps recognized historical logs locally, keyed by stable event IDs; does not add overlapping API checkpoints or fabricate gains from a failed parse.
- Displays **No verified gym entries yet** rather than claiming zero training when the parser has not confirmed events.
- Keeps the standalone startup pattern and a 59,944-character size. The screenshot-confirmed v0.10.11 remains an easy rollback. The new build passes simulated tests but **has not yet been confirmed on Android TornPDA**.

Only enable **one** main HJ version. Retain local storage and do not share an API key or raw logs to debug; a screenshot of the redacted status counts is enough.

## v0.10.11 automatic gym log search — trial, Android unverified

**[Install v0.10.11 automatic logs trial](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper-v0.10.11-compat.user.js)**

- Removes manual Copy Log pasting. Opening HJ triggers a read-only query of the player's Torn **Gym train** log type **5301** through **API v2** `/user/log`, searching the preceding **14 days**.
- Scans up to eight 100-entry pages per opening, follows **Torn-only** pagination, rate-limits refreshes, stores only ID, timestamp, trained stat and positive gain locally (no raw personal logs or API keys committed or transmitted to third-party services).
- The **Progress → Gym logs** card displays seven-day and current-day gains from recognized gym logs. They are **never added** to the existing API-snapshot gain totals, because those numbers can overlap.
- Requires the API key provided by TornPDA to be permitted to read `user/log` (usually Full Access, or a custom key with Gym log access). If forbidden, missing or unfamiliar log fields are returned, the helper reports a status rather than inventing gains.
- **Phone compatibility not verified yet**. Keep the confirmed-working v0.10.10 script installed but disabled; use only one main HJ version at a time. Do not clear TornPDA storage.

## v0.10.10 optional phone compatibility trial — recovered training logs

**[Install v0.10.10 recovery trial](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper-v0.10.10-compat.user.js)**

- Based only on v0.10.9's phone-confirmed working startup, not v0.10.8's failing startup.
- The Progress tab includes **Recover missed gym gains**: paste a Torn Gym **Copy Log** training result. Supports multiple results, repeated-paste deduplication using resulting stat values, and undo. Saved in the existing `hhj-compact-v1:copied-gym-logs` local store.
- **Live stat** card shows current API stat and net change since the day's first valid API reading. It does not assume you followed the suggested schedule.
- Imported gym logs have no reliable original event timestamp and **are never summed with API-checkpoint totals**, preventing accidental double counting. A missed earlier +10k gain can be displayed from a copied result if Torn still exposes that log; a gain with no retained source cannot be reconstructed with certainty.
- Below 60,000 characters, with tests for quick startup, representative +10,000 parsing, duplicate protection and failed imports.
- **Not yet verified on the phone.** Disable v0.10.9 before enabling this new script, but preserve the v0.10.9 installation to revert without losing settings. Do not clear TornPDA local storage.

## Current phone-tested recovery build

**v0.10.9 compatibility trial: Android TornPDA confirmation received on 28 October 2026 — the HJ launcher appears, the full eight-tab dashboard opens and live API refresh succeeds.** Gain reconciliation and the new recovery import still require separate on-device verification.

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
