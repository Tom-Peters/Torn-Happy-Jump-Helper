# Torn Happy Jump Helper — v0.10.4

**Latest Android test release: v0.10.4 · IamEEKY**

**[Install/update Happy Jump Helper in TornPDA](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper.user.js)**

v0.10.2 has been **confirmed working on Android**. v0.10.4 builds on the previous overdue-action tracking while preserving the working floating HJ launcher, full-screen interface, eight tabs, local history, UK-time sleep settings, gym calculations, saved budget and read-only Torn API usage.

## Missed action recovery — new in v0.10.4

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
2. Update from the [raw v0.10.4 script](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper.user.js), retaining TornPDA injection **END**.
3. Reload Torn. Tap **HJ ◉**, check the full-screen heading displays **v0.10.4**, then open Today or Schedule.
4. When an old action is shown as **unconfirmed**, choose **I did it**, **Missed it · Replan**, or **Not sure** based on what actually happened. After marking one missed, check the updated forecast and optional better-plan recommendation.

If the new release fails to open or introduces a regression, disable it and use the previous **[v0.10.3 rollback](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/archive/Torn-Happy-Jump-Helper-v0.10.3-rollback.user.js)** or the **[v0.10.2 phone-confirmed rollback](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/archive/Torn-Happy-Jump-Helper-v0.10.2-known-good.user.js)**. Leave only one HJ script enabled and **do not clear its local storage**.

## Validation

**80/80 targeted simulated TornPDA regression tests passed**, covering existing features and: overdue manual Done/Not sure/Missed distinction; recovered 24-hour calculations from new live energy; no invented gains or refill spending; pending recovery after failed API load; undo; persistence; changing strategies only after the user's approval; no false Xanax confirmation from drug cooldown; and overnight review after waking.

Main userscript size: **58,766 characters**, under the new **60,000-character** compact guard and well below the earlier problematic ~78 KB preview. JavaScript parsing passed. **Live Android v0.10.4 and full GitHub Actions are not yet independently verified.**

MIT · IamEEKY · [Historical release notes](docs/legacy-release-notes.md).
