"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function SimulationTimeline({ expectedPerYear }: { expectedPerYear: number }) {
  const [running, setRunning] = useState(false);
  const [year, setYear] = useState(0);
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setYear((value) => value >= 100 ? 100 : value + 1), 35);
    return () => window.clearInterval(timer);
  }, [running]);
  const observed = Math.round(expectedPerYear * year);
  const strikeYear = expectedPerYear > 0 ? Math.max(1, Math.round(1 / expectedPerYear)) : 0;
  return <section className="timeline-module">
    <div className="simulation-command"><div><span className="micro-label">PROBABILITY TRANSLATOR</span><h2>100 year timeline simulator</h2><p>Watch a rare annual event become intuitive over accelerated time.</p></div><button className="simulate-button running" onClick={() => { setYear(0); setRunning(true); }}>{running && year < 100 ? "TIMELINE RUNNING" : "RUN 100 YEAR SIMULATION"}</button></div>
    <div className="timeline-track"><motion.div className="timeline-progress" animate={{ width: `${year}%` }} /><div className="year-marker" style={{ left: `${Math.min(100, strikeYear)}%` }}><span>⚡</span></div></div>
    <div className="timeline-labels"><span>YEAR 01</span><span>YEAR {year || "00"}</span><span>YEAR 100</span></div>
    <div className="timeline-results"><div><b>{year}</b><span>simulated years</span></div><div><b>{observed}</b><span>observed strikes</span></div><div><b>{expectedPerYear.toFixed(4)}</b><span>expected / year</span></div><div><b>{expectedPerYear ? Math.round(1 / expectedPerYear) : "—"}</b><span>average interval</span></div></div>
  </section>;
}
