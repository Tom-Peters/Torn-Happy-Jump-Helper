# v0.12.9: overdose risk provenance and actual Happiness

Author: IamEEKY. Versioned preview only; stable and permanent preview untouched.

This release builds on v0.12.8's Torn log 2291 overdose detection, persistent last-OD timestamp, deduplication, recovery hold, and low-Happiness training comparison. It does not know the user's private OD without a permitted Torn API response.

**Probability accuracy:** Torn's official Wiki documents that Xanax and Ecstasy have different overdose chances, but does not publish reliable exact personal per-dose percentages. The default Xanax **community estimate** is 1 in 33 (about 3.03%) per dose, **not official**. Ecstasy is **unknown** unless a user explicitly enters a hypothetical rate. Missing rates do not silently become zero.

**Verified modifiers:** The optional read-only /faction/upgrades endpoint is used to detect Overdosing in the Toleration branch (3% reduction per level, capped at 30%), and /user/job to detect a 7-star Nightclub (50%). Only when returned do these reduce the community Xanax estimate. Missing permissions, missing job or upgrade information remain **unknown** rather than asserting no protection. Manual per-drug effective rates override the model without double-reduction. Old manual faction/nightclub settings are retained for compatibility but clearly labelled as legacy and ignored by the automatic model.

**Actual recovery:** The zero-Happiness handling fixed in v0.12.8 remains intact. Today shows a post-OD Happiness-aware forecast comparing immediate normal training and waiting to recover Happiness. Old drug/jump schedules remain suspended during an active OD hold. Last overdose remains recorded after clearing the hold. The hospital state is not inferred from zero bars.

No automatic Torn actions; no API keys or personal data stored in the repo.

References: https://wiki.torn.com/wiki/Drugs ; https://greasyfork.org/en/scripts/596758-torn-od-tracker/code (community estimate, not authoritative).

Tests: `test/verified-od-rates-0129.test.js` and all existing regressions.