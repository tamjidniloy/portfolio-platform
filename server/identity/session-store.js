import { withTransaction } from "../persistence/unit-of-work.js";
import { digestSessionToken, generateSessionToken } from "./session-tokens.js";

const SESSION_PROOF = Symbol("devfolio-server-verified-owner-session");
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class OwnerNotAuthorized extends Error {
  constructor() {
    super("Owner authentication required");
    this.name = "OwnerNotAuthorized";
    this.code = "OWNER_AUTH_REQUIRED";
  }
}

function checkedUuid(value) {
  if (typeof value !== "string" || !UUID.test(value)) throw new TypeError("Valid owner ID required");
  return value;
}

function checkedExpiry(now, ttlSeconds) {
  if (!(now instanceof Date) || Number.isNaN(now.valueOf()) ||
      !Number.isInteger(ttlSeconds) || ttlSeconds < 60 || ttlSeconds > 86_400) {
    throw new TypeError("Invalid session lifetime");
  }
  return new Date(now.getTime() + ttlSeconds * 1000);
}

function trustedSession(row, now) {
  if (!row || row.owner_status !== "active" || row.revoked_at !== null ||
      new Date(row.expires_at).getTime() <= now.getTime()) {
    return null;
  }
  return Object.freeze({
    [SESSION_PROOF]: true,
    ownerId: row.admin_user_id,
    sessionId: row.id,
    expiresAt: new Date(row.expires_at),
  });
}

export function assertVerifiedOwner(session, { ownerId, now = new Date() } = {}) {
  if (!session || session[SESSION_PROOF] !== true ||
      !(session.expiresAt instanceof Date) || session.expiresAt.getTime() <= now.getTime() ||
      (ownerId !== undefined && session.ownerId !== ownerId)) {
    throw new OwnerNotAuthorized();
  }
  return session.ownerId;
}

/**
 * PRIVATE authenticated-adapter port ONLY. The caller MUST have validated a
 * real passkey/approved authentication ceremony before calling this function.
 * This is intentionally not bound to an HTTP endpoint until final MFA signoff.
 */
export async function createSessionForVerifiedOwner(
  pool, { ownerId, now = new Date(), ttlSeconds = 3600 } = {},
) {
  checkedUuid(ownerId);
  const expiresAt = checkedExpiry(now, ttlSeconds);
  const token = generateSessionToken();
  const result = await pool.query(
    `INSERT INTO admin_sessions(admin_user_id, token_digest, issued_at, expires_at)
     SELECT id, $2, $3, $4 FROM admin_users WHERE id = $1::uuid AND status='active'
     RETURNING id`,
    [ownerId, digestSessionToken(token), now, expiresAt],
  );
  if (result.rows.length !== 1) throw new OwnerNotAuthorized();
  return Object.freeze({ token, expiresAt });
}

export async function resolveOwnerSession(pool, token, { now = new Date() } = {}) {
  const digest = digestSessionToken(token);
  if (!digest) return null;
  const result = await pool.query(
    `SELECT s.id, s.admin_user_id, s.expires_at, s.revoked_at, u.status AS owner_status
     FROM admin_sessions s
     JOIN admin_users u ON u.id = s.admin_user_id
     WHERE s.token_digest=$1 AND s.revoked_at IS NULL AND s.expires_at>$2
     LIMIT 1`,
    [digest, now],
  );
  return trustedSession(result.rows[0], now);
}

export async function rotateOwnerSession(
  pool, oldToken, { now = new Date(), ttlSeconds = 3600 } = {},
) {
  const digest = digestSessionToken(oldToken);
  if (!digest) throw new OwnerNotAuthorized();
  const expiresAt = checkedExpiry(now, ttlSeconds);
  return withTransaction(pool, async (client) => {
    const found = await client.query(
      `SELECT s.id, s.admin_user_id, s.expires_at, s.revoked_at, u.status AS owner_status
       FROM admin_sessions s JOIN admin_users u ON u.id=s.admin_user_id
       WHERE s.token_digest=$1 FOR UPDATE OF s`,
      [digest],
    );
    const oldSession = trustedSession(found.rows[0], now);
    if (!oldSession) throw new OwnerNotAuthorized();
    await client.query(
      "UPDATE admin_sessions SET revoked_at=$2 WHERE id=$1::uuid",
      [oldSession.sessionId, now],
    );
    const newToken = generateSessionToken();
    await client.query(
      `INSERT INTO admin_sessions(admin_user_id,token_digest,issued_at,expires_at)
       VALUES ($1::uuid,$2,$3,$4)`,
      [oldSession.ownerId, digestSessionToken(newToken), now, expiresAt],
    );
    return Object.freeze({ token: newToken, expiresAt });
  });
}

export async function revokeOwnerSession(pool, token, { now = new Date() } = {}) {
  const digest = digestSessionToken(token);
  if (!digest) return false;
  const result = await pool.query(
    "UPDATE admin_sessions SET revoked_at=$2 WHERE token_digest=$1 AND revoked_at IS NULL RETURNING id",
    [digest, now],
  );
  return result.rowCount === 1;
}

export async function revokeAllOwnerSessions(pool, ownerId, { now = new Date() } = {}) {
  checkedUuid(ownerId);
  const result = await pool.query(
    "UPDATE admin_sessions SET revoked_at=$2 WHERE admin_user_id=$1::uuid AND revoked_at IS NULL",
    [ownerId, now],
  );
  return result.rowCount;
}
