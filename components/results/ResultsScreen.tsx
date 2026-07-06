"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { BROKER } from "@/lib/broker";
import { formatCurrency } from "@/lib/format";
import type { AnalyzeResponse, Answers, CalcResult, LineItem, NetVerdict } from "@/lib/types";
import ContactForm from "./ContactForm";

interface Props {
  analyze: AnalyzeResponse;
  answers: Answers;
  // "yes" → analyse complète : le détail est bloqué derrière le ContactForm.
  // "no"  → estimation rapide : montant net + verdict seulement, sans capture.
  revealChoice: "yes" | "no";
  onRestart: () => void;
}

const VERDICT_BADGE: Record<NetVerdict, { label: string; color: string; bg: string; ring: string }> = {
  tres_confortable: {
    label: "Très confortable",
    color: "text-emerald-400",
    bg: "bg-emerald-600/10",
    ring: "ring-emerald-600/30",
  },
  a_optimiser: {
    label: "Possible — à optimiser",
    color: "text-amber-400",
    bg: "bg-amber-600/10",
    ring: "ring-amber-600/30",
  },
  frais_caches: {
    label: "Attention aux frais",
    color: "text-rose-400",
    bg: "bg-rose-600/10",
    ring: "ring-rose-600/30",
  },
  analyse_humaine: {
    label: "Analyse recommandée",
    color: "text-[var(--color-brand-300)]",
    bg: "bg-[var(--color-brand-500)]/10",
    ring: "ring-[var(--color-brand-500)]/30",
  },
};

type SubmissionState = { kind: "pending" } | { kind: "done"; stored: boolean; firstName: string };

