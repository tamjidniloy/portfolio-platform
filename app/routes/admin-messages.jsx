import { Form, Link, useLoaderData, useActionData } from "react-router";
import { requireOwnerRoute } from "../../server/cms/route-guard.js";
import { listMessages, deleteMessage } from "../../server/integrations/contact.js";

export async function loader({request}){
 const {pool,session,csrfToken}=await requireOwnerRoute(request);
 return Response.json({...await listMessages(pool,session),csrfToken},{
   headers:{"Cache-Control":"no-store","X-Robots-Tag":"noindex,nofollow"},
 });
}
export async function action({request}){
 const data=await request.formData();
 const {pool,session}=await requireOwnerRoute(request,{
   mutation:true,csrfToken:data.get("csrfToken"),
 });
 await deleteMessage(pool,session,String(data.get("id")));
 return Response.json({deleted:true},{headers:{"Cache-Control":"no-store"}});
}
export function meta(){return [{title:"Private contact inbox — DEVFOLIO OS"},{name:"robots",content:"noindex,nofollow"}];}
export default function AdminMessages(){
 const {items,csrfToken}=useLoaderData();const done=useActionData();
 return <main className="section-content">
  <p><Link to="/admin">← Back to CMS</Link></p><h1>Private contact inbox</h1>
  <p>Messages have a 90-day retention deadline unless legally held. Notifications may be delayed; the database is the source of truth.</p>
  {done&&<p role="status">Message deleted and notification delivery cancelled.</p>}
  {items.length?<ul>{items.map(m=><li key={m.id}>
    <h2>{m.name}</h2><p>From: {m.email}</p>
    <p style={{whiteSpace:"pre-wrap"}}>{m.message}</p>
    <p>Received: {new Date(m.createdAt).toLocaleDateString()}, consent notice: {m.notice}</p>
    <Form method="post"><input type="hidden" name="csrfToken" value={csrfToken}/>
      <input type="hidden" name="id" value={m.id}/>
      <button type="submit">Delete this message</button></Form>
  </li>)}</ul>:<p role="status">No stored contact messages.</p>}
 </main>;
}
