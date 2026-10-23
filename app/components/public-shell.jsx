import { NavLink, useRouteLoaderData } from "react-router";
import { primaryNavigation, secondaryNavigation } from "../features/public-pages/sections.js";

export function PublicShell({ children }) {
  const showWriting=useRouteLoaderData("root")?.showWriting===true;
  return (
    <div className="site">
      <a className="skip-link" href="#main">Skip to content</a>
      <header className="topbar">
        <NavLink to="/" end className="wordmark" aria-label="DEVFOLIO OS home">
          <span aria-hidden="true" className="mark">◈</span>
          <span>DEVFOLIO <span className="wordmark-accent">OS</span></span>
        </NavLink>
        <nav className="primary-nav" aria-label="Main navigation">
          {primaryNavigation.map(({ slug, label }) => (
            <NavLink key={slug} to={slug==="work"?"/projects":`/${slug}`} className={({ isActive }) => `nav-link${isActive ? " is-active" : ""}`}>
              {label}
            </NavLink>
          ))}
          {showWriting && <NavLink to="/writing" className="nav-link">Writing</NavLink>}
        </nav>
      </header>
      <main id="main" className="main-content">{children}</main>
      <footer className="footer">
        <div className="footer-info">
          <span>DEVFOLIO OS / ENGINEERING BUILD</span>
          <span>No published records yet · prelaunch</span>
        </div>
        <nav className="footer-nav" aria-label="Background">
          {secondaryNavigation.map(({ slug, label }) => <NavLink key={slug} to={`/${slug}`}>{label}</NavLink>)}
        </nav>
      </footer>
    </div>
  );
}
