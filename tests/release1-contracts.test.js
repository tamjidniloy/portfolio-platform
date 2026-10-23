import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("owner-approved machine API has exactly 37 operations with no email OTP endpoints",async()=>{
 const source=JSON.parse(await readFile("contracts/release1/openapi.json","utf8"));
 const ops=Object.values(source.paths).flatMap(x=>Object.entries(x));
 assert.equal(ops.length,37);
 assert.equal(Object.keys(source.paths).length,33);
 for(const key of Object.keys(source.paths))assert.equal(key.includes("/auth/email"),false);
 assert.ok(source.paths["/api/v1/auth/passkey/verify"]?.post);
 assert.ok(source.paths["/api/v1/admin/content/{id}/publish"]?.post);
});
test("approved contract registry distinguishes design approval from runtime completion",async()=>{
 const x=JSON.parse(await readFile("contracts/phase04-baselines.json","utf8"));
 assert.equal(x.status,"OWNER_APPROVED_SPEC");
 assert.equal(x.runtimeCompletion,false);
 assert.equal(x.sources.database.expectedTables,19);
 assert.equal(x.sources.api.expectedOperations,37);
});
