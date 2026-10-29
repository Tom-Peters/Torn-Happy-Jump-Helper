# v0.12.0 Training Decision Engine (preview candidate)

**Author:** IamEEKY  
**Channel:** Versioned preview only; stable v0.10.22 and permanent preview URL remain unchanged pending real-device validation.

## What is implemented

- The Today screen now leads with a single "Best next action" card and a collapsible explanation of the source/limitations. The previous competing "Biggest training improvement" card is removed.
- Decision order: verified *freshness* gate → uncompleted scheduled actions due within 30 minutes (Xanax, training, refill, Happy Jump) → verified owned, usable, stat-capped book → imminent upcoming schedule → available education with prerequisites met → future schedule → no-action fallback.
- Read-only: gameplay remains manual. UI labels forecasts as estimates; logs are used to exclude completed actions. Opening the HJ button still performs a full refresh. Floating button timing/badge and advanced tabs are preserved from v0.11.4.
- Book use suggestions now additionally require a returned active-book-perks list confirming no active book, along with inventory ownership, verified usability and the **focused stat** meeting 200m for the supported stat-capped books. Missing fields prevent a use-now prompt.
- All four enhancer quotes expire after 15 minutes. A stale or missing quote is reported as unavailable, not as a live current price.
- Fresh state older than 15 minutes is not used to issue actionable recommendations.
- Default UK sleep schedule for new installations starts at **23:00**, ending 08:00; existing saved settings are not overwritten.
- New mocked, read-only regression tests cover launcher boot, decision priority, book ownership/thresholds, unavailable source data, stale market/state and education. CI checks the new preview syntax and runs the full test suite.

## Deliberate limits

This does **not** auto-consume items, buy goods, train, make non-API background requests or promise exact gym gains. It does not yet fully implement a multi-objective optimisation engine, all books' future 31-day opportunity costs, gym-unlock availability beyond verified access, or an independently validated simulation formula. The original preview (v0.11.4) remains available as an immediate rollback.

## How to validate on TornPDA

1. On the preview branch, review tests and confirm GitHub Actions passing. Do not disable the known-working stable script until ready to verify the preview.
2. Install the v0.12.0 candidate as a **single** test userscript; avoid simultaneous competing HJ launchers.
3. Check the floating HJ button appears; tap it and verify the live refresh, "Best next action", tabs and log-derived gains.
4. Observe whether near-term Xanax / refill / train badges take priority and whether an unavailable API selection results in a safe unknown or refresh prompt.
5. If mobile validation succeeds, promote the candidate to the **existing permanent preview filename**, preserving its `@namespace` and `@updateURL`. Keep stable pinned until separately approved.

## Next implementation phases

1. API-v2 typed adapter and batched cache with error-specific backoff, full field provenance and reconciliation after off-plan training.
2. Versioned train-by-train simulator with observed-vs-forecast validation and confidence intervals.
3. True cost-/time-/gain-optimised method comparisons, owned-item and cash-constrained optimisation, and personal happy-jump crossover points.
4. Longer-term 31-day owned-book timing with independently verified descriptions and next-31-day realistic training opportunity; exact faction/company and gym unlock mapping.

No API keys or personal Torn records are included in the repository.
