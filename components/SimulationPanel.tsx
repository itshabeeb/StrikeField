"use client";

import { useState } from "react";
import { motion } from "framer-motion";

export function SimulationPanel({ expectedPerYear }: { expectedPerYear: number }) {
  const [running, setRunning] = useState(false);
  const observed = Math.round(expectedPerYear * 1000);
  return <section className="card simulation"><div className="section-heading"><span className="eyebrow">Probability intuition</span><h2>Lightning strike simulation</h2></div><p className="muted">A visual Poisson-style illustration of the annual estimate. It is educational, not a forecast.</p><div className="timeline"><motion.div className="timeline-fill" animate={{ width: running ? "100%" : "8%" }} transition={{ duration: 2 }} /></div><div className="simulation-stats"><div><b>{running ? 1000 : 0}</b><span>Simulated years</span></div><div><b>{running ? observed : 0}</b><span>Observed strikes</span></div><div><b>{expectedPerYear.toFixed(4)}</b><span>Average / year</span></div></div><button className="button primary" onClick={() => { setRunning(false); window.setTimeout(() => setRunning(true), 40); }}>{running ? "Replay 1000-year simulation" : "Run 1000-year simulation"}</button></section>;
}
