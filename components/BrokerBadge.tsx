"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { BROKER } from "@/lib/broker";

export default function BrokerBadge() {
  return (
    <motion.a
      href={`tel:${BROKER.phoneTel}`}
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="
        fixed z-40
        bottom-4 left-4 right-4
        sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-[340px]
        rounded-2xl glass-card-light
        px-4 py-3.5 sm:px-5 sm:py-4
        flex items-center gap-4
        no-underline
        cursor-pointer
        group
        transition-shadow duration-300
        hover:shadow-[0_40px_100px_-30px_rgba(90,16,16,0.45)]
      "
      aria-label={`Appeler ${BROKER.name} au ${BROKER.phoneDisplay}`}
    >
      <div className="relative shrink-0">
        <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-gradient-to-br from-[var(--color-brand-700)] to-[var(--color-brand-900)] ring-2 ring-white shadow-md flex items-center justify-center">
          {BROKER.photo ? (
            <Image
              src={BROKER.photo}
              alt={BROKER.name}
              fill
              sizes="(max-width: 640px) 64px, 80px"
              className="object-cover"
              style={{ objectPosition: BROKER.photoPosition }}
              priority
            />
          ) : (
            <span className="font-serif text-white text-xl sm:text-2xl tracking-wide">
              {BROKER.initials}
            </span>
          )}
        </div>
        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 sm:w-4.5 sm:h-4.5 bg-emerald-500 rounded-full ring-[2.5px] ring-white" aria-hidden>
          <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-50" />
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[10px] sm:text-[11px] font-medium text-emerald-700 uppercase tracking-wide">
            Disponible maintenant
          </span>
        </div>
        <p className="font-serif text-base sm:text-lg leading-tight text-slate-900 mt-0.5 truncate">
          {BROKER.name}
        </p>
        <p className="text-[11px] sm:text-xs text-[var(--color-muted-2)] truncate">
          {BROKER.title} — {BROKER.region}
        </p>
      </div>

      {/* Pastille téléphone — signifie le clic */}
      <div className="shrink-0 flex flex-col items-center justify-center gap-0.5">
        <div className="
          w-11 h-11 sm:w-12 sm:h-12 rounded-full
          bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-700)]
          flex items-center justify-center
          shadow-[0_8px_22px_-6px_rgba(220,38,38,0.5)]
          group-hover:shadow-[0_12px_28px_-6px_rgba(220,38,38,0.65)]
          transition-shadow
        ">
          <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-white" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path
              d="M3.5 4.5C3.5 4 4 3.5 4.5 3.5H7L8.5 7L6.5 8.5C7.5 11 9 12.5 11.5 13.5L13 11.5L16.5 13V15.5C16.5 16 16 16.5 15.5 16.5C9 16.5 3.5 11 3.5 4.5Z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="text-[9px] text-[var(--color-muted-2)] font-medium tracking-wide">Appeler</span>
      </div>
    </motion.a>
  );
}
