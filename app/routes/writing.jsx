import { Link, useLoaderData } from "react-router";
import { PublicShell } from "../components/public-shell.jsx";
import { getCmsPublicPool } from "../../server/cms/pool.js";
import { getPublicList } from "../../server/cms/public-reader.js";

export async function loader() {
 const pool=getCmsPublicPool();
 const items=pool?await getPublicList(pool,{type:"article"}):[];
 return Response.json({items},{headers:{"Cache-Control":"no-store"}});
}
export function meta({data}){
 return [{title:"Writing — DEVFOLIO OS"},{name:"description",content:"Published writing and engineering notes."},
 ...(data?.items?.length?[]:[{name:"robots",content:"noindex,nofollow"}])];
}
export default function Writing(){
 const {items}=useLoaderData();
 return <PublicShell><section className="section-content">
  <p className="eyebrow">DEVFOLIO OS / WRITING</p><h1>Writing</h1>
  {items.length?<ul>{items.map(item=><li key={item.slug}>
   <h2><Link to={`/writing/${item.slug}`}>{item.title}</Link></h2>
   <p>{item.summary}</p>
  </li>)}</ul>:<p role="status">No published writing yet.</p>}
 </section></PublicShell>;
}
