import { test } from "node:test";
import assert from "node:assert/strict";
import { redactText } from "../src/detection.ts";
test("retains useful policy while removing contact details and user-protected terms", () => {
  const result = redactText(
    "Refunds are available for 14 days. Email ada@example.test. Internal phrase blue lantern.",
    { privateTerms: ["blue lantern"] },
  );
  assert.ok(result.text.includes("14 days"));
  assert.ok(!result.text.includes("ada@example.test"));
  assert.ok(!result.text.includes("blue lantern"));
  assert.ok(result.detections.length >= 2);
});
test("context labels protect names, addresses and arbitrary account strings", () => {
  for (const text of [
    "Name: Ada Lovelace",
    "Address: 42 Orchard Road",
    "Account number: ZX-8872-ALPHA",
    "Private note: meet after dinner",
  ]) {
    const r = redactText(text);
    assert.notEqual(r.text, text);
  }
});
