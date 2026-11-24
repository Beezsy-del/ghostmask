# V2 capture and selective-mask support

Owned files: `src/browser.ts`, `tests/browser-unit.test.ts`, this report. No commits or pushes.

## Implemented

The capture adapter now returns bounded visible text blocks with viewport rectangles and local context metadata. It also separates `protectedMasks` from the original all-text `masks` list. Protected regions include control values, unsupported image/canvas/frame/background regions, manual exclusions, and partly clipped text. Ordinary public text is not automatically in the protected list; the parent sanitizer must detect and mask sensitive blocks before disclosure.

Each `TextBlock` contains a generated ID, text, visible rectangles, exclusion flag and short local context derived from up to three ancestors' tag/ID/class/ARIA/private markers. This context is raw local information, **not safe outbound text**. The sanitizer must not serialize it directly. Excluded blocks have empty text and fixed `excluded` context. Hidden, transparent or fully offscreen text is not included. Partly clipped text is protected and its text omitted so unseen characters are not accidentally disclosed.

The adapter limits visible blocks to 1,000 and their source characters to 100,000; overflow blocks capture instead of silently truncating coverage. Existing 15,000-element, 20,000-text-node and viewport limits remain. CSS-generated text, custom fonts, visual effects, active animation, shadow/custom content and viewport transforms trigger conservative full coverage. System-font standard HTML remains usable. Body/root styles are now checked too.

All control values (including hidden/excluded controls) and excluded text are collected in local-only `privateValues` so the sanitizer can hide a repeated secret elsewhere. Values are limited to 800 unique strings of at most 4,096 characters; overflow blocks capture. This list must never be sent to the model, receipts or logs. Control properties are rechecked after hashing, including hidden values.

The capture revision hashes field values, text block content/geometry, protected regions and private values. After hashing yields, DOM mutations, viewport, URL, field values and text geometries are rechecked. The retained signature is SHA-256, not raw content. CSSOM-only geometry changes invalidate identity even without an ordinary DOM mutation.

## Select insertion

The local executor now supports a visible enabled single-select control only when the approved value matches exactly one existing enabled option. Missing, duplicate-valued, disabled and disabled-optgroup options are rejected. Multiple selection remains unsupported. It uses the native select value setter, dispatches events, and performs the same independent later readback as text insertion. The parent Session must explicitly allow select operations; this adapter alone does not grant permission.

Number, password, hidden, file and checkbox insertion remain unsupported. Insertion now also checks ancestor visibility and opacity, not just the control's own style.

## Validation

- Browser-boundary test suite: 16 tests, including real Chromium DOM checks for visible/public text, private/hidden exclusion, select option validation, CSSOM-only geometry invalidation, clipping, visible-block overflow, hidden/excluded value collection, oversized-value rejection and hidden-value identity changes.
- TypeScript typecheck passed before the final private-value addition; the latest whole-project run is blocked by the concurrently missing `src/ocr.ts` imported from `src/prepare.ts`. No browser-module type errors were reported.
- Existing unit harness injects the self-contained function into a real page through a mocked external Chrome API. This is not proof of actual extension isolation; the parent must run the bundled MV3 integration tests.

The overflow fixture was corrected to use wrapping inline-block spans. Its first version made one long unbreakable line, so fewer than 1,000 spans were visible; capture correctly did not overflow. No production limit was weakened to make the test pass.

## Skills and source evidence

Read local Playwright skill and checked npx. Used automated test files because the master task explicitly requires browser tests. Read TDD and its test/mocking references; tests exercise the agreed BrowserPort seam, with only Chrome APIs mocked. The visible-block and select tests failed before their implementation and passed afterward. Context7 official Chrome documentation confirmed isolated-world self-contained injection, document targeting, active-tab capture and permission requirements.

No dedicated local privacy/browser-extension skill was available. This code does not claim complete secret detection, OCR coverage or immunity to hostile rendering. Split text-node secrets need cross-block detection in the parent sanitizer. Unsupported pixels must stay covered. Raw labels/context never become safe merely because this adapter collected them.
