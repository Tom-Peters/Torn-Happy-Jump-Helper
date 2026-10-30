# v0.12.6 — Drug-specific overdose-aware Happy Jump training

**Author:** IamEEKY. **Installation:** independent versioned preview. Existing stable, permanent preview, and v0.12.5 URLs are unchanged.

## Why

v0.12.5 accepted one hypothetical overall chance that a complete Happy Jump succeeds. That omitted the crucial fact that a jump can fail at **any of four Xanax doses** or **the Ecstasy dose**, causing different quantities of spent items, accumulated energy/happiness, and previously achieved gym gains.

## Added

- Optional **Xanax overdose chance per dose** and **Ecstasy overdose chance per dose** fields in Settings. Both blank by default. These are user-provided scenario assumptions, **not discovered Torn API OD rates**, estimates of a personal user's actual odds, or faction adjustments. Enter *effective* rates yourself if considering faction/company protections; no unverified auto-discounting.
- Enumerate the first-OD branch for each dose in the existing real-time simulated sequence. Under the explicitly hypothetical independent-dose assumption, probability of first OD on dose `i` is `survival_so_far × p_i`, with `survival_so_far *= (1-p_i)`. Full completion chance is the survival product.
- An OD branch keeps **only** completed training gains prior to that failed dose and retains item purchase costs incurred through the attempted dose. Subsequent drugs and training are not automatically assumed to happen following an OD.
- Expose the probability-weighted **predicted gains and purchase cash** of a jump, and compare against a same-period, overdose-aware **regular-training** alternative (including Xanax OD risk if that regular plan uses Xanax). When the per-dose assumptions are entered for both drugs, the regular alternative is chosen by risk-adjusted gains, not optimistic nominal gains.
- Record simulated **pre-overdose Energy/Happy** at each Xanax and Ecstasy attempt. Summarize the amounts that would be emptied on overdose as probability-weighted losses; this is not an additional penalty added to projected gym gains.
- Show drug-specific outcome probabilities and Xanax's approximate **5,000-minute hospital** effect, plus extended drug cooldown and addiction cautions. Ecstasy OD empties Energy and Happiness; no Xanax-style hospital penalty is assigned to Ecstasy.
- With the drug-specific assumptions available, block a favourable verdict if risk-adjusted gains fall below the product's cautious **5% expected gain advantage** over the same-window regular alternative.
- Preserve the generic full-jump likelihood setting as a backwards-compatible optional fallback when both per-dose fields are not supplied. Per-dose settings are not inferred from it.
- Existing hypothetical stress tests, consumption replacement costs, API freshness checks, no-action automatic policy and gym/perk recommendations remain in place.

## Important limits and guardrails

- The Torn Wiki does **not** provide a guaranteed personal Xanax or Ecstasy overdose chance through the current selections. Do **not** imply the values are live or official. Faction Toleration and some company perks can change OD odds; these modifiers are not automatically fetched. Two entered percentages are *what-if inputs only*.
- The OD model stops gym training after the **first** OD and assumes no recovery training in the comparison window. Actual OD timing, medical treatment and time to resume training may change gains. It is conservative rather than a calibrated expected-value model.
- Xanax OD: according to the Torn Drug Wiki, 100% of Energy, Nerve and Happiness are lost, hospital roughly **5,000 minutes**, drug cooldown and addiction increase. Ecstasy OD: 100% Energy and Happiness lost; no corresponding hospital effect stated. Do not assume medical treatment, opium or rehab use.
- The base simulator uses forecast market prices, the player's reported inventory and *successful* medication use; individual OD branches are evaluated **after** constructing the schedule. This does not predict all timing effects of random outcomes.
- Both direct purchase price and proxy consumed-item replacement price are still displayed, and are **not** the same thing.
- Even when the odds inputs suggest a gain advantage, use the assistant as an aid, **not** a claim that taking drugs will be safe or profitable.
- The product's 5% decision threshold is not a Torn mechanic.

## Torn documentation

- [Official Torn Drug Wiki](https://wiki.torn.com/wiki/Drugs): Xanax and Ecstasy OD effects, drug cooldown, factions.
- [Official Torn Ecstasy Wiki](https://wiki.torn.com/wiki/Ecstasy): Ecstasy effect and OD loss of Energy/Happy.
- [Official Torn Energy Wiki](https://wiki.torn.com/wiki/Energy): Energy and gym training interaction.
- [Official Torn API Swagger](https://www.torn.com/swagger.php): bars and cooldowns read-only selections.

## QA

The `test/overdose-model-0126.test.js` suite checks that the first OD branch ends subsequent scheduled gains, models all 5 drugs, differentiates Xanax hospital loss from Ecstasy, retains the cost of consumed boosters, distinguishes unknown from zero OD percentages, and updates results when assumptions change. Verify the launcher, live cooldowns, settings persistence and recommendation text in TornPDA before promoting the versioned preview.