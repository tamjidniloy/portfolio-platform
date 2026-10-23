import assert from "node:assert/strict";
import test from "node:test";
import { withTransaction } from "../server/persistence/unit-of-work.js";

test("transaction always commits and releases the same connection",async()=>{
  const log=[];const pool={async connect(){return {async query(sql){log.push(sql);return {rows:[]};},release(){log.push("release");}};}};
  const result=await withTransaction(pool,async(client)=>{await client.query("SELECT 1");return 42;});
  assert.equal(result,42);assert.deepEqual(log,["BEGIN","SELECT 1","COMMIT","release"]);
});

test("failed transaction rolls back before releasing",async()=>{
  const log=[];const pool={async connect(){return {async query(sql){log.push(sql);return {};},release(){log.push("release");}};}};
  await assert.rejects(withTransaction(pool,async()=>{throw new Error("boom");}),/boom/);
  assert.deepEqual(log,["BEGIN","ROLLBACK","release"]);
});
