# Optional Torn gym-log reconciliation — design, not enabled

**Status:** planned. Not part of v0.9.7. The normal Happy Jump Helper remains read-only and only uses its existing TornPDA key permissions.

## Goal

Allow users who explicitly opt in to reconcile earlier gym training gains shown in Torn's activity history against local refresh-to-refresh stat changes, without treating one refresh interval as one train or double-counting a gym log and its corresponding stat delta.

## API requirements

Torn's API v2 includes `GET /user/log`. Its access is restricted, but Torn supports **custom keys scoped to specific log categories/types**, so an unrestricted full-access key should not be the default. The exact gym-training log category/type identifiers and response schema must be validated against Torn's current API before implementation; none are assumed here.

References:
- https://www.torn.com/swagger.php
- https://www.torn.com/api.html
- https://wiki.torn.com/wiki/API

## Proposed behaviour

1. Add an explicit **Enable gym-log reconciliation** control under Settings, **off by default**. Explain permission requirements and show which key/source TornPDA is using without displaying the key value.
2. Read only the gym-training log category/type with a category-scoped custom key if supported; refuse gracefully when permission is not granted. Do not silently request other activity categories or an unrestricted log feed.
3. Backfill at most **seven days** initially. Page with official metadata links when required, impose request limits, and stop on API errors. Never load the entire lifetime log.
4. Save deduplicated locally, keyed by stable Torn log ID, timestamp, stat, energy spent and awarded gain. Never commit actual account records to GitHub, send to outside servers or include values in analytics.
5. Make **log-observed gains** authoritative for matching days. Keep existing checkpoint changes available as an audit/fallback, and never add a gym-log gain to an overlapping snapshot delta. Mark days **reconciled** only when the log source and coverage are known.
6. Display source and confidence explicitly: **Gym log verified**, **Refresh snapshots (partial)**, or **No usable observation**. Be explicit that logs may still be incomplete if access is limited, pagination is truncated or there are deleted/unavailable records.
7. Allow independent clearing of imported logs, keep existing budget and forecasts untouched, and add tests for pagination, duplicate IDs, legacy snapshots, timezone boundaries, permission errors and incomplete log coverage.

## Release boundary

The v0.9.7 chart's **Show partial days** toggle covers only **snapshot-based coverage** and does **not** mean every game action was verified. Log reconciliation should be developed separately after this chart update has been confirmed working on Android. Individual per-session history screens are intentionally deferred.
