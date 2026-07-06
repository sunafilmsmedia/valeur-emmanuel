"use client";

// Fond éditorial : noir profond + halo rouge subtil bas-centre + vignette.
// Minimal — « beaucoup d'espace sombre ».
export default function HeroBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden" style={{ background: "#050505" }}>
      {/* Halo rouge diffus, bas-centre (comme un projecteur) */}
      <div
        className="absolute inset-x-0 bottom-[-25%] h-[75%]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 100%, rgba(215,25,32,0.16) 0%, rgba(215,25,32,0.05) 32%, transparent 68%)",
        }}
      />
      {/* Vignette — assombrit les bords, garde le centre respirant */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 50% 32%, transparent 42%, rgba(5,5,5,0.55) 100%)",
        }}
      />
    </div>
  );
}
