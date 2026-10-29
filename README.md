# Torn Happy Jump Helper — Training Command Centre

## Install once — stable channel

**[Permanent stable userscript URL](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper.user.js)**

This unversioned path contains **phone-confirmed v0.10.22** and includes the permanent `@updateURL` / `@downloadURL`. It replaces the obsolete experimental v0.10.8 once served from the same path. Install it *once*, disable existing individually versioned main HJ variants, and set TornPDA injection to **END**. Never enable the stable and preview main helpers simultaneously, as both mount the same floating launcher. Saved settings and training history use the same `hhj-compact-v1` local storage keys; do not clear TornPDA storage.

**Stable promotion policy:** Develop new releases at versioned preview URLs. Run all syntax, mobile smart-quote preprocessing, dashboard, API and read-only regression checks; require a successful phone test. Only then publish the confirmed candidate to the permanent URL. Until that point, the stable installer remains pinned at v0.10.22. The GitHub repository default branch can contain newer preview files without changing the stable installer.

## v0.11.4 — focused Training Opportunity Audit (preview)

**Permanent preview installer:** [Torn-Happy-Jump-Helper-preview.user.js](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper-preview.user.js) now serves **v0.11.4**. Phone-confirmed **stable v0.10.22 remains pinned** and unchanged. A passing CI run confirms syntax, TornPDA text normalization, regression compatibility, and test fixtures. **v0.11.4 is not yet confirmed on Android.**

Five user-approved decisions implemented:
- **Education prioritises focused stat.** The helper requests read-only `/v2/user/education` and `/v2/torn/education` on a full refresh, checks the completed list and current course, then prioritises the appropriate Sports Science +1% gym-gain course (`SPT2440 / 2450 / 2460 / 2470`) followed by the `SPT3510` Bachelor giving +1% all gym gains. It identifies missing prerequisites from the official catalogue. It never assumes missing API data means no education is completed.
- **Books must be owned and worth using.** Only positive-amount, non-faction-owned books found in the current API inventory are displayed. Permanent 5%-up-to-10m stat books (IDs 744–747) are not marked `ready` unless (i) the matching stat is at least 200m already, (ii) the item explicitly identifies itself as usable, and (iii) no other book perk is active. The full +10m cap is assessed at completion of the 31-day reading period. A predicted 31-day stat is displayed as a *rough forecast* for earlier planning but never silently triggers a use-now prompt. Unknown usability produces `Usability unverified`, and an explicitly used copy is excluded from a use recommendation. Used book display copies can still remain in the inventory. Training-boost books (757–761) and Energy book (784) are described only as worth reserving for a planned 31-day intensive period, not as automatic consume-now suggestions.
- **Faction/company are potential unlocks only.** Missing Steadfast and a possible Fitness Center 10-star bonus are labelled as prospects requiring faction leadership/job qualification. They are **not inserted into forecast multipliers unless Torn reports an active perk**, preserving the existing active-perk calculation. All active relevant perks remain inspectable under a dropdown.
- **Stat enhancer prices fetched from market.** The full refresh now calls read-only `/v2/market/{331,330,329,106}/itemmarket`, normalising listing `price/cost` and `amount/quantity`, and shows the cheapest available listing, the 1% stat increase, and dollars per stat point. No hard-coded market prices; prices are snapshots at refresh, not live streaming quotes. All enhancers add six hours of booster cooldown and availability can change.
- **Only one high-value opportunity on Today**, with full education/book/perk/enhancer audit inside **Perks & Books**. Avoids spurious calls to use a rare book or buy expensive enhancers at low stats.

**Safety and release constraints:** The preview remains read-only and does not use automation for Torn actions, change property/education/book ownership or prices, clear local data, or expose an API key in the repository. It retains the existing HJ button and on-page due indicator. Any missing key capability is described as unavailable, not silently inferred.

Regression coverage was extended for a stat book below/above 200m, usable/unknown/used owned books, prerequisites, absent data, changing listing prices and full-read-only-refresh response handling. The user's stable URL stays pinned on v0.10.22 until the preview is confirmed working on the phone.

## v0.11.3 — screenshot-verified Private Island upgrade and seven-day can corrections

**[Permanent Preview Installer](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper-preview.user.js)** — now **v0.11.3**. Stable channel **v0.10.22 remains unchanged**.

