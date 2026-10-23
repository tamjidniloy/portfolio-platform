import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {spawnSync} from "node:child_process";
const read=(p)=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("all mandatory database connections enforce readiness",()=>{
 const server=read("server.js");
 const probes=read("server/probes.js");
 assert.match(server,/createApplicationReadiness\(\{baseCheck:database\.check, cmsPool, publicPool\}\)/);
 assert.match(probes,/Promise\.allSettled/);
 assert.match(probes,/publicPool !== cmsPool/);
});
test("AWS production demands multiple hosts and encrypted private RDS",()=>{
 const tf=read("infra/aws/main.tf");
 assert.match(tf,/resource "aws_autoscaling_group" "app"/);
 assert.match(tf,/min_size\s*= var\.environment == "production" \? 2 : 1/);
 assert.match(tf,/publicly_accessible\s*= false/);
 assert.match(tf,/backup_retention_period\s*= 30/);
 assert.match(tf,/multi_az\s*= var\.environment == "production"/);
 assert.match(tf,/aws_kms_key" "release_signing"/);
 assert.doesNotMatch(tf,/resource "aws_instance" "host"/);
 assert.doesNotMatch(tf,/from_port\s*= 22/);
});
test("OIDC release uses signed immutable bytes and fleet failure rollback",()=>{
 const yaml=read(".github/workflows/phase045-release.yml");
 const deploy=read("ops/aws/deploy-host.sh");
 assert.match(yaml,/workflow_dispatch:/);
 assert.match(yaml,/github\.ref == 'refs\/heads\/main'/);
 assert.match(yaml,/attest-build-provenance@v2/);
 assert.match(yaml,/gh attestation verify/);
 assert.match(yaml,/aws kms sign/);
 assert.match(yaml,/rollback_fleet_on_failure/);
 assert.match(yaml,/updated_instances/);
 assert.match(yaml,/ssm put-parameter/);
 assert.match(deploy,/aws kms verify/);
 assert.match(deploy,/sha256sum --check --status/);
});

test("every embedded deployment workflow shell script is syntactically valid",()=>{
  const lines=read(".github/workflows/phase045-release.yml").split("\n");
  const scripts=[];
  for(let i=0;i<lines.length;i++){
    if(!/^ {8}run: \|$/.test(lines[i]))continue;
    const script=[];
    for(let j=i+1;j<lines.length;j++){
      if(lines[j].trim()===""){script.push("");continue;}
      if(!lines[j].startsWith("          "))break;
      script.push(lines[j].slice(10));
      i=j;
    }
    scripts.push(script.join("\n"));
  }
  assert.ok(scripts.length>=4,"expected guarded release scripts");
  for(const [index,script] of scripts.entries()){
    const result=spawnSync("bash",["-n"],{input:script,encoding:"utf8"});
    assert.equal(result.status,0,"script "+index+": "+result.stderr);
  }
});
