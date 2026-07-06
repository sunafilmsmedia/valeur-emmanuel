"use client";

import { motion } from "framer-motion";
import { BROKER } from "@/lib/broker";

export default function Hero({ onStart }: { onStart: () => void }) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-5 sm:px-8 pt-24 pb-28 sm:pb-32">
      {/* Détail éditorial — texte vertical, bord droit */}
      <div className="pointer-events-none absolute right-1.5 sm:right-4 top-1/2 -translate-y-1/2 hidden sm:block">
        <span
          style={{ writingMode: "vertical-rl" }}
          className="text-[10px] uppercase tracking-[0.4em] text-[var(--color-ink)]/25"
        >
          Édition Rive-Sud — Montréal, QC
        </span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-4xl w-full text-center"
      >
        {/* Kicker */}
        <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.4em] text-[var(--color-brand-300)] mb-7 sm:mb-9">
          Calculateur Net Vendeur · {BROKER.region}
        </p>

        {/* Titre — Didone, majuscules, énorme, rouge (couverture magazine) */}
        <h1 className="font-serif font-black uppercase text-[var(--color-brand-500)] leading-[0.88] tracking-[-0.03em] text-[15vw] sm:text-7xl lg:text-8xl xl:text-[8.5rem]">
          Le nouveau
          <br />
          standard du
          <br />
          net vendeur
        </h1>

        {/* Filet rouge fin */}
        <div className="mt-9 sm:mt-11 mx-auto w-16 h-px bg-[var(--color-brand-500)]/60" />

        {/* Sous-titre — une ligne, blanc cassé */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mt-8 text-base sm:text-lg text-[var(--color-muted)] max-w-xl mx-auto leading-relaxed text-balance"
        >
          Découvre combien il te resterait vraiment après la vente — hypothèque,
          pénalité, commission et frais compris.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.7 }}
          className="mt-10 sm:mt-12 flex flex-col items-center gap-4"
        >
          <button
            onClick={onStart}
            className="
              group relative inline-flex items-center justify-center gap-2.5
              px-9 sm:px-11 py-4
              bg-[var(--color-brand-500)] hover:bg-[var(--color-brand-400)]
              text-white text-sm font-semibold uppercase tracking-[0.15em]
              transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0
              shadow-[0_20px_50px_-15px_var(--color-brand-shadow-strong)]
            "
          >
            <span>Calculer mon montant net</span>
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 10h10M11 6l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[var(--color-muted-2)]">
            Moins de 2 minutes · gratuit · confidentiel
          </p>
        </motion.div>
      </motion.div>

      {/* Signature éditoriale — bas centre */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-8 sm:bottom-10 left-1/2 -translate-x-1/2 text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-[var(--color-ink)]/30 text-center px-4"
      >
        {BROKER.agency} · {BROKER.name}, {BROKER.title.toLowerCase()}
      </motion.p>
    </section>
  );
}
