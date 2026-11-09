"use client";

import { motion } from "framer-motion";
import type { Exposure } from "../lib/calculations";

const exposureCopy: Record<Exposure, string> = {
  sheltered: "Nearby structures and trees reduce the pole’s dominance as a strike point.",
  similar: "Surroundings are comparable in height, producing intermediate exposure.",
  open: "Open terrain increases exposure because the pole becomes a dominant strike point.",
  hilltop: "Elevated ground increases exposure by placing the pole above its surroundings.",
};

export function EngineeringScene({ height, exposure, area }: { height: number; exposure: Exposure; area: number }) {
  const terrain = exposure === "hilltop" ? "M 10 250 Q 160 185 310 120 L 310 280 L 10 280 Z" : "M 10 250 L 310 250 L 310 280 L 10 280 Z";
  const buildings = exposure === "sheltered" ? [38, 58, 46, 70] : exposure === "similar" ? [35, 44, 38] : [];
  const poleTop = 238 - height * 3.2;

  return (
    <div className="scene-wrap">
      <svg viewBox="0 0 320 290" role="img" aria-label={`Animated ${height} metre structure and collection zone`}>
        <defs>
          <radialGradient id="zone" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity=".24" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity=".03" />
          </radialGradient>
        </defs>
        <motion.path d={terrain} fill="#dbeafe" initial={false} animate={{ d: terrain }} transition={{ duration: 0.4 }} />
        <motion.ellipse cx="160" cy="250" rx={Math.min(135, 32 + area / 90)} ry="23" fill="url(#zone)" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.55 }} />
        {buildings.map((buildingHeight, index) => (
          <motion.rect key={index} x={24 + index * 75} y={250 - buildingHeight} width="42" height={buildingHeight} rx="3" fill="#9fb4ca" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} />
        ))}
        <motion.line x1="160" y1="250" x2="160" y2={poleTop} stroke="#10233f" strokeWidth="8" initial={{ y2: 238 }} animate={{ y2: poleTop }} transition={{ duration: 0.4 }} />
        <circle cx="160" cy={poleTop} r="6" fill="#f97316" />
        <motion.line x1="188" y1="250" x2="188" y2={poleTop} stroke="#0ea5e9" strokeWidth="1.5" strokeDasharray="4 4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
        <motion.text x="198" y={(250 + poleTop) / 2} fill="#075985" fontSize="13" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{height} m</motion.text>
        <text x="160" y="276" textAnchor="middle" fill="#52657d" fontSize="11">animated collection zone · {area.toLocaleString()} m²</text>
      </svg>
      <p className="scene-caption">{exposureCopy[exposure]}</p>
    </div>
  );
}
