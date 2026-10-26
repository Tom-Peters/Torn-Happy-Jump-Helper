## v0.9.0 Enhanced Preview — the original optimiser in a smaller script

The **78 KB v0.8 Advanced Preview did not display HJ** on the user's Android TornPDA. The working **23 KB v0.7.1** remains the default and has **not been modified**.

The new [Enhanced v0.9.0 userscript](Torn-Happy-Jump-Helper-Enhanced.user.js) embeds the original deterministic v0.6 training **score/schedule engine** inside the working v0.7 mobile interface at build time. It is **32 KB**, with no `eval`, `new Function`, remotely downloaded code, or `@require`.

Restored: seven-day minute-level training and Happy-jump scheduling; multiple candy/eDVD/Xanax stack candidates; tiered market basket costing with owned inventory; energy and refill-used semantics; relevant gym perk maths, verified gym specialist restrictions, and book advice. It retains Today, Compare, Plan, Gyms, Perks & Books, Progress and Settings.

Some advanced settings and specialised features (full 31-day book activation planner, per-source bonus explanation, gym DOM capture, uncertain overdose modelling) are **still not restored**. Do not claim full parity. All training actions remain manual.

**Optional test:** disable (but **do not delete**) v0.7.1 and any previous v0.8; install only
`https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper-Enhanced.user.js`,
version **0.9.0**, injection **END**. Reload Torn and check HJ. If missing, disable Enhanced and re-enable compact v0.7.1. The build has a CSP-constrained boot test and a weekly optimiser API-fixture test, but **has not been verified on the user's phone**. No TornPDA script-size limit has been confirmed.

# Torn Happy Jump Helper

## Safest mobile recovery: keep v0.7.1 ON, add a 15 KB Advanced Companion

The user's Android TornPDA confirms: **v0.7.1 shows the HJ button**; **v0.8 Advanced alone does not**. For mobile users who need gym, book, passive-effect and long-term-goal information *without risking the HJ button*, the separate [`Torn-Happy-Jump-Advanced-Companion.user.js`](Torn-Happy-Jump-Advanced-Companion.user.js) runs **alongside** the known-working v0.7.1. It is approximately **15 KB**, uses no runtime eval or external scripts, and attaches an **Advanced** control in the existing HJ header.

**Recommended safe install:** enable v0.7.1; disable/remove the failed v0.8 and optional v0.9 Enhanced *standalone* preview so no duplicate HJ button competes; install the Companion with injection END; reload Torn. Open HJ, select **Advanced**, then manually refresh companion data. The companion is a read-only module and **not** a replacement for the working HJ script. Do not disable v0.7.1 when using it. It restores training-specific perks, conservative verified gym suggestions, book save thresholds, and long-term stat estimates but does not yet change the core v0.7 daily timetable.

The separate [Enhanced v0.9 combined preview](Torn-Happy-Jump-Helper-Enhanced.user.js) contains the fuller original weekly simulator in a ~32 KB self-contained script; it is **not yet mobile-verified** and should only be tested after the user agrees to switch, with v0.7.1 retained as a fallback.


## v0.8.0 Advanced Preview — full functionality restored, stable v0.7.1 preserved

The working compact v0.7.1 userscript is still the stable default at [`Torn-Happy-Jump-Helper.user.js`](Torn-Happy-Jump-Helper.user.js). Because the compact rebuild removed many previously requested features, the complete v0.6 training engine and its original mobile dashboard are now available in a separate, **build-time-minified** single userscript: **[`Torn-Happy-Jump-Helper-Advanced.user.js`](Torn-Happy-Jump-Helper-Advanced.user.js)**.

The preview is generated reproducibly from [`Torn-Happy-Jump-Helper.full.js`](Torn-Happy-Jump-Helper.full.js) by [`scripts/build-advanced.mjs`](scripts/build-advanced.mjs), using Terser on GitHub Actions **before distribution**, *not* at runtime. It is about **78 KB**, compared with ~111 KB unminified. TornPDA injects it as one normal `document-end` userscript. No `eval`, `new Function`, dynamic `@require`, or remote code downloader is used on Torn's pages. The real API key is never in the repository.

### Features present in Advanced Preview (not all present in compact v0.7.1)

