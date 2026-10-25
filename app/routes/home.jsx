import { useState } from "react";
import { useLoaderData } from "react-router";
import { getStudioContent } from "../../server/studio/index.js";
import { contactDeliveryEnabled } from "../../server/studio/contact.js";
import { PublicShell } from "../components/public-shell.jsx";

export async function loader() {
  return Response.json({
    ...(await getStudioContent()),
    contactFormEnabled: contactDeliveryEnabled(),
    canonicalOrigin: process.env.PORTFOLIO_PUBLIC_ORIGIN || "http://127.0.0.1:3000",
  }, { headers: { "Cache-Control": "no-store" } });
}

export function meta({ data }) {
  const c = data?.content;
  const title = (c?.name || "Portfolio") + " — " + (c?.title || "Creative Developer");
  const description = c?.bio || "Independent developer portfolio";
  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "theme-color", content: "#11121b" },
    ...(data?.canonicalOrigin ? [
      { tagName: "link", rel: "canonical", href: data.canonicalOrigin + "/" },
      { property: "og:url", content: data.canonicalOrigin + "/" },
    ] : []),
    ...(c?.avatar ? [{
      property: "og:image",
      content: c.avatar.startsWith("/media/") ? (data?.canonicalOrigin || "") + c.avatar : c.avatar,
    }] : []),
    ...(c?.name === "Your Name" ? [{ name: "robots", content: "noindex, nofollow" }] : []),
  ];
}

function Arrow({ diagonal = false }) {
  return <span aria-hidden="true">{diagonal ? "↗" : "→"}</span>;
}

function EditorialTitle({ number, eyebrow, children, note }) {
  return <div className="exp-section-header">
    <p className="exp-section-index"><span>{number}</span>{eyebrow}</p>
    <div className="exp-section-heading"><h2>{children}</h2>{note && <p>{note}</p>}</div>
  </div>;
}

function Headline({ text }) {
  const words = text.trim().split(/\s+/);
  if (words.length < 4) return text;
  return <>{words.slice(0, -2).join(" ")} <em>{words.slice(-2).join(" ")}</em></>;
}

function ProjectCard({ project, index }) {
  return <article className="exp-project-card">
    <div className={"exp-project-art exp-project-art-" + (index % 3)}>
      {project.cover
        ? <img src={project.cover} alt={"Preview of " + project.title} loading="lazy" decoding="async" />
        : <div className="exp-project-pattern" aria-hidden="true"><span>✳</span><i/><i/></div>}
      <span className="exp-project-number">{String(index + 1).padStart(2, "0")} / PROJECT</span>
      {project.featured && <span className="exp-project-featured">FEATURED</span>}
      {project.liveUrl && <a href={project.liveUrl} className="exp-project-open" target="_blank" rel="noopener noreferrer" aria-label={"Open " + project.title + " live project"}><Arrow diagonal/></a>}
    </div>
    <div className="exp-project-details">
      <div><p className="exp-project-type">{project.category || "Selected work"}{project.year ? " · " + project.year : ""}</p>
        <h3>{project.title}</h3><p className="exp-project-description">{project.description}</p>
        {project.outcome && <p className="exp-project-outcome"><strong>OUTCOME</strong>{project.outcome}</p>}</div>
      {project.stack && <span className="exp-project-stack">{project.stack}</span>}
    </div>
    <div className="exp-project-links">
      {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">Live project <Arrow diagonal/></a>}
      {project.sourceUrl && <a href={project.sourceUrl} target="_blank" rel="noopener noreferrer">Source code <Arrow diagonal/></a>}
    </div>
  </article>;
}

function SelectedWork({ projects, heading }) {
  const [filter, setFilter] = useState("All");
  const categories = [...new Set(projects.map((project) => project.category).filter(Boolean))];
  const filtered = filter === "All" ? projects : projects.filter((project) => project.category === filter);
  return <section id="work" className="exp-section exp-work-section" aria-labelledby="work-title">
    <div className="exp-contained">
      <div id="work-title"><EditorialTitle number="01" eyebrow="Proof, not promises"
        note="A selection of real problems, thoughtful solutions and things brought to life.">
        {heading}
      </EditorialTitle></div>
      {projects.length > 0 ? <>
        {categories.length > 1 && <div className="exp-filter-bar" role="group" aria-label="Filter projects by category">
          {["All", ...categories].map((category) => <button type="button" key={category}
            className={"exp-filter" + (filter === category ? " is-active" : "")}
            aria-pressed={filter === category} onClick={() => setFilter(category)}>
            {category === "All" ? "All work" : category}
          </button>)}
        </div>}
        <div className="exp-project-grid" aria-live="polite">
          {filtered.map((project, index) => <ProjectCard key={project.id} project={project} index={index}/>)}
        </div>
      </> : <div className="exp-empty-work">
        <span aria-hidden="true">✳</span>
        <div><p className="exp-overline">WORK IN PROGRESS</p><h3>The next great thing is taking shape.</h3>
          <p>Selected projects will appear here as they're published.</p></div>
      </div>}
    </div>
  </section>;
}

function ContactActions({ email }) {
  const [copied, setCopied] = useState(false);
  if (!email) return <p className="exp-contact-placeholder">Contact details will be available soon. You can find professional links below.</p>;

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
    } catch {
      setCopied(false);
      window.location.href = "mailto:" + email;
    }
  }

  return <div className="exp-contact-actions">
    <a className="exp-button exp-button-light" href={"mailto:" + email + "?subject=" + encodeURIComponent("Let's work together")}>
      Start a conversation <Arrow diagonal/>
    </a>
    <button className="exp-copy-email" type="button" onClick={copyEmail}
      aria-label="Copy email address to clipboard">
      <span aria-hidden="true">{copied ? "✓" : "⧉"}</span>
      {copied ? "Copied!" : "Copy email"}
    </button>
    <span className="exp-contact-email">{email}</span>
    <span className="exp-sr-only" role="status" aria-live="polite">{copied ? "Email address copied to clipboard" : ""}</span>
  </div>;
}


