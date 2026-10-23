import { useLoaderData } from "react-router";
import { PublicShell } from "../components/public-shell.jsx";
import { getPublicSection } from "../features/public-pages/sections.js";

export function loader({ params }) {
  const section = getPublicSection(params.section);
  if (!section) throw new Response("Not found", { status: 404 });
  return { section };
}

export function meta({ data }) {
  return [
    { title: data ? `${data.section.title} — DEVFOLIO OS` : "Not found — DEVFOLIO OS" },
    { name: "description", content: data?.section.description ?? "Page not found." },
    { name: "robots", content: "noindex, nofollow" },
  ];
}

export default function Section() {
  const { section } = useLoaderData();
  return (
    <PublicShell>
      <section className="section-content" aria-labelledby="section-heading">
        <p className="eyebrow">DEVFOLIO OS / {section.label.toUpperCase()}</p>
        <h1 id="section-heading">{section.title}</h1>
        <p className="lede">{section.description}</p>
        <div className="empty-notice" role="status">
          <strong>No published content available.</strong>
          <p>Only reviewed public records may appear here. The editor and publishing workflow are not enabled.</p>
        </div>
      </section>
    </PublicShell>
  );
}
