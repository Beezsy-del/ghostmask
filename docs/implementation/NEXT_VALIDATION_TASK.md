# Next validation stage
Scope: synthetic-only regression tests at the public interfaces already specified by the user's master prompt: browser capture, sanitized export, actual outbound gateway requests, permission-controlled insertion, OCR failure and task recovery. These boundaries were explicitly authorized; no new approval is required by the testing skill.
Do not alter the old frozen fixtures or call new development tests held-out. Do not commit/push this work. Preserve PDF and prior release artifacts.

Findings reproduced before fixes:
- Explicit protected phrase split across adjacent DOM text nodes was not masked (planDisclosure regression failed: 0 versus 3 masked blocks).
- Sensitive label and value in separate nodes escaped contextual detection (raw value remained).
- Parallel Codex reviewer reproduced text behind an opaque overlay entering sanitized text; scoped browser fix assigned.

New browser cases inspect seed rectangles derived from fixture elements independently of detector masks, plus actual outbound request bodies. The model endpoint is intercepted with a deterministic structured response; these are gateway/privacy tests, not model-quality results. OCR asset failure is tested at the browser resource boundary.
