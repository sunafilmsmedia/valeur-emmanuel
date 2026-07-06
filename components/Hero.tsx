"use client";

import { motion } from "framer-motion";
import { BROKER } from "@/lib/broker";

// Secteurs desservis (Rive-Sud).
const SECTORS = ["Brossard", "Saint-Lambert", "Longueuil", "Boucherville", "Candiac", "La Prairie"];

export default function Hero({ onStart }: { onStart: () => void }) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-start px-5 sm:px-8 pt-20 sm:pt-28 pb-32">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-3xl text-center"
      >
        {/* Secteurs desservis — en haut */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="mb-8 sm:mb-10"
        >
          <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--color-muted-2)] mb-3">
            Rive-Sud de Montréal
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg mx-auto">
            {SECTORS.map((s) => (
              <span
                key={s}
                className="px-3 py-1.5 rounded-full text-xs font-medium text-[var(--color-brand-200)] bg-white/[0.06] border border-white/10"
              >
                {s}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Chip */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card text-xs sm:text-sm text-[var(--color-brand-200)] mb-7 sm:mb-9">
          <span className="relative inline-flex w-2 h-2 rounded-full bg-[var(--color-gold)] text-[var(--color-gold)] pulse-dot" />
          <span className="font-medium tracking-wide ai-shimmer">Calculateur Net Vendeur</span>
        </div>

        {/* Titre H1 — grand serif rouge sur noir (style The Agency) */}
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl text-[var(--color-brand-500)] leading-[1.05] tracking-tight text-balance">
          Découvre combien il te resterait <span className="italic">vraiment</span> après la vente
        </h1>

        {/* Divider doré */}
        <div className="mt-8 sm:mt-10 mx-auto w-12 h-px bg-gradient-to-r from-transparent via-[var(--color-gold)] to-transparent" />

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7 }}
          className="mt-10 sm:mt-12 flex flex-col items-center gap-3"
        >
          <button
            onClick={onStart}
            className="
              group relative inline-flex items-center justify-center gap-2
              px-8 sm:px-10 py-4 rounded-full
              bg-gradient-to-b from-[var(--color-brand-500)] to-[var(--color-brand-700)]
              text-white font-medium text-base
              shadow-[0_20px_50px_-15px_var(--color-brand-shadow-strong),0_0_0_1px_rgba(255,255,255,0.08)_inset]
              hover:shadow-[0_25px_60px_-10px_var(--color-brand-shadow-strong),0_0_0_1px_rgba(255,255,255,0.12)_inset]
              transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0
            "
          >
            <span>Calculer mon montant net</span>
            <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 10h10M11 6l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <p className="text-xs text-[var(--color-muted-2)]">Moins de 2 minutes — gratuit et confidentiel</p>
        </motion.div>

        {/* Sous-titre + signature courtier */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.7 }}
          className="mt-12 sm:mt-14 text-base sm:text-lg text-[var(--color-muted)] max-w-xl mx-auto leading-relaxed text-balance"
        >
          Hypothèque, pénalité, commission, taxes et frais : on calcule ce qu&apos;il te resterait
          vraiment dans tes poches. Une estimation claire et chiffrée — pas juste un prix au hasard.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.7 }}
          className="mt-5 text-sm text-[var(--color-brand-300)]"
        >
          Créé avec {BROKER.name} — courtier immobilier sur la Rive-Sud et {BROKER.credential.toLowerCase()}.
        </motion.p>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1.5, duration: 1 }}
        className="absolute bottom-24 sm:bottom-10 left-1/2 -translate-x-1/2 text-[10px] text-[var(--color-muted-2)] uppercase tracking-[0.2em]"
      >
        Confidentiel · Sans engagement
      </motion.div>
    </section>
  );
}
