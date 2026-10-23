import { useState } from "react";
import { getCmsPool } from "../../server/cms/pool.js";
import { PublicShell } from "../components/public-shell.jsx";
import { Link } from "react-router";

export async function loader(){
 const pool=getCmsPool();
 if(!pool||process.env.CONTACT_ENABLED!=="true")return Response.json({enabled:false},{
  headers:{"Cache-Control":"no-store"},
 });
 const r=await pool.query("SELECT private_config->>'contactEnabled' AS enabled FROM site_private_config WHERE singleton_id=1");
 const enabled=r.rows[0]?.enabled==="true";
 return Response.json({enabled,notice:enabled?process.env.CONTACT_NOTICE_VERSION:null},{
  headers:{"Cache-Control":"no-store"},
 });
}
export function meta({data}){return [{title:"Contact — DEVFOLIO OS"},{name:"description",content:"Send a private message with explicit privacy consent."},...(data?.enabled?[]:[{name:"robots",content:"noindex,nofollow"}])];}
export default function Contact({loaderData}){
 const {enabled,notice}=loaderData;
 const [busy,setBusy]=useState(false),[result,setResult]=useState(""),[error,setError]=useState("");
 async function submit(event){
  event.preventDefault();setBusy(true);setError("");setResult("");
  const form=new FormData(event.currentTarget);
  try{
   const r=await fetch("/api/v1/contact",{method:"POST",credentials:"same-origin",
    headers:{"Content-Type":"application/json"},body:JSON.stringify({
      name:form.get("name"),email:form.get("email"),message:form.get("message"),
      website:form.get("website"),consent:form.get("consent")==="yes",notice,
    }),
   });
   if(!r.ok)throw new Error(r.status===429?"Too many messages. Try again later.":"Message could not be accepted. Verify the fields and consent.");
   setResult("Your message was stored successfully. Email delivery may happen later.");
   event.currentTarget.reset();
  }catch(e){setError(e.message);}finally{setBusy(false);}
 }
 return <PublicShell><main className="section-content">
  <h1>Contact</h1>
  {enabled?<form onSubmit={submit}>
   <label htmlFor="contact-name">Name</label><input id="contact-name" name="name" required maxLength={120}/>
   <label htmlFor="contact-email">Email address</label><input id="contact-email" type="email" name="email" maxLength={254} required/>
   <label htmlFor="contact-message">Message</label>
   <textarea id="contact-message" name="message" rows={8} maxLength={5000} required/>
   <div hidden aria-hidden="true"><label htmlFor="contact-website">Leave this field empty</label>
    <input id="contact-website" name="website" tabIndex={-1} autoComplete="off"/></div>
   <label><input type="checkbox" name="consent" value="yes" required/>
    I agree to this message and my email being retained for up to 90 days for a response,
    with deletion requests handled through the site owner. I acknowledge privacy notice {notice} and have read the <Link to="/privacy">privacy information</Link>.</label>
   <button type="submit" disabled={busy}>{busy?"Submitting…":"Send message"}</button>
  </form>:<p role="status">The contact form is not accepting messages right now.</p>}
  {result&&<p role="status">{result}</p>}{error&&<p role="alert">{error}</p>}
 </main></PublicShell>;
}
