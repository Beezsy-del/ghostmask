import { test } from "node:test";
import assert from "node:assert/strict";
import { Gateway, parseProposal } from "../src/gateway.ts";
test("LM Studio adapter sends only sanitized text and parses the structured summary", async () => {
  let url = "",
    wire = "";
  const gateway = new Gateway(async (u, init) => {
    url = String(u);
    wire = String(init?.body);
    return new Response(
      JSON.stringify({
        choices: [
          {
            message: {
              content: JSON.stringify({
                type: "summary",
                text: "Returns within 14 days.",
              }),
            },
          },
        ],
      }),
    );
  });
  const ticket = gateway.issue(
    {
      version: 1,
      task: "t",
      capture: "c",
      purpose: "summarize-page",
      text: "Returns within 14 days.",
      fields: [],
      grants: [],
      image: "LOCAL_IMAGE_NEVER_SEND",
      coverage: "reviewed-selective",
    },
    "lmstudio",
    "local/model",
  );
  const result = await gateway.send(
    ticket,
    async () => true,
    new AbortController().signal,
  );
  assert.equal(url, "http://127.0.0.1:1234/v1/chat/completions");
  assert.ok(!wire.includes("LOCAL_IMAGE_NEVER_SEND"));
  assert.equal(result.type, "summary");
  await assert.rejects(
    gateway.send(ticket, async () => true, new AbortController().signal),
  );
});
test("summary parser rejects extra actions and excessive outputs", () => {
  assert.throws(() =>
    parseProposal({ type: "summary", text: "okay", action: "submit" }),
  );
  assert.throws(() =>
    parseProposal({ type: "summary", text: "x".repeat(2001) }),
  );
});
