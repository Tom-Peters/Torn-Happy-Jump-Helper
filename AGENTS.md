# AGENTS.md — Training-TornStaxx

Read the current standalone hub architecture and event contract before changing the training module:
https://raw.githubusercontent.com/Tom-Peters/TornStaxx/main/AGENTS.md
https://raw.githubusercontent.com/Tom-Peters/TornStaxx/main/docs/INTEGRATION.md

- **Shared hub** is owned by the standalone `TornStaxx/TornStaxx.user.js`; never embed its full UI in any Training installer.
- **Canonical production installer:** `Torn-Happy-Jump-Helper.user.js` with an immutable version-matching production snapshot. All future Training releases go to the main installer; stable module ID `happy` and public name **Training-TornStaxx** remain unchanged.
- **Archived channels:** the previous stable version is preserved at `Torn-Happy-Jump-Helper-v0.10.22-stable-rollback.user.js`; the old preview URL is frozen at 0.39.4 and is not a future release target. Do not enable both installers.
- Keep existing gym and gain calculations, proven event logs, drug/refill schedules, overdose and recovery, observed off-plan training, perks/education, books, inventory and local preferences.
- No fabricated gains, unobserved purchase evidence, gameplay auto-clicks, automatic drug consumption or remote writes. Remain foreground-only and honor API permissions/backoff.
- Support registration, actions, summaries, notices, deep-link sections, diagnostics and panel state; the small fallback exists only when standalone TornStaxx is absent.
- Public author **IamEEKY** only; never publish real credentials, player data or imported records.
- Test with `npm test`, `node --check Torn-Happy-Jump-Helper.user.js`, versioned snapshot parity and on-device Torn PDA validation.