- **Scheduled next actions** and full UTC minute-resolution seven-day forecast, with optional **24-hour** view; compares **ordinary training versus Happy-jump preparation** and reports projected gains, energy throughput, costs and lost natural regeneration
- **Refill modes and correct `/user/refills` meaning** (`true` = used today), with a local daily-override control and midnight-UTC rollover
- **Perks audit**, limited to relevant training/cooldown/energy/Happy bonuses, including eligible company, faction, education, merit, property, stocks and active books
- **Owned-item-aware market baskets** with tiered item pricing, mixed daily energy plans, and an item **shopping list**
- **Gym comparison** with confirmed *visible/unlocked* versus owned status, stat-ratio specialist restrictions, and unpurchased membership suggestions
- **Book planner**, including capped 5%-stat books at 200m and configurable 31-day gym book review milestones
- **Progress/history**, per-stat 50m/100m/200m/1b what-if projections, locally stored battle-stat observations
- **Cooldown sensitivity**, travel-awareness and robust API-inventory category handling

### How to try it safely

1. **Disable** compact v0.7.1 in TornPDA's userscript settings (do **not** delete it).
2. Install **only the Advanced Preview** script from the raw GitHub URL:
   `https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper-Advanced.user.js`
3. Set injection to **END** and reload Torn. Confirm **v0.8.0**. If the floating HJ button appears, open the panel, press Refresh and compare the Today, Compare, Plan, Gyms and Perks tabs.
4. **If the button does not appear or the panel fails**, disable Advanced Preview, re-enable compact v0.7.1, and reload Torn. No private account data or API key needs to be copied into GitHub.

**Important:** v0.8.0 is a preview, not yet verified on the user's Android TornPDA build. Its automated boot test runs in a CSP-constrained JavaScript environment, and the legacy engine/UI tests pass, but that does not prove it will load on the user's phone. The ~78 KB script may still exceed some undocumented platform or page constraint; no official TornPDA file-size limit has been confirmed. Do not install both scripts together. All actions remain read-only forecasts.


## v0.7.1 — Screenshot-driven compact mobile polish

A live Android TornPDA screenshot confirmed the compact script starts, refreshes Torn data and correctly displays the daily point refill as **USED**. Follow-up fixes:

- Floating **HJ ◉** launcher is now **hidden while the dashboard is open** and restored after pressing the internal close button. This prevents it covering the live training card.
- Seven tabs are now **horizontally swipeable, non-wrapping buttons** with a sticky tab strip; the selected tab stays in view as you move around.
- Training method and stat selections now use compact left-aligned choices rather than stretching buttons to opposite edges.
- If the daily point refill shows **USED** from Torn, its card no longer offers the contradictory **Mark used today** action. A manual used-day override can be cleared, while unknown/available status still allows manually marking used.
- Minor panel height and header padding adjustments leave more space for actual plan details. **54/54 simulated tests pass**. The compact self-contained no-eval/no-runtime-loader startup architecture is unchanged.

All training/drug/refill operations remain **read-only forecasts**; validate the next action's actual cooldown and energy in Torn. User-specific data is not committed to the public repository.


## v0.7.0 — Compact TornPDA compatibility release (CURRENT)

**Why:** On the user's Android TornPDA installation, the former ~5 KB remote loader displayed the HJ button but Torn's Content Security Policy blocked its `new Function` evaluation. Replacing it with the complete ~111 KB script stopped the button appearing again. There is no confirmed official TornPDA byte limit; do not treat file size as a proven cause.

**Solution:** [`Torn-Happy-Jump-Helper.user.js`](Torn-Happy-Jump-Helper.user.js) is now a **~22 KB single-file userscript**, injected directly by TornPDA. It **does not use `eval`, `new Function`, dynamic imports, external scripts or `@require`**. It creates its floating HJ button immediately without requesting Torn's API. The code has no account-specific data or real API key.

### Current compact functionality

- **Today:** current base battle stats, gym, happiness, energy, drug/booster cooldowns, conservative next scheduled manual action, seven-day indicative natural/Xanax training gain, configured budget.
- **Compare:** natural-energy and Xanax weekly training forecasts side by side; an explicitly **single prepared Happy jump** scenario for illustration, not a fabricated repeatable week of jumps.
- **Plan:** UTC next 24 hours or seven days, minute-level conditional energy/Xanax/refill actions. Recheck actual cooldowns and gym access before acting. Future cooldown uses an assumed 7h Xanax length and is not guaranteed.
- **Gyms:** current gym data and only manually verified visible, owned or unlocked-to-buy alternatives. Verification must happen while the Torn Gym page is open.
- **Perks & books:** only training-relevant perk descriptions, filtered Book inventory, advice to save 5%-stat books until 200m for the full +10m cap, other book timing cautions.
- **Progress:** locally stored daily stat snapshots and approximate 50m/100m/200m/1b single-stat targets, without public account uploads.
- **Settings:** weekly budget, daily refill comparison, extra manually configured gym gain percentage.

### Reinstall instructions

