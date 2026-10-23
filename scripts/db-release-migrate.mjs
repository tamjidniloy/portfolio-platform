import pg from "pg";
import { releaseMigrationPlan, applyReleaseMigrations } from "../server/persistence/release-migrations.js";
const args=new Set(process.argv.slice(2));
const url=process.env.MIGRATION_DATABASE_URL;
const apply=args.has("--apply");
const pool=new pg.Pool({connectionString:url,max:1,connectionTimeoutMillis:5000});
try{
 const result=await applyReleaseMigrations(pool,{
  databaseUrl:url,migrations:await releaseMigrationPlan(),apply,
  confirmDatabase:process.env.MIGRATION_APPLY_CONFIRM,
  allowProduction:process.env.ALLOW_PRODUCTION_MIGRATIONS==="true",
 });
 console.log(JSON.stringify(result,null,2));
}catch(e){console.error("Release migration refused:",e.message);process.exitCode=1;}
finally{await pool.end();}
