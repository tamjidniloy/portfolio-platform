import { Form, Link, useLoaderData, useActionData } from "react-router";
import { requireOwnerRoute } from "../../server/cms/route-guard.js";
import { createDraft, listDrafts } from "../../server/cms/service.js";
import { CONTENT_TYPES } from "../../domain/cms/content-contract.js";

export async function loader({request}){
  const {pool,session,csrfToken}=await requireOwnerRoute(request);
  return Response.json({csrfToken,items:await listDrafts(pool,session)},{headers:{"Cache-Control":"no-store"}});
}
export async function action({request}){
  const form=await request.formData();
  const {pool,session}=await requireOwnerRoute(request,{mutation:true,csrfToken:form.get("csrfToken")});
  const result=await createDraft(pool,session,{
    type:String(form.get("contentType")),
    payload:{
      title:String(form.get("title")||""),
      summary:String(form.get("summary")||""),
      slug:String(form.get("slug")||""),
    },
    key:String(form.get("key")),
  });
  return Response.json(result,{headers:{"Cache-Control":"no-store"}});
}
export function meta(){return [{title:"Private CMS — DEVFOLIO OS"},{name:"robots",content:"noindex,nofollow"}];}
export default function Admin(){
 const {items,csrfToken}=useLoaderData(); const result=useActionData();
 return <main className="section-content">
  <p className="eyebrow">PRIVATE / DEVFOLIO OS</p>
  <h1>Content workspace</h1>
  <p>All edits are private until published. Only validated owner sessions can access this page.</p>
  <h2>Content</h2>
  {items.length?<ul>{items.map(x=><li key={x.id}><Link to={`/admin/content/${x.id}`}>
   {x.payload?.title||x.contentType}</Link> — {x.publicationState} (revision {x.latestRevisionNo})</li>)}</ul>:
    <p role="status">No drafts yet.</p>}
  <h2>Create draft</h2>
  <Form method="post">
   <input type="hidden" name="csrfToken" value={csrfToken}/>
   <input type="hidden" name="key" value={crypto.randomUUID()}/>
   <label htmlFor="new-content-type">Content type</label>
   <select id="new-content-type" name="contentType">{CONTENT_TYPES.map(type=><option key={type} value={type}>{type}</option>)}</select>
   <label htmlFor="new-title">Title</label><input id="new-title" name="title" maxLength={200} required/>
   <label htmlFor="new-slug">Slug</label><input id="new-slug" name="slug" maxLength={160} required pattern="[a-z0-9]+(-[a-z0-9]+)*"/>
   <label htmlFor="new-summary">Summary</label><textarea id="new-summary" name="summary" maxLength={2000} required/>
   <button type="submit">Create private draft</button>
  </Form>
  {result&&<p role="status">Draft created. <Link to={`/admin/content/${result.id}`}>Edit draft</Link>.</p>}
 </main>;
}
