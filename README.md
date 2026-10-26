# Torn Happy Jump Helper

**By IamEEKY** · Read-only TornPDA userscript · Experimental / estimates

An on-demand, live-API planning panel for Torn training. It **never performs Torn gameplay actions**: no item use, gym training, purchases, refills, background scraping, simulated taps, or automatic gameplay requests.

## Install

1. In TornPDA, open its **Userscripts** manager and add a new script from the `Torn-Happy-Jump-Helper.user.js` file (or its raw GitHub URL).
2. Enable it for `https://www.torn.com/*` and open a normal Torn page **in TornPDA's browser**.
3. In TornPDA, use the script's injection time **END**, open a Torn page and tap the small **HJ** floating launcher, then **Refresh Torn data** (manual request).
4. Configure your target stat, weekly budget, booster limit, perks and actual available training time. The dashboard compares different jump families with normal and Xanax training.
5. Use the numbered checklist yourself. **Nothing in Torn is executed by this script.**

### API key and privacy disclosure

The script uses the key supplied by TornPDA using its native `###PDA-APIKEY###` substitution. **Do not paste a key into the repository or the script source.** The key is placed **only in an `Authorization: ApiKey ...` header** of read-only HTTPS GET requests made directly to `https://api.torn.com/v2`, via TornPDA's native HTTP handler. The key is **not saved**, logged or shared with the script author, and no external analytics service is used. No account data is uploaded to GitHub. The script keeps fetched game data only in memory for the current browser session. Only non-sensitive planning preferences (not key, stats or inventory) may be stored locally in browser storage.

**API selections:** `user/bars`, `user/cooldowns`, `user/battlestats`, `user/refills`, `user/gym`, `torn/gyms`, `user/inventory`, `market/{itemId}/itemmarket`, `market/pointsmarket`. Battle stats need a *Limited* key; lower-access keys produce partial results with warnings. Market and gym metadata require public access. Requests are **user-initiated only**. The on-screen countdown uses locally cached timestamps, not background API calls.

**Pricing:** Item prices use market listing prices from Torn's globally cached API, not guaranteed executable quotes or a scraped live order book. Market listings can be exhausted, and their age is shown. Missing or stale prices are **never invented**; economic rankings are withheld if required quotes are missing.

**Estimates:** The earliest jump window is approximate, based on average Xanax cooldown and current snapshot. Gym gain model uses the formula documented on the official Torn Wiki; the model is approximate and should be calibrated to your observed gains. Long-run scenarios use average drug cooldown, conservative 24h booster throughput, configurable available jump opportunities, and an approximation for energy lost while stacked. They are **not exact calendars** and omit overdoses, rehab travel, addiction penalties, events not configured, competing gameplay, market liquidity/slippage and inventory consumption unless otherwise stated.

## What it calculates

- Live energy, current and base happiness, drug/booster cooldowns, current gym and four battle stats
- Item holdings, item market listing costs (Xanax, Ecstasy, lollipop, chocolate, eDVD), point market quote
- Configurable jump strategies (micro candy, large candy, 1–4 eDVD, 0–4 Xanax)
- Estimated training gains at base happy vs boosted happy, using current gym, target stat and manual modifiers
- Estimated weekly sustainable frequency, wasted natural regeneration, weekly costs, incremental stat gain, cost per additional stat
- Separate value-ranked and speed-ranked recommendations, including daily points refills and regular Xanax training
- Manually tickable jump checklist (only checks local UI state), approximate next jump window, quarter-hour happy reset countdown, missing-resource warnings and improvement ideas

## Safety & engineering

- GET requests only, no write endpoints, non-API Torn requests or background polling
- API key only in HTTP authorization header, never query strings, DOM, console or storage
- DOM panel isolated with ID prefix; rendering escapes API-controlled text
- One request burst per manual refresh; throttled refresh to respect API cache and rate limits
- Uncertain results are labeled as simulations, not actual Torn outcomes
- No personal identifying information or API keys in the repository

## Sources (verify on release)

- [Torn's official API v2 OpenAPI contract](https://www.torn.com/swagger/openapi.json)
- [Torn's scripting policy](https://www.torn.com/forums.php?f=67&t=16037108)
- [TornPDA userscript support](https://github.com/Manuito83/torn-pda/tree/master/userscripts)
- [Official gym training formula](https://wiki.torn.com/wiki/Gym)
- [Happy/reset rules](https://wiki.torn.com/wiki/Happy)
- [Item cooldowns](https://wiki.torn.com/wiki/Item_Cooldown)

## Roadmap

See [ROADMAP.md](ROADMAP.md). Contributions should be anonymous in demo data and must never contain real player info, API keys, or secrets.

Licence: MIT.
