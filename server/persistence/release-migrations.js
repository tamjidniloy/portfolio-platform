import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
const sha256 = sql => createHash("sha256").update(sql,"utf8").digest("hex");
const ID=/^\d{4}_[a-z0-9_]+$/;
const LOCK="457174103301";

export async function releaseMigrationPlan(dir=new URL("../../db/migrations/",import.meta.url)) {
  const entries=(await readdir(dir)).filter(name=>/^\d{4}_[a-z0-9_]+\.sql$/.test(name)).sort();
  if(!entries.length)throw Error("No Release 1 migration files");
  return Promise.all(entries.map(async file=>({id:file.slice(0,-4),sql:await readFile(new URL(file,dir),"utf8")})));
}
function assertPlan(plan) {
  if(!Array.isArray(plan)||!plan.length)throw Error("Migration plan missing");
  for(let i=0;i<plan.length;i++){
    const p=plan[i];
    if(!ID.test(p.id)||typeof p.sql!=="string"||!p.sql.trim()||
       (i&&plan[i-1].id>=p.id)||
       /^\s*(BEGIN|COMMIT|ROLLBACK)\s*;/im.test(p.sql))
      throw Error("Invalid migration plan / transaction control");
  }
}
export function validateMigrationTarget(url,{allowProduction=false,mode=process.env.NODE_ENV}={}){
  if(!url||typeof url!=="string")throw Error("MIGRATION_DATABASE_URL required");
  let u;try{u=new URL(url);}catch{throw Error("Invalid migration URL");}
  if(!["postgresql:","postgres:"].includes(u.protocol)||!u.pathname.slice(1)||!u.hostname)
    throw Error("Invalid migration database");
  if(mode==="production"&&!allowProduction)throw Error("Production migrations require explicit production opt-in");
  if(["postgres","template0","template1"].includes(u.pathname.slice(1)))throw Error("Reserved PostgreSQL database");
  return u.pathname.slice(1);
}
/**
 * Offline operator-driven migrations only; never imported at SSR startup.
 * One connection, one transaction, advisory lock, checked SHA-256 ledger.
 * Refuses untracked existing schema and drift. Caller responsible for backup and
 * independently restricted role/grants before real deployment.
 */
export async function applyReleaseMigrations(pool,{databaseUrl,migrations,apply=false,confirmDatabase,allowProduction=false,mode=process.env.NODE_ENV}={}){
  const db=validateMigrationTarget(databaseUrl,{allowProduction,mode});
  assertPlan(migrations);
  if(apply&&confirmDatabase!==db)throw Error("Exact database name confirmation required");
  const client=await pool.connect();
  let begun=false;
  try{
    await client.query("BEGIN");begun=true;
    await client.query("SELECT pg_advisory_xact_lock($1::bigint)",[LOCK]);
    const actualDb=await client.query("SELECT current_database() AS name");
    if(actualDb.rows[0].name!==db)throw Error("Migration URL and connected DB disagree");
    const known=await client.query("SELECT to_regclass('public.devfolio_schema_migrations') IS NOT NULL AS exists");
    if(!known.rows[0].exists){
      const tables=await client.query("SELECT tablename FROM pg_tables WHERE schemaname='public'");
      if(tables.rows.length)throw Error("Refusing untracked nonempty schema: backup and explicit migration plan required");
    }
    await client.query(`CREATE TABLE IF NOT EXISTS devfolio_schema_migrations (
      id text PRIMARY KEY,
      checksum_sha256 text NOT NULL CHECK(checksum_sha256 ~ '^[a-f0-9]{64}$'),
      applied_at timestamptz NOT NULL DEFAULT now()
    )`);
    const history=(await client.query("SELECT id,checksum_sha256 FROM devfolio_schema_migrations ORDER BY id")).rows;
    const allowed=new Set(migrations.map(x=>x.id));
    for(const row of history)if(!allowed.has(row.id))throw Error("Applied migration missing from current source");
    const applied=[],unchanged=[];
    for(const mig of migrations){
      const digest=sha256(mig.sql);
      const row=history.find(x=>x.id===mig.id);
      if(row){if(row.checksum_sha256!==digest)throw Error("Migration checksum drift: "+mig.id);unchanged.push(mig.id);continue;}
      if(history.length&&history[history.length-1].id>mig.id)throw Error("Out-of-order migration blocked");
      if(apply){
        await client.query(mig.sql);
        await client.query("INSERT INTO devfolio_schema_migrations(id,checksum_sha256) VALUES($1,$2)",[mig.id,digest]);
      }
      applied.push(mig.id);
    }
    await client.query(apply?"COMMIT":"ROLLBACK");begun=false;
    return Object.freeze({database:db,mode:apply?"applied":"dry-run",applied,unchanged});
  }catch(error){if(begun){try{await client.query("ROLLBACK");}catch{}}throw error;}finally{client.release();}
}
