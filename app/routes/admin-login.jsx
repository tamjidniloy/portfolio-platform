import { useState } from "react";
import { Link } from "react-router";
import { startAuthentication } from "@simplewebauthn/browser";
import { getCmsPool } from "../../server/cms/pool.js";
export function loader(){
  if(!getCmsPool()||process.env.CMS_AUTH_ENABLED!=="true")throw new Response("Not found",{status:404});
  return Response.json({ready:true},{headers:{"Cache-Control":"no-store","X-Robots-Tag":"noindex,nofollow"}});
}
export function meta(){return [{title:"Owner sign-in — DEVFOLIO OS"},{name:"robots",content:"noindex,nofollow"}];}
async function post(path,data){
 const response=await fetch("/api/v1"+path,{
  method:"POST",headers:{"Content-Type":"application/json"},credentials:"same-origin",body:JSON.stringify(data),
 });
 if(!response.ok)throw new Error("Unable to complete secure sign-in. Check your passkey and try again.");
 return response.json();
}
export default function AdminLogin(){
 const [busy,setBusy]=useState(false),[error,setError]=useState("");
 async function submit(){
  setBusy(true);setError("");
  try{
   const options=await post("/auth/passkey/options",{});
   const credential=await startAuthentication({optionsJSON:options.publicKey});
   await post("/auth/passkey/verify",{challengeId:options.challengeId,credential});
   window.location.assign("/admin");
  }catch(e){setError(e.message||"Passkey authentication was unsuccessful");setBusy(false);}
 }
 return <main className="section-content">
  <h1>Owner sign-in</h1>
  <p>Sign in with a registered passkey. WebAuthn requires your authenticator and user verification.</p>
  <button type="button" onClick={submit} disabled={busy}>{busy?"Authenticating…":"Sign in with passkey"}</button>
  {error&&<p role="alert">{error}</p>}
  <p>First owner enrollment? <Link to="/admin/setup">Complete secure setup</Link>.</p>
 </main>;
}