1. **Remove/disable both older Happy Jump Helper variants** (the ~5 KB lazy loader and the ~111 KB self-contained v0.6.3 build). Avoid duplicate scripts with the same name.
2. Install only the raw `Torn-Happy-Jump-Helper.user.js` URL from this repository. Verify the script says **v0.7.0** and source size about **22 KB**; injection **END**.
3. Reload Torn inside TornPDA. The floating **HJ ◉** button should appear without making any API requests. Tap it and manually press **Refresh Torn data**.
4. If the button is still missing, separately update the [HJ Injection Diagnostic](Torn-HJ-Injection-Test.user.js) to v1.3 and report its **Direct script version** and **Main script phase**. Do not disable or bypass CSP.

### Trade-offs and accuracy

This compact edition intentionally **simplifies** the previous 111 KB full-feature planner: it does not yet reproduce all advanced price-book combinations, probabilistic cooldown scenarios, exact gym membership scraping or a fully optimised recurring Happy-jump schedule. The separate [`Torn-Happy-Jump-Helper.full.js`](Torn-Happy-Jump-Helper.full.js) is retained as the **v0.6.3 development/reference engine**, but it is *not the file to install* in TornPDA.

Known conservative rule: Torn v2 `/user/refills` `energy:true` means the 30-point refill is **already used**. Missing API status is treated as unknown, not available. A manually marked refill-used day expires at 00:00 UTC. All gameplay remains manual and all requests are read-only GET. The current compact version passes **51 simulated tests** (legacy engine plus compact startup/refill tests) but still requires live device confirmation.


## v0.6.3 — CSP-safe self-contained TornPDA installation

**Critical installation change:** Torn's Content Security Policy forbids `unsafe-eval` on some pages. The previous 5 KB launcher fetched the 110 KB engine via `PDA_httpGet`, then used `new Function(fetchedSource)`; Torn's Item Market page blocked that runtime compilation and showed a CSP error. No browser security changes or exemptions should be made.

**v0.6.3 is one self-contained userscript.** The installable [`Torn-Happy-Jump-Helper.user.js`](Torn-Happy-Jump-Helper.user.js) directly includes all the code from [`Torn-Happy-Jump-Helper.full.js`](Torn-Happy-Jump-Helper.full.js). TornPDA injects it as a normal userscript; it **never** calls `eval`, `new Function`, `import()`, blob script URLs or dynamic compilation. The engine uses its normal `###PDA-APIKEY###` placeholder, which TornPDA substitutes at injection time. Normal read-only Torn API GET requests still run only after the user explicitly presses Refresh.

**Upgrade from v0.5–v0.6.2:**

1. In TornPDA's Manage Scripts, **remove/disable the previous Happy Jump Helper** (the old ~5 KB HJ launcher), not just reload its browser tab.
2. Import the **new** raw URL: `https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper.user.js`. Confirm **v0.6.3**, approximately **111 KB** of script, and injection **END**.
3. Make sure **only one Happy Jump Helper** script is enabled. The separate optional HJ diagnostic can be disabled.
4. Reload Torn inside TornPDA. The HJ button should be created **directly** without any code download. Open it and press Refresh to get current plans.
5. If the HJ button is still missing, use the diagnostic or TornPDA Dev Tools to check installation and startup. The full script has not yet been confirmed on your specific device under CSP; report the actual result rather than disabling Torn's security protections.

The former `new Function` loader is permanently removed from the installable source. Automated tests run the *actual installable file* in a simulated CSP-restricted environment and assert no API access occurs before the user's explicit refresh. Engine and simulated mobile tests **49/49 pass**, but live TornPDA verification is still required.


## v0.6.2 — Critical daily point refill status correction

An Android TornPDA screenshot on 26 October 2026 showed the helper offering another 30-point energy refill even though the player had already spent it. The issue was **not** item pricing or cooldowns: the helper had reversed the meaning of `/user/refills → refills.energy`.

- **`true` means already used today**; **`false` means not yet used**. An absent, malformed or failed API response means **unknown**, never "verified ready".
- The **Today**, **next-action**, **weekly schedule**, and **insights** now all use one consistent refill status resolver instead of independently interpreting the raw boolean.
- A manual **Mark today's refill used** action is now available whenever the helper doesn't already show used. It saves only the UTC date in TornPDA's local storage, overrides stale API reports of availability, and expires after 00:00 UTC. **Clear local override** is also available. Neither button performs any gameplay action.
- When the refill is already used, the simulator must not recommend **training energy before a refill** or inserting another refill on the same UTC day. Future-day refills remain conditional on the daily reset and must be confirmed in Torn.
- New pure-engine tests cover `true`, `false`, missing/malformed values, same-day suppression, tomorrow's date rollover and user overrides. UI tests check the Used/Available labels and the manual control. **49 simulated tests passed.**

