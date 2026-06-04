import { createReadStream, existsSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { createServer } from "node:http";

const root = new URL(".", import.meta.url).pathname;
const port = Number(process.env.PORT ?? 3001);
const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
};

function resolvePath(pathname) {
  const decoded = decodeURIComponent(pathname);
  const safePath = normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(root, safePath === "/" ? "index.html" : safePath);

  return existsSync(filePath) ? filePath : join(root, "index.html");
}

createServer((request, response) => {
  const url = new URL(request.url ?? "/", "http://localhost");
  const filePath = resolvePath(url.pathname);
  const type = types[extname(filePath)] ?? "application/octet-stream";

  response.writeHead(200, { "Content-Type": type });
  createReadStream(filePath).pipe(response);
}).listen(port, "0.0.0.0", () => {
  console.log(`Ditty preview listening on http://0.0.0.0:${port}`);
});
