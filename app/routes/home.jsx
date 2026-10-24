import { useLoaderData } from "react-router";
import { getStudioContent } from "../../server/studio/index.js";
import { PublicShell } from "../components/public-shell.jsx";

export async function loader() {
  const site = await getStudioContent();
  return Response.json(site, { headers: { "Cache-Control": "no-store" } });
}
export function meta({ data }) {
  const c = data?.content;
  return [
    { title: (c?.name || "Portfolio") + " — " + (c?.title || "Creative Developer") },
    { name: "description", content: c?.bio || "Independent developer portfolio" },
    ...(c?.name === "Your Name" ? [{ name: "robots", content: "noindex, nofollow" }] : []),
  ];
}
const Arrow = ({ diagonal = false }) => <span aria-hidden="true">{diagonal ? "↗" : "→"}</span>;
function ProjectCard({ project, index }) {
  return <article className={"work-card work-card-" + (index % 3)}>
    <div className="work-visual" style={project.cover ? { backgroundImage: "url(" + project.cover + ")" } : undefined}>
      {!project.cover && <div aria-hidden="true" className="visual-art"><i/><i/><i/></div>}
      <span className="work-index">{String(index + 1).padStart(2, "0")} / PROJECT</span>
      {project.liveUrl && <a className="work-visit" href={project.liveUrl} target="_blank" rel="noopener noreferrer" aria-label={"View " + project.title}><Arrow diagonal/></a>}
    </div>
    <div className="work-meta"><div><p>{project.category || "Selected project"}{project.year ? " · " + project.year : ""}</p>
      <h3>{project.title}</h3><p className="work-description">{project.description}</p></div>
      <span className="work-stack">{project.stack}</span></div>
    {project.sourceUrl && <a className="text-link" href={project.sourceUrl} rel="noopener noreferrer" target="_blank">View source <Arrow diagonal/></a>}
  </article>;
}
function SectionHeading({ index, kicker, title, description }) {
  return <div className="section-title-wrap">
    <div className="section-label"><span>{index}</span><span>{kicker}</span></div>
    <div><h2>{title}</h2>{description && <p>{description}</p>}</div>
  </div>;
}
export default function Home() {
  const { content: c } = useLoaderData();
  const featured = [...c.projects].sort((a, b) => Number(b.featured) - Number(a.featured));
  const firstName = c.name.split(/\s+/)[0];
  return <PublicShell name={c.name} accent={c.accent}>
    <section className="hero-section" aria-label="Introduction">
      <div className="hero-glow glow-one" aria-hidden="true"/>
      <div className="hero-glow glow-two" aria-hidden="true"/>
      <div className="hero-inner">
        <div className="hero-copy">
          <div className="hero-tag"><span className="pulse-indicator"/> {c.available ? "OPEN FOR OPPORTUNITIES" : "CURRENTLY EXPLORING IDEAS"} <span className="tag-line"/></div>
          <p className="hero-eyebrow">{c.eyebrow}</p>
          <h1>{c.headline}</h1>
          <p className="hero-description">{c.bio}</p>
          <div className="hero-actions">
            <a className="btn-primary" href="#work">Explore my work <Arrow diagonal/></a>
            <a className="btn-subtle" href="#contact">Let’s connect <Arrow/></a>
          </div>
          <div className="hero-bottomline"><span className="tiny-star">✳</span> {c.location}<span className="hero-line"/></div>
        </div>
        <div className="hero-art" aria-label={c.avatar ? "Portrait image" : "Decorative abstract sphere"}>
          <div className="orb-backdrop"/>
          <div className="orb-orbit orbit-a"/>
          <div className="orb-orbit orbit-b"/>
          <div className="orb-orbit orbit-c"/>
          <div className="orb-core">{c.avatar && <img alt={"Portrait of " + c.name} src={c.avatar}/>}</div>
          <div className="orb-caption"><span className="orb-caption-glyph">✳</span><div>DESIGN-LED THINKING<br/><strong>DEVELOPMENT-DRIVEN DETAIL</strong></div></div>
          <span className="hero-coordinates" aria-hidden="true">PORTFOLIO — 001 / {new Date().getFullYear()}</span>
        </div>
      </div>
      <div className="hero-bottom-rail"><span>SCROLL TO EXPLORE <span aria-hidden="true">↓</span></span><span>CRAFTED WITH CARE & CURIOSITY</span></div>
    </section>

    <div className="ticker"><div className="ticker-track" aria-hidden="true">
      {[0, 1].map((k) => <span key={k}>{(c.skills.length ? c.skills : ["CREATIVE THINKING", "PROBLEM SOLVING", "DIGITAL EXPERIENCES", "CONTINUOUS LEARNING"]).map((s, i) =>
        <span className="ticker-item" key={i}><b>✳</b> {s}</span>)}</span>)}
    </div></div>

    <section id="work" className="portfolio-section work-section">
      <SectionHeading index="01" kicker="THE PORTFOLIO" title={c.projectsHeading} description="A collection of ideas turned into experiences. Built with purpose, care and an eye for detail."/>
      {featured.length ? <div className="work-grid">{featured.map((item, index) => <ProjectCard key={item.id} project={item} index={index}/>)}</div> :
        <div className="work-empty"><div className="work-empty-symbol">✳</div><span>01 / YOUR WORK STARTS HERE</span><h3>Something great is taking shape.</h3><p>Projects and case studies will appear here as they are added to the portfolio.</p></div>}
      <div className="section-endnote"><span>GOOD IDEAS DESERVE EXCELLENT EXECUTION.</span><span>↗</span></div>
    </section>

    <section id="about" className="about-section">
      <div className="about-shell">
        <div className="section-label light-label"><span>02</span><span>THE PERSON BEHIND THE WORK</span></div>
        <div className="about-grid">
          <div className="about-heading"><p className="about-small">HELLO, I'M {firstName.toUpperCase()}</p><h2>More than<br/><em>just code.</em></h2>
            <div className="about-signature">✳</div></div>
          <div className="about-body">
            <p className="about-lead">{c.headline}</p>
            <p>{c.bio}</p>
            {c.resumeUrl && <a className="about-link" href={c.resumeUrl} target="_blank" rel="noopener noreferrer">View résumé <Arrow diagonal/></a>}
            <div className="about-numbers">
              <div><strong>{String(c.projects.length).padStart(2, "0")}</strong><span>Projects</span></div>
              <div><strong>{String(c.skills.length).padStart(2, "0")}</strong><span>Skills & tools</span></div>
              <div><strong>{String(c.experience.length).padStart(2, "0")}</strong><span>Experiences</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="expertise" className="portfolio-section expertise-section">
      <SectionHeading index="03" kicker="WHAT I BRING TO THE TABLE" title="Capabilities & craft." description="The tools, skills and strengths behind the work."/>
      <div className="expertise-grid">
        <div className="expertise-feature"><span className="feature-asterisk">✳</span><div><span className="eyebrow">MY TOOLKIT</span><h3>Curiosity meets capability.</h3><p>Always learning, always refining. The best work happens where technology and creativity meet.</p></div></div>
        <div className="skill-board">
          <p className="mini-label">SKILLS & TECHNOLOGIES <span>↗</span></p>
          {c.skills.length ? <div className="skills-grid">{c.skills.map((skill) => <span key={skill}>{skill}</span>)}</div> :
            <p className="portfolio-placeholder">Skills and tools will be displayed here as they're added.</p>}
        </div>
      </div>
      {c.services.length > 0 && <div className="service-grid">{c.services.map((service, index) => <article key={service.id}><span>0{index + 1} / OFFERING</span><h3>{service.title}</h3><p>{service.description}</p><b aria-hidden="true">↗</b></article>)}</div>}
    </section>

    {(c.experience.length > 0 || c.education.length > 0) && <section className="portfolio-section journey-section" id="journey">
      <SectionHeading index="04" kicker="THE JOURNEY" title="The story so far."/>
      <div className="journey-columns">
        {c.experience.length > 0 && <div><h3 className="journey-heading">Experience</h3>{c.experience.map((e) => <div className="journey-entry" key={e.id}><p>{e.period}</p><div><h4>{e.role}</h4><strong>{e.company}</strong><span>{e.description}</span></div></div>)}</div>}
        {c.education.length > 0 && <div><h3 className="journey-heading">Education</h3>{c.education.map((e) => <div className="journey-entry" key={e.id}><p>{e.period}</p><div><h4>{e.degree}</h4><strong>{e.school}</strong><span>{e.description}</span></div></div>)}</div>}
      </div>
    </section>}

    <section className="contact-section" id="contact">
      <div className="contact-ring ring-one" aria-hidden="true"/><div className="contact-ring ring-two" aria-hidden="true"/>
      <div className="contact-inner">
        <div className="section-label light-label"><span>05</span><span>THE NEXT CHAPTER</span></div>
        <p className="contact-hello">GOT A PROJECT? AN IDEA? A HELLO?</p>
        <h2>{c.contactHeadline}</h2>
        <p className="contact-copy">Great things start with a conversation. Tell me what you're thinking.</p>
        {c.email ? <a className="contact-button" href={"mailto:" + c.email}>Start a conversation <Arrow diagonal/></a> :
          <span className="contact-notice">Contact details coming soon.</span>}
        <div className="contact-footer"><span>LET'S MAKE SOMETHING MATTER.</span>
          <div>{c.socials.filter((s) => s.url).map((s) => <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer">{s.label} ↗</a>)}</div></div>
      </div>
    </section>
  </PublicShell>;
}
