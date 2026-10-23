import { Link, useLoaderData } from "react-router";
import { PublicShell } from "../components/public-shell.jsx";
import { getCmsPool } from "../../server/cms/pool.js";
import { getPublicList } from "../../server/cms/public-reader.js";

export async function loader() {
  const pool=getCmsPool();
  const items=pool?await getPublicList(pool,{type:"project"}):[];
  return Response.json({items},{headers:{"Cache-Control":"no-store"}});
}
export function meta(){
  return [{title:"Work — DEVFOLIO OS"},{name:"description",content:"Verified software engineering case studies."}];
}
export default function Projects(){
  const {items}=useLoaderData();
  return <PublicShell>
    <section className="section-content" aria-labelledby="projects-heading">
      <p className="eyebrow">DEVFOLIO OS / WORK</p>
      <h1 id="projects-heading">Selected work</h1>
      {items.length?<ul>{items.map(x=><li key={x.slug}>
        <h2><Link to={`/projects/${x.slug}`}>{x.title}</Link></h2><p>{x.summary}</p>
      </li>)}</ul>:<p role="status">No published projects available.</p>}
    </section>
  </PublicShell>;
}
