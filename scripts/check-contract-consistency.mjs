import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const meta = JSON.parse(readFileSync("contracts/phase04-baselines.json", "utf8"));
const s = meta.sources;
assert.equal(meta.status, "OWNER_APPROVED_SPEC");
assert.equal(meta.ownerApproval.status, "APPROVED_IN_PROJECT_CONVERSATION");
assert.equal(meta.runtimeCompletion, false);
assert.equal(meta.ownerApproval.signedGitHash, null, "Do not invent an electronic signature");
assert.match(readFileSync(meta.ownerApproval.record,"utf8"),/Owner Contract Acceptance/);
const cat=readFileSync(s.requirements.file,"utf8");
const ids=[...new Set(cat.match(/\b(?:FR|NFR)-[0-9]{3}\b/g)||[])];
assert.equal(ids.filter(x=>x.startsWith("FR-")).length,s.requirements.expectedFR);
assert.equal(ids.filter(x=>x.startsWith("NFR-")).length,s.requirements.expectedNFR);
for(const banned of [/\| FR-039 \| Password login/,/\| FR-040 \| Email challenge/,/\| NFR-021 \| Email resilience/]){
 assert.doesNotMatch(cat,banned);
}
const auth=readFileSync(s.auth.file,"utf8");
assert.match(auth,/WebAuthn/);
assert.match(auth,/single-use/);
const sql=readFileSync(s.database.file,"utf8");
const matches=sql.match(/\bCREATE TABLE\s+(?:IF NOT EXISTS\s+)?[a-z_]+/gi)||[];
assert.equal(matches.length,s.database.expectedTables);
assert.match(sql,/CREATE TABLE webauthn_credentials/);
assert.match(sql,/CREATE TABLE recovery_codes/);
assert.doesNotMatch(sql,/CREATE TABLE password_reset_tokens/);
assert.doesNotMatch(sql,/password_hash/);
const api=JSON.parse(readFileSync(s.api.file,"utf8"));
assert.equal(api.openapi,"3.1.2");
const paths=Object.keys(api.paths);
assert.equal(paths.length,s.api.expectedPaths);
const methods=new Set(["get","post","put","patch","delete","head","options"]);
const ops=Object.values(api.paths).reduce((n,x)=>n+Object.keys(x).filter(key=>methods.has(key)).length,0);
assert.equal(ops,s.api.expectedOperations);
for(const path of ["/api/v1/auth/password","/api/v1/auth/email/verify","/api/v1/auth/email/resend"]) assert.equal(api.paths[path],undefined);
for(const path of ["/api/v1/auth/passkey/options","/api/v1/auth/passkey/verify"])assert.ok(api.paths[path]?.post);
for(const [path,route] of Object.entries(api.paths))for(const [method,operation] of Object.entries(route)){
 assert.ok(operation.operationId);
 if(operation["x-owner-session-required"])assert.deepEqual(operation.security,[{OwnerSession:[]}],path);
 if(operation["x-owner-session-required"]&&["post","patch","delete","put"].includes(method)){
  assert.equal(operation["x-csrf-required"],true,path);
  const headers=operation.parameters.filter(p=>p.in==="header").map(p=>p.name);
  assert.ok(headers.includes("Origin")&&headers.includes("X-CSRF-Token"),path);
 }
}
const ui=readFileSync(s.ui.file,"utf8").trim().split(/\r?\n/);
assert.equal(ui.length-1,s.ui.expectedRoutes);
assert.match(ui.join("\n"),/\/admin\/passkey/);
assert.doesNotMatch(ui.join("\n"),/\/admin\/email-challenge/);
// Historical 18-table/29-op candidate files remain clearly labeled and are NOT runtime migrations.
const historical=readFileSync(meta.historicalCandidates.database,"utf8");
assert.equal((historical.match(/\bCREATE TABLE\s+[a-z_]+/gi)||[]).length,meta.historicalCandidates.databaseTables);
assert.equal(meta.migrations,"APPROVED_TARGET_SCHEMA_REFERENCE_NOT_YET_PRODUCTION_MIGRATED");
console.log(`APPROVED contract consistency: ${ids.length} FR/NFR, ${matches.length} DB-R1 reference tables, ${ops} API-R1 operations / ${paths.length} paths, ${ui.length-1} SSR/UI routes.`);
console.log("Contract approval recorded; runtime implementation and deployment remain separate gates.");
