import { redirect } from "react-router";

// Keep old bookmarked public URLs working without carrying the retired CMS routes.
export function loader({ request }) {
  const pathname = new URL(request.url).pathname;
  if (pathname === "/projects" || pathname.startsWith("/projects/") || pathname === "/work") {
    throw redirect("/#work", 302);
  }
  if (pathname === "/contact") {
    throw redirect("/#contact", 302);
  }
  throw new Response("Not Found", { status: 404 });
}

export default function NotFound() { return null; }
