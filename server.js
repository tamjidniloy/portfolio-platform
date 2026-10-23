import { createRequestHandler } from "@react-router/express";
import express from "express";
import { readConfig } from "./server/config.js";
import { createDatabaseReadiness } from "./server/database.js";
import { createReadinessHandler, livenessHandler } from "./server/probes.js";

const config = readConfig(process.env);
const database = createDatabaseReadiness(config.databaseUrl);
const app = express();

app.disable("x-powered-by");
app.use((_request, response, next) => {
  response.set("X-Content-Type-Options", "nosniff");
  response.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.set("X-Frame-Options", "DENY");
  response.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.set("Cache-Control", "no-store");
  next();
});

app.get("/healthz", livenessHandler);
app.get("/readyz", createReadinessHandler(database.check));

let vite;
if (config.isProduction) {
  app.use(express.static("build/client", { index: false }));
  app.use(
    createRequestHandler({
      build: await import("./build/server/index.js"),
      mode: "production",
    }),
  );
} else {
  const { createServer } = await import("vite");
  vite = await createServer({
    server: { middlewareMode: true },
    appType: "custom",
  });
  app.use(vite.middlewares);
  app.use(
    createRequestHandler({
      build: () => vite.ssrLoadModule("virtual:react-router/server-build"),
      mode: "development",
    }),
  );
}

const server = app.listen(config.port, config.host, () => {
  console.info(`DEVFOLIO OS listening on ${config.host}:${config.port} (${config.mode})`);
});

async function shutdown() {
  server.close();
  await Promise.allSettled([database.close(), vite?.close()]);
}

process.once("SIGINT", () => void shutdown());
process.once("SIGTERM", () => void shutdown());
