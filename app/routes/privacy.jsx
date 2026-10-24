import { PublicShell } from "../components/public-shell.jsx";

export function meta() {
  return [{ title: "Privacy — DEVFOLIO OS" }, { name: "robots", content: "noindex,nofollow" }];
}

export default function Privacy() {
  return <PublicShell>
    <section className="section-content">
      <h1>Website privacy</h1>
      <p>This portfolio displays information and project images voluntarily published by its owner.</p>
      <p>The public contact link opens your own email application. This website does not currently operate a visitor message form, newsletter signup, or analytics tracker.</p>
      <p>Owner sign-in uses a password, single-use verification code, and a secure session cookie. Sign-in attempts and sessions are recorded in the private PostgreSQL database for account protection.</p>
      <p>This page describes the current portfolio implementation, not legal advice. Before a public launch, the owner should review jurisdiction-specific privacy notices and operational policies.</p>
    </section>
  </PublicShell>;
}
