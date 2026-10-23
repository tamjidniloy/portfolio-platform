import { Link, useLoaderData } from "react-router";
import { PublicShell } from "../components/public-shell.jsx";
import { getPublicSection } from "../features/public-pages/sections.js";
import { getCmsPool } from "../../server/cms/pool.js";
import { getPublicList } from "../../server/cms/public-reader.js";

export async function loader({ params }) {
  const section = getPublicSection(params.section);
  if (!section) throw new Response("Not found", { status: 404 });
  const pool=getCmsPool();
  const items=section.slug==='research' && pool ? await getPublicList(pool,{type:'research'}):[];
  return Response.json({section,items},{headers:{'Cache-Control':'no-store'}});
}

export function meta({ data }) {
  return [
    { title: data ? `${data.section.title} — DEVFOLIO OS` : "Not found — DEVFOLIO OS" },
    { name: "description", content: data?.section.description ?? "Page not found." },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

export default function Section() {
  const { section, items } = useLoaderData();
  return (
    <PublicShell>
      <section className="section-content" aria-labelledby="section-heading">
        <p className="eyebrow">DEVFOLIO OS / {section.label.toUpperCase()}</p>
        <h1 id="section-heading">{section.title}</h1>
        <p className="lede">{section.description}</p>
        {items.length ? <ul>{items.map(item=><li key={item.slug}>
          <h2><Link to={`/research/${item.slug}`}>{item.title}</Link></h2>
          <p>{item.summary}</p><p>Research stage: {item.researchStatus?.replaceAll("_"," ")}</p>
        </li>)}</ul> : <div className="empty-notice" role="status">
          <strong>No published content available.</strong>
          <p>Only reviewed public records may appear here. Only approved published content is visible.</p>
        </div>}
      </section>
    </PublicShell>
  );
}
