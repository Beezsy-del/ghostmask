# GhostMask 0.2 — local review release

This release adds useful selective redaction to the strict prototype. It is a working developer-loaded Chrome extension for English HTML pages and synthetic workflows. It is not a completed universal privacy product or a Chrome Store release.

## Implemented

- Local screenshot capture bound to the selected tab, document, viewport and content identity.
- Selective opaque pixel masks, actual exported-image pixel checks, separately sanitized text.
- Packaged offline English Tesseract OCR, pattern/context detection, and Compromise person-name detection. No OCR CDN or cloud upload.
- Manual drawn rectangles, keyboard rectangle entry, private phrases, CSS exclusions, review-before-export.
- Separate permission to share reviewed content and permission to insert a local value.
- Single-use task/origin/document/field-bound tokens; text, textarea and enabled single-select insertion; local readback and recapture.
- Local Ollama form actions and page summaries, clearly labelled simulator, LM Studio adapter (live LM Studio not verified).
- Exact serialized model request viewer; sanitized PNG/text/receipt downloads; pause, abort and clearing receipts.
- Hidden/excluded control values protected if repeated in visible content; split-node secret checks; dynamic invalidation.

## Boundary

Selective detection is imperfect. The user must inspect image AND text before approving. The local model routes receive sanitized text and metadata; they do not receive screenshots. The image export is a separate reviewed artifact. Strict mode suppresses all original text and pixels. Neither mode intercepts unrelated software or all browser traffic.

Frames, canvas, embedded documents and image regions remain conservatively masked; OCR does not enable interaction with them. Non-English detection, arbitrary names, unusual encodings, every visual layout and adversarial webpages are not certified. A local destination website sees values inserted into its controls. No submit/payment actions are implemented.

## Evidence and release limits

See output/playwright/results.json for the latest executed browser results and the final delivery note for counts. The old 3-case frozen suite is a regression set now; it is not independent proof of selective-mode privacy. The new selective test is a development test, not a new held-out benchmark. No ROC-AUC, universal zero-leak claim, broad latency claim or production certification is made.

The staged 12-family dataset remains. A 200-family dataset, broad browser/device testing, detector calibration, a professional security audit and public-store distribution remain outstanding. The full six-week roadmap is not complete.

## Agent work

Codex integrated the gateway, session policy, detection, image sanitization, OCR lifecycle, tests and packaging. Native Codex capture and UI agents delivered scoped changes, reviewed by the parent. Antigravity's OCR implementation task timed out without a completed report. Its PNG-header validation draft was reviewed and adapted; its worker lifecycle was replaced. A separate final read-only Antigravity review was requested; only a completed inspected report counts as review evidence.

## Data retention

Raw observations and tokens stay in the panel runtime, never ordinary persistent storage. Closing the panel requires a fresh task. Exports are user-created local files and must be deleted by the user. Local model-server retention is outside this extension's boundary. Abort clears the task, but cannot erase previously saved files or undo completed insertions.

## Measured validation, 24 November 2026

- TypeScript type check and extension build passed.
- 40 code tests passed; 8 Python fixture checks passed; manifest bit-for-bit check passed.
- Five Chromium end-to-end tests passed with real Ollama enabled: historical strict seed/pixel suite; strict panel insertion; selective panel phrase masking/download; actual local-model insertion with stale/failure blocking; selective offline OCR, actual mask pixels, reviewed exports and real-model summary.
- Development selective case contains seeded visible and hidden/repeated email values and useful refund text. Assertions inspect every planned mask's pixels, preserve other pixels, check sanitized text, and inspect model-bound request bodies. Network assertions allow only loopback HTTP and extension resources. This is a narrow development case, not a statistical leakage estimate.
- Last full browser run before packaging took about 14 seconds. This is suite runtime, not per-page performance or a broad benchmark.
- A prior real-model run produced an invalid reply and was blocked. Ollama now receives a JSON schema (fixed output structure). Subsequent integration passed. This does not guarantee model reliability; malformed or unauthorized proposals still block.
- No professional penetration test, Chrome Store review, live LM Studio test, broad accessibility audit or broad page/device benchmark was completed.
- Both real Antigravity v2 jobs timed out with transport errors. No completed final review report was received. Existing v0.1 reviews do not certify v0.2.

## Scope checklist

| Area | Status |
|---|---|
| Capture, identity, text/image sanitization, fail-closed gateway | Implemented and tested within declared scope |
| User-reviewed selective context, masks, protected phrases, exports | Implemented; development coverage only |
| Ephemeral scoped tokens, permission checks, verified insertion | Implemented; text/textarea/single-select only |
| Local model summaries and fill proposals | Real Ollama tested; LM Studio protocol unit tested only |
| English offline OCR | Implemented and browser tested; uncertain detections masked; not perfect |
| Frame/canvas/image interaction | Unsupported; excluded visually |
| Crash/reset behavior | Conservative runtime loss; fresh task required; not an exhaustive crash matrix |
| Dataset and detector evaluation ladder | Partial: 12-family staged corpus plus new development tests, not 200; no trained/calibrated classifier or AUC claim |
| UI | Connected controls, keyboard mask entry, basic responsive checks; not full accessibility certification |
| Release | Reproducible local ZIP; no GitHub, store submission or deployment |
| Independent security review | Blocked by Antigravity timeouts; still required |

## Files and architecture

New modules: detection.ts (local text rules/lexicon), disclosure.ts (one text/image exclusion plan), prepare.ts (OCR plus plan), ocr.ts (offline bounded worker), assets.mjs (pinned local resources), package.py (deterministic local release).

Updated modules: browser.ts (visible text geometry, hidden-value protection, select insertion), sanitizer.ts (opaque pixel masking and verification), session.ts (review/export lifecycle and separate insertion approvals), gateway.ts (structured local providers), panel.ts and panel HTML/CSS (connected product controls), manifest.json (local OCR CSP and loopback model permissions).

Page → stable local observation → DOM/English/OCR detection → opaque image + sanitized text → user review → gateway → local model proposal → policy/token checks → local insertion → readback → new sanitized capture. Exports also require current identity and review. Raw local preview is separate.

## Install and demo

Unzip release/ghostmask-0.2.0.zip into a permanent local directory. In Chrome extensions, enable Developer mode and Load unpacked that directory. Alternatively load dist directly. Run npm run demo from the source directory and open http://127.0.0.1:4173. Click the toolbar action on this tab to grant temporary access. Follow README.md for masking/export and approved insertion demos. Local model setup is optional; the simulator is explicitly labelled and makes no model call.

No files were committed or pushed. The medication project and model backup were not changed.
