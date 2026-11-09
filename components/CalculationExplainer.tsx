"use client";

import type { RiskResult } from "../lib/calculations";

export function CalculationExplainer({
  height,
  ng,
  exposureFactor,
  currentKa,
  result,
}: {
  height: number;
  ng: number;
  exposureFactor: number;
  currentKa: number;
  result: RiskResult;
}) {
  return (
    <section className="education-module">
      <div className="education-heading">
        <span className="micro-label">MODEL TRANSPARENCY</span>
        <h2>How the lightning estimate is calculated</h2>
        <p>Think of this as a screening estimate: how much area the structure can collect, multiplied by how active lightning is locally.</p>
      </div>
      <div className="formula-steps">
        <div className="formula-step"><b>1</b><strong>Strike reach</strong><code>S = 10 × I<sup>0.65</sup> = {result.strikingDistance.toFixed(1)} m</code><p><b>I</b> is the assumed peak lightning current: {currentKa} kA. A stronger flash can connect from farther away.</p></div>
        <div className="formula-step"><b>2</b><strong>Collection radius</strong><code>Rc = 3 × H = 3 × {height} = {result.collectionRadius.toFixed(1)} m</code><p><b>H</b> is structure height. Taller structures create a larger theoretical area in which a strike may attach.</p></div>
        <div className="formula-step"><b>3</b><strong>Collection area</strong><code>Ac = π × Rc² = {result.collectionAreaKm2.toFixed(6)} km²</code><p>The circular field around the structure is converted from square metres to square kilometres.</p></div>
        <div className="formula-step final-formula"><b>4</b><strong>Annual direct strikes</strong><code>Nd = Ng × Ac × Cd = {ng} × {result.collectionAreaKm2.toFixed(6)} × {exposureFactor} = {result.expectedStrikesPerYear.toFixed(4)} / year</code><p><b>Ng</b> is local flashes per km² per year. <b>Cd</b> represents terrain and surrounding exposure.</p></div>
      </div>
      <div className="term-guide"><span><b>Rolling sphere</b> An imaginary sphere rolled over the site. Places the sphere touches are possible lightning attachment points.</span><span><b>Collection field</b> The model area around the structure from which a direct strike may be collected.</span><span><b>Return period</b> An average interval, not a promise: about {Number.isFinite(result.returnPeriodYears) ? Math.round(result.returnPeriodYears) : "—"} years between events at this estimated rate.</span></div>
    </section>
  );
}
