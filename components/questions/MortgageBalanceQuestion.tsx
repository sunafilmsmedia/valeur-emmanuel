"use client";

import CurrencyQuestion from "./CurrencyQuestion";

interface Props {
  value?: number;
  unknown?: boolean;
  onChange: (patch: { mortgageBalance?: number; mortgageBalanceUnknown?: boolean }) => void;
}

// Solde hypothécaire : montant exact/approximatif OU « Je ne suis pas certain ».
export default function MortgageBalanceQuestion({ value, unknown, onChange }: Props) {
  return (
    <div className="space-y-4">
      <div className={unknown ? "opacity-45 transition-opacity" : "transition-opacity"}>
        <CurrencyQuestion
          value={unknown ? undefined : value}
          onChange={(v) => onChange({ mortgageBalance: v, mortgageBalanceUnknown: false })}
          placeholder="420 000"
          helper="Montant exact ou approximatif — pas besoin d'être parfait."
        />
      </div>

      <button
        type="button"
        onClick={() =>
          onChange({ mortgageBalanceUnknown: !unknown, mortgageBalance: undefined })
        }
        className={`
          w-full rounded-2xl px-5 py-4 text-left text-sm font-medium
          transition-all duration-200
          ${
            unknown
              ? "bg-[var(--color-brand-500)]/[0.08] border border-[var(--color-brand-500)]/70 text-[var(--color-brand-300)] shadow-[0_0_0_3px_var(--color-brand-glow)]"
              : "glass-card text-[var(--color-brand-100)] hover:border-white/18 hover:bg-white/[0.05]"
          }
        `}
      >
        <span className="flex items-center gap-3">
          <span
            className={`
              shrink-0 w-5 h-5 rounded-full border transition-all
              ${
                unknown
                  ? "bg-[var(--color-brand-500)] border-[var(--color-brand-500)]"
                  : "border-white/18"
              }
            `}
            aria-hidden
          />
          Je ne suis pas certain
        </span>
      </button>
    </div>
  );
}
