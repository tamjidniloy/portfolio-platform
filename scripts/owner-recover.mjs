import pg from "pg";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { validateMigrationTarget } from "../server/persistence/release-migrations.js";
const url=process.env.OWNER_BOOTSTRAP_DATABASE_URL;
const db=validateMigrationTarget(url,{allowProduction:process.env.ALLOW_PRODUCTION_MIGRATIONS==="true"});
if(process.env.OWNER_BOOTSTRAP_CONFIRM!==db)throw Error("Exact OWNER_BOOTSTRAP_CONFIRM required");
if(process.env.OWNER_RECOVERY_CONFIRM!=="REVOKE_ALL_OWNER_AUTHENTICATORS")
  throw Error("Explicit OWNER_RECOVERY_CONFIRM required");
const pool=new pg.Pool({connectionString:url,max:1,connectionTimeoutMillis:5000});
const token=randomBytes(32).toString("base64url");
const digest=v=>createHash("sha256").update(v).digest();
const client=await pool.connect();
let begun=false;
try{
 await client.query("BEGIN");begun=true;
 await client.query("SELECT pg_advisory_xact_lock($1::bigint)",["457174104002"]);
 const rows=await client.query("SELECT id,status FROM admin_users WHERE lower(email)=lower($1)",[process.env.OWNER_BOOTSTRAP_EMAIL]);
 if(rows.rowCount!==1||rows.rows[0].status!=="active")throw Error("Exactly one active matching owner is required");
 const owner=rows.rows[0].id;
 const audit=await client.query(
  `SELECT 1 FROM audit_events
   WHERE actor_admin_id=$1::uuid AND action='recovery_code.used'
    AND created_at>now()-interval '10 minutes' LIMIT 1`,[owner],
 );
 if(!audit.rowCount)throw Error("Recovery refused: owner must redeem offline code in past 10 minutes");
 // Only a privileged DB operator with the independent one-use recovery proof can
 // reset credential enrollment. Every old cookie becomes invalid immediately.
 await client.query("UPDATE admin_sessions SET revoked_at=now() WHERE admin_user_id=$1::uuid AND revoked_at IS NULL",[owner]);
 await client.query("UPDATE webauthn_credentials SET revoked_at=now() WHERE admin_user_id=$1::uuid AND revoked_at IS NULL",[owner]);
 await client.query("UPDATE recovery_codes SET revoked_at=now() WHERE admin_user_id=$1::uuid AND used_at IS NULL AND revoked_at IS NULL",[owner]);
 await client.query("UPDATE admin_users SET status='pending',updated_at=now() WHERE id=$1::uuid",[owner]);
 await client.query("UPDATE auth_challenges SET consumed_at=now() WHERE admin_user_id=$1::uuid AND consumed_at IS NULL",[owner]);
 await client.query(
  `INSERT INTO auth_challenges(id,admin_user_id,purpose,challenge_digest,ceremony_digest,expires_at)
   VALUES($1::uuid,$2::uuid,'register',$3,$4,now()+interval '15 minutes')`,
  [randomUUID(),owner,digest(randomBytes(32)),digest(token)],
 );
 await client.query(
  `INSERT INTO audit_events(actor_admin_id,action,target_kind,target_id)
   VALUES($1::uuid,'security.owner_recovery_reset','admin_users',$1::uuid)`,[owner],
 );
 await client.query("COMMIT");begun=false;
 console.log("All old passkeys and sessions revoked. One-time 15-minute owner re-enrollment token:");
 console.log(token);
 console.log("Enter it on /admin/setup on your verified owner hostname. Store new offline recovery codes.");
}catch(error){if(begun)await client.query("ROLLBACK");console.error("Recovery refused:",error.message);process.exitCode=1;}
finally{client.release();await pool.end();}
