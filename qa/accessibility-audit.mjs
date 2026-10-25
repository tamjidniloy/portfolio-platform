import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const base=process.env.SMOKE_URL||"http://127.0.0.1:3000";
if(new URL(base).hostname!=="127.0.0.1"||process.env.CI!=="true") throw new Error("Accessibility QA is restricted to disposable CI loopback.");
const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_BIN||"/usr/bin/google-chrome",
  args:["--no-sandbox","--disable-dev-shm-usage"]});
const targets=["/","/projects/ci-case-study","/brief","/lab","/privacy","/admin/login"];
const allResults=[];
const runtimeErrors=[];
try {
  const ctx=await browser.newContext({reducedMotion:"reduce"});
  const page=await ctx.newPage();
  const pixel=Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/Iu8AAAAASUVORK5CYII=","base64");
  await page.route("https://images.example.test/**",(route)=>route.fulfill({status:200,contentType:"image/png",body:pixel}));
  page.on("pageerror",(err)=>runtimeErrors.push(err.message));
  for(const width of [390,1440]) {
    await page.setViewportSize({width,height:width===390?844:900});
    for(const theme of ["light","dark"]) {
      for(const path of targets) {
        const response=await page.goto(base+path,{waitUntil:"networkidle"});
        assert.equal(response.status(),200,"Accessible route resolves: "+path);
        await page.locator("html").evaluate((el,scheme)=>el.setAttribute("data-color-mode",scheme),theme);
        await page.evaluate(()=>document.fonts.ready);
        const analysis=await new AxeBuilder({page}).withTags([
          "wcag2a","wcag2aa","wcag21a","wcag21aa","wcag22aa"
        ]).analyze();
        const violations=analysis.violations.map(v=>({
          id:v.id,impact:v.impact,description:v.help,
          targets:v.nodes.slice(0,3).map(n=>n.target.join(" ")),
        }));
        allResults.push({path,theme,width,passed:analysis.passes.length,violations});
        const bodyOverflow=await page.evaluate(()=>Math.max(0,document.documentElement.scrollWidth-window.innerWidth));
        assert.ok(bodyOverflow<=2,"Horizontal overflow "+path+"/"+theme+"/"+width+": "+bodyOverflow);
      }
    }
  }
  await ctx.close();
} finally { await browser.close(); }
console.info("SQA WCAG 2.x AA automated matrix: "+JSON.stringify(allResults));
assert.deepEqual(runtimeErrors,[],"No uncaught browser runtime errors");
const allFailures=allResults.filter(entry=>entry.violations.length);
assert.deepEqual(allFailures,[],"No automated WCAG A/AA violations in tested viewport and color-mode matrix");
console.info("SQA browser accessibility matrix passed: 24 route/viewport/mode combinations.");
// Automated axe coverage is NOT equivalent to complete WCAG conformance or screen-reader/manual testing.
