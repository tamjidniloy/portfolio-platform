import { Form, Link, useLoaderData, useActionData } from "react-router";
import { requireOwnerRoute } from "../../server/cms/route-guard.js";
import {
 getDraft, listRevisions, previewRevision, saveDraft,
 publishRevision, unpublishRevision, restoreRevision,
} from "../../server/cms/service.js";

export async function loader({request,params}){
 const {pool,session,csrfToken}=await requireOwnerRoute(request);
 const draft=await getDraft(pool,session,params.id);
 const history=await listRevisions(pool,session,params.id);
 const preview=await previewRevision(pool,session,params.id,draft.latestRevisionNo);
 return Response.json({draft,history,preview,csrfToken},{headers:{"Cache-Control":"no-store","X-Robots-Tag":"noindex,nofollow"}});
}
export async function action({request,params}){
 const form=await request.formData();
 const {pool,session}=await requireOwnerRoute(request,{mutation:true,csrfToken:form.get("csrfToken")});
 const expectedVersion=Number(form.get("lockVersion"));
 const intent=String(form.get("intent")),key=String(form.get("key"));
 const common={id:params.id,expectedVersion,key};
 let outcome;
 if(intent==="save")outcome=await saveDraft(pool,session,{
  id:params.id,expectedVersion,payload:JSON.parse(String(form.get("payload"))),
  changeNote:String(form.get("changeNote")||""),
 });
 else if(intent==="publish")outcome=await publishRevision(pool,session,{
  ...common,revisionNo:Number(form.get("revisionNo")),
 });
 else if(intent==="unpublish")outcome=await unpublishRevision(pool,session,common);
 else if(intent==="restore")outcome=await restoreRevision(pool,session,{
  ...common,revisionNo:Number(form.get("revisionNo")),
 });
 else throw new Response("Invalid operation",{status:422});
 return Response.json(outcome,{headers:{"Cache-Control":"no-store"}});
}
export function meta(){return [{title:"Private content editor — DEVFOLIO OS"},{name:"robots",content:"noindex,nofollow"}];}
export default function AdminEditor(){
 const {draft,history,csrfToken}=useLoaderData();
 const result=useActionData();
 const shared=<><input type="hidden" name="csrfToken" value={csrfToken}/>
   <input type="hidden" name="lockVersion" value={draft.lockVersion}/></>;
 return <main className="section-content">
  <p><Link to="/admin">← Content workspace</Link></p>
  <h1>Private {draft.contentType} editor</h1>
  <p>Editorial state: {draft.publicationState}. Lock version: {draft.lockVersion}.</p>
  <h2>Save revision</h2>
  <Form method="post">
   {shared}<input type="hidden" name="intent" value="save"/>
   <label htmlFor="draft-payload">Private JSON editor (validated on server)</label>
   <textarea id="draft-payload" name="payload" rows={15} required defaultValue={JSON.stringify(draft.payload,null,2)}/>
   <label htmlFor="draft-note">Change note</label><input id="draft-note" name="changeNote" maxLength={1000}/>
   <button type="submit">Save private revision</button>
  </Form>
  <h2>Publishing</h2>
  <Form method="post">{shared}
   <input type="hidden" name="intent" value="publish"/><input type="hidden" name="key" value={draft.id+"publish"+draft.lockVersion}/>
   <input type="hidden" name="revisionNo" value={draft.latestRevisionNo}/>
   <button type="submit">Publish current revision</button>
  </Form>
  <Form method="post">{shared}
   <input type="hidden" name="intent" value="unpublish"/><input type="hidden" name="key" value={draft.id+"unpublish"+draft.lockVersion}/>
   <button type="submit" disabled={draft.publicationState!=="published"}>Unpublish</button>
  </Form>
  <h2>Revision history</h2>
  <ul>{history.map(r=><li key={r.revisionNo}>Revision {r.revisionNo} — {r.changeNote||"No note"}
   <Form method="post">{shared}<input type="hidden" name="intent" value="restore"/>
    <input type="hidden" name="key" value={draft.id+"restore"+r.revisionNo+"v"+draft.lockVersion}/>
    <input type="hidden" name="revisionNo" value={r.revisionNo}/>
    <button type="submit">Restore as private draft</button></Form>
  </li>)}</ul>
  {result&&<p role="status">Database operation confirmed: {result.status}; version {result.lockVersion}.</p>}
 </main>;
}
