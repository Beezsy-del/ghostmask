# GhostMask 0.2.1 - selective disclosure regression work

Date: 24 November 2026. Status: local patch, not committed or pushed. This stage fixes reproduced privacy defects; it does not complete the six-week roadmap or certify production readiness.

## Three reproduced defects and fixes

1. **Split protected values.** A page could divide an explicitly protected value across inline text nodes. The previous space-joined representation changed the value, so zero of three fragments were masked. A failing public disclosure test reproduced this. The fix adds whitespace-normalized matching for known private terms and maps matches back to whole text blocks. Existing spaced-text rules remain. This can over-mask unrelated adjacent text that happens to concatenate into a protected value.
2. **Separated sensitive labels.** `Password:` in one element and its value in the next escaped per-block context detection. The new test failed with the raw value present. A newline-separated context view now associates that label with the following value without treating every later paragraph as private. This is still a heuristic, not general semantic understanding.
3. **Covered text.** Text behind an opaque overlay could enter sanitized text despite being absent from the screenshot. The native Codex review reproduced this in Chromium. Failing capture tests covered ordinary overlays and `pointer-events:none` overlays. The fix adds bounded 3x3 visibility samples per text rectangle, plus conservative overlap checks for pointer-transparent regions. Covered or uncertain blocks are excluded and masked. Grid sampling is not pixel-complete: thin/malicious overlays between samples are not certified. Pointer-transparent regions may cause excess masking even when transparent.

Each defect was reproduced before its fix. Parent reviewed the capture changes and ran the integrated suite after integration.

## Executed verification

| Check | Result |
|---|---|
| TypeScript type check | Passed |
| Code tests | 44 passed, 0 failed |
| Fixture/Python checks | 8 passed; original fixture manifest unchanged bit-for-bit |
| Browser tests | 14 passed, 0 failed, 0 skipped; historical final regression explicitly enabled |
| New disclosure browser cases | 8 passed: ordinary/pointer-transparent overlays, split protected value, separated password label, repeated hidden value, private URL, encoded protected phrase, contextual identifier |
| New OCR failure browser case | Passed: missing packaged worker pauses task, clears exportable payload, makes zero model requests |
| Build | Passed |
| Local package | 0.2.1 ZIP built; original 0.1/0.2 packages preserved |

New browser cases inspect actual outgoing HTTP request bodies at the provider boundary and sanitized text/receipts. Image checks decode the exported PNG and inspect the rectangles of seeded secret elements measured independently from the detector's mask plan. Useful public `14 days` text must remain. All eight cases passed their seeded disclosure/pixel checks. This is not a universal zero-leak claim.

These tests use deterministic intercepted provider responses and simulator responses. They do not establish new real-model quality or performance results. The previous real Ollama result remains historical. The final complete browser suite took 23.6 seconds with one worker; this is suite runtime, not capture latency.

The 0.2.1 version metadata was bumped after the integrated code tests passed. Packaging rebuilt the same tested source with that metadata. The only subsequent changes are release/report metadata and documentation.

## Evidence and reproducibility

- tests/disclosure.test.ts: two new public-interface regressions.
- tests/browser-unit.test.ts: two real-DOM capture regressions.
- tests/e2e/privacy-regressions.spec.ts: eight disclosure cases and one OCR failure case.
- NEXT_VALIDATION_CASES.json: synthetic provenance and development status.
- evidence/v0.2.1/results.json: final browser results.
- evidence/v0.2.1/manifest.json: code/test hashes and counts.

Run:

```sh
npm ci
npm run typecheck
npm test
npm run build
node scripts/build-test.mjs
GHOSTMASK_FINAL=1 npm run test:browser
python3 scripts/fixture_manifest.py --check
python3 -m unittest discover tests
npm run package
```

The old reserved-final fixtures are regression cases now; they were not edited. The new cases are development regressions, not an independently held-out benchmark. No AUC or generalization rate is claimed.

## Review status

The native Codex reviewer independently reproduced all three defects. It implemented only the covered-text fix and its tests; parent reviewed and integrated them. It executed 18 browser-unit tests and type checking successfully. This is not a professional external audit.

The real Antigravity read-only run `20261124-202329-2317c1ba` ended with transport ERROR / exit code 3 / DEADLINE_EXCEEDED after the configured three-minute print timeout. response.md is empty. No Antigravity verification verdict is claimed. Further independent review remains outstanding.

## Remaining work

Broad real-page compatibility, multilingual detection, difficult OCR/layouts, exhaustive crash/race coverage, larger independent datasets, accessibility evaluation, and a completed external security review remain open. Current supported scope and conservative exclusions remain in force. The v0.2 PDF guide is historical and does not describe these new fixes.

No GitHub changes or deployment were made during this stage.
