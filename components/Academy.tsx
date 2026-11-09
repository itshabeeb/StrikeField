import { ExplainToggle } from "./ExplainToggle";

const lessons = [
  ["Ng", "How often lightning happens in the region.", "Ng = flashes per square kilometre per year. A higher Ng means the local air-ground system sees more lightning events."],
  ["Collection area", "The invisible catchment around the structure.", "The model treats a larger collection area as more opportunity for a direct strike to attach. Height expands this area."],
  ["Strike frequency", "The long-term average, not a promise.", "A result of 0.01 strikes per year means roughly one event per 100 years on average. It does not predict which year a strike will happen."],
  ["Exposure", "How much the site stands out.", "Open ground and hilltops make a structure more prominent. Nearby taller objects can reduce its relative exposure."],
  ["Rolling sphere", "A simple way to find possible attachment points.", "Imagine rolling an invisible sphere across the structure and surroundings. Points the sphere touches are exposed to a possible lightning connection."],
  ["Why height matters", "Height increases the reach of the collection field.", "In this screening model, collection radius is three times structure height. Doubling height therefore increases the circular area substantially."],
];

export function Academy() {
  return <section className="academy-page">
    <div className="platform-heading"><span className="micro-label">05 / LIGHTNING ACADEMY</span><h2>Understand the field in under 30 seconds.</h2><p>Short visual lessons for the engineering ideas behind the digital twin.</p></div>
    <div className="academy-grid">{lessons.map(([term, summary, detail], index) => <article className="lesson" key={term}><div className="lesson-visual">{index === 0 ? "⚡⚡⚡" : index === 1 ? "◎" : index === 2 ? "↗" : index === 3 ? "⌁" : index === 4 ? "◯" : "↕"}</div><span className="micro-label">LESSON {String(index + 1).padStart(2, "0")}</span><h3>{term}</h3><p>{summary}</p><ExplainToggle title={term}><p>{detail}</p></ExplainToggle></article>)}</div>
  </section>;
}
