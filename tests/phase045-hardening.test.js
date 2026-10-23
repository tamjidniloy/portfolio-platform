import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
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
