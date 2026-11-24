# Agent task ownership and integration

| ID | Owner | Scope | Acceptance and evidence | Status |
|---|---|---|---|---|
| CX-001 | Codex | Source discovery and new-project baseline | Read roadmap, search local/GitHub/web, document references and licence uncertainty | Done |
| CX-002 | Codex | Architecture, contracts and scope | Trust boundaries, strict profile, test seams | Done for prototype |
| AG-001 | Antigravity/Gemini | Staging fixtures, manifest generator, eight Python tests | 12 distinct families, provenance, disjoint splits, reproducible hashes | Reviewed and integrated; eight tests independently rerun |
| CX-003 | Codex | Core session, gateway, tokens, sanitizer | Unit/integration and actual-request tests, image pixel inspection | Implemented; final evidence in release report |
| CX-004 | Codex capture sub-agent | Browser capture, insertion, exclusions | Eight browser-boundary tests and actual MV3 insertion fix | Reviewed and integrated |
| CX-005 | Codex UI sub-agent | Panel controls and design | Type checks; parent ran actual panel workflow | Reviewed and integrated |
| AG-003 | Antigravity/Gemini | Read-only core review | Completed report inspected; no dynamic tests claimed | PARTIAL review; valid stale-proposal issue reproduced and fixed |
| AG-004 | Antigravity/Gemini | Incremental read-only review | Final response and disposition recorded separately | See review disposition |
| CX-006 | Codex | Live model/browser integration, final evaluation and docs | Recorded actual request and insertion, honest scope and limitations | See release report |

## Review decisions

- Accepted AG-001 fixture work as staged agent-authored data, not 200 templates or independently human-reviewed annotations.
- Replaced its automatically chosen Apache licence with a private project marker. No public licence decision made.
- Accepted AG-003 stale-proposal finding; added a failing test, fixed post-model identity checking, then passed the test.
- Rejected AG-003's claim of missing token/sanitizer/browser tests: it guessed different filenames. Actual files are `token.test.ts`, `sanitize.test.ts`, `browser-unit.test.ts`. Browser tests were also being integrated during review. The report is retained verbatim as evidence, not treated as an authoritative current file inventory.
- Removed unused pixel helper; labelled and connected pattern detection to evaluation only. It does not authorize disclosure.
- Changed PNG conversion to bounded chunks.
- Parent found and fixed real Chrome viewport-key ordering, native-fetch binding, image CSP decoding, post-insertion exclusion retention, and listener lifecycle issues during integration.

Antigravity CLI transport success was never used as a verification verdict. No agent committed or pushed code.
