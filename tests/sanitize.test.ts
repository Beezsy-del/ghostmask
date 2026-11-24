import { test } from "node:test";
import assert from "node:assert/strict";
import { safeFields } from "../src/sanitizer.ts";
test("unknown labels, attribute text and raw values are never exported", () => {
  const result = safeFields([
    {
      key: "local-only-secret-id",
      label: "SEED PRIVATE NAME",
      value: "SECRET@example.test",
      kind: "text",
      category: "contact",
      rect: { x: 0, y: 0, width: 2, height: 2 },
    },
  ]);
  assert.equal(
    JSON.stringify(result),
    '[{"target":"field-1","kind":"text","category":"contact"}]',
  );
});
