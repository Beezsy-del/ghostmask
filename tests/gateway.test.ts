import { test } from "node:test";
import assert from "node:assert/strict";
import { Gateway } from "../src/gateway.ts";
test("gateway rejects a forged artifact before any network request", async () => {
  let calls = 0;
  const g = new Gateway(async () => {
    calls++;
    return new Response("{}");
  });
  await assert.rejects(
    g.send({} as never, async () => true, new AbortController().signal),
  );
  assert.equal(calls, 0);
});
test("oversized streaming model output is cancelled before buffering the full response", async () => {
  let cancelled = false;
  let chunks = 0;
  const g = new Gateway(
    async () =>
      new Response(
        new ReadableStream({
          pull(controller) {
            chunks++;
            controller.enqueue(new Uint8Array(40000));
            if (chunks >= 20) controller.close();
          },
          cancel() {
            cancelled = true;
          },
        }),
      ),
  );
  const t = g.issue(
    {
      version: 1,
      task: "t",
      capture: "c",
      purpose: "fill-approved-fields",
      fields: [],
      grants: [],
      image: "data:image/png;base64,SAFE",
      coverage: "all-source-pixels-suppressed",
    },
    "ollama",
  );
  await assert.rejects(
    g.send(t, async () => true, new AbortController().signal),
    /MODEL_FAILED/,
  );
  assert.equal(cancelled, true);
  assert.ok(chunks < 20);
});
