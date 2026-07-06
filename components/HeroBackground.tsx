"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, useMap } from "react-leaflet";
import { REGIONS, REGION_BOUNDS, REGION_CENTER } from "@/lib/regions";

// Cadre la carte sur le territoire desservi + garantit le chargement des tuiles.
function FitTerritory() {
  const map = useMap();
  useEffect(() => {
    const fit = () => {
      map.invalidateSize();
      map.fitBounds(REGION_BOUNDS, { padding: [40, 40], animate: false });
    };
    fit();
    const t1 = setTimeout(fit, 200);
    const t2 = setTimeout(fit, 800);
    window.addEventListener("resize", fit);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", fit);
    };
  }, [map]);
  return null;
}

// Fond : carte des secteurs desservis (Rive-Sud), ton-sur-ton beige.
export default function HeroBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden" style={{ background: "#ece4d8" }}>
      {/* Carte désaturée et chaude — plus présente qu'avant */}
      <div
        className="map-no-interaction absolute inset-0"
        style={{ filter: "grayscale(0.7) sepia(0.3) brightness(1.0) contrast(1.14)" }}
      >
        <MapContainer
          center={REGION_CENTER}
          zoom={10}
          zoomControl={false}
          attributionControl={true}
          dragging={false}
          touchZoom={false}
          doubleClickZoom={false}
          scrollWheelZoom={false}
          boxZoom={false}
          keyboard={false}
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; OpenStreetMap, &copy; CARTO'
            subdomains={["a", "b", "c", "d"]}
          />
          {/* Points des secteurs desservis */}
          {REGIONS.map((r) => (
            <CircleMarker
              key={r.id}
              center={[r.lat, r.lng]}
              radius={8}
              pathOptions={{
                color: "#f2e8d8",
                weight: 2,
                opacity: 0.9,
                fillColor: "#0d9488",
                fillOpacity: 0.9,
              }}
            />
          ))}
          <FitTerritory />
        </MapContainer>
      </div>

      {/* Teinte beige (multiply) — garde tout dans le ton du fond, très léger */}
      <div
        className="absolute inset-0"
        style={{ background: "#e6dcc9", mixBlendMode: "multiply", opacity: 0.15 }}
      />

      {/* Voile radial léger, juste derrière le texte central */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 34%, rgba(236,228,216,0.05) 0%, rgba(236,228,216,0.28) 55%, rgba(236,228,216,0.55) 100%)",
        }}
      />
    </div>
  );
}
