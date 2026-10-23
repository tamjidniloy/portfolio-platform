import { useState } from "react";
import { Link, useLoaderData } from "react-router";
import { startRegistration } from "@simplewebauthn/browser";
import { requireOwnerRoute } from "../../server/cms/route-guard.js";
export async function loader({request}){
 const {csrfToken,pool,session}=await requireOwnerRoute(request);
 const credentials=await pool.query(
  "SELECT id,device_label,created_at FROM webauthn_credentials WHERE admin_user_id=$1::uuid AND revoked_at IS NULL ORDER BY created_at DESC",
  [session.ownerId],
 );
 return Response.json({csrfToken,credentials:credentials.rows},{headers:{"Cache-Control":"no-store","X-Robots-Tag":"noindex,nofollow"}});
}
export function meta(){return [{title:"Owner security — DEVFOLIO OS"},{name:"robots",content:"noindex,nofollow"}];}
export default function AdminSecurity(){
 const {csrfToken,credentials}=useLoaderData();
 const [codes,setCodes]=useState([]),[error,setError]=useState(""),[busy,setBusy]=useState(false);
 async function post(path,body){
  const r=await fetch("/api/v1"+path,{method:"POST",headers:{
   "Content-Type":"application/json","X-CSRF-Token":csrfToken},
   credentials:"same-origin",body:JSON.stringify(body),
  });
  if(!r.ok)throw new Error("Security operation failed. Recent passkey authentication may be required.");
  return r.json();
 }
 async function enroll(){
  setError("");setBusy(true);
  try{
   const options=await post("/admin/passkeys/options",{});
   const credential=await startRegistration({optionsJSON:options.publicKey});
   await post("/admin/passkeys",{challengeId:options.challengeId,credential});
   window.location.reload();
  }catch(e){setError(e.message);setBusy(false);}
 }
 async function revokeCredential(id){
  if(!window.confirm("Revoke this passkey? You must keep another active passkey."))return;
  setError("");setBusy(true);
  try{
   const r=await fetch("/api/v1/admin/passkeys/"+encodeURIComponent(id),{
    method:"DELETE",credentials:"same-origin",headers:{"X-CSRF-Token":csrfToken},
   });
   if(!r.ok)throw new Error("Could not revoke credential. A second passkey and recent login are required.");
   window.location.reload();
  }catch(e){setError(e.message);setBusy(false);}
 }
 async function rotate(){
  setError("");setBusy(true);
  try{
   const result=await post("/admin/recovery-codes/rotate",{});
   setCodes(result.codes);setBusy(false);
  }catch(e){setError(e.message);setBusy(false);}
 }
 async function logout(){
  setError("");
  try{
   const r=await fetch("/api/v1/auth/logout",{method:"POST",credentials:"same-origin",headers:{"X-CSRF-Token":csrfToken}});
   if(!r.ok)throw Error();
   window.location.assign("/admin/login");
  }catch{setError("Sign-out failed. Try again.");}
 }
 return <main className="section-content">
  <p><Link to="/admin">← Back to content workspace</Link></p>
  <h1>Passkeys and recovery</h1>
  <p>Use a separate backup passkey before rotating recovery codes. Security changes require recent authentication.</p>
  <h2>Registered passkeys</h2>
  <ul>{credentials.map(x=><li key={x.id}>{x.device_label||"Registered authenticator"} (created {new Date(x.created_at).toLocaleDateString()}) <button type="button" disabled={busy||credentials.length<2} onClick={()=>revokeCredential(x.id)}>Revoke</button></li>)}</ul>
  <button type="button" disabled={busy} onClick={enroll}>Register another passkey</button>
  <h2>Offline recovery codes</h2>
  <button type="button" disabled={busy} onClick={rotate}>Rotate and show recovery codes once</button>
  {codes.length>0&&<section aria-label="One-time recovery codes">
   <p>Store these offline immediately. They will not appear again.</p>
   <ol>{codes.map(code=><li key={code}><code>{code}</code></li>)}</ol>
  </section>}
  <p><button type="button" onClick={logout}>Sign out securely</button></p>
  {error&&<p role="alert">{error}</p>}
 </main>;
}
