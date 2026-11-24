import { SafeError } from "./contracts.ts";
export type TokenScope = {
  task: string;
  origin: string;
  field: string;
  document: string;
  version: number;
};
export class TokenStore {
  #entries = new Map<
    string,
    {
      value: string;
      scope: TokenScope;
      expires: number;
      timer: ReturnType<typeof setTimeout>;
    }
  >();
  issue(
    value: string,
    scope: TokenScope,
    ttl = 60_000,
    now = Date.now(),
  ): string {
    if (!value || value.length > 4096 || ttl <= 0 || ttl > 300_000)
      throw new SafeError("TOKEN_DENIED");
    const token = crypto.randomUUID();
    const timer = setTimeout(() => this.#entries.delete(token), ttl);
    (timer as unknown as { unref?: () => void }).unref?.();
    this.#entries.set(token, {
      value,
      scope: { ...scope },
      expires: now + ttl,
      timer,
    });
    return token;
  }
  consume(token: string, scope: TokenScope, now = Date.now()): string {
    const e = this.#entries.get(token);
    if (
      !e ||
      now >= e.expires ||
      Object.keys(e.scope).some(
        (k) => e.scope[k as keyof TokenScope] !== scope[k as keyof TokenScope],
      )
    )
      throw new SafeError("TOKEN_DENIED");
    clearTimeout(e.timer);
    this.#entries.delete(token);
    return e.value;
  }
  clear() {
    for (const e of this.#entries.values()) clearTimeout(e.timer);
    this.#entries.clear();
  }
}
