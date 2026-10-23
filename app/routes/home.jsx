import { Link } from "react-router";

export function meta() {
  return [
    { title: "DEVFOLIO OS — Development foundation" },
    {
      name: "description",
      content: "DEVFOLIO OS development foundation. Public portfolio content is not yet published.",
    },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

export default function Home() {
  return (
    <div className="site">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="topbar">
        <Link to="/" className="wordmark" aria-label="DEVFOLIO OS home">
          <span aria-hidden="true" className="mark">◈</span>
          <span>DEVFOLIO <span className="wordmark-accent">OS</span></span>
        </Link>
        <span className="stage">ENGINEERING / 04.0</span>
      </header>
      <main id="main" className="main-content">
        <div className="intro-grid">
          <div className="intro">
            <p className="eyebrow"><span className="status-dot" /> FOUNDATION IN PROGRESS</p>
            <h1>Built for work that speaks for itself.</h1>
            <p className="lede">
              A minimal, dark-first foundation for a truthful portfolio of software,
              AI and research work. The public portfolio and owner CMS will follow
              approved requirements and verified implementation milestones.
            </p>
            <div className="foundation-note" role="note">
              This is an engineering starter page, not a launched portfolio.
              Content, authentication and data contracts are not finalized.
            </div>
          </div>
          <aside className="system-panel" aria-labelledby="system-title">
            <div className="panel-top">
              <p className="eyebrow">SYSTEM SNAPSHOT</p>
              <span className="mono">v0.4.0</span>
            </div>
            <h2 id="system-title">Foundation scope</h2>
            <dl className="spec-list">
              <div><dt>Application</dt><dd>React Router SSR</dd></div>
              <div><dt>Runtime</dt><dd>Node / Express</dd></div>
              <div><dt>Data</dt><dd>PostgreSQL (local service)</dd></div>
              <div><dt>Theme</dt><dd>Dark-first</dd></div>
              <div><dt>Contracts</dt><dd>Awaiting approval</dd></div>
            </dl>
            <p className="panel-footnote">No public CMS or owner sign-in is exposed.</p>
          </aside>
        </div>
      </main>
      <footer className="footer">
        <span>DEVFOLIO OS / FOUNDATION BUILD</span>
        <span>REAL WORK. VERIFIABLE EVIDENCE.</span>
      </footer>
    </div>
  );
}
