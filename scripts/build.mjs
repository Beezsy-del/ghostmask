import {installAssets} from "./assets.mjs";
import { build } from "esbuild";
import { mkdir, cp } from "node:fs/promises";
await mkdir("dist", { recursive: true });
await cp("extension", "dist", { recursive: true });
await build({
  entryPoints: ["src/panel.ts", "src/background.ts"],
  outdir: "dist",
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "chrome116",
  sourcemap: false,
});

await installAssets();
