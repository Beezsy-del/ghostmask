# Capture and local insertion

Implemented by Codex capture agent. This is a supported HTML-form boundary, not a general screen reader or universal secret detector.

## Browser boundary

`ChromeBrowser` implements `BrowserPort` from `src/contracts.ts`.

- Only HTTP(S) top-frame documents are supported. `activeTab` and `scripting` permissions are required. Capture uses `tabs.captureVisibleTab` for the explicitly selected tab's window, with active-tab checks.
- Every observation includes Chrome's document ID, tab/window, origin, a SHA-256 digest of the complete URL, viewport size/scroll/device scale, browser zoom and an observed revision.
- The raw URL never leaves the browser adapter. A hash is not an anonymization guarantee and must remain local.
- The revision tracks DOM mutations, user input/change, scrolling/resizing, history/hash changes, field value/geometry changes (including programmatic `.value` writes), and extension-observed tab activation/navigation events.
- An isolated-world WeakMap binds random field keys to actual elements. Keys are not inserted as page attributes. Removed/excluded elements lose their insertion lookup; replacement elements receive new keys.
- A capture may take at most three screenshots. Each shot is spaced at least 600 ms apart. Identity changes before/after a shot cause a retry. Script/API technical failures block immediately rather than retrying blindly.
- No raw page text, title, HTML, URLs, tooltips or attributes are exported as text. `Observation.text` is empty. Fields contain local-only values and labels for the local controller. These must be sanitized by the core and must not be logged.
- Screenshot data is local and raw until the core produces its sanitized artifact. Merely getting an observation is not permission to transmit it.

## Visual coverage

The adapter supplies rectangles for visible text nodes, input controls and unsupported image/canvas/frame/video/embed regions. It adds full-viewport exclusions for generated content, shadow/custom content, visual effects and active animations. This rectangle layer is conservative and has not been validated as a stand-alone image privacy mechanism. The integrated core uses full visual suppression plus a synthetic structural view; partial image redaction is not a release claim.

Cross-origin frames are not read. Canvas, image text and embedded documents are unsupported; no OCR is implemented here. A maximum of 15,000 elements, 20,000 text nodes and 32 million device pixels bounds processing. Large or restricted pages fail closed.

Manual exclusions are CSS selectors. An excluded element and every descendant are removed from available fields as well as masked. Exclusions persist for subsequent re-observations and insertion checks. Invalid selectors fail; clearing exclusions requires a new capture. This adapter does not authorise model-visible data or tokens; the core policy engine does.

## Insertion

Only visible enabled non-read-only text/email/tel/search/URL inputs and textareas can be filled. Select controls can be observed but cannot be inserted into in this version. Password, file, hidden, checkbox and payment actions are not supported.

Insertion checks current identity, directs execution to the specific document ID, rechecks origin/URL/viewport/revision and actual element identity, rejects excluded or covered fields, uses the native value setter, dispatches input/change, verifies immediately, and then independently observes the field again. It returns success only if the value matches in that later observation. It never clicks Submit.

An authorized website still receives an inserted value. A website can change it later; verification is point-in-time, not a promise of persistent storage or task completion. Browser events and asynchronous rendering are not an atomic transaction. The adapter checks observed changes but does not claim to freeze a hostile browser page.

## Validation

`npx tsx --test tests/browser-unit.test.ts`: **8 passed** on 2026-11-24.

Seven tests use a mocked external Chrome API boundary for inactive tab blocking, identity binding, bounded retries, safe errors, stale navigation and changed-value verification. One uses real headless Chromium DOM and actual PNG capture with a Chrome-API harness. It verifies ancestor exclusions, refusal of a previously known excluded field, and successful readback of an allowed email insertion. That harness runs injected code in a normal page context; it does not itself prove Chrome extension isolated-world behavior. Integrated extension tests must establish that separately.

`npx tsc --noEmit`: passed after changes. No claims of image leakage scores, OCR accuracy or full browser compatibility are made from these tests.

The DOM harness deliberately sets Playwright screenshot `caret:'initial'`: the default screenshot behavior temporarily changes page styles, which correctly makes the capture revision stale.

## Skills and authoritative sources

- Read `playwright/SKILL.md`; checked `npx`; used test files because the user's master prompt explicitly requires automated browser tests. No real user profiles or records used.
- Read `mattpocock-skills:tdd` and its tests/mocking references. The public BrowserPort and actual browser API seam are already explicitly requested by the user's test requirements. Verified red-to-green for missing module and asynchronous changed-value verification. Mocked only the external Chrome API.
- Discovered local skill folders: no dedicated browser-extension/security/privacy skill found. Used explicit threat-boundary rules and official Chrome docs instead.
- Context7 consulted Chrome Extensions API Reference for captureVisibleTab, two-captures-per-second limit, and isolated execution world.
- https://developer.chrome.com/docs/extensions/reference/api/tabs
- https://developer.chrome.com/docs/extensions/reference/api/scripting

No git commits or pushes were made.

## Security and integration follow-up

The page-side change signature now retains only a SHA-256 digest, not a raw JSON copy of field values. The temporary input byte buffer is zeroed after hashing. Mutation revision, current URL, viewport, and field values/geometry are rechecked after that asynchronous operation. JavaScript strings cannot be reliably zeroized, so this is minimized retention rather than a memory-forensics guarantee. Element references refer to the website DOM; no separate raw field snapshot persists in isolated global state.

`ChromeBrowser.dispose()` removes its Chrome tab listeners, clears local revision bookkeeping, and blocks future use. It does not remove the website's own values or claim to erase the website. The isolated DOM observer and element references last until document/extension teardown; the signature contains only a digest. The panel should dispose its adapter when its runtime ends.

The real MV3 integration test initially exposed a serialization-order bug: Chrome reordered viewport object keys, so JSON string equality falsely rejected an otherwise valid insertion. Viewport comparison now checks each numeric field explicitly. After this fix, `npm run build`, `node scripts/build-test.mjs`, `npm run test:browser` passed the actual-extension integration test (1/1), including real capture, inspected outbound request, local insertion, later dynamic invalidation and failure blocking. Browser seam tests passed 8/8. Temporary synthetic debugging code was removed. Parent must rerun final integration after any later changes.
