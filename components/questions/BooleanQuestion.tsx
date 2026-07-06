"use client";

import { motion } from "framer-motion";

interface Props {
  value?: boolean;
  onChange: (v: boolean) => void;
}

export default function BooleanQuestion({ value, onChange }: Props) {
  const opts: { v: boolean; label: string }[] = [
    { v: true, label: "Oui" },
    { v: false, label: "Non" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {opts.map((o, i) => {
        const selected = value === o.v;
        return (
          <motion.button
            key={String(o.v)}
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => onChange(o.v)}
            className={`
              rounded-2xl py-6 sm:py-8
              font-medium text-lg
              transition-all duration-200
              ${
                selected
                  ? "bg-[var(--color-brand-500)]/[0.08] border border-[var(--color-brand-500)]/70 text-[var(--color-brand-700)] shadow-[0_0_0_3px_rgba(220,38,38,0.12)]"
                  : "glass-card text-[var(--color-brand-100)] hover:border-black/15 hover:bg-black/[0.02]"
              }
            `}
          >
            {o.label}
          </motion.button>
        );
      })}
    </div>
  );
}