export default function ResultsScreen({ analyze, answers, revealChoice, onRestart }: Props) {
  const { calc, report } = analyze;
  const badge = VERDICT_BADGE[calc.verdict];
  const [submission, setSubmission] = useState<SubmissionState>({ kind: "pending" });

  const isQuickOnly = revealChoice === "no";
  const isGated = revealChoice === "yes" && submission.kind === "pending";
  const showFull = revealChoice === "yes" && submission.kind === "done";

  return (
    <div className="min-h-screen px-5 sm:px-8 py-10 sm:py-14 max-w-3xl mx-auto w-full">
      {/* Verdict badge */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex justify-center mb-8"
      >
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full ${badge.bg} ring-1 ${badge.ring}`}>
          <span className={`w-2 h-2 rounded-full ${badge.color.replace("text-", "bg-")}`} />
          <span className={`text-xs font-medium tracking-wide ${badge.color}`}>{badge.label}</span>
        </div>
      </motion.div>

      {/* Headline + résumé */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-10"
      >
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[var(--color-brand-100)] leading-[1.1] tracking-tight text-balance">
          {report.headline}
        </h1>
        <p className="mt-5 text-base sm:text-lg text-[var(--color-muted)] leading-relaxed text-balance max-w-2xl mx-auto">
          {report.summary}
        </p>
      </motion.div>

      {/* Carte du montant net — le cœur du résultat, toujours visible */}
      <NetCard calc={calc} />

      {/* ─────────────── Estimation rapide seulement ─────────────── */}
      {isQuickOnly && <QuickOnlyCta verdict={calc.verdict} onRestart={onRestart} />}

      {/* ─────────────── Analyse complète (gated) ─────────────── */}
      {isGated && (
        <>
          <LockedTeaser calc={calc} />
          <ContactForm
            answers={answers}
            verdict={calc.verdict}
            gated
            onSubmitted={(r) => setSubmission({ kind: "done", ...r })}
          />
          <RestartLink onRestart={onRestart} />
        </>
      )}

      {/* ─────────────── Analyse complète débloquée ─────────────── */}
      {showFull && submission.kind === "done" && (
        <>
          <ConfirmationBlock stored={submission.stored} firstName={submission.firstName} />
          <Breakdown calc={calc} />
          <Assumptions calc={calc} />
          {calc.capitalGain?.applies && <CapitalGainNote note={calc.capitalGain.note} />}
          <NextSteps steps={report.steps} />
          <MarketInsight text={report.marketInsight} />
          <BrokerCta label={report.cta} />
          <Footer generatedBy={analyze.generatedBy} onRestart={onRestart} />
        </>
      )}

      {isQuickOnly && <Footer generatedBy={analyze.generatedBy} onRestart={onRestart} hideRestart />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Carte du montant net estimé (+ fourchette)
// ─────────────────────────────────────────────────────────────
function NetCard({ calc }: { calc: CalcResult }) {
  const hasRange = calc.netLow !== calc.netHigh;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="
        relative overflow-hidden rounded-3xl p-7 sm:p-9
        bg-gradient-to-br from-[var(--color-brand-500)] via-[var(--color-brand-600)] to-[var(--color-brand-800)]
        shadow-[0_30px_90px_-25px_var(--color-brand-shadow),0_0_0_1px_rgba(255,255,255,0.08)_inset]
      "
    >
      <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-[var(--color-brand-400)]/30 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-black/20 blur-3xl" />

      <div className="relative text-center">
        <p className="text-[11px] uppercase tracking-[0.2em] text-white/70">
          Montant net estimé après la vente
        </p>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-3"
        >
          <span className="font-serif text-6xl sm:text-7xl text-white leading-none">
            {formatCurrency(Math.max(0, calc.netEstimate))}
          </span>
        </motion.div>

        {hasRange && (
          <p className="mt-5 text-sm sm:text-base text-white/80">
            Fourchette réaliste :{" "}
            <span className="text-white font-medium">
              {formatCurrency(Math.max(0, calc.netLow))} – {formatCurrency(Math.max(0, calc.netHigh))}
            </span>
          </p>
        )}
        <p className="mt-3 text-xs text-white/60 max-w-md mx-auto leading-relaxed">
          Estimation basée sur tes réponses. Le chiffre final se confirme avec la vraie valeur
          marchande et ta banque.
        </p>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// Détail ligne par ligne (analyse complète)
// ─────────────────────────────────────────────────────────────
function Breakdown({ calc }: { calc: CalcResult }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="mt-12"
    >
      <h3 className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted-2)] mb-5">
        Le détail de ton calcul
      </h3>
      <div className="glass-card rounded-2xl overflow-hidden">
        <ul className="divide-y divide-white/[0.08]">
          {calc.lineItems.map((item) => (
            <LineRow key={item.key} item={item} />
          ))}
        </ul>
        <div className="flex items-center justify-between gap-4 px-5 py-5 bg-[var(--color-brand-500)]/[0.06] border-t border-[var(--color-brand-500)]/20">
          <span className="font-serif text-lg sm:text-xl text-[var(--color-brand-100)]">
            Montant net estimé
          </span>
          <span className="font-serif text-2xl sm:text-3xl text-[var(--color-brand-300)]">
            {formatCurrency(Math.max(0, calc.netEstimate))}
          </span>
        </div>
      </div>
    </motion.section>
  );
}

function LineRow({ item }: { item: LineItem }) {
  const isBase = item.tone === "base";
  const isMuted = item.tone === "muted";
  return (
    <li className="flex items-start justify-between gap-4 px-5 py-3.5">
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-sm ${isBase ? "font-medium text-[var(--color-brand-100)]" : "text-[var(--color-ink)]"}`}>
            {item.label}
          </span>
          {item.estimated && (
            <span className="text-[9px] uppercase tracking-wider text-[var(--color-gold-soft)] bg-[var(--color-gold)]/10 px-1.5 py-0.5 rounded-full">
              estimé
            </span>
          )}
        </div>
        {item.note && <p className="text-xs text-[var(--color-muted-2)] mt-1 leading-relaxed">{item.note}</p>}
      </div>
      <span
        className={`shrink-0 text-sm tabular-nums ${
          isBase
            ? "font-medium text-[var(--color-brand-100)]"
            : isMuted
            ? "text-[var(--color-muted-2)]"
            : "text-rose-400"
        }`}
      >
        {isBase
          ? formatCurrency(item.amount)
          : isMuted
          ? "—"
          : `− ${formatCurrency(Math.abs(item.amount))}`}
      </span>
    </li>
  );
}

