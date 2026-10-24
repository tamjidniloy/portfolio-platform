// Small, explicit public-content contract for the visual portfolio editor.
// All visitor-facing copy comes from the owner's saved form fields.
export const DEFAULT_PORTFOLIO = Object.freeze({
  name: "Your Name",
  title: "Software Developer",
  eyebrow: "INDEPENDENT SOFTWARE DEVELOPER",
  headline: "Thoughtful code. Remarkable experiences.",
  bio: "A space for the work, ideas and projects that define my approach. Explore what I'm building.",
  location: "Based anywhere · Working worldwide",
  email: "",
  available: true,
  avatar: "",
  resumeUrl: "",
  accent: "violet",
  projectsHeading: "Selected work",
  contactHeadline: "Have something in mind?",
  skills: [],
  projects: [],
  experience: [],
  education: [],
  services: [],
  socials: [],
});
const ACCENTS = new Set(["violet", "mint", "peach"]);
const invalid = (field) => { throw new TypeError("Invalid portfolio field: " + field); };
function text(value, field, max, required = false) {
  if (typeof value !== "string" || value.length > max || (required && !value.trim())) invalid(field);
  return value.trim();
}
function link(value, field, image = false) {
  const input = text(value, field, 2048);
  if (!input) return "";
  if (image && /^\/media\/[a-f0-9]{32}\.(?:png|jpg|webp)$/.test(input)) return input;
  try {
    const parsed = new URL(input);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") invalid(field);
    if (parsed.username || parsed.password || !parsed.hostname.includes(".")) invalid(field);
    return parsed.href;
  } catch { invalid(field); }
}
function collection(source, key, maxCount, mapper) {
  if (!Array.isArray(source) || source.length > maxCount) invalid(key);
  const ids = new Set();
  return source.map((item, index) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) invalid(key);
    const id = text(item.id, key + ".id", 80, true);
    if (!/^[a-zA-Z0-9_-]+$/.test(id) || ids.has(id)) invalid(key + ".id");
    ids.add(id);
    return mapper(item, index, id);
  });
}
export function validatePortfolio(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) invalid("content");
  const data = {};
  for (const field of ["name", "title", "eyebrow", "headline", "bio", "location", "email",
    "avatar", "resumeUrl", "accent", "projectsHeading", "contactHeadline"]) {
    if (typeof input[field] !== "string") invalid(field);
  }
  data.name = text(input.name, "name", 100, true);
  data.title = text(input.title, "title", 120, true);
  data.eyebrow = text(input.eyebrow, "eyebrow", 100);
  data.headline = text(input.headline, "headline", 180, true);
  data.bio = text(input.bio, "bio", 1400);
  data.location = text(input.location, "location", 160);
  data.email = text(input.email, "email", 254).toLowerCase();
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) invalid("email");
  if (typeof input.available !== "boolean") invalid("available");
  data.available = input.available;
  data.avatar = link(input.avatar, "avatar", true);
  data.resumeUrl = link(input.resumeUrl, "resumeUrl");
  data.accent = ACCENTS.has(input.accent) ? input.accent : invalid("accent");
  data.projectsHeading = text(input.projectsHeading, "projectsHeading", 100, true);
  data.contactHeadline = text(input.contactHeadline, "contactHeadline", 140, true);
  if (!Array.isArray(input.skills) || input.skills.length > 40) invalid("skills");
  data.skills = [...new Set(input.skills.map((skill) => text(skill, "skills", 45, true)))];
  data.projects = collection(input.projects, "projects", 30, (p, _, id) => ({
    id, title: text(p.title, "project.title", 140, true),
    category: text(p.category, "project.category", 80),
    description: text(p.description, "project.description", 1500),
    // Optional proof of results; older saved projects remain valid.
    outcome: text(typeof p.outcome === "string" ? p.outcome : "", "project.outcome", 280),
    year: text(p.year, "project.year", 30),
    cover: link(p.cover, "project.cover", true),
    stack: text(p.stack, "project.stack", 260),
    liveUrl: link(p.liveUrl, "project.liveUrl"),
    sourceUrl: link(p.sourceUrl, "project.sourceUrl"),
    featured: Boolean(p.featured),
  }));
  data.experience = collection(input.experience, "experience", 25, (p, _, id) => ({
    id, role: text(p.role, "experience.role", 140, true),
    company: text(p.company, "experience.company", 140),
    period: text(p.period, "experience.period", 80),
    description: text(p.description, "experience.description", 1400),
  }));
  data.education = collection(input.education, "education", 20, (p, _, id) => ({
    id, degree: text(p.degree, "education.degree", 140, true),
    school: text(p.school, "education.school", 140),
    period: text(p.period, "education.period", 80),
    description: text(p.description, "education.description", 1000),
  }));
  data.services = collection(input.services, "services", 12, (p, _, id) => ({
    id, title: text(p.title, "services.title", 140, true),
    description: text(p.description, "services.description", 700),
  }));
  data.socials = collection(input.socials, "socials", 12, (p, _, id) => ({
    id, label: text(p.label, "socials.label", 60, true),
    url: link(p.url, "socials.url"),
  }));
  const bytes = Buffer.byteLength(JSON.stringify(data), "utf8");
  if (bytes > 160_000) invalid("size");
  return data;
}
