import { useState } from "react";
import { Link, useLoaderData } from "react-router";
import { getStudioContent } from "../../server/studio/index.js";
import { PublicShell } from "../components/public-shell.jsx";

export async function loader({ params }) {
  const { content } = await getStudioContent();
  const project = content.projects.find((item) => item.id === params.projectId);
  if (!project) throw new Response("Project not found", { status: 404 });
  return Response.json({ project, profile: {
    name: content.name, title: content.title, accent: content.accent,
    email: content.email, resumeUrl: content.resumeUrl,
  }, related: content.projects.filter((item) => item.id !== project.id).slice(0, 3) },
  { headers: { "Cache-Control": "no-store" } });
}

export function meta({ data }) {
  if (!data?.project) return [{ title: "Project not found — DEVFOLIO OS" }];
  const title = data.project.title + " — " + data.profile.name;
  const description = data.project.description || "An original portfolio case study.";
  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "article" },
    ...(data.project.cover ? [{ property: "og:image", content: data.project.cover }] : []),
  ];
}

function ExternalLink({ href, children }) {
  if (!href) return null;
  return <a href={href} target="_blank" rel="noopener noreferrer">{children}<span aria-hidden="true"> ↗</span></a>;
}

function Narrative({ title, children }) {
  if (!children) return null;
  return <div className="sig-narrative">
    <h3>{title}</h3>
    <p>{children}</p>
  </div>;
}

function PerspectivePanel({ project }) {
  const views = [
    { id: "experience", label: "Experience" },
    ...(project.approach || project.architecture || project.stack ? [{ id: "engineering", label: "Engineering" }] : []),
    ...(project.outcome || project.lessons ? [{ id: "impact", label: "Impact" }] : []),
  ];
  const [active, setActive] = useState("experience");
  const current = views.some((view) => view.id === active) ? active : "experience";

  function onTabKeyDown(event, index) {
    const direction = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!direction && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? views.length - 1 : (index + direction + views.length) % views.length;
    setActive(views[next].id);
    event.currentTarget.parentElement.querySelectorAll('[role="tab"]')[next]?.focus();
  }

  return <section className="sig-inspector" aria-labelledby="sig-inspector-heading">
    <div className="sig-inspector-head">
      <div><p className="sig-eyebrow">PROJECT X-RAY / A CLOSER LOOK</p>
        <h2 id="sig-inspector-heading">Under the surface.</h2>
        <p>Choose the perspective most useful to you. Every detail comes from the published project record.</p>
      </div>
      <span className="sig-inspector-mark" aria-hidden="true">✳</span>
    </div>
    <div className="sig-tablist" role="tablist" aria-label="Case study perspectives">
      {views.map((view, index) => <button
        id={"sig-tab-" + view.id} key={view.id} type="button" role="tab"
        aria-selected={current === view.id} aria-controls={"sig-panel-" + view.id}
        tabIndex={current === view.id ? 0 : -1}
        onClick={() => setActive(view.id)}
        onKeyDown={(event) => onTabKeyDown(event, index)}>{String(index + 1).padStart(2, "0")} / {view.label}</button>)}
    </div>
    {current === "experience" && <div id="sig-panel-experience" role="tabpanel" tabIndex={0} aria-labelledby="sig-tab-experience" className="sig-panel">
      <p className="sig-panel-lead">{project.description || "Explore the purpose and ideas behind this project."}</p>
      <Narrative title="The challenge" >{project.challenge}</Narrative>
      <Narrative title="My contribution">{project.role}</Narrative>
      {project.liveUrl && <p className="sig-panel-link"><ExternalLink href={project.liveUrl}>Experience the live project</ExternalLink></p>}
    </div>}
    {current === "engineering" && <div id="sig-panel-engineering" role="tabpanel" tabIndex={0} aria-labelledby="sig-tab-engineering" className="sig-panel">
      <p className="sig-panel-lead">The technical choices and implementation behind the experience.</p>
      <Narrative title="Approach and decisions">{project.approach}</Narrative>
      <Narrative title="Architecture and tradeoffs">{project.architecture}</Narrative>
      <Narrative title="Tools and technologies">{project.stack}</Narrative>
      {project.sourceUrl && <p className="sig-panel-link"><ExternalLink href={project.sourceUrl}>Explore the source</ExternalLink></p>}
    </div>}
    {current === "impact" && <div id="sig-panel-impact" role="tabpanel" tabIndex={0} aria-labelledby="sig-tab-impact" className="sig-panel">
      <p className="sig-panel-lead">Evidence, outcomes and reflections—not invented metrics.</p>
      <Narrative title="Outcome">{project.outcome}</Narrative>
      <Narrative title="What I learned">{project.lessons}</Narrative>
    </div>}
  </section>;
}

export default function ProjectDetail() {
  const { project, profile, related } = useLoaderData();
  return <PublicShell name={profile.name} accent={profile.accent} projects={related}>
    <article className="sig-project-page">
      <header className="sig-project-hero">
        <div className="exp-contained">
          <Link to="/#work" className="sig-back-link"><span aria-hidden="true">← </span> All selected work</Link>
          <p className="sig-eyebrow">{project.category || "SELECTED WORK"}{project.year ? " / " + project.year : ""}</p>
          <h1>{project.title}</h1>
          <p className="sig-project-intro">{project.description}</p>
          <div className="sig-project-chips">
            {project.role && <span>{project.role}</span>}
            {project.stack && <span>{project.stack}</span>}
          </div>
          <div className="sig-project-actions">
            <ExternalLink href={project.liveUrl}>Visit live project</ExternalLink>
            <ExternalLink href={project.sourceUrl}>View source code</ExternalLink>
          </div>
        </div>
      </header>
      <div className="exp-contained">
        <div className="sig-project-visual">
          {project.cover ? <img src={project.cover} alt={"Cover image for " + project.title} fetchPriority="high" decoding="async"/> :
            <div className="sig-project-visual-fallback" aria-label="Project cover not supplied"><span aria-hidden="true">✳</span><p>{project.title}</p></div>}
        </div>
        <PerspectivePanel project={project}/>
        {related.length > 0 && <section className="sig-related" aria-labelledby="sig-related-heading">
          <p className="sig-eyebrow">KEEP EXPLORING</p>
          <h2 id="sig-related-heading">More selected work.</h2>
          <div className="sig-related-grid">
            {related.map((item) => <Link key={item.id} to={"/projects/" + encodeURIComponent(item.id)}>
              <span>{item.category || "Project"} <span aria-hidden="true">↗</span></span>
              <strong>{item.title}</strong>
              <span className="sig-related-description">{item.description}</span>
            </Link>)}
          </div>
        </section>}
        <div className="sig-project-next">
          <p>Have something worth building?</p>
          <Link to="/#contact">Start a conversation <span aria-hidden="true">↗</span></Link>
        </div>
      </div>
    </article>
  </PublicShell>;
}
