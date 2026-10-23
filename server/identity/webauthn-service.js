import { createHash, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
import {
  generateAuthenticationOptions, verifyAuthenticationResponse,
  generateRegistrationOptions, verifyRegistrationResponse,
} from "@simplewebauthn/server";
import { withTransaction } from "../persistence/unit-of-work.js";
import { createSessionForVerifiedOwner } from "./session-store.js";

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const digest = value=>createHash("sha256").update(value).digest();
const constantEqual=(a,b)=>Buffer.isBuffer(a)&&Buffer.isBuffer(b)&&a.length===b.length&&timingSafeEqual(a,b);
const randomToken=()=>randomBytes(32).toString("base64url");
export class AuthFailure extends Error {
  constructor(message="Authentication unsuccessful",status=401){
    super(message);this.name="AuthFailure";this.status=status;
  }
}
export function assertRelyingParty({origin,rpID}={}){
  const u=new URL(origin);
  if((u.protocol!=="https:"&&!["localhost","127.0.0.1","[::1]"].includes(u.hostname))||
     u.username||u.password||u.search||u.hash||u.pathname!=="/"||
     !rpID||typeof rpID!=="string"||
     !(u.hostname===rpID||u.hostname.endsWith("."+rpID))) {
    throw new Error("Trusted exact-origin WebAuthn relying party configuration is required");
  }
  return Object.freeze({origin:u.origin,rpID});
}
const rowChallenge=async(client,{id,ceremonyToken,purpose})=>{
  if(!UUID.test(id)||typeof ceremonyToken!=="string"||!ceremonyToken)return null;
  const r=await client.query(
    `SELECT ch.*,u.status AS owner_status
     FROM auth_challenges ch JOIN admin_users u ON u.id=ch.admin_user_id
     WHERE ch.id=$1::uuid AND ch.purpose=$2 AND ch.consumed_at IS NULL
       AND ch.expires_at>now() AND ch.ceremony_digest=$3 FOR UPDATE OF ch`,
    [id,purpose,digest(ceremonyToken)],
  );
  return r.rows[0]||null;
};
function boundChallenge(response) {
  try {
    const data=response?.response?.clientDataJSON;
    if(typeof data!=="string"||data.length>12000)throw Error();
    const parsed=JSON.parse(Buffer.from(data,"base64url").toString("utf8"));
    if(!parsed||typeof parsed.challenge!=="string"||parsed.challenge.length>200)throw Error();
    return parsed.challenge;
  } catch {throw new AuthFailure();}
}
const verifyIssuedChallenge=(record,response)=>{
  if(!constantEqual(record.challenge_digest,digest(boundChallenge(response))))throw new AuthFailure();
};
export async function createAuthenticationChallenge(pool,{rpID,clientIpDigest}={}){
  if(typeof clientIpDigest!=="string"||!/^[a-f0-9]{64}$/.test(clientIpDigest))throw new AuthFailure();
  const limits=await pool.query(
    `SELECT count(*)::int AS n,coalesce(sum(attempts),0)::int AS failed
     FROM auth_challenges WHERE client_ip_digest=$1 AND created_at>now()-interval '15 minutes'`,
    [clientIpDigest],
  );
  if(limits.rows[0].n>=10||limits.rows[0].failed>=5)throw new AuthFailure("Too many authentication attempts",429);
  const owner=await pool.query("SELECT id FROM admin_users WHERE status='active' ORDER BY created_at LIMIT 1");
  const keys=owner.rows.length?await pool.query(
    "SELECT credential_id,transports FROM webauthn_credentials WHERE admin_user_id=$1::uuid AND revoked_at IS NULL",
    [owner.rows[0].id],
  ):{rows:[]};
  const options=await generateAuthenticationOptions({
    rpID,userVerification:"required",timeout:300000,
    allowCredentials:keys.rows.map(k=>({id:k.credential_id.toString("base64url"),transports:k.transports})),
  });
  if(!owner.rows.length)throw new AuthFailure();
  const ceremonyToken=randomToken(),id=randomUUID();
  await pool.query(
    `INSERT INTO auth_challenges
      (id,admin_user_id,purpose,challenge_digest,ceremony_digest,expires_at,client_ip_digest)
     VALUES($1::uuid,$2::uuid,'authenticate',$3,$4,now()+interval '5 minutes',$5)`,
    [id,owner.rows[0].id,digest(options.challenge),digest(ceremonyToken),clientIpDigest],
  );
  return {challengeId:id,publicKey:options,ceremonyToken};
}
export async function finishAuthentication(pool,{challengeId,ceremonyToken,response,origin,rpID}={}){
  if(!response||typeof response.id!=="string"||response.id.length>1500)throw new AuthFailure();
  return withTransaction(pool,async client=>{
    const challenge=await rowChallenge(client,{id:challengeId,ceremonyToken,purpose:"authenticate"});
    if(!challenge||challenge.owner_status!=="active")throw new AuthFailure();
    verifyIssuedChallenge(challenge,response);
    const cred=await client.query(
      `SELECT * FROM webauthn_credentials
       WHERE credential_id=$1 AND admin_user_id=$2::uuid AND revoked_at IS NULL FOR UPDATE`,
      [Buffer.from(response.id,"base64url"),challenge.admin_user_id],
    );
    if(cred.rows.length!==1)throw new AuthFailure();
    const key=cred.rows[0];
    let verification;
    try {
      verification=await verifyAuthenticationResponse({
        response,expectedChallenge:boundChallenge(response),
        expectedOrigin:origin,expectedRPID:rpID,requireUserVerification:true,
        credential:{
          id:key.credential_id.toString("base64url"),
          publicKey:new Uint8Array(key.public_key),
          counter:Number(key.sign_count),
          transports:key.transports,
        },
      });
    } catch {throw new AuthFailure();}
    if(!verification.verified)throw new AuthFailure();
    await client.query(
      "UPDATE webauthn_credentials SET sign_count=$2,last_used_at=now() WHERE id=$1::uuid",
      [key.id,verification.authenticationInfo.newCounter],
    );
    await client.query("UPDATE auth_challenges SET consumed_at=now() WHERE id=$1::uuid",[challengeId]);
    const session=await createSessionForVerifiedOwner(client,{ownerId:challenge.admin_user_id,ttlSeconds:3600});
    return session;
  });
}
async function optionsForOwner(pool,{owner,origin,rpID,existingChallengeId,existingToken}={}){
  assertRelyingParty({origin,rpID});
  const creds=await pool.query(
    "SELECT credential_id,transports FROM webauthn_credentials WHERE admin_user_id=$1::uuid AND revoked_at IS NULL",
    [owner.id],
  );
  const options=await generateRegistrationOptions({
    rpName:"DEVFOLIO OS",rpID,
    userID:new Uint8Array(Buffer.from(owner.id.replaceAll("-",""),"hex")),
    userName:owner.email,userDisplayName:"Portfolio Owner",
    attestationType:"none",timeout:300000,
    authenticatorSelection:{residentKey:"preferred",userVerification:"required"},
    excludeCredentials:creds.rows.map(x=>({id:x.credential_id.toString("base64url"),transports:x.transports})),
  });
  const ceremonyToken=randomToken(),challengeId=existingChallengeId||randomUUID();
  if(existingChallengeId){
    const updated=await pool.query(
      `UPDATE auth_challenges
       SET challenge_digest=$2,ceremony_digest=$3,expires_at=now()+interval '5 minutes'
       WHERE id=$1::uuid AND ceremony_digest=$4 AND consumed_at IS NULL
       RETURNING id`,
      [existingChallengeId,digest(options.challenge),digest(ceremonyToken),digest(existingToken)],
    );
    if(updated.rowCount!==1)throw new AuthFailure();
  } else {
    await pool.query(
      `INSERT INTO auth_challenges(id,admin_user_id,purpose,challenge_digest,ceremony_digest,expires_at)
       VALUES($1::uuid,$2::uuid,'register',$3,$4,now()+interval '5 minutes')`,
      [challengeId,owner.id,digest(options.challenge),digest(ceremonyToken)],
    );
  }
  return {challengeId,publicKey:options,ceremonyToken};
}
export async function beginBootstrapRegistration(pool,{bootstrapToken,origin,rpID}={}){
  if(typeof bootstrapToken!=="string"||!(/^[A-Za-z0-9_-]{43}$/.test(bootstrapToken)))throw new AuthFailure();
  const r=await pool.query(
    `SELECT ch.id,u.id AS owner_id,u.email FROM auth_challenges ch
     JOIN admin_users u ON u.id=ch.admin_user_id
     WHERE ch.purpose='register' AND ch.ceremony_digest=$1
       AND ch.consumed_at IS NULL AND ch.expires_at>now() AND u.status='pending'
     LIMIT 1`,
    [digest(bootstrapToken)],
  );
  if(!r.rows.length)throw new AuthFailure();
  return optionsForOwner(pool,{
    owner:{id:r.rows[0].owner_id,email:r.rows[0].email},
    origin,rpID,existingChallengeId:r.rows[0].id,existingToken:bootstrapToken,
  });
}
export async function beginAdditionalRegistration(pool,{ownerId,origin,rpID}={}){
  const owner=await pool.query("SELECT id,email,status FROM admin_users WHERE id=$1::uuid",[ownerId]);
  if(owner.rows.length!==1||owner.rows[0].status!=="active")throw new AuthFailure();
  return optionsForOwner(pool,{owner:owner.rows[0],origin,rpID});
}
export async function finishRegistration(pool,{challengeId,ceremonyToken,response,origin,rpID,pendingOnly=false,ownerId}={}){
  return withTransaction(pool,async client=>{
    const challenge=await rowChallenge(client,{id:challengeId,ceremonyToken,purpose:"register"});
    if(!challenge||(!pendingOnly && challenge.owner_status!=="active") ||
        (pendingOnly&&challenge.owner_status!=="pending") ||
        (ownerId&&challenge.admin_user_id!==ownerId))throw new AuthFailure();
    verifyIssuedChallenge(challenge,response);
    let verification;
    try {
      verification=await verifyRegistrationResponse({
        response,expectedChallenge:boundChallenge(response),
        expectedOrigin:origin,expectedRPID:rpID,requireUserVerification:true,
      });
    } catch {throw new AuthFailure();}
    if(!verification.verified||!verification.registrationInfo?.credential)throw new AuthFailure();
    const {credential,credentialDeviceType,credentialBackedUp}=verification.registrationInfo;
    const saved=await client.query(
      `INSERT INTO webauthn_credentials
       (admin_user_id,credential_id,public_key,sign_count,transports,backup_eligible,backed_up)
       VALUES($1::uuid,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [challenge.admin_user_id,Buffer.from(credential.id,"base64url"),Buffer.from(credential.publicKey),
       credential.counter,credential.transports||[],credentialDeviceType==="multiDevice",credentialBackedUp===true],
    );
    await client.query("UPDATE auth_challenges SET consumed_at=now() WHERE id=$1::uuid",[challengeId]);
    let session=null;
    if(pendingOnly){
      await client.query("UPDATE admin_users SET status='active',updated_at=now() WHERE id=$1::uuid AND status='pending'",[challenge.admin_user_id]);
      session=await createSessionForVerifiedOwner(client,{ownerId:challenge.admin_user_id});
    }
    return {verified:true,credentialId:saved.rows[0].id,session};
  });
}
export function ceremonyCookie(value,{production=false,clear=false}={}){
  const name=production?"__Host-devfolio_ceremony":"devfolio_ceremony";
  return name+"="+(clear?"":value)+"; Path=/; HttpOnly; SameSite=Strict; Max-Age="+(clear?0:300)+(production?"; Secure":"");
}
export function readCeremonyCookie(header,{production=false}={}){
  const name=production?"__Host-devfolio_ceremony":"devfolio_ceremony";
  if(typeof header!=="string"||header.length>8192)return null;
  const parts=header.split(";").map(x=>x.trim()).filter(x=>x.startsWith(name+"="));
  if(parts.length!==1)return null;
  const token=parts[0].slice(name.length+1);
  return /^[A-Za-z0-9_-]{43}$/.test(token)?token:null;
}
