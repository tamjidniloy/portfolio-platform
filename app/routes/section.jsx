import { Link, useLoaderData } from "react-router";
import { PublicShell } from "../components/public-shell.jsx";
import { getPublicSection } from "../features/public-pages/sections.js";
import { getCmsPublicPool } from "../../server/cms/pool.js";
import { canonicalUrl, canonicalMeta } from "../../server/integrations/seo.js";
import { getPublicList, getPublicSnapshot } from "../../server/cms/public-reader.js";

export async function loader({ params }) {
  const section = getPublicSection(params.section);
  if (!section) throw new Response("Not found", { status: 404 });
  const pool=getCmsPublicPool();
  const sectionTypes={research:"research",experience:"experience",education:"education",skills:"skill",achievements:"achievement"};
  const type=sectionTypes[section.slug];
  const items=type&&pool ? await getPublicList(pool,{type}):[];
  const profile=section.slug==="about"&&pool?await getPublicSnapshot(pool,"/about"):null;
  return Response.json({section,items,profile,canonical:items.length||profile?canonicalUrl("/"+section.slug):null},{headers:{"Cache-Control":"no-store"}});
}

export function meta({ data }) {
  return [
    { title: data ? `${data.section.title} — DEVFOLIO OS` : "Not found — DEVFOLIO OS" },
    { name: "description", content: data?.section.description ?? "Page not found." },
    ...(data?.items?.length || data?.profile ? [] : [{ name: "robots", content: "noindex, nofollow" }]),
    ...canonicalMeta({canonical:data?.canonical,title:data?.section?.title}),
  ];
}

export default function Section() {
  const { section, items, profile } = useLoaderData();
  return (
    <PublicShell>
      <section className="section-content" aria-labelledby="section-heading">
        <p className="eyebrow">DEVFOLIO OS / {section.label.toUpperCase()}</p>
        <h1 id="section-heading">{section.title}</h1>
        <p className="lede">{section.description}</p>
        {profile && <section aria-label="Published profile"><h2>{profile.title}</h2><p>{profile.summary}</p></section>}
        {items.length ? <ul>{items.map(item=><li key={item.slug}>
          <h2>{section.slug==="research"?<Link to={`/research/${item.slug}`}>{item.title}</Link>:item.title}</h2>
          <p>{item.summary}</p>{item.researchStatus&&<p>Research stage: {item.researchStatus.replaceAll("_"," ")}</p>}
        </li>)}</ul> : !profile && <div className="empty-notice" role="status">
          <strong>No published content available.</strong>
          <p>Only reviewed public records may appear here. Only approved published content is visible.</p>
        </div>}
      </section>
    </PublicShell>
  );
}
