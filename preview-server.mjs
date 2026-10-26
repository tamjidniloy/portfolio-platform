// DEVFOLIO OS family preview: same React Router SSR app, PUBLIC content only.
// This entry point is intentionally separate from the real production server.js.
// Establish production mode BEFORE loading React Router or other application dependencies.
// ESM static imports execute before the module body, even when written after assignments.
import { access } from "node:fs/promises";
import path from "node:path";

process.env.NODE_ENV = "production";
process.env.PORTFOLIO_PREVIEW_MODE = "true";

const [router, expressModule, studioDb, studioMedia] = await Promise.all([
  import("@react-router/express"),
  import("express"),
  import("./server/studio/db.js"),
  import("./server/studio/media.js"),
]);
const { createRequestHandler } = router;
const express = expressModule.default;
const { getStudioContent } = studioDb;
const { mediaDirectory, serveStudioImage } = studioMedia;
const port = Number(process.env.PORT || "10000");
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid preview port");
process.env.PORTFOLIO_PUBLIC_ORIGIN ||= process.env.RENDER_EXTERNAL_URL || `http://127.0.0.1:${port}`;

const app = express();
app.disable("x-powered-by");
app.use((_request, response, next) => {
  response.set("X-Content-Type-Options", "nosniff");
  response.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.set("X-Frame-Options", "DENY");
  response.set("Content-Security-Policy", "base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'");
  response.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  response.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});

app.get("/healthz", (_request, response) => response.json({ status: "ok", mode: "family-preview" }));
app.get("/readyz", async (_request, response) => {
  try {
    const { content } = await getStudioContent();
    await access(path.resolve("build/server/index.js"));
    for (const name of [content.avatar, ...content.projects.flatMap((item) => [item.cover, item.beforeCover, item.afterCover])]) {
      if (name?.startsWith("/media/")) await access(path.join(mediaDirectory(), path.basename(name)));
    }
    return response.json({ status: "ready", mode: "family-preview" });
  } catch {
    return response.status(503).json({ status: "unavailable" });
  }
});

app.get("/robots.txt", (_request, response) => {
  response.type("text/plain").send("User-agent: *\nDisallow: /\n");
});
app.get("/sitemap.xml", (_request, response) => response.status(404).end());

// Block every owner/admin page BEFORE React Router can resolve its loader.
app.use("/admin", (_request, response) => response.status(404).end());
app.get("/api/studio/public", async (_request, response) => {
  response.set("Cache-Control", "no-store");
  response.json((await getStudioContent()).content);
});
app.get("/api/studio/session", (_request, response) => response.json({ authenticated: false }));
app.use("/api", (_request, response) => response.status(404).end());

app.get("/media/:name", (request, response) => void serveStudioImage(request, response));
app.use(express.static("build/client", { index: false }));
app.use(createRequestHandler({
  build: await import("./build/server/index.js"),
  mode: "production",
}));

app.listen(port, "0.0.0.0", () => {
  console.info(`DEVFOLIO OS FAMILY PREVIEW listening on 0.0.0.0:${port}`);
});
