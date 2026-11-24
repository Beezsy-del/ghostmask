import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, sep } from "node:path";
const root = resolve("fixtures");
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, "http://127.0.0.1");
    const path = resolve(
      root,
      "." +
        (url.pathname === "/"
          ? "/demo.html"
          : decodeURIComponent(url.pathname)),
    );
    if (!path.startsWith(root + sep)) throw new Error();
    const body = await readFile(path);
    res.writeHead(200, {
      "Content-Type": path.endsWith(".html")
        ? "text/html; charset=utf-8"
        : "application/json",
      "Cache-Control": "no-store",
      "Content-Security-Policy":
        "default-src 'self'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; frame-src 'self'",
    });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
});
server.listen(4173, "127.0.0.1", () =>
  console.log("Synthetic GhostMask demo: http://127.0.0.1:4173"),
);
