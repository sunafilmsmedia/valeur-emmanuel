"use client";

import { motion } from "framer-motion";
import { BROKER } from "@/lib/broker";

// Wordmark texte — aucun asset requis. (Dépose un logo dans /public et
// remplace ce bloc si Emmanuel fournit une image de marque.)
export default function TopLogos() {
  return (
    <>
      {/* Wordmark courtier — gauche */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-4 left-4 sm:top-6 sm:left-6 z-30 pointer-events-none"
        aria-hidden
      >
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-700)] text-white font-serif text-sm sm:text-base shadow-[0_6px_18px_-6px_var(--color-brand-shadow)]">
            {BROKER.initials}
          </span>
          <div className="leading-none">
            <p className="font-sans font-extrabold uppercase tracking-tight text-[var(--color-ink)] text-sm sm:text-base">
              {BROKER.name}
            </p>
            <p className="font-serif italic text-[10px] sm:text-xs text-[var(--color-muted)] mt-0.5">
              {BROKER.title} · {BROKER.credential.toLowerCase()}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Étiquette secteur — droite */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-30 pointer-events-none"
        aria-hidden
      >
        <span className="px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-medium uppercase tracking-[0.15em] text-[var(--color-brand-300)] bg-white/70 border border-black/5 shadow-[0_2px_8px_-4px_rgba(30,24,24,0.18)]">
          {BROKER.region}
        </span>
      </motion.div>
    </>
  );
}
