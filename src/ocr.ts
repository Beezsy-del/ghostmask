// PNG validation adapted from the unfinished Antigravity V2-OCR draft; lifecycle and policy reviewed by Codex.
import { createWorker, type Worker } from "tesseract.js";
import { SafeError } from "./contracts.ts";
export type OcrLine = {
  text: string;
  confidence: number;
  rect: { x: number; y: number; width: number; height: number };
};
const PNG_HEADER_PREFIX = "data:image/png;base64,";
const MAX_PNG_BYTES = 30_000_000;
const MAX_PNG_PIXELS = 16_000_000;
function decodeBase64Header(b64: string): Uint8Array {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const lookup = new Uint8Array(256);
  for (let i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }
  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;
  for (let i = 0; i < b64.length && bytes.length < 32; i++) {
    const code = b64.charCodeAt(i);
    if (code === 61 /* '=' */) break;
    const val = lookup[code];
    if (val === 0 && b64[i] !== "A") {
      throw new SafeError("INVALID_INPUT");
    }
    buffer = (buffer << 6) | val;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >>> bits) & 0xff);
    }
  }
  return new Uint8Array(bytes);
}

/**
 * Validates that the input is a valid PNG data URL bounded by 30MB and 16 million pixels.
 * Throws SafeError("INVALID_INPUT") if validation fails.
 */
export function validatePngDataUrl(image: string): {
  width: number;
  height: number;
} {
  if (typeof image !== "string") {
    throw new SafeError("INVALID_INPUT");
  }
  if (!image.startsWith(PNG_HEADER_PREFIX)) {
    throw new SafeError("INVALID_INPUT");
  }

  const b64Data = image.slice(PNG_HEADER_PREFIX.length);
  if (b64Data.length < 32) {
    throw new SafeError("INVALID_INPUT");
  }

  // Calculate decoded byte length:
  let padding = 0;
  if (b64Data.endsWith("==")) padding = 2;
  else if (b64Data.endsWith("=")) padding = 1;

  const byteLength = Math.floor((b64Data.length * 3) / 4) - padding;
  if (byteLength <= 0 || byteLength > MAX_PNG_BYTES) {
    throw new SafeError("INVALID_INPUT");
  }

  // Decode the header (first 44 base64 chars yield up to 33 bytes)
  const headerSlice = b64Data.slice(0, 44);
  const header = decodeBase64Header(headerSlice);
  if (header.length < 24) {
    throw new SafeError("INVALID_INPUT");
  }

  // PNG magic number: 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A
  const pngMagic = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  for (let i = 0; i < 8; i++) {
    if (header[i] !== pngMagic[i]) {
      throw new SafeError("INVALID_INPUT");
    }
  }

  // Chunk type IHDR: 'I', 'H', 'D', 'R' (bytes 12..15)
  if (
    header[12] !== 0x49 ||
    header[13] !== 0x48 ||
    header[14] !== 0x44 ||
    header[15] !== 0x52
  ) {
    throw new SafeError("INVALID_INPUT");
  }

  // Width and height: big-endian 32-bit uints at bytes 16..19 and 20..23
  const width =
    ((header[16] << 24) |
      (header[17] << 16) |
      (header[18] << 8) |
      header[19]) >>>
    0;
  const height =
    ((header[20] << 24) |
      (header[21] << 16) |
      (header[22] << 8) |
      header[23]) >>>
    0;

  if (
    width <= 0 ||
    height <= 0 ||
    !Number.isFinite(width) ||
    !Number.isFinite(height)
  ) {
    throw new SafeError("INVALID_INPUT");
  }

  const pixels = width * height;
  if (!Number.isFinite(pixels) || pixels > MAX_PNG_PIXELS) {
    throw new SafeError("INVALID_INPUT");
  }

  return { width, height };
}

