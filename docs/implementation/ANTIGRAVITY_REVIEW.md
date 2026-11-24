# Codex Independent Verification Report

**Contract ID:** `AGV-REVIEW-20261124-7F3C`  
**Verdict:** PARTIAL  

---

### Scope Inspected
The following files were inspected directly on disk:
- [AGENTS.md](file:///Users/shreeshaks/Documents/ghostmask/AGENTS.md)
- [src/contracts.ts](file:///Users/shreeshaks/Documents/ghostmask/src/contracts.ts)
- [src/session.ts](file:///Users/shreeshaks/Documents/ghostmask/src/session.ts)
- [src/gateway.ts](file:///Users/shreeshaks/Documents/ghostmask/src/gateway.ts)
- [src/tokens.ts](file:///Users/shreeshaks/Documents/ghostmask/src/tokens.ts)
- [src/sanitizer.ts](file:///Users/shreeshaks/Documents/ghostmask/src/sanitizer.ts)
- [src/browser.ts](file:///Users/shreeshaks/Documents/ghostmask/src/browser.ts)
- [src/panel.ts](file:///Users/shreeshaks/Documents/ghostmask/src/panel.ts)
- [src/background.ts](file:///Users/shreeshaks/Documents/ghostmask/src/background.ts)
- [tests/session.test.ts](file:///Users/shreeshaks/Documents/ghostmask/tests/session.test.ts)
- [tests/gateway.test.ts](file:///Users/shreeshaks/Documents/ghostmask/tests/gateway.test.ts)
- [package.json](file:///Users/shreeshaks/Documents/ghostmask/package.json)
- [tsconfig.json](file:///Users/shreeshaks/Documents/ghostmask/tsconfig.json)
- [scripts/build.mjs](file:///Users/shreeshaks/Documents/ghostmask/scripts/build.mjs)
- [scripts/demo.mjs](file:///Users/shreeshaks/Documents/ghostmask/scripts/demo.mjs)
- [playwright.config.ts](file:///Users/shreeshaks/Documents/ghostmask/playwright.config.ts)
- [extension/manifest.json](file:///Users/shreeshaks/Documents/ghostmask/extension/manifest.json)
- [extension/panel.html](file:///Users/shreeshaks/Documents/ghostmask/extension/panel.html)
- [fixtures/demo.html](file:///Users/shreeshaks/Documents/ghostmask/fixtures/demo.html)
- [docs/implementation/SKILL_USAGE.md](file:///Users/shreeshaks/Documents/ghostmask/docs/implementation/SKILL_USAGE.md)

### Skills Actually Used
- `/Users/shreeshaks/.gemini/config/skills/codex-verification/SKILL.md`
- `/Users/shreeshaks/.gemini/config/skills/codex-verification/references/report-contract.md`

*(Note: Per instructions, verification was performed strictly read-only; no files were edited or committed.)*

---

### Prototype Characterization
This codebase is an early, strict security prototype. It does **not** perform smart or selective redaction:
1. **100% of screenshot pixels are suppressed:** In [sanitizer.ts#L19](file:///Users/shreeshaks/Documents/ghostmask/src/sanitizer.ts#L19), the canvas paints solid `#18222f` over the entire image area.
2. **100% of page text is suppressed:** In [browser.ts#L159](file:///Users/shreeshaks/Documents/ghostmask/src/browser.ts#L159), `Observation.text` is hardcoded to `""`.
3. **Only generic field metadata leaves the client:** In [sanitizer.ts#L4-L7](file:///Users/shreeshaks/Documents/ghostmask/src/sanitizer.ts#L4-L7), original names, labels, and values are stripped down to synthetic targets (`field-1`, `field-2`), input kinds, and categories.
4. **Values stay on the user's machine:** The AI model never sees the user's synthetic values, only short-lived random UUID tokens.

This is a working baseline prototype for controlled form filling, not a finished product with completed selective privacy masking.

---

### Verification Checks

| Category | Item | Status | Notes |
|---|---|---|---|
| **EXECUTED** | Live test suite | **NONE** | Read-only verification tools available; dynamic test execution was not performed. |
| **STATIC_INSPECTION** | Data egress & stripping | **PASS** | [sanitizer.ts#L4-L7](file:///Users/shreeshaks/Documents/ghostmask/src/sanitizer.ts#L4-L7), [sanitizer.ts#L19](file:///Users/shreeshaks/Documents/ghostmask/src/sanitizer.ts#L19), [gateway.ts#L15](file:///Users/shreeshaks/Documents/ghostmask/src/gateway.ts#L15) verify no raw text, values, or original pixels enter outbound wire. |
| **STATIC_INSPECTION** | Ticket integrity & forgery | **PASS** | [gateway.ts#L9-L20](file:///Users/shreeshaks/Documents/ghostmask/src/gateway.ts#L9-L20) uses a private `WeakMap` for tickets and deletes on first use. Forged objects throw `INVALID_ARTIFACT`. |
| **STATIC_INSPECTION** | Permission escalation | **PASS** | [session.ts#L30](file:///Users/shreeshaks/Documents/ghostmask/src/session.ts#L30) explicitly rejects `secret` category and limits kinds. Category array is cloned in constructor ([session.ts#L7](file:///Users/shreeshaks/Documents/ghostmask/src/session.ts#L7)). |
| **STATIC_INSPECTION** | Token scoping & lifetime | **PASS** | [tokens.ts#L2-L13](file:///Users/shreeshaks/Documents/ghostmask/src/tokens.ts#L2-L13) binds tokens to `{task, origin, document, field, version}`. Single-use consume and 60-second default TTL. |
| **STATIC_INSPECTION** | Stale insertion guard | **PASS** | [browser.ts#L31-L48](file:///Users/shreeshaks/Documents/ghostmask/src/browser.ts#L31-L48), [browser.ts#L167-L174](file:///Users/shreeshaks/Documents/ghostmask/src/browser.ts#L167-L174), [session.ts#L47](file:///Users/shreeshaks/Documents/ghostmask/src/session.ts#L47) verify URL hash, DOM generation counter, and element identity before and after insertion. |
| **STATIC_INSPECTION** | Pause & Abort handling | **PASS** | [session.ts#L53-L55](file:///Users/shreeshaks/Documents/ghostmask/src/session.ts#L53-L55) bumps `#epoch`, aborts signals, and wipes tokens and grants. |
| **STATIC_INSPECTION** | Error sanitation | **PASS** | [contracts.ts#L11-L12](file:///Users/shreeshaks/Documents/ghostmask/src/contracts.ts#L11-L12), [session.ts#L18](file:///Users/shreeshaks/Documents/ghostmask/src/session.ts#L18), [panel.ts#L21-L32](file:///Users/shreeshaks/Documents/ghostmask/src/panel.ts#L21-L32) map all runtime failures to a closed list of 10 safe enum codes. Raw error strings are never logged or stored. |
| **STATIC_INSPECTION** | Model endpoint routing | **PASS** | [gateway.ts#L26](file:///Users/shreeshaks/Documents/ghostmask/src/gateway.ts#L26) hardcodes `http://127.0.0.1:11434/api/chat` with `redirect: 'error'`, backed by CSP in [manifest.json#L1](file:///Users/shreeshaks/Documents/ghostmask/extension/manifest.json#L1). |
| **NOT_RUN** | `npm test` (`tsx --test tests/*.test.ts`) | **NOT_RUN** | CLI runner not executed by verifier. |
| **NOT_RUN** | Playwright browser E2E | **NOT_RUN** | Test files under `tests/e2e/` are not yet created by the author. |
| **NOT_RUN** | Live Ollama model daemon | **NOT_RUN** | Local Ollama daemon on `127.0.0.1:11434` was not invoked. |

---

### Detailed Findings

#### Finding 1: Page Navigation During Long Model Inference Yields Stale Proposal
- **Severity:** Medium
- **Location:** [src/session.ts#L39-L43](file:///Users/shreeshaks/Documents/ghostmask/src/session.ts#L39-L43) and [src/gateway.ts#L21-L26](file:///Users/shreeshaks/Documents/ghostmask/src/gateway.ts#L21-L26)
- **Exploitable Scenario:**
  1. The user clicks **Ask for action proposal** ([panel.ts#L118](file:///Users/shreeshaks/Documents/ghostmask/src/panel.ts#L118)).
  2. In `gateway.send`, the page validity check (`valid()`) runs *before* the network request to `127.0.0.1:11434` is dispatched ([gateway.ts#L21](file:///Users/shreeshaks/Documents/ghostmask/src/gateway.ts#L21)).
  3. While the local Ollama model takes 5 to 20 seconds generating a response, the user clicks a link or navigates away in the target browser tab.
  4. Ollama returns the proposal. In `session.propose`, line 40 only checks `this.#check(epoch)`. Because `epoch` only changes on pause/resume, this check passes!
  5. The UI announces that an insertion is proposed for the old page.
- **Consequence:** The user sees a proposal displayed for a page state that no longer exists. While `session.execute` will properly catch the stale state and block insertion later ([session.ts#L47](file:///Users/shreeshaks/Documents/ghostmask/src/session.ts#L47)), presenting stale proposals confuses the operator and wastes tokens.
- **Suggested Fix:** In [src/session.ts#L40](file:///Users/shreeshaks/Documents/ghostmask/src/session.ts#L40), re-verify page identity immediately after `gateway.send` returns:
  ```ts
  if (!sameIdentity(o.identity, await this.browser.current(this.tabId))) throw new SafeError('STALE_CAPTURE');
  ```

---

#### Finding 2: Incomplete Test Suite (Missing Unit Tests for Core Security Modules)
- **Severity:** Medium
- **Location:** [tests/](file:///Users/shreeshaks/Documents/ghostmask/tests/)
- **Evidence:**
  - `tests/session.test.ts` exists and tests Session behavior with mock objects.
  - `tests/gateway.test.ts` exists (only 5 lines long, testing one forged artifact case).
  - `tests/tokens.test.ts`: **DOES NOT EXIST**.
  - `tests/sanitizer.test.ts`: **DOES NOT EXIST**.
  - `tests/browser.test.ts`: **DOES NOT EXIST**.
  - `tests/e2e/`: No test specs exist despite `playwright.config.ts` specifying `testDir: 'tests/e2e'`.
- **Consequence:** Core isolation code in `tokens.ts` (token expiration, scope mismatch checks), `sanitizer.ts` (pixel suppression logic, `safeFields`), and `browser.ts` (isolated world DOM traversal, clickjacking hit test) are completely unverified by standalone automated unit tests.
- **Suggested Fix:** Add dedicated test files:
  1. `tests/tokens.test.ts` checking token scope mismatches, TTL expiration, and double-spend rejection.
  2. `tests/sanitizer.test.ts` verifying that `safeFields` strips all raw values and labels, and that `sanitizeImage` produces a solid color block.
  3. E2E browser tests in `tests/e2e/demo.spec.ts` testing actual isolated world script execution against `fixtures/demo.html`.

---

#### Finding 3: Dead Code / Misleading Scaffold Functions in Sanitizer
- **Severity:** Low
- **Location:** [src/sanitizer.ts#L10](file:///Users/shreeshaks/Documents/ghostmask/src/sanitizer.ts#L10) and [src/sanitizer.ts#L26-L31](file:///Users/shreeshaks/Documents/ghostmask/src/sanitizer.ts#L26-L31)
- **Evidence:**
  - `maskPixels(data)` is defined on line 10 but is never imported or called anywhere.
  - `detect(text)` with regex patterns for email, phone, secrets, and identity numbers is defined on lines 26-31, but is never imported or called anywhere in the project.
- **Consequence:** Future engineers or reviewers might mistakenly believe regex-based data detection or selective pixel masking is active, when in reality 100% of the image is blanked out and text is discarded.
- **Suggested Fix:** Remove `detect()` and `maskPixels()` or clearly label them in the source as experimental/future scaffolding.

---

#### Finding 4: Inefficient Character Concatenation on Large PNG Blobs
- **Severity:** Low
- **Location:** [src/sanitizer.ts#L21-L23](file:///Users/shreeshaks/Documents/ghostmask/src/sanitizer.ts#L21-L23)
- **Evidence:**
  ```ts
  const output=await canvas.convertToBlob({type:'image/png'});const bytes=new Uint8Array(await output.arrayBuffer());
  let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);
  return `data:image/png;base64,${btoa(binary)}`;
  ```
- **Consequence:** For large high-DPI displays, iterating through hundreds of thousands of bytes and concatenating one character at a time creates unnecessary memory pressure.
- **Suggested Fix:** Use `FileReader.readAsDataURL(output)` or process bytes in chunks.

---

### Remaining Uncertainty and Next Checks
1. **Live Browser Runtime:** The isolated world DOM traversal in `ChromeBrowser` ([browser.ts#L7-L104](file:///Users/shreeshaks/Documents/ghostmask/src/browser.ts#L7-L104)) depends on Chrome APIs (`chrome.scripting.executeScript`, `chrome.tabs.captureVisibleTab`, `world: 'ISOLATED'`). This needs verification inside a live browser session using Playwright.
2. **Local Ollama Daemon:** The end-to-end integration with `qwen3:0.6b` on `127.0.0.1:11434` needs verification with an active Ollama instance to test prompt adherence and real response timing.
3. **Parent Action Needed:** Have the main agent execute `npm test` and implement the missing unit tests for `tokens.ts` and `sanitizer.ts`.
