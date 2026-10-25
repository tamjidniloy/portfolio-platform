import { useId, useState } from "react";
import { Link, redirect, useLoaderData } from "react-router";
import { getStudioContent, studioSession } from "../../server/studio/index.js";
import { ThemeControl } from "../components/theme-control.jsx";

export async function loader({ request }) {
  if (!(await studioSession(request))) throw redirect("/admin/login");
  return Response.json(await getStudioContent(), { headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex,nofollow" } });
}
export function meta() {
  return [{ title: "Portfolio Studio — Dashboard" }, { name: "robots", content: "noindex,nofollow" }];
}
const TABS = [
  { id: "overview", label: "Overview", icon: "◈", description: "Everything in one place." },
  { id: "profile", label: "Hero & about", icon: "◉", description: "Introduce yourself in your own words." },
  { id: "projects", label: "Projects", icon: "▦", description: "Showcase your best work with case studies and pictures." },
  { id: "skills", label: "Skills & tools", icon: "✳", description: "Highlight what you work with." },
  { id: "experience", label: "Experience", icon: "◷", description: "Add the roles and experience that shaped you." },
  { id: "education", label: "Education", icon: "▤", description: "Share your education and qualifications." },
  { id: "services", label: "Services", icon: "◇", description: "Explain the ways you can help." },
  { id: "socials", label: "Social links", icon: "↗", description: "Connect the portfolio to your professional accounts." },
  { id: "contact", label: "Contact", icon: "✉", description: "Make it easy for visitors to reach you." },
  { id: "appearance", label: "Appearance", icon: "◐", description: "Choose colors and headings for the site." },
];
const defaults = {
  projects: { title: "", category: "", description: "", outcome: "", role: "", challenge: "", approach: "", architecture: "", lessons: "", year: "", cover: "", stack: "", liveUrl: "", sourceUrl: "", featured: false },
  experience: { role: "", company: "", period: "", description: "" },
  education: { degree: "", school: "", period: "", description: "" },
  services: { title: "", description: "" },
  socials: { label: "", url: "" },
};
async function api(path, method, body, headers = {}) {
  const response = await fetch("/api/studio" + path, {
    method, credentials: "same-origin",
    headers: { "X-Studio-Request": "1", ...(body && !(body instanceof File) ? { "Content-Type": "application/json" } : {}), ...headers },
    body: body instanceof File ? body : body ? JSON.stringify(body) : undefined,
  });
  const data = response.status === 204 ? {} : await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Request failed. Please try again.");
  return data;
}
function Field({ label, hint, value = "", onChange, textarea = false, type = "text", placeholder = "", maxLength = 140, wide = false }) {
  const id = useId();
  return <div className={"studio-field" + (wide ? " wide" : "")}>
    <label htmlFor={id}>{label}</label>
    {textarea ? <textarea id={id} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength} rows={4}/> :
      <input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLength}/>}
    {hint && <small>{hint}</small>}
  </div>;
}
function Panel({ title, description, children }) {
  return <section className="studio-panel"><h2>{title}</h2><p>{description}</p>{children}</section>;
}
function ImageUploader({ label, value, onUpload, uploading }) {
  const id = "upload-" + label.toLowerCase().replace(/\s+/g, "-");
  return <div className="studio-field">
    <label>{label}</label>
    <div className="studio-upload-row">
      {value && <img src={value} alt="Current uploaded image"/>}
      <label htmlFor={id}>{uploading ? "Uploading…" : value ? "Replace image" : "+ Choose image"}</label>
      <input id={id} type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) onUpload(file);
        e.target.value = "";
      }}/>
      <span className="studio-inline-note">JPG, PNG or WebP · up to 5 MB</span>
    </div>
  </div>;
}
export default function Admin() {
  const { content, version: initialVersion } = useLoaderData();
  const [draft, setDraft] = useState(content);
  const [version, setVersion] = useState(initialVersion);
  const [tab, setTab] = useState("overview");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [skillEntry, setSkillEntry] = useState("");
  const [dirty, setDirty] = useState(false);
  function change(field, value) {
    setDraft((prev) => ({ ...prev, [field]: value }));
    setDirty(true); setNotice("");
  }
  function addItem(section) {
    change(section, [...draft[section], { id: crypto.randomUUID(), ...defaults[section] }]);
  }
  function editItem(section, id, field, value) {
    change(section, draft[section].map((item) => item.id === id ? { ...item, [field]: value } : item));
  }
  function removeItem(section, id) {
    change(section, draft[section].filter((item) => item.id !== id));
  }
  async function upload(file, callback) {
    setError(""); setUploading(true);
    try {
      if (file.size > 5 * 1024 * 1024) throw new Error("Choose an image smaller than 5 MB.");
      const result = await api("/upload", "POST", file, { "Content-Type": file.type });
      callback(result.url);
      setNotice("Image uploaded. Click Publish updates to display it on your website.");
    } catch (err) { setError(err.message); }
    finally { setUploading(false); }
  }
  async function save() {
    setError(""); setNotice(""); setSaving(true);
    try {
      const result = await api("/content", "PUT", { content: draft, version });
      setVersion(result.version); setDirty(false);
      setNotice("Saved! Your live portfolio is updated. ✳");
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  }
  async function logout() {
    setError("");
    try { await api("/logout", "POST"); window.location.assign("/admin/login"); }
    catch (err) { setError(err.message); }
  }
  const active = TABS.find((entry) => entry.id === tab) || TABS[0];
  function renderCollection(section, fields, caption) {
    return <Panel title={active.label} description={caption}>
      {draft[section].length === 0 && <div className="studio-empty">Nothing here yet. Add your first {active.label.toLowerCase()} entry below.</div>}
      {draft[section].map((item, index) => <div className="studio-entry" key={item.id}>
        <div className="studio-entry-title"><strong>{item.title || item.role || item.degree || item.label || "Entry " + (index + 1)}</strong>
          <button type="button" className="studio-remove" onClick={() => removeItem(section, item.id)}>Remove</button></div>
        <div className="studio-form-grid">{fields.map((field) => <Field key={field.key} label={field.label} placeholder={field.placeholder || ""} value={item[field.key]}
          wide={field.wide} textarea={field.textarea} maxLength={field.maxLength || 140}
          onChange={(value) => editItem(section, item.id, field.key, value)}/>)}</div>
        {section === "projects" && <>
          <ImageUploader label={"Project cover " + (index + 1)} value={item.cover} uploading={uploading} onUpload={(file) => upload(file, (value) => editItem(section, item.id, "cover", value))}/>
          <label className="studio-toggle"><input type="checkbox" checked={item.featured} onChange={(e) => editItem(section, item.id, "featured", e.target.checked)}/> Feature this project first</label>
        </>}
      </div>)}
      <button type="button" className="studio-add" onClick={() => addItem(section)}>+ Add {section === "projects" ? "project" : section === "socials" ? "social link" : section === "services" ? "service" : section === "experience" ? "experience" : "education"}</button>
    </Panel>;
  }
  return <div className="studio-app">
    <aside className="studio-sidebar">
      <div className="studio-brand"><span>✳</span><div>Portfolio Studio<small>YOUR CREATIVE CONTROL ROOM</small></div></div>
      <p className="studio-side-caption">WORKSPACE</p>
      <nav className="studio-menu" aria-label="Editor sections">{TABS.map((entry) =>
        <button type="button" key={entry.id} className={tab === entry.id ? "active" : ""} aria-current={tab === entry.id ? "page" : undefined} onClick={() => { setTab(entry.id); setError(""); }}>
          <span aria-hidden="true">{entry.icon}</span>{entry.label}</button>)}</nav>
      <div className="studio-side-footer"><Link to="/" target="_blank" rel="noopener noreferrer">↗ &nbsp; View live portfolio</Link>
        <button type="button" onClick={logout}>⇥ &nbsp; Sign out</button></div>
    </aside>
    <div className="studio-main">
      <header className="studio-top"><span className="studio-breadcrumb">WORKSPACE <span aria-hidden="true"> / </span> <strong>{active.label}</strong></span>
        <div className="studio-top-right"><span className="studio-live-dot" aria-hidden="true"/><span className="studio-live-text">Live website</span>
          <div className="studio-appearance-control"><ThemeControl compact /></div>
          <Link to="/" target="_blank" rel="noopener noreferrer" className="studio-preview-link">Preview ↗</Link></div></header>
      <div className="studio-heading"><div><p className="studio-kicker">YOUR PORTFOLIO / YOUR WAY</p><h1>{tab === "overview" ? "Good to see you." : active.label}</h1><p>{active.description} {dirty ? "You have unpublished edits." : "Your changes go live when you save."}</p></div>
        <button className="studio-save" type="button" onClick={save} disabled={saving || uploading || !dirty}>{saving ? "Saving…" : "Publish updates ↗"}</button></div>
      {error && <p role="alert" className="studio-error">{error}</p>}
      {notice && <p role="status" className="studio-toast">{notice}</p>}
      <div className="studio-layout">
        <div>
          {tab === "overview" && <>
            <Panel title={"Hello, " + draft.name.split(" ")[0] + " ✳"} description="Edit any part of your website without writing a single line of code.">
              <div className="studio-form-grid">
                {[
                  { id: "profile", title: "Make it personal", caption: "Update your hero, portrait and about text." },
                  { id: "projects", title: "Show your work", caption: "Add case studies, project links and cover images." },
                  { id: "skills", title: "Share your strengths", caption: "Add your tools, skills and technologies." },
                  { id: "contact", title: "Connect with people", caption: "Set your public email and contact headline." },
                ].map((item) => <button key={item.id} type="button" onClick={() => setTab(item.id)}
                  className="studio-quick-card">
                  <strong>{item.title} ↗</strong>
                  <span>{item.caption}</span></button>)}
              </div>
            </Panel>
            <Panel title="How publishing works" description="A simple three-step workflow.">
              <p className="studio-how">① Choose a section on the left. &nbsp; ② Fill in the fields or upload an image. &nbsp; ③ Click <strong>Publish updates</strong>. Refresh the public homepage to see it instantly.</p>
            </Panel>
          </>}
          {tab === "profile" && <>
            <Panel title="First impressions" description="These are the words visitors see first on your portfolio landing page.">
              <div className="studio-form-grid">
                <Field label="Your name" value={draft.name} onChange={(v) => change("name", v)} placeholder="Your full name" maxLength={100}/>
                <Field label="Professional title" value={draft.title} onChange={(v) => change("title", v)} placeholder="Software Developer" maxLength={120}/>
                <Field label="Small introduction label" value={draft.eyebrow} onChange={(v) => change("eyebrow", v)} maxLength={100} placeholder="CREATIVE DEVELOPER"/>
                <Field label="Your location" value={draft.location} onChange={(v) => change("location", v)} maxLength={160} placeholder="Dhaka, Bangladesh"/>
                <Field label="Main headline" wide value={draft.headline} onChange={(v) => change("headline", v)} maxLength={180} placeholder="Designing experiences that feel different"/>
                <Field label="About you" wide textarea value={draft.bio} onChange={(v) => change("bio", v)} maxLength={1400} placeholder="Your story, interests, specialties and approach…"/>
              </div>
              <label className="studio-toggle"><input type="checkbox" checked={draft.available} onChange={(e) => change("available", e.target.checked)}/> Show “Open for opportunities” status</label>
            </Panel>
            <Panel title="Your portrait" description="Make your introduction more personal with a headshot or artwork.">
              <ImageUploader label="Profile picture" value={draft.avatar} uploading={uploading} onUpload={(file) => upload(file, (value) => change("avatar", value))}/>
              <Field label="Résumé link (optional)" type="url" value={draft.resumeUrl} onChange={(v) => change("resumeUrl", v)} placeholder="https://…"/>
            </Panel>
          </>}
          {tab === "projects" && renderCollection("projects", [
            { key: "title", label: "Project name", placeholder: "An amazing project" },
            { key: "category", label: "Category", placeholder: "Full-stack · UI/UX · AI" },
            { key: "year", label: "Year", placeholder: "2026", maxLength: 30 },
            { key: "stack", label: "Technologies used", placeholder: "React, Node.js, PostgreSQL", maxLength: 260 },
            { key: "description", label: "Project description", wide: true, textarea: true, maxLength: 1500 },
            { key: "role", label: "Your contribution (optional)", placeholder: "What was your actual responsibility?", wide: true, maxLength: 160 },
            { key: "challenge", label: "The challenge (optional)", placeholder: "The real problem, constraints and user needs.", wide: true, textarea: true, maxLength: 1400 },
            { key: "approach", label: "Design and implementation approach (optional)", placeholder: "How you addressed the problem; why you chose this approach.", wide: true, textarea: true, maxLength: 1400 },
            { key: "architecture", label: "Technical architecture (optional)", placeholder: "Real components, data flows, tradeoffs and security boundaries. Never include secrets.", wide: true, textarea: true, maxLength: 1800 },
            { key: "outcome", label: "Result or impact (optional)", placeholder: "What changed because of this work? Use real outcomes only.", wide: true, maxLength: 280 },
            { key: "lessons", label: "Lessons learned (optional)", placeholder: "What would you improve or do differently?", wide: true, textarea: true, maxLength: 1400 },
            { key: "liveUrl", label: "Live demo URL", placeholder: "https://…" },
            { key: "sourceUrl", label: "Source code URL", placeholder: "https://github.com/…" },
          ], "Add your work, upload images and choose which projects appear first.")}
          {tab === "skills" && <Panel title="Your toolkit" description="Type one skill at a time, then click Add skill. Tap the × next to any skill to remove it.">
            <div className="skills-grid" style={{ marginBottom: 25 }}>{draft.skills.map((skill) => <button key={skill} type="button" onClick={() => change("skills", draft.skills.filter((s) => s !== skill))}
              className="studio-skill-pill" aria-label={"Remove skill " + skill}>{skill} ×</button>)}</div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <input aria-label="New skill" value={skillEntry} maxLength={45} placeholder="e.g. React / Python / Figma" onChange={(e) => setSkillEntry(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (skillEntry.trim() && !draft.skills.includes(skillEntry.trim())) change("skills", [...draft.skills, skillEntry.trim()]); setSkillEntry(""); } }}
                className="studio-skill-input"/>
              <button type="button" className="studio-save" onClick={() => { if (skillEntry.trim() && !draft.skills.includes(skillEntry.trim())) change("skills", [...draft.skills, skillEntry.trim()]); setSkillEntry(""); }}>+ Add skill</button>
            </div>
          </Panel>}
          {tab === "experience" && renderCollection("experience", [
            { key: "role", label: "Job title", placeholder: "Software Engineer" },
            { key: "company", label: "Company / organization" },
            { key: "period", label: "Dates", placeholder: "2024 — Present", maxLength: 80 },
            { key: "description", label: "What you did", wide: true, textarea: true, maxLength: 1400 },
          ], "Add roles, dates and a short description. The experience timeline builds itself.")}
          {tab === "education" && renderCollection("education", [
            { key: "degree", label: "Degree / qualification" },
            { key: "school", label: "Institution" },
            { key: "period", label: "Dates", placeholder: "2020 — 2024", maxLength: 80 },
            { key: "description", label: "Details", wide: true, textarea: true, maxLength: 1000 },
          ], "Share schools, degrees, certifications or other qualifications.")}
          {tab === "services" && renderCollection("services", [
            { key: "title", label: "Service title", placeholder: "Web development" },
            { key: "description", label: "Short description", wide: true, textarea: true, maxLength: 700 },
          ], "Highlight the services you offer and how you can help clients.")}
          {tab === "socials" && renderCollection("socials", [
            { key: "label", label: "Platform", placeholder: "GitHub / LinkedIn / Behance", maxLength: 60 },
            { key: "url", label: "Public profile URL", placeholder: "https://…" },
          ], "Add as many as 12 social links. They'll appear in the footer contact area.")}
          {tab === "contact" && <Panel title="Let's connect" description="Your contact details appear on the homepage. Visitors do not need accounts to get in touch.">
            <Field label="Public email address" type="email" value={draft.email} onChange={(v) => change("email", v)} placeholder="hello@yourdomain.com" maxLength={254}/>
            <Field label="Contact headline" value={draft.contactHeadline} onChange={(v) => change("contactHeadline", v)} maxLength={140} placeholder="Have something in mind?"/>
            <p className="studio-inline-note">This public contact email can be different from the private email you use to sign in.</p>
          </Panel>}
          {tab === "appearance" && <Panel title="Make it yours" description="Select a mood and personalize the featured work section heading.">
            <div className="studio-field"><label htmlFor="studio-accent">Color palette</label><select id="studio-accent" value={draft.accent} onChange={(e) => change("accent", e.target.value)}>
              <option value="violet">Lilac / Studio Violet</option><option value="mint">Fresh Mint</option><option value="peach">Warm Peach</option>
            </select></div>
            <Field label="Projects section heading" value={draft.projectsHeading} onChange={(v) => change("projectsHeading", v)} maxLength={100} placeholder="Selected work"/>
            <p className="studio-inline-note">The color palette is published for visitors. The light/dark switch changes your own viewing preference on each device.</p>
            <div className="studio-appearance-guide"><ThemeControl /> <span className="studio-inline-note">Preview both contrast modes in your dashboard, then open the public site to check the finished result.</span></div>
          </Panel>}
          <div className="studio-bottom-save"><span className="studio-inline-note">{dirty ? "Unsaved changes" : "Everything is up to date"}</span>
            <button className="studio-save" type="button" disabled={saving || uploading || !dirty} onClick={save}>{saving ? "Saving…" : "Publish updates ↗"}</button></div>
        </div>
        <aside className="studio-aside">
          <div className="studio-tip"><div className="studio-tip-icon">✳</div><h3>You're in control.</h3>
            <p>No code. No confusing settings. Just edit your story and hit Publish updates. What you save appears on the visitor website immediately.</p></div>
          <div className="studio-summary"><span>YOUR PORTFOLIO AT A GLANCE</span>
            <div className="studio-summary-row"><span>Projects</span><strong>{draft.projects.length}</strong></div>
            <div className="studio-summary-row"><span>Skills</span><strong>{draft.skills.length}</strong></div>
            <div className="studio-summary-row"><span>Experience</span><strong>{draft.experience.length}</strong></div>
            <div className="studio-summary-row"><span>Education</span><strong>{draft.education.length}</strong></div>
            <div className="studio-summary-row"><span>Services</span><strong>{draft.services.length}</strong></div></div>
        </aside>
      </div>
    </div>
  </div>;
}
