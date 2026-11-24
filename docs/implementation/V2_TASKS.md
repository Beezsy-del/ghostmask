# Product completion work

User requested finished product; no commits or pushes. Version 0.1 source and packaged extension preserved under release/.

| Task | Owner | Files | Acceptance |
|---|---|---|---|
| V2-CAPTURE | Codex capture agent | browser.ts, browser-unit tests | Visible bounded text/geometry, protected unsupported regions, stable capture, select insertion |
| V2-OCR | Antigravity | isolated ghostmask-ocr-work/ | Offline packaged worker/model; bounded, cancellable, no raw logs; parent integration tests |
| V2-CORE | Codex | detection.ts, sanitizer.ts, session.ts, gateway.ts | Actual selective opaque masks and sanitized text; user review; stale policy/capture rejected |
| V2-UI | Codex UI agent | panel.ts, panel.html/css | Manual masks, local privacy terms, readable redacted preview, export, safe policy editing |
| V2-QA | Codex + Antigravity review | tests and release docs | Real extension OCR, pixel checks, meaningful retained content, dynamic changes, exports and real model |

Supported first release: English top-frame HTML pages and forms, user-reviewed disclosures, local models and local exports. Unsupported visual regions remain excluded. No universal detector guarantee or unmeasured AUC claim. Existing frozen v0.1 cases remain historical; new v0.2 acceptance cases must test selective utility and leakage separately.

## Delivery status

Capture and UI tasks integrated and tested. Core selective disclosure and packaged OCR integrated. Antigravity OCR task produced a draft but timed out; parent adapted only reviewed parts and completed implementation. Final Antigravity read-only review also timed out (run 20261124-025359-780181ff, transport ERROR / exit 3), with no completed report. No independent v2 pass is claimed.
