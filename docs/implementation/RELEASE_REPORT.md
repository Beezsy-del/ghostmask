# GhostMask implementation and release report

Date: 2026-11-24, Mac M1 Pro / 16 GB. **Verdict: local synthetic prototype ready to inspect; full roadmap and production release NOT complete.** No commits, pushes or GitHub publication occurred.

## 1. Executive summary

Built a functioning Chrome extension with local capture, strict sanitization, exact-request review, a central outbound gateway, short-lived one-use values, scoped local insertion, independent readback, recapture and safe receipts. Both a labelled simulator and a real local Qwen3-0.6B route work in the declared tests.

The central limitation is deliberate and substantial: every original pixel and all raw page text are hidden. Only generated field metadata and approved tokens reach the model. This is a useful security-boundary testbed for approved form filling, **not** useful selective screenshot redaction, broad web automation or PLVA feature parity.

## 2. Original repository state

There was no existing matching application. The user confirmed a new project. The roadmap PDF was read in full; source searches and predecessor findings are in `SOURCE_RESEARCH.md`. No prior build or test baseline existed. The medication project and backup were preserved.

## 3. Implemented features

- Manifest V3 extension and side panel, selected-tab controls, explicit purpose and insertion categories.
- Local screenshot capture and original preview, generated safe field catalogue, actual opaque sanitized PNG.
- Task/document/tab/window/origin/URL-digest/mutation/viewport/zoom binding; bounded capture retries.
- CSS-selector exclusions that also block affected fields from insertion.
- One outbound network location, fixed loopback destination, inspected serialized body, one-use issued tickets, stale checks, no raw fallback, safe errors.
- Random local value references bound to task, destination field, origin, document, policy and expiry; consumed once, cleared on task termination, expiry cleanup timer.
- Proposed / attempted / verified actions; no automatic Submit action. Independent post-insertion field readback and recapture.
- Pause/resume with fresh capture, abort, local retention controls, memory-only receipts.
- Real Ollama adapter with strict JSON proposal parser, timeout, no raw image or value supplied to the model; clearly labelled simulator.

## 4. PLVA-inspired work and limits

Implemented local exclusion, opaque pixel sanitization, temporary references, approved local restoration, subsequent sanitization and safe history. Did not copy PLVA source, assets or performance claims. No trusted original PLVA code licence was established. OCR, selective privacy detection, local secret-dependent reasoning, broad visual agent parity and advertised PLVA latency are not reproduced.

## 5. Roadmap status

See `ROADMAP_CHECKLIST.md` for every stage's complete/partial/incomplete status. Stages 1–2 have a working narrow pipeline. Stages 3–6 remain partial: exclusions replace unsupported visual understanding; the dataset is staged; review and tests have limited scope. No feature-parity claim.

## 6–8. Agents and integration decisions

Antigravity authored 12 structurally distinct synthetic template families, ground truth, deterministic manifest generator and eight Python checks. Codex reviewed these, reran them, retained source staging, and corrected the unrequested public-licence metadata to private/unlicensed.

Codex owns the architecture, gateway, sessions, policy, token store, sanitization, model route, integration, browser evaluation and reports. Codex sub-agents implemented the browser adapter and panel; the parent reviewed and tested the integrated code.

Antigravity performed two completed read-only reviews. The first found a genuine stale-proposal issue, which was reproduced and fixed. Its guessed-filename claim about missing tests was rejected. The follow-up passed the narrow core's static inspection. No tests were executed by the reviewer. Reports and dispositions are preserved. No independent human security audit has occurred.

## 9–11. Files, architecture and security boundary

`FILES_CREATED.md` lists additions. `ARCHITECTURE.md` contains component/data-flow diagrams, trust boundaries, retention and supported-page matrix. Trusted code issues in-process gateway tickets; pages and model replies cannot issue them. The gateway is not a security boundary against a compromised extension bundle.

Only this integrated pipeline is protected. Other agents, browser traffic, other screenshot tools, compromised OS/browser code and destination websites are outside scope. A site can see any value inserted into it. Changes already dispatched to Chrome cannot be retroactively cancelled. The model still learns coarse field counts/types/categories.

## 12–14. Final executed tests and leakage evidence

| Check | Actual result |
|---|---|
| `npm run typecheck` | Passed |
| `npm test` | 23 passed, 0 failed |
| `npm run build` | Passed |
| Browser suite, real model enabled, frozen evaluation enabled | 3 passed, 0 failed; 9.4 s total observed run |
| Fixture manifest exact regeneration | Passed |
| Python fixture suite | 8 passed, 0 failed |
| Runtime network audit | One model-bound fetch site, in gateway.ts; no alternate SDK, WebSocket, telemetry or raw fallback found in src/extension |
| Frozen strict-profile evaluation | 3 templates, 7 defined seeded values, 3 actual intercepted request bodies: 0 matching seeded leaks |
| Exported PNG pixel check | 921,600 pixels per image; 2,764,800 checked total; 0 non-suppressed pixels |
| Real Ollama + Chromium demo | Sanitized request, valid proposal, approved insertion, readback and recapture passed |
| Panel simulator workflow | Capture, local approval, payload review, insertion, pause/resume, abort, receipt clearing and 390 px layout check passed |

