# Torn Happy Jump Helper — v0.10.3

**Current Android test release: v0.10.3 · Author: IamEEKY**

[**Install/update the main TornPDA Happy Jump Helper**](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper.user.js)

v0.10.2 was **confirmed working on Android**. This update keeps its full-screen floating HJ launcher, eight tabs, correct gym calculations, refill handling, UK sleep rules, charts, automatic data refresh on opening, and locally saved user settings. No extra Torn API permissions are requested.

## New in v0.10.3

**Overdue recommendations now survive refreshes.** The helper remembers the earliest upcoming action from the last successfully refreshed plan. When that action is **10–90 minutes past its scheduled time**, it can appear as **Past due · unconfirmed** in **Today, Schedule and Progress**, even after reopening HJ.

- The overdue card displays the **action, original scheduled time and minutes elapsed**. Its status never claims the action was missed or completed.
- **I did it** records a self-reported completion in local device storage. **Dismiss** clears the reminder without recording completion. Neither action trains in Torn, takes Xanax, spends points or fabricates battle-stat gains; both re-fetch Torn data to recalculate the next steps.
- During the configured **UK sleep hours**, reminders are suppressed. Expired actions older than 90 minutes are dropped rather than accumulating into an overnight backlog.
- For training, a matching recorded stat increase within the refresh interval suppresses the reminder; a refill confirmed used by Torn, or a fresh drug cooldown for Xanax, similarly prevents an inappropriate warning. These indicators avoid nagging; they **are not evidence that an exact scheduled action happened**.
- When the selected training strategy or target stat changes, a warning from the previous strategy is not carried into the new one.
- The original **ten-minute due-action button** is preserved. The older overdue card uses separate, clearly labelled manual controls for the previous recommendation.

Only **one previous recommendation** is watched at a time. This feature does not schedule notifications, poll in the background, import gym logs or perform gameplay actions.

## What's new in v0.10.2

### Three-step action guidance

**Just happened → Next action**, shown in **Today, Schedule and Progress**, now shows up to **three upcoming steps**: Next recommended → Then → After.

When live stat changes match the expected gain for one or more ordinary gym trains under the same gym, the helper displays **Likely training — N train(s) inferred**. This is a snapshot inference, not proof that the planned gym action happened at a particular time; Xanax, point refills and boosters are *not* automatically marked completed.

**Manual confirmation is clearer and safer:**
- The confirmation button identifies the **due action and scheduled timestamp** rather than simply saying "I completed this."
- You can confirm an action from **10 minutes before to 10 minutes after** its predicted scheduled time. Actions outside the window are not presented as due.
- Double taps within two seconds cannot mark two separate events. A manual note is stored locally, can be undone and does not fabricate stat gains or mark a daily refill as used.
- If the due action has just passed, it remains visible before later future events so the button matches the action being confirmed.
- When you confirm, the helper refreshes actual Torn values and recalculates recommendations. The note remains explicitly **self-reported**, not API-verified.

### Readable rolling seven-day schedule

Open **Schedule → 7 days** to see the new **7-day action overview**, grouping forecast events by UTC date with the number of planned gym sessions, scheduled energy, expected stat gains and *additional* purchase costs. Because the forecast covers the next **168 hours**, it can span parts of eight UTC calendar dates; the first and last date rows may be partial. The usual individual action timeline follows the overview.

Switch to **24 hours** for the shorter view. Neither overview is claimed to be a log of completed actions, and neither assumes purchases are required for Xanax/points already owned.

### Less repetition on Today

The old second "Next step · selected forecast" panel has been removed. Its information is now in the single three-step **Just happened → Next action** section. Some redundant text has been shortened while preserving controls.

## Existing features preserved

- Accurate Torn API v2 gym-dot normalization, multi-train session interpretation, and per-train, 24h and seven-day estimated stat gains.
- Regular/Xanax/Happy-jump plan alternatives with saved **Torn $50 million/week** default spending cap and owned-item purchase deductions.
- Editable UK sleep window (default 22:00–08:00; a previously saved **23:00–08:00** preference stays unchanged), DST-aware planning and estimated wasted regeneration.
- Progress charts, inferred training observations, recorded vs scheduled comparisons, persisted partial-day display and historic on-device checkpoint ledger.
- **Every HJ opening refreshes Torn data.** No background 15-minute polling or automated Torn gameplay.
- Optional full-access gym-log import remains **disabled and unimplemented**; no additional permissions required.

## Installation and rollback

1. Keep only **one** enabled main Happy Jump Helper script; disable any duplicate Preview/Advanced/Companion variants.
2. Update using [the v0.10.3 raw source](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper.user.js), keeping injection at **END** in TornPDA.
3. Reload Torn, tap **HJ ◉** and check the full-screen header reads **v0.10.3**.
4. Inspect the three-step panel and **Schedule → 7 days**. For a due manual action, the Confirm button should show the specific action and time. Refresh after training to see an inferred activity result.

If the launcher or panel fails, disable v0.10.3 and install the independent **[phone-confirmed v0.10.2 rollback](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/archive/Torn-Happy-Jump-Helper-v0.10.2-known-good.user.js)**. Leave one enabled and **do not clear local storage**.

## Validation and privacy

**70/70 focused userscript regression tests passed** in a simulated TornPDA and Torn API environment. This covers launcher boot, API refresh on opening, the existing eight tabs, sleep/DST boundaries, refill rules, training estimates, rolling actual gains, day grouping, three-action order, named due-action confirmations, 10-minute retrospective completion, double-tap protection, recently overdue actions across refreshes, sleep-hour suppression, observed-training recognition, overdue Done/Dismiss, expired reminders and changed-strategy safeguards.

The self-contained main script is **56,992 characters**, under the 57,000-character compact-source guard. **Live Android v0.10.3 and the complete GitHub Actions suite are not yet independently verified.**

No real API keys, user stats, personal item inventories or financial records are committed to the public repository. Actions in Torn remain entirely manual.

MIT · IamEEKY · [Historical release notes](docs/legacy-release-notes.md)
