"use client";

import { useState } from "react";

export type SiteLocation = {
  name: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  elevation: string;
  climate: string;
};

const fallbackLocation: SiteLocation = {
  name: "Site not detected",
  state: "Manual coordinate mode",
  country: "",
  latitude: 20,
  longitude: 0,
  elevation: "—",
  climate: "Regional estimate",
};

export function SiteLocationPanel({ location, onLocation }: { location: SiteLocation; onLocation: (location: SiteLocation) => void }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function detectSite() {
    if (!navigator.geolocation) {
      setMessage("Browser geolocation is unavailable.");
      return;
    }
    setBusy(true);
    setMessage("Acquiring coordinates…");
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const latitude = Number(coords.latitude.toFixed(4));
      const longitude = Number(coords.longitude.toFixed(4));
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
        const data = await response.json() as { address?: Record<string, string>; display_name?: string };
        const address = data.address ?? {};
        onLocation({
          name: address.city ?? address.town ?? address.village ?? "Detected site",
          state: address.state ?? "Unknown state",
          country: address.country ?? "Unknown country",
          latitude,
          longitude,
          elevation: "Live terrain lookup pending",
          climate: Math.abs(latitude) < 23.5 ? "Tropical / subtropical" : "Temperate latitude",
        });
        setMessage("Site intelligence updated.");
      } catch {
        onLocation({ ...fallbackLocation, name: "Detected coordinates", latitude, longitude });
        setMessage("Coordinates acquired; reverse geocoding unavailable.");
      } finally {
        setBusy(false);
      }
    }, () => {
      setMessage("Location permission was not granted.");
      setBusy(false);
    }, { enableHighAccuracy: true, timeout: 10000 });
  }

  return <section className="location-module">
    <div className="location-heading"><div><span className="micro-label">SITE INTELLIGENCE</span><h2>{location.name}</h2><p>{location.state}{location.country ? `, ${location.country}` : ""}</p></div><button className="location-button" onClick={detectSite} disabled={busy}>⌖ {busy ? "LOCATING…" : "DETECT SITE LOCATION"}</button></div>
    <div className="location-readouts"><span><b>{location.latitude.toFixed(4)}°</b> LATITUDE</span><span><b>{location.longitude.toFixed(4)}°</b> LONGITUDE</span><span><b>{location.elevation}</b> ELEVATION</span><span><b>{location.climate}</b> CLIMATE ZONE</span></div>
    <p className="location-brief">This location is being evaluated as a living atmospheric site. Latitude, regional charge density, terrain, and exposure are translated into the digital twin below.</p>
    {message && <small className="location-message">{message}</small>}
  </section>;
}
