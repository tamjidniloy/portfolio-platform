import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import express from "express";
import {trustedProxySubnet} from "../server/network/trusted-proxy.js";

const read = (path) => readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("reverse-proxy configuration must be explicit, scoped and private",()=>{
  assert.equal(trustedProxySubnet(),null);
  assert.equal(trustedProxySubnet("10.62.0.0/16"),"10.62.0.0/16");
  assert.equal(trustedProxySubnet("172.18.0.0/24"),"172.18.0.0/24");
  assert.equal(trustedProxySubnet("192.168.50.0/24"),"192.168.50.0/24");
  for(const bad of ["true","0.0.0.0/0","1.1.1.1/32","8.8.8.8/8","192.0.2.0/24","10.0.0.0/0","256.1.2.3/20","127.0.0.0/8"]){
    assert.throws(()=>trustedProxySubnet(bad),/TRUST_PROXY_CIDR/,"bad CIDR "+bad);
  }
});
test("unknown X-Forwarded-For never becomes trusted without a configured gateway",async(t)=>{
  const app=express();
  app.get("/fixture",(req,res)=>res.json({ip:req.ip}));
  const server=await new Promise(resolve=>{const s=app.listen(0,"127.0.0.1",()=>resolve(s));});
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  const url="http://127.0.0.1:"+server.address().port+"/fixture";
  const untrusted=await fetch(url,{headers:{"X-Forwarded-For":"203.0.113.8"}}).then(r=>r.json());
  assert.notEqual(untrusted.ip,"203.0.113.8","spoofed client IP must be ignored");
  app.set("trust proxy",trustedProxySubnet("127.0.0.1/32"));
  const trusted=await fetch(url,{headers:{"X-Forwarded-For":"203.0.113.8"}}).then(r=>r.json());
  assert.equal(trusted.ip,"203.0.113.8");
});
test("the contact service uses Express verified req.ip, never the ALB socket only",()=>{
  const contact=read("server/integrations/contact.js");
  const srv=read("server.js");
  const data=read("infra/aws/user-data.sh.tftpl");
  assert.match(contact,/digestClientIp\(req\.ip\|\|req\.socket\.remoteAddress/);
  assert.match(srv,/app\.set\("trust proxy", proxySubnet\)/);
  assert.match(data,/Environment=TRUST_PROXY_CIDR=10\.62\.0\.0\/16/);
});
test("neither ASG initialization nor release SSM executes artifact scripts before KMS verification",()=>{
  const boot=read("infra/aws/user-data.sh.tftpl");
  const workflow=read(".github/workflows/phase045-release.yml");
  const block=workflow.slice(workflow.indexOf("deploy_instance() {"),workflow.indexOf("rollback_fleet_on_failure()"));
  assert.ok(block.length>400);
  for(const [name,script] of [["ASG bootstrap",boot],["SSM rollout",block]]){
    const kms=script.indexOf("aws kms verify");
    const extract=script.indexOf("tar -xOzf");
    assert.ok(kms>=0&&extract>=0&&kms<extract,name+" must verify KMS prior to extracting attacker-controlled shell");
    const sha=script.indexOf("sha256sum --check --status");
    assert.ok(sha>=0&&sha<kms,name+" must verify SHA before signature verification");
  }
  assert.match(workflow,/aws s3 cp s3:\/\/\$AWS_RELEASE_BUCKET\/releases\/\$TARGET_ENV\/\$target_sha\.sig/);
});
test("failed release restores both previous code AND previous runtime credentials",()=>{
  const deploy=read("ops/aws/deploy-host.sh");
  assert.match(deploy,/trap 'rm -rf "\$temp"; rm -f \/etc\/devfolio\/runtime\.env\.next' EXIT/);
  assert.match(deploy,/cp -p \/etc\/devfolio\/runtime\.env "\$temp\/previous-runtime\.env"/);
  assert.match(deploy,/cp -p "\$temp\/previous-runtime\.env" \/etc\/devfolio\/runtime\.env/);
  assert.match(deploy,/if ! systemctl restart devfolio\.service; then\s*[\s\S]*?rollback_previous_release/);
  assert.match(deploy,/if \[\[ "\$healthy" != 1 \]\]; then\s*[\s\S]*?rollback_previous_release/);
  assert.ok(deploy.indexOf("aws kms verify")<deploy.indexOf("mv -f /etc/devfolio/runtime.env.next /etc/devfolio/runtime.env"));
  assert.ok(deploy.indexOf("chown -R root:devfolio")<deploy.indexOf("systemctl restart devfolio.service"));
  assert.doesNotMatch(deploy,/chown -R devfolio:devfolio/);
});
test("Phase 4 62-item status register remains exact and keeps production separate from owner acceptance",()=>{
  const rows=read("docs/phase04/PHASE04_LIVE_STATUS.csv").trim().split("\n");
  assert.equal(rows.length,63);
  const values=rows.slice(1).map(x=>x.split(","));
  assert.deepEqual(values.map(v=>v[0]),Array.from({length:62},(_,i)=>"P4-"+String(i+1).padStart(3,"0")));
  assert.ok(values.filter(v=>v[1]==="04.6").length===9);
  assert.ok(values.filter(v=>v[1]==="04.5").every(v=>v[3].includes("PENDING")));
  assert.ok(values.filter(v=>v[1]==="04.6").every(v=>v[3].includes("LIVE_RELEASE_QA_OPEN")));
});
