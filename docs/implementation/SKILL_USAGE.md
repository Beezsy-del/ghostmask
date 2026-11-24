# Skills used

Discovery covered the available catalogue, local Codex and agents skill roots, repository instructions, Gemini skills and tool metadata. There was no dedicated local browser-extension/privacy/OCR security skill found that fit this project. General SaaS automation skills with matching keywords were not treated as privacy expertise. No cloud skill-discovery tool was exposed in the tool inventory examined.

| Skill/source | Agent and task | Applied guidance | Validation / deviation |
|---|---|---|---|
| `~/.codex/skills/antigravity-delegate/SKILL.md` | Codex orchestration | Real agy bridge, scoped staging writes, read-only independent review, inspect completed report | Eight fixture checks rerun; stale-proposal finding reproduced; inaccurate test-inventory claim rejected |
| `mattpocock-skills/1.3.2/skills/engineering/codebase-design/SKILL.md` | Codex architecture | Deep bounded modules and explicit BrowserPort boundary | Integrated Session seam tests |
| `mattpocock-skills/1.3.2/skills/engineering/tdd/SKILL.md` plus tests/mocking references | Codex core/capture | Red-green slices; mock external boundaries, test observable behavior | Missing token/sanitizer/gateway modules failed first; stale-proposal regression failed before fix. User already explicitly specified test seams; no repeated permission question |
| `~/.codex/skills/playwright/SKILL.md` | Codex capture/integration | Verify npx, use real browser, inspect output | User explicitly asked test files, so Playwright test runner used instead of CLI-only workflow; isolated Chromium profiles |
| `~/.codex/skills/frontend-design/SKILL.md` | Codex UI | Deliberate cool-blue local-review workspace; clear hierarchy, keyboard focus, no remote fonts | Panel workflow test, narrow viewport check and screenshot inspection |
| `mattpocock-skills/1.3.2/skills/engineering/diagnosing-bugs/SKILL.md` | Codex integration | Reproducible failing browser loop; ranked hypotheses; targeted temporary diagnostics | Fixed CSP image decode, native fetch binding, viewport order; debug instrumentation removed |
| Primary-runtime PDF skill | Codex roadmap audit | Read all roadmap pages and preserve extracted spec | `spec/ROADMAP.txt` |
| `~/.gemini/config/skills/webapp-testing/SKILL.md` | Codex discovery/application | Real browser inspection and local server workflow | Used relevant principles; project explicitly requested TS/browser tests |
| Gemini `codex-verification`, report-contract, `tdd`, `code-review` | Antigravity AG-001 | Scoped fixture ownership, red-green generator checks, report evidence categories | Completed fixture report inspected; tests independently rerun |
| Gemini `codex-verification` and report-contract | Antigravity AG-003/004 | Read-only static review, explicit NOT_RUN tests | Completed reports retained; parent owns executed tests |

Official Chrome and Playwright documentation was queried through Context7 for captureVisibleTab, isolated script/document targeting, capture rate limits and persistent-context extension tests. Ollama's official chat API docs informed the local route. Skills and source claims do not replace runtime verification.

## Version 0.2

- Codex read `antigravity-delegate` and used the real bridge for an isolated OCR implementation task and a read-only final review. Both timed out; neither is a passing review. Reviewed the OCR draft before adapting its PNG validator. Replaced worker lifecycle and remote-path controls; tested packaged OCR in Chromium.
- Codex applied `codebase-design` to separate text detection, disclosure planning, image rendering, OCR, session policy and gateway transport.
- Capture/UI agents independently applied relevant testing/design instructions; see V2_CAPTURE.md and V2_UI.md. Parent reviewed and ran integration tests.
- Context7 documentation checked for Tesseract.js worker/output APIs, Compromise name recognition and LM Studio structured responses. No dedicated local privacy/OCR skill was found. Cloud OCR skills were not used because the raw image must stay local.

## Next validation stage (24 November 2026)

Codex read the TDD skill and its tests/mocking references. Used the public interfaces already authorized in the master prompt: capture, disclosure, actual outgoing requests and exports. Wrote and ran failing regressions for split protected phrases and separated sensitive labels before changing disclosure planning. Browser pixel truth comes from synthetic secret elements, not the implementation's generated mask list. Network responses are mocked only at the external provider boundary.

Codex read the Antigravity delegation skill and launched a narrow read-only session/token review (run 20261124-202329-2317c1ba). Completion and verdict are recorded in NEXT_VALIDATION_REPORT.md once inspected. A separate native Codex review reproduced three disclosure defects; this is not a Gemini review or a professional security audit.
