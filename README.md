# Torn Happy Jump Helper

**Current main release: v0.9.0 · author: IamEEKY**

A read-only, full-screen TornPDA training adviser that estimates gym gains, compares verified gyms, recommends a sleep-aware manual schedule and checks forecasts against actual stat changes.

**[Install / update the main TornPDA userscript](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper.user.js)**

## Install in TornPDA

1. Keep **one** main `Torn Happy Jump Helper` script enabled. Disable the old Advanced Companion, Enhanced/Advanced Preview, and duplicate HJ scripts.
2. Update the source of your main script from the raw link above.
3. Set injection to **END**, reload Torn, and tap **HJ ◉**.
4. Check that the full-screen title says **v0.9.0**, then select **Refresh data**.

The old [v0.7.1 recovery script](Torn-Happy-Jump-Helper-v0.7.1-backup.user.js) is separately installable if the current script cannot launch. Don't clear device storage when updating: it retains budget, settings, gym confirmations and history.

## What's useful in v0.9.0

| Tab | Purpose |
|---|---|
| **Today** | Current stat and gym, **one train**, remaining-energy session, **next 24h**, **next seven days**, expected spend, refill guidance, sleep-related cap waste, top confirmed gym and latest verification |
| **Compare** | Four independent battle-stat scenarios and regular vs single-jump alternatives, with consistent time windows and projected lost regeneration |
| **Schedule** | Time-specific manual train/drug/refill actions, 24-hour or seven-day totals, estimated spend and wasted regeneration |
| **Supplies** | Owned/needed Xanax, Ecstasy, candy, eDVDs and points, market depth and cost assumptions |
| **Gyms** | Ranks *only manually verified owned or unlocked/unpurchased* gyms by maximum estimated stat gains for the same energy, excluding unseen or locked gyms |
| **Perks & books** | Relevant training/cooldown perks and cautious guidance for books |
| **Progress** | Rolling real-vs-planned stat gains, a seven-day log of observed daily stat changes, forward targets and a reset button |
| **Settings** | **Torn $50m/week** default budget, manual points/prices, perks and configurable sleep/rolling-check options |

### Sleep-aware planning

Quiet hours are enabled by default from **22:00 to 08:00 in the device's local time**. Change both times or disable quiet hours under Settings → Sleep and wake schedule. No training, Xanax, Ecstasy, boosters or point refills will be *scheduled* while asleep. Normal energy regeneration continues; the simulator trains available energy **before bedtime** and **on waking**, when appropriate to the selected strategy. Forecasted energy lost at the cap, including the portion during sleep, is shown separately for 24 hours and seven days. A ten-hour sleep can still have unavoidable cap loss because the natural 150 E bar refills in approximately five hours.

### Rolling verification and daily gains

On the first successful refresh, the helper stores a **local-only baseline** with current stats and the selected forecast. On later successful refreshes it compares the real stat difference with gains from scheduled train events for the same elapsed interval. Every qualifying interval is stored in a 30-day bounded ledger, and the Progress tab displays the last seven days by stat.

- **Automatic checks:** on by default, **every 15 minutes while the HJ dashboard remains open**, except when you're editing Settings. No API requests are triggered merely by injecting the script. Manual refresh works whenever you choose.
- **Observed vs predicted is not evidence that you obeyed the plan.** Training another stat, changing gyms, overdosing, spending energy elsewhere or missing a scheduled action will cause divergence.
- With no intervening successful refreshes there is no complete day-by-day observation. Intervals crossing midnight are attributed to their ending date and are labelled.
- The helper does not publish, export or send your stat ledger to GitHub or another analytics provider. Current Torn API requests are sent directly to Torn through TornPDA.

### Gym recommendations

Current gym access is known from your selected gym. Other gym membership status is only a **local manual confirmation**, available from the helper's Gyms tab on Torn's Gym page. A gym's appearance in the public Torn catalogue or on a page is **not** proof that you can unlock it. This helper does not change gym membership or purchase anything automatically. It compares the same energy allocation in eligible, verified gyms and shows an approximate gain improvement and a membership cost when known.

## Forecast limitations

- Gym gains are approximate; API-v2 modifiers (such as **7.0 gym dots**) are normalized without incorrectly dividing by 10 again.
- Normal training is modeled as repeatable; a prepared Happy jump is a **single** session rather than a fabricated weekly repeat.
- Future Xanax cooldowns use a simplifying seven-hour assumption. Booster interactions, overdose risk, live availability, training perks and unexpected gameplay can change real results.
- Market costs are estimates. The configured $50m is a **planning budget**, not a claim about your current in-game cash.
- No drug, refill, gym training or game mutation is triggered. All actions are **manual suggestions** and must be checked against current Torn data.

## Development checks

**25/25 focused v0.9.0 userscript tests passed** in a JavaScript/TornPDA mock environment covering full-screen launching, refill flags, API inventory fallbacks, both jump kits, accurate gym-dot units, 24h/7d totals, pre-bed and wake training, sleeping restrictions, energy waste, rolling observations, confirmed gym rankings and 15-minute refresh behaviour.

Full GitHub Actions execution and live v0.9.0 Android validation have not yet been verified.

Historical development and rollback details: [archived release notes](docs/legacy-release-notes.md).

MIT licence · IamEEKY
