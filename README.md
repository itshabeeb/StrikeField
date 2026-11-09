## Lightning Strike Analysis

Run the Streamlit app with:

```powershell
streamlit run main.py
```

The app provides a preliminary EGM-style lightning exposure estimate and a
separate latitude-only screen for tropical low-pressure development potential.
The low-pressure screen is climatological, not a forecast; it does not replace
live weather data or change the lightning strike calculation.

## Next.js dashboard

The interactive dashboard is the `app/` frontend. Start it with:

```powershell
npm install
npm run dev
```

### Architecture

- `lib/calculations.ts` mirrors the existing `calculate_lightning_risk` and
  latitude-band estimates as typed presentation logic; the Python formulas are
  unchanged.
- `app/page.tsx` owns the small assessment state: height, latitude, and
  exposure.
- `components/EngineeringScene.tsx` renders the animated SVG structure and
  collection zone.
- `components/StormPotential.tsx` keeps atmospheric potential separate from
  lightning risk.
- `components/RiskExplanation.tsx` and `components/SimulationPanel.tsx`
  explain the result and probability intuition.

The `Export report` button uses the browser print dialog, which supports
Save-to-PDF and includes the visual assessment, assumptions, calculations, and
recommendation. A production deployment can replace this with a server-side
PDF renderer without changing the calculation adapter.

### STRIKEFIELD platform sections

- **Dashboard**: live SVG digital twin with instrument controls, site
  intelligence, atmospheric potential, and shared model telemetry.
- **Simulation**: storm-pass mode plus an accelerated 100-year probability
  timeline.
- **3D Lab**: React Three Fiber scene with orbit/pan/zoom controls, terrain,
  buildings, pole, rolling-sphere envelope, and storm mode.
- **Reports**: print-ready engineering brief containing location, model output,
  atmospheric context, IEC reference, and recommendation.

The **Detect Site Location** control uses browser geolocation and
OpenStreetMap Nominatim reverse geocoding when the browser permits it. The
climate and lightning-density values remain planning estimates; elevation is
explicitly marked as pending until a terrain-elevation data source is
configured.

### Incremental implementation plan

1. Connect `lib/calculations.ts` to a Python API endpoint when deployment needs
   one source of truth; keep the current local adapter for offline UX.
2. Add a geocoded map provider behind a client-only map component and preserve
   the manual latitude fallback.
3. Add a season/basin data source to the atmospheric screen while retaining
   the explicit non-forecast disclaimer.
4. Add automated visual regression tests for the SVG scene and keyboard tests
   for every input and action.

### Performance and accessibility

The dashboard uses memoized calculations, CSS/SVG instead of a 3D runtime,
small Framer Motion transitions, responsive CSS breakpoints, semantic sections,
native range/select controls, visible focus-compatible controls, and text
alternatives for the engineering illustration.