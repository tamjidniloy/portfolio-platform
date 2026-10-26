import assert from "node:assert/strict";
import { chromium } from "@playwright/test";

// These are reproducible *unthrottled* Linux/Chromium laboratory diagnostics.
// Real-user Core Web Vitals, Lighthouse scoring, Safari and cellular-network
// behavior require separate deployment/staging validation.
const origin=process.env.SMOKE_URL||"http://127.0.0.1:3000";
if(new URL(origin).hostname!=="127.0.0.1"||process.env.CI!=="true") {
  throw new Error("Performance lab is restricted to ephemeral CI loopback.");
}
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||"/usr/bin/google-chrome",
  args:["--no-sandbox","--disable-dev-shm-usage"]});
const measures=[];
try {
  const context=await browser.newContext({reducedMotion:"reduce",colorScheme:"light"});
  const page=await context.newPage();
  const pixel=Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/Iu8AAAAASUVORK5CYII=","base64");
  await page.route("https://images.example.test/**",(route)=>route.fulfill({status:200,contentType:"image/png",body:pixel}));
  await page.addInitScript(()=>{
    window.__sqaVitals={lcpMs:0,cls:0};
    try {
      new PerformanceObserver((list)=>{
        for(const item of list.getEntries())window.__sqaVitals.lcpMs=item.startTime;
      }).observe({type:"largest-contentful-paint",buffered:true});
      new PerformanceObserver((list)=>{
        for(const item of list.getEntries())if(!item.hadRecentInput) window.__sqaVitals.cls+=item.value;
      }).observe({type:"layout-shift",buffered:true});
    } catch { /* Unsupported metrics remain null in the report. */ }
  });
  for(const width of [390,1440]) {
    await page.setViewportSize({width,height:width===390?844:900});
    for(const path of ["/","/brief","/projects/ci-case-study"]) {
      const response=await page.goto(origin+path,{waitUntil:"networkidle"});
      assert.equal(response.status(),200);
      await page.waitForTimeout(350);
      const value=await page.evaluate(()=>{
        const nav=performance.getEntriesByType("navigation")[0];
        const firstPaint=performance.getEntriesByType("paint").find(p=>p.name==="first-contentful-paint");
        const vitals=window.__sqaVitals||{};
        return {
          ttfbMs: nav?Math.round(nav.responseStart-nav.requestStart):null,
          domContentLoadedMs:nav?Math.round(nav.domContentLoadedEventEnd):null,
          fcpMs:firstPaint?Math.round(firstPaint.startTime):null,
          lcpMs:vitals.lcpMs?Math.round(vitals.lcpMs):null,
          cls:typeof vitals.cls==="number"?Number(vitals.cls.toFixed(4)):null,
          resourceCount:performance.getEntriesByType("resource").length,
        };
      });
      measures.push({width,path,...value});
    }
  }
  await context.close();
} finally { await browser.close(); }
console.info("SQA Chromium performance laboratory: "+JSON.stringify(measures));
assert.equal(measures.length,6);
// Lab results are informational, not a claim of real-world LCP/INP/CLS compliance.
