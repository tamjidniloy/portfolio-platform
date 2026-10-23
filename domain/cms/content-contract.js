/**
 * DB-R1 content rules. Server derives publication paths and public DTOs:
 * clients can never supply their own 'published' projection.
 */
export const CONTENT_TYPES = Object.freeze([
  "profile", "site_settings", "project", "research", "publication", "article",
  "education", "experience", "skill", "achievement", "social_link", "resume", "open_source",
]);
const types = new Set(CONTENT_TYPES);
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const researchStages = new Set(["idea", "in_progress", "preprint", "submitted", "accepted", "published", "completed", "paused"]);
const roots = Object.freeze({
  project: "/projects", research: "/research", article: "/writing",
  profile: "/about", site_settings: "/", education: "/education", experience: "/experience",
  skill: "/skills", achievement: "/achievements", publication: "/research/publications",
  resume: "/resume", open_source: "/projects/open-source", social_link: "/about/links",
});
const MAX_PAYLOAD_BYTES = 256 * 1024;
const REQUIRED = Object.freeze({
  profile:["biography"],site_settings:["publicTitle"],
  project:["role","problem","approach","outcome","limitations"],
  research:["researchStatus","researchQuestion","methods","results","limitations"],
  publication:["venue","publicationType"],article:["body"],
  education:["institution","qualification"],experience:["organization","role"],
  skill:["category"],achievement:["issuer"],social_link:["platform","url"],
  resume:["mediaAssetId"],open_source:["repository","contribution"],
});
const LIMITS = Object.freeze({
  biography:10000,publicTitle:200,role:1000,problem:4000,approach:4000,
  outcome:4000,limitations:4000,researchQuestion:4000,methods:10000,
  results:10000,evidenceUrl:2048,venue:300,publicationType:120,
  body:32768,institution:300,qualification:200,organization:300,
  category:200,issuer:300,platform:120,url:2048,repository:2048,
  contribution:4000,mediaAssetId:100,
});
function safeExternalUrl(value) {
  try {
    const u=new URL(value);
    return u.protocol==="https:"&&!u.username&&!u.password&&u.hostname.includes(".")&&
      !["localhost","127.0.0.1"].includes(u.hostname);
  } catch{return false;}
}


export class CmsError extends Error {
  constructor(code, status, message) {
    super(message);
    this.name = "CmsError";
    this.code = code;
    this.status = status;
  }
}
export function badInput(message = "Invalid content input") {
  return new CmsError("INVALID_CONTENT", 422, message);
}
const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
const string = (v, max) => typeof v === "string" && v.trim().length > 0 && v.length <= max;
const optional = (v, max) => v === undefined || v === null || (typeof v === "string" && v.length <= max);
export function assertContentType(type) {
  if (!types.has(type)) throw badInput("Unsupported content type");
  return type;
}
export function validSlug(value) {
  return typeof value === "string" && value.length <= 160 && slugPattern.test(value);
}
export function checkedUuid(value) {
  if (typeof value !== "string" ||
    !/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value)) {
    throw badInput("Invalid identifier");
  }
  return value;
}
export function checkedVersion(value) {
  if (!Number.isSafeInteger(value) || value < 0) throw badInput("Invalid lock version");
  return value;
}
export function checkedRevision(value) {
  if (!Number.isSafeInteger(value) || value < 1) throw badInput("Invalid revision number");
  return value;
}
export function checkedKey(value) {
  if (typeof value !== "string" || value.length < 8 || value.length > 200 ||
      !/^[a-zA-Z0-9_-]+$/.test(value)) throw badInput("Invalid Idempotency-Key");
  return value;
}
export function validateDraft(type, payload) {
  assertContentType(type);
  if (!payload || typeof payload !== "object" || Array.isArray(payload) ||
    Object.getPrototypeOf(payload) !== Object.prototype) throw badInput("Draft must be an object");
  const serialized = JSON.stringify(payload);
  if (!serialized || Buffer.byteLength(serialized, "utf8") > MAX_PAYLOAD_BYTES) {
    throw badInput("Draft payload exceeds 256 KiB");
  }
  if (own(payload, "title") && !optional(payload.title, 200)) throw badInput("Title exceeds 200 characters");
  if (own(payload, "slug") && payload.slug !== "" && !validSlug(payload.slug)) throw badInput("Invalid slug");
  if (own(payload, "summary") && !optional(payload.summary, 2000)) throw badInput("Summary exceeds 2000 characters");
  if (own(payload, "researchStatus") && !researchStages.has(payload.researchStatus)) throw badInput("Unrecognized research stage");
  for (const [key,max] of Object.entries(LIMITS)) {
    if(own(payload,key)&&!optional(payload[key],max))throw badInput("Invalid or overlong field: "+key);
  }
  if(own(payload,"url")&&payload.url&&!safeExternalUrl(payload.url))throw badInput("Unsafe external URL");
  if(own(payload,"repository")&&payload.repository&&!safeExternalUrl(payload.repository))throw badInput("Unsafe repository URL");
  return structuredClone(payload);
}
export function publicPathFor(type, slug) {
  assertContentType(type);
  if (!validSlug(slug)) throw badInput("Published content requires a canonical slug");
  const base = roots[type];
  if (!base) throw badInput("Unsupported public content type");
  if (["profile", "site_settings", "resume"].includes(type)) return base;
  // Non-singleton records need globally distinct paths. Secondary content remains
  // a listing member; storing an individual path does not guarantee a detail UI route.
  return base + "/" + slug;
}
function safeString(value, max) {
  return string(value, max) ? value.trim() : null;
}
export function projectPublicRevision(type, raw) {
  const payload = validateDraft(type, raw);
  const title = safeString(payload.title, 200);
  const summary = safeString(payload.summary, 2000);
  const slug = payload.slug;
  if (!title || !summary || !validSlug(slug)) throw badInput("Publication requires title, summary and slug");
  for (const field of REQUIRED[type]) {
    if(field==="researchStatus"){
      if(!researchStages.has(payload.researchStatus))throw badInput("Research status required");
    } else if(!string(payload[field],LIMITS[field]||4000)){
      throw badInput("Publication field required: "+field);
    }
  }
  if(type==="research"&&payload.researchStatus==="published"&&!safeExternalUrl(payload.evidenceUrl))
    throw badInput("Research published status requires verifiable HTTPS evidence");
  if(type==="resume")checkedUuid(payload.mediaAssetId);
  const extra = {};
  if (type === "research") {
    extra.researchStatus = payload.researchStatus;
    for (const key of ["researchQuestion","methods","results","limitations","evidenceUrl"]) {
      if (typeof payload[key] === "string" && payload[key].length <= 10000) extra[key] = payload[key];
    }
  }
  if (type === "project") {
    for (const key of ["role", "problem", "approach", "outcome", "limitations"]) {
      if (typeof payload[key] === "string" && payload[key].length <= 4000) extra[key] = payload[key];
    }
  }
  if (type === "article" && typeof payload.body === "string" && payload.body.length <= 32768) {
    extra.body = payload.body; // Must render as escaped TEXT, never unsanitized HTML.
  }
  const publicPath = publicPathFor(type, slug);
  const safe = Object.freeze({ contentType: type, slug, title, summary, ...extra });
  return Object.freeze({ publicPath, publicPayload: safe });
}
