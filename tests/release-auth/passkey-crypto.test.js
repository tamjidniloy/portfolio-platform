import assert from "node:assert/strict";
import { createHash, generateKeyPairSync, randomBytes, sign } from "node:crypto";
import test from "node:test";
import { readFile } from "node:fs/promises";
import pg from "pg";
import { beginBootstrapRegistration, finishRegistration, createAuthenticationChallenge, finishAuthentication } from "../../server/identity/webauthn-service.js";
import { resolveOwnerSession } from "../../server/identity/session-store.js";
const hash=b=>createHash("sha256").update(b).digest();
const bin=v=>Buffer.from(v,"base64url");
const number=(type,n)=>{
 if(n<24)return Buffer.from([type*32+n]);
 if(n<256)return Buffer.from([type*32+24,n]);
 if(n<65536){const b=Buffer.alloc(3);b[0]=type*32+25;b.writeUInt16BE(n,1);return b;}
 throw new Error("CBOR fixture too long");
};
function cbor(value){
 if(typeof value==="number")return number(value>=0?0:1,value>=0?value:-1-value);
 if(typeof value==="string"){const b=Buffer.from(value);return Buffer.concat([number(3,b.length),b]);}
 if(Buffer.isBuffer(value))return Buffer.concat([number(2,value.length),value]);
 if(Array.isArray(value)){return Buffer.concat([number(4,value.length),...value.map(cbor)]);}
 if(value&&typeof value==="object"){
  const entries=Object.entries(value).map(([k,v])=>[Number.isFinite(Number(k))?Number(k):k,v]);
  return Buffer.concat([number(5,entries.length),...entries.flatMap(([k,v])=>[cbor(k),cbor(v)])]);
 }
 throw new Error("Unsupported CBOR fixture");
}
function makeCredential(challenge,rpID,origin,{keypair,id}){
 const client=Buffer.from(JSON.stringify({type:"webauthn.create",challenge,origin,crossOrigin:false}));
 const jwk=keypair.publicKey.export({format:"jwk"});
 const cose=cbor({"1":2,"3":-7,"-1":1,"-2":bin(jwk.x),"-3":bin(jwk.y)});
 const nameHash=hash(rpID);
 const length=Buffer.alloc(2);length.writeUInt16BE(id.length);
 const authData=Buffer.concat([nameHash,Buffer.from([0x45,0,0,0,0]),Buffer.alloc(16),length,id,cose]);
 const attObj=cbor({fmt:"none",attStmt:{},authData});
 return {id:id.toString("base64url"),rawId:id.toString("base64url"),type:"public-key",
   response:{clientDataJSON:client.toString("base64url"),attestationObject:attObj.toString("base64url"),transports:["internal"]},
   clientExtensionResults:{}};
}
function makeAssertion(challenge,rpID,origin,{keypair,id},counter=1){
 const client=Buffer.from(JSON.stringify({type:"webauthn.get",challenge,origin,crossOrigin:false}));
 const count=Buffer.alloc(4);count.writeUInt32BE(counter);
 const authData=Buffer.concat([hash(rpID),Buffer.from([0x05]),count]);
 const signature=sign("sha256",Buffer.concat([authData,hash(client)]),keypair.privateKey);
 return {id:id.toString("base64url"),rawId:id.toString("base64url"),type:"public-key",
   response:{clientDataJSON:client.toString("base64url"),authenticatorData:authData.toString("base64url"),signature:signature.toString("base64url"),userHandle:null},
   clientExtensionResults:{}};
}
test("real P-256 crypto passkey enrollment then signed WebAuthn login (simulated authenticator)",async t=>{
 const url=process.env.AUTH_CRYPTO_DATABASE_URL;
 const u=new URL(url||"invalid:");
 if(u.hostname!=="127.0.0.1"||u.pathname!=="/devfolio_release_auth_crypto_ci"||process.env.NODE_ENV==="production")
   throw Error("Refuse non-disposable crypto auth database");
 const pool=new pg.Pool({connectionString:url,max:2,connectionTimeoutMillis:3000});
 t.after(async()=>pool.end());
 for(const name of ["0001_release1_schema.sql","0003_auth_abuse_controls.sql"]){
  await pool.query(await readFile("db/migrations/"+name,"utf8"));
 }
 const email="crypto-fixture@invalid.test";
 const owner=(await pool.query("INSERT INTO admin_users(email,status) VALUES($1,'pending') RETURNING id",[email])).rows[0].id;
 const bootstrap=randomBytes(32).toString("base64url");
 await pool.query(
  `INSERT INTO auth_challenges(admin_user_id,purpose,challenge_digest,ceremony_digest,expires_at)
   VALUES($1::uuid,'register',$2,$3,now()+interval '15 minutes')`,
  [owner,hash(randomBytes(32)),hash(bootstrap)],
 );
 const origin="http://127.0.0.1:3000",rpID="127.0.0.1";
 const pair={keypair:generateKeyPairSync("ec",{namedCurve:"prime256v1"}),id:randomBytes(32)};
 const options=await beginBootstrapRegistration(pool,{bootstrapToken:bootstrap,origin,rpID});
 const attestation=makeCredential(options.publicKey.challenge,rpID,origin,pair);
 const registered=await finishRegistration(pool,{
  challengeId:options.challengeId,ceremonyToken:options.ceremonyToken,
  response:attestation,origin,rpID,pendingOnly:true,
 });
 assert.equal(registered.verified,true);
 const session=await resolveOwnerSession(pool,registered.session.token);
 assert.equal(session.ownerId,owner);
 const login=await createAuthenticationChallenge(pool,{rpID,clientIpDigest:hash("synthetic-fixture-ip").toString("hex")});
 const assertion=makeAssertion(login.publicKey.challenge,rpID,origin,pair);
 const signed=await finishAuthentication(pool,{
  challengeId:login.challengeId,ceremonyToken:login.ceremonyToken,
  response:assertion,origin,rpID,
 });
 assert.ok(signed.token);
 assert.equal((await resolveOwnerSession(pool,signed.token)).ownerId,owner);
 await assert.rejects(finishAuthentication(pool,{
  challengeId:login.challengeId,ceremonyToken:login.ceremonyToken,
  response:assertion,origin,rpID,
 }));
 const second=await createAuthenticationChallenge(pool,{rpID,clientIpDigest:hash("synthetic-fixture-2").toString("hex")});
 const tampered=makeAssertion(second.publicKey.challenge,rpID,"http://127.0.0.1:3001",pair,2);
 await assert.rejects(finishAuthentication(pool,{
  challengeId:second.challengeId,ceremonyToken:second.ceremonyToken,
  response:tampered,origin,rpID,
 }));
});
