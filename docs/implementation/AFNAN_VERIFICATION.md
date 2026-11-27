# Afnan changes verification — 2026-11-27

Imported the supplied folder onto main commit 7477676. Kept the panel redesign, browser fallback and multi-field approval feature.

Real-extension testing exposed a batch failure: the first insertion changed the page identity, so the second insertion was rejected. Batch insertion now validates all targets before writing, sets values in one browser operation, and verifies values after page event handlers run. Invalid targets cause no writes. Page handlers can still change values; such changes fail verification rather than being reported as success. This is not a rollback guarantee.

The batch button now approves values only. The user must review the new payload, request a proposal, and confirm insertion using the existing controls. Disallowed fields are disabled; pause clears typed batch values. Batch parser validation rejects extra action properties, and proposal validation rejects repeated targets. Removed absolute privacy claims from the redesigned panel.

Executed on the final source:

- TypeScript type checking: passed.
- Unit and browser-boundary tests: 44 passed.
- Production build and test-extension build: passed.
- Playwright extension suite: 5 passed, 1 skipped by its existing release-freeze condition. Includes actual batch filling, review gating, pause/abort, single-field insertion, stale-page rejection, redaction, packaged OCR and export checks.
- Python fixture-manifest tests: 8 passed.
- Git whitespace check: passed.

The existing local demo server was reused; its root HTML was checked byte-for-byte against this checkout's fixture. No live Ollama or LM Studio inference or Brave-specific manual test was performed. The older frozen release evaluation was not enabled. These checks do not prove every website or browser works.

Antigravity read-only review run 20261127-114706-598fa0e1 timed out after ten minutes with an empty response. Its error output was inspected; no independent passing review is claimed.
