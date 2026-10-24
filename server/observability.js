import { randomUUID } from "node:crypto";
import { performance } from "node:perf_hooks";

export function requestRouteGroup(path = "") {
  if (path === "/healthz" || path === "/readyz") return "health";
  if (path.startsWith("/api/studio/login/")) return "auth";
  if (path.startsWith("/api/studio/")) return "admin_api";
  if (path.startsWith("/media/")) return "public_media";
  if (path.startsWith("/admin")) return "admin_ui";
  return "public_page";
}

// Never include URLs, query strings, IPs, headers, cookies, user agents, or bodies.
export function requestObservability({ log = console.info, clock = performance.now.bind(performance) } = {}) {
  return function observe(request, response, next) {
    const requestId = randomUUID();
    const start = clock();
    response.set("X-Request-ID", requestId);
    response.once("finish", () => {
      const group = requestRouteGroup(request.path);
      if (group === "health") return;
      const status = response.statusCode;
      log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: status >= 500 ? "error" : status >= 400 ? "warn" : "info",
        event: "http_request",
        request_id: requestId,
        route_group: group,
        method: ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"].includes(request.method) ? request.method : "OTHER",
        status_code: status,
        duration_ms: Math.round(Math.max(0, clock() - start)),
      }));
    });
    next();
  };
}
