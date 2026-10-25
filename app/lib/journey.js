// Chronological ordering for mixed work/education records. Use only recorded dates;
// unknown periods remain in owner-entered order rather than inventing dates.
export function yearFromPeriod(period) {
  const match = typeof period === "string" ? period.match(/\b(?:19|20)\d{2}\b/) : null;
  return match ? Number(match[0]) : null;
}
export function chronologicalJourney(experience = [], education = []) {
  const items = [
    ...education.map((entry) => ({ ...entry, kind: "education" })),
    ...experience.map((entry) => ({ ...entry, kind: "experience" })),
  ];
  return items
    .map((item, index) => ({ ...item, originalIndex: index, startYear: yearFromPeriod(item.period) }))
    .sort((a,b) => (a.startYear ?? Infinity) - (b.startYear ?? Infinity) || a.originalIndex - b.originalIndex);
}
