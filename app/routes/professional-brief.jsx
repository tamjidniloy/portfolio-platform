import { Link, useLoaderData } from "react-router";
import { getStudioContent } from "../../server/studio/index.js";
import { PublicShell } from "../components/public-shell.jsx";

export async function loader() {
  const { content } = await getStudioContent();
  return Response.json({ content }, { headers: { "Cache-Control": "no-store" } });
}

export function meta({ data }) {
  return [
    { title: "Professional overview — " + (data?.content?.name || "DEVFOLIO OS") },
    { name: "description", content: "Experience, selected projects and professional capabilities in one concise view." },
    ...(data?.content?.name === "Your Name" ? [{ name: "robots", content: "noindex,nofollow" }] : []),
  ];
}

export default function ProfessionalBrief() {
  const { content: c } = useLoaderData();
  const projects = [...c.projects].sort((a, b) => Number(b.featured) - Number(a.featured));
  return <PublicShell name={c.name} accent={c.accent} projects={projects}>
    <div className="sig-brief">
      <div className="exp-contained">
        <div className="sig-brief-intro">
          <div>
            <p className="sig-eyebrow">THE SHORT VERSION / PROFESSIONAL OVERVIEW</p>
            <h1>{c.name}</h1>
            <p className="sig-brief-role">{c.title}</p>
            <p className="sig-brief-bio">{c.bio}</p>
            <p className="sig-brief-location">{c.location}{c.available ? " · Open to opportunities" : ""}</p>
          </div>
          <div className="sig-brief-actions">
            {c.resumeUrl && <a href={c.resumeUrl} target="_blank" rel="noopener noreferrer">View résumé ↗</a>}
            {c.email && <a href={"mailto:" + c.email}>Email me ↗</a>}
            <Link to="/#work">Explore full portfolio ↗</Link>
          </div>
        </div>
        <div className="sig-brief-layout">
          <main className="sig-brief-main">
            <section aria-labelledby="sig-brief-project-heading">
              <div className="sig-brief-section-title"><p className="sig-eyebrow">01 / SELECTED WORK</p><h2 id="sig-brief-project-heading">Projects.</h2></div>
              {projects.length ? projects.map((project) => <article className="sig-brief-project" key={project.id}>
                <div className="sig-brief-project-meta"><span>{project.category || "Project"}</span><span>{project.year}</span></div>
                <h3><Link to={"/projects/" + encodeURIComponent(project.id)}>{project.title} <span aria-hidden="true">↗</span></Link></h3>
                <p>{project.description}</p>
                {project.outcome && <p><strong>Outcome: </strong>{project.outcome}</p>}
                {project.stack && <p className="sig-brief-stack">{project.stack}</p>}
              </article>) : <p className="sig-brief-empty">Published work will appear here.</p>}
            </section>
            {c.experience.length > 0 && <section aria-labelledby="sig-brief-experience-heading">
              <div className="sig-brief-section-title"><p className="sig-eyebrow">02 / PROFESSIONAL JOURNEY</p><h2 id="sig-brief-experience-heading">Experience.</h2></div>
              {c.experience.map((entry) => <article className="sig-brief-experience" key={entry.id}>
                <p>{entry.period}</p>
                <h3>{entry.role}</h3>
                <strong>{entry.company}</strong>
                <p>{entry.description}</p>
              </article>)}
            </section>}
          </main>
          <aside className="sig-brief-aside">
            <section aria-labelledby="sig-brief-skills-heading">
              <p className="sig-eyebrow">CAPABILITIES</p>
              <h2 id="sig-brief-skills-heading">Tools & craft.</h2>
              {c.skills.length ? <div className="sig-brief-skills">{c.skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
                : <p className="sig-brief-empty">Expertise will be published here.</p>}
            </section>
            {c.socials.some((link) => link.url) && <section aria-labelledby="sig-brief-links-heading">
              <p className="sig-eyebrow">CONNECT</p>
              <h2 id="sig-brief-links-heading">Elsewhere.</h2>
              <div className="sig-brief-socials">
                {c.socials.filter((item) => item.url).map((item) =>
                  <a href={item.url} target="_blank" rel="noopener noreferrer" key={item.id}>{item.label} ↗</a>)}
              </div>
            </section>}
          </aside>
        </div>
      </div>
    </div>
  </PublicShell>;
}