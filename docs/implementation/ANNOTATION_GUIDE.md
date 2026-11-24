# Synthetic fixture annotation

Each family has one HTML template and a ground-truth JSON file. A family is a distinct layout and interaction pattern, not a change in names or colours. Never treat repeated variants as independent samples.

Use synthetic names, reserved `.test` email domains, fictional phone ranges and explicit SYNTH identifiers. No real credentials. List every sensitive seed, category and selector in ground truth. For dynamic text, specify the trigger and assert after rendering. Canvas/frame labels need rendered-image review; source-string presence alone is insufficient.

The current 12 families were authored by Antigravity. Codex reviewed the manifest generator and reran its eight checks. These are agent-created annotations, not independent human ground truth. The existing selector check searches source tokens; it is not full CSS-selector execution. App-level browser tests are separate.

Seven development, two validation and three reserved-final families are disjoint. The three reserved families are too few to support broad security claims. Keep final results tied to source and fixture hashes; if failures inform tuning, treat those cases as regression/development cases and author a new final set for a new generalization claim.

The initial agent-selected Apache licence was replaced by a private/unlicensed project marker in manifest v1.0.1. No public licensing decision or publication was made. The original agent report is historical, not the current licence authority.

## Missing work

Human annotation review, bounding-box labels, multilingual pages, browser/device-scale matrix, realistic positive/negative class balance, independently authored larger final set, and useful selective-redaction utility tests. No AUC target is claimed from these fixtures.
