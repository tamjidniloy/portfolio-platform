import { PublicShell } from "../components/public-shell.jsx";

export function meta() {
  return [{ title: "Privacy — DEVFOLIO OS" }, { name: "robots", content: "noindex,nofollow" }];
}

export default function Privacy() {
  return <PublicShell>
    <section className="section-content">
      <h1>Website privacy</h1>
      <p>This portfolio displays information and project images voluntarily published by its owner.</p>
      <p>Visitors can use the direct email link. When verified email delivery is configured, an optional contact form sends a name, reply email, subject and message to the portfolio owner through Resend. Form messages are not saved in the website database; the email provider and recipient mailbox may retain them under their own policies. This website does not operate a newsletter or analytics tracker.</p>
      <p>Owner sign-in uses a password, single-use verification code and secure session cookie. Login sessions and limited contact-form request counts are stored in PostgreSQL for security, without storing submitted message bodies.</p>
      <p>This page describes the current portfolio implementation, not legal advice. Before a public launch, the owner should review jurisdiction-specific privacy notices and operational policies.</p>
    </section>
  </PublicShell>;
}
