# v0.12.8 — Verified latest OD, empirically estimated drug risk, and zero-Happy-aware training

**Author:** IamEEKY. **Install channel:** independent versioned TornPDA preview. No existing stable, permanent preview or older versioned URL is replaced.

## Latest overdose (real Torn API data)

1. On full refresh and at most every five minutes during passive mini refresh, make a **read-only** request to `GET /v2/user/log?log=2291&limit=100`. Torn log **2291** is the overdose log type. A key that allows user logs must also permit that log type, otherwise no claim of a verified latest OD is made.
2. Validate the response is a log array, filter log entries by `details.id === 2291` with valid, past timestamps, and pick the **latest by timestamp** (never by the order supplied). Store the timestamp, Torn log ID and whether the drug can be identified. A log that does not identify Xanax/Ecstasy is shown explicitly as **unknown drug**, never guessed from an empty Happiness bar. If a contemporaneous read-only drug-use log identifies the drug, it may be correlated within a narrowly bounded time window.
3. Store the most recent timestamp and provenance locally, making it available across page loads. For newly found OD events in a limited recovery window (Xanax 96h, Ecstasy 8h, unknown 24h), automatically activate the existing two-step manual recovery hold. Users must explicitly clear the hold after verifying hospital status in Torn, but acknowledgement prevents the **same** logged OD reactivating it. A later OD activates a new hold. These are conservative display windows, **not hospital discharge predictions**.
4. On a read failure (including a custom key missing log type 2291), state that OD history could not be verified. Manual report remains available. Do not invent an event or a date.
5. The hold suspends Today, Compare and Schedule recommendations until acknowledged, while showing a Happiness-recovery comparison as informational only.

## Drug OD risk estimates — distinguish source from fact

Torn's [official Drug Wiki](https://wiki.torn.com/wiki/Drugs) confirms drug-specific OD risk, random outcomes and modifiers; it **does not** publish a guaranteed Xanax or Ecstasy base probability. It specifically notes addiction, frequency and time since last overdose have no influence on OD chance.

This release makes the existing model usable without making up an 'official' number:

- By default, the new **community estimate** option uses **2.5% Xanax per dose** as a conservative representative value within community analysis of ~2–3%, and **5% Ecstasy per dose** from a player-researched comparison. They are not official Torn probabilities, not personalised predictions, and not guarantees. Sources: [Torn forum sample analysis](https://www.torn.com/forums.php?a=0rh%3D97&b=0&f=2&p=threads&t=16448065) and [Torn Drug Wiki](https://wiki.torn.com/wiki/Drugs).
- Optional manually set *effective* odds override estimates. A user can disable community fallback entirely, returning the predictor to **unknown** without invented risk data.
- Optional faction Overdosing mitigation (0–30%) and the 7-star Nightclub 50% reduction are applied only to community estimates. Inputs default to no mitigation, so the model does not falsely infer protections from ambiguous perk labels. Verify actual perks in Torn before entering reductions. Sources: [Torn Faction Wiki](https://wiki.torn.com/wiki/Faction), [Torn Drug Wiki](https://wiki.torn.com/wiki/Drugs).
- The four Xanax + final Ecstasy stages are modelled as independent hypothetical Bernoulli events, as in v0.12.6/7; the source and assumptions are shown clearly. **Elapsed time since OD never changes a probability**.

## Zero-Happy gym planner

A critical bug previously substituted maximum Happy when Torn correctly returned `current: 0`. This release uses `current ?? maximum` instead and models the actual zero Happy in gym gains.

Torn's [Happy Wiki](https://wiki.torn.com/wiki/Happy) documents passive regeneration of **5 Happy per 15 minutes**. Under 25% current base maximum, the regular-training simulation now compares **training as soon as energy is available** with waiting until 5%, 10%, 25% or 50% of base Happy is reached. It selects the **highest estimated 7-day stat gain** while accounting for delayed training, sleep, natural regeneration and energy cap overflow. The Today recovery card displays current live Happy, approximate time to 25%, a gain comparison, and the selected threshold. This is a strategic comparison, not an auto-training action. Candy item alternatives are informational and explicitly excluded from the stat forecast.

The existing regular-training optimiser and Happy Jump equal-time counterfactual now use this low-Happy-aware regular strategy. Previously accumulated overdose losses are not retroactively added to gym stats. Only future training uses current Happy data.

## Important limits

- Without a working TornPDA API key authorised for user log 2291, latest OD can only be manually recorded. The helper does not have access to the user's account outside its installed TornPDA context.
- The OD age-based **hold** is a conservative safety guard and is not a hospital status reading. A 5,000-minute Xanax reference countdown is only approximate, not a live hospital timer.
- The baseline Xanax/Ecstasy probabilities are from community discussion rather than official Torn game data; the individual user's real odds could differ. No one can predict the specific dose that will overdose. This tool remains read-only and never uses drugs, consumes items or makes gameplay actions.
- Happiness can change because of property perks, boosters, rehabbing and training. Passive 5/15 estimates should be rechecked against Torn. The simulator compares the currently modeled plans without guaranteeing optimal long-term strategies.
- No private API keys, user logs, account details or real inventory are committed to the public repo.

## Regression

`test/last-od-happy-recovery-0128.test.js` covers strict 2291 parsing, latest-record selection, auto hold/acknowledgement, permission-denied state, community and manual OD odds, faction/nightclub reductions, a real zero-Happy bar and recovery simulations. GitHub Actions runs syntax checks for the new preview and all prior versioned suites.
