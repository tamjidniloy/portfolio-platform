import { createRequestHandler } from "@react-router/express";
import express from "express";
import { createCmsApiRouter } from "./server/cms/http.js";
import { createOwnerAuthRouter } from "./server/identity/auth-http.js";
import { getCmsPool, getCmsPublicPool, closeCmsPool, closeCmsPublicPool } from "./server/cms/pool.js";
import { publishedSitemapPaths } from "./server/cms/public-reader.js";
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

const cmsPool = getCmsPool();
const publicPool = getCmsPublicPool();
if (cmsPool) {
  if (process.env.CMS_AUTH_ENABLED === "true") {
    app.use("/api/v1", createOwnerAuthRouter({
      pool: cmsPool,
      publicOrigin: process.env.CMS_PUBLIC_ORIGIN,
      rpID: process.env.WEBAUTHN_RP_ID,
      csrfSecret: process.env.CMS_CSRF_SECRET,
      isProduction: config.isProduction,
    }));
  }
  app.use("/api/v1", createCmsApiRouter({
    pool: cmsPool,
    publicPool,
    publicOrigin: process.env.CMS_PUBLIC_ORIGIN,
    csrfSecret: process.env.CMS_CSRF_SECRET,
    isProduction: config.isProduction,
  }));
  app.get("/sitemap.xml", async (_request, response) => {
    try {
      const paths = await publishedSitemapPaths(publicPool);
      const origin = new URL(process.env.CMS_PUBLIC_ORIGIN).origin;
      const xml = ['<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        ...paths.map(path=>'<url><loc>'+origin+path+'</loc></url>'), '</urlset>'].join("");
      response.type("application/xml").send(xml);
    } catch { response.status(503).type("text/plain").send("Sitemap unavailable"); }
  });
}

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
  await Promise.allSettled([database.close(), closeCmsPool(), closeCmsPublicPool(), vite?.close()]);
}

process.once("SIGINT", () => void shutdown());
process.once("SIGTERM", () => void shutdown());
