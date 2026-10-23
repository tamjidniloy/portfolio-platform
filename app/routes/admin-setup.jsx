import { useState } from "react";
import { Link } from "react-router";
import { startRegistration } from "@simplewebauthn/browser";
import { getCmsPool } from "../../server/cms/pool.js";
export function loader(){
 if(!getCmsPool()||process.env.CMS_AUTH_ENABLED!=="true")throw new Response("Not found",{status:404});
 return Response.json({ready:true},{headers:{"Cache-Control":"no-store","X-Robots-Tag":"noindex,nofollow"}});
}
export function meta(){return [{title:"Secure owner setup — DEVFOLIO OS"},{name:"robots",content:"noindex,nofollow"}];}
async function post(path,data){
 const r=await fetch("/api/v1"+path,{
  method:"POST",headers:{"Content-Type":"application/json"},
  body:JSON.stringify(data),credentials:"same-origin",
 });
 if(!r.ok)throw new Error("Unable to verify the one-time enrollment ceremony.");
 return r.json();
}
export default function AdminSetup(){
 const [token,setToken]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState("");
 async function submit(event){
  event.preventDefault();setBusy(true);setError("");
  try{
   const options=await post("/auth/bootstrap/options",{bootstrapToken:token});
   const credential=await startRegistration({optionsJSON:options.publicKey});
   await post("/auth/bootstrap/verify",{challengeId:options.challengeId,credential});
   setToken("");window.location.assign("/admin");
  }catch(e){setError(e.message||"Setup unsuccessful");setBusy(false);}
 }
 return <main className="section-content">
  <h1>One-time owner setup</h1>
  <p>This page requires the one-time token printed by the restricted <code>npm run auth:bootstrap</code> command.
   The token is not sent by email and does not grant access without a verified passkey.</p>
  <form onSubmit={submit}>
   <label htmlFor="owner-bootstrap">One-time owner token</label>
   <input id="owner-bootstrap" name="bootstrap" type="password" autoComplete="off" required
    minLength={43} maxLength={43} value={token} onChange={e=>setToken(e.target.value)}/>
   <button type="submit" disabled={busy}>{busy?"Registering…":"Register owner passkey"}</button>
  </form>
  {error&&<p role="alert">{error}</p>}
  <p><Link to="/admin/login">Already registered? Sign in</Link></p>
 </main>;
}
