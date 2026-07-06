"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { BROKER } from "@/lib/broker";

// Logo The Agency (badge rouge) + nom du courtier. Style « The Agency ».
export default function TopLogos() {
  return (
    <>
      {/* Logo agence + wordmark courtier — gauche */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-4 left-4 sm:top-6 sm:left-6 z-30 pointer-events-none"
        aria-hidden
      >
        <div className="flex items-center gap-2.5 sm:gap-3">
          <Image
            src={BROKER.logo}
            alt={BROKER.agency}
            width={1500}
            height={1500}
            priority
            className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg object-cover shadow-[0_8px_24px_-8px_rgba(224,30,38,0.6)]"
          />
          <div className="leading-none">
            <p className="font-sans font-extrabold uppercase tracking-tight text-white text-sm sm:text-base">
              {BROKER.name}
            </p>
            <p className="text-[10px] sm:text-xs text-[var(--color-muted)] mt-1 uppercase tracking-[0.14em]">
              {BROKER.title} · {BROKER.agency}
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
        <span className="px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-brand-300)] bg-[var(--color-brand-500)]/10 border border-[var(--color-brand-500)]/30">
          {BROKER.region}
        </span>
      </motion.div>
    </>
  );
}
