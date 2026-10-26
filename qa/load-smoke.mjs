import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";

// Bounded reliability smoke, not a capacity benchmark. Use only disposable CI.
const origin=process.env.SMOKE_URL||"http://127.0.0.1:3000";
if(new URL(origin).hostname!=="127.0.0.1"||process.env.CI!=="true") {
  throw new Error("Reliability probes must run on ephemeral CI loopback only.");
}
const routes=["/","/brief","/lab","/api/studio/public","/projects/ci-case-study"];
const stats=new Map(routes.map(path=>[path,[]]));
let completed=0;
const errors=[];
const jobCount=120;
const workers=6;
const start=performance.now();
async function worker(id) {
  for(let i=id;i<jobCount;i+=workers) {
    const path=routes[i%routes.length];
    const since=performance.now();
    try {
      const response=await fetch(new URL(path,origin),{signal:AbortSignal.timeout(12000)});
      const text=await response.text();
      const elapsed=performance.now()-since;
      stats.get(path).push(elapsed);
      if(response.status!==200||text.length<10)errors.push({path,status:response.status,bodyLength:text.length});
      else completed++;
    } catch(error) {
      errors.push({path,message:error.message});
    }
  }
}
await Promise.all(Array.from({length:workers},(_,i)=>worker(i)));
const elapsed=performance.now()-start;
assert.deepEqual(errors,[],"No errors in bounded concurrent HTTP requests");
assert.equal(completed,jobCount);
const summary={requests:completed,concurrency:workers,totalMs:Math.round(elapsed),routes:{}};
for(const [path,values] of stats) {
  values.sort((a,b)=>a-b);
  const p50=values[Math.floor((values.length-1)*.50)];
  const p95=values[Math.floor((values.length-1)*.95)];
  summary.routes[path]={count:values.length,p50Ms:Math.round(p50),p95Ms:Math.round(p95),maxMs:Math.round(values.at(-1))};
  assert.ok(p95<=8000,"P95 on local CI should be under 8s for "+path+": "+p95.toFixed(1));
}
console.info("SQA bounded concurrency report: "+JSON.stringify(summary));
// This does NOT establish public Internet, production peak capacity or Core Web Vitals.
