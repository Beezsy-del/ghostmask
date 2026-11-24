import { test, expect, chromium } from "@playwright/test";
import { resolve } from "node:path";
import { PNG } from "pngjs";
async function setup() {
  const ext = resolve("output/test-extension");
  const context = await chromium.launchPersistentContext("", {
    channel: "chromium",
    headless: true,
    args: [`--disable-extensions-except=${ext}`, `--load-extension=${ext}`],
  });
  const worker =
    context.serviceWorkers()[0] ??
    (await context.waitForEvent("serviceworker"));
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4173");
  const tab = await worker.evaluate(
    async () =>
      (await chrome.tabs.query({})).find(
        (t) => t.url === "http://127.0.0.1:4173/",
      )!.id!,
  );
  const opened = context.waitForEvent("page");
  await worker.evaluate(
    async (url) => {
      await chrome.windows.create({ url, type: "popup" });
    },
    `chrome-extension://${new URL(worker.url()).host}/harness.html`,
  );
  const harness = await opened;
  await harness.waitForFunction(() => !!(globalThis as any).Session);
  return { context, page, harness, tab };
}
// Development regression cases. These are not a held-out detector benchmark.
const cases = [
  ...['auto','none'].map(pointer=>({
    name:`covered text with pointer-events ${pointer}`,
    html:`<div style="height:120px"><span class="secret">saffron-cedar-49</span></div><div style="position:absolute;left:0;top:0;width:800px;height:100px;background:white;z-index:20;pointer-events:${pointer}">Public cover</div>`,
    terms:[],forbidden:['saffron-cedar-49'],
  })),
  {
    name: "split protected phrase",
    html: '<span class="secret">SYNTH-</span><span class="secret">CREDENTIAL-</span><span class="secret">9081</span>',
    terms: ["SYNTH-CREDENTIAL-9081"],
    forbidden: ["CREDENTIAL-", "9081"],
  },
  {
    name: "separate password label",
    html: '<span>Password:</span><span class="secret">saffron-cedar-49</span>',
    terms: [],
    forbidden: ["saffron-cedar-49"],
  },
  {
    name: "hidden value repeated visibly",
    html: '<input type="hidden" value="orchid-copper-82"><span class="secret">orchid-copper-82</span>',
    terms: [],
    forbidden: ["orchid-copper-82"],
  },
  {
    name: "URL with private query",
    html: '<span class="secret">https://portal.example.test/?key=private-742</span>',
    terms: [],
    forbidden: ["private-742", "portal.example.test"],
  },
  {
    name: "encoded protected phrase",
    html: '<span class="secret">copper%20meadow</span>',
    terms: ["copper meadow"],
    forbidden: ["copper%20meadow"],
  },
  {
    name: "context-labelled identifier",
    html: '<span class="secret">Account: meadow-742</span>',
    terms: [],
    forbidden: ["meadow-742"],
  },
];
for (const c of cases)
  test(`selective text, actual request and secret pixels: ${c.name}`, async () => {
    const { context, page, harness, tab } = await setup();
    try {
      await page.evaluate((html) => {
        document.head.innerHTML =
          "<style>body{font:18px Arial;margin:32px;background:white;color:black}p{margin-top:30px}</style>";
        document.body.innerHTML =
          html + "<p>Returns accepted within 14 days.</p>";
      }, c.html);
      const truth = await page.locator(".secret").evaluateAll((els) =>
        els.map((el) => {
          const r = el.getBoundingClientRect();
          return { x: r.x, y: r.y, width: r.width, height: r.height };
        }),
      );
      let outbound = "";
      await context.route("http://127.0.0.1:11434/api/chat", async (route) => {
        outbound = route.request().postData() ?? "";
        await route.fulfill({
          contentType: "application/json",
          body: JSON.stringify({
            message: {
              content: JSON.stringify({
                type: "summary",
                text: "Returns accepted within 14 days.",
              }),
            },
          }),
        });
      });
      await page.bringToFront();
      const result = await harness.evaluate(
        async ({ tab, terms }) => {
          const w = globalThis as any;
          const s = new w.Session(
            new w.ChromeBrowser(),
            tab,
            "ollama",
            ["contact"],
            undefined,
            undefined,
            { profile: "reviewed", ocr: false, purpose: "summarize-page" },
          );
          await s.capture();
          if (terms.length) await s.configurePrivacy({ privateTerms: terms });
          const v = s.view();
          s.review(v.payloadId);
          const exported = await s.exportArtifacts(v.payloadId);
          await s.propose();
          return { exported, viewport: v.viewport };
        },
        { tab, terms: c.terms },
      );
      expect(outbound).toContain("14 days");
      expect(result.exported.text).toContain("14 days");
      for (const seed of c.forbidden) {
        expect(outbound).not.toContain(seed);
        expect(result.exported.text).not.toContain(seed);
        expect(result.exported.receipt).not.toContain(seed);
      }
      const png = PNG.sync.read(
        Buffer.from(result.exported.image.split(",")[1], "base64"),
      );
      let checked = 0;
      // Ground truth comes from the synthetic secret elements, not the detector's mask list.
      for (const r of truth)
        for (
          let y = Math.ceil((r.y * png.height) / result.viewport.height);
          y <
          Math.floor(((r.y + r.height) * png.height) / result.viewport.height);
          y++
        )
          for (
            let x = Math.ceil((r.x * png.width) / result.viewport.width);
            x <
            Math.floor(((r.x + r.width) * png.width) / result.viewport.width);
            x++
          ) {
            const i = (y * png.width + x) * 4;
            checked++;
            if (
              png.data[i] !== 24 ||
              png.data[i + 1] !== 34 ||
              png.data[i + 2] !== 47 ||
              png.data[i + 3] !== 255
            )
              throw new Error(
                "Seeded secret rectangle contains an unmasked pixel",
              );
          }
      expect(checked).toBeGreaterThan(20);
    } finally {
      await context.close();
    }
  });
test("missing OCR worker blocks model transmission and leaves no exportable payload", async () => {
  const { context, page, harness, tab } = await setup();
  try {
    await context.route("**/vendor/ocr/worker.min.js", (route) =>
      route.abort(),
    );
    let requests = 0;
    await context.route("http://127.0.0.1:11434/api/chat", async (route) => {
      requests++;
      await route.abort();
    });
    await page.bringToFront();
    const v = await harness.evaluate(async (tab) => {
      const w = globalThis as any;
      const s = new w.Session(
        new w.ChromeBrowser(),
        tab,
        "ollama",
        ["contact"],
        undefined,
        undefined,
        { profile: "reviewed", ocr: true },
      );
      try {
        await s.capture();
      } catch {}
      try {
        await s.propose();
      } catch {}
      return s.view();
    }, tab);
    expect(v.state).toBe("paused");
    expect(v.payload).toBe("");
    expect(requests).toBe(0);
  } finally {
    await context.close();
  }
});
