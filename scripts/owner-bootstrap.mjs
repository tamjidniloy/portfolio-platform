import { randomBytes, randomUUID, createHash } from "node:crypto";
import pg from "pg";
import { validateMigrationTarget } from "../server/persistence/release-migrations.js";

const url=process.env.OWNER_BOOTSTRAP_DATABASE_URL;
const database=validateMigrationTarget(url,{allowProduction:process.env.ALLOW_PRODUCTION_MIGRATIONS==="true"});
if(process.env.OWNER_BOOTSTRAP_CONFIRM!==database)throw new Error("Explicit OWNER_BOOTSTRAP_CONFIRM matching exact DB name required");
const email=process.env.OWNER_BOOTSTRAP_EMAIL;
if(typeof email!=="string"||email.length>254||!/^\S+@\S+\.\S+$/.test(email))throw new Error("Valid OWNER_BOOTSTRAP_EMAIL required");
const pool=new pg.Pool({connectionString:url,max:1,connectionTimeoutMillis:5000});
const token=randomBytes(32).toString("base64url");
const sha=v=>createHash("sha256").update(v).digest();
const client=await pool.connect();
let began=false;
try{
 await client.query("BEGIN");began=true;
 await client.query("SELECT pg_advisory_xact_lock($1::bigint)",["457174104002"]);
 const existing=await client.query("SELECT count(*)::int AS n FROM admin_users");
 if(existing.rows[0].n!==0)throw new Error("An owner already exists. Bootstrap refuses to create a second owner.");
 const owner=await client.query(
  "INSERT INTO admin_users(email,status) VALUES($1,'pending') RETURNING id",
  [email],
 );
 await client.query(
  `INSERT INTO auth_challenges(id,admin_user_id,purpose,challenge_digest,ceremony_digest,expires_at)
   VALUES($1::uuid,$2::uuid,'register',$3,$4,now()+interval '15 minutes')`,
  [randomUUID(),owner.rows[0].id,sha(randomBytes(32)),sha(token)],
 );
 await client.query("COMMIT");began=false;
 console.log("One-time owner bootstrap token (15 minutes; store privately, do NOT commit):");
 console.log(token);
 console.log("Open /admin/setup on the same secure WebAuthn origin and enter this token.");
}catch(e){if(began)await client.query("ROLLBACK");console.error("Bootstrap refused:",e.message);process.exitCode=1;}
finally{client.release();await pool.end();}
