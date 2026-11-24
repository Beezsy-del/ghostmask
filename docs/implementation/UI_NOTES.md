# Panel implementation

Owner: Codex panel sub-agent. No commits, pushes, uploads, or external UI assets.

## Skill applied

Read `/Users/shreeshaks/.codex/skills/frontend-design/SKILL.md` before implementation. Applied its plan-first visual process, clear action labels, real empty/error states, responsive layout, visible focus, and restrained visual hierarchy. The subject and task were already specified by the user and parent agent, so no extra design approval was requested.

Design plan: a local review workspace using cool paper (#f2f6fa), white (#ffffff), ink (#20334b), blue (#215fa5), muted slate (#52667c), and pale amber (#fff4df) for local original data. System fonts avoid network requests. The UI follows the actual workflow: boundary → capture → local approval → payload review → proposal → verified insertion. The model view has a blue top rule; original data sits behind a labelled amber disclosure. No decorative metrics or security scores.

Review against the brief: replaced a generic dashboard approach with one sequential privacy review surface. No gradient hero, status score, external fonts, or charts. Every action connects to Session; the model route is clearly marked simulator or local Ollama.

## Implemented

- Current-window tab selection showing only origin and tab ID.
- Fixed task purpose, route choice, and insertion-category permissions.
- Manual CSS exclusion input.
- Capture status and unsupported-content notes.
- Full-suppression sanitized image and normalized field structure.
- Original screenshot and original labels/values only inside a closed-by-default local disclosure.
- Per-field synthetic value entry; entry is cleared immediately on approval.
- Exact outbound request-body viewer and explicit payload review.
- Separate proposal and local execution controls.
- Pause, resume, abort and receipt clearing.
- Safe error explanations; no error objects, labels or values are logged.
- DOM construction uses textContent/value. No innerHTML or string-built HTML.
- Task cleanup on pagehide.

## Checks

EXECUTED: `npx tsc --noEmit` passed after implementation.
STATIC_INSPECTION: event handlers use Session; no direct model route; no storage or analytics; no raw interpolation; no external asset references.
NOT_RUN by this sub-agent: real Chrome extension UI/browser tests, screenshots, keyboard walkthrough, contrast measurement. Parent integration testing must verify these before release claims.

## Limits

Strict full screenshot suppression is presented honestly. This UI does not claim selective OCR redaction, secret detection completeness, an intelligent visual model, or universal browser protection. A successful simulator proposal is not a real model result. Existing task permissions do not change when setup fields are edited; Start new task binds the new setup.
