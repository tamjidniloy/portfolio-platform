import assert from "node:assert/strict";
import test from "node:test";
import { isPublicPath, toPublicDto, readPublishedByPath, listPublished } from "../server/persistence/published-reader.js";

test("published-reader strips private fields even when JSONB includes them", () => {
  const dto = toPublicDto({slug:"sample",title:"Sample",summary:"Verified",password_hash:"PRIVATE", notes:"DRAFT"});
  assert.deepEqual(dto, {slug:"sample",title:"Sample",summary:"Verified"});
  assert.equal(JSON.stringify(dto).includes("PRIVATE"),false);
});

test("public paths are canonical and don't allow admin, query or traversals", () => {
  assert.equal(isPublicPath("/projects/verified"),true);
  for(const path of ["", "/projects//foo", "http://x", "/../admin", "/projects?secret=x", "/projects#draft"]) {
    assert.equal(isPublicPath(path),false);
  }
});

test("reader uses only published projection table and parameterized query", async () => {
  const queries=[];
  const adapter={async query(sql,params){queries.push({sql,params});return {rows:[{public_payload:{slug:"work",title:"Real work",summary:"Published",token:"private"}}]};}};
  const result=await readPublishedByPath(adapter,"/projects/work");
  assert.deepEqual(result, {slug:"work",title:"Real work",summary:"Published"});
  assert.equal(queries.length,1);
  assert.match(queries[0].sql,/FROM published_snapshots/);
  assert.equal(queries[0].sql.includes("content_revisions"),false);
  assert.deepEqual(queries[0].params,["/projects/work"]);
  assert.equal(await readPublishedByPath(adapter,"/../private"),null);
  assert.equal(queries.length,1);
});

test("public list has bounded pagination and omit invalid records",async()=>{
  const adapter={async query(sql,params){assert.deepEqual(params,[10,0]);return {rows:[{public_payload:{slug:"ok",title:"OK",summary:"Safe"}},{public_payload:{secret:"private"}}]};}};
  assert.equal((await listPublished(adapter,{limit:10})).length,1);
  await assert.rejects(()=>listPublished(adapter,{limit:500}),RangeError);
});