**Do not follow any pre-v0.6.2 point-refill recommendation.** Reload Torn in TornPDA so the tiny launcher pulls the corrected full engine, manually refresh, and verify the Today status shows **Used today**. The helper remains GET-only and never spends points, drugs or energy.


## v0.6.1 — Real-device Today review fixes (26 October 2026)

After verifying a screenshot of v0.6 running inside Android TornPDA, v0.6.1 corrects a real simulator error and improves the Today screen:

- **A 30-point daily refill fills energy to the normal cap** (150 for a donator, 100 otherwise). It does *not* add the full cap on top of an existing or Xanax-stacked balance. The forecast now models the amount genuinely restored and cannot stack a point refill above the cap.
- A **pre-refill training suggestion** is only generated when a refill is actually budgeted and can follow it. The first day's refill must be explicitly reported **ready** by `user/refills`; used or unknown refills aren't assumed available. At subsequent UTC day boundaries the model allows the next daily refill.
- **Next manual action** distinguishes time remaining, "scheduled now", and a stale action. The countdown updates every second rather than claiming an action is "due now" up to a minute early. If training before a refill, the card displays whether that refill was verified available.
- The **Today** recommendation is more compact. Tabs are now horizontally swipeable in one row; swipe to reveal Progress/Settings. The forecast budget is labelled as a configuration, **not** a confirmed wallet balance.
- The refresh button can be used again after **15 seconds** to replan following a real game action (previously it was blocked for 60 seconds). API calls remain manual.
- Three new tests cover the observed **40 Energy** situation, used/unknown/unauthorized refill cases, and the compact action UI. **44/44 automated tests passed.**

Both the lightweight launcher and the downloaded full engine display **v0.6.1**. A running copy of the full engine does not hot-reload, so restart Torn in TornPDA to obtain the new engine. The 5 KB launcher structure remains unchanged. Actual future drug cooldowns and game outcomes are not guaranteed; do not act on a projected refill without confirming it is available in Torn.


## Version 0.6 — Feature overhaul (current)

**Install** the single self-contained [`Torn-Happy-Jump-Helper.user.js`](Torn-Happy-Jump-Helper.user.js) directly. As of v0.6.3, it contains the entire read-only planner and does not load or execute JavaScript dynamically. See the v0.6.3 upgrade instructions above. In TornPDA, keep injection on **END**. The script is strictly read-only: no training, drugs, refills or purchases are initiated by code.

### Seven-tab mobile workspace

| Tab | Main purpose |
| --- | --- |
| Today | **Next manual action** with UTC time, countdown, check-before-click warning, fast Strength/Defense/Speed/Dexterity selection, recommended weekly plan, bar snapshot, any confirmed superior gym, and API-data coverage |
| Compare | **All strategies together**, or filter **Regular / Happy jumps**, independently of whether the action timetable uses regular training or jump preparation. Compare weekly gains and spending with the same weekly budget |
| Plan | Default **next 24 hours** or full seven-day UTC schedule; item purchase/owned quantities, daily gain breakdown, fast-vs-slow cooldown forecast, manual checklist, and resource spending |
| Gyms | Compare current gym with explicitly verified **owned** or **unlocked-and-purchasable** gyms. Never recommend unseen, locked or otherwise unverified gyms. Gym-page capture and manual verification are read-only and expire after 24 hours |
| Perks | Relevant gym, faction, job, merit, property, stock, education and active book effects; 200m capped-stat-book advice and configurable review dates for 31-day gym books |
| Progress | Base battle-stat snapshots and observed changes **stored on this device only**, with future single-stat 50m/100m/200m/1b milestone forecasts and an erase-history control |
| Settings | Weekly spending limit, max jump frequency, target stat, gym overrides, perk/candy effects, refills, theme, timing/cooldown assumptions and travel offset |

### Calculation and reliability changes

- **Corrected market basket calculation:** quantity-weighted price tiers rather than one cheapest listing repeated indefinitely. Supplies you own can still be used in the scenario even when no market quote is available; faction-armory stock is never assumed yours.
- **Less brittle inventory:** fetches Drug, Booster, Candy and Book categories individually with pagination. If one category fails, any successfully loaded categories stay available; missing categories are treated as zero owned for *costing* without falsely asserting you have no books.
- **Faster refresh:** up to three requests at a time, read-only GETs to the official Torn v2 API, with independent endpoint failures and a source-coverage panel. Stale previous-market quotes are discarded.
- **Gym bonus math:** recognised standard percentage modifiers sum before multiplying raw gym gains, avoiding excessive source-by-source compounding. Other perk descriptions are displayed but not assigned speculative multipliers.
- **Cooldown estimates:** correct Ecstasy range **200–231 minutes** and Xanax **6–8 hours**. A slow/quick conditional projection compares both bounds. Scheduling still uses *assumed* future cooldown rolls, not certainty.
- **Faster navigation:** a week of ~60 candidate calculations is cached until the relevant data/settings change, instead of recalculating when switching tabs or viewing a different 24h/7d window.
- **Privacy:** history saves only time + four base stats in local browser storage, never in the public repository. No real API key, account records, cash balance or username is committed.

