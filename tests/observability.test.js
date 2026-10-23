import test from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { requestRouteGroup, requestObservability } from "../server/observability.js";

test("classifies routes without logging PII slugs", () => {
  assert.equal(requestRouteGroup("/admin/content/sensitive"), "admin_ui");
  assert.equal(requestRouteGroup("/api/v1/auth/passkey/options"), "auth");
  assert.equal(requestRouteGroup("/api/v1/admin/messages"), "admin_api");
  assert.equal(requestRouteGroup("/projects/private-slug"), "public_page");
});
test("request log records only bounded structured metadata", () => {
  const messages = [];
  let clock = 100;
  const request = { path: "/api/v1/admin/messages", method: "POST", originalUrl: "/api/v1/admin/messages?token=secret", headers: { cookie: "secret" }, ip: "1.2.3.4", body: { email: "secret@example.com" } };
  const response = new EventEmitter();
  response.statusCode = 503;
  response.set = (key, value) => { response[key] = value; return response; };
  let called = false;
  requestObservability({ log: (entry) => messages.push(entry), clock: () => clock })(request, response, () => { called = true; });
  clock = 141;
  response.emit("finish");
  assert.equal(called, true);
  assert.match(response["X-Request-ID"], /^[0-9a-f-]{36}$/i);
  assert.equal(messages.length, 1);
  const event = JSON.parse(messages[0]);
  assert.equal(event.route_group, "admin_api");
  assert.equal(event.status_code, 503);
  assert.equal(event.duration_ms, 41);
  for (const forbidden of ["secret", "1.2.3.4", "email", "token", "messages", "cookie"]) {
    assert.equal(messages[0].includes(forbidden), false, forbidden);
  }
});
test("health probes do not flood application request logs", () => {
  const messages = [];
  const response = new EventEmitter();
  response.set = () => response;
  response.statusCode = 200;
  requestObservability({ log: (v) => messages.push(v) })({ path: "/readyz", method: "GET" }, response, () => {});
  response.emit("finish");
  assert.deepEqual(messages, []);
});
