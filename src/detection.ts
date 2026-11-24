import nlp from "compromise";
import { SafeError } from "./contracts.ts";
export type Detection = {
  start: number;
  end: number;
  category: string;
  method: "rule" | "context" | "lexicon" | "user";
};
export type DetectionOptions = {
  privateTerms?: string[];
  context?: string;
  people?: boolean;
  contextual?: boolean;
};
export function redactText(
  text: string,
  options: DetectionOptions = {},
): { text: string; detections: Detection[] } {
  if (typeof text !== "string" || text.length > 100_000)
    throw new SafeError("UNSUPPORTED");
  const hits: Detection[] = [];
  const add = (
    start: number,
    end: number,
    category: string,
    method: Detection["method"],
  ) => {
    if (end > start) hits.push({ start, end, category, method });
  };
  const rules: [string, RegExp][] = [
    ["email", /[\w.+-]+[ \t]*@[ \t]*[\w-]+(?:[ \t]*\.[ \t]*[\w-]+)+/gi],
    [
      "phone",
      /(?<!\w)(?:\+\d{1,3}[ .()-]*)?(?:\(?\d{2,4}\)?[ .-]*){2,4}\d{2,4}(?!\w)/g,
    ],
    ["identity", /\b[A-Z]{5}\d{4}[A-Z]\b/g],
    ["account", /\b[A-Z]{2}\d{2}[A-Z0-9 ]{10,30}\b/g],
    [
      "secret",
      /\b(?:sk-|ghp_|github_pat_|AKIA|Bearer\s+)[A-Za-z0-9_./+=-]{8,}\b/gi,
    ],
    ["secret", /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g],
    ["url", /https?:\/\/[^\s<>"']+/gi],
    [
      "address",
      /\b\d{1,6}\s+(?:[\p{L}.'-]+\s+){1,5}(?:street|st|road|rd|avenue|ave|lane|ln|drive|dr|boulevard|blvd|way|court|ct)\b(?:[^\n;]*)/giu,
    ],
  ];
  for (const [category, re] of rules)
    for (const m of text.matchAll(re)) {
      if (category === "phone" && (m[0].match(/\d/g)?.length ?? 0) < 8)
        continue;
      add(m.index!, m.index! + m[0].length, category, "rule");
    }
  const labels =
    /(?:\b(?:full\s*name|first\s*name|last\s*name|name|e-?mail|phone|mobile|address|account(?:\s*(?:number|id))?|employee\s*(?:number|id)|password|passphrase|api\s*key|secret|token|private\s*note|confidential|postal\s*code|zip\s*code|date\s*of\s*birth|dob|ssn|aadhaar|pan|routing\s*(?:number)?|pin|customer)\s*[:=]\s*)([^\n;]+)/gi;
  for (const m of options.contextual === false ? [] : text.matchAll(labels)) {
    const start = m.index! + m[0].length - m[1].length;
    add(start, start + m[1].length, "contextual", "context");
  }
  if (
    options.context &&
    /password|secret|token|private|confidential|account|address|person|customer.?name|employee|phone|email|postal|ssn|aadhaar|birth/i.test(
      options.context,
    )
  )
    add(0, text.length, "contextual", "context");
  const terms = options.privateTerms ?? [];
  if (
    terms.length > 800 ||
    terms.some((t) => typeof t !== "string" || t.length > 4096)
  )
    throw new SafeError("INVALID_INPUT");
  for (const term of terms) {
    if (!term.trim()) continue;
    const variants = [term, encodeURIComponent(term)];
    // Case-insensitive matching keeps offsets correct for supported English text.
    for (const v of variants) {
      const re = new RegExp(v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
      for (const m of text.matchAll(re))
        add(m.index!, m.index! + m[0].length, "protected-value", "user");
    }
  }
  if (options.people !== false && text.length <= 20_000) {
    const names = nlp(text).people().out("array") as string[];
    for (const name of names) {
      const clean = name.replace(/[.,!?;:]+$/, "").trim();
      if (!clean) continue;
      let pos = text.indexOf(clean);
      while (pos >= 0) {
        add(pos, pos + clean.length, "person", "lexicon");
        pos = text.indexOf(clean, pos + clean.length);
      }
    }
  }
  // This release's recognizers are English. Never call other scripts covered.
  if (
    /[\p{Script=Cyrillic}\p{Script=Arabic}\p{Script=Devanagari}\p{Script=Kannada}\p{Script=Han}]/u.test(
      text,
    )
  )
    add(0, text.length, "unsupported-language", "context");
  hits.sort((a, b) => a.start - b.start || b.end - a.end);
  const merged: Detection[] = [];
  for (const h of hits) {
    const last = merged.at(-1);
    if (last && h.start < last.end) last.end = Math.max(last.end, h.end);
    else merged.push({ ...h });
  }
  let output = "",
    cursor = 0;
  for (const hit of merged) {
    output += text.slice(cursor, hit.start) + "[MASKED]";
    cursor = hit.end;
  }
  output += text.slice(cursor);
  return { text: output, detections: merged };
}
