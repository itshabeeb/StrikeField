import type { RiskResult } from "../lib/calculations";

export function FieldAdvisor({ result, height, ng, exposure }: { result: RiskResult; height: number; ng: number; exposure: string }) {
  const contributions = [
    { name: "Height", value: 45, detail: `${height} m structure expands the field` },
    { name: "Ng", value: 35, detail: `${ng} regional flashes / km² / year` },
    { name: "Exposure", value: 20, detail: `${exposure} surroundings shape prominence` },
  ];
  const baseScore = result.riskLevel === "High" ? 78 : result.riskLevel === "Moderate" ? 52 : 24;
  return <section className="advisor-module">
    <div><span className="micro-label">ENGINEERING ADVISOR</span><h2>Field advisor</h2><p>Your risk is primarily driven by the forces below.</p></div>
    <div className="advisor-content"><div className="contribution-list">{contributions.map((item) => <div className="contribution" key={item.name}><div><b>{item.name}</b><small>{item.detail}</small></div><strong>{item.value}%</strong><i><span style={{ width: `${item.value}%` }} /></i></div>)}</div><div className="advisor-actions"><span className="micro-label">SUGGESTED ACTIONS</span>{["Improve grounding and bonding", "Install coordinated surge protection", "Evaluate a lightning protection system", "Complete professional IEC 62305 assessment"].map((action) => <div className="action-row" key={action}><span>✓</span>{action}</div>)}<div className="what-if"><b>SIMULATE IMPROVEMENTS</b><span>Current score <strong>{baseScore}</strong></span><span>With SPD <strong>{Math.max(8, baseScore - 16)}</strong></span><span>With LPS review <strong>{Math.max(5, baseScore - 49)}</strong></span></div></div></div>
  </section>;
}
