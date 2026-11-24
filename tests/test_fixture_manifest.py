"""
Unit tests for GhostMask synthetic fixture manifest and dataset integrity.
Validates hash reproducibility, disjoint family split separation, file existence,
synthetic data compliance, and ground-truth selector alignment.
"""

import hashlib
import json
import os
import unittest
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parent.parent
FIXTURES_DIR = REPO_ROOT / "fixtures"
MANIFEST_PATH = FIXTURES_DIR / "manifest.json"


def sha256_file(filepath: Path) -> str:
    hasher = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()


class TestGhostMaskFixtureManifest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # We also import the manifest generator module
        import sys
        sys.path.insert(0, str(REPO_ROOT))
        import scripts.fixture_manifest as fm
        cls.fm = fm

    def test_manifest_file_exists(self):
        self.assertTrue(
            MANIFEST_PATH.exists(),
            f"Manifest file not found at {MANIFEST_PATH}",
        )

    def test_manifest_metadata_and_provenance(self):
        with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)

        self.assertIn("version", data)
        self.assertIn("provenance", data)
        self.assertIn("license", data)
        self.assertEqual(data.get("is_synthetic"), True)
        self.assertEqual(data.get("synthetic_data_status"), "STAGED_SYNTHETIC_DATA_ONLY")
        self.assertIn("families", data)
        self.assertIn("fixtures", data)

    def test_minimum_twelve_distinct_template_families(self):
        with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)

        families = data.get("families", [])
        self.assertGreaterEqual(
            len(families),
            12,
            f"Expected at least 12 distinct template families, found {len(families)}",
        )

        family_ids = [f["family_id"] for f in families]
        self.assertEqual(
            len(family_ids),
            len(set(family_ids)),
            "Family IDs must be unique.",
        )

    def test_disjoint_family_split_separation(self):
        with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)

        families = data.get("families", [])
        split_map = {}
        splits = {"dev": set(), "validation": set(), "reserved-final": set()}

        for fam in families:
            fid = fam["family_id"]
            split = fam["split"]
            self.assertIn(
                split,
                splits,
                f"Invalid split '{split}' for family {fid}",
            )
            splits[split].add(fid)
            split_map[fid] = split

        # Ensure splits are strictly disjoint
        self.assertTrue(splits["dev"].isdisjoint(splits["validation"]))
        self.assertTrue(splits["dev"].isdisjoint(splits["reserved-final"]))
        self.assertTrue(splits["validation"].isdisjoint(splits["reserved-final"]))

        # Ensure all fixtures preserve the family's split assignment
        for fix in data.get("fixtures", []):
            fid = fix["family_id"]
            self.assertIn(fid, split_map)
            self.assertEqual(
                fix["split"],
                split_map[fid],
                f"Fixture {fix['fixture_id']} split does not match family {fid} split",
            )

            # Ensure reserved-final split is explicitly labeled RESERVED_NOT_EVALUATED
            if fix["split"] == "reserved-final":
                self.assertEqual(
                    fix.get("evaluation_status"),
                    "RESERVED_NOT_EVALUATED",
                    f"Fixture {fix['fixture_id']} in reserved-final must have evaluation_status RESERVED_NOT_EVALUATED",
                )

    def test_referenced_files_exist_and_hashes_match(self):
        with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)

        for fix in data.get("fixtures", []):
            fix_id = fix["fixture_id"]
            html_rel = fix["html_path"]
            gt_rel = fix["ground_truth_path"]

            html_full = REPO_ROOT / html_rel
            gt_full = REPO_ROOT / gt_rel

            self.assertTrue(
                html_full.exists(),
                f"Fixture {fix_id} HTML file missing: {html_full}",
            )
            self.assertTrue(
                gt_full.exists(),
                f"Fixture {fix_id} Ground truth file missing: {gt_full}",
            )

            # Check hashes
            computed_html_hash = sha256_file(html_full)
            self.assertEqual(
                computed_html_hash,
                fix["html_sha256"],
                f"HTML SHA256 mismatch for {fix_id}",
            )

            computed_gt_hash = sha256_file(gt_full)
            self.assertEqual(
                computed_gt_hash,
                fix["ground_truth_sha256"],
                f"Ground truth SHA256 mismatch for {fix_id}",
            )

    def test_hash_reproducibility(self):
        # Generate manifest in-memory using scripts/fixture_manifest.py and verify byte-for-byte match
        generated_manifest_str = self.fm.generate_manifest_json(REPO_ROOT)
        with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
            disk_manifest_str = f.read()

        self.assertEqual(
            generated_manifest_str.strip(),
            disk_manifest_str.strip(),
            "Manifest generator output differs from disk manifest.json",
        )

    def test_synthetic_integrity(self):
        with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)

        for fix in data.get("fixtures", []):
            seeds = fix.get("seeds", [])
            for seed in seeds:
                # If seed contains an email address, verify it uses .test TLD
                if "@" in seed:
                    domain = seed.split("@")[-1]
                    self.assertTrue(
                        domain.endswith(".test") or domain.endswith(".example"),
                        f"Non-synthetic email domain found in seed: {seed}",
                    )

    def test_independent_expected_labels(self):
        with open(MANIFEST_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)

        for fix in data.get("fixtures", []):
            fix_id = fix["fixture_id"]
            fam_id = fix["family_id"]
            targets = fix.get("targets", [])
            seeds = fix.get("seeds", [])
            supported = fix.get("supported")

            # Check negative example
            if fam_id == "fam_negative_public_blog":
                self.assertEqual(len(seeds), 0, f"Negative example {fix_id} should have 0 sensitive seeds")
                self.assertEqual(len(targets), 0, f"Negative example {fix_id} should have 0 targets")
                self.assertTrue(supported)
            elif not supported:
                # Unsupported modal fixtures (e.g. canvas, iframe)
                self.assertIn("support_notes", fix)
                self.assertGreater(len(fix["support_notes"]), 0)
                self.assertGreater(len(seeds), 0)
            else:
                # Regular supported fixtures
                self.assertGreater(len(seeds), 0, f"Fixture {fix_id} missing ground truth seeds")
                self.assertGreater(len(targets), 0, f"Fixture {fix_id} missing ground truth targets")

                html_path = REPO_ROOT / fix["html_path"]
                with open(html_path, "r", encoding="utf-8") as hf:
                    html_content = hf.read()

                for tgt in targets:
                    self.assertIn("selector", tgt)
                    self.assertIn("category", tgt)
                    self.assertIn("value", tgt)
                    self.assertIn(
                        tgt["value"],
                        seeds,
                        f"Target value '{tgt['value']}' not listed in seeds for {fix_id}",
                    )

                    # Verify selector components exist in HTML
                    for token in tgt["selector"].split():
                        if token.startswith("#"):
                            self.assertIn(
                                token[1:],
                                html_content,
                                f"Selector ID {token} not found in HTML for {fix_id}",
                            )
                        elif token.startswith("."):
                            self.assertIn(
                                token[1:],
                                html_content,
                                f"Selector class {token} not found in HTML for {fix_id}",
                            )


if __name__ == "__main__":
    unittest.main()
