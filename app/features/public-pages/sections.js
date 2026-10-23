// Navigation identifiers approved in Phase 02. Content remains unpublished until owner acceptance.
const definitions = [
  { slug: "work", label: "Work", title: "Selected work", description: "Engineering case studies and validated software projects will appear here when approved for publication." },
  { slug: "research", label: "Research", title: "Research", description: "Research and publications require truthful status labels and explicit approved snapshots before display." },
  { slug: "about", label: "About", title: "About", description: "An evidence-based introduction, career background and professional profile will be published after content review." },
  { slug: "contact", label: "Contact", title: "Contact", description: "Secure contact submission requires approved privacy text, rate limits and message retention before activation." },
  { slug: "experience", label: "Experience", title: "Professional experience", description: "Verified responsibilities and employment history will be displayed here." },
  { slug: "education", label: "Education", title: "Education", description: "Verified education and training will appear when published." },
  { slug: "skills", label: "Skills", title: "Skills and tools", description: "Demonstrated professional capabilities will be organized by category." },
  { slug: "achievements", label: "Achievements", title: "Achievements", description: "Only factual, verified achievements and supporting evidence will appear here." },
];
export const publicSections = Object.freeze(definitions.map((entry) => Object.freeze({ ...entry })));
export const primaryNavigation = Object.freeze(publicSections.filter((section) => ["work", "research", "about", "contact"].includes(section.slug)));
export const secondaryNavigation = Object.freeze(publicSections.filter((section) => ["experience", "education", "skills", "achievements"].includes(section.slug)));

export function getPublicSection(slug) {
  return publicSections.find((section) => section.slug === slug) ?? null;
}
