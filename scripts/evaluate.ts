import { readFile, writeFile, mkdir } from "node:fs/promises";
import { detect } from "../src/sanitizer.ts";
const manifest = JSON.parse(await readFile("fixtures/manifest.json", "utf8"));
const samples = manifest.fixtures
  .filter((f: any) => f.split !== "reserved-final")
  .flatMap((f: any) =>
    f.seeds.map((seed: string) => ({
      family: f.family_id,
      detected: detect(seed).length > 0,
    })),
  );
const negatives = [
  "Welcome to our public documentation.",
  "Version 2 is available.",
  "The total is 42 units.",
  "Open Monday through Friday.",
];
const report = {
  scope:
    "Development/validation seed-string coverage only, NOT page privacy recall, not image detection",
  samples: samples.length,
  detected: samples.filter((s: any) => s.detected).length,
  missed: samples.filter((s: any) => !s.detected).length,
  negativeSamples: negatives.length,
  falsePositives: negatives.filter((s) => detect(s).length > 0).length,
  auc: null,
  reason:
    "No calibrated scoring model; do not invent ROC-AUC from a binary rule decision",
  stageA: "Rules measured",
  stageB: "NOT IMPLEMENTED: pretrained local detector",
  stageC: "NOT IMPLEMENTED: contextual classifier",
  stageD: "NOT JUSTIFIED: obtain independent labels and error review first",
  familyResults: samples,
};
await mkdir("output/evaluation", { recursive: true });
await writeFile(
  "output/evaluation/rules.json",
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify({ ...report, familyResults: undefined }, null, 2));