// ─────────────────────────────────────────────────────────────
// Points « à valider »
// ─────────────────────────────────────────────────────────────
function Assumptions({ calc }: { calc: CalcResult }) {
  if (!calc.assumptions.length) return null;
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="mt-8 rounded-2xl bg-[var(--color-gold)]/[0.07] border border-[var(--color-gold)]/25 p-5 sm:p-6"
    >
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-4 h-4 text-[var(--color-gold-soft)]" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M10 2 L18 18 L2 18 Z" strokeLinejoin="round" />
          <path d="M10 8 V13 M10 15.5 V15.6" strokeLinecap="round" />
        </svg>
        <p className="text-[11px] uppercase tracking-wider text-[var(--color-gold-soft)]">
          À valider — hypothèses du calcul
        </p>
      </div>
      <ul className="space-y-2">
        {calc.assumptions.map((a, i) => (
          <li key={i} className="flex gap-2.5 text-sm text-[var(--color-ink)] leading-relaxed">
            <span className="shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-[var(--color-gold)]" />
            {a}
          </li>
        ))}
      </ul>
    </motion.section>
  );
}

function CapitalGainNote({ note }: { note: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mt-6 rounded-2xl bg-[var(--color-brand-500)]/[0.06] border border-[var(--color-brand-400)]/20 p-5 sm:p-6"
    >
      <p className="text-[11px] uppercase tracking-wider text-[var(--color-brand-300)] mb-1.5">
        Fiscalité — gain en capital
      </p>
      <p className="text-sm text-[var(--color-ink)] leading-relaxed">{note}</p>
    </motion.section>
  );
}

