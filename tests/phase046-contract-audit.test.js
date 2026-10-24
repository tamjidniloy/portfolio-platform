import test from "node:test";
import assert from "node:assert/strict";
import {auditSources,parseCsv} from "../scripts/phase046-contract-audit.mjs";
test("legacy acceptance inventories remain complete and mapped, without fake passes",()=>{
 const r=auditSources();
 assert.equal(r.requirement_count,76);
 assert.equal(r.gap_count,18);
 assert.equal(r.phase02_cases,142);
 assert.equal(r.phase03_cases,318);
 assert.equal(r.case_execution_derived,false);
 assert.equal(r.production_launch_approved,false);
});
test("CSV parser handles quoted commas, embedded quotes and CRLF",()=>{
 assert.deepEqual(parseCsv('id,note\r\nA,"one,two"\r\nB,"say ""hi"""\r\n'),
 [{id:"A",note:"one,two"},{id:"B",note:'say "hi"'}]);
});
test("CSV parser fails closed on malformed data",()=>{
 assert.throws(()=>parseCsv('a,b\n1,"unterminated'),/Unterminated/);
 assert.throws(()=>parseCsv('a,b\n1,2,3\n'),/column count/);
});
