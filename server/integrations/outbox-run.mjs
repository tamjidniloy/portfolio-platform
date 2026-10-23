import pg from "pg";
import { validateMigrationTarget } from "../persistence/release-migrations.js";
import { createPrivateObjectStorage } from "./object-storage.js";
import { createEmailProvider, createCachePurger } from "./providers.js";
import { runOutboxOnce, deadLetterSummary } from "./outbox.js";

const url=process.env.OUTBOX_DATABASE_URL;
const db=validateMigrationTarget(url,{allowProduction:process.env.ALLOW_PRODUCTION_MIGRATIONS==="true"});
if(process.env.OUTBOX_RUN_CONFIRM!==db)throw Error("Exact OUTBOX_RUN_CONFIRM required");
const pool=new pg.Pool({connectionString:url,max:4,connectionTimeoutMillis:5000});
const storage=process.env.MEDIA_S3_BUCKET?createPrivateObjectStorage():null;
try{
 const result=await runOutboxOnce(pool,{
  storage,email:createEmailProvider(),cache:createCachePurger(),batch:10,
 });
 const failed=await deadLetterSummary(pool);
 console.log(JSON.stringify({result,deadLetter:failed}));
 if(failed.length){
  console.error(JSON.stringify({event:"outbox_dead_letter_alert",count:failed.length}));
  process.exitCode=2;
}
}finally{
 await pool.end();
 await storage?.close();
}
