import { useState } from "react";
import { useLoaderData } from "react-router";
import { PublicShell } from "../components/public-shell.jsx";
import { contrastRatio, wcagContrastLevel } from "../lib/contrast.js";
import { getStudioContent } from "../../server/studio/index.js";

export async function loader() {
  const { content } = await getStudioContent();
  return Response.json({ name: content.name, accent: content.accent, projects: content.projects },
    { headers: { "Cache-Control": "no-store" } });
}

export function meta() {
  return [
    { title: "Creative Lab — DEVFOLIO OS" },
    { name: "description", content: "Interactive explorations of contrast, typography and motion." },
  ];
}

const EASINGS = [
  { id: "ease", label: "Standard ease", curve: "ease" },
  { id: "out", label: "Responsive ease-out", curve: "cubic-bezier(.2,.8,.2,1)" },
  { id: "spring", label: "Spring-like overshoot", curve: "cubic-bezier(.2,1.45,.38,1)" },
  { id: "linear", label: "Linear", curve: "linear" },
];

function ContrastExperiment() {
  const [foreground, setForeground] = useState("#F5F2EB");
  const [background, setBackground] = useState("#0C1420");
  const ratio = contrastRatio(foreground, background);
  const result = wcagContrastLevel(ratio);
  return <section className="sig-lab-card" aria-labelledby="sig-contrast-heading">
    <p className="sig-eyebrow">EXPERIMENT 001 / COLOR SYSTEMS</p>
    <h2 id="sig-contrast-heading">Contrast, measured.</h2>
    <p>Explore color pairs and test actual WCAG text-contrast thresholds. Great design begins with readability.</p>
    <div className="sig-lab-color-controls">
      <label>Text color <input type="color" aria-label="Text color" value={foreground} onChange={(e) => setForeground(e.target.value)}/><code>{foreground.toUpperCase()}</code></label>
      <label>Background <input type="color" aria-label="Background color" value={background} onChange={(e) => setBackground(e.target.value)}/><code>{background.toUpperCase()}</code></label>
    </div>
    <div className="sig-contrast-preview" style={{ color: foreground, backgroundColor: background }}>
      <strong>Design with intention.</strong>
      <span>Excellent typography deserves excellent contrast.</span>
    </div>
    <div className="sig-lab-results" role="status" aria-live="polite" aria-atomic="true">
      <strong>{ratio.toFixed(2)}:1 <small>contrast ratio</small></strong>
      <span>{result.normalAA ? "Pass" : "Fail"} / Normal text AA (4.5:1)</span>
      <span>{result.largeAA ? "Pass" : "Fail"} / Large text AA (3:1)</span>
      <span>{result.normalAAA ? "Pass" : "Fail"} / Normal text AAA (7:1)</span>
    </div>
    <p className="sig-lab-footnote">The ratio evaluates text colors; accessibility also depends on font, context, semantics and interaction.</p>
  </section>;
}

function MotionExperiment() {
  const [easing, setEasing] = useState("out");
  const [forward, setForward] = useState(false);
  const current = EASINGS.find((item) => item.id === easing) || EASINGS[1];
  return <section className="sig-lab-card" aria-labelledby="sig-motion-heading">
    <p className="sig-eyebrow">EXPERIMENT 002 / INTERACTION</p>
    <h2 id="sig-motion-heading">Motion with purpose.</h2>
    <p>Compare timing curves. The same movement can feel precise, playful, immediate, or mechanical.</p>
    <label className="sig-lab-select">Motion character
      <select value={easing} onChange={(e) => setEasing(e.target.value)}>
        {EASINGS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
      </select>
    </label>
    <div className="sig-motion-track" aria-label="Motion demonstration track">
      <span className="sig-motion-puck" style={{ left: forward ? "calc(100% - 60px)" : "0", transitionTimingFunction: current.curve }}/>
    </div>
    <div className="sig-lab-action">
      <button type="button" onClick={() => setForward((before) => !before)}>
        {forward ? "Return to start" : "Play motion"} <span aria-hidden="true">↗</span>
      </button>
      <span role="status">{forward ? "Position: end" : "Position: start"}</span>
    </div>
    <p className="sig-lab-footnote">Reduced-motion settings remove the transition and preserve all controls.</p>
  </section>;
}

function TypeExperiment() {
  const [size, setSize] = useState(58);
  return <section className="sig-lab-card sig-lab-type" aria-labelledby="sig-type-heading">
    <p className="sig-eyebrow">EXPERIMENT 003 / EDITORIAL SYSTEMS</p>
    <h2 id="sig-type-heading">Type shapes feeling.</h2>
    <p>Explore how headline scale changes visual hierarchy without changing its meaning.</p>
    <label className="sig-lab-slider">Headline size: <strong>{size}px</strong>
      <input type="range" min="30" max="90" step="2" value={size} onChange={(e) => setSize(Number(e.target.value))}/>
    </label>
    <div className="sig-type-preview" style={{ fontSize: size + "px" }}>Build things that matter.</div>
    <p className="sig-lab-footnote">Real portfolio headlines use responsive type rules rather than a fixed value.</p>
  </section>;
}

export default function CreativeLab() {
  const { name, accent, projects } = useLoaderData();
  return <PublicShell name={name} accent={accent} projects={projects}>
    <div className="sig-lab-page">
      <header className="sig-lab-hero">
        <div className="exp-contained">
          <p className="sig-eyebrow">DEVFOLIO OS / INTERACTIVE PLAYGROUND</p>
          <h1>Curiosity is a <em>feature.</em></h1>
          <p>Small, working experiments about the details behind great digital experiences. Change a value. Notice the difference.</p>
        </div>
      </header>
      <div className="exp-contained sig-lab-grid">
        <ContrastExperiment/>
        <MotionExperiment/>
        <TypeExperiment/>
      </div>
    </div>
  </PublicShell>;
}