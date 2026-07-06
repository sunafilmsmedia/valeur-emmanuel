"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import ChoiceQuestion from "./ChoiceQuestion";
import type { Choice } from "@/lib/questions";

interface Props {
  choices: Choice[];
  value?: string; // commissionPreference
  rate?: number; // commissionRate (en %)
  onChange: (patch: { commissionPreference?: string; commissionRate?: number }) => void;
}

// Commission : choix + champ pourcentage si « J'ai déjà un pourcentage en tête ».
export default function CommissionQuestion({ choices, value, rate, onChange }: Props) {
  return (
    <div className="space-y-4">
      <ChoiceQuestion
        choices={choices}
        value={value}
        onChange={(v) =>
          onChange({ commissionPreference: v, commissionRate: v === "custom" ? rate : undefined })
        }
      />
      {value === "custom" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <PercentInput value={rate} onChange={(v) => onChange({ commissionRate: v })} />
        </motion.div>
      )}
    </div>
  );
}

function PercentInput({
  value,
  onChange,
}: {
  value?: number;
  onChange: (v: number | undefined) => void;
}) {
  const [display, setDisplay] = useState<string>(value != null ? String(value) : "");

  return (
    <div className="glass-card rounded-2xl p-6 sm:p-8">
      <div className="flex items-baseline gap-3">
        <input
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={display}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^\d.,]/g, "").replace(",", ".");
            setDisplay(raw);
            const n = parseFloat(raw);
            onChange(isNaN(n) ? undefined : n);
          }}
          placeholder="4.5"
          className="
            flex-1 font-serif text-4xl sm:text-5xl text-[var(--color-ink)] bg-transparent
            placeholder:text-white/25 focus:outline-none w-full tracking-wide
          "
        />
        <span className="font-serif text-3xl sm:text-4xl text-[var(--color-brand-500)]">%</span>
      </div>
      <p className="text-xs text-[var(--color-muted-2)] mt-3">
        Ton pourcentage de commission (les taxes s&apos;ajoutent automatiquement).
      </p>
    </div>
  );
}