### Limitations and verification

All calculations are **estimates**. Happy drops can vary, market quotes may shift, books may have already been consumed despite appearing in inventory, special gym conditions can change, drug overdose outcomes are not simulated, and the helper assumes you perform listed actions when scheduled. Future 1b+ goals are what-if scenarios, not guaranteed dates. The current gym is used until you actually change it and refresh; book recommendations never consume books.

Run `npm run check` (syntax + Node engine and simulated TornPDA UI tests). The existing automated tests include a small HJ launcher that must remain visible even if the full engine download fails. **Live v0.6 testing against your device and account is still outstanding.**


## v0.5 — Small TornPDA launcher (missing HJ button workaround)

**Historical v0.5 approach (removed in v0.6.3):** the installable userscript used to be a 5 KB startup launcher. All of the read-only planner code remains in [`Torn-Happy-Jump-Helper.full.js`](Torn-Happy-Jump-Helper.full.js), but **do not import the large full file directly as a second TornPDA userscript**.

The old v0.5 tiny launcher inserted the HJ button before fetching the full simulator. **On the first tap**, it downloads the full helper from the fixed public HTTPS GitHub raw URL via TornPDA's supported `PDA_httpGet` function, verifies the identifying source markers, replaces TornPDA's API-key token in memory, starts the full interface, and clicks its HJ button to show the dashboard. It never writes to Torn or stores the API key. The downloaded code is executable code from the same GitHub repository, so trust the repository and review changes before updating.

If the download, script evaluation or UI start fails, the **small HJ button stays visible** and a status panel shows the HTTP or JavaScript error. No background refresh or Torn actions are initiated by the loader.

**Upgrade steps:**
1. **Delete or disable the previous Happy Jump Helper userscript**, including duplicates.
2. Import the latest **`Torn-Happy-Jump-Helper.user.js`** raw URL in TornPDA; the installed script must show **v0.5.0** and approximately 5 KB of source, with injection **END**.
3. Reload Torn inside TornPDA. The floating **HJ ◉** button should now be visible *before* you request any API data.
4. Tap **HJ ◉** once. The loader should briefly say it is downloading and starting the main helper. If not, capture the error text.
5. If you have the separate HJ diagnostic installed, update it to **v1.2.0**. It reports **Small HJ launcher** independently of the full engine, whose phase is normally *NOT STARTED* until you tap the button. You can remove the diagnostic after it works.

This architecture is a compatibility workaround for an **unconfirmed** early-injection / script-size or parse issue in TornPDA. No official platform size limit has been established. The current build passes automated unit, UI and downloader-error simulations but still requires verification on a real device.


**By IamEEKY** · Read-only TornPDA userscript · Experimental / estimates

An on-demand, live-API planning panel for Torn training. It **never performs Torn gameplay actions**: no item use, gym training, purchases, refills, background scraping, simulated taps, or automatic gameplay requests.

## Version 0.4 — Training schedules, gym verification and growth goals

**The first 24 hours are shown by default.** In **Plan**, tap *Full 7 days* to expand the timetable. The old *Per week / Per jump* switch has been replaced by **Training schedule** (regular energy/Xanax training without Happy jumps) and **Happy-jump schedule** (only jump combinations). The selected schedule type also filters the Compare tab. Weekly totals remain visible, so strategies can still be compared on overall growth rather than falsely attributing all weekly gains to one jump.

### Gym visibility and recommendations

The official Torn API provides the **active** gym and a public catalogue of all gym training multipliers, but **does not report which memberships you own**. To avoid recommending locked or invisible gyms, go to Torn's **Gym page** within TornPDA, open **Gyms** in this helper, and tap **Capture visible gyms**. The button only inspects the already displayed page **after you press it**; it does not navigate, click, buy membership, select a gym or train.

Confirm each visible gym as *Already purchased*, *Unlocked, buy membership*, or *Unverified/exclude*. When Torn's layout prevents reliable detection, expand **Can see a gym but capture missed it?** on the **Gym page** and manually confirm a gym that you genuinely see unlocked. Unverified, invisible or locked gyms are never recommended. Local verification expires after **24 hours**, so refresh after unlocking a new gym or when the list changes.

