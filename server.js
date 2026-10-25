import { createRequestHandler } from "@react-router/express";
import express from "express";
import { trustedProxySubnet } from "./server/network/trusted-proxy.js";
import { requestObservability } from "./server/observability.js";
import { readConfig } from "./server/config.js";
import { createDatabaseReadiness } from "./server/database.js";
import { createReadinessHandler, livenessHandler } from "./server/probes.js";
import { initializeStudio, getStudioContent, createStudioRouter, serveStudioImage, closeStudio } from "./server/studio/index.js";
import { mediaStoreReady } from "./server/studio/media.js";
import { studioPool } from "./server/studio/db.js";
import { pruneStudioRecords, assertStudioSchema } from "./server/studio/migrations.js";

// Composition root: HTTP middleware and SSR only. Domain code lives in server/studio.
const config = readConfig(process.env);
const database = createDatabaseReadiness(config.databaseUrl);
const app = express();
const proxySubnet = trustedProxySubnet(process.env.TRUST_PROXY_CIDR);
if (proxySubnet) app.set("trust proxy", proxySubnet);
app.disable("x-powered-by");
app.use(requestObservability());
app.use((_request, response, next) => {
  response.set("X-Content-Type-Options", "nosniff");
  response.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.set("X-Frame-Options", "DENY");
  response.set("Content-Security-Policy", "base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'");
  response.set("Cross-Origin-Opener-Policy", "same-origin");
  response.set("X-Permitted-Cross-Domain-Policies", "none");
  if (config.isProduction) response.set("Strict-Transport-Security", "max-age=31536000");
  response.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.set("Cache-Control", "no-store");
  next();
});

app.get("/healthz", livenessHandler);
app.get("/readyz", createReadinessHandler(async () => {
  if (!(await database.check()) || !(await mediaStoreReady())) return false;
  await assertStudioSchema(studioPool());
  return true;
}));
app.use("/api/studio", createStudioRouter());
app.get("/media/:name", (request, response) => void serveStudioImage(request, response));

function publicOrigin() {
  return new URL(process.env.PORTFOLIO_PUBLIC_ORIGIN || "http://127.0.0.1:3000").origin;
}
app.get("/robots.txt", async (_request, response) => {
  const { content } = await getStudioContent();
  const unconfigured = content.name === "Your Name";
  response.type("text/plain").send([
    "User-agent: *",
    unconfigured ? "Disallow: /" : "Disallow: /admin",
    "Disallow: /api/",
    "Sitemap: " + publicOrigin() + "/sitemap.xml",
    "",
  ].join("\n"));
});
app.get("/sitemap.xml", async (_request, response) => {
  const { content } = await getStudioContent();
  if (content.name === "Your Name") {
    response.status(404).type("text/plain").send("Portfolio has not been published.");
    return;
  }
  response.type("application/xml").send(
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
    '<url><loc>' + publicOrigin().replaceAll("&", "&amp;") + '/</loc></url>' +
    '</urlset>',
  );
});

let vite;
if (config.isProduction) {
  app.use(express.static("build/client", {
    index: false,
    setHeaders(response, filename) {
      // React Router/Vite fingerprinted assets can be safely cached across deploys.
      if (/[/\\\\]assets[/\\\\]/.test(filename) && /[-.][A-Za-z0-9_-]{8,}\\./.test(filename)) {
        response.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      }
    },
  }));
  app.use(createRequestHandler({
    build: await import("./build/server/index.js"),
    mode: "production",
  }));
} else {
  const { createServer } = await import("vite");
  vite = await createServer({ server: { middlewareMode: true }, appType: "custom" });
  app.use(vite.middlewares);
  app.use(createRequestHandler({
    build: () => vite.ssrLoadModule("virtual:react-router/server-build"),
    mode: "development",
  }));
}

// Preserve existing portfolio_studio_* tables and content; initialization is idempotent.
await initializeStudio();
const dbForMaintenance = studioPool();
if (dbForMaintenance) {
  await pruneStudioRecords(dbForMaintenance);
}
const housekeeping = setInterval(() => {
  if (dbForMaintenance) pruneStudioRecords(dbForMaintenance).catch(() => console.error("Studio housekeeping failed."));
}, 60 * 60 * 1000);
housekeeping.unref();
const server = app.listen(config.port, config.host, () => {
  console.info(`DEVFOLIO OS listening on ${config.host}:${config.port} (${config.mode})`);
});

// Stop HTTP, Vite and PostgreSQL on Ctrl+C, WebStorm Stop or supervisor exit.
let shuttingDown = false;
async function shutdown(reason = "signal") {
  if (shuttingDown) return;
  shuttingDown = true;
  const deadline = setTimeout(() => {
    console.error("DEVFOLIO OS shutdown timed out; forcing process exit.");
    process.exit(1);
  }, config.isProduction ? 30000 : 5000);
  deadline.unref();
  const serverClosed = new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
    server.closeIdleConnections?.();
  });
  clearInterval(housekeeping);
  const results = await Promise.allSettled([serverClosed, database.close(), closeStudio(), vite?.close()]);
  const failed = results.some((result) => result.status === "rejected");
  if (failed) console.error("DEVFOLIO OS: one or more resources failed to close cleanly.");
  else console.info(`DEVFOLIO OS stopped (${reason}).`);
  clearTimeout(deadline);
  process.exit(failed ? 1 : 0);
}
process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));
if (!config.isProduction && process.env.DEV_SUPERVISOR_PID) {
  const supervisorPid = Number(process.env.DEV_SUPERVISOR_PID);
  if (Number.isSafeInteger(supervisorPid) && supervisorPid > 0) {
    const parentCheck = setInterval(() => {
      try {
        process.kill(supervisorPid, 0);
      } catch (error) {
        if (error?.code === "ESRCH") {
          clearInterval(parentCheck);
          void shutdown("development supervisor exited");
        }
      }
    }, 1000);
    parentCheck.unref();
  }
}