// ─────────────────────────────────────────────────────────────
// Prochaines étapes + insight marché
// ─────────────────────────────────────────────────────────────
function NextSteps({ steps }: { steps: { title: string; description: string }[] }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="mt-12"
    >
      <h3 className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted-2)] mb-5">
        Tes prochaines étapes
      </h3>
      <ol className="space-y-3">
        {steps.map((s, i) => (
          <li key={i} className="glass-card rounded-2xl p-4 sm:p-5 flex gap-4">
            <span className="
              shrink-0 w-8 h-8 rounded-full
              bg-gradient-to-br from-[var(--color-brand-500)] to-[var(--color-brand-700)]
              flex items-center justify-center font-serif text-white text-sm
              shadow-[0_6px_18px_-4px_var(--color-brand-shadow)]
            ">
              {i + 1}
            </span>
            <div>
              <p className="font-medium text-[var(--color-brand-100)]">{s.title}</p>
              <p className="text-sm text-[var(--color-muted)] mt-1 leading-relaxed">{s.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </motion.section>
  );
}

function MarketInsight({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="mt-8 rounded-2xl bg-gradient-to-br from-[var(--color-brand-500)]/10 to-[var(--color-brand-700)]/10 border border-[var(--color-brand-400)]/20 p-5 sm:p-6"
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0 w-9 h-9 rounded-full bg-[var(--color-brand-500)]/20 flex items-center justify-center">
          <svg className="w-4 h-4 text-[var(--color-brand-300)]" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3 17 L7 11 L11 14 L17 5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M13 5 H17 V9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-wider text-[var(--color-brand-300)] mb-1.5">
            Marché de la {BROKER.region}
          </p>
          <p className="text-sm sm:text-base text-[var(--color-brand-100)] leading-relaxed">{text}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// Teaser (gated) — ce qu'on débloque
// ─────────────────────────────────────────────────────────────
function LockedTeaser({ calc }: { calc: CalcResult }) {
  const items = calc.lineItems.filter((l) => l.tone === "deduction").length;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="mt-10 text-center"
    >
      <p className="text-sm text-[var(--color-muted)] leading-relaxed max-w-md mx-auto">
        Débloque le détail complet : le calcul ligne par ligne ({items} postes de frais),
        les points à valider et tes prochaines étapes personnalisées avec {BROKER.name}.
      </p>
    </motion.div>
  );
}

function QuickOnlyCta({ verdict, onRestart }: { verdict: NetVerdict; onRestart: () => void }) {
  const line =
    verdict === "tres_confortable"
      ? "Bonne nouvelle : ton net s'annonce solide. Emmanuel peut confirmer la vraie valeur marchande et sécuriser ce montant."
      : verdict === "analyse_humaine"
      ? "Ton cas a plusieurs variables. Emmanuel — courtier et ancien comptable — peut clarifier ton vrai montant net."
      : "Certains frais peuvent changer ton net final. Emmanuel peut valider les vrais chiffres avec toi, sans engagement.";
  return (
    <div className="mt-10">
      <p className="text-center text-sm sm:text-base text-[var(--color-muted)] leading-relaxed max-w-md mx-auto">
        {line}
      </p>
      <BrokerCta label="Valider mon montant net avec Emmanuel" />
      <RestartLink onRestart={onRestart} />
    </div>
  );
}

function BrokerCta({ label }: { label: string }) {
  return (
    <motion.a
      href={`tel:${BROKER.phoneTel}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="
        mt-8 w-full inline-flex items-center justify-center gap-2
        px-6 py-4 rounded-full text-base font-medium
        bg-gradient-to-b from-[var(--color-brand-500)] to-[var(--color-brand-700)]
        text-white no-underline
        shadow-[0_15px_40px_-10px_var(--color-brand-shadow)]
        hover:shadow-[0_20px_50px_-10px_var(--color-brand-shadow-strong)]
        transition-all
      "
    >
      {label}
      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path
          d="M3.5 4.5C3.5 4 4 3.5 4.5 3.5H7L8.5 7L6.5 8.5C7.5 11 9 12.5 11.5 13.5L13 11.5L16.5 13V15.5C16.5 16 16 16.5 15.5 16.5C9 16.5 3.5 11 3.5 4.5Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </motion.a>
  );
}

function ConfirmationBlock({ stored, firstName }: { stored: boolean; firstName: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`
        mt-12 rounded-3xl p-6 sm:p-8
        ${stored
          ? "bg-gradient-to-br from-emerald-500/12 to-transparent border border-emerald-600/25"
          : "bg-gradient-to-br from-[var(--color-gold)]/10 to-transparent border border-[var(--color-gold)]/30"}
      `}
    >
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 10L8 14L16 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p className="font-serif text-xl sm:text-2xl text-[var(--color-brand-100)]">
          Merci {firstName}, ton analyse complète est débloquée.
        </p>
      </div>
      <p className="text-sm sm:text-base text-[var(--color-ink)] leading-relaxed">
        {stored ? (
          <>
            {BROKER.name} te joindra sous peu pour valider ton vrai montant net et répondre à tes
            questions — sans engagement.
          </>
        ) : (
          <>
            Ton détail complet s&apos;affiche ci-dessous. Quand tu voudras confirmer les vrais
            chiffres, contacte {BROKER.name}.
          </>
        )}
      </p>
    </motion.div>
  );
}

function RestartLink({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="mt-6 text-center">
      <button
        onClick={onRestart}
        className="text-xs text-[var(--color-muted-2)] hover:text-[var(--color-brand-300)] transition-colors"
      >
        Refaire mon calcul
      </button>
    </div>
  );
}

function Footer({
  generatedBy,
  onRestart,
  hideRestart,
}: {
  generatedBy: "claude" | "fallback";
  onRestart: () => void;
  hideRestart?: boolean;
}) {
  return (
    <div className="mt-12 mb-24 sm:mb-12 text-center">
      {!hideRestart && (
        <button
          onClick={onRestart}
          className="text-sm text-[var(--color-muted)] hover:text-[var(--color-brand-300)] transition-colors underline underline-offset-4 decoration-white/20 hover:decoration-[var(--color-brand-400)]"
        >
          Refaire mon calcul
        </button>
      )}
      <p className="mt-6 text-[10px] text-[var(--color-muted-2)] uppercase tracking-[0.2em]">
        Estimation {generatedBy === "claude" ? "assistée par l'IA" : "déterministe"} · {BROKER.name} ·{" "}
        {BROKER.region}
      </p>
    </div>
  );
}
