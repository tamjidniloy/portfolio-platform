import { createRequestHandler } from "@react-router/express";
import express from "express";
import { trustedProxySubnet } from "./server/network/trusted-proxy.js";
import { requestObservability } from "./server/observability.js";
import { createCmsApiRouter } from "./server/cms/http.js";
import { createOwnerAuthRouter } from "./server/identity/auth-http.js";
import { createPrivateObjectStorage } from "./server/integrations/object-storage.js";
import { getCmsPool, getCmsPublicPool, closeCmsPool, closeCmsPublicPool } from "./server/cms/pool.js";
import { publishedSitemapPaths } from "./server/cms/public-reader.js";
import { readConfig } from "./server/config.js";
import { initializeStudio, createStudioRouter, serveStudioImage, closeStudio } from "./server/studio/index.js";
import { createDatabaseReadiness } from "./server/database.js";
import { createReadinessHandler, createApplicationReadiness, livenessHandler } from "./server/probes.js";

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
app.use("/api/studio", createStudioRouter());
app.get("/media/:name", (request, response) => void serveStudioImage(request, response));

const cmsPool = getCmsPool();
const storage = cmsPool && process.env.MEDIA_ENABLED === "true" ?
  createPrivateObjectStorage(process.env) : null;
const publicPool = getCmsPublicPool();
app.get("/readyz", createReadinessHandler(createApplicationReadiness({baseCheck:database.check, cmsPool, publicPool})));
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
    storage,
    contactConfig:{
      enabled:process.env.CONTACT_ENABLED==="true",
      noticeVersion:process.env.CONTACT_NOTICE_VERSION,
      ipPepper:process.env.CONTACT_IP_PEPPER,
    },
    publicOrigin: process.env.CMS_PUBLIC_ORIGIN,
    csrfSecret: process.env.CMS_CSRF_SECRET,
    isProduction: config.isProduction,
  }));
  app.get("/robots.txt", (_req,response)=>{
    const origin=new URL(process.env.CMS_PUBLIC_ORIGIN).origin;
    response.type("text/plain").set("Cache-Control","no-store")
      .send("User-agent: *\nDisallow: /admin\nDisallow: /api/v1/admin\nSitemap: "+origin+"/sitemap.xml\n");
  });
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

// The new one-owner portfolio tables are isolated from the legacy Release 1 CMS.
await initializeStudio();
const server = app.listen(config.port, config.host, () => {
  console.info(`DEVFOLIO OS listening on ${config.host}:${config.port} (${config.mode})`);
});

// Handle Ctrl+C, Nodemon reloads and WebStorm Stop without leaving port 3000 open.
let shuttingDown = false;
async function shutdown(reason = "signal") {
  if (shuttingDown) return;
  shuttingDown = true;

  // WebSocket upgrades, pending requests and external integrations must not hang exit.
  const deadline = setTimeout(() => {
    console.error("DEVFOLIO OS shutdown timed out; forcing process exit.");
    process.exit(1);
  }, config.isProduction ? 30000 : 5000);
  deadline.unref();

  const serverClosed = new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
    server.closeIdleConnections?.();
  });
  const results = await Promise.allSettled([
    serverClosed, database.close(), closeCmsPool(), closeCmsPublicPool(),
    closeStudio(), storage?.close(), vite?.close(),
  ]);
  const failed = results.some((result) => result.status === "rejected");
  if (failed) console.error("DEVFOLIO OS: one or more resources failed to close cleanly.");
  else console.info(`DEVFOLIO OS stopped (${reason}).`);
  clearTimeout(deadline);
  process.exit(failed ? 1 : 0);
}

process.once("SIGINT", () => void shutdown("SIGINT"));
process.once("SIGTERM", () => void shutdown("SIGTERM"));

// If WebStorm force-kills the supervisor, terminate the orphaned child server too.
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
