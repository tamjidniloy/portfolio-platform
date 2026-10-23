import { readSessionCookie } from "../identity/session-tokens.js";
import { resolveOwnerSession } from "../identity/session-store.js";
import { csrfTokenForSession, verifyOwnerMutation } from "../identity/csrf.js";
import { getCmsPool } from "./pool.js";

export async function requireOwnerRoute(request, { mutation = false, csrfToken } = {}) {
  const pool=getCmsPool();
  if(!pool)throw new Response("Not found",{status:404});
  const token=readSessionCookie(request.headers.get("cookie"),{
    isProduction:process.env.NODE_ENV==="production",
  });
  const session=await resolveOwnerSession(pool,token);
  if(!session)throw new Response("Authentication required",{status:401,headers:{"Cache-Control":"no-store"}});
  // Independent hard server-side sliding idle expiry guard.
  const alive=await pool.query(
    `UPDATE admin_sessions SET last_seen_at=now()
     WHERE id=$1::uuid AND revoked_at IS NULL AND expires_at>now()
     AND coalesce(last_seen_at,issued_at)>now()-interval '15 minutes' RETURNING id`,
    [session.sessionId],
  );
  if(!alive.rowCount)throw new Response("Session expired",{status:401,headers:{"Cache-Control":"no-store"}});
  const secret=process.env.CMS_CSRF_SECRET;
  if(mutation&&!verifyOwnerMutation({
    method:request.method,origin:request.headers.get("origin"),
    expectedOrigin:new URL(process.env.CMS_PUBLIC_ORIGIN).origin,
    sessionToken:token,csrfToken,secret,
  }))throw new Response("Forbidden",{status:403,headers:{"Cache-Control":"no-store"}});
  return {
    pool,session,
    csrfToken:csrfTokenForSession(token,secret),
  };
}
