import { redirect } from "react-router";
export function loader() { return redirect("/projects",308); }
export function meta() { return [{name:"robots",content:"noindex"}]; }
export default function LegacyWork(){return null;}
