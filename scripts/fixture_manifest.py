#!/usr/bin/env python3
"""
scripts/fixture_manifest.py

Deterministic fixture manifest generator for GhostMask staged synthetic HTML fixtures.
Uses Python standard library only.
Calculates SHA-256 hashes, indexes families, assigns disjoint dev/validation/reserved-final splits,
and outputs deterministic manifest JSON.
"""

import argparse
import hashlib
import json
import os
import sys
from pathlib import Path
from typing import Dict, Any, List


def compute_sha256(filepath: Path) -> str:
    """Compute deterministic SHA-256 hex digest of a file."""
    hasher = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            hasher.update(chunk)
    return hasher.hexdigest()


def build_manifest_dict(repo_root: Path) -> Dict[str, Any]:
    """
    Scan fixtures directory and build deterministic manifest data structure.
    """
    fixtures_dir = repo_root / "fixtures"
    if not fixtures_dir.exists():
        raise FileNotFoundError(f"Fixtures directory not found: {fixtures_dir}")

    # Discover family directories
    family_dirs = sorted([
        d for d in fixtures_dir.iterdir()
        if d.is_dir() and d.name.startswith("fam_")
    ], key=lambda d: d.name)

    families_map: Dict[str, Dict[str, Any]] = {}
    fixtures_list: List[Dict[str, Any]] = []

    for fam_dir in family_dirs:
        gt_file = fam_dir / "ground_truth.json"
        html_file = fam_dir / "template.html"

        if not gt_file.exists():
            raise FileNotFoundError(f"Missing ground_truth.json in {fam_dir}")
        if not html_file.exists():
            raise FileNotFoundError(f"Missing template.html in {fam_dir}")

        with open(gt_file, "r", encoding="utf-8") as f:
            gt_data = json.load(f)

        fam_id = gt_data["family_id"]
        fix_id = gt_data["fixture_id"]
        split = gt_data["split"]

        # Ensure reserved-final is labeled RESERVED_NOT_EVALUATED
        eval_status = "RESERVED_NOT_EVALUATED" if split == "reserved-final" else gt_data.get("evaluation_status", f"{split.upper()}_ACTIVE")

        # Track family definition
        if fam_id not in families_map:
            families_map[fam_id] = {
                "family_id": fam_id,
                "name": gt_data.get("name", fam_id),
                "split": split,
                "evaluation_status": eval_status,
                "supported": gt_data.get("supported", True),
                "support_notes": gt_data.get("support_notes", ""),
            }

        # Calculate relative paths and hashes
        html_rel = html_file.relative_to(repo_root).as_posix()
        gt_rel = gt_file.relative_to(repo_root).as_posix()

        html_hash = compute_sha256(html_file)
        gt_hash = compute_sha256(gt_file)

        fixtures_list.append({
            "fixture_id": fix_id,
            "family_id": fam_id,
            "split": split,
            "evaluation_status": eval_status,
            "supported": gt_data.get("supported", True),
            "support_notes": gt_data.get("support_notes", ""),
            "html_path": html_rel,
            "html_sha256": html_hash,
            "ground_truth_path": gt_rel,
            "ground_truth_sha256": gt_hash,
            "seeds": gt_data.get("seeds", []),
            "categories": sorted(gt_data.get("categories", [])),
            "targets": gt_data.get("targets", []),
        })

    # Sort families and fixtures deterministically
    sorted_families = [families_map[k] for k in sorted(families_map.keys())]
    sorted_fixtures = sorted(fixtures_list, key=lambda x: x["fixture_id"])

    manifest = {
        "version": "1.0.1",
        "provenance": "GhostMask Staging Synthetic Fixture Dataset. Authored for privacy boundary evaluation.",
        "license": "UNLICENSED - private project; no public licence selected",
        "is_synthetic": True,
        "created_date": "2026-11-24",
        "annotation_method": "Agent-authored synthetic seeds and selectors; not independent human review",
        "synthetic_data_status": "STAGED_SYNTHETIC_DATA_ONLY",
        "reserved_split_status": "RESERVED, NOT EVALUATED; no app benchmark exists",
        "families": sorted_families,
        "fixtures": sorted_fixtures,
    }

    return manifest


def generate_manifest_json(repo_root: Path) -> str:
    """Generate deterministic JSON string for manifest."""
    manifest_dict = build_manifest_dict(repo_root)
    # Deterministic formatting: 2 spaces indent, sort_keys=True, trailing newline
    return json.dumps(manifest_dict, indent=2, sort_keys=True) + "\n"


def main():
    parser = argparse.ArgumentParser(description="Generate or verify GhostMask fixture manifest.")
    parser.add_argument(
        "--repo-root",
        type=Path,
        default=Path(__file__).resolve().parent.parent,
        help="Path to repository root",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=None,
        help="Output manifest path (default: fixtures/manifest.json)",
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="Verify manifest against disk without writing",
    )
    args = parser.parse_args()

    repo_root = args.repo_root.resolve()
    output_path = (args.output or (repo_root / "fixtures" / "manifest.json")).resolve()

    manifest_content = generate_manifest_json(repo_root)

    if args.check:
        if not output_path.exists():
            sys.stderr.write(f"Check failed: {output_path} does not exist.\n")
            sys.exit(1)
        with open(output_path, "r", encoding="utf-8") as f:
            disk_content = f.read()
        if disk_content != manifest_content:
            sys.stderr.write(f"Check failed: {output_path} differs from generated manifest.\n")
            sys.exit(1)
        print("Manifest check passed: bit-for-bit identical.")
    else:
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(manifest_content)
        print(f"Manifest written successfully to {output_path}")


if __name__ == "__main__":
    main()
