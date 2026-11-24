# Fixture Report: Staged Synthetic HTML Fixture Dataset (Task AG-001)

Contract ID: AGV-REVIEW-20261124-7F3C

## 1. Verdict
**PASS** (Scoped Acceptance Criteria for Task AG-001 Verified).
All 12 structurally distinct HTML template families, ground truth annotations, deterministic Python stdlib manifest generator, and unit tests were created, executed, and verified within the staging workspace.

---

## 2. Scope Inspected
- `AGENTS.md` (Role definitions, ownership boundaries, and staging rules)
- `delegation/AG-001.md` (Task AG-001 acceptance criteria)
- `spec/ROADMAP.txt` (Dataset split criteria, benchmark definitions, and boundary guidelines)
- `fixtures/` (All 12 family directories, HTML templates, ground truth JSON files, and `manifest.json`)
- `scripts/fixture_manifest.py` (Deterministic manifest generator)
- `tests/test_fixture_manifest.py` (Unittest suite for hashes, splits, synthetic integrity, and selectors)

---

## 3. Skills Read & Application
The following skills from `~/.gemini/config/skills` were independently discovered, read, and applied:

1. `/Users/shreeshaks/.gemini/config/skills/codex-verification/SKILL.md`
   - *Application*: Enforced strict role boundaries (Antigravity owns only fixtures, manifest script, unit tests, and fixture report; Codex owns core security decisions and docs/implementation). Ensured evidence-based reporting with separated check categories (EXECUTED, STATIC_INSPECTION, NOT_RUN).
2. `/Users/shreeshaks/.gemini/config/skills/codex-verification/references/report-contract.md`
   - *Application*: Adopted review report contract structure and contract ID `AGV-REVIEW-20261124-7F3C`.
3. `/Users/shreeshaks/.gemini/config/skills/tdd/SKILL.md`
   - *Application*: Followed test-driven development loop (Red -> Green). Authored `tests/test_fixture_manifest.py` defining test seams at manifest generation, hash verification, and selector parsing, confirmed test failure, then implemented generator and fixtures until all 8 unit tests passed cleanly.
4. `/Users/shreeshaks/.gemini/config/skills/code-review/SKILL.md`
   - *Application*: Evaluated standards and spec compliance, ensuring zero unnecessary dependencies, deterministic formatting, elimination of code smells, and strict avoidance of speculative architecture or app dependencies.

---

## 4. Dataset Architecture & Template Families

A total of 12 structurally distinct HTML template families were authored independently. To prevent benchmark leakage and adhere to ROADMAP.txt guidelines, families are partitioned into three strictly disjoint splits (`dev`, `validation`, and `reserved-final`).

> [!IMPORTANT]
> **Dataset Distinction Note**: These 12 families represent independently authored layouts. Repeated generated variations are NOT equated with independently authored templates, and no claim of 200 templates is made.

| Family ID | Family Name | Modality Support | Split | Evaluation Status | Description & Key Elements |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `fam_contact_form` | Standard Contact Form | Supported (`true`) | `dev` | `DEV_ACTIVE` | Semantic contact form with name, email, phone, message fields. |
| `fam_reimbursement_card` | Reimbursement Card | Supported (`true`) | `dev` | `DEV_ACTIVE` | Flexbox card layout with employee ID, bank account, expense amount. |
| `fam_user_directory_table` | User Directory Table | Supported (`true`) | `dev` | `DEV_ACTIVE` | Multi-row table of personnel records with names, emails, phones, departments. |
| `fam_negative_public_blog` | Public Documentation Article | Supported (`true`) | `dev` | `DEV_ACTIVE` | Negative example containing zero PII or private secrets (tests false-positive resistance). |
| `fam_contextual_name_address` | Billing & Shipping Address Form | Supported (`true`) | `dev` | `DEV_ACTIVE` | Contextual address fieldsets requiring context-aware semantic extraction. |
| `fam_tooltips_hidden_attrs` | Attributes & Tooltips | Supported (`true`) | `dev` | `DEV_ACTIVE` | Secrets placed in `title` tooltips, `data-*` attributes, and `<input type="hidden">`. |
| `fam_duplicate_replaced_targets` | Duplicate & Replaced Targets | Supported (`true`) | `dev` | `DEV_ACTIVE` | Active vs. archived modal containers with identical field names/IDs. |
| `fam_private_url_parameters` | Private URL Parameters | Supported (`true`) | `validation` | `VALIDATION_ACTIVE` | Links carrying sensitive tokens (`token=...`) and emails in query strings. |
| `fam_dynamic_dom_insertion` | Dynamic DOM Insertion | Supported (`true`) | `validation` | `VALIDATION_ACTIVE` | Client-side script mutating DOM to insert confidential passphrase and contact info. |
| `fam_unsupported_canvas` | Canvas Text Rendering | Unsupported (`false`) | `reserved-final` | `RESERVED_NOT_EVALUATED` | Financial routing and account text rendered directly onto HTML5 2D canvas surface. |
| `fam_unsupported_iframe` | Sandboxed Cross-Origin Iframe | Unsupported (`false`) | `reserved-final` | `RESERVED_NOT_EVALUATED` | Subframe with restricted sandbox embedding external checkout vault. |
| `fam_order_receipt_mixed` | Order Confirmation Receipt | Supported (`true`) | `reserved-final` | `RESERVED_NOT_EVALUATED` | Mixed receipt with sensitive customer info and public line item catalog data. |

