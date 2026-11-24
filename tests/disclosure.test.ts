import { test } from "node:test";
import assert from "node:assert/strict";
import { planDisclosure, defaultDisclosure } from "../src/disclosure.ts";
import type { Observation } from "../src/contracts.ts";
const o: Observation = {
  identity: {
    tabId: 1,
    windowId: 1,
    documentId: "d",
    origin: "https://example.test",
    generation: 1,
    urlKey: "hash",
    zoom: 1,
    viewport: { width: 800, height: 600, scrollX: 0, scrollY: 0, dpr: 1 },
  },
  capturedAt: 0,
  image: "",
  text: "",
  fields: [],
  masks: [],
  protectedMasks: [],
  unsupported: [],
  blocks: [
    {
      id: "a",
      text: "Returns accepted within 14 days.",
      rects: [{ x: 10, y: 10, width: 200, height: 20 }],
      excluded: false,
      context: "",
    },
    {
      id: "b",
      text: "ada@example.test",
      rects: [{ x: 10, y: 50, width: 200, height: 20 }],
      excluded: false,
      context: "",
    },
  ],
};
test("selective plan masks a secret while retaining useful public content", () => {
  const p = planDisclosure(o, { ...defaultDisclosure, profile: "reviewed" });
  assert.ok(p.text.includes("14 days"));
  assert.ok(!p.text.includes("ada@example.test"));
  assert.equal(p.maskedBlocks, 1);
  assert.ok(p.masks.some((m) => m.rect.y === 50));
});
test("manual drawn region suppresses text in the same region and validates coordinates", () => {
  const p = planDisclosure(o, {
    ...defaultDisclosure,
    profile: "reviewed",
    manualMasks: [{ x: 0, y: 0, width: 250, height: 40 }],
  });
  assert.ok(!p.text.includes("14 days"));
  assert.throws(() =>
    planDisclosure(o, {
      ...defaultDisclosure,
      profile: "reviewed",
      manualMasks: [{ x: NaN, y: 0, width: 1, height: 1 }],
    }),
  );
});
test("split-node email cannot leak through text blocks", () => {
  const split = {
    ...o,
    blocks: [
      { ...o.blocks![0], text: "ada" },
      { ...o.blocks![1], text: "@example.test" },
    ],
  };
  const p = planDisclosure(split, {
    ...defaultDisclosure,
    profile: "reviewed",
  });
  assert.ok(!p.text.includes("ada"));
  assert.ok(!p.text.includes("@example.test"));
  assert.equal(p.maskedBlocks, 2);
});
test("hidden field labels never create a second disclosure channel", () => {
  const obs = {
    ...o,
    fields: [
      {
        key: "f",
        kind: "text",
        category: "contact" as const,
        value: "",
        rect: { x: 0, y: 0, width: 10, height: 10 },
        label: "UNLABELLED_PRIVATE_SECRET",
      },
    ],
  };
  const p = planDisclosure(obs, { ...defaultDisclosure, profile: "reviewed" });
  assert.ok(!JSON.stringify(p).includes("UNLABELLED_PRIVATE_SECRET"));
});
test("an explicitly protected phrase split across adjacent text nodes is masked in every fragment", () => {
  const split = {
    ...o,
    blocks: [
      { ...o.blocks![0], id: "a", text: "SYNTH-" },
      { ...o.blocks![1], id: "b", text: "CREDENTIAL-" },
      {
        ...o.blocks![1],
        id: "c",
        text: "9081",
        rects: [{ x: 10, y: 90, width: 100, height: 20 }],
      },
    ],
  };
  const p = planDisclosure(split, {
    ...defaultDisclosure,
    profile: "reviewed",
    privateTerms: ["SYNTH-CREDENTIAL-9081"],
  });
  assert.equal(p.maskedBlocks, 3);
  assert.ok(!p.text.includes("CREDENTIAL"));
  assert.ok(p.masks.some((m) => m.rect.y === 90));
});
test("a sensitive label in one node protects the value in the next without hiding later public text", () => {
  const split = {
    ...o,
    blocks: [
      { ...o.blocks![0], id: "a", text: "Password:" },
      { ...o.blocks![1], id: "b", text: "saffron-cedar-49" },
      { ...o.blocks![1], id: "c", text: "Returns accepted within 14 days." },
    ],
  };
  const p = planDisclosure(split, {
    ...defaultDisclosure,
    profile: "reviewed",
  });
  assert.ok(!p.text.includes("saffron-cedar-49"));
  assert.ok(p.text.includes("14 days"));
});
