import { useState } from "react";
import { Link, useLoaderData } from "react-router";
import { requireOwnerRoute } from "../../server/cms/route-guard.js";
import { listMedia } from "../../server/integrations/media-service.js";

export async function loader({request}){
  const {pool,session,csrfToken}=await requireOwnerRoute(request);
  const media=await listMedia(pool,session);
  return Response.json({...media,csrfToken},{headers:{"Cache-Control":"no-store","X-Robots-Tag":"noindex,nofollow"}});
}
export function meta(){return [{title:"Private media — DEVFOLIO OS"},{name:"robots",content:"noindex,nofollow"}];}
async function postJson(url,body,csrf){
  const response=await fetch(url,{method:"POST",credentials:"same-origin",
    headers:{"Content-Type":"application/json","X-CSRF-Token":csrf},
    body:JSON.stringify(body),
  });
  if(!response.ok)throw new Error("Private upload request failed. Verify storage/provider configuration.");
  return response.json();
}
export default function AdminMedia(){
  const {items,csrfToken}=useLoaderData();
  const [file,setFile]=useState(null),[busy,setBusy]=useState(false),[error,setError]=useState("");
  async function upload(event){
    event.preventDefault();
    if(!file)return;
    setBusy(true);setError("");
    try{
      const bytes=await file.arrayBuffer();
      const digest=await crypto.subtle.digest("SHA-256",bytes);
      const sha256=[...new Uint8Array(digest)].map(n=>n.toString(16).padStart(2,"0")).join("");
      const intent=await postJson("/api/v1/admin/media/intents",{
        name:file.name,mime:file.type,size:file.size,sha256,
      },csrfToken);
      const form=new FormData();
      for(const [key,value] of Object.entries(intent.upload.fields))form.append(key,value);
      form.append("file",file,file.name);
      const object=await fetch(intent.upload.url,{method:"POST",body:form});
      if(!object.ok)throw new Error("Object-storage upload failed. Check bucket CORS/permissions.");
      await postJson("/api/v1/admin/media/"+encodeURIComponent(intent.id)+"/finalize",{},csrfToken);
      window.location.reload();
    }catch(e){setError(e.message||"Upload failed");setBusy(false);}
  }
  async function retire(id){
    if(!window.confirm("Retire this unreferenced media asset?"))return;
    setError("");setBusy(true);
    try{
      const response=await fetch("/api/v1/admin/media/"+encodeURIComponent(id),{
        method:"DELETE",credentials:"same-origin",headers:{"X-CSRF-Token":csrfToken},
      });
      if(!response.ok)throw new Error("This asset may be referenced by an immutable content revision.");
      window.location.reload();
    }catch(e){setError(e.message);setBusy(false);}
  }
  return <main className="section-content">
    <p><Link to="/admin">← Back to CMS</Link></p><h1>Private media</h1>
    <p>Maximum 8 MiB. JPG, PNG, WebP and PDF only. Files remain private in object storage;
      the server verifies actual file bytes and SHA-256 before marking them ready.</p>
    <form onSubmit={upload}>
      <label htmlFor="media-file">Choose media file</label>
      <input id="media-file" type="file" required accept="image/png,image/jpeg,image/webp,application/pdf"
        onChange={event=>setFile(event.target.files?.[0]||null)}/>
      <button disabled={!file||busy} type="submit">{busy?"Checking and uploading…":"Upload and verify"}</button>
    </form>
    {error&&<p role="alert">{error}</p>}
    <h2>Stored assets</h2>
    {items.length?<ul>{items.map(asset=><li key={asset.id}>
      {asset.name} — {asset.state}, {asset.mime}, {asset.size} bytes
      <p><code>{asset.id}</code></p>
      <button type="button" disabled={busy||asset.state==="retired"} onClick={()=>retire(asset.id)}>Retire if unused</button>
    </li>)}</ul>:<p role="status">No private media assets.</p>}
  </main>;
}
