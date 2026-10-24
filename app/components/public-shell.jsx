import { useEffect, useState } from "react";
import { Link } from "react-router";
import { ThemeControl } from "./theme-control.jsx";

const navigation = [
  { href: "/#work", label: "Selected work" },
  { href: "/#about", label: "About" },
  { href: "/#expertise", label: "Expertise" },
  { href: "/#contact", label: "Contact" },
];

export function PublicShell({ children, name = "Your Name", accent = "violet" }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return undefined;
    function closeOnEscape(event) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  return (
    <div className={"portfolio-site theme-" + accent}>
      <a href="#main" className="skip-link">Skip to main content</a>
      <header className="portfolio-header">
        <div className="header-inner">
          <Link to="/" className="portfolio-logo" aria-label={name + " — homepage"} onClick={() => setMenuOpen(false)}>
            <span className="logo-glyph" aria-hidden="true">✳</span>
            <span className="logo-wordmark">{name}<small> / portfolio</small></span>
          </Link>

          <nav id="portfolio-navigation" aria-label="Main navigation" className={"portfolio-nav" + (menuOpen ? " is-open" : "")}>
            {navigation.map((item) => <a href={item.href} key={item.href} onClick={() => setMenuOpen(false)}>{item.label}</a>)}
            <Link to="/admin/login" className="mobile-owner-link" onClick={() => setMenuOpen(false)}>Owner login ↗</Link>
          </nav>

          <div className="header-actions">
            <ThemeControl compact />
            <a href="/#contact" className="header-connect">Let's talk <span aria-hidden="true">↗</span></a>
            <Link className="header-login" to="/admin/login">Owner login <span aria-hidden="true">↗</span></Link>
            <button className={"mobile-menu-toggle" + (menuOpen ? " is-open" : "")} type="button"
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-controls="portfolio-navigation" aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}>
              <span aria-hidden="true" /><span aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>
      <main className="portfolio-main" id="main">{children}</main>
      <footer className="portfolio-footer">
        <div className="footer-brand">
          <span className="footer-spark" aria-hidden="true">✳</span>
          <div><strong>{name}</strong><span className="footer-small">Independent by nature. Intentional by design.</span></div>
        </div>
        <div className="footer-right">
          <a href="/#work">Work</a><a href="/#contact">Contact</a>
          <Link to="/privacy">Privacy</Link><Link to="/admin/login">Owner login</Link>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}
