import express from "express";
import { validatePortfolio } from "./content.js";
import { getStudioContent, studioPool } from "./db.js";
import { StudioError } from "./errors.js";
import { allowedOrigin, beginLogin, verifyLogin, studioSession, failures, hash } from "./auth.js";
import { uploadStudioImage } from "./media.js";

// HTTP transports translate validated domain operations to JSON responses.
export function createStudioRouter() {
  const router = express.Router();
  const json = express.json({ limit: "180kb" });
  const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res)).catch(next);
  router.use((_req, res, next) => { res.set("Cache-Control", "no-store"); next(); });
  router.get("/public", wrap(async (_req, res) => res.json((await getStudioContent()).content)));
  router.get("/session", wrap(async (req, res) => res.json({ authenticated: Boolean(await studioSession(req)) })));
  router.use((req, _res, next) => {
    if (["POST", "PUT", "DELETE", "PATCH"].includes(req.method) && (!allowedOrigin(req) || req.get("X-Studio-Request") !== "1")) {
      next(new StudioError(403, "Invalid request origin")); return;
    }
    next();
  });
  router.post("/login/start", json, wrap(beginLogin));
  router.post("/login/verify", json, wrap(verifyLogin));
  // Authorization must finish BEFORE calling next(): no mutation may bypass this check.
  const owner = (req, _res, next) => {
    studioSession(req).then((session) => {
      if (!session) throw failures();
      req.studioOwner = session;
      next();
    }).catch(next);
  };
  router.post("/logout", owner, wrap(async (req, res) => {
    await studioPool().query("DELETE FROM portfolio_studio_sessions WHERE token_digest=$1", [hash(req.studioOwner.token)]);
    res.set("Set-Cookie", COOKIE + "=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0");
    res.status(204).end();
  }));
  router.put("/content", owner, json, wrap(async (req, res) => {
    const content = validatePortfolio(req.body?.content);
    const expected = req.body?.version;
    if (!Number.isSafeInteger(expected) || expected < 1) throw new StudioError(422, "Invalid content version");
    const result = await studioPool().query(
      "UPDATE portfolio_studio_content SET payload=$1::jsonb,version=version+1,updated_at=now() WHERE id=1 AND version=$2 RETURNING version",
      [JSON.stringify(content), expected],
    );
    if (!result.rowCount) throw new StudioError(409, "Content changed in another tab. Refresh before saving.");
    res.json({ saved: true, version: Number(result.rows[0].version) });
  }));
  router.post("/upload", owner, express.raw({ type: ["image/jpeg", "image/png", "image/webp"], limit: "5mb" }), wrap(uploadStudioImage));
  router.use((error, _req, res, next) => {
    void next;
    const status = error instanceof TypeError && /^Invalid portfolio field:/.test(error.message) ? 422 : error.status >= 400 && error.status < 600 ? error.status : 500;
    if (status === 500) console.error("Portfolio studio request failed:", error);
    res.status(status).json({ error: status === 500 ? "Something went wrong. Try again." : error.message });
  });
  return router;
}
