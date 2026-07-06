"use client";

import { motion } from "framer-motion";
import ChoiceQuestion from "./ChoiceQuestion";
import CurrencyQuestion from "./CurrencyQuestion";
import type { Choice } from "@/lib/questions";

interface Props {
  choices: Choice[];
  value?: string; // legalFees
  amount?: number; // legalFeesAmount
  onChange: (patch: { legalFees?: string; legalFeesAmount?: number }) => void;
}

// Frais légaux / quittance : choix + champ montant si « Oui, je connais le montant ».
export default function LegalFeesQuestion({ choices, value, amount, onChange }: Props) {
  return (
    <div className="space-y-4">
      <ChoiceQuestion
        choices={choices}
        value={value}
        onChange={(v) =>
          onChange({ legalFees: v, legalFeesAmount: v === "known" ? amount : undefined })
        }
      />
      {value === "known" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <CurrencyQuestion
            value={amount}
            onChange={(v) => onChange({ legalFeesAmount: v })}
            placeholder="1 200"
            helper="Frais de quittance et d'administration connus."
          />
        </motion.div>
      )}
    </div>
  );
}
