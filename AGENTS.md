# AGENTS.md — Training-TornStaxx

Read the current standalone hub architecture and event contract before changing the training module:
https://raw.githubusercontent.com/Tom-Peters/TornStaxx/main/AGENTS.md
https://raw.githubusercontent.com/Tom-Peters/TornStaxx/main/docs/INTEGRATION.md

- **Shared hub** is owned by the standalone `TornStaxx/TornStaxx.user.js`; never embed its full UI in any Training installer.
- **Current preview installer:** `Torn-Happy-Jump-Helper-preview.user.js` with immutable version-matching snapshot, public display name **Training-TornStaxx** and stable integration ID `happy`. Do not rename the GitHub repository/installer paths until user explicitly performs the repository rename.
- **Pinned stable rollback:** `Torn-Happy-Jump-Helper.user.js`. Never silently promote or overwrite this installer.
- Keep existing gym and gain calculations, proven event logs, drug/refill schedules, overdose and recovery, observed off-plan training, perks/education, books, inventory and local preferences.
- No fabricated gains, unobserved purchase evidence, gameplay auto-clicks, automatic drug consumption or remote writes. Remain foreground-only and honor API permissions/backoff.
- Support registration, actions, summaries, notices, deep-link sections, diagnostics and panel state; the small fallback exists only when standalone TornStaxx is absent.
- Public author **IamEEKY** only; never publish real credentials, player data or imported records.
- Test with `npm test`, `node --check Torn-Happy-Jump-Helper-preview.user.js`, versioned snapshot parity and on-device Torn PDA validation.