The user's **29 October 2026** v0.11.2 screenshot showed their live **Private Island with property and live Happy 3,475**, installed **Hot Tub, Advanced Shooting Range, Sauna, Medical Facility, Airstrip, Open Bar, Large Pool, Medium Vault** and current staff **Maid ×4, Guard ×5, Butler ×3, Doctor ×1, Pilot ×1**. Their old ranking omitted interior modifications and displayed **43 energy cans used of 42 requested** for a seven-day 6-cans/day scenario. It also displayed an unrelated manual **$250m** input for a 5,025-Happy scenario without indicating how much the remaining upgrades cost.

Fixes:
- Add the API-catalogue-supported **Sufficient Interior Modification** and **Superior Interior Modification** to property options. On Private Island they provide **+500 Happy at $125m** and **+1,000 Happy at $250m** respectively (when neither tier is installed). Interior, pool and vault tiers are treated as mutually exclusive alternatives, not additive.
- Compute the **minimum indicative estate-agency purchase price** for a chosen target Happy by combining eligible, uninstalled upgrades through a grouped cost-minimising dynamic program. It excludes already installed modifications and lower-tier replacements; next-tier upgrades are charged at full price.
- For the screenshot's 3,475-Happy Private Island, the documented shortest-cost route to **5,025** is **Superior Interior ($250m) + Private Yacht ($895m) + Extra Large Vault ($215m) = $1.36bn**, assuming the account may install all three catalogue-listed upgrades. There is no justification to present 5,025 Happy as attainable for the manually entered $250m. The app shows both the required bundle and an affordability warning.
- Seven-day can simulation now caps the aggregate count at **7 × requested cans per day**, even when the rolling 168h period crosses 8 UTC calendar dates. Per-UTC-day limits, booster cooldown, energy capacity, sleep and other previously simulated constraints remain. The old **43 / 42** result is no longer possible.
- Keep the original gym history, automatic activity, priority HJ button, scenario calculations, saved user settings and non-Torn-action behavior. The new regression fixture reproduces the screenshot's property upgrades and tests the **$1.36bn** minimum path and a hard **42-can ceiling**.
- **Phone verification pending.** No source file or metadata from the stable installer was modified; the tested script is promoted only to the permanent preview URL.

Pricing source: Torn's official Property wiki; catalogue/eligibility comes from API v2. All fixed estate-agency prices are estimates, not live quotes, and no purchases are performed.

## v0.11.2 — API property recognition, upgrade ranking and priority launcher (preview)

**[Permanent Preview Installer](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper-preview.user.js)** — currently **v0.11.4**. The permanent stable installer remains pinned at phone-confirmed **v0.10.22**.

What was approved: automatic current-property and upgrade detection; efficiency ranking by extra Strength per dollar; a single most important HJ button action. More advanced energy-can and forecast analytics are postponed.

The preview calls the official **`/v2/user/property`** and **`/v2/torn/properties`** endpoints only during an explicit full helper refresh (not each minute). It reads the current home type, property Happy, installed modifications and staff, then looks up upgrades available for that property type. If no authoritative property or catalogue data is available, it does **not** infer ownership, price or availability from the current Happy bar. No personal property data or keys are committed.

- The **Upgrades** page now displays the detected property and installed mods, with a collapsible **Rank upgrades by extra stat per $1m** section. It excludes already owned and catalogue-ineligible modifications, and avoids recommending downgrades within pool/vault tiers.
- The comparisons use published **fixed estate-agency** upgrade prices from Torn Wiki (e.g. Open Bar $9,000 +50 Happy, Sauna $12,000 +25, Hot Tub $17,000 +25, small/medium/large pools, vault tiers, and Yacht where eligible). Higher-tier replacement pricing is **full purchase price**, not the difference from an existing tier. The price list is an indicative reference, not a live estate quote. Staff costs, upkeep, renting and buying a different property are **not** silently assumed included. Marketplace offers may differ; verify prices in Torn before purchasing.
- Estimated weekly stat gain uses the current gym and **the same fixed empirical calibration multiplier** in the baseline and upgrade scenario. ROI is *estimated additional weekly training gain per $1,000,000 upfront cost*, not monetary profit or fully costed account optimisation. No Torn purchases or edits.
- The floating launcher still shows just **one** upcoming action at a time. If actions fall within five minutes of each other, choose a higher-impact jump/Xanax/refill over a routine train; an action already due takes precedence over one in the future. The small icon and countdown stay on the button. Quiet hours, automatic activity confirmation and the 30-minute notification horizon remain. This is in-page UI, not Android push notifications.
- The two postponed requests are **not implemented here**: optimising energy-can combinations against drugs/jumps, and auditing detailed prediction accuracy.
- All earlier v0.11.1 scenario fixes remain, including timed can simulation, property what-if calibration and fractional goal dates.
- **Android confirmation pending.** v0.11.2 has passed the full JavaScript/TornPDA injection/unit test suite. Enable only one main Happy Jump Helper (stable **or** preview) in TornPDA with injection END, and do not clear local storage.

