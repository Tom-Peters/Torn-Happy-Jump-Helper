# v0.12.1 — Verified stat progress and source freshness

Author: IamEEKY  
Status: versioned preview candidate. Stable v0.10.22 and the permanent preview filename are unchanged until testing on a real TornPDA device.

## Delivered

- **Actual net stat change since previous refresh** across *all four* battle stats is recorded from read-only `/user/battlestats` snapshots, locally only. Today and Progress show the focused stat even when a manual train occurred outside the suggested schedule. Two successful readings are required; missing values do not become fake zero gains.
- A seven-day **partial observation window** compares the first and last snapshots within the window, reports the observed duration, and **does not add** those deltas to log-derived gym gains. A stat delta may include changes unrelated to gym training and is not labeled gym-only.
- User activity log ingestion pages through the v2 API's `_metadata.links.next` (at most four pages), guards URL origin/path, deduplicates repeated action IDs, and exposes whether activity coverage was partial or unavailable. Better detection of an off-schedule point refill when relevant events fall past the first 100 log entries.
- Full-refresh freshness is only marked successful if gym, gym catalogue, bars, battle stats, cooldowns and refill status were returned. Partial failures show a warning and cannot trigger an actionable decision.
- Floating HJ-badge polling uses a **separate** mini-refresh timestamp. The light refresh is atomic: if any required selection fails or is malformed, it does not overwrite already-known fields or pretend that a full manual refresh was performed.
- Daily refill displays `Used`, `Available`, or `Unknown`, rather than conflating the latter two.
- All gameplay remains read-only. No API key or player data is written to GitHub. Snapshots stay in local browser storage (`hhj-compact-v1:stat-samples`), capped to 240 observations and a 14-day retention window.

## Limitations and next steps

- Stat snapshots are net changes; when two checks straddle long gaps, attribution is impossible. Do not claim that snapshot deltas are individual gym trains or substitute them for verified training logs.
- Logs can be unavailable due to API permissions, or more than four pages may exist; the tool says so rather than treating partial data as complete.
- Snapshot history starts from the **first v0.12.1 refresh**; older observations were not retroactively fetched.
- Improve multi-stat cost/energy optimisation, enforce precise gym/active-perk eligibility, and add a stronger per-event 31-day owned-book planner after actual Android verification.

## Test gate

The v0.12.1 preview passes the same CI test suite as stable/previous preview, with added tests for off-plan +10k stat gains, no invented baseline gains, pagination/deduplication, malicious cursor rejection, incomplete mini refresh, critical full-refresh failure, and HJ launcher boot. Install just one HJ userscript at a time on TornPDA.
