import assert from "node:assert/strict";
import test from "node:test";
import pg from "pg";
import { releaseMigrationPlan, applyReleaseMigrations, validateMigrationTarget } from "../../server/persistence/release-migrations.js";

test("approved R1 release migration is immutable, idempotent and fail-closed",async t=>{
 const url=process.env.RELEASE_MIGRATION_TEST_DATABASE_URL;
 if(typeof url!=="string"||process.env.NODE_ENV==="production")throw Error("No isolated release test DB");
 const u=new URL(url);
 if(!["127.0.0.1","localhost"].includes(u.hostname)||u.pathname!=="/devfolio_release_migration_ci")
  throw Error("Refusing non-disposable database");
 assert.equal(validateMigrationTarget(url), "devfolio_release_migration_ci");
 assert.throws(()=>validateMigrationTarget("postgresql://a:b@remote.example/production",{mode:"production"}));
 const plan=await releaseMigrationPlan();
 assert.equal(plan.length,5);
 assert.equal(plan[0].id,"0001_release1_schema");
 const pool=new pg.Pool({connectionString:url,max:3,connectionTimeoutMillis:3000});
 t.after(async()=>pool.end());
 const dry=await applyReleaseMigrations(pool,{databaseUrl:url,migrations:plan});
 assert.deepEqual(dry.applied.map(x=>x.slice(0,4)),["0001","0002","0003","0004","0005"]);
 assert.equal(dry.mode,"dry-run");
 const tables=(await pool.query("SELECT count(*)::int AS n FROM pg_tables WHERE schemaname='public'")).rows[0].n;
 assert.equal(tables,0,"Plan must not create tables");
 await assert.rejects(applyReleaseMigrations(pool,{databaseUrl:url,migrations:plan,apply:true,confirmDatabase:"incorrect"}));
 const applied=await applyReleaseMigrations(pool,{databaseUrl:url,migrations:plan,apply:true,confirmDatabase:"devfolio_release_migration_ci"});
 assert.equal(applied.applied.length,5);
 const again=await applyReleaseMigrations(pool,{databaseUrl:url,migrations:plan,apply:true,confirmDatabase:"devfolio_release_migration_ci"});
 assert.equal(again.applied.length,0);
 assert.equal(again.unchanged.length,5);
 assert.equal((await pool.query("SELECT count(*)::int AS n FROM pg_tables WHERE schemaname='public'")).rows[0].n,20);
 await assert.rejects(applyReleaseMigrations(pool,{databaseUrl:url,migrations:plan.map((m,i)=>i===0?{...m,sql:m.sql+"\n--tampered"}:m)}),/checksum drift/);
 await assert.rejects(applyReleaseMigrations(pool,{databaseUrl:url,migrations:plan.slice(1)}),/missing from current source/);
 const original=(await pool.query("SELECT count(*)::int AS n FROM devfolio_schema_migrations")).rows[0].n;
 await assert.rejects(applyReleaseMigrations(pool,{databaseUrl:url,migrations:[...plan,{id:"0004_test_rollback",sql:"CREATE TABLE invalid_rollback(id integer); SELECT 1/0;"}],apply:true,confirmDatabase:"devfolio_release_migration_ci"}));
 assert.equal((await pool.query("SELECT count(*)::int AS n FROM devfolio_schema_migrations")).rows[0].n,original);
 assert.equal((await pool.query("SELECT to_regclass('public.invalid_rollback') AS table_name")).rows[0].table_name,null);
});