## v0.11.1 — fix Upgrade Lab property gain inversion and energy-can overestimation

**Permanent Preview:** [Torn-Happy-Jump-Helper-preview.user.js](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper-preview.user.js), now at **v0.11.1**.
**Pinned stable:** v0.10.22 remains unchanged.

The user's v0.11.0 mobile screenshot confirmed the Upgrade Lab rendered correctly but exposed:
- **Property at 5,025 base Happy:** `-779` Strength for a 7-day comparison against a Castle base-Happy scenario, despite higher base Happy. Root cause: the candidate was **re-fitting the same historical empirical gains to the hypothetical higher Happy** through `cFactor(p)`. As the hypothesized unadjusted gain increased, the re-derived empirical factor decreased, invalidating the comparison.
- **8 energy cans per day at 25 E, $4m each** yielded a naive `1,400 E/week / +100,618 Strength / $224m/week` without scheduling or booster cooldown limits. This was an upper-bound arithmetic illustration rather than a realistic model.

**Corrections implemented in v0.11.1:**
- Freeze the **same measured calibration factor** (derived from the actual, live gym and Happy) for both property scenarios. Increasing hypothetical Happy cannot cause a calibration inversion. The current property Happy is the baseline, not a second hypothetical sample.
- Simulate energy-can use **within the existing regular training schedule**, respecting **2-hour base booster cooldown**, 24-hour booster cap, current booster cooldown, sleep hours, energy capacity and training after a can. Count only cans actually scheduled and Energy actually delivered, not all user-requested cans. Other future booster items, faction/company cooldown reductions, price changes and future item availability remain out of scope, clearly stated as assumptions; no purchases or game actions.
- Compare the full seven-day plan with and without those scheduled cans; no longer assume a raw 1,400 E can simply be added to all training in ideal conditions.
- Recalculate 50m projections in fractional weeks, display **days saved** rather than rounding away improvements under one full week. These remain long-run model estimates, not guaranteed dates.
- Preserve the compact Today screen and in-page due indicator from v0.11.0. Preserve existing local settings and verified logs. Never clear storage.
- Added regression tests for monotonic property gains under frozen empirical calibration, timed can limits/actual E and fractional milestones. All changes remain separate from confirmed stable v0.10.22.

**Phone status:** v0.11.0 Upgrade Lab was confirmed to open; v0.11.1 requires phone confirmation. After disabling the previous preview instance (or updating it), enable only the single permanent preview with injection END. Do not enable stable and preview together. Check that the panel reports v0.11.1.

## v0.11.0 Training Command Centre — separate Android preview

**[Permanent preview installer](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper-preview.user.js)** — currently v0.11.4. The independently versioned [v0.11.0 archive](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper-v0.11.0-preview.user.js) remains available for rollback.

**Preview channel policy:** The permanent preview URL is updated only with a test-passing candidate and uses its own `@updateURL` and `@downloadURL`. Install **either** stable or preview in TornPDA at any one time. They share local HJ settings, so do not clear app storage between channels. A preview passing CI is not the same as phone-confirmed stability.

**Unverified on a phone** (automated CI passes). Do not automatically promote this trial to stable. Based directly on phone-confirmed v0.10.22, preserving the original startup/bootstrap and existing user data.

