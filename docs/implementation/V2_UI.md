# GhostMask v2 panel

## Scope and design

This update replaces the panel workflow, not the security boundary. Session still owns capture, masking, approval, export and model requests. The panel never sends requests itself. No commits or pushes were made.

The visual plan uses a pale blue page, dark ink, blue action controls and amber local-only areas. It uses system fonts and no remote assets. Three linked sections follow the user's work: Capture, Review, and Actions & receipts. The actual sanitized image and text are the main review surfaces. Small status labels describe measured session state, not a claim that every secret was found.

## Skills applied

Read project AGENTS.md and `/Users/shreeshaks/.codex/skills/frontend-design/SKILL.md`. Applied its guidance to intentional layout, restrained colors, real connected controls, readable hierarchy, visible keyboard focus, responsive layout, and no external decorative assets. No unavailable skill was claimed. Parent owns broader security skill review and Antigravity coordination.

## Working controls

- Reviewed profile and local English OCR are the defaults. Strict profile is an explicit alternative.
- Separate task purposes: approved field insertion or page summary.
- Simulator, Ollama and LM Studio routes. Model names are local settings; endpoints cannot be changed in this panel. LM Studio requires the loaded model identifier.
- Origin-only tab labels avoid displaying private URL parameters or page titles.
- Sanitized screenshot, sanitized text, coverage warnings and OCR status come from Session's actual artifact.
- Drag-to-mask operates on the sanitized preview. Pointer positions map to captured viewport coordinates. Session creates a new masked artifact; the canvas is only an editing indicator and is never treated as the exported mask.
- Numeric coordinate inputs offer a keyboard alternative. Individual manual masks can be removed or cleared.
- Protected phrases are entered locally, one per line. Applying them invalidates prior review and insertion approvals.
- Original screenshots and raw field values appear only inside a closed-by-default local-only disclosure.
- Insertion permission and model visibility are separate controls. Approval awaits re-sanitization before presenting a fresh payload.
- Exact request JSON is visible. Sending requires reviewing the current payload. A sent request cannot be sent twice through the same review button.
- Export buttons request validated artifacts from Session. Only masked PNG, sanitized text, and safe receipt JSON are downloadable. Original images are not exported.
- Summaries are rendered as text, with a reminder to check the source. The panel never renders model HTML.
- Pause, resume, abort, receipt clearing and safe failure messages reflect Session state.

A new capture clears drawn rectangles because their positions belong to the old capture. CSS exclusions and protected phrases remain in the task. UI text explains this. New tasks clear local entry fields. Closing or aborting a task clears UI-held secrets and disposes the browser subscription.

## Accessibility and small screens

Controls have explicit labels. Native buttons, selects, details and textareas support keyboard use. Visible focus styling is preserved. Coordinates are available without a mouse. Layout collapses for narrow panels; exports wrap. Reduced-motion preferences are respected. No canvas-only action is required. Screen-reader and manual visual checks remain part of integrated browser verification; CSS alone is not proof of accessibility.

## Files

- `src/panel.ts`: state rendering, controls, local editing, safe export downloads.
- `extension/panel.html`: labelled workflow and connected controls.
- `extension/panel.css`: responsive layout and visual states.
- This document.

## Validation record

Ran `npm run typecheck` after the UI changes. At this point it reported only the missing `src/ocr.ts` module being implemented separately. No panel TypeScript errors were reported. Final integrated checks must run after that module lands. Parent owns end-to-end browser validation and release reporting. No live LM Studio server test has been performed by this UI task.

## Limits

English detection can miss private content. Review is required. Unsupported content is reported by the pipeline; the panel does not claim universal screenshot protection. Manual rectangle privacy depends on the capture coordinates and is invalidated by new captures. This UI does not submit forms. Exported files leave the extension's memory lifecycle and must be managed by the user. Simulator output is labelled as simulated. Model setup is not model installation.
