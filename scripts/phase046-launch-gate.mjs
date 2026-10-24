import {readFileSync} from "node:fs";

export const required=["P4-054","P4-055","P4-056","P4-057","P4-058","P4-059","P4-060","P4-061","P4-062"];
export const minimumExternal=["hosting_and_cost","real_staging","owner_passkey","real_providers","browser_at","field_cwv","backup_restore","deploy_rollback","security_review","legal_content","owner_go_no_go"];
export function evaluateLaunch(record) {
 const reasons=[];
 if(record?.schema_version!==1)reasons.push("Unsupported release evidence schema");
 if(!Array.isArray(record?.items))reasons.push("Item evidence register missing");
 for(const id of required){
  const matches=record?.items?.filter(x=>x.id===id)||[];
  if(matches.length!==1)reasons.push(id+": item missing or duplicated");
  else if(matches[0].status!=="VERIFIED"||typeof matches[0].evidence_url!=="string"||
    !/^https:\/\//.test(matches[0].evidence_url)||!matches[0].reviewer||!matches[0].verified_at){
    reasons.push(id+": requires dated reviewer-approved externally verifiable evidence");
  }
 }
 for(const key of minimumExternal){
  const item=record?.external_gates?.[key];
  if(!item||item.status!=="VERIFIED"||typeof item.evidence_url!=="string"||
    !/^https:\/\//.test(item.evidence_url)||!item.reviewer||!item.verified_at){
    reasons.push("External gate not verified: "+key);
  }
 }
 if(record?.explicit_owner_decision!=="GO")reasons.push("Explicit owner GO not recorded");
 if(record?.unmitigated_critical_count!==0)reasons.push("Critical vulnerability count not independently cleared");
 if(record?.unmitigated_high_count!==0)reasons.push("High vulnerability count not independently cleared");
 return {decision:reasons.length?"NO_GO":"CANDIDATE_GO_PENDING_EXTERNAL_EVIDENCE_AUTHENTICITY",open_count:reasons.length,blockers:reasons};
}
const isMain=new URL(process.argv[1]&&"file://"+process.argv[1]||"file:///missing").href===import.meta.url;
if(isMain){
 const file=process.argv.find(x=>x.endsWith(".json"))||"docs/phase04/04.6_RELEASE_EVIDENCE.json";
 const record=JSON.parse(readFileSync(file,"utf8"));
 const result=evaluateLaunch(record);
 console.log(JSON.stringify(result,null,2));
 if(process.argv.includes("--require-go")){
  // Never treat a self-reported JSON as sufficient authorization to deploy.
  console.error("Production cutover is intentionally forbidden from this CI utility; independent owner/provider action required.");
  process.exitCode=2;
 }
}
