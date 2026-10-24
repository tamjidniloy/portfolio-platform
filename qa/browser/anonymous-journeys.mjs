import assert from "node:assert/strict";
import {chromium} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const origin=process.env.QA_BROWSER_BASE||"http://127.0.0.1:3000";
const u=new URL(origin);
if(!["127.0.0.1","localhost"].includes(u.hostname))throw Error("Browser QA must use isolated loopback fixture only");
const browser=await chromium.launch({channel:"chrome",headless:true});
const failures=[];
const results=[];
try{
 for(const width of [320,390,768,1440]){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:"reduce"});
  const page=await context.newPage();
  try{
   await page.goto(origin+"/",{waitUntil:"networkidle"});
   assert.equal((await page.locator("h1").count())>0,true);
   const measured=await page.evaluate(()=>({client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
   assert.ok(measured.scroll<=measured.client+2,"Home horizontal scrolling at "+width+": "+JSON.stringify(measured));
   await page.keyboard.press("Tab");
   const focused=await page.evaluate(()=>document.activeElement?.textContent?.trim());
   assert.match(focused||"",/Skip to content/);
   results.push({case:"responsive-home-keyboard",viewport:width,status:"PASS"});
  }finally{await context.close();}
 }
 for(const route of ["/","/projects","/research","/contact","/privacy"]){
  const context=await browser.newContext({viewport:{width:390,height:850},reducedMotion:"reduce"});
  const page=await context.newPage();
  try{
   const response=await page.goto(origin+route,{waitUntil:"networkidle"});
   assert.equal(response.status(),200);
   assert.equal(await page.getByRole("main").count(),1,"One main landmark expected "+route);
   const headings=await page.locator("h1").count();
   assert.ok(headings>0,"Expected page title "+route);
   const resultsAxe=await new AxeBuilder({page}).withTags(["wcag2a","wcag2aa","wcag21aa","wcag22aa"]).analyze();
   const critical=resultsAxe.violations.filter(x=>x.impact==="critical"||x.impact==="serious");
   if(critical.length)failures.push({route,violations:critical.map(v=>({id:v.id,impact:v.impact,targets:v.nodes.map(n=>n.target).slice(0,5)}))});
   results.push({case:"axe-wcag-a-aa-automated",route,rule_count:resultsAxe.passes.length,violations:resultsAxe.violations.length,serious_or_critical:critical.length});
  }finally{await context.close();}
 }
 const anonContext=await browser.newContext();
 const anon=await anonContext.newPage();
 try{
  const admin=await anon.goto(origin+"/admin");
  assert.equal(admin.status(),200,"Anonymous admin should redirect to the public login form");
  assert.ok(anon.url().endsWith("/admin/login"),"Anonymous admin must redirect to login, never show dashboard");
  assert.equal(await anon.getByText("Publish updates").count(),0,"Private editor must not render without authentication");
  const bad=await anon.goto(origin+"/api/v1/auth/password");
  assert.equal(bad.status(),404,"Deprecated password route must not be active");
 }finally{await anonContext.close();}
 assert.deepEqual(failures,[],"Serious/critical automated accessibility violations: "+JSON.stringify(failures));
 console.log(JSON.stringify({status:"PASS",scope:"anonymous Chromium headless / automated axe / fixture only",
  tested_automated_wcag:true,manual_keyboard_at_screenreader_signoff:false,recorded:results},null,2));
}finally{await browser.close();}
