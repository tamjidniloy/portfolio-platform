import assert from "node:assert/strict";
import test from "node:test";
import {
  digestSessionToken, generateSessionToken, isSessionToken,
  serializeSessionCookie, clearSessionCookie, readSessionCookie,
} from "../server/identity/session-tokens.js";
import { assertSameOrigin, csrfTokenForSession, verifyCsrfToken, verifyOwnerMutation } from "../server/identity/csrf.js";
import { assertVerifiedOwner, OwnerNotAuthorized, resolveOwnerSession } from "../server/identity/session-store.js";

test("session token provides 256 bits of random bytes; database stores digest only", () => {
  const a = generateSessionToken();
  const b = generateSessionToken();
  assert.equal(a.length, 43);
  assert.notEqual(a, b);
  assert.equal(isSessionToken(a), true);
  assert.equal(digestSessionToken(a).length, 64);
  assert.equal(digestSessionToken(a) === a, false);
  assert.equal(digestSessionToken("injected"), null);
  assert.throws(() => generateSessionToken(() => Buffer.alloc(16)));
});

test("session cookie strict, HttpOnly, secure-prefix in production and no duplicate ambiguity", () => {
  const token = generateSessionToken();
  const production = serializeSessionCookie(token, { isProduction: true });
  assert.match(production, /^__Host-devfolio_session=/);
  for (const part of ["; Path=/", "; HttpOnly", "; SameSite=Strict", "; Secure", "; Max-Age=3600"]) {
    assert.ok(production.includes(part));
  }
  assert.equal(readSessionCookie(`theme=dark; __Host-devfolio_session=${token}; a=1`, { isProduction: true }), token);
  assert.equal(readSessionCookie(`__Host-devfolio_session=${token}; __Host-devfolio_session=${token}`, { isProduction: true }), null);
  assert.equal(readSessionCookie(`devfolio_session=${token}`, { isProduction: true }), null);
  assert.equal(readSessionCookie(`devfolio_session=${token}`), token);
  assert.match(clearSessionCookie({ isProduction: true }), /Max-Age=0; Secure/);
  assert.throws(() => serializeSessionCookie("invalid"));
});

test("CSRF is tied to a session token, rejects replay across sessions and changed secret", () => {
  const session = generateSessionToken();
  const next = generateSessionToken();
  const secret = "test-only-cryptographically-long-placeholder-key-00001";
  const token = csrfTokenForSession(session, secret);
  assert.equal(verifyCsrfToken(session, token, secret), true);
  assert.equal(verifyCsrfToken(next, token, secret), false);
  assert.equal(verifyCsrfToken(session, token, "different-test-secret-must-also-be-long-0001"), false);
  assert.equal(verifyCsrfToken(session, "malformed", secret), false);
  assert.throws(() => csrfTokenForSession(session, "weak"));
});

test("same-origin and CSRF both mandatory for cookie-authenticated owner mutations", () => {
  const token = generateSessionToken();
  const secret = "test-only-cryptographically-long-placeholder-key-00001";
  const csrf = csrfTokenForSession(token, secret);
  const parameters = { method: "POST", origin: "http://127.0.0.1:3000", expectedOrigin: "http://127.0.0.1:3000", sessionToken: token, csrfToken: csrf, secret };
  assert.equal(verifyOwnerMutation(parameters), true);
  for (const variant of [
    { origin: undefined },
    { origin: "https://evil.example" },
    { method: "GET" },
    { method: "TRACE" },
    { csrfToken: "bad" },
    { expectedOrigin: "http://not-local.example" },
    { sessionToken: generateSessionToken() },
  ]) assert.equal(verifyOwnerMutation({ ...parameters, ...variant }), false);
  assert.equal(assertSameOrigin("https://example.com", "https://example.com"), true);
  assert.throws(() => assertSameOrigin("https://example.com:443", "https://evil.example"));
});

test("untrusted hand-made session objects cannot satisfy server verified owner gate", () => {
  const fake = { ownerId: "somebody", expiresAt: new Date(Date.now() + 60_000) };
  assert.throws(() => assertVerifiedOwner(fake), OwnerNotAuthorized);
  assert.throws(() => assertVerifiedOwner(null), OwnerNotAuthorized);
});

test("SQL session lookups parameterized and deny disabled owners", async () => {
  const secret = generateSessionToken();
  const queries = [];
  const fakeDb = {
    async query(query, args) {
      queries.push({ query, args });
      return { rows: [{ id: "sid", admin_user_id: "owner", expires_at: new Date(Date.now() + 60_000), revoked_at: null, owner_status: "disabled" }] };
    },
  };
  assert.equal(await resolveOwnerSession(fakeDb, secret), null);
  assert.equal(queries.length, 1);
  assert.match(queries[0].query, /JOIN admin_users/);
  assert.equal(queries[0].args[0], digestSessionToken(secret));
  assert.equal(JSON.stringify(queries[0]).includes(secret), false);
});

test("session authority cannot be manufactured by mutating an arbitrary expiry Date", () => {
  const forged = { ownerId: "owner", expiresAtEpochMs: Number.MAX_SAFE_INTEGER };
  assert.throws(() => assertVerifiedOwner(forged), OwnerNotAuthorized);
});
