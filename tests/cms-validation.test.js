import assert from "node:assert/strict";
import test from "node:test";
import { projectPublicRevision, validateDraft } from "../domain/cms/content-contract.js";
const base={title:"Factual work",summary:"A reproducible project",slug:"factual-work"};
test("each CMS publication type requires its own validated evidence",()=>{
 const domains=[
  ["profile",{biography:"Verifiable professional biography"}],
  ["site_settings",{publicTitle:"Approved site title"}],
  ["project",{role:"Engineer",problem:"Clear problem",approach:"Tested approach",outcome:"Evidence-backed outcome",limitations:"Known caveats"}],
  ["research",{researchStatus:"in_progress",researchQuestion:"What happened?",methods:"Reproducible methods",results:"Observed result",limitations:"Small sample"}],
  ["publication",{venue:"Documented source",publicationType:"preprint"}],
  ["article",{body:"Plain text body that React escapes"}],
  ["education",{institution:"Verified institution",qualification:"Verified diploma"}],
  ["experience",{organization:"Verified organization",role:"Verified role"}],
  ["skill",{category:"Engineering"}],
  ["achievement",{issuer:"Verification source"}],
  ["social_link",{platform:"GitHub",url:"https://github.com/example"}],
  ["resume",{mediaAssetId:"550e8400-e29b-41d4-a716-446655440000"}],
  ["open_source",{repository:"https://github.com/example/repo",contribution:"Documented contribution"}],
 ];
 for(const [type,extra] of domains){
  assert.throws(()=>projectPublicRevision(type,base),e=>e.status===422,type+" must reject missing data");
  const ready=projectPublicRevision(type,{...base,...extra});
  assert.equal(ready.publicPayload.title,base.title);
  assert.equal(ready.publicPayload.privateNote,undefined);
 }
});
test("drafts may be incomplete while publication rejects unverified claims and unsafe URLs",()=>{
 assert.deepEqual(validateDraft("project",{title:"Draft",slug:""}),{title:"Draft",slug:""});
 assert.throws(()=>projectPublicRevision("research",{...base,researchStatus:"published",researchQuestion:"Question",methods:"Methods",results:"Results",limitations:"Limitations"}),e=>e.status===422);
 assert.ok(projectPublicRevision("research",{...base,researchStatus:"published",researchQuestion:"Question",methods:"Methods",results:"Results",limitations:"Limitations",evidenceUrl:"https://doi.org/10.1000/test"}));
 assert.throws(()=>validateDraft("social_link",{url:"javascript:alert(1)"}),e=>e.status===422);
 assert.throws(()=>validateDraft("open_source",{repository:"http://localhost/private"}),e=>e.status===422);
});
