import { redirect, useLoaderData } from "react-router";
import { PublicShell } from "../components/public-shell.jsx";
import { getCmsPublicPool } from "../../server/cms/pool.js";
import { getPublicSnapshot, publishedRedirect } from "../../server/cms/public-reader.js";

export async function loader({request,params}){
  const pathname=new URL(request.url).pathname;
  const area=pathname.startsWith("/research/")?"research":pathname.startsWith("/writing/")?"writing":"projects";
  const pool=getCmsPublicPool();
  const item=pool?await getPublicSnapshot(pool,`/${area}/${params.slug}`):null;
  if(!item && pool) {
    const destination=await publishedRedirect(pool,`/${area}/${params.slug}`);
    if(destination)throw redirect(destination,308);
  }
  if(!item || item.contentType !== (area==="research"?"research":area==="writing"?"article":"project")) {
    throw new Response("Not found",{status:404,headers:{"Cache-Control":"no-store"}});
  }
  return Response.json({item},{headers:{"Cache-Control":"no-store"}});
}
export function meta({data}){
  return data?.item?[{title:`${data.item.title} — DEVFOLIO OS`},
    {name:"description",content:data.item.summary}]:
    [{title:"Not found — DEVFOLIO OS"},{name:"robots",content:"noindex"}];
}
export default function PublicDetail(){
 const {item}=useLoaderData();
 return <PublicShell>
   <article className="section-content">
     <p className="eyebrow">DEVFOLIO OS / {item.contentType.toUpperCase()}</p>
     <h1>{item.title}</h1><p className="lede">{item.summary}</p>
     {item.researchStatus&&<p>Research stage: {item.researchStatus.replaceAll("_"," ")}</p>}
     {item.contentType==="article"&&item.body&&<p style={{whiteSpace:"pre-wrap"}}>{item.body}</p>}
     {["role","problem","approach","outcome","limitations"].filter(key=>item[key]).map(key=>
       <section key={key}><h2>{key[0].toUpperCase()+key.slice(1)}</h2><p>{item[key]}</p></section>)}
   </article>
 </PublicShell>;
}
