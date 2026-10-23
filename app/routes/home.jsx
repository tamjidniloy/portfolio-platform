import { Link, useLoaderData } from "react-router";
import { getCmsPublicPool } from "../../server/cms/pool.js";
import { canonicalUrl, canonicalMeta } from "../../server/integrations/seo.js";
import { getPublicSnapshot } from "../../server/cms/public-reader.js";
import { PublicShell } from "../components/public-shell.jsx";

export async function loader(){
  const pool=getCmsPublicPool();
  const site=pool?await getPublicSnapshot(pool,"/"):null;
  const profile=pool?await getPublicSnapshot(pool,"/about"):null;
  return Response.json({site,profile,canonical:site||profile?canonicalUrl("/"):null},{headers:{"Cache-Control":"no-store"}});
}
export function meta({data}) {
  return [
    { title: data?.site?.title ? `${data.site.title} — DEVFOLIO OS` : "DEVFOLIO OS — Development foundation" },
    { name: "description", content: data?.site?.summary || data?.profile?.summary || "Prelaunch engineering foundation for a published-only portfolio." },
    ...(data?.site || data?.profile ? [] : [{ name: "robots", content: "noindex, nofollow" }]),
    ...canonicalMeta({canonical:data?.canonical,title:data?.site?.title||data?.profile?.title}),
  ];
}

export default function Home() {
  const {site,profile}=useLoaderData();
  return (
    <PublicShell>
      <div className="intro-grid">
        <section className="intro">
          <p className="eyebrow"><span className="status-dot" aria-hidden="true" /> FOUNDATION IN PROGRESS</p>
          <h1>{site?.title || profile?.title || "Built for work that speaks for itself."}</h1>
          <p className="lede">{site?.summary || profile?.summary || "A dark-first foundation for a truthful software, AI and research portfolio. Only owner-approved published content will become publicly visible."}</p>
          <div className="foundation-note" role="note">
            This is an engineering starter, not a launched portfolio. Release 1 contracts are approved. Real passkey login and CMS release tests remain outstanding.
          </div>
          <Link className="button-link primary-button" to="/projects">Explore the structure <span aria-hidden="true">↗</span></Link>
        </section>
        <aside className="system-panel" aria-labelledby="system-title">
          <div className="panel-top">
            <p className="eyebrow">PLATFORM BASELINE</p>
            <span className="mono">PHASE 04</span>
          </div>
          <h2 id="system-title">Architecture summary</h2>
          <dl className="spec-list">
            <div><dt>Web delivery</dt><dd>React Router SSR</dd></div>
            <div><dt>Server</dt><dd>Node / Express</dd></div>
            <div><dt>Data service</dt><dd>PostgreSQL native</dd></div>
            <div><dt>Identity</dt><dd>Approved passkey-first, integration pending</dd></div>
            <div><dt>Public content</dt><dd>Published only</dd></div>
          </dl>
          <p className="panel-footnote">No fake metrics, private previews, owner sessions or unreviewed public APIs are exposed.</p>
        </aside>
      </div>
    </PublicShell>
  );
}
