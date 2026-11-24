import { test, expect, chromium } from "@playwright/test";
import { resolve } from "node:path";
import { PNG } from "pngjs";
import { readFile, writeFile, mkdir } from "node:fs/promises";
test("actual extension capture, sanitized request, scoped insertion and dynamic invalidation", async () => {
  const ext = resolve("output/test-extension");
  const context = await chromium.launchPersistentContext("", {
    channel: "chromium",
    headless: true,
    args: [`--disable-extensions-except=${ext}`, `--load-extension=${ext}`],
  });
  try {
    let worker = context.serviceWorkers()[0];
    if (!worker) worker = await context.waitForEvent("serviceworker");
    const id = new URL(worker.url()).host;
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:4173");
    await page.bringToFront();
    const tabId = await worker.evaluate(async () => {
      const tabs = await chrome.tabs.query({});
      return tabs.find((t) => t.url === "http://127.0.0.1:4173/")!.id!;
    });
    const opened = context.waitForEvent("page");
    await worker.evaluate(async (url) => {
      await chrome.windows.create({
        url,
        type: "popup",
        width: 800,
        height: 800,
      });
    }, `chrome-extension://${id}/harness.html`);
    const harness = await opened;
    await harness.waitForFunction(() => !!(globalThis as any).Session);
    // The actual fetch route is intercepted at the browser network boundary, not inside the gateway.
    let outbound = "";
    let count = 0;
    if (process.env.GHOSTMASK_REAL_MODEL === "1")
      context.on("request", (request) => {
        if (request.url() === "http://127.0.0.1:11434/api/chat") {
          count++;
          outbound = request.postData()!;
        }
      });
    else
      await context.route("http://127.0.0.1:11434/api/chat", async (route) => {
        count++;
        outbound = route.request().postData()!;
        const payload = JSON.parse(JSON.parse(outbound).messages[1].content);
        await route.fulfill({
          status: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
          contentType: "application/json",
          body: JSON.stringify({
            message: {
              content: JSON.stringify(
                payload.grants[0]
                  ? { type: "insert", ...payload.grants[0] }
                  : { type: "stop" },
              ),
            },
          }),
        });
      });
    await page.bringToFront();
    const captured = await harness.evaluate(async (tab) => {
      const w = globalThis as any;
      w.session = new w.Session(new w.ChromeBrowser(), tab, "ollama", [
        "contact",
      ]);
      return await w.session.capture();
    }, tabId);
    expect(captured.fields.length).toBe(3);
    const png = PNG.sync.read(
      Buffer.from(captured.image.split(",")[1], "base64"),
    );
    for (let i = 0; i < png.data.length; i += 4) {
      if (
        png.data[i] !== 24 ||
        png.data[i + 1] !== 34 ||
        png.data[i + 2] !== 47 ||
        png.data[i + 3] !== 255
      )
        throw new Error("Unmasked output pixel");
    }
    await harness.evaluate(async () => {
      const s = (globalThis as any).session;
      await s.approve("field-2", "approved@example.test");
      s.review(s.view().payloadId);
      await s.propose();
    });
    expect(count).toBe(1);
    for (const seed of [
      "Taylor Example",
      "SYNTH-PRIVATE-NOTE-44",
      "taylor@example.test",
      "approved@example.test",
      "127.0.0.1:4173",
    ])
      expect(outbound).not.toContain(seed);
    await harness.evaluate(async () => {
      await (globalThis as any).session.execute();
    });
    await expect(page.locator("[name=email]")).toHaveValue(
      "approved@example.test",
    );
    const receipts = await harness.evaluate(() =>
      (globalThis as any).session.receipts(),
    );
    expect(receipts.some((r: any) => r.event === "verified")).toBeTruthy();
    await page.locator("#dynamic").click();
    const blocked = await harness.evaluate(async () => {
      const s = (globalThis as any).session;
      s.review(s.view().payloadId);
      try {
        await s.propose();
        return "";
      } catch (e) {
        return (e as Error).message;
      }
    });
    expect(blocked).toBe("STALE_CAPTURE");
    expect(count).toBe(1);
    await harness.evaluate(async () => {
      const s = (globalThis as any).session;
      s.resume();
      await s.capture();
    });
    const view = await harness.evaluate(() =>
      (globalThis as any).session.view(),
    );
    expect(view.payload).not.toContain("SYNTH-DYNAMIC-99");
    expect(view.payload).not.toContain("approved@example.test");
    // Actual runtime sanitizer failure before a network call.
    const failed = await harness.evaluate(async (tab) => {
      const w = globalThis as any;
      const s = new w.Session(
        new w.ChromeBrowser(),
        tab,
        "ollama",
        ["contact"],
        async () => {
          throw new Error("SYNTH-ERROR-SECRET");
        },
      );
      try {
        await s.capture();
      } catch {}
      try {
        await s.propose();
      } catch {}
      return s.receipts();
    }, tabId);
    expect(count).toBe(1);
    expect(JSON.stringify(failed)).not.toContain("SYNTH-ERROR-SECRET");
    await mkdir("output/playwright", { recursive: true });
    await writeFile("output/playwright/actual-outbound.json", outbound);
    await writeFile(
      "output/playwright/receipts.json",
      JSON.stringify(receipts, null, 2),
    );
  } finally {
    await context.close();
  }
});
