import { SafeError, type Field, type Observation } from "./contracts.ts";
export type SafeField = {
  target: string;
  kind: string;
  category: string;
  label?: string;
};
const categories = new Set([
  "contact",
  "identity",
  "secret",
  "private",
  "unknown",
]);
export function safeFields(fields: Field[]): SafeField[] {
  if (fields.length > 200) throw new SafeError("UNSUPPORTED");
  return fields.map((f, i) => ({
    target: `field-${i + 1}`,
    kind: [
      "text",
      "email",
      "tel",
      "number",
      "textarea",
      "select",
      "password",
    ].includes(f.kind)
      ? f.kind
      : "unsupported",
    category: categories.has(f.category) ? f.category : "unknown",
  }));
}
// This is an intentionally strict release profile: all source pixels are destroyed.
// No detector score is treated as proof that the remaining pixels are harmless.
export async function sanitizeImage(observation: Observation): Promise<string> {
  if (
    !/^data:image\/png;base64,/.test(observation.image) ||
    observation.image.length > 30_000_000
  )
    throw new SafeError("CAPTURE_FAILED");
  const encoded = observation.image.slice("data:image/png;base64,".length);
  const bytes = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
  const blob = new Blob([bytes], { type: "image/png" }); // Local decoding; no fetch, no CSP data-URL logging.
  const bitmap = await createImageBitmap(blob);
  try {
    if (
      bitmap.width < 1 ||
      bitmap.height < 1 ||
      bitmap.width * bitmap.height > 16_000_000
    )
      throw new SafeError("UNSUPPORTED");
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new SafeError("CAPTURE_FAILED");
    ctx.fillStyle = "#18222f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Full opaque suppression deliberately preserves no raw pixels, including at edges.
    const output = await canvas.convertToBlob({ type: "image/png" });
    const bytes = new Uint8Array(await output.arrayBuffer());
    let binary = "";
    for (let i = 0; i < bytes.length; i += 8192)
      binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
    return `data:image/png;base64,${btoa(binary)}`;
  } finally {
    bitmap.close();
  }
}
// Evaluation-only rules baseline. Not used to authorize disclosure.
export function detect(
  text: string,
): { category: string; start: number; end: number }[] {
  const result: { category: string; start: number; end: number }[] = [];
  const rules: [string, RegExp][] = [
    ["email", /\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/gi],
    ["phone", /(?<!\d)(?:\+\d{1,3}[ -]?)?\d[\d -]{8,14}\d(?!\d)/g],
    ["secret", /\b(?:sk-|ghp_|AKIA)[A-Za-z0-9_-]{12,}\b/g],
    ["identity", /\b[A-Z]{5}\d{4}[A-Z]\b/g],
  ];
  for (const [category, pattern] of rules)
    for (const match of text.matchAll(pattern))
      result.push({
        category,
        start: match.index!,
        end: match.index! + match[0].length,
      });
  return result;
}

/** Paints real source pixels with opaque masks. All geometry is in captured CSS viewport coordinates. */
export async function renderMaskedImage(
  observation: Observation,
  rects: import("./contracts.ts").Rect[],
): Promise<string> {
  if (
    !/^data:image\/png;base64,/.test(observation.image) ||
    observation.image.length > 30_000_000
  )
    throw new SafeError("CAPTURE_FAILED");
  const bytes = Uint8Array.from(atob(observation.image.split(",")[1]), (c) =>
    c.charCodeAt(0),
  );
  const bitmap = await createImageBitmap(
    new Blob([bytes], { type: "image/png" }),
  );
  try {
    const { width, height } = observation.identity.viewport;
    if (width <= 0 || height <= 0 || bitmap.width * bitmap.height > 16_000_000)
      throw new SafeError("UNSUPPORTED");
    const sx = bitmap.width / width,
      sy = bitmap.height / height;
    if (
      !Number.isFinite(sx) ||
      !Number.isFinite(sy) ||
      Math.abs(sx - sy) > 0.05
    )
      throw new SafeError("CAPTURE_FAILED");
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new SafeError("CAPTURE_FAILED");
    ctx.drawImage(bitmap, 0, 0);
    ctx.fillStyle = "#18222f";
    const pixels = rects.map((r) => {
      if (
        ![r.x, r.y, r.width, r.height].every(Number.isFinite) ||
        r.width < 0 ||
        r.height < 0
      )
        throw new SafeError("INVALID_ARTIFACT");
      const x = Math.max(0, Math.floor((r.x - 3) * sx)),
        y = Math.max(0, Math.floor((r.y - 3) * sy));
      return {
        x,
        y,
        width: Math.max(
          0,
          Math.min(bitmap.width, Math.ceil((r.x + r.width + 3) * sx)) - x,
        ),
        height: Math.max(
          0,
          Math.min(bitmap.height, Math.ceil((r.y + r.height + 3) * sy)) - y,
        ),
      };
    });
    for (const r of pixels)
      if (r.width && r.height) ctx.fillRect(r.x, r.y, r.width, r.height);
    // Validate the actual artifact's masked pixels, not a page overlay or metadata flag.
    const painted = ctx.getImageData(0, 0, bitmap.width, bitmap.height).data;
    for (const r of pixels)
      for (let y = r.y; y < r.y + r.height; y++)
        for (let x = r.x; x < r.x + r.width; x++) {
          const i = (y * bitmap.width + x) * 4;
          if (
            painted[i] !== 24 ||
            painted[i + 1] !== 34 ||
            painted[i + 2] !== 47 ||
            painted[i + 3] !== 255
          )
            throw new SafeError("INVALID_ARTIFACT");
        }
    const output = await canvas.convertToBlob({ type: "image/png" });
    const data = new Uint8Array(await output.arrayBuffer());
    let binary = "";
    for (let i = 0; i < data.length; i += 8192)
      binary += String.fromCharCode(...data.subarray(i, i + 8192));
    return "data:image/png;base64," + btoa(binary);
  } finally {
    bitmap.close();
  }
}