function ContactForm() {
  const [fields, setFields] = useState({ name: "", email: "", subject: "", message: "", website: "", consent: false });
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  function update(key, value) {
    setFields((before) => ({ ...before, [key]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setStatus("");
    try {
      const result = await fetch("/api/studio/contact", {
        method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json", "X-Studio-Request": "1" },
        body: JSON.stringify(fields),
      });
      const data = await result.json().catch(() => ({}));
      if (!result.ok) throw new Error(data.error || "Could not send your message. Please email directly instead.");
      setFields({ name: "", email: "", subject: "", message: "", website: "", consent: false });
      setStatus("Message sent. Thank you for reaching out!");
    } catch (err) {
      setError(err.message || "Could not send your message.");
    } finally { setBusy(false); }
  }

  return <form className="exp-contact-form" onSubmit={submit} aria-label="Send a portfolio enquiry">
    <div className="exp-contact-fields">
      <label>YOUR NAME
        <input name="name" type="text" autoComplete="name" maxLength={80} minLength={2} required
          value={fields.name} onChange={(e) => update("name", e.target.value)} placeholder="Your name" />
      </label>
      <label>YOUR EMAIL
        <input name="email" type="email" autoComplete="email" maxLength={254} required
          value={fields.email} onChange={(e) => update("email", e.target.value)} placeholder="you@company.com" />
      </label>
    </div>
    <label>WHAT'S THIS ABOUT?
      <input name="subject" type="text" minLength={4} maxLength={120} required
        value={fields.subject} onChange={(e) => update("subject", e.target.value)} placeholder="A role, a collaboration, or an idea…" />
    </label>
    <label>YOUR MESSAGE
      <textarea name="message" rows={4} minLength={20} maxLength={3000} required
        value={fields.message} onChange={(e) => update("message", e.target.value)} placeholder="Tell me a little about what you're imagining…" />
    </label>
    <div className="exp-honey-field" aria-hidden="true">
      <label>Website <input tabIndex={-1} autoComplete="off" value={fields.website} onChange={(e) => update("website", e.target.value)} /></label>
    </div>
    <label className="exp-contact-consent">
      <input type="checkbox" checked={fields.consent} onChange={(e) => update("consent", e.target.checked)} required/>
      <span>I agree to send my details for the purpose of receiving a reply. See the <a href="/privacy">privacy notice</a>.</span>
    </label>
    <button className="exp-button exp-button-light exp-send-button" type="submit" disabled={busy}>
      {busy ? "Sending…" : "Send enquiry"} <Arrow diagonal/>
    </button>
    <p className="exp-form-caption">Your enquiry goes directly to my inbox. No account needed.</p>
    {status && <p className="exp-form-success" role="status">{status}</p>}
    {error && <p className="exp-form-error" role="alert">{error} You can use the direct email link above.</p>}
  </form>;
}

export default function Home() {
  const { content: c, contactFormEnabled } = useLoaderData();
  const firstName = c.name.trim().split(/\s+/)[0];
  const projects = [...c.projects].sort((a, b) => Number(b.featured) - Number(a.featured));
  const expertise = c.skills.slice(0, 12);

  return <PublicShell name={c.name} accent={c.accent}>
    <section className="exp-hero" aria-labelledby="hero-heading">
      <div className="exp-hero-grid" aria-hidden="true"/>
      <div className="exp-hero-halo" aria-hidden="true"/>
      <div className="exp-contained exp-hero-inner">
        <div className="exp-hero-copy">
          <div className="exp-availability"><span className="exp-status-dot" aria-hidden="true"/>
            {c.available ? "AVAILABLE FOR COLLABORATION" : "BUILDING WHAT'S NEXT"}
          </div>
          <p className="exp-eyebrow">{c.eyebrow || c.title}</p>
          <h1 id="hero-heading"><Headline text={c.headline}/></h1>
          <p className="exp-hero-intro">{c.bio}</p>
          <div className="exp-hero-actions">
            <a className="exp-button exp-button-primary" href="#work">Explore selected work <Arrow diagonal/></a>
            <a className="exp-text-link" href="#contact">Let's talk <Arrow diagonal/></a>
          </div>
          <div className="exp-hero-location">
            <span className="exp-asterisk" aria-hidden="true">✳</span>
            <span>{c.title} <span aria-hidden="true">/</span> {c.location}</span>
          </div>
        </div>
        <div className="exp-hero-art">
          <div className="exp-art-orbit exp-art-orbit-one" aria-hidden="true"/>
          <div className="exp-art-orbit exp-art-orbit-two" aria-hidden="true"/>
          <div className="exp-art-orbit exp-art-orbit-three" aria-hidden="true"/>
          <div className="exp-art-sphere">
            {c.avatar ? <img alt={"Portrait of " + c.name} src={c.avatar} fetchPriority="high" /> : <span className="exp-art-monogram" aria-hidden="true">✳</span>}
          </div>
          <div className="exp-art-info"><span aria-hidden="true">✳</span><div>CREATIVE THINKING<br/><strong>ENGINEERED WITH PURPOSE</strong></div></div>
          <p className="exp-art-serial">PORTFOLIO / {new Date().getFullYear()}</p>
        </div>
      </div>
      <div className="exp-hero-end exp-contained"><span>SCROLL TO EXPLORE <span aria-hidden="true">↓</span></span><span>DESIGN × DEVELOPMENT × DETAIL</span></div>
    </section>

    <div className="exp-marquee" aria-hidden="true">
      <div className="exp-marquee-track" aria-hidden="true">
        {[0, 1].map((repeat) => <div key={repeat} className="exp-marquee-sequence">
          {(c.skills.length ? c.skills : ["CREATIVE PROBLEM SOLVING", "DESIGN-LED ENGINEERING", "HUMAN-CENTERED EXPERIENCES", "CURIOUS BY DEFAULT"]).map((skill, index) =>
            <span key={index} className="exp-marquee-item"><span aria-hidden="true">✳</span>{skill}</span>)}
        </div>)}
      </div>
    </div>

    <SelectedWork projects={projects} heading={c.projectsHeading}/>

    <section id="about" className="exp-about" aria-labelledby="about-heading">
      <div className="exp-contained exp-about-inner">
        <div className="exp-about-intro">
          <p className="exp-section-index"><span>02</span>The human behind the work</p>
          <p className="exp-about-greeting">HELLO, I'M {firstName.toUpperCase()}</p>
          <h2 id="about-heading">More than<br/><em>just code.</em></h2>
          <div className="exp-about-symbol" aria-hidden="true">✳</div>
        </div>
        <div className="exp-about-story">
          <p className="exp-about-lead">{c.headline}</p>
          <p>{c.bio}</p>
          {c.resumeUrl && <a className="exp-about-resume" href={c.resumeUrl} target="_blank" rel="noopener noreferrer">View my résumé <Arrow diagonal/></a>}
          <div className="exp-about-stats" role="group" aria-label="Portfolio highlights">
            <div><strong>{String(c.projects.length).padStart(2,"0")}</strong><span>Projects</span></div>
            <div><strong>{String(c.skills.length).padStart(2,"0")}</strong><span>Skills</span></div>
            <div><strong>{String(c.experience.length).padStart(2,"0")}</strong><span>Roles</span></div>
          </div>
        </div>
      </div>
    </section>

    <section id="expertise" className="exp-section exp-expertise" aria-labelledby="expertise-heading">
      <div className="exp-contained">
        <div id="expertise-heading"><EditorialTitle number="03" eyebrow="The toolkit"
          note="The technology is important. How it helps real people is what matters.">
          Capabilities & craft.
        </EditorialTitle></div>
        <div className="exp-expertise-layout">
          <div className="exp-capability-feature"><span className="exp-capability-icon" aria-hidden="true">✳</span>
            <div><p className="exp-overline">MY APPROACH</p><h3>Thoughtful ideas.<br/>Useful outcomes.</h3>
              <p>I care about the details that make digital products feel effortless, useful and memorable.</p></div>
            <a href="#contact" className="exp-text-link">Let's build something <Arrow diagonal/></a>
          </div>
          <div className="exp-skill-panel">
            <p className="exp-overline">SKILLS & TECHNOLOGIES <Arrow diagonal/></p>
            {expertise.length ? <div className="exp-skill-tags">{expertise.map((skill) => <span key={skill}>{skill}</span>)}</div> :
              <p className="exp-empty-copy">Skills and tools will appear here as they're added.</p>}
            {c.skills.length > expertise.length && <p className="exp-extra-skills">+ {c.skills.length - expertise.length} more tools in my toolkit</p>}
          </div>
        </div>
        {c.services.length > 0 && <div className="exp-services">
          {c.services.map((service,index) => <article key={service.id}>
            <span className="exp-overline">0{index + 1} / WHAT I DO</span>
            <h3>{service.title}</h3><p>{service.description}</p><span aria-hidden="true" className="exp-service-arrow">↗</span>
          </article>)}
        </div>}
      </div>
    </section>

    {(c.experience.length > 0 || c.education.length > 0) && <section id="journey" className="exp-section exp-journey">
      <div className="exp-contained">
        <EditorialTitle number="04" eyebrow="The journey">Experience that shapes the work.</EditorialTitle>
        <div className="exp-journey-grid">
          {c.experience.length > 0 && <div><h3>Experience</h3><div className="exp-timeline">{c.experience.map((item) => <article key={item.id}>
            <p className="exp-overline">{item.period}</p><h4>{item.role}</h4><strong>{item.company}</strong><p>{item.description}</p>
          </article>)}</div></div>}
          {c.education.length > 0 && <div><h3>Education</h3><div className="exp-timeline">{c.education.map((item) => <article key={item.id}>
            <p className="exp-overline">{item.period}</p><h4>{item.degree}</h4><strong>{item.school}</strong><p>{item.description}</p>
          </article>)}</div></div>}
        </div>
      </div>
    </section>}

    <section id="contact" className="exp-contact" aria-labelledby="contact-heading">
      <div className="exp-contact-light exp-contact-light-one" aria-hidden="true"/>
      <div className="exp-contact-light exp-contact-light-two" aria-hidden="true"/>
      <div className="exp-contained exp-contact-inner">
        <p className="exp-section-index"><span>05</span>The next conversation</p>
        <p className="exp-contact-kicker">HAVE A CHALLENGE? AN IDEA? A HELLO?</p>
        <h2 id="contact-heading">{c.contactHeadline}</h2>
        <p className="exp-contact-description">Whether it's a full-time role, a collaboration or a project worth exploring, I'd love to hear about it.</p>
        <ContactActions email={c.email}/>
        {contactFormEnabled && c.email && <ContactForm/>}
        {c.socials.some((social) => social.url) && <div className="exp-socials"><span className="exp-overline">ELSEWHERE ON THE INTERNET</span>
          <div>{c.socials.filter((social) => social.url).map((social) => <a key={social.id} href={social.url} target="_blank" rel="noopener noreferrer">{social.label} <Arrow diagonal/></a>)}</div>
        </div>}
      </div>
    </section>
  </PublicShell>;
}