The frozen templates contain receipt, canvas and iframe cases. Text checks search each seed in literal, URL-encoded and base64 forms in the actual outgoing request. This is not exhaustive encoding or covert-channel coverage. The iframe/canvas contents are not understood; they are suppressed. The model response for the three frozen fixtures is intercepted; the separate demo uses the actual model. No insertion utility was measured on the three frozen fixtures.

The first frozen harness run stopped before capturing any case because a test variable collided with Chrome's `browser` global. That test-only variable was renamed. Production source, detector and fixtures were unchanged; the subsequent run passed. Source hashes and the harness correction are recorded in `CANDIDATE_HASHES.json`.

Tests exercise forged artifacts, token scope/expiry/reuse, forbidden proposals, stale navigation, page mutation during inference, pause/abort, excluded fields, replaced field identity, insertion readback failure, sanitizer exceptions and no-request failure behavior. Actual image bytes are decoded and checked, not just string-searched. This is still a finite suite, not an exhaustive security proof.

**Permission difference:** automated tests load a disposable test-only extension copy with `<all_urls>` to replace the manual toolbar activeTab gesture. The delivered extension uses `activeTab`. Manual toolbar permission flow and every real Chrome version are not certified by these tests. No test harness ships in the ZIP.

## 15. Measured performance and detector baseline

Frozen capture/sanitize/intercepted-request scenarios took 118, 83, 76 ms in one run. These figures exclude real inference and are not a broad latency benchmark. The complete real-model browser scenario took 3.1 s; it includes capture, request, action, recapture and blocking checks. No model-only p95 or memory benchmark is claimed.

Evaluation-only rules recognized 6 of 30 development/validation seed strings and missed 24. Four synthetic negative strings produced zero rule detections. This is **seed-string coverage**, not entity span recall, page-level privacy recall or measured detector precision. No ROC-AUC or PR-AUC is reported. Rules cannot safely authorize selective disclosure on this evidence. The strict profile hides public content too; visual utility is intentionally poor.

## 16–18. Limitations, unsupported work and remaining issues

- Selective OCR/image masking, reliable local contextual name/address detection and granular model-visible disclosure are incomplete.
- Draw-to-mask, useful preserved page prose, broad multi-step autonomous tasks, select controls and cross-frame actions are not implemented.
- The model task is deliberately narrow and mostly deterministic; do not market this as sophisticated autonomous reasoning.
- 12 agent-authored layouts are not 200 independent templates. Three frozen cases are far too few for generalization claims. No human annotation review or real-user study.
- Full zoom/device-scale/browser matrix, exhaustive crash tests, detailed accessibility audit and independent professional penetration testing remain.
- No cloud adapter, Chrome Store release, production vault, persistent task restoration or policy portability.
- Provider output is capped at 65,536 streamed bytes, with cancellation on overflow. The local loopback service is still unauthenticated; do not expose it on a public interface.
- The original image temporarily exists in local memory. JavaScript cannot guarantee forensic memory zeroization. Expiry timers may be throttled; permission expiry is checked on use regardless.
- Partial/selective-redaction release is blocked on independently labelled data, sound coverage/utility measurements and broader adversarial evaluation. AI4Privacy was screened but not adopted because custom licensing and redistribution conditions require clarification.

No unresolved critical failure was observed in the tested strict profile, but this is not a statement that all critical flaws have been excluded.

## 19–20. Installation and demo

See `README.md`. Load `dist/` unpacked, run `npm run demo`, click the toolbar action on the local demo, and start with the simulator. A ZIP of the same developer extension is at `release/ghostmask-0.1.0.zip` with SHA256SUMS. For the real route start foreground Ollama and use the installed Qwen3:0.6b model.

Runtime tested: Node 26.10.0, npm 11.19.1, TypeScript 5.9.3, Playwright 1.65.1 / Chromium 159, Ollama 0.40.17, Qwen3:0.6b model ID prefix `7df6b6e09427`. Lockfile records exact JavaScript dependencies. No login service was installed.

Synthetic evidence is copied under `docs/implementation/evidence/`: actual request, receipts, browser results, rule baseline and frozen results. User-visible previews come from the actual sanitized artifact. Never use the original local preview as evidence of what the model received.

## 21. Release decision

**Local research/demo prototype only. Not production ready. Full roadmap incomplete.** Preserve the strict profile while developing a useful selective-redaction version behind separate tests. Zero observed seeded leaks across three templates is not universal safety. Do not claim novelty for the whole category: predecessor research found substantial overlap.

Final follow-up: added and tested a streaming 65,536-byte model-response cap after the static review. All 23 code tests and all three browser scenarios were rerun afterward and passed. Final hashes are in FINAL_BUILD_HASHES.json. No detector tuning or fixture changes followed evaluation. The fixed cases remain a narrow regression/evaluation set, not evidence of broad generalization. The foreground Ollama test server was stopped after verification.