What's implemented:
- **Due indicator without opening the dashboard:** the HJ launcher changes to e.g. `HJ 💊 10m`, `HJ 🏋️ NOW`, or `HJ ⚡ 5m` for upcoming forecast events. Only shows actionable, unconfirmed items in the next 30 minutes and respects sleep/awake overrides. Shows regular `HJ` when no event is due. A limited read-only data poll every 3 minutes while the Torn page is active refreshes bars/cooldowns/refills and the model; a full API session is not needed for every timer tick. It is **in-page**, not an Android background push notification; no device notification permissions and no automatic Torn actions.
- **Compact Today:** shows next action, energy, Happy, per-train gain, 24h forecast. Forecast assumptions, calibration, overflow and data diagnostics are hidden in user-expandable sections. Existing Compare, Schedule, Supplies, Gyms, Perks, Progress and Settings remain.
- **Upgrade Lab tab:** hypothetical base-Happy targets 3,475 (Castle), 4,500, 5,000 and 5,025 (PI variants); also supports a custom target Happy and manually entered one-time property cost. Compares regular seven-day forecasts and the current 50m projection against the existing base-Happy scenario. Property, staff and upgrades are never falsely inferred as purchased.
- **Energy-can what-if:** configurable 5/10/15/20/25/30 base energy, cans/day (up to 12 before booster reductions), effect multiplier and manually entered unit price. Shows extra ideal weekly energy, approximate training gains and weekly cost. **Not a timed booster scheduler yet:** additional limits from cooldown competition, energy overflow, availability and sleep are explained and not silently ignored.
- **Model boundaries:** property calculations assume the base Happy is full during training, using the current gym and regular selected method. The 50m timeline uses the inherited long-range training model and is approximate. It does not promise a date or factor future gym unlocks or perks into the scenario. Explicit caveats appear under expandable methodology.

Still planned, not claimed implemented: per-event Happy and perk reconstruction, true Happy Jump vs regular training attribution, a time-aware energy-can scheduler with owned inventory and booster cap, cost-efficiency and time-to-target comparisons among full multi-step property upgrades, gym unlock probability and best-action confidence scoring. See the stable release and previous incident notes below.

---

# Torn Happy Jump Helper — Android-compatible recovery (v0.10.9)

## Confirmed stable on Android TornPDA — v0.10.22 (28 October 2026)

The user confirmed **v0.10.22 loads and works** on Android TornPDA. This is now the phone-confirmed working baseline. Previous phone confirmation established that the v0.10.21 automatic gym training, Xanax, and refill detection, full dashboard, and no-manual-confirmation UI were working. The newer v0.10.22 gym-access controls and partial schedule alignment display were accepted as working.

- **Preserve v0.10.22 as stable.** Continue future features in isolated versioned trial scripts; do not overwrite this release.
- All future scripts must pass a **TornPDA smart-quote normalization/injection test** as well as Node.js syntax checks. Avoid smart single quotation marks inside JavaScript strings.
- Forecast agreement is *partial schedule alignment*, not an all-session prediction-accuracy measure.
- Gym suggestions must continue to be restricted to user-confirmed accessible gyms; unknown and locked gyms are not automatically considered available.
- Changes remain read-only; no game actions or unapproved user-data storage clearing.
- Next possible improvements: better verification of logged drug and booster use, separating actual Happy Jumps from normal/boosted training, per-session accuracy using known logged inputs, and forecasting based on verified gym availability.

## v0.10.22 — transparent gym access and partial forecast alignment (Android trial)

**[Install optional v0.10.22](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper-v0.10.22-compat.user.js)**

Phone screenshots of working v0.10.21 on 28 October 2026 show **Frontline Fitness, 7.5 Strength dots**, a blank **Better vr gyms** result, verified training **+1,740 per 25 E** vs model **+1,800**, automatic **×0.97** calibration with 10/11 comparable sessions, and **69.3% agreement in only 5 selected API intervals**. Neither the empty gym suggestions nor the alignment number proves the current gym is optimal or that the full model is 69.3% accurate.

