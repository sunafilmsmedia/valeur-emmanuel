import type { Region } from "./types";

export interface RegionWithLabel extends Region {
  // Direction du tooltip Leaflet pour éviter les chevauchements
  // entre marqueurs proches.
  labelDir: "top" | "bottom" | "left" | "right";
}

// Secteurs couverts par Emmanuel Bouchard — Rive-Sud de Montréal.
export const REGIONS: RegionWithLabel[] = [
  { id: "brossard",       name: "Brossard",        lat: 45.4530, lng: -73.4660, labelDir: "top" },
  { id: "saint-lambert",  name: "Saint-Lambert",   lat: 45.4990, lng: -73.5090, labelDir: "left" },
  { id: "longueuil",      name: "Longueuil",       lat: 45.5370, lng: -73.5100, labelDir: "top" },
  { id: "saint-hubert",   name: "Saint-Hubert",    lat: 45.4948, lng: -73.4212, labelDir: "right" },
  { id: "boucherville",   name: "Boucherville",    lat: 45.5970, lng: -73.4360, labelDir: "right" },
  { id: "sainte-julie",   name: "Sainte-Julie",    lat: 45.5830, lng: -73.3330, labelDir: "right" },
  { id: "la-prairie",     name: "La Prairie",      lat: 45.4200, lng: -73.4990, labelDir: "left" },
  { id: "candiac",        name: "Candiac",         lat: 45.3830, lng: -73.5170, labelDir: "bottom" },
  { id: "saint-constant", name: "Saint-Constant",  lat: 45.3700, lng: -73.5660, labelDir: "left" },
  { id: "autre",          name: "Autre Rive-Sud",  lat: 45.4450, lng: -73.3750, labelDir: "right" },
];

// Centre approximatif pour la carte de fond (décorative).
export const REGION_CENTER: [number, number] = [45.48, -73.47];

// Bounds englobant tous les secteurs avec padding pour la carte interactive.
export const REGION_BOUNDS: [[number, number], [number, number]] = [
  [45.35, -73.60], // sud-ouest (englobe Candiac / Saint-Constant)
  [45.62, -73.30], // nord-est (englobe Boucherville / Sainte-Julie)
];
