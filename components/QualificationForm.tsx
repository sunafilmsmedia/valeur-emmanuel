"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useMemo, useRef, useState } from "react";
import { getVisibleQuestions, isAnswered } from "@/lib/questions";
import { BROKER } from "@/lib/broker";
import type { Answers } from "@/lib/types";
import ProgressBar from "./ProgressBar";
import ChoiceQuestion from "./questions/ChoiceQuestion";
import CurrencyQuestion from "./questions/CurrencyQuestion";
import RegionMap from "./questions/RegionMap";
import MortgageBalanceQuestion from "./questions/MortgageBalanceQuestion";
import PenaltyQuestion from "./questions/PenaltyQuestion";
import CommissionQuestion from "./questions/CommissionQuestion";
import LegalFeesQuestion from "./questions/LegalFeesQuestion";

interface Props {
  onComplete: (answers: Answers) => void;
  onExit: () => void;
}

const AUTO_ADVANCE_MS = 220;

export default function QualificationForm({ onComplete, onExit }: Props) {
  const [answers, setAnswers] = useState<Answers>({});
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const autoAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const visible = useMemo(() => getVisibleQuestions(answers), [answers]);
  const current = visible[Math.min(index, visible.length - 1)];
  const isLast = index >= visible.length - 1;
  const canProceed = current ? isAnswered(current, answers) : false;

  const submit = useCallback(() => {
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    onComplete(answers);
  }, [answers, onComplete]);

  const goNext = useCallback(() => {
    setDirection(1);
    if (isLast) {
      submit();
    } else {
      setIndex((i) => Math.min(visible.length - 1, i + 1));
    }
  }, [isLast, submit, visible.length]);

  const goPrev = useCallback(() => {
    if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
    setDirection(-1);
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const updateAndMaybeAdvance = useCallback(
    (partial: Partial<Answers>, autoAdvance: boolean) => {
      let nextAnswers: Answers = answers;
      setAnswers((prev) => {
        const next = { ...prev, ...partial };
        nextAnswers = next;
        return next;
      });

      if (autoAdvance) {
        if (autoAdvanceTimer.current) clearTimeout(autoAdvanceTimer.current);
        autoAdvanceTimer.current = setTimeout(() => {
          setDirection(1);
          setIndex((i) => {
            const visibleAfter = getVisibleQuestions(nextAnswers);
            if (i >= visibleAfter.length - 1) {
              onComplete(nextAnswers);
              return i;
            }
            return i + 1;
          });
        }, AUTO_ADVANCE_MS);
      }
    },
    [answers, onComplete]
  );

  if (!current) return null;

  return (
    <div className="min-h-screen flex flex-col px-5 sm:px-8 py-6 sm:py-10 max-w-2xl mx-auto w-full">
      {/* Top bar */}
      <header className="flex items-center justify-between gap-4 mb-8 sm:mb-12">
        <button
          onClick={onExit}
          className="text-xs text-[var(--color-muted-2)] hover:text-[var(--color-brand-300)] transition-colors flex items-center gap-1.5"
        >
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 2L2 6L5 10M2 6H10" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Retour
        </button>
        <div className="font-serif italic text-sm text-[var(--color-brand-300)]">{BROKER.name}</div>
      </header>

      <ProgressBar current={index} total={visible.length} />

      {/* Slide container */}
      <div className="flex-1 mt-10 sm:mt-14 relative">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={current.id}
            custom={direction}
            initial={{ opacity: 0, x: direction * 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -60 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="mb-7 sm:mb-9">
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl text-[var(--color-brand-100)] leading-tight tracking-tight text-balance">
                {current.title}
              </h2>
              {current.subtitle && (
                <p className="mt-2.5 text-sm sm:text-base text-[var(--color-muted)]">
                  {current.subtitle}
                </p>
              )}
            </div>

            <QuestionRenderer
              questionId={current.id}
              answers={answers}
              onUpdate={updateAndMaybeAdvance}
              autoAdvance={!!current.autoAdvance}
              choices={current.choices}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer controls */}
      <footer className="mt-8 sm:mt-10 pt-6 border-t border-black/5">
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={goPrev}
            disabled={index === 0}
            className="
              px-5 py-2.5 rounded-full text-sm font-medium
              text-[var(--color-muted)] hover:text-[var(--color-brand-300)]
              disabled:opacity-30 disabled:cursor-not-allowed
              transition-colors
            "
          >
            Précédent
          </button>

          {isLast ? (
            <button
              type="button"
              onClick={submit}
              disabled={!canProceed}
              className="
                inline-flex items-center gap-2
                px-6 sm:px-8 py-3 rounded-full text-sm font-medium
                bg-gradient-to-b from-[var(--color-brand-500)] to-[var(--color-brand-700)]
                text-white
                shadow-[0_15px_40px_-10px_var(--color-brand-shadow)]
                hover:shadow-[0_20px_50px_-10px_var(--color-brand-shadow-strong)]
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all
              "
            >
              Calculer mon montant net
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 10h10M11 6l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              disabled={!canProceed}
              className="
                inline-flex items-center gap-2
                px-6 py-2.5 rounded-full text-sm font-medium
                bg-black/[0.04] border border-black/10
                text-[var(--color-brand-100)]
                hover:bg-black/[0.07] hover:border-black/15
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-all
              "
            >
              Suivant
              <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 10h10M11 6l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}

interface RendererProps {
  questionId: string;
  answers: Answers;
  choices?: { value: string; label: string; hint?: string }[];
  autoAdvance: boolean;
  onUpdate: (partial: Partial<Answers>, autoAdvance: boolean) => void;
}

function QuestionRenderer({ questionId, answers, choices, autoAdvance, onUpdate }: RendererProps) {
  switch (questionId) {
    case "propertyType":
      return (
        <ChoiceQuestion
          choices={choices!}
          value={answers.propertyType}
          onChange={(v) => onUpdate({ propertyType: v as Answers["propertyType"] }, autoAdvance)}
        />
      );
    case "region":
      return (
        <RegionMap value={answers.region} onChange={(id) => onUpdate({ region: id }, false)} />
      );
    case "estimatedValue":
      return (
        <CurrencyQuestion
          value={answers.estimatedValue}
          onChange={(v) => onUpdate({ estimatedValue: v }, false)}
          placeholder="525 000"
          helper="Aucun jugement — Emmanuel validera avec le marché réel."
        />
      );
    case "mortgageBalance":
      return (
        <MortgageBalanceQuestion
          value={answers.mortgageBalance}
          unknown={answers.mortgageBalanceUnknown}
          onChange={(patch) => onUpdate(patch as Partial<Answers>, false)}
        />
      );
    case "mortgageType":
      return (
        <ChoiceQuestion
          choices={choices!}
          value={answers.mortgageType}
          onChange={(v) => onUpdate({ mortgageType: v as Answers["mortgageType"] }, autoAdvance)}
        />
      );
    case "penalty":
      return (
        <PenaltyQuestion
          choices={choices!}
          value={answers.penaltyKnowledge}
          amount={answers.penaltyAmount}
          onChange={(patch) => onUpdate(patch as Partial<Answers>, false)}
        />
      );
    case "commission":
      return (
        <CommissionQuestion
          choices={choices!}
          value={answers.commissionPreference}
          rate={answers.commissionRate}
          onChange={(patch) => onUpdate(patch as Partial<Answers>, false)}
        />
      );
    case "prepCosts":
      return (
        <ChoiceQuestion
          choices={choices!}
          value={answers.prepCosts}
          onChange={(v) => onUpdate({ prepCosts: v as Answers["prepCosts"] }, autoAdvance)}
        />
      );
    case "localizationCert":
      return (
        <ChoiceQuestion
          choices={choices!}
          value={answers.localizationCert}
          onChange={(v) => onUpdate({ localizationCert: v as Answers["localizationCert"] }, autoAdvance)}
        />
      );
    case "legalFees":
      return (
        <LegalFeesQuestion
          choices={choices!}
          value={answers.legalFees}
          amount={answers.legalFeesAmount}
          onChange={(patch) => onUpdate(patch as Partial<Answers>, false)}
        />
      );
    case "residenceType":
      return (
        <ChoiceQuestion
          choices={choices!}
          value={answers.residenceType}
          onChange={(v) => onUpdate({ residenceType: v as Answers["residenceType"] }, autoAdvance)}
        />
      );
    case "purchasePrice":
      return (
        <CurrencyQuestion
          value={answers.purchasePrice}
          onChange={(v) => onUpdate({ purchasePrice: v }, false)}
          placeholder="380 000"
          helper="Facultatif — laisse vide si tu ne t'en souviens pas."
        />
      );
    case "majorRenos":
      return (
        <ChoiceQuestion
          choices={choices!}
          value={answers.majorRenos}
          onChange={(v) => onUpdate({ majorRenos: v as Answers["majorRenos"] }, autoAdvance)}
        />
      );
    case "objective":
      return (
        <ChoiceQuestion
          choices={choices!}
          value={answers.objective}
          onChange={(v) => onUpdate({ objective: v as Answers["objective"] }, autoAdvance)}
        />
      );
    case "desiredNet":
      return (
        <ChoiceQuestion
          choices={choices!}
          value={answers.desiredNet}
          onChange={(v) => onUpdate({ desiredNet: v as Answers["desiredNet"] }, autoAdvance)}
        />
      );
    default:
      return null;
  }
}
