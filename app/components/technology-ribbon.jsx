import { useState } from "react";

// Lightweight local vector marks: no icon CDN, external tracking or extra JS package.
// Unknown skills get a neutral code glyph, never another company's fake logo.
function Mark({ skill }) {
  const label = skill.toLowerCase().replace(/[^a-z0-9+#]/g, "");
  if (label.includes("react")) return <g fill="none" stroke="currentColor" strokeWidth="1.9"><ellipse cx="24" cy="24" rx="20" ry="8"/><ellipse cx="24" cy="24" rx="20" ry="8" transform="rotate(60 24 24)"/><ellipse cx="24" cy="24" rx="20" ry="8" transform="rotate(-60 24 24)"/><circle cx="24" cy="24" r="4" fill="currentColor" stroke="none"/></g>;
  if (label.includes("python")) return <><path d="M24 4c-10 0-11 4-11 10v6h12v4H9c-5 0-7 4-7 9 0 7 4 12 11 12h5v-7c0-6 4-10 10-10h8c5 0 8-3 8-9v-6c0-6-4-9-11-9H24Z" fill="currentColor" opacity=".96"/><path d="M24 44c10 0 11-4 11-10v-6H23v-4h16c5 0 7-4 7-9 0-7-4-12-11-12h-5v7c0 6-4 10-10 10h-8c-5 0-8 3-8 9v6c0 6 4 9 11 9h9Z" fill="currentColor" opacity=".56"/><circle cx="18" cy="11" r="2" fill="#5838ba"/><circle cx="30" cy="37" r="2" fill="#5838ba"/></>;
  if (label === "js" || label.includes("javascript")) return <><rect x="4" y="4" width="40" height="40" rx="5" fill="currentColor"/><text x="24" y="34" textAnchor="middle" fill="#5631b2" fontSize="21" fontFamily="Arial,sans-serif" fontWeight="900">JS</text></>;
  if (label === "ts" || label.includes("typescript")) return <><rect x="4" y="4" width="40" height="40" rx="5" fill="currentColor"/><text x="24" y="34" textAnchor="middle" fill="#5631b2" fontSize="21" fontFamily="Arial,sans-serif" fontWeight="900">TS</text></>;
  if (label.includes("node")) return <><path d="m24 3 19 11v21L24 46 5 35V14L24 3Z" fill="none" stroke="currentColor" strokeWidth="3"/><text x="24" y="31" textAnchor="middle" fill="currentColor" fontWeight="900" fontSize="16" fontFamily="Arial,sans-serif">JS</text></>;
  if (label.includes("express")) return <><path d="M5 12h38M5 24h26M5 36h38" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/><path d="m32 16 11 16m0-16L32 32" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round"/></>;
  if (label === "html" || label.includes("html5")) return <><path d="M5 4h38l-4 35-15 5-15-5L5 4Z" fill="none" stroke="currentColor" strokeWidth="3"/><text x="24" y="32" fill="currentColor" fontWeight="900" fontSize="25" textAnchor="middle" fontFamily="Arial,sans-serif">5</text></>;
  if (label === "css" || label.includes("css3")) return <><path d="M5 4h38l-4 35-15 5-15-5L5 4Z" fill="none" stroke="currentColor" strokeWidth="3"/><text x="24" y="32" fill="currentColor" fontWeight="900" fontSize="25" textAnchor="middle" fontFamily="Arial,sans-serif">3</text></>;
  if (label.includes("github")) return <><path fill="currentColor" d="M24 4a20 20 0 0 0-6.32 38.98c1 .19 1.36-.43 1.36-.96v-3.7c-5.55 1.21-6.72-2.35-6.72-2.35-.91-2.3-2.23-2.91-2.23-2.91-1.82-1.25.14-1.22.14-1.22 2.01.14 3.07 2.06 3.07 2.06 1.79 3.06 4.69 2.18 5.83 1.67.18-1.3.7-2.18 1.27-2.68-4.44-.5-9.1-2.22-9.1-9.88 0-2.18.78-3.97 2.06-5.37-.21-.51-.9-2.54.2-5.29 0 0 1.68-.54 5.5 2.05a19.1 19.1 0 0 1 10.02 0c3.82-2.59 5.49-2.05 5.49-2.05 1.11 2.75.42 4.78.21 5.29a7.72 7.72 0 0 1 2.05 5.37c0 7.68-4.66 9.37-9.12 9.87.71.62 1.34 1.84 1.34 3.7v5.5c0 .54.36 1.16 1.37.96A20 20 0 0 0 24 4Z"/></>;
  if (label === "git" || label.includes("gitversion")) return <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="m24 3 21 21-21 21L3 24 24 3Z"/><path d="M14 14 32 32M20 20v14M20 34h12"/><circle cx="14" cy="14" r="2" fill="currentColor"/><circle cx="20" cy="34" r="2" fill="currentColor"/><circle cx="32" cy="32" r="2" fill="currentColor"/></g>;
  if (label.includes("mongo")) return <><path d="M24 3c-9 12-14 21-12 30 1 7 5 11 12 12 7-1 11-5 12-12 2-9-3-18-12-30Z" fill="currentColor"/><path d="M24 18v27" stroke="#5631b2" strokeWidth="2"/></>;
  if (label.includes("postgres") || label.includes("sql")) return <g fill="none" stroke="currentColor" strokeWidth="2.8"><ellipse cx="24" cy="12" rx="16" ry="7"/><path d="M8 12v24c0 9 32 9 32 0V12M8 24c0 9 32 9 32 0"/></g>;
  if (label.includes("docker")) return <><g fill="currentColor"><rect x="7" y="12" width="8" height="8" rx="1"/><rect x="17" y="12" width="8" height="8" rx="1"/><rect x="27" y="12" width="8" height="8" rx="1"/><rect x="17" y="3" width="8" height="8" rx="1"/><rect x="27" y="3" width="8" height="8" rx="1"/><rect x="37" y="12" width="7" height="8" rx="1"/></g><path d="M3 24h42c-3 13-15 18-28 16C9 39 5 34 3 24Z" fill="currentColor"/></>;
  if (label.includes("figma")) return <><rect x="14" y="4" width="10" height="14" rx="5" fill="currentColor"/><rect x="24" y="4" width="10" height="14" rx="5" fill="currentColor" opacity=".75"/><rect x="14" y="18" width="10" height="14" rx="5" fill="currentColor" opacity=".75"/><circle cx="29" cy="23" r="5" fill="currentColor"/><rect x="14" y="30" width="10" height="14" rx="5" fill="currentColor"/></>;
  if (label.includes("vscode") || label.includes("visualstudio")) return <><path d="M32 5 43 10v28l-11 5L16 29l-9 7-5-5 12-12L2 16l5-5 9 8L32 5Zm0 11L20 24l12 8V16Z" fill="currentColor"/></>;
  if (label.includes("next")) return <><circle cx="24" cy="24" r="20" stroke="currentColor" fill="none" strokeWidth="2.5"/><path d="M14 34V14l20 22V14" fill="none" stroke="currentColor" strokeWidth="3"/></>;
  return <><path d="m17 13-10 11 10 11m14-22 10 11-10 11M28 9l-8 30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/></>;
}

export function TechnologyRibbon({ skills = [] }) {
  const [paused, setPaused] = useState(false);
  // Render only actual owner-published skills, preserving their order. No fabricated technology list.
  if (!skills.length) return null;
  return <section className="folio-logo-band" aria-label="Published professional technologies and tools">
    <div className="folio-logo-track" data-paused={paused ? "true" : "false"}>
      {[0,1].map((repeat) => <div key={repeat} className="folio-logo-group" aria-hidden={repeat === 1 ? "true" : undefined}>
        {skills.map((skill,index) => <div className="folio-logo-cell" key={index} title={skill}>
          <svg viewBox="0 0 48 48" role={repeat === 0 ? "img" : undefined}
            aria-label={repeat === 0 ? skill : undefined} aria-hidden={repeat === 1 ? "true" : undefined} focusable="false">
            <Mark skill={skill}/>
          </svg>
          <span className="exp-sr-only">{repeat === 0 ? skill : ""}</span>
        </div>)}
      </div>)}
    </div>
    <button type="button" className="folio-logo-pause" aria-label={paused ? "Resume technology animation" : "Pause technology animation"}
      onClick={() => setPaused((value) => !value)}>{paused ? "▶" : "Ⅱ"}</button>
  </section>;
}
