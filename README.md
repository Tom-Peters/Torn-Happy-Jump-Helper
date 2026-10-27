# Torn Happy Jump Helper — v0.9.3

**Current mobile test release: v0.9.3 · author: IamEEKY**

**[Update the main TornPDA HJ userscript](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper.user.js)**

The floating HJ button and full-screen interface in v0.9.2 were **confirmed working by the user on Android**. v0.9.3 preserves that start-up mechanism unchanged and adds only a **small rolling stat verification and daily progress feature**.

## v0.9.3 — rolling verification

1. Open HJ → **Today** and press **Refresh data** to create a **local-only baseline**, with current Strength, Defense, Speed, Dexterity and the selected plan's forecasted train events.
2. After a real training session, open HJ and **Refresh data** again. The helper compares actual Torn stat changes against the gains predicted by the **previous** plan for the elapsed time.
3. Visit **Progress** → *Rolling verification · seven days* to see grouped daily stat changes and the latest actual-versus-planned result.
4. Use *Clear rolling history* to erase the verification ledger and current baseline without changing budget, sleep settings, other local history or gym confirmations.

**Interpretation:** A difference between actual gains and forecast gains does not establish whether you followed the schedule: real changes may include other gameplay, different training, books, bonuses, timing variation, and gym changes. Observations are attributed to the date of the second refresh; intervals spanning midnight are not split across two days. Multiple successful refreshes are required to build daily history.

The snapshot ledger is bounded to at most **120 entries** and **30 days** on this device. The Progress display shows observations from the **last seven days**. No new Torn API endpoints, automatic API polling, remote telemetry, or live game automation is added.

## Existing functionality retained

- Same phone-tested floating HJ ◉ button and full-screen panel, with the original eight tabs.
- **22:00–08:00 local sleep window** by default, configurable in **Settings** or disabled.
- No manual train, Xanax, booster or point refill actions scheduled within configured sleep hours.
- Pre-bed and wake-up energy use, and forecasted cap losses over 24 hours and seven days.
- API-v2 gym dots correctly normalized, including verified per-train stat gain estimates.
- **Torn $50 million weekly budget**, per-train/24-hour/seven-day training, supply estimates and read-only recommendations.

## Installation and fallback

1. Keep **one** enabled main Happy Jump Helper script; disable duplicate/Advanced/Companion variants.
2. Update its source using the raw main link above and set injection to **END**.
3. Reload Torn. Confirm the HJ ◉ button and **v0.9.3** in the dashboard.
4. Refresh once to start verification, then refresh again after a train.

If this iteration fails to launch, restore the independently installable **[v0.9.2 phone-confirmed rollback](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/archive/Torn-Happy-Jump-Helper-v0.9.2-known-good.user.js)**. Keep only one version enabled and **do not clear local storage**.

## Test status and next features

**24/24 targeted v0.9.3 tests passed** in a simulated TornPDA environment, including pre-API launcher injection, panel opening, gym gain units, refill safeguards, 22:00–08:00 schedules, cap-loss totals, real stat checkpointing and clearing verification without resetting the budget.

Live Android v0.9.3 operation and the full GitHub Actions suite are **not verified**. Once the button and rolling ledger are confirmed on the phone, future small iterations may enable **15-minute verification while the dashboard is open** and **more sophisticated verified-gym ranking**. The larger archived v0.9.0 experiment remains available for reference but is not the recommended script.

Older releases: [Historical release notes](docs/legacy-release-notes.md).

Read-only · No real API keys or player records committed · MIT · IamEEKY
