import path from "node:path";

const MODES = new Set(["development", "test", "production"]);

export function readConfig(env = process.env) {
  const mode = env.NODE_ENV || "development";
  if (!MODES.has(mode)) throw new Error("Invalid NODE_ENV");

  const port = Number(env.PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid PORT");

  const host = env.HOST || (mode === "production" ? "0.0.0.0" : "127.0.0.1");
  if (!/^[a-zA-Z0-9.:-]+$/.test(host)) throw new Error("Invalid HOST");

  const databaseUrl = env.DATABASE_URL?.trim() || null;
  if (databaseUrl && !/^postgres(ql)?:\/\//.test(databaseUrl)) throw new Error("Invalid DATABASE_URL scheme");

  if (mode === "production") {
    if (!databaseUrl) throw new Error("Production requires DATABASE_URL");
    const secret = env.PORTFOLIO_AUTH_SECRET || "";
    if (Buffer.byteLength(secret) < 32 || secret.startsWith("REPLACE_WITH")) {
      throw new Error("Production requires a randomly generated PORTFOLIO_AUTH_SECRET (32+ bytes)");
    }
    const origin = env.PORTFOLIO_PUBLIC_ORIGIN;
    let parsed;
    try { parsed = new URL(origin); } catch { throw new Error("Production requires PORTFOLIO_PUBLIC_ORIGIN"); }
    const loopback = ["127.0.0.1", "localhost"].includes(parsed.hostname);
    if ((parsed.protocol !== "https:" && !(loopback && parsed.protocol === "http:")) ||
        parsed.pathname !== "/" || parsed.search || parsed.hash || parsed.username || parsed.password) {
      throw new Error("PORTFOLIO_PUBLIC_ORIGIN must be a clean HTTPS origin (HTTP permitted only on loopback for CI)");
    }
    if (env.PORTFOLIO_DEV_PRINT_OTP === "true") throw new Error("Never enable PORTFOLIO_DEV_PRINT_OTP in production");
    if (!env.RESEND_API_KEY || !env.PORTFOLIO_FROM_EMAIL) {
      throw new Error("Production owner sign-in requires RESEND_API_KEY and PORTFOLIO_FROM_EMAIL");
    }
    if (!path.isAbsolute(env.PORTFOLIO_UPLOAD_DIR || "")) {
      throw new Error("Production requires PORTFOLIO_UPLOAD_DIR as an absolute persistent path");
    }
  }

  return Object.freeze({
    mode, port, host, databaseUrl, isProduction: mode === "production",
  });
}
