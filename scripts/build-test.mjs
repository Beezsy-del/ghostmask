import { build } from "esbuild";
import { mkdir, cp, readFile, writeFile } from "node:fs/promises";
await mkdir("output/test-extension", { recursive: true });
await cp("dist", "output/test-extension", { recursive: true });
const manifest = JSON.parse(await readFile("dist/manifest.json", "utf8"));
manifest.host_permissions = ["<all_urls>"];
// Test-only broad capture permission replaces toolbar activeTab gesture in automation.
await writeFile(
  "output/test-extension/manifest.json",
  JSON.stringify(manifest),
);
await build({
  stdin: {
    contents:
      "import{Session}from'./src/session.ts';import{ChromeBrowser}from'./src/browser.ts';import{sanitizeImage}from'./src/sanitizer.ts';Object.assign(globalThis,{Session,ChromeBrowser,sanitizeImage});",
    resolveDir: process.cwd(),
  },
  outfile: "output/test-extension/harness.js",
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "chrome116",
});
await writeFile(
  "output/test-extension/harness.html",
  '<!doctype html><title>GhostMask test harness (not shipped)</title><script type="module" src="harness.js"></script>',
);
