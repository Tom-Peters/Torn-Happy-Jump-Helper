# Torn Happy Jump Helper — v0.9.6

**Current Android test release: v0.9.6 · Author: IamEEKY**

**[Update the main HJ userscript](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/Torn-Happy-Jump-Helper.user.js)**

The phone-confirmed v0.9.5 launcher, full-screen interface, eight tabs, automatic refresh on opening and sleep-aware training remain unchanged.

## Why this release exists

A real Android Progress screenshot showed **four refresh-to-refresh intervals**, about **+1,222 recorded Strength**, yet **Latest measured change: +0 Strength**, even though Torn's own activity pane showed three ordinary Atlas Strength trains of about +611 each. The app had recorded two increases since its initial baseline, then a later refresh with no change: that zero should not displace the last actual gain. Separately, the tracker **cannot reconstruct training that took place before its first baseline** from the limited battlestats API response.

## Changes in v0.9.6

- **Latest recorded gain** is the most recent *nonzero* increase in the selected stat within the rolling seven-day ledger; a refresh with no increase no longer replaces it with +0.
- **Recorded today** displays gains seen in actual successful checkpoint intervals, alongside the last recorded gain and its timestamp.
- **Refresh outcomes** distinguish checks with any increase from checks without a new stat increase; checks are **not individual gym training sessions**. Two gym trains between refreshes may be one increasing interval.
- **Partial coverage** is explicit: gains before the first baseline and gaps without checkpoints can be absent from the daily chart, and Torn's activity history may have additional trains.
- The daily bar chart remains based on observed stat differences only; no missing training is fabricated.
- Prior v0.9.3–v0.9.5 local records remain usable. The last matching single-train comparison remains available where an eligible baseline exists.

## Why not silently import Torn's activity logs?

Torn API v2 supports **`/user/log`**, but its official schema requires a **full-access key**. This build only relies on the existing permitted endpoints; it doesn't ask users to expand API permissions or silently retrieve broader personal activity logs. Historical gym-log reconciliation could be offered later as a separate opt-in feature with precise log filtering and deduplication.

## Installation and testing

1. Keep **one** main Happy Jump Helper enabled; disable older duplicate/Advanced/Companion versions.
2. Update the existing code with the raw v0.9.6 source, injection **END**, and reload TornPDA.
3. Open **HJ ◉** and confirm v0.9.6. Opening still refreshes current Torn data immediately.
4. In **Progress**, look for **Recorded today**, **Latest recorded gain**, and a clear notice when the last refresh had no gain.

**32/32 focused regression tests passed**, including a simulated two-train, one-zero-refresh sequence, partial coverage reporting, previous version ledger compatibility, the normal launcher and refresh behaviour, accurate gym gains, 22:00–08:00 sleep scheduling, and the chart. Live Android behaviour of v0.9.6 and GitHub Actions remain unverified.

If the HJ launcher fails on this release, disable it and install the separate [**v0.9.5 phone-confirmed rollback**](https://raw.githubusercontent.com/Tom-Peters/Torn-Happy-Jump-Helper/main/archive/Torn-Happy-Jump-Helper-v0.9.5-known-good.user.js). Keep only one version enabled and **do not clear device storage**.

The helper remains **read-only**, and no actual API keys, personal player stats or financial data are committed to this public repository. The normal weekly budget remains Torn $50m unless changed in saved settings.

MIT · IamEEKY · [Historical development notes](docs/legacy-release-notes.md).