### Disjoint Split Allocation
- **dev** (7 families, 58.3%): `fam_contact_form`, `fam_reimbursement_card`, `fam_user_directory_table`, `fam_negative_public_blog`, `fam_contextual_name_address`, `fam_tooltips_hidden_attrs`, `fam_duplicate_replaced_targets`.
- **validation** (2 families, 16.7%): `fam_private_url_parameters`, `fam_dynamic_dom_insertion`.
- **reserved-final** (3 families, 25.0%): `fam_unsupported_canvas`, `fam_unsupported_iframe`, `fam_order_receipt_mixed`.

> [!NOTE]
> **Reserved Split Status**: The `reserved-final` split is explicitly tagged as `RESERVED, NOT EVALUATED; no app benchmark exists`. No benchmark scores or baseline measurements have been simulated or fabricated.

### Synthetic Data Guarantee
All sensitive seed values use synthetic placeholders:
- Email addresses strictly utilize the RFC 2606 / RFC 6761 reserved domain `.test` (e.g., `alex.mercer@example.test`, `devon.reed@example.test`, `pat.quinn@example.test`).
- Phone numbers utilize the fictional 555-01xx exchange.
- Identifiers use synthetic prefixes (e.g., `SYNTH-EMP-9821`, `SYNTH-AUTH-TOKEN-7788`, `SYNTH-KEY-9933XYZ`).
- No live credentials, real personal data, or external resources are included.

---

## 5. Manifest Generator (`scripts/fixture_manifest.py`)
A deterministic manifest generation script was implemented using only the Python standard library (`hashlib`, `json`, `os`, `sys`, `pathlib`, `argparse`).
- Computes SHA-256 digests for all template HTML and ground truth JSON files.
- Formats JSON deterministically with sorted keys, 2-space indentation, and trailing newline.
- Provides a `--check` flag to ensure on-disk manifest files match live calculations bit-for-bit.
- Records provenance, license (`Apache-2.0`), synthetic status, family metadata, and target annotations.

---

## 6. Verification Checks & Test Results

### EXECUTED Checks
1. **Manifest Generation & Verification**:
   ```bash
   python3 scripts/fixture_manifest.py
   python3 scripts/fixture_manifest.py --check
   ```
   *Result*: `Manifest check passed: bit-for-bit identical.` (Exit code: 0)

2. **Automated Unit Test Suite (`tests/test_fixture_manifest.py`)**:
   ```bash
   python3 -m unittest discover tests
   ```
   *Output*:
   ```text
   ........
   ----------------------------------------------------------------------
   Ran 8 tests in 0.011s

   OK
   ```
   *Verified Test Seams*:
   - `test_manifest_file_exists`: Verified manifest existence at `fixtures/manifest.json`.
   - `test_manifest_metadata_and_provenance`: Verified version, provenance, license, and synthetic flags.
   - `test_minimum_twelve_distinct_template_families`: Verified 12 unique family IDs exist.
   - `test_disjoint_family_split_separation`: Verified dev, validation, and reserved-final splits are pairwise disjoint; verified all reserved-final fixtures have status `RESERVED_NOT_EVALUATED`.
   - `test_referenced_files_exist_and_hashes_match`: Verified 100% of referenced HTML and JSON files exist and match their declared SHA-256 hashes.
   - `test_hash_reproducibility`: Verified in-memory generation produces identical content to disk.
   - `test_synthetic_integrity`: Verified all email domains end in `.test` or `.example`.
   - `test_independent_expected_labels`: Verified negative example has 0 seeds/targets; verified unsupported fixtures carry explicit explanatory support notes; verified all target values exist in seeds and all target selectors/tokens resolve in corresponding HTML markup.

