import type { RiskResult } from "../lib/calculations";

export function RiskAdvice({ result, stormLabel }: { result: RiskResult; stormLabel: string }) {
  const highRisk = result.riskLevel === "High";
  const stormAdvice = stormLabel === "High"
    ? "A high broad atmospheric potential suggests more opportunities for thunderstorms in suitable weather. It does not predict a storm at this site or change Nd."
    : stormLabel === "Moderate"
      ? "Moderate broad potential means seasonal weather may sometimes support thunderstorms. Use official warnings for real-time decisions."
      : "Low broad potential means this latitude-only screen sees less support for organised tropical development. Ordinary thunderstorms can still occur.";

  return (
    <section className="education-module advice-module">
      <div className="education-heading"><span className="micro-label">ENGINEERING RESPONSE</span><h2>What should you do?</h2><p>Use the calculated exposure for protection planning, and use atmospheric potential only as additional weather context.</p></div>
      <div className="advice-grid">
        <div className={`advice-level ${result.riskLevel.toLowerCase()}`}><span className="micro-label">LIGHTNING RISK RESPONSE</span><h3>{highRisk ? "Prioritise formal review" : result.riskLevel === "Moderate" ? "Plan a protection review" : "Maintain basic controls"}</h3><ul>{highRisk ? <><li>Engage a qualified lightning-protection engineer for a full IEC 62305 risk assessment.</li><li>Review air terminals, down conductors, earthing, bonding, and surge protection.</li><li>Use site-specific Ng data rather than the latitude planning estimate.</li></> : result.riskLevel === "Moderate" ? <><li>Consider a formal protection and earthing review.</li><li>Check surge protection for power, data, and communications.</li><li>Keep maintenance and inspection records for the protection system.</li></> : <><li>Keep equipment bonding and earthing in good condition.</li><li>Use appropriate surge protection for sensitive electronics.</li><li>Reassess if height, surroundings, or local lightning data changes.</li></>}</ul></div>
        <div className="advice-level atmospheric"><span className="micro-label">ATMOSPHERIC STORM CONTEXT · {stormLabel.toUpperCase()}</span><h3>How low pressure fits in</h3><p>{stormAdvice}</p><p>Low-pressure systems can lift warm, moist air and help clouds grow. If thunderstorms form, lightning exposure can become temporarily higher than the long-term average. The current IEC/EGM calculation is an annual planning estimate, so this panel must not be added as a second multiplier.</p><strong>During an official thunderstorm warning: move people indoors, stop work on exposed structures, avoid touching metal equipment, and follow local emergency guidance.</strong></div>
      </div>
    </section>
  );
}
