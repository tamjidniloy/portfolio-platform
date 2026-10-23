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
