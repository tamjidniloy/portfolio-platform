import { withTransaction } from "./unit-of-work.js";

const tasks=Object.freeze([
 ["contact_messages",`DELETE FROM contact_messages
  WHERE retention_until<now() AND (legal_hold_until IS NULL OR legal_hold_until<now())`],
 ["auth_challenges",`DELETE FROM auth_challenges
  WHERE expires_at<now()-interval '24 hours'`],
 ["admin_sessions",`DELETE FROM admin_sessions
  WHERE (expires_at<now()-interval '30 days') OR (revoked_at IS NOT NULL AND revoked_at<now()-interval '30 days')`],
 ["recovery_codes",`DELETE FROM recovery_codes
  WHERE (used_at IS NOT NULL AND used_at<now()-interval '30 days')
     OR (revoked_at IS NOT NULL AND revoked_at<now()-interval '30 days')`],
 ["idempotency_keys",`DELETE FROM idempotency_keys WHERE expires_at<now()`],
 ["media_assets",`DELETE FROM media_assets m
  WHERE m.state='staging' AND m.created_at<now()-interval '24 hours'
    AND NOT EXISTS(SELECT 1 FROM media_references r WHERE r.media_id=m.id)`],
 ["outbox_events",`DELETE FROM outbox_events
  WHERE processed_at IS NOT NULL AND processed_at<now()-interval '30 days'`],
 ["audit_events",`DELETE FROM audit_events WHERE created_at<now()-interval '365 days'`],
]);
export async function sweepRetention(pool,{apply=false}={}){
  return withTransaction(pool,async client=>{
    await client.query("SELECT pg_advisory_xact_lock($1::bigint)",["457174103405"]);
    const results=[];
    for(const [name,query] of tasks){
      if(apply){
        const result=await client.query(query);
        results.push({table:name,candidates:result.rowCount});
      }else{
        const count=await client.query(
          "SELECT count(*)::int AS n FROM ("+query.replace(/^DELETE FROM /,"SELECT * FROM ")+") candidates",
        );
        results.push({table:name,candidates:count.rows[0].n});
      }
    }
    return {mode:apply?"applied":"dry-run",results};
  });
}
