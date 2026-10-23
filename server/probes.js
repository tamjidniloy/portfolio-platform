export function livenessHandler(_request, response) {
  response.set("Cache-Control", "no-store");
  return response.status(200).json({ status: "ok" });
}

export function createReadinessHandler(checkDatabase) {
  return async function readinessHandler(_request, response) {
    response.set("Cache-Control", "no-store");
    try {
      if (await checkDatabase()) {
        return response.status(200).json({ status: "ready" });
      }
    } catch {
      // Intentionally conceal database/provider details from public responses.
    }
    return response.status(503).json({ status: "unavailable" });
  };
}

/**
 * Fail closed whenever ANY mandatory persistence boundary is broken.
 * Pool query timeouts and connection limits are configured by the pool factory.
 * The public reader is deliberately queried independently from owner CMS.
 */
export function createApplicationReadiness({baseCheck, cmsPool = null, publicPool = null}) {
  if (typeof baseCheck !== "function") throw new TypeError("baseCheck required");
  return async function checkApplicationReadiness() {
    const checks = [() => baseCheck()];
    if (cmsPool) checks.push(() => cmsPool.query("SELECT 1").then(() => true));
    if (publicPool && publicPool !== cmsPool) checks.push(() => publicPool.query("SELECT 1").then(() => true));
    const results = await Promise.allSettled(checks.map((check) => check()));
    return results.every((result) => result.status === "fulfilled" && result.value === true);
  };
}
