import { test } from "node:test";
import assert from "node:assert/strict";
import { TokenStore } from "../src/tokens.ts";
test("one approval grants one insertion into one field, never reveals a value in token", () => {
  const store = new TokenStore();
  const scope = {
    task: "t",
    origin: "https://example.test",
    field: "f",
    document: "d",
    version: 1,
  };
  const token = store.issue("SEED-SECRET", scope, 1000, 0);
  assert.ok(!token.includes("SEED"));
  assert.throws(() => store.consume(token, { ...scope, field: "other" }, 1));
  assert.equal(store.consume(token, scope, 2), "SEED-SECRET");
  assert.throws(() => store.consume(token, scope, 3));
});
test("expiry and every permission dimension are enforced", () => {
  const store = new TokenStore();
  const scope = {
    task: "t",
    origin: "https://example.test",
    field: "f",
    document: "d",
    version: 1,
  };
  const token = store.issue("SEED", scope, 100, 0);
  for (const changed of [
    { task: "x" },
    { origin: "https://evil.test" },
    { field: "x" },
    { document: "x" },
    { version: 2 },
  ])
    assert.throws(() => store.consume(token, { ...scope, ...changed }, 1));
  assert.throws(() => store.consume(token, scope, 100));
  store.clear();
  assert.throws(() => store.consume(token, scope, 1));
});
