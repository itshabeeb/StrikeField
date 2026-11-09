"use client";

import { motion } from "framer-motion";
import type { CSSProperties } from "react";

export function StormPotential({ label, score, explanation }: { label: string; score: number; explanation: string }) {
  return (
    <section className="card storm-card">
      <div className="storm-clouds" aria-hidden="true"><motion.span animate={{ x: [0, 20, 0] }} transition={{ duration: 8, repeat: Infinity }} /> <motion.span animate={{ x: [0, -16, 0] }} transition={{ duration: 10, repeat: Infinity }} /></div>
      <div className="section-heading"><span className="eyebrow">Atmospheric context</span><h2>Atmospheric Storm Potential</h2></div>
      <div className="storm-content">
        <div className="gauge" style={{ "--score": `${score}%` } as CSSProperties}><strong>{label}</strong><span>climatological screen</span></div>
        <div><p>{explanation}</p><p className="muted">This is not a real-time weather forecast and does not change the lightning strike calculation.</p></div>
      </div>
    </section>
  );
}
