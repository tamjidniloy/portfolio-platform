import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {evaluateLaunch,minimumExternal,required} from "../scripts/phase046-launch-gate.mjs";

test("actual Phase 04.6 launch is explicitly NO_GO until verified",()=>{
 const r=JSON.parse(readFileSync("docs/phase04/04.6_RELEASE_EVIDENCE.json","utf8"));
 const evaluated=evaluateLaunch(r);
 assert.equal(evaluated.decision,"NO_GO");
 assert.ok(evaluated.open_count>=11);
 assert.ok(evaluated.blockers.some(s=>s.includes("owner GO")||s.includes("owner_go_no_go")));
});
test("missing, duplicated or undated evidence cannot create a GO",()=>{
 const good={schema_version:1,items:required.map(id=>({id,status:"VERIFIED",evidence_url:"https://example.invalid/case",reviewer:"Test",verified_at:"2026-10-24"})),
 external_gates:Object.fromEntries(minimumExternal.map(x=>[x,{status:"VERIFIED",evidence_url:"https://example.invalid/report",reviewer:"Test",verified_at:"2026-10-24"}])),
 explicit_owner_decision:"GO",unmitigated_critical_count:0,unmitigated_high_count:0};
 assert.equal(evaluateLaunch(good).decision,"CANDIDATE_GO_PENDING_EXTERNAL_EVIDENCE_AUTHENTICITY");
 good.items.pop();assert.equal(evaluateLaunch(good).decision,"NO_GO");
 good.items.push(good.items[0]);assert.equal(evaluateLaunch(good).decision,"NO_GO");
});