let worker: Worker | undefined;
let initializing: Promise<Worker> | undefined;
let epoch = 0;
let busy = false;
let cancelCurrent: (() => void) | undefined;
async function getWorker(): Promise<Worker> {
  if (worker) return worker;
  if (initializing) return initializing;
  const own = epoch;
  if (typeof chrome === "undefined" || !chrome.runtime?.getURL)
    throw new SafeError("UNSUPPORTED");
  const base = chrome.runtime.getURL("vendor/ocr/");
  if (!base.startsWith(`chrome-extension://${chrome.runtime.id}/`))
    throw new SafeError("UNSUPPORTED");
  const creating = createWorker("eng", 1, {
    workerPath: base + "worker.min.js",
    corePath: base + "core",
    langPath: base + "lang",
    workerBlobURL: false,
    cacheMethod: "none",
    logger: () => {},
    errorHandler: () => {},
  }).then(async (created) => {
    if (own !== epoch) {
      await created.terminate();
      throw new SafeError("TASK_PAUSED");
    }
    worker = created;
    return created;
  });
  initializing = creating;
  try {
    return await creating;
  } finally {
    if (initializing === creating) initializing = undefined;
  }
}
export async function disposeOcr(): Promise<void> {
  epoch++;
  cancelCurrent?.();
  const old = worker;
  worker = undefined;
  if (old) await old.terminate().catch(() => {});
  // A worker still initializing is terminated as soon as createWorker resolves; no raw image is sent to it after cancellation.
}
export async function recognizeLocal(
  image: string,
  signal?: AbortSignal,
): Promise<OcrLine[]> {
  const size = validatePngDataUrl(image);
  if (busy) throw new SafeError("CAPTURE_FAILED");
  if (signal?.aborted) throw new SafeError("TASK_PAUSED");
  busy = true;
  const own = epoch;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let abort: () => void = () => {};
  try {
    const stopped = new Promise<never>((_, reject) => {
      abort = () => reject(new SafeError("TASK_PAUSED"));
      cancelCurrent = abort;
      signal?.addEventListener("abort", abort, { once: true });
      timer = setTimeout(() => reject(new SafeError("CAPTURE_FAILED")), 30_000);
    });
    const operation = (async () => {
      const active = await getWorker();
      if (own !== epoch || signal?.aborted) throw new SafeError("TASK_PAUSED");
      const data = Uint8Array.from(
        atob(image.slice(PNG_HEADER_PREFIX.length)),
        (c) => c.charCodeAt(0),
      );
      try {
        const result = await active.recognize(
          new Blob([data], { type: "image/png" }),
          {},
          { text: true, blocks: true },
        );
        if (own !== epoch || signal?.aborted)
          throw new SafeError("TASK_PAUSED");
        if (!result?.data) throw new SafeError("CAPTURE_FAILED");
        if (result.data.blocks === null && !result.data.text.trim()) return [];
        if (!Array.isArray(result.data.blocks))
          throw new SafeError("CAPTURE_FAILED");
        const lines: OcrLine[] = [];
        let characters = 0;
        for (const block of result.data.blocks)
          for (const paragraph of block.paragraphs)
            for (const line of paragraph.lines) {
              const text = line.text.trim();
              if (!text) continue;
              characters += text.length;
              const { x0, y0, x1, y1 } = line.bbox;
              const confidence = line.confidence;
              if (
                lines.length >= 1000 ||
                characters > 100_000 ||
                ![x0, y0, x1, y1, confidence].every(Number.isFinite) ||
                x0 < 0 ||
                y0 < 0 ||
                x1 <= x0 ||
                y1 <= y0 ||
                x1 > size.width ||
                y1 > size.height ||
                confidence < 0 ||
                confidence > 100
              )
                throw new SafeError("CAPTURE_FAILED");
              lines.push({
                text,
                confidence,
                rect: { x: x0, y: y0, width: x1 - x0, height: y1 - y0 },
              });
            }
        return lines;
      } finally {
        data.fill(0);
      }
    })();
    return await Promise.race([operation, stopped]);
  } catch (error) {
    await disposeOcr();
    throw error instanceof SafeError ? error : new SafeError("CAPTURE_FAILED");
  } finally {
    if (timer) clearTimeout(timer);
    signal?.removeEventListener("abort", abort);
    cancelCurrent = undefined;
    // End the OCR worker after each image so its native image buffers are not retained.
    await disposeOcr();
    busy = false;
  }
}
