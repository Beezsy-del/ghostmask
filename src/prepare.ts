import { SafeError, type Observation, type Rect } from "./contracts.ts";
import {
  planDisclosure,
  rectIntersects,
  type DisclosureOptions,
  type Disclosure,
} from "./disclosure.ts";
import { redactText } from "./detection.ts";
import { renderMaskedImage } from "./sanitizer.ts";
export async function prepareDisclosure(
  o: Observation,
  options: DisclosureOptions,
  signal: AbortSignal,
): Promise<{ image: string; disclosure: Disclosure }> {
  if (signal.aborted) throw new SafeError("TASK_PAUSED");
  let disclosure = planDisclosure(o, options);
  if (options.profile === "reviewed" && options.ocr) {
    const { recognizeLocal } = await import("./ocr.ts");
    const lines = await recognizeLocal(o.image, signal);
    if (signal.aborted) throw new SafeError("TASK_PAUSED");
    if (
      !lines.length &&
      (o.blocks ?? []).some((b) => b.text.trim().length > 15)
    )
      throw new SafeError("UNSUPPORTED");
    const bitmap = await createImageBitmap(
      new Blob(
        [Uint8Array.from(atob(o.image.split(",")[1]), (c) => c.charCodeAt(0))],
        { type: "image/png" },
      ),
    );
    const sx = bitmap.width / o.identity.viewport.width,
      sy = bitmap.height / o.identity.viewport.height;
    bitmap.close();
    const privateTerms = [...new Set([
      ...options.privateTerms,
      ...(o.privateValues ?? []),
      ...o.fields.map((f) => f.value).filter(Boolean),
    ])];
    const ocrMasks: Rect[] = [];
    for (const line of lines) {
      const sensitive =
        redactText(line.text, { privateTerms }).detections.length > 0 ||
        line.confidence < 65;
      if (sensitive)
        ocrMasks.push({
          x: line.rect.x / sx,
          y: line.rect.y / sy,
          width: line.rect.width / sx,
          height: line.rect.height / sy,
        });
    }
    const blocked = (o.blocks ?? [])
      .filter((b) =>
        b.rects.some((r) => ocrMasks.some((m) => rectIntersects(r, m))),
      )
      .map((b) => b.id);
    disclosure = planDisclosure(o, {
      ...options,
      blockedBlocks: [...new Set([...options.blockedBlocks, ...blocked])],
    });
    disclosure.masks.push(
      ...ocrMasks.map((rect) => ({
        rect,
        reason: "ocr" as const,
        category: "ocr-sensitive-or-uncertain",
      })),
    );
    disclosure.ocrStatus = "complete";
  }
  if (signal.aborted) throw new SafeError("TASK_PAUSED");
  const image = await renderMaskedImage(
    o,
    disclosure.masks.map((m) => m.rect),
  );
  if (signal.aborted) throw new SafeError("TASK_PAUSED");
  return { image, disclosure };
}