This small opt-in update retains v0.10.21's proven launch code, read-only activity tracking, gym log parsing, current calibration and training formulas. It:
- Renames **Better vr gyms** to **Accessible gym comparison** and distinguishes *no verified alternatives* from *no better option among verified accessible gyms*.
- Offers **one-time gym-access verification** using the full Torn API gym list on the Gym page, even when TornPDA's mobile gym chooser uses icons rather than discoverable text names. Users can mark a gym as **Membership owned** or **Unlocked, not bought**, or **Remove verification**. A gym is never automatically declared owned or unlocked simply because it exists in Torn's catalogue. Locked/unverified gyms are never suggested as accessible. The actions update only local script storage, not Torn membership.
- Correctly relabels the previous `7-day matched forecast accuracy` card as **7-day schedule vs observed — partial**, reports planned and observed amounts and interval count, and explicitly explains that skipped/off-schedule training, incomplete snapshots, and excluded zero-gain intervals make it an unsuitable full model-accuracy metric.
- Preserves all existing settings and data. Under 60,000 characters, no Unicode smart quotes that would be rewritten into invalid JavaScript by TornPDA, and includes dedicated test coverage for gym filtering and API-snapshot semantics.
- **Not yet verified on Android**. Keep v0.10.21 installed but disabled when trialling the new script; don't clear TornPDA storage.

## v0.10.21 feature confirmation and recommendation audit (28 October 2026)

Phone follow-up confirmed:
- The complete Happy Jump dashboard **opens**.
- **Xanax and energy refills are automatically detected** without interaction.
- The old **I did it / Missed it / Not sure** controls are **gone**.
- Calibration **appears to work** but the precise multiplier/model-versus-observed numbers have **not** been independently verified.
- Forecast accuracy and gym switching recommendations are **not yet verified** by the user. **Do not assume their displayed estimates are correct.**

Current source audit:
- `cMet` uses up to seven days of logged sessions, matching stat and cost per train, with a median/outlier rule; it uses **current** happiness/perks for the theoretical comparison rather than historical per-session conditions. Treat the adjustment as a provisional estimate.
- `fCard` matches plan checkpoints to API deltas only where planned gain is positive and observed stat increased, with a maximum two-hour interval. Its percent-alignment score is **not a complete training-forecast accuracy measure**; nontraining/missed sessions are not included. It may be absent when not enough matched intervals exist.
- `gymTip` and `gyms` compare candidate gyms only after their access has been manually locally verified as owned or unlockable, using gym modifier and energy cost from Torn. **No candidate displayed does not prove the current gym is optimal.**
- Keep v0.10.21 unchanged as a phone-proven baseline while collecting Today, Gyms and Progress screenshots for validating recommendations. No need to reinstall or clear storage. Future changes must retain the new smart-quote normalization regression test.

## v0.10.21 confirmed launched on Android TornPDA — 28 October 2026 at 20:58 UK time

User-supplied HJ Startup Test screenshot confirmed:
- `Main HJ launcher in DOM: YES`
- `Main HJ loaded marker: 0.10.21`
- `Main HJ startup marker: 0.10.21`
- `Main HJ stage: {"version":"0.10.21","phase":"mounted"}`
- `TornPDA HTTP bridge present: YES`

**The smart-apostrophe injection/parsing fix is now phone-confirmed.** v0.10.21 is the working *launcher* baseline; the user has not yet confirmed API-driven drug/refill detection, calibration, forecast accuracy, or gym suggestions within the dashboard. The separate HJ Startup Test's `No API requests made` line describes only that diagnostic, not the main helper.

**Next on-device check:** disable the diagnostic, open the actual HJ launcher, verify its eight tabs and live refresh, check the automatically detected latest drug/refill/gym events, and inspect any `Activity:` error if unavailable. Keep v0.10.16 as an additional known-good fallback. Preserve TornPDA saved data and never paste real API keys into repository issues or screenshots.

## Root cause found — TornPDA quote normalization (v0.10.21)

**[Install v0.10.21](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper-v0.10.21-compat.user.js)**

The user's 20:49 screenshot confirms v0.10.20 is enabled in TornPDA with a green key icon. Reading the current official TornPDA source reveals that a **green key means a dedicated API key is configured**, not that the key is missing; a blue-grey **War mode** button means war mode is not active. The enabled script therefore was not obviously excluded by those settings.

