import { redirect } from "react-router";

// Preserve older external portfolio links while the single-page portfolio owns these sections.
export function loader({ request }) {
  const pathname = new URL(request.url).pathname;
  const section = pathname === "/contact" ? "contact" : "work";
  throw redirect("/#" + section, 302);
}

export default function LegacyRedirect() { return null; }
