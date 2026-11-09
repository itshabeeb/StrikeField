"use client";

import { motion } from "framer-motion";

export function RiskExplanation({ height, ng, exposure, risk }: { height: number; ng: number; exposure: string; risk: string }) {
  const factors = [`Pole height · ${height} m`, `Regional density · Ng ${ng}`, `${exposure} surroundings`];
  return <section className="card"><div className="section-heading"><span className="eyebrow">Traceable reasoning</span><h2>Why was this risk calculated?</h2></div><div className="factor-list">{factors.map((factor, index) => <motion.div key={factor} className="factor" initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.12 }}><span>{index + 1}</span><b>{factor}</b><em>↑ increases exposure</em></motion.div>)}<div className="combined">Combined effect <strong>→ {risk}</strong></div></div></section>;
}
