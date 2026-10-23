import { Link } from "react-router";
import { PublicShell } from "../components/public-shell.jsx";

export function meta() {
  return [
    { title: "DEVFOLIO OS — Development foundation" },
    { name: "description", content: "Prelaunch engineering foundation for a published-only portfolio." },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

export default function Home() {
  return (
    <PublicShell>
      <div className="intro-grid">
        <section className="intro">
          <p className="eyebrow"><span className="status-dot" aria-hidden="true" /> FOUNDATION IN PROGRESS</p>
          <h1>Built for work that speaks for itself.</h1>
          <p className="lede">
            A dark-first foundation for a truthful software, AI and research portfolio.
            Only owner-approved published content will become publicly visible.
          </p>
          <div className="foundation-note" role="note">
            This is an engineering starter, not a launched portfolio. Requirements, MFA,
            database migrations and publishing contracts await explicit approval.
          </div>
          <Link className="button-link primary-button" to="/work">Explore the structure <span aria-hidden="true">↗</span></Link>
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
            <div><dt>Identity</dt><dd>Pending owner choice</dd></div>
            <div><dt>Public content</dt><dd>Published only</dd></div>
          </dl>
          <p className="panel-footnote">No fake metrics, private previews, owner sessions or unreviewed public APIs are exposed.</p>
        </aside>
      </div>
    </PublicShell>
  );
}
