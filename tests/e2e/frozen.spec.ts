import { test, expect, chromium } from "@playwright/test";
import { resolve } from "node:path";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { PNG } from "pngjs";
test("frozen finite-scope seed and pixel evaluation", async () => {
  test.skip(
    process.env.GHOSTMASK_FINAL !== "1",
    "Run explicitly only after implementation freeze",
  );
  const manifest = JSON.parse(await readFile("fixtures/manifest.json", "utf8"));
  const fixtures = manifest.fixtures.filter(
    (f: any) => f.split === "reserved-final",
  );
  const ext = resolve("output/test-extension");
  const context = await chromium.launchPersistentContext("", {
    channel: "chromium",
    headless: true,
    args: [`--disable-extensions-except=${ext}`, `--load-extension=${ext}`],
  });
  const results: any[] = [];
  try {
    let worker = context.serviceWorkers()[0];
    if (!worker) worker = await context.waitForEvent("serviceworker");
    const id = new URL(worker.url()).host;
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:4173");
    const tabId = await worker.evaluate(async () => {
      const tabs = await chrome.tabs.query({});
      return tabs.find((t) => t.url === "http://127.0.0.1:4173/")!.id!;
    });
    const opened = context.waitForEvent("page");
    await worker.evaluate(async (url) => {
      await chrome.windows.create({ url, type: "popup" });
    }, `chrome-extension://${id}/harness.html`);
    const harness = await opened;
    await harness.waitForFunction(() => !!(globalThis as any).Session);
    let outbound = "";
    let count = 0;
    await context.route("http://127.0.0.1:11434/api/chat", async (route) => {
      count++;
      outbound = route.request().postData()!;
      await route.fulfill({
        status: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
        contentType: "application/json",
        body: JSON.stringify({ message: { content: '{"type":"stop"}' } }),
      });
    });
    for (const fixture of fixtures) {
      await page.goto(
        "http://127.0.0.1:4173/" + fixture.html_path.replace(/^fixtures\//, ""),
      );
      await page.bringToFront();
      const start = Date.now();
      const view = await harness.evaluate(async (tab) => {
        const w = globalThis as any;
        w.session?.abort();
        w.ghostmaskBrowser?.dispose();
        w.ghostmaskBrowser = new w.ChromeBrowser();
        w.session = new w.Session(w.ghostmaskBrowser, tab, "ollama");
        await w.session.capture();
        const view = w.session.view();
        w.session.review(view.payloadId);
        await w.session.propose();
        return view;
      }, tabId);
      const png = PNG.sync.read(
        Buffer.from(view.image.split(",")[1], "base64"),
      );
      let wrongPixels = 0;
      for (let i = 0; i < png.data.length; i += 4)
        if (
          png.data[i] !== 24 ||
          png.data[i + 1] !== 34 ||
          png.data[i + 2] !== 47 ||
          png.data[i + 3] !== 255
        )
          wrongPixels++;
      const leaked = fixture.seeds.filter((seed: string) =>
        [
          seed,
          encodeURIComponent(seed),
          Buffer.from(seed).toString("base64"),
        ].some((encoded) => outbound.includes(encoded)),
      );
      results.push({
        fixture: fixture.fixture_id,
        html_sha256: fixture.html_sha256,
        seedCount: fixture.seeds.length,
        seedLeaks: leaked.length,
        wrongPixels,
        pixels: png.width * png.height,
        elapsedMs: Date.now() - start,
        coverage:
          "all pixels suppressed; no raw text; no image sent to text-only provider",
        taskUtility: "not measured; no insertion grants in frozen fixtures",
      });
      expect(leaked).toEqual([]);
      expect(wrongPixels).toBe(0);
    }
    expect(count).toBe(fixtures.length);
    await mkdir("output/evaluation", { recursive: true });
    await writeFile(
      "output/evaluation/frozen.json",
      JSON.stringify(
        {
          date: new Date().toISOString(),
          requests: count,
          results,
          scope:
            "Three agent-authored templates, single Chromium viewport and scale, mocked model responses; full suppression not selective detection",
        },
        null,
        2,
      ),
    );
  } finally {
    await context.close();
  }
});
