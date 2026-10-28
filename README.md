# Torn Happy Jump Helper — v0.10.5

**Latest Android test release: v0.10.5 · IamEEKY**

**[Install/update Happy Jump Helper in TornPDA](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper.user.js)**

v0.10.4 was **shown running on Android** with the working launcher and Progress tab. This update preserves the v0.10.4 action recovery and existing eight tabs, UK sleep settings, gym formula, inventory logic and local history. v0.10.5 itself is awaiting on-phone confirmation.

## Progress chart clarification — new in v0.10.5

The **Progress → 7-day observed vs planned** chart now distinguishes measured gains from actions that were **not scheduled in the matching forecast interval**.

- A Torn API stat increase with a valid matching, positive planned gym gain continues to appear as observed-versus-forecast. The forecast assumes you carried out the simulated steps; a shortfall by itself does **not** prove you missed training.
- Gains outside a matching scheduled forecast (including planned gain of **zero**, unknown/mismatched forecast focus, or changing your training priorities) now appear as **Outside forecast**, with a single observed bar and an explicit unpaired-gain amount. No misleading **0 scheduled** comparison or “comparable interval” count is created.
- Checkpoint totals reflect **changes between API refreshes**, not a complete list of historical gym workouts. A recent gym session visible in Torn's activity log may not yet appear in the stored checkpoints if it happened after the last stat read or the API data has not caught up. The chart assigns multi-day intervals to the **refresh date (UTC)**, without claiming the workout happened on that exact date.
- Progress now includes **Latest stat check** and a direct **↻ Check new gains** button, using the existing read-only refresh. This is useful immediately after a real Torn gym session. It does not create or assume gains while waiting for API data.

All tests use **synthetic, non-player-specific gym gains**. The public repo contains no real activity-log records, imported individual player data, or API keys.

## Missed action recovery — introduced in v0.10.4

When an action from the **previous saved plan** is past due, the helper carefully labels it **Past due · unconfirmed**. It does **not** assume the action was missed: you may have completed it without opening HJ.

You can choose:

- **I did it** — store an undoable, self-reported completion note; this doesn't create stat gains, consume supplies or mark a refill as spent.
- **Missed it · Replan** — record that **you** missed that action, then refresh Torn's current bars, stats, cooldowns, gym, inventory and prices, and recalculate the current plan. It never reuses the expired action's simulated energy or predicted stat increases as real activity.
- **Not sure** — dismiss the old prompt without labelling the action done or missed.

The helper now keeps an unresolved watched action for **up to 12 hours**, which covers the typical **23:00–08:00 UK** sleep period. Warnings are suppressed during configured sleep. A watch naturally expires afterward; opening HJ still replans from current live data even when no explicit missed-action note is recorded.

### Recovery result

After choosing **Missed it · Replan**, a local **Missed · recovery** panel shows:

- The skipped action and its previous simulated target (if it had a gain).
- The timestamp of the newly completed live-data refresh, the revised selected strategy, the next suggested action, and the newly estimated **24-hour stat gain**.
- The important distinction that past gains are **not recovered** by the new forecast.
- **Clear missed label** to remove the local annotation; this does not undo or alter Torn actions.

If essential API data fails to load, recovery stays **pending** and asks for another refresh. It does not falsely announce a completed replan based on default or missing energy.

If you previously chose a strategy manually and the current data supports a different **higher seven-day-gain, budget-feasible option** for your chosen training mode, the recovery panel offers **Switch plan**. No strategy changes without you pressing it. Automatic strategy selection continues to prefer the highest simulated gains within the configured spending limit.

### Evidence and safety

- **Likely training** remains an inference from recorded stat increases, not proof of the scheduled action or its exact time.
- An active drug cooldown **alone no longer suppresses an unresolved Xanax watch**; it isn't reliable proof that this particular Xanax action happened.
- Recorded manual confirmations remain separate from automatic stat observations and from **missed-action** annotations.
- The helper never performs training, takes Xanax, spends points, buys goods or uses extra API write permissions.
- Observations and missed actions are kept locally on the device; no personal stats, API keys or inventories are published to GitHub.

## Existing functionality retained

- **Today:** gym gain estimates, live bars, next three manual steps, refill checks, predicted resource waste, future stat recommendations.
- **Compare:** regular, Xanax, candy Happy jump and eDVD Happy jump alternatives; independent forecasts across each battle stat.
- **Schedule:** 24 hours or seven days, time-ordered action timeline and seven-day UTC daily overview.
- **Supplies:** estimates **additional purchases** after already-owned Xanax and entered points have been accounted for.
- **Gyms:** recommends better gyms **only if they are confirmed accessible/unlocked**, including visible gyms not purchased.
- **Perks & books:** relevant training effects and books.
- **Progress:** actual stat checkpoints, cautious estimated train counts, partial-day coverage and observed-vs-simulated comparisons.
- **Settings:** default **Torn $50m/week** limit and editable UK quiet hours. Previously saved **23:00–08:00** sleep settings remain unchanged.

Every HJ opening refreshes Torn data; there is no background polling or automated Torn gameplay. Optional full Torn-log reconciliation remains disabled.

## Installation and rollback

1. Keep only **one enabled main Happy Jump Helper** userscript. Turn off duplicate Preview/Advanced/Companion copies.
2. Update from the [raw v0.10.5 script](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper.user.js), retaining TornPDA injection **END**.
3. Reload Torn. Tap **HJ ◉**, check the full-screen heading displays **v0.10.5**, then open Today or Schedule.
4. When an old action is shown as **unconfirmed**, choose **I did it**, **Missed it · Replan**, or **Not sure** based on what actually happened. After marking one missed, check the updated forecast and optional better-plan recommendation. In **Progress**, tap **↻ Check new gains** to look for stat changes following recent gym training.

If the new release fails to open or introduces a regression, disable it and use the screenshot-confirmed **[v0.10.4 rollback](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/archive/Torn-Happy-Jump-Helper-v0.10.4-screenshot-confirmed.user.js)**, the previous **[v0.10.3 rollback](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/archive/Torn-Happy-Jump-Helper-v0.10.3-rollback.user.js)** or the **[v0.10.2 phone-confirmed rollback](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/archive/Torn-Happy-Jump-Helper-v0.10.2-known-good.user.js)**. Leave only one HJ script enabled and **do not clear its local storage**.

## Validation

**84/84 targeted simulated TornPDA regression tests passed**, covering existing features and: overdue manual Done/Not sure/Missed distinction; recovered 24-hour calculations from new live energy; no invented gains or refill spending; pending recovery after failed API load; undo; persistence; changing strategies only after the user's approval; no false Xanax confirmation from drug cooldown; and overnight review after waking. Added tests cover observed gains with zero forecasted trainings, two successive independent gym stat increases, stat-focus mismatch, and the one-tap Progress refresh.

Main userscript size: **59,368 characters**, under the **60,000-character** compact guard and well below the earlier problematic ~78 KB preview. JavaScript parsing passed. **Live Android v0.10.5 and the full GitHub Actions suite are not yet independently verified.**

MIT · IamEEKY · [Historical release notes](docs/legacy-release-notes.md).
