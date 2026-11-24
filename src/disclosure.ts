import { SafeError, type Observation, type Rect } from "./contracts.ts";
import { redactText } from "./detection.ts";
import { safeFields, type SafeField } from "./sanitizer.ts";
export type PrivacyProfile = "strict" | "reviewed";
export type DisclosureOptions = {
  profile: PrivacyProfile;
  ocr: boolean;
  privateTerms: string[];
  manualMasks: Rect[];
  blockedBlocks: string[];
};
export type Mask = {
  rect: Rect;
  reason: "control" | "unsupported" | "text" | "ocr" | "manual";
  category: string;
};
export type Disclosure = {
  text: string;
  fields: SafeField[];
  masks: Mask[];
  warnings: string[];
  retainedCharacters: number;
  maskedBlocks: number;
  profile: PrivacyProfile;
  ocrStatus: "not-requested" | "complete";
};
export const defaultDisclosure: DisclosureOptions = {
  profile: "strict",
  ocr: false,
  privateTerms: [],
  manualMasks: [],
  blockedBlocks: [],
};
export function rectIntersects(a: Rect, b: Rect) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}
export function validateRect(r: Rect, width: number, height: number): Rect {
  if (
    ![r.x, r.y, r.width, r.height].every(Number.isFinite) ||
    r.width <= 0 ||
    r.height <= 0 ||
    r.x < 0 ||
    r.y < 0 ||
    r.x + r.width > width + 1 ||
    r.y + r.height > height + 1
  )
    throw new SafeError("INVALID_INPUT");
  return { ...r };
}
export function planDisclosure(
  o: Observation,
  options: DisclosureOptions,
): Disclosure {
  const { width, height } = o.identity.viewport;
  const fields = safeFields(o.fields);
  if (
    !["strict", "reviewed"].includes(options.profile) ||
    options.manualMasks.length > 100 ||
    options.blockedBlocks.length > 1000
  )
    throw new SafeError("INVALID_INPUT");
  if (options.profile === "strict")
    return {
      text: "",
      fields,
      masks: [
        {
          rect: { x: 0, y: 0, width, height },
          reason: "unsupported",
          category: "strict",
        },
      ],
      warnings: ["All original pixels and page text are hidden."],
      retainedCharacters: 0,
      maskedBlocks: 0,
      profile: "strict",
      ocrStatus: "not-requested",
    };
  if (!o.blocks || !o.protectedMasks) throw new SafeError("UNSUPPORTED");
  const privateTerms = [...new Set([
    ...options.privateTerms,
    ...(o.privateValues ?? []),
    ...o.fields.map((f) => f.value).filter(Boolean),
  ])];
  const masks: Mask[] = o.protectedMasks.map((rect) => ({
    rect: { ...rect },
    reason: "unsupported",
    category: "protected-region",
  }));
  const manual = options.manualMasks.map((r) => validateRect(r, width, height));
  for (const rect of manual)
    masks.push({ rect, reason: "manual", category: "user-exclusion" });
  // Detect across adjacent DOM nodes, then conservatively suppress each affected node.
  const combined = o.blocks.map((b) => (b.excluded ? "" : b.text)).join(" ");
  const global = redactText(combined, { privateTerms, contextual: false });
  let offset = 0,
    maskedBlocks = 0;
  const text: string[] = [];
  for (const block of o.blocks) {
    const raw = block.excluded ? "" : block.text;
    const end = offset + raw.length;
    const local = redactText(raw, { privateTerms, context: block.context });
    const sensitive =
      block.excluded ||
      options.blockedBlocks.includes(block.id) ||
      local.detections.length > 0 ||
      global.detections.some((h) => h.start < end && h.end > offset) ||
      block.rects.some((r) => manual.some((m) => rectIntersects(r, m)));
    offset = end + 1;
    if (sensitive) {
      maskedBlocks++;
      for (const rect of block.rects)
        masks.push({
          rect,
          reason: "text",
          category: local.detections[0]?.category ?? "excluded",
        });
      text.push("[MASKED]");
    } else if (raw.trim()) text.push(raw.trim());
  }
  // Field labels can originate in hidden aria attributes. Only visible text blocks
  // have geometry and review coverage; never export a second label channel.
  const safe = fields;
  return {
    text: text.join("\n").slice(0, 24000),
    fields: safe,
    masks,
    warnings: [
      "Review the whole image and text before sharing. Detection can miss sensitive information.",
      ...o.unsupported.map((x) => `Excluded content: ${x}`),
    ],
    retainedCharacters: text.filter((t) => t !== "[MASKED]").join("").length,
    maskedBlocks,
    profile: "reviewed",
    ocrStatus: "not-requested",
  };
}
