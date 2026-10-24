import assert from "node:assert/strict";
import {performance} from "node:perf_hooks";
const raw=process.env.PERF_BASE_URL||"http://127.0.0.1:3000";
const url=new URL(raw);
if(!["127.0.0.1","localhost","::1"].includes(url.hostname))throw Error("Performance sample restricted to loopback fixture");
const samples=[];
for(let i=0;i<20;i++){
 const t=performance.now();
 const response=await fetch(new URL(i%2?"/projects":"/",url),{signal:AbortSignal.timeout(7000)});
 assert.equal(response.status,200);
 const body=await response.text();
 assert.ok(Buffer.byteLength(body)<1_500_000,"Fixture SSR byte budget exceeded");
 samples.push(Math.round(performance.now()-t));
}
samples.sort((a,b)=>a-b);
const p95=samples[Math.ceil(samples.length*.95)-1];
assert.ok(p95<5000,"Local fixture SSR p95 unexpectedly high: "+p95);
console.log(JSON.stringify({label:"CI LOOPBACK FIXTURE ONLY — NOT REAL CONTENT/CORE WEB VITALS",sample_count:20,p95_ms:p95,min_ms:samples[0],max_ms:samples.at(-1),not_measured:["LCP","INP","CLS","traffic load","production CDN"],production_performance_accepted:false},null,2));
