import assert from "node:assert/strict";
import {readFileSync,writeFileSync} from "node:fs";

export function parseCsv(source) {
  const rows=[];let row=[],value="",quoted=false;
  for(let i=0;i<source.length;i++){
    const ch=source[i];
    if(ch==='"'){
      if(quoted&&source[i+1]==='"'){value+='"';i++;}else quoted=!quoted;
    } else if(ch===","&&!quoted){row.push(value);value="";}
    else if((ch==="\n"||ch==="\r")&&!quoted){
      if(ch==="\r"&&source[i+1]==="\n")i++;
      if(row.length||value){row.push(value);rows.push(row);row=[];value="";}
    } else value+=ch;
  }
  if(quoted)throw new Error("Unterminated quoted CSV field");
  if(row.length||value){row.push(value);rows.push(row);}
  if(rows.length<2)throw Error("No CSV records");
  const keys=rows.shift();
  return rows.map((r,index)=>{
    assert.equal(r.length,keys.length,"CSV column count mismatch on row "+(index+2));
    return Object.fromEntries(keys.map((k,i)=>[k,r[i]]));
  });
}
const sources=[
  ["requirement","docs/phase03/07_FINAL_ARCHITECTURE_HANDOFF/matrices/FR_NFR_TRACEABILITY_76.csv",76,"requirement_id"],
  ["gap","docs/phase01/traceability/PROPOSED_MISSING_ACCEPTANCE_TESTS.csv",18,"proposed_test_id"],
  ["phase02","design/phase02/qa/MASTER_QA_REGISTER.csv",142,"id"],
  ["architecture32","docs/phase03/02_DETAILED_COMPONENT_ARCHITECTURE/matrices/QA_REVIEW_REGISTER.csv",42,"id"],
  ["database33","docs/phase03/03_DATABASE_ARCHITECTURE/review/QA_REGISTER.csv",40,"Check ID"],
  ["api34","docs/phase03/04_API_ARCHITECTURE/review/API34_QA_REGISTER.csv",60,"case_id"],
  ["security35","docs/phase03/05_AUTHENTICATION_SECURITY/review/SECURITY_TEST_REGISTER.csv",80,"test_id"],
  ["devops36","docs/phase03/06_DEPLOYMENT_INFRASTRUCTURE/review/DEVOPS_QA_REGISTER.csv",96,"test_id"],
];
export function auditSources(load=(path)=>readFileSync(path,"utf8")){
  const register={};
  for(const [label,path,expected,key] of sources){
    const rows=parseCsv(load(path));
    assert.equal(rows.length,expected,label+" source count mismatch");
    const ids=rows.map(r=>r[key]);
    assert.equal(new Set(ids).size,expected,label+" duplicate ID");
    for(const id of ids)assert.ok(typeof id==="string"&&id.length>2,label+" blank ID");
    register[label]={source:path,total:rows.length,identifiers:ids};
  }
  const requirements=register.requirement.identifiers;
  assert.deepEqual(requirements.filter(id=>id.startsWith("FR-")),Array.from({length:52},(_,i)=>"FR-"+String(i+1).padStart(3,"0")));
  assert.deepEqual(requirements.filter(id=>id.startsWith("NFR-")),Array.from({length:24},(_,i)=>"NFR-"+String(i+1).padStart(3,"0")));
  const gaps=parseCsv(load(sources[1][1]));
  for(const gap of gaps)assert.ok(requirements.includes(gap.requirement_id),"Unmapped gap requirement: "+gap.requirement_id);
  const inherited=["architecture32","database33","api34","security35","devops36"].reduce((s,k)=>s+register[k].total,0);
  assert.equal(inherited,318);
  return {requirement_count:76,gap_count:18,phase02_cases:142,phase03_cases:318,total_inherited_cases:460,
    inventory_checked:true,case_execution_derived:false,real_browser_wcag_verified:false,
    real_staging_verified:false,production_launch_approved:false,
    source_counts:Object.fromEntries(Object.entries(register).map(([k,v])=>[k,v.total]))};
}
if(process.argv[1]&&import.meta.url===new URL("file://"+process.argv[1]).href){
  const report=auditSources();
  if(process.argv.includes("--report")){
    const i=process.argv.indexOf("--report");
    if(!process.argv[i+1])throw Error("Missing report path");
    writeFileSync(process.argv[i+1],JSON.stringify({...report,git_sha:process.env.GITHUB_SHA||null,verification_run_url:process.env.GITHUB_RUN_ID&&process.env.GITHUB_REPOSITORY?"https://github.com/"+process.env.GITHUB_REPOSITORY+"/actions/runs/"+process.env.GITHUB_RUN_ID:null},null,2)+"\n");
  }
  console.log(JSON.stringify(report,null,2));
}
