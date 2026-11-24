import { test, expect, chromium } from "@playwright/test";
import { resolve } from "node:path";
import { PNG } from "pngjs";
test("reviewed capture runs packaged OCR, preserves public pixels, masks secrets and exports only after review", async () => {
  const ext = resolve("output/test-extension");
  const context = await chromium.launchPersistentContext("", {
    channel: "chromium",
    headless: true,
    args: [`--disable-extensions-except=${ext}`, `--load-extension=${ext}`],
  });
  const requests:{url:string;body:string}[]=[];
  context.on('request',r=>requests.push({url:r.url(),body:r.postData()??''}));
  try {
    let worker =
      context.serviceWorkers()[0] ??
      (await context.waitForEvent("serviceworker"));
    const id = new URL(worker.url()).host;
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:4173");
    await page.evaluate(() => {
      document.body.innerHTML =
        '<h1>Public refund policy</h1><p>Returns accepted within 14 days.</p><p>Contact: seed@example.test</p><input name="email" value="hidden@example.test"><p>hidden@example.test</p>';
    });
    const tab = await worker.evaluate(
      async () =>
        (await chrome.tabs.query({})).find(
          (t) => t.url === "http://127.0.0.1:4173/",
        )!.id!,
    );
    const opened = context.waitForEvent("page");
    await worker.evaluate(async (url) => {
      await chrome.windows.create({ url, type: "popup" });
    }, `chrome-extension://${id}/harness.html`);
    const harness = await opened;
    await harness.waitForFunction(() => !!(globalThis as any).Session);
    await page.bringToFront();
    const result = await harness.evaluate(
      async ({ tab, real }) => {
        const w = globalThis as any;
        w.s = new w.Session(
          new w.ChromeBrowser(),
          tab,
          real ? "ollama" : "simulator",
          ["contact"],
          undefined,
          undefined,
          { profile: "reviewed", ocr: true, purpose: "summarize-page" },
        );
        await w.s.capture();
        const v = w.s.view();
        let blocked = false;
        try {
          await w.s.exportArtifacts(v.payloadId);
        } catch {
          blocked = true;
        }
        w.s.resume();
        await w.s.capture();
        const fresh = w.s.view();
        w.s.review(fresh.payloadId);
        const exported = await w.s.exportArtifacts(fresh.payloadId);
        await w.s.propose();
        return { v, exported, blocked, after: w.s.view() };
      },
      { tab, real: process.env.GHOSTMASK_REAL_MODEL === "1" },
    );
    for(const request of requests){
      const url=new URL(request.url);
      if(url.protocol==='http:'||url.protocol==='https:')expect(url.hostname).toBe('127.0.0.1');
      if(url.port==='11434'){
        expect(request.body).not.toContain('seed@example.test');
        expect(request.body).not.toContain('hidden@example.test');
        expect(request.body).toContain('14 days');
      }
    }
    expect(result.blocked).toBe(true);
    expect(result.v.disclosure.ocrStatus).toBe("complete");
    expect(result.exported.text).toContain("14 days");
    expect(result.exported.text).not.toContain("seed@example.test");
    expect(result.exported.text).not.toContain("hidden@example.test");
    const png = PNG.sync.read(
      Buffer.from(result.exported.image.split(",")[1], "base64"),
    );
    let masked = 0,
      other = 0;
    for (let i = 0; i < png.data.length; i += 4) {
      if (
        png.data[i] === 24 &&
        png.data[i + 1] === 34 &&
        png.data[i + 2] === 47
      )
        masked++;
      else other++;
    }
    expect(masked).toBeGreaterThan(100);
    expect(other).toBeGreaterThan(100);
    expect(result.after.proposal.type).toBe("summary");
    for (const { rect } of result.v.disclosure.masks) {
      const sx = png.width / result.v.viewport.width,
        sy = png.height / result.v.viewport.height;
      for (
        let y = Math.max(0, Math.ceil(rect.y * sy));
        y < Math.min(png.height, Math.floor((rect.y + rect.height) * sy));
        y++
      )
        for (
          let x = Math.max(0, Math.ceil(rect.x * sx));
          x < Math.min(png.width, Math.floor((rect.x + rect.width) * sx));
          x++
        ) {
          const i = (y * png.width + x) * 4;
          if (
            png.data[i] !== 24 ||
            png.data[i + 1] !== 34 ||
            png.data[i + 2] !== 47 ||
            png.data[i + 3] !== 255
          )
            throw new Error("Mask pixel mismatch");
        }
    }
    const manual = await harness.evaluate(async () => {
      const s = (globalThis as any).s;
      await s.configurePrivacy({ privateTerms: ["14 days"] });
      const v = s.view();
      return { v };
    });
    expect(manual.v.disclosure.text).not.toContain("14 days");
    expect(manual.v.payloadId).not.toBe(result.v.payloadId);
  } finally {
    await context.close();
  }
});
