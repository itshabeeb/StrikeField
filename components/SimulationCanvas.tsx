"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import type { Exposure, RiskResult } from "../lib/calculations";

type Props = { height: number; exposure: Exposure; collectionRadius: number; collectionArea: number; ng: number; riskLevel: RiskResult["riskLevel"]; simulating: boolean };

export function SimulationCanvas({ height, exposure, collectionRadius, collectionArea, ng, riskLevel, simulating }: Props) {
  const [flash, setFlash] = useState(false);
  useEffect(() => {
    const timer = window.setInterval(() => setFlash(true), simulating ? 1800 : 5200);
    const reset = window.setInterval(() => setFlash(false), 260);
    return () => { window.clearInterval(timer); window.clearInterval(reset); };
  }, [simulating]);
  const poleTop = 340 - height * 4.7;
  const zoneRadius = Math.min(290, 95 + collectionRadius * 2.4);
  const terrain = exposure === "hilltop" ? "M 0 430 Q 300 290 650 350 Q 950 230 1200 325 L 1200 500 L 0 500 Z" : "M 0 430 Q 300 405 600 430 Q 900 410 1200 430 L 1200 500 L 0 500 Z";
  const buildings = exposure === "sheltered" ? [170, 210, 145, 245, 180] : exposure === "similar" ? [135, 155, 125, 150] : [];
  const particleCount = Math.max(5, Math.min(18, Math.round(ng)));

  return <div className={`simulation-canvas ${simulating ? "is-simulating" : ""}`} role="img" aria-label={`Live digital twin showing a ${height} metre structure, ${ng} ground flashes per square kilometre per year, and ${riskLevel} risk`}>
    <div className="scanlines" /><div className="radar-sweep" />
    <div className="canvas-coordinates"><span>ALT 000.00 / 050.00 m</span><span>LIVE / T+{simulating ? "1000Y" : "00:00:00"}</span></div>
    <svg viewBox="0 0 1200 500" preserveAspectRatio="xMidYMid slice">
      <defs><radialGradient id="fieldGlow"><stop offset="0%" stopColor="#38bdf8" stopOpacity=".22" /><stop offset="68%" stopColor="#38bdf8" stopOpacity=".06" /><stop offset="100%" stopColor="#38bdf8" stopOpacity="0" /></radialGradient><linearGradient id="sky" x2="0" y2="1"><stop stopColor="#07172c" /><stop offset="1" stopColor="#123557" /></linearGradient></defs>
      <rect width="1200" height="500" fill="url(#sky)" />
      <g className="grid-lines"><path d="M0 390 H1200 M0 320 H1200 M0 250 H1200 M0 180 H1200 M120 0 V500 M240 0 V500 M360 0 V500 M480 0 V500 M600 0 V500 M720 0 V500 M840 0 V500 M960 0 V500 M1080 0 V500" /></g>
      <g className="stars">{Array.from({ length: particleCount }).map((_, index) => <motion.circle key={index} cx={100 + ((index * 137) % 1000)} cy={105 + ((index * 47) % 190)} r={index % 3 === 0 ? 2 : 1} animate={{ opacity: [0.2, 0.9, 0.2] }} transition={{ duration: 2 + index % 4, repeat: Infinity }} />)}</g>
      <motion.g className="cloud-bank" animate={{ x: simulating ? [-20, 20, -20] : [-5, 5, -5] }} transition={{ duration: simulating ? 8 : 20, repeat: Infinity }}><ellipse cx="200" cy="120" rx="125" ry="38" /><ellipse cx="360" cy="105" rx="170" ry="48" /><ellipse cx="520" cy="132" rx="120" ry="35" /><ellipse cx="880" cy="150" rx="190" ry="42" /><ellipse cx="1050" cy="130" rx="145" ry="36" /></motion.g>
      <motion.ellipse cx="600" cy="395" rx={zoneRadius} ry="84" fill="url(#fieldGlow)" animate={{ rx: zoneRadius, opacity: [0.75, 1, 0.75] }} transition={{ duration: 3, repeat: Infinity }} />
      <motion.ellipse cx="600" cy="395" rx={zoneRadius} ry="84" className="zone-outline" animate={{ rx: zoneRadius }} transition={{ duration: .45 }} />
      <path d={terrain} className="terrain" />
      {buildings.map((building, index) => <motion.rect key={index} x={100 + index * 190} y={390 - building / 4} width="90" height={building / 4} className="building" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .45, delay: index * .06 }} />)}
      <motion.line x1="600" y1="395" x2="600" y2={poleTop} className="structure-line" animate={{ y2: poleTop }} transition={{ duration: .4 }} />
      <circle cx="600" cy={poleTop} r="8" className="structure-beacon" />
      <motion.line x1="630" y1="395" x2="630" y2={poleTop} className="measure-line" animate={{ y2: poleTop }} transition={{ duration: .4 }} />
      <text x="646" y={(395 + poleTop) / 2} className="measure-label">{height} m</text>
      <text x="600" y="475" textAnchor="middle" className="ground-label">COLLECTION FIELD / {collectionArea.toLocaleString()} M²</text>
      {flash && <motion.path d={`M ${600 + (Math.random() * 260 - 130)} 30 L ${600 + (Math.random() * 180 - 90)} 150 L 600 ${poleTop}`} className="lightning-bolt" initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0] }} transition={{ duration: .4 }} />}
    </svg>
    <div className="canvas-callout callout-height"><span>STRUCTURE</span><b>{height} m</b></div><div className="canvas-callout callout-ng"><span>CHARGE DENSITY</span><b>Ng {ng}</b></div><div className="canvas-callout callout-area"><span>FIELD RADIUS</span><b>{collectionRadius.toFixed(1)} m</b></div>
  </div>;
}