The optimiser compares **gains for the same energy session**, with gym-specific dots and energy costs. Eligible specialist-gym stat-ratio restrictions are checked. A better owned gym is suggested as a **manual switch**; a visible unlocked but unpurchased gym is shown as a **manual membership purchase**, with its price. **The schedule continues to use your current active gym until you actually switch and refresh.**

### Training-relevant passive effects only

The **Perks** tab hides unrelated combat-effective stats, financial stock benefits, driving and other non-training perks. It shows only gym gains, Happy, natural Energy, drugs, boosters, candy, refills and relevant cooldown effects. It distinguishes positively parsed training modifiers from informational effects which cannot yet be quantified. No non-gym merit is silently included in stat-gain math.

### Long-term goals and book months

The Perks tab also projects **50m, 100m and 1b in the selected base stat**, including a changing-growth projection, estimated weeks, calendar dates and cost at the current chosen scenario's weekly spending. It uses *the current* gym, perks and costs without assuming future unlocks, events or market pricing remain constant. A date is a **scenario**, not a guaranteed delivery date.

For the four 5%-stat books, it shows the full +10m cap at **200m of the matching stat**, and an approximate month/date to reconsider using it. For 31-day gym-gain books, choose a *gym-book review milestone* in Settings (default **50m**) to plan a later high-throughput training block. The 50m review threshold is your selectable planning rule, **not a mathematically optimal usage date**. There is no universal finite "best stat" at which to use a multiplicative gym book; opportunity cost, events and future training cadence matter. The helper will never consume any book. Used display copies cannot be distinguished reliably from genuinely unused books solely by inventory.

**Scope and limitations:** future cooldowns are simulated with a configurable mean, the seven-day schedule assumes planned manual attendance and no overdoses, and long-term dates use a model of compounding gym gains. Live Torn account integration has not yet been tested on the user's actual device. Keep the read-only rule throughout.

## Version 0.3 — Conditional 7-day schedules and passive-effect audits

**This is a read-only forecast, not automated gameplay.**

### Exact clock times with explicit uncertainty

- The planner simulates a **UTC timestamped action sequence** in 60-second increments across seven days, regenerating natural energy, recovering 5 Happy at the 15-minute marks, honouring cooldowns, holding energy at its proper caps, resetting temporarily elevated Happy and respecting the daily refill and budget. Each predicted action is clearly **manual**.
- Each scenario is ranked using its **simulated total weekly gym gain**, rather than the older estimated jump-capacity score. It counts only actions it could actually afford and complete during the simulated week.
- Future Xanax cooldown lengths are **random (6–8 hours)**. The schedule uses a user-configurable assumed duration (7 hours by default), and four-hour illustrative Ecstasy cooldown; actual timers, overdose risk, market stock, missed check-ins, travel times and game changes will require manual refresh/replanning. Times are exact **given the assumptions**, not guaranteed in-game timestamps.
- Being abroad: if you know your return time, enter **Hours until return**; otherwise all listed gym times are **hypothetical until you return to Torn**.
- The mobile **Compare** and **Plan** pages let you switch **Per Week / Per Happy Jump**. Non-jump strategies show *No Happy jump* instead of a misleading number.
- The **Overview** describes *why* a winning Xanax-only schedule may beat Happy jumps, with the energy actually trained, lost regeneration, item cost and predicted stat growth for each scenario.

### Passive effects and books

- User-initiated API v2 reads `user/perks` to audit active job, property, education, stock, merit, faction and book effects by source. It no longer makes redundant calls to those unrelated detailed endpoints; other read-only requests cover bars, gym, cooldowns, inventory, travel, markets and refills.
- The Perks tab shows actual source descriptions, **not invented or guessed bonuses**. Verified, positive gym-gain percentage descriptions are multiplied into the training estimate by source and target stat. Other effects are visible but are not silently treated as a gym-gain percentage. Merits affecting effective combat stats are **not** interchangeable with gym gains.
- Current maximum Happy and max Energy are taken from bars, reflecting property / qualifying effects already included in those API values.
- Recognisable current active perks for Goal Oriented Happy loss, doubled eDVDs, 50% consumable cooldown book, doubled-candy book, Ignorance Is Bliss reset exemption and eligible faction Candy happy percentage are also factored in if identified. Non-recognised descriptions and stock dividends, employee job points, faction point perks or unclaimed rewards require review rather than being fictionalised.
- Fetches **Book-category inventory** with the same conservative treatment as other optional inventory categories. Detects training-relevant books, predicts their theoretical upside, and recommends when to **SAVE**.
- The four books that grant 5% of a stat, capped at 10,000,000, have their full mathematical value once the **specific base stat reaches 200,000,000**. Prior to that, the helper shows your current potential and a planning target; its time-to-target estimate is conditional.
- For 31-day gym training books, displays illustrative additional gains from the current weekly pace, while explaining that saving them for a high-output month can be worthwhile.
- **Important limitation:** Torn keeps unusable copies of previously read books in inventory. API inventory alone does not prove the displayed book is still unused. The dashboard will not recommend consuming anything automatically or pretend to verify unused status.

