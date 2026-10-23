import pg from "pg";
import { validateMigrationTarget } from "../server/persistence/release-migrations.js";
import { sweepRetention } from "../server/persistence/retention.js";
const url=process.env.RETENTION_DATABASE_URL;
const db=validateMigrationTarget(url,{allowProduction:process.env.ALLOW_PRODUCTION_MIGRATIONS==="true"});
const apply=process.argv.includes("--apply");
if(apply&&process.env.RETENTION_APPLY_CONFIRM!==db)
 throw Error("Refusing retention deletion without exact RETENTION_APPLY_CONFIRM database name");
const pool=new pg.Pool({connectionString:url,max:1,connectionTimeoutMillis:5000});
try{console.log(JSON.stringify(await sweepRetention(pool,{apply}),null,2));}
finally{await pool.end();}