**Definitive error:** TornPDA `UserScriptsProvider.adaptSource()` converts all U+2018/U+2019 smart single quotes to ASCII `'` before injecting. The scripts **v0.10.18**, **v0.10.19** and **v0.10.20** each contained exactly one U+2019 apostrophe in a single-quoted JavaScript HTML snippet: `'<p><b>Today’s refill...'`. After TornPDA's preprocessing, the apostrophe prematurely terminates the JavaScript string and the **entire script fails to parse**, before setting `window.__TornHappyJumpBooting`. This is why the tiny separate diagnostic works and the main script never records a startup marker. Version v0.10.16 (phone-confirmed working) and v0.10.17 had no smart quotes.

The next version **v0.10.21** is based on feature-rich v0.10.18, replacing `Today’s refill` with ASCII-safe `Daily refill`, and removes every `“”‘’` smart quote. It includes the full automatic gym/Xanax/refill/Ecstasy activity, guarded calibration, separate possible Happy Jump analysis, partial forecast accuracy and verified-access gym suggestions. It **does not execute Torn actions** or ask for manual completion. No local data is cleared. Android display is awaiting user confirmation.

A new `test/tornpda-injection-1021.test.js` mirrors TornPDA's actual `adaptSource` JavaScript transformation and wrapper, asserts that the resulting code parses, and verifies the HJ launcher and loaded marker. This directly guards against the actual failure mode that all previous ordinary `node --check` tests missed.

**Installation:** Disable every other main HJ version, enable v0.10.21 with injection END, reload Torn Gym. Keep the startup diagnostic enabled optionally and verify `Main HJ loaded marker: 0.10.21`. Do not share or paste the dedicated API key and do not clear stored settings.

## 28 Oct 2026, 20:40 UTC — diagnostic confirms missing main startup

User supplied an Android TornPDA Gym screenshot with **HJ Startup Test EXECUTED**, `Main HJ launcher in DOM: NO`, `Main HJ loaded marker: none`, `Main HJ startup marker: none`, `Main HJ stage: none`, `Document: complete` and `TornPDA HTTP bridge present: YES`. This follows **v0.10.20** installation/testing instructions and repeated non-launching versions **v0.10.18 and v0.10.19**. Assuming v0.10.20 is enabled as intended, the new main script is not reaching its first global startup marker, so changing the dashboard does not address the immediate issue.

**Next diagnostic: use TornPDA built-in Dev Tools → Scripts tab while on Gym** to see if the `v0.10.20` script is active on the page at all. Official TornPDA v3.10.1 changelog confirms the Dev Tools Scripts tab, and v3.8.3 specifies opening Dev Tools by tapping the browser title/address bar → **Open Dev Tools**. If absent, investigate install/enabled/injection matching or global temporary-disable mode. If listed but not launching, inspect Dev Tools terminal/console for a parse/runtime error before the startup marker. Avoid blind rebuilds; the existing small HJ Startup Test already confirms scripts run on this page. Restore phone-confirmed v0.10.16 as the fallback, without clearing local storage.

## v0.10.20 — minimum-change launcher isolation test

**[Install v0.10.20](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper-v0.10.20-compat.user.js)**

The user confirmed **v0.10.18 and v0.10.19 both fail to display the floating HJ launcher on Android TornPDA**. Do not treat syntax and unit-test success as real mobile compatibility.

This conservative test is based **directly on v0.10.16, the most recently phone-confirmed working launcher**. Its original initialization, DOM mount, network calls, gym log parsing, persistence and planning are byte-identical until the Today panel. Only the UI is modified:
- Hide the **I did it / Missed it / Not sure / Confirm** prompts and the user-facing manual refill controls.
- Show verified recent Torn gym training, current daily refill status and the next future recommendation.
- **No new API requests, startup state, callbacks or training-model changes.** It does **not yet implement the automatic drug-use detection, calibration, forecast accuracy or better-gym improvements** attempted in v0.10.18.
- All preexisting local storage remains untouched, including old manual note records; those notes are not surfaced as new confirmations.
- 57.9 KB userscript with automated regression checks for intact v0.10.16 startup and hidden manual-action controls. **Mobile confirmation pending.**

Test with only **v0.10.20 enabled** as main HJ and injection **END**. Keep v0.10.16 installed as rollback. If HJ is still missing, **enable the existing HJ Startup Test diagnostic simultaneously** and reload Gym; check both startup and loaded markers. If both markers are `none`, TornPDA did not execute the main script. If the startup marker shows v0.10.20 but the loaded marker is missing, the script began but failed before mounting. Do not clear saved settings/data.

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
