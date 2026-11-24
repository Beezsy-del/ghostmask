# Proposed enforcement contracts (reconcile with existing architecture)

1. Only the outbound gateway owns provider transport. Provider adapters serialize/parse but do not independently send data. Inspect all fetch/SDK/WebSocket/beacon and logging paths during source audit.
2. A boolean sanitized=true supplied by a caller is not proof. Gateway accepts artifacts issued by the trusted sanitizer/controller, validates current task policy/capture identity, and binds the exact serialized bytes to the reviewed artifact. Enforce runtime provenance, not only TypeScript types.
3. Page-derived strings are untrusted, including accessible labels, attributes, errors, URLs and prompts. Build a minimal supported representation; do not export raw HTML or append raw errors on retries.
4. Capture pre/post identity includes document/frame/tab, mutation generation, scroll/viewport/scale and active-tab identity. Reject mismatches. Freshness is bounded evidence, not a proof that all async rendering is frozen.
5. Screenshot processing must sanitize exported pixels; live overlays are not sufficient. Mask unsupported image/frame/canvas regions or block. Do not claim OCR coverage before testing it.
6. Model action is a proposal. Local executor validates live field identity, origin, document, task, operation, permission version and token expiry. Reserve/consume one-use token atomically against concurrent proposals. Fail safely on uncertain execution and require fresh approval, not blind retries.
7. Visibility permission and local-use permission are distinct. User approval must not be forgeable by a content-script message. Validate sender and message type. User review state belongs in the trusted extension controller.
8. Only non-secret progress persists. Raw mappings have an explicit memory lifetime. Restart invalidates them; no resurrection from receipts, prior prompts or logs.
9. Receipts record statuses and identifiers, not raw error text, page excerpts or arbitrary model output. User-entered task descriptions can themselves contain secrets; sanitize/minimize them before any provider call.
10. Tests cross the interfaces specified in the user's request: actual captured output, actual outbound request, policy/token operations, real field results, and user controls. External provider can be a test endpoint, explicitly labelled. Image checks inspect bytes/pixels, not only text searches.

Threat actors: malicious webpage instructions/content, hostile model proposals, accidental raw retries/logging, stale concurrent page state. Out of scope: compromised OS/extension build, unrelated capture software, protecting values from the authorised destination itself. Detection misses remain possible and must be measured.
