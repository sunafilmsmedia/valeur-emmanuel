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
    <div className="absolute inset-0 -z-10 overflow-hidden" style={{ background: "#ffffff" }}>
      {/* Carte désaturée, discrète sur fond blanc */}
      <div
        className="map-no-interaction absolute inset-0"
        style={{ filter: "grayscale(0.85) brightness(1.06) contrast(1.02)" }}
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
                color: "#ffffff",
                weight: 2,
                opacity: 0.9,
                fillColor: "#dc2626",
                fillOpacity: 0.9,
              }}
            />
          ))}
          <FitTerritory />
        </MapContainer>
      </div>

      {/* Teinte neutre très légère — garde tout dans le ton du fond blanc */}
      <div
        className="absolute inset-0"
        style={{ background: "#f2f2f4", mixBlendMode: "multiply", opacity: 0.12 }}
      />

      {/* Voile radial blanc, juste derrière le texte central */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 34%, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.30) 55%, rgba(255,255,255,0.62) 100%)",
        }}
      />
    </div>
  );
}
