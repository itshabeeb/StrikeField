"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { simulatePoissonYears } from "../lib/calculations";

export function SimulationTimeline({ expectedPerYear }: { expectedPerYear: number }) {
  const [running, setRunning] = useState(false);
  const [year, setYear] = useState(0);
  const [events, setEvents] = useState<number[]>([]);
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setYear((value) => value >= 100 ? 100 : value + 1), 35);
    return () => window.clearInterval(timer);
  }, [running]);
  const observed = events.slice(0, year).reduce((total, count) => total + count, 0);
  const strikeYears = events.flatMap((count, index) => count > 0 ? [index + 1] : []);
  const probability = 1 - Math.exp(-expectedPerYear * year);
  const startSimulation = () => {
    setEvents(simulatePoissonYears(expectedPerYear, 100));
    setYear(0);
    setRunning(true);
  };
  return <section className="timeline-module">
    <div className="simulation-command"><div><span className="micro-label">PROBABILITY TRANSLATOR</span><h2>100 year timeline simulator</h2><p>Each year is sampled from a Poisson process using the calculated annual strike rate.</p></div><button className="simulate-button running" onClick={startSimulation}>{running && year < 100 ? "TIMELINE RUNNING" : "RUN 100 YEAR SIMULATION"}</button></div>
    <div className="timeline-track"><motion.div className="timeline-progress" animate={{ width: `${year}%` }} />{strikeYears.map((strikeYear) => <span className="year-marker" key={strikeYear} style={{ left: `${strikeYear}%` }}><span>⚡</span></span>)}</div>
    <div className="timeline-labels"><span>YEAR 01</span><span>YEAR {year || "00"}</span><span>YEAR 100</span></div>
    <div className="timeline-results"><div><b>{year}</b><span>simulated years</span></div><div><b>{observed}</b><span>observed strikes</span></div><div><b>{(expectedPerYear * year).toFixed(2)}</b><span>expected by year {year}</span></div><div><b>{(probability * 100).toFixed(1)}%</b><span>chance of ≥1 strike</span></div></div>
    <p className="simulation-note">This run is one random outcome. Over many runs, the average approaches the calculated rate. The chance of at least one strike is <code>1 − e<sup>−λT</sup></code>, where λ is the annual rate and T is elapsed years.</p>
  </section>;
}
