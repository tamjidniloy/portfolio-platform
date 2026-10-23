import { Form, Link, useLoaderData, useActionData } from "react-router";
import { requireOwnerRoute } from "../../server/cms/route-guard.js";
import { getPrivateSiteSettings, updatePrivateSiteSettings } from "../../server/cms/settings.js";

export async function loader({request}){
 const {pool,session,csrfToken}=await requireOwnerRoute(request);
 const current=await getPrivateSiteSettings(pool,session);
 return Response.json({...current,csrfToken},{headers:{"Cache-Control":"no-store","X-Robots-Tag":"noindex,nofollow"}});
}
export async function action({request}){
 const data=await request.formData();
 const {pool,session}=await requireOwnerRoute(request,{mutation:true,csrfToken:data.get("csrfToken")});
 const result=await updatePrivateSiteSettings(pool,session,{
  expectedVersion:Number(data.get("lockVersion")),
  settings:JSON.parse(String(data.get("settings"))),
 });
 return Response.json(result,{headers:{"Cache-Control":"no-store"}});
}
export function meta(){return [{title:"Private site settings — DEVFOLIO OS"},{name:"robots",content:"noindex,nofollow"}];}
export default function AdminSettings(){
 const {settings,lockVersion,csrfToken}=useLoaderData(),done=useActionData();
 return <main className="section-content">
  <p><Link to="/admin">← Return to workspace</Link></p>
  <h1>Site settings</h1>
  <p>Only allowlisted public-title, SEO, contact visibility, navigation and social-link settings are accepted. Never put secrets here.</p>
  <Form method="post">
   <input type="hidden" name="csrfToken" value={csrfToken}/>
   <input type="hidden" name="lockVersion" value={lockVersion}/>
   <label htmlFor="site-settings-json">Site settings (JSON)</label>
   <textarea id="site-settings-json" name="settings" rows={12} required defaultValue={JSON.stringify(settings,null,2)}/>
   <button type="submit">Save private site settings</button>
  </Form>
  {done&&<p role="status">Settings saved at version {done.lockVersion}.</p>}
 </main>;
}
