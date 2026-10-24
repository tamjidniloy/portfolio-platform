import { Link } from "react-router";

const navigation = [
  { href: "/#work", label: "Work" },
  { href: "/#about", label: "About" },
  { href: "/#expertise", label: "Expertise" },
  { href: "/#contact", label: "Contact" },
];

export function PublicShell({ children, name = "Your Name", accent = "violet" }) {
  return (
    <div className={"portfolio-site theme-" + accent}>
      <a href="#main" className="skip-link">Skip to content</a>
      <header className="portfolio-header">
        <div className="header-inner">
          <Link to="/" className="portfolio-logo" aria-label="Portfolio home">
            <span className="logo-glyph" aria-hidden="true">✳</span>
            <span>{name}<small> / portfolio</small></span>
          </Link>
          <nav aria-label="Main navigation" className="portfolio-nav">
            {navigation.map((item) => <a href={item.href} key={item.href}>{item.label}</a>)}
          </nav>
          <Link className="header-login" to="/admin/login">Login <span aria-hidden="true">↗</span></Link>
        </div>
      </header>
      <main className="portfolio-main" id="main">{children}</main>
      <footer className="portfolio-footer">
        <div><span className="footer-spark">✳</span> <strong>{name}</strong><span className="footer-small"> — made with intention.</span></div>
        <div className="footer-right"><a href="/#work">Work</a><a href="/#contact">Contact</a><Link to="/admin/login">Owner login</Link><span>© {new Date().getFullYear()}</span></div>
      </footer>
    </div>
  );
}
