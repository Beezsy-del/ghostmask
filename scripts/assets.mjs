import {
  mkdir,
  copyFile,
  readdir,
  readFile,
  writeFile,
} from "node:fs/promises";
import { createHash } from "node:crypto";
export async function installAssets() {
  const base = "dist/vendor/ocr";
  await mkdir(base + "/core", { recursive: true });
  await mkdir(base + "/lang", { recursive: true });
  const files = [
    ["node_modules/tesseract.js/dist/worker.min.js", base + "/worker.min.js"],
    [
      "node_modules/@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz",
      base + "/lang/eng.traineddata.gz",
    ],
    ["node_modules/tesseract.js-core/LICENSE", base + "/core/LICENSE"],
    ["node_modules/tesseract.js/LICENSE.md", base + "/LICENSE"],
  ];
  for (const name of await readdir("node_modules/tesseract.js-core"))
    if (name.endsWith(".wasm") || name.endsWith(".wasm.js"))
      files.push([
        "node_modules/tesseract.js-core/" + name,
        base + "/core/" + name,
      ]);
  const manifest = [];
  for (const [src, dst] of files) {
    await copyFile(src, dst);
    manifest.push({
      path: dst,
      sha256: createHash("sha256")
        .update(await readFile(dst))
        .digest("hex"),
    });
  }
  await writeFile(
    base + "/ASSETS.json",
    JSON.stringify(
      {
        packages: {
          "tesseract.js": "7.0.0",
          "@tesseract.js-data/eng": "1.0.0",
        },
        source:
          "Pinned npm packages in package-lock.json. English traineddata packaged locally; no runtime CDN.",
        files: manifest,
      },
      null,
      2,
    ),
  );
}
