# Historical v0.1 checklist

For current implementation see [v0.2 release report](V2_RELEASE_REPORT.md). The full roadmap is still incomplete.

# Roadmap status — honest scope

This is a working strict prototype, **not completion of the full six-week roadmap**. The primary privacy boundary works by excluding all raw visual/text content, not by proving a detector can find every secret.

| Stage / requirement | Status | Evidence or gap |
|---|---|---|
| 1: New extension, local synthetic workflow, capture | Implemented | Build and actual MV3 tests |
| 1: Actual image sanitization | Implemented with severe utility limit | All pixels opaque; exported PNG inspected pixel by pixel |
| 1: Sanitized text / context | Implemented with severe utility limit | Generated field catalogue only; raw page text and labels omitted |
| 1: Rules detection | Evaluation baseline only | 6/30 development/validation seed strings detected; not release detection |
| 1: Payload viewer and gateway | Implemented | Exact serialized body reviewed and inspected at network boundary |
| 1: Agent route | Implemented | Deterministic simulator plus real local Ollama Qwen3-0.6B |
| 2: Capture identity, freshness, mutation checks | Implemented | Browser tests, stale capture/proposal tests |
| 2: Permission and local token store | Implemented | Task/origin/document/field/version/expiry, one-use and memory-only |
| 2: Local insertion, readback, recapture | Implemented for text controls | Actual model and browser workflow |
| 2: Safe receipts | Implemented | Proposed, attempted, verified, blocked events; no raw values |
| 3: Scroll, zoom, device scale identity | Implemented checks, incomplete matrix | No broad device/browser coverage claim |
| 3: Frames, canvas, images, embedded docs | Excluded | No OCR or cross-frame interaction; full visual suppression |
| 3: Crash recovery | Conservative reset | Lost panel runtime means fresh task/approval; exhaustive crash suite not done |
| 3: Local OCR / contextual detector | Not implemented | Requires independently validated detection/geometry and utility evidence |
| 4: Dataset | Staged | 12 agent-authored families, 7/2/3 family split, not 200 |
| 4: Seed/pixel leakage tests | Implemented narrow scope | See measured final report; not universal secrecy |
| 4: ROC/PR AUC and detector ladder B–D | Not claimed / not implemented | No calibrated detector scores or justified training dataset |
| 4: Real task utility benchmark | Partial | One approved insertion workflow; generic webpage tasks not supported |
| 5: UI, pause/abort, retention | Implemented | Panel workflow, local-only toggle, responsive check |
| 5: Draw-to-mask and granular disclosure choices | Not implemented | CSS exclusions and full suppression only |
| 5: Additional cloud adapter / policy portability | Not implemented | Local Ollama plus simulator only |
| 5: Packaging / install docs | Implemented for developer loading | No Chrome Store publication or production deployment |
| 6: Independent review | Partial | Antigravity static reviews, not external professional penetration test |
| 6: Broad adversarial and browser compatibility audit | Incomplete | Scope must remain synthetic/local prototype |

Do not claim PLVA feature parity, universal screenshot protection, a high AUC, or production readiness. The public source search confirms substantial existing competition.
