#!/usr/bin/env node
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const MIME_TYPES = new Map([
  [".css", "text/css; charset=utf-8"],
  [".gif", "image/gif"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml; charset=utf-8"],
  [".txt", "text/plain; charset=utf-8"],
  [".webp", "image/webp"],
  [".woff2", "font/woff2"],
  [".xml", "application/xml; charset=utf-8"],
]);

function isWithinRoot(root, target) {
  const relative = path.relative(root, target);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

async function resolveRequestPath(outputRoot, rawUrl) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(rawUrl ?? "/", "http://static.local").pathname);
  } catch {
    return { error: 400 };
  }

  if (pathname.includes("\0")) return { error: 400 };

  const requestedPath = path.resolve(outputRoot, `.${pathname}`);
  if (!isWithinRoot(outputRoot, requestedPath)) return { error: 400 };

  const candidates = pathname.endsWith("/")
    ? [path.join(requestedPath, "index.html")]
    : [requestedPath, path.join(requestedPath, "index.html")];

  for (const candidate of candidates) {
    if (!isWithinRoot(outputRoot, candidate)) return { error: 400 };
    const metadata = await stat(candidate).catch(() => null);
    if (metadata?.isFile()) return { filePath: candidate, metadata, status: 200 };
  }

  const notFoundPath = path.join(outputRoot, "404.html");
  const metadata = await stat(notFoundPath).catch(() => null);
  return metadata?.isFile() ? { filePath: notFoundPath, metadata, status: 404 } : { error: 404 };
}

export function createStaticExportServer({ root = path.resolve("out") } = {}) {
  const outputRoot = path.resolve(root);

  return createServer(async (request, response) => {
    if (request.method !== "GET" && request.method !== "HEAD") {
      response.writeHead(405, { Allow: "GET, HEAD" });
      response.end("Method Not Allowed");
      return;
    }

    const resolved = await resolveRequestPath(outputRoot, request.url);
    if (resolved.error) {
      response.writeHead(resolved.error, {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
      });
      response.end(resolved.error === 400 ? "Bad Request" : "Not Found");
      return;
    }

    const contentType = MIME_TYPES.get(path.extname(resolved.filePath).toLowerCase());
    response.writeHead(resolved.status, {
      "Cache-Control": "no-store",
      "Content-Length": resolved.metadata.size,
      "Content-Type": contentType ?? "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
    });

    if (request.method === "HEAD") {
      response.end();
      return;
    }

    const stream = createReadStream(resolved.filePath);
    stream.on("error", () => response.destroy());
    stream.pipe(response);
  });
}

async function startFromCommandLine() {
  const root = path.resolve(process.env.STATIC_ROOT ?? "out");
  const host = process.env.HOST ?? "127.0.0.1";
  const port = Number.parseInt(process.env.PORT ?? "4173", 10);

  const rootMetadata = await stat(root).catch(() => null);
  if (!rootMetadata?.isDirectory()) {
    throw new Error(`Static export directory does not exist: ${root}`);
  }
  if (!Number.isInteger(port) || port < 0 || port > 65_535) {
    throw new Error(`Invalid PORT value: ${process.env.PORT}`);
  }

  const server = createStaticExportServer({ root });
  server.listen(port, host, () => {
    const address = server.address();
    const actualPort = typeof address === "object" && address ? address.port : port;
    console.log(`Serving ${root} at http://${host}:${actualPort}`);
  });

  const shutdown = (signal) => {
    server.close((error) => {
      if (error) {
        console.error(error);
        process.exitCode = 1;
      }
    });
    setTimeout(() => process.exit(1), 5_000).unref();
    process.once(signal, () => process.exit(1));
  };

  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));
}

const isCommandLine = process.argv[1]
  ? path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  : false;

if (isCommandLine) {
  startFromCommandLine().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
