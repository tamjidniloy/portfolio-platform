import pg from "pg";
let pool;
export function getCmsPool(env=process.env) {
  if(env.CMS_API_ENABLED!=="true")return null;
  if(!env.CMS_DATABASE_URL||!/^postgres(?:ql)?:\/\//.test(env.CMS_DATABASE_URL)){
    throw new Error("CMS_API_ENABLED requires CMS_DATABASE_URL with approved DB-R1 schema");
  }
  if(typeof env.CMS_PUBLIC_ORIGIN!=="string" ||
     typeof env.CMS_CSRF_SECRET!=="string" ||
     Buffer.byteLength(env.CMS_CSRF_SECRET,"utf8")<32) {
    throw new Error("CMS enabled but public origin/CSRF configuration missing or weak");
  }
  if(env.NODE_ENV==="production"&&new URL(env.CMS_PUBLIC_ORIGIN).protocol!=="https:"){
    throw new Error("Production CMS requires an HTTPS origin");
  }
  pool ||= new pg.Pool({
    connectionString:env.CMS_DATABASE_URL,
    max:5,connectionTimeoutMillis:2000,query_timeout:10000,
    idleTimeoutMillis:10000,
  });
  return pool;
}
export async function closeCmsPool(){
  if(pool){await pool.end();pool=undefined;}
}
