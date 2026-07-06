"use client";

import { motion } from "framer-motion";
import ChoiceQuestion from "./ChoiceQuestion";
import CurrencyQuestion from "./CurrencyQuestion";
import type { Choice } from "@/lib/questions";

interface Props {
  choices: Choice[];
  value?: string; // penaltyKnowledge
  amount?: number; // penaltyAmount
  onChange: (patch: { penaltyKnowledge?: string; penaltyAmount?: number }) => void;
}

// Choix de connaissance de la pénalité + champ montant si « Oui, je la connais ».
export default function PenaltyQuestion({ choices, value, amount, onChange }: Props) {
  return (
    <div className="space-y-4">
      <ChoiceQuestion
        choices={choices}
        value={value}
        onChange={(v) =>
          onChange({ penaltyKnowledge: v, penaltyAmount: v === "know" ? amount : undefined })
        }
      />
      {value === "know" && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <CurrencyQuestion
            value={amount}
            onChange={(v) => onChange({ penaltyAmount: v })}
            placeholder="4 500"
            helper="Le montant de pénalité indiqué par ta banque."
          />
        </motion.div>
      )}
    </div>
  );
}
