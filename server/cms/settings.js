import { withTransaction } from "../persistence/unit-of-work.js";
import { assertVerifiedOwner } from "../identity/session-store.js";
import { CmsError, badInput, checkedVersion } from "../../domain/cms/content-contract.js";

const ALLOWED=new Set(["publicTitle","publicDescription","seoTitle","seoDescription","contactEnabled","primaryNavOrder","socialLinks"]);
const NAV=new Set(["projects","research","about","writing","contact"]);
const HTTPS=/^https:\/\//;

export function validatePrivateSiteSettings(settings){
  if(!settings||typeof settings!=="object"||Array.isArray(settings)||
     Object.getPrototypeOf(settings)!==Object.prototype)throw badInput("Settings must be an object");
  if(Buffer.byteLength(JSON.stringify(settings),"utf8")>32*1024)throw badInput("Settings exceed 32 KiB");
  for(const [key,value] of Object.entries(settings)){
    if(!ALLOWED.has(key))throw badInput("Unapproved settings field");
    if(["publicTitle","seoTitle"].includes(key)&&
       (typeof value!=="string"||value.length>200))throw badInput("Invalid title setting");
    if(["publicDescription","seoDescription"].includes(key)&&
       (typeof value!=="string"||value.length>2000))throw badInput("Invalid description setting");
    if(key==="contactEnabled"&&typeof value!=="boolean")throw badInput("Invalid contact state");
    if(key==="primaryNavOrder"&&
       (!Array.isArray(value)||value.length>5||value.some(x=>!NAV.has(x))||
        new Set(value).size!==value.length))throw badInput("Invalid nav order");
    if(key==="socialLinks"&&
       (!Array.isArray(value)||value.length>12||value.some(x=>!x||typeof x!=="object"||
         typeof x.platform!=="string"||x.platform.length>40||
         typeof x.url!=="string"||x.url.length>2048||!HTTPS.test(x.url)))) {
      throw badInput("Only approved HTTPS social links allowed");
    }
  }
  return structuredClone(settings);
}

export async function getPrivateSiteSettings(pool,session){
  assertVerifiedOwner(session);
  const r=await pool.query("SELECT lock_version,private_config FROM site_private_config WHERE singleton_id=1");
  return r.rows.length?{lockVersion:Number(r.rows[0].lock_version),settings:r.rows[0].private_config}:
    {lockVersion:0,settings:{}};
}
export async function updatePrivateSiteSettings(pool,session,{expectedVersion,settings}={}){
  const ownerId=assertVerifiedOwner(session);
  checkedVersion(expectedVersion);
  const safe=validatePrivateSiteSettings(settings);
  return withTransaction(pool,async client=>{
    const r=await client.query(
      "SELECT lock_version FROM site_private_config WHERE singleton_id=1 FOR UPDATE",
    );
    const actual=r.rows.length?Number(r.rows[0].lock_version):0;
    if(actual!==expectedVersion)throw new CmsError("REVISION_CONFLICT",412,"Settings changed; reload");
    if(r.rows.length){
      await client.query(
        "UPDATE site_private_config SET private_config=$1::jsonb,lock_version=lock_version+1,updated_by=$2::uuid,updated_at=now() WHERE singleton_id=1",
        [JSON.stringify(safe),ownerId],
      );
    }else{
      await client.query(
        "INSERT INTO site_private_config(singleton_id,private_config,updated_by,lock_version) VALUES(1,$1::jsonb,$2::uuid,1)",
        [JSON.stringify(safe),ownerId],
      );
    }
    await client.query(
      `INSERT INTO audit_events(actor_admin_id,action,target_kind,redacted_metadata)
       VALUES($1::uuid,'site_settings.updated','site_settings','{}'::jsonb)`,
      [ownerId],
    );
    return {lockVersion:expectedVersion+1,settings:safe};
  });
}
