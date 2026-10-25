import { chronologicalJourney } from "../lib/journey.js";

function JourneyIcon({ kind }) {
  return kind === "education" ?
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
      <path d="m2 9 10-5 10 5-10 5L2 9Z"/><path d="M6 11.3v6c3.6 3.1 8.4 3.1 12 0v-6"/><path d="M22 9v7"/>
    </svg> :
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13c5 3 13 3 18 0M12 12v4"/>
    </svg>;
}

export function JourneyTimeline({ experience = [], education = [] }) {
  const journey = chronologicalJourney(experience, education);
  if (!journey.length) return null;
  return <section id="journey" className="exp-section exp-journey journey-v2" aria-labelledby="journey-heading">
    <div className="exp-contained">
      <header className="journey-intro">
        <p className="exp-section-index"><span>04</span> MY JOURNEY</p>
        <h2 id="journey-heading">Experience that<br/><em>shapes the work.</em></h2>
        <p>My professional work and education, from the beginning to the present. Every milestone is drawn from my published portfolio.</p>
      </header>
      <ol className="journey-stream" aria-label="Education and work in chronological order">
        {journey.map((entry, index) => {
          const title = entry.kind === "education" ? entry.degree : entry.role;
          const place = entry.kind === "education" ? entry.school : entry.company;
          const type = entry.kind === "education" ? "Education" : "Work experience";
          return <li className={"journey-entry journey-entry-" + (index % 2 ? "left" : "right")} key={entry.kind + "-" + entry.id}>
            <div className="journey-node"><JourneyIcon kind={entry.kind}/></div>
            <div className="journey-date">{entry.period || type}</div>
            <article className="journey-card">
              <div className="journey-card-top"><span className="journey-kind">{type}</span>{entry.period && <time>{entry.period}</time>}</div>
              <div className="journey-card-main">
                <div className="journey-card-icon"><JourneyIcon kind={entry.kind}/></div>
                <div><h3>{title}</h3>{place && <strong>{place}</strong>}
                  {entry.description && <p>{entry.description}</p>}
                </div>
              </div>
            </article>
          </li>;
        })}
      </ol>
    </div>
  </section>;
}