To validate locally, run `npm run check` (syntax, unit and simulated TornPDA interface checks). The model has not been verified against the user's live TornPDA account, so labels deliberately distinguish confirmed API values, user assumptions and projections.

## Version 0.2: mobile usability and budget optimisation

- **Four readable tabs**: Overview, Compare, Steps, Settings. High-contrast dark theme by default and an optional bright light theme.
- **Goal selection**: maximum stats vs cost efficiency; automatically train the weakest current battle stat, or focus one of the four stats.
- **Refill comparison**: the optimiser now compares seven daily points-energy refills **and** no-refill methods under the same weekly budget, by default. You can also force refills on/off.
- **Travel-aware**: a read-only travel API check displays a warning when abroad or flying.
- **Inventory error 21**: Torn defines this as `Incorrect category`. We now request category-specific `Drug`, `Candy` and `Booster` inventory pages. If they fail or pagination exceeds one page, the helper continues with an explicit warning and **full-purchase cost estimates**; it never invents owned stock.
- **Default preferences for a new installation**: $10m weekly, maximum stat growth, weakest stat first, up to six sessions/day, compare with/without point refills. They can all be edited locally. **No real personal stats or inventory are preloaded into the public source code.**
- **Testing**: 15 deterministic calculation and TornPDA UI smoke tests including category error 21, navigation and travel alerts.

`v0.2` is a working beta verified by simulated API/browser fixtures. It has **not** been tested against your actual live TornPDA session. Timers use the last manual snapshot; the weekly model is a capacity approximation, not a validated minute-by-minute scheduler.

## Troubleshooting — diagnostic boot phases (v0.4.3)

If the separate HJ TEST button appears but the actual HJ launcher does not, the
TornPDA userscript framework **is working**. The remaining issue lies in the
main script's installation, execution, or page mounting.

To distinguish these cases without a developer console:

1. Replace or update the main script to **v0.4.3**, using the repository's raw userscript URL.
2. Update the existing **HJ Injection Diagnostic** to **v1.1.0** using
   [Torn-HJ-Injection-Test.user.js](Torn-HJ-Injection-Test.user.js). It will show
   a read-only dark status panel next to the green **HJ TEST ✓** button.
3. Reload Torn within TornPDA, then read **Main script phase** and **Main script version**.
4. Report the values:
   - **NOT STARTED** — installed main userscript did not begin executing, or could
     not be parsed. Check the exact installed version, source integrity and script
     enablement.
   - **STARTING** or **ENGINE-LOADED** — main code began but stopped before mounting.
     A red **HJ STARTUP ERROR** button may also appear.
   - **WAITING-BODY** — startup ran but there is no usable page body yet.
   - **MOUNTED** — the main launcher was attached; the panel also shows whether
     its DOM node exists and appears visually hidden.
5. Diagnostic does **not** access Torn's API or perform actions. Disable it after
   the problem has been identified.

The boot-phase marker is set by the main script before the planning engine loads.
The diagnostic is deliberately a separate, very small script that has already
been confirmed to execute on TornPDA.

## Troubleshooting — missing HJ launcher (v0.4.2)

**Important:** editing GitHub does **not** guarantee that TornPDA's already-installed copy was updated. In TornPDA Settings → Advanced Browser Settings → Manage Scripts, explicitly **Update** the Happy Jump Helper from its raw URL, or delete only that script and re-import the latest source. Confirm version **0.4.2**, enabled state, and injection time **END**, then reload a `torn.com` page in TornPDA.

v0.4.2 adds `@run-at document-end`, fixes a startup early-exit if the game page exposes a global `module.exports`, delays stylesheet insertion until the body exists and uses a visibly styled middle-right HJ button. It still periodically restores the UI if Torn replaces the page body. Tests exercise each of these start-up conditions.

**If it is still missing**, install the separate [HJ Injection Test](Torn-HJ-Injection-Test.user.js) using its raw GitHub URL, with injection END. Its small **HJ TEST ✓** button should appear on the left. The test makes **zero** Torn API calls and does not perform game actions. Tap it to confirm scripts execute.

- **HJ TEST appears but HJ does not:** the helper is not being installed or executed correctly, or is hitting an early error; inspect TornPDA Dev Tools → Scripts/Terminal, confirm v0.4.2, and send the visible error text.
- **Neither button appears:** check TornPDA's global userscript enabled toggle, the individual script enabled status, matching Torn domain and injection END. This indicates a script-injection / installation issue, not a stat-calculation bug.

Remove or disable the diagnostic script after confirming execution.

## Install

1. In TornPDA, open its **Userscripts** manager and add a new script from the `Torn-Happy-Jump-Helper.user.js` file (or its raw GitHub URL).
2. Enable it for `https://www.torn.com/*` and open a normal Torn page **in TornPDA's browser**.
3. In TornPDA, use the script's injection time **END**, open a Torn page and tap the small **HJ** floating launcher, then **Refresh Torn data** (manual request).
4. In Settings select dark or light theme, training target, budget, perks and schedule type. The Compare tab ranks only strategies of the chosen type, with optional daily point refills.
5. Use the numbered checklist yourself. **Nothing in Torn is executed by this script.**

### API key and privacy disclosure

The script uses the key supplied by TornPDA using its native `###PDA-APIKEY###` substitution. **Do not paste a key into the repository or the script source.** The key is placed **only in an `Authorization: ApiKey ...` header** of read-only HTTPS GET requests made directly to `https://api.torn.com/v2`, via TornPDA's native HTTP handler. The key is **not saved**, logged or shared with the script author, and no external analytics service is used. No account data is uploaded to GitHub. The script keeps fetched game data only in memory for the current browser session. Only non-sensitive planning preferences (not key, stats or inventory) may be stored locally in browser storage.

**API selections:** `user/bars`, `user/cooldowns`, `user/battlestats`, `user/refills`, `user/gym`, `torn/gyms`, `user/inventory`, `market/{itemId}/itemmarket`, `market/pointsmarket`. Battle stats need a *Limited* key; lower-access keys produce partial results with warnings. Market and gym metadata require public access. Requests are **user-initiated only**. The on-screen countdown uses locally cached timestamps, not background API calls.

**Pricing:** Item prices use market listing prices from Torn's globally cached API, not guaranteed executable quotes or a scraped live order book. Market listings can be exhausted, and their age is shown. Missing or stale prices are **never invented**; economic rankings are withheld if required quotes are missing.

**Estimates:** The earliest jump window is approximate, based on average Xanax cooldown and current snapshot. Gym gain model uses the formula documented on the official Torn Wiki; the model is approximate and should be calibrated to your observed gains. Long-run scenarios use average drug cooldown, conservative 24h booster throughput, configurable available jump opportunities, and an approximation for energy lost while stacked. They are **not exact calendars** and omit overdoses, rehab travel, addiction penalties, events not configured, competing gameplay, market liquidity/slippage and inventory consumption unless otherwise stated.

## What it calculates

- Live energy, current and base happiness, drug/booster cooldowns, current gym, four battle stats and travel destination
- Item holdings, item market listing costs (Xanax, Ecstasy, lollipop, chocolate, eDVD), point market quote
- Configurable jump strategies (micro candy, large candy, 1–4 eDVD, 0–4 Xanax)
- Estimated training gains at base happy vs boosted happy, using current gym, target stat and manual modifiers
- Estimated weekly sustainable frequency, wasted natural regeneration, weekly costs, incremental stat gain, cost per additional stat
- Separate value-ranked and speed-ranked recommendations, including daily points refills and regular Xanax training
- Manually tickable jump checklist (only checks local UI state), approximate next jump window, quarter-hour happy reset countdown, missing-resource warnings and improvement ideas

## Safety & engineering

- GET requests only, no write endpoints, non-API Torn requests or background polling
- API key only in HTTP authorization header, never query strings, DOM, console or storage
- DOM panel isolated with ID prefix; rendering escapes API-controlled text
- One request burst per manual refresh; throttled refresh to respect API cache and rate limits
- Uncertain results are labeled as simulations, not actual Torn outcomes
- No personal identifying information or API keys in the repository

## Sources (verify on release)

- [Torn's official API v2 OpenAPI contract](https://www.torn.com/swagger/openapi.json)
- [Torn's scripting policy](https://www.torn.com/forums.php?f=67&t=16037108)
- [TornPDA userscript support](https://github.com/Manuito83/torn-pda/tree/master/userscripts)
- [Official gym training formula](https://wiki.torn.com/wiki/Gym)
- [Happy/reset rules](https://wiki.torn.com/wiki/Happy)
- [Item cooldowns](https://wiki.torn.com/wiki/Item_Cooldown)

## Roadmap

See [ROADMAP.md](ROADMAP.md). Contributions should be anonymous in demo data and must never contain real player info, API keys, or secrets.

Licence: MIT.
