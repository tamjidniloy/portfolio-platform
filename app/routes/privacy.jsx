import { PublicShell } from "../components/public-shell.jsx";
export function meta(){return [{title:"Contact privacy — DEVFOLIO OS"},{name:"robots",content:"noindex,nofollow"}];}
export default function Privacy(){
 return <PublicShell><section className="section-content">
  <h1>Contact message privacy</h1>
  <p>If the contact form is enabled, it asks for your name, email and message solely so the portfolio owner can respond. Explicit consent and notice version are recorded.</p>
  <p>Stored contact messages are scheduled for deletion after 90 days, unless a lawful retention hold applies. A pseudonymous IP digest is used for abuse prevention; raw IP addresses are not stored by the contact service.</p>
  <p>Notification delivery may use a contracted email service. The message is stored independently of email delivery. You can ask the portfolio owner to delete a message; valid legal holds may limit deletion.</p>
  <p>Before any real contact form is activated, the owner must publish a jurisdiction-appropriate full privacy notice with their actual contact address, service providers, data subject rights and updated notice version.</p>
 </section></PublicShell>;
}
