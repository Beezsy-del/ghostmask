import { test, expect, chromium } from "@playwright/test";
import { resolve } from "node:path";
import { mkdir } from "node:fs/promises";
test("batch approval fills all selected fields in the real extension", async () => {
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
    const opened = context.waitForEvent("page");
    await worker.evaluate(async (url) => {
      await chrome.windows.create({
        url,
        type: "popup",
        width: 450,
        height: 900,
      });
    }, `chrome-extension://${id}/panel.html`);
    const panel = await opened;
    await panel.setViewportSize({ width: 390, height: 844 });
    await expect(panel.locator("#start")).toBeEnabled();
    await panel.locator("#profile").selectOption("strict");
    await panel.locator("#start").click();
    await page.bringToFront();
    await panel.locator("#capture").dispatchEvent("click");
    await expect(panel.locator("#status")).toContainText("Capture ready");
    await expect(panel.locator("#original")).toBeHidden();
    await expect(panel.locator("#target option")).toHaveCount(3);
    await expect(
      panel.locator('.batch-input[data-target="field-3"]'),
    ).toBeDisabled();
    await page.bringToFront();
    await panel.locator("#batch-autofill-btn").dispatchEvent("click");
    await expect(panel.locator("#status")).toContainText(
      "Fields approved locally",
    );
    await expect(panel.locator("#propose")).toBeDisabled();
    await panel.locator("#review").click();
    await panel.locator("#propose").click();
    await expect(panel.locator("#proposal")).toContainText("field-1, field-2");
    await page.bringToFront();
    await panel.locator("#execute").dispatchEvent("click");
    await expect(panel.locator("#status")).toContainText(
      "Insertion verified locally",
    );
    await expect(
      page.getByRole("textbox", { name: "Contact name", exact: true }),
    ).toHaveValue("Taylor Example");
    await expect(page.locator("[name=email]")).toHaveValue(
      "taylor@example.test",
    );
    await panel.locator("#pause").click();
    await expect(panel.locator("#state")).toHaveText("paused");
    for (const input of await panel.locator(".batch-input").all())
      await expect(input).toHaveValue("");
    await panel.locator("#resume").click();
    await expect(panel.locator("#capture")).toBeEnabled();
    await panel.locator("#abort").click();
    await expect(panel.locator("#state")).toHaveText("aborted");
    await expect(panel.locator("#payload")).toHaveValue("");
    await panel.locator("#clear").click();
    await expect(panel.locator("#receipts li")).toHaveCount(0);
    await mkdir("output/playwright", { recursive: true });
    await panel.screenshot({
      path: "output/playwright/batch-panel.png",
      fullPage: true,
    });
    expect(
      await panel.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBeTruthy();
  } finally {
    await context.close();
  }
});
