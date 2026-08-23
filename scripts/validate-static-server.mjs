#!/usr/bin/env node
import { request } from "node:http";
import path from "node:path";
import { createStaticExportServer } from "./serve-static-export.mjs";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function rawRequest(origin, requestPath, method = "GET") {
  const target = new URL(origin);
  return new Promise((resolve, reject) => {
    const outgoing = request(
      {
        host: target.hostname,
        method,
        path: requestPath,
        port: target.port,
      },
      (incoming) => {
        const chunks = [];
        incoming.on("data", (chunk) => chunks.push(chunk));
        incoming.on("end", () => {
          resolve({
            body: Buffer.concat(chunks),
            headers: incoming.headers,
            status: incoming.statusCode,
          });
        });
      },
    );
    outgoing.on("error", reject);
    outgoing.end();
  });
}

const server = createStaticExportServer({ root: path.resolve("out") });
await new Promise((resolve, reject) => {
  server.once("error", reject);
  server.listen(0, "127.0.0.1", resolve);
});

try {
  const address = server.address();
  assert(typeof address === "object" && address, "Static server did not expose an address.");
  const origin = `http://127.0.0.1:${address.port}`;

  const root = await rawRequest(origin, "/");
  assert(root.status === 200, `Expected / to return 200, received ${root.status}.`);
  assert(root.headers["content-type"]?.startsWith("text/html"), "Root MIME type is invalid.");
  assert(root.body.includes(Buffer.from("Sukhraj Kalon")), "Root response is not the portfolio.");

  const game = await rawRequest(origin, "/game/");
  assert(game.status === 200, `Expected /game/ to return 200, received ${game.status}.`);
  assert(
    game.body.includes(Buffer.from("Chronicle Run")),
    "Game response is not the fallback shell.",
  );

  const asset = await rawRequest(origin, "/sk-icon.png", "HEAD");
  assert(asset.status === 200, `Expected static asset to return 200, received ${asset.status}.`);
  assert(asset.headers["content-type"] === "image/png", "Static asset MIME type is invalid.");
  assert(asset.body.length === 0, "HEAD response unexpectedly included a body.");

  const missing = await rawRequest(origin, "/missing-release-route/");
  assert(
    missing.status === 404,
    `Expected missing route to return 404, received ${missing.status}.`,
  );
  assert(
    missing.body.includes(Buffer.from("404")),
    "Missing route did not return exported 404 HTML.",
  );

  const traversal = await rawRequest(origin, "/%2e%2e%2fpackage.json");
  assert(
    traversal.status === 400,
    `Expected traversal to return 400, received ${traversal.status}.`,
  );

  console.log("Static export server validation passed.");
} finally {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}
