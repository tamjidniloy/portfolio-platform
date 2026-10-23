const MODES = new Set(["development", "test", "production"]);

export function readConfig(env = process.env) {
  const mode = env.NODE_ENV || "development";
  if (!MODES.has(mode)) {
    throw new Error("Invalid NODE_ENV");
  }

  const port = Number(env.PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("Invalid PORT");
  }

  const host = env.HOST || (mode === "production" ? "0.0.0.0" : "127.0.0.1");
  if (!/^[a-zA-Z0-9.:-]+$/.test(host)) {
    throw new Error("Invalid HOST");
  }

  const databaseUrl = env.DATABASE_URL?.trim() || null;
  if (databaseUrl && !/^postgres(ql)?:\/\//.test(databaseUrl)) {
    throw new Error("Invalid DATABASE_URL scheme");
  }

  return Object.freeze({
    mode,
    port,
    host,
    databaseUrl,
    isProduction: mode === "production",
  });
}
