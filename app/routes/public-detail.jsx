import { useLoaderData } from "react-router";
import { PublicShell } from "../components/public-shell.jsx";
import { getCmsPool } from "../../server/cms/pool.js";
import { getPublicSnapshot } from "../../server/cms/public-reader.js";

export async function loader({request,params}){
  const area=new URL(request.url).pathname.startsWith("/research/")?"research":"projects";
  const pool=getCmsPool();
  const item=pool?await getPublicSnapshot(pool,`/${area}/${params.slug}`):null;
  if(!item || item.contentType !== (area==="research"?"research":"project")) {
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
     {["role","problem","approach","outcome","limitations"].filter(key=>item[key]).map(key=>
       <section key={key}><h2>{key[0].toUpperCase()+key.slice(1)}</h2><p>{item[key]}</p></section>)}
   </article>
 </PublicShell>;
}