### STATIC_INSPECTION Checks
- Inspected HTML markup across all 12 families to ensure valid HTML5 semantic syntax.
- Inspected ground truth JSON files to confirm category schemas (`PERSON_NAME`, `EMAIL_ADDRESS`, `PHONE_NUMBER`, `IDENTIFIER_EMPLOYEE`, `FINANCIAL_ACCOUNT`, `STREET_ADDRESS`, `CITY`, `POSTAL_CODE`, `AUTHENTICATION_TOKEN`, `PIN_CODE`, `RESET_TOKEN`, `API_KEY`, `CREDENTIAL_PASSPHRASE`, `BANK_ROUTING_NUMBER`, `VAULT_TOKEN`, `PAYMENT_CARD_LAST4`).

### NOT_RUN Checks
- **Browser extension content script execution**: NOT RUN. The Chrome extension application repository is not in this staging directory and its location is still needed from the user.
- **Model evaluation / benchmark pipeline**: NOT RUN. No application benchmark exists yet. The final split is reserved.

---

## 7. Exact Files Changed / Created
The following files were created in accordance with ownership boundaries:

- `fixtures/fam_01_contact_form/template.html`
- `fixtures/fam_01_contact_form/ground_truth.json`
- `fixtures/fam_02_reimbursement_card/template.html`
- `fixtures/fam_02_reimbursement_card/ground_truth.json`
- `fixtures/fam_03_user_directory_table/template.html`
- `fixtures/fam_03_user_directory_table/ground_truth.json`
- `fixtures/fam_04_negative_public_blog/template.html`
- `fixtures/fam_04_negative_public_blog/ground_truth.json`
- `fixtures/fam_05_contextual_name_address/template.html`
- `fixtures/fam_05_contextual_name_address/ground_truth.json`
- `fixtures/fam_06_tooltips_hidden_attrs/template.html`
- `fixtures/fam_06_tooltips_hidden_attrs/ground_truth.json`
- `fixtures/fam_07_duplicate_replaced_targets/template.html`
- `fixtures/fam_07_duplicate_replaced_targets/ground_truth.json`
- `fixtures/fam_08_private_url_parameters/template.html`
- `fixtures/fam_08_private_url_parameters/ground_truth.json`
- `fixtures/fam_09_dynamic_dom_insertion/template.html`
- `fixtures/fam_09_dynamic_dom_insertion/ground_truth.json`
- `fixtures/fam_10_unsupported_canvas/template.html`
- `fixtures/fam_10_unsupported_canvas/ground_truth.json`
- `fixtures/fam_11_unsupported_iframe/template.html`
- `fixtures/fam_11_unsupported_iframe/ground_truth.json`
- `fixtures/fam_12_order_receipt_mixed/template.html`
- `fixtures/fam_12_order_receipt_mixed/ground_truth.json`
- `fixtures/manifest.json`
- `scripts/__init__.py`
- `scripts/fixture_manifest.py`
- `tests/__init__.py`
- `tests/test_fixture_manifest.py`
- `docs/implementation/FIXTURE_REPORT.md`

No modifications were made to `AGENTS.md`, `delegation/AG-001.md`, or `spec/ROADMAP.txt`.

---

## 8. Unresolved Issues & Remaining Work
1. **Application Repository Location**: This workspace is an integration-preparation staging workspace. The primary application repository containing the browser extension has not been linked or audited.
2. **OCR Integration for Unsupported Canvas Modalities**: Canvas pixel text in `fam_unsupported_canvas` cannot be extracted by DOM-based sanitizers. When OCR is integrated into GhostMask, visual mask bounding boxes will need coordinate calibration against rendered viewport screenshots.
3. **Cross-Origin Iframe Permission Policy**: Inaccessible sandboxed iframes (`fam_unsupported_iframe`) fail closed under same-origin policy. Content script injection or background network interception rules must be evaluated once extension architecture is connected.
4. **Scale Beyond Initial Staged Families**: ROADMAP.txt proposes approximately 200 independently authored templates for full development. The staged dataset establishes the initial 12 canonical template families and deterministic validation scaffolding; scaling to 200 will require authoring additional independent families without conflating repeated variants with independent templates.
5. **No App Benchmark Claim**: The final split remains strictly `RESERVED, NOT EVALUATED`. No benchmark numbers or recall scores should be reported until the real application is integrated and evaluated.
