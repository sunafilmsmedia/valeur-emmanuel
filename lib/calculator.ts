import type { Answers, CalcResult, LineItem, NetVerdict, PrepCosts } from "./types";
import { formatCurrency } from "./format";

// ───────────────────────────────────────────────────────────────
// Moteur de calcul du montant net vendeur.
//
// Montant net estimé =
//   Prix de vente
//   − Solde hypothécaire
//   − Pénalité hypothécaire estimée
//   − Commission de courtage
//   − TPS + TVQ sur la commission
//   − Frais de préparation à la vente
//   − Certificat de localisation (si applicable)
//   − Frais légaux / quittance / administration
//
// Principe : tous les CHIFFRES sont déterministes ici. Les estimations sont
// clairement marquées « à valider » et présentées en fourchette quand elles
// dépendent d'inconnues (ex. pénalité hypothécaire).
// ───────────────────────────────────────────────────────────────

// TPS 5 % + TVQ 9,975 % appliquées sur les SERVICES de courtage (la commission),
// pas sur le prix de vente. TPS 5 %, puis TVQ 9,975 % → 1,05 × 1,09975 − 1.
export const COMMISSION_TAX_RATE = 0.14975;

// Commission « standard » par défaut au Québec (ajustable par le vendeur).
export const DEFAULT_COMMISSION_RATE = 0.05; // 5 %

// Frais fixes estimés (conservateurs, modifiables).
const CERT_ESTIMATE = 1500; // Certificat de localisation à jour
const LEGAL_STANDARD = 1200; // Quittance + frais administratifs / notaire
const PREP_UNKNOWN = 2500; // Préparation « je ne sais pas » — hypothèse prudente

// Montants de préparation à la vente selon le niveau déclaré.
const PREP_AMOUNT: Record<PrepCosts, number> = {
  none: 0,
  cleaning: 1000,
  paint: 3000,
  staging: 7500,
  renos: 15000,
  unknown: PREP_UNKNOWN,
};

// Pénalité hypothécaire estimée, en fraction du solde. Grossier et à VALIDER
// avec la banque — sert uniquement à donner un ordre de grandeur.
//   variable : ~3 mois d'intérêts
//   fixe     : pénalité IRD (différentiel de taux) — souvent plus élevée
//   inconnu  : fourchette large mélangée
const PENALTY_FRACTION: Record<
  "fixe" | "variable" | "unknown",
  { low: number; mid: number; high: number }
> = {
  variable: { low: 0.01, mid: 0.0135, high: 0.017 },
  fixe: { low: 0.018, mid: 0.03, high: 0.045 },
  unknown: { low: 0.012, mid: 0.025, high: 0.045 },
};

// Seuil « net minimum souhaité » → borne basse de la fourchette choisie.
const DESIRED_FLOOR: Record<string, number> = {
  under_50: 25_000,
  "50_100": 50_000,
  "100_200": 100_000,
  "200_400": 200_000,
  over_400: 400_000,
};

function round(n: number): number {
  return Math.round(n);
}

interface PenaltyEstimate {
  mid: number;
  low: number;
  high: number;
  estimated: boolean; // true = estimé par le logiciel (vs fourni)
  note?: string;
}

function estimatePenalty(answers: Answers, mortgage: number): PenaltyEstimate {
  const knowledge = answers.penaltyKnowledge;
  const type = answers.mortgageType;

  // Aucune pénalité : hypothèque ouverte, remboursée, ou déclarée sans pénalité.
  if (
    knowledge === "none" ||
    type === "none" ||
    type === "ouverte"
  ) {
    return { mid: 0, low: 0, high: 0, estimated: false };
  }

  // Montant connu fourni par le vendeur.
  if (knowledge === "know" && typeof answers.penaltyAmount === "number") {
    const p = Math.max(0, answers.penaltyAmount);
    return { mid: p, low: p, high: p, estimated: false };
  }

  // Estimation. Sans solde, impossible d'estimer un montant.
  if (mortgage <= 0) {
    return { mid: 0, low: 0, high: 0, estimated: false };
  }

  const bucket =
    type === "fixe"
      ? PENALTY_FRACTION.fixe
      : type === "variable"
      ? PENALTY_FRACTION.variable
      : PENALTY_FRACTION.unknown;

  const low = round(mortgage * bucket.low);
  const high = round(mortgage * bucket.high);
  const mid = round(mortgage * bucket.mid);
  const note =
    type === "fixe"
      ? `Estimation ${formatCurrency(low)}–${formatCurrency(high)} (taux fixe, pénalité IRD) — à confirmer avec ta banque.`
      : type === "variable"
      ? `Estimation ${formatCurrency(low)}–${formatCurrency(high)} (≈ 3 mois d'intérêts) — à confirmer avec ta banque.`
      : `Estimation ${formatCurrency(low)}–${formatCurrency(high)} — à confirmer avec ta banque.`;

  return { mid, low, high, estimated: true, note };
}

function commissionRateFor(answers: Answers): { rate: number; estimated: boolean } {
  switch (answers.commissionPreference) {
    case "none":
      return { rate: 0, estimated: false };
    case "custom": {
      const r = answers.commissionRate;
      if (typeof r === "number" && r > 0) {
        // Accepte 5 (%) ou 0.05 (fraction) par prudence.
        const frac = r > 1 ? r / 100 : r;
        return { rate: frac, estimated: false };
      }
      return { rate: DEFAULT_COMMISSION_RATE, estimated: true };
    }
    case "standard":
    case "unknown":
    default:
      return { rate: DEFAULT_COMMISSION_RATE, estimated: true };
  }
}

function certEstimate(answers: Answers): number {
  // Condo / non applicable / récent → 0. Vieux ou incertain → estimation.
  if (answers.propertyType === "condo") return 0;
  switch (answers.localizationCert) {
    case "old":
    case "unknown":
      return CERT_ESTIMATE;
    case "recent":
    case "na":
    default:
      return 0;
  }
}

function legalEstimate(answers: Answers): { amount: number; estimated: boolean } {
  switch (answers.legalFees) {
    case "none":
      return { amount: 0, estimated: false };
    case "known":
      return {
        amount:
          typeof answers.legalFeesAmount === "number"
            ? Math.max(0, answers.legalFeesAmount)
            : LEGAL_STANDARD,
        estimated: typeof answers.legalFeesAmount !== "number",
      };
    case "standard":
    case "unknown":
    default:
      return { amount: LEGAL_STANDARD, estimated: true };
  }
}

function equityLabelFor(mortgage: number, salePrice: number, unknown: boolean): string {
  if (unknown || salePrice <= 0) return "À confirmer";
  const ratio = mortgage / salePrice;
  if (ratio < 0.35) return "Équité élevée";
  if (ratio < 0.6) return "Équité correcte";
  return "Équité limitée";
}

export function computeNet(answers: Answers): CalcResult {
  const salePrice = Math.max(0, answers.estimatedValue ?? 0);
  const mortgageUnknown = answers.mortgageBalanceUnknown === true;
  const mortgage =
    mortgageUnknown || answers.mortgageType === "none"
      ? 0
      : Math.max(0, answers.mortgageBalance ?? 0);

  const penalty = estimatePenalty(answers, mortgage);
  const { rate, estimated: rateEstimated } = commissionRateFor(answers);
  const commission = round(salePrice * rate);
  const commissionTax = round(commission * COMMISSION_TAX_RATE);
  const prep = PREP_AMOUNT[answers.prepCosts ?? "unknown"];
  const prepEstimated = answers.prepCosts === "unknown" || answers.prepCosts === undefined;
  const cert = certEstimate(answers);
  const legal = legalEstimate(answers);

  // ─── Postes du calcul (ordre d'affichage) ───
  const lineItems: LineItem[] = [
    { key: "salePrice", label: "Prix de vente estimé", amount: salePrice, tone: "base" },
  ];

  if (mortgage > 0) {
    lineItems.push({
      key: "mortgage",
      label: "Solde hypothécaire",
      amount: -mortgage,
      tone: "deduction",
    });
  } else if (mortgageUnknown) {
    lineItems.push({
      key: "mortgage",
      label: "Solde hypothécaire",
      amount: 0,
      tone: "muted",
      note: "À confirmer — le montant net en dépend directement.",
      estimated: true,
    });
  }

  if (penalty.mid > 0 || penalty.estimated) {
    lineItems.push({
      key: "penalty",
      label: "Pénalité hypothécaire",
      amount: -penalty.mid,
      tone: "deduction",
      note: penalty.note,
      estimated: penalty.estimated,
    });
  }

  if (commission > 0) {
    lineItems.push({
      key: "commission",
      label: `Commission de courtage${rate ? ` (${(rate * 100).toFixed(1).replace(/\.0$/, "")} %)` : ""}`,
      amount: -commission,
      tone: "deduction",
      note: rateEstimated ? "Estimation standard — ajustable selon ton entente." : undefined,
      estimated: rateEstimated,
    });
    lineItems.push({
      key: "commissionTax",
      label: "TPS + TVQ sur la commission",
      amount: -commissionTax,
      tone: "deduction",
      note: "14,975 % sur les services de courtage.",
    });
  }

  if (prep > 0) {
    lineItems.push({
      key: "prep",
      label: "Frais de préparation à la vente",
      amount: -prep,
      tone: "deduction",
      estimated: prepEstimated,
    });
  }

  if (cert > 0) {
    lineItems.push({
      key: "cert",
      label: "Certificat de localisation",
      amount: -cert,
      tone: "deduction",
      note: "Estimation si un certificat à jour est requis.",
      estimated: true,
    });
  }

  if (legal.amount > 0) {
    lineItems.push({
      key: "legal",
      label: "Frais légaux / quittance",
      amount: -legal.amount,
      tone: "deduction",
      note: legal.estimated ? "Estimation conservatrice — modifiable." : undefined,
      estimated: legal.estimated,
    });
  }

  // ─── Totaux ───
  const sellingCosts =
    penalty.mid + commission + commissionTax + prep + cert + legal.amount;
  const totalDeductions = mortgage + sellingCosts;
  const netEstimate = round(salePrice - totalDeductions);

  // Fourchette : la pénalité est la principale source de variation.
  const netLow = round(
    salePrice - (mortgage + penalty.high + commission + commissionTax + prep + cert + legal.amount)
  );
  const netHigh = round(
    salePrice - (mortgage + penalty.low + commission + commissionTax + prep + cert + legal.amount)
  );

  const feesPct = salePrice > 0 ? sellingCosts / salePrice : 0;

  // ─── Notes « à valider » ───
  const assumptions: string[] = [];
  if (rateEstimated) {
    assumptions.push("Commission estimée à 5 % + taxes — ajustable selon ton entente de courtage.");
  }
  if (penalty.estimated && penalty.note) {
    assumptions.push(`Pénalité hypothécaire : ${penalty.note}`);
  }
  if (cert > 0) {
    assumptions.push("Certificat de localisation à jour estimé (~1 500 $) si nécessaire.");
  }
  if (legal.estimated) {
    assumptions.push("Frais de quittance et administratifs estimés (~1 200 $) — à confirmer avec le notaire.");
  }
  if (prepEstimated && prep > 0) {
    assumptions.push("Frais de préparation estimés — à préciser selon l'état réel de la propriété.");
  }
  if (mortgageUnknown) {
    assumptions.push("Solde hypothécaire non confirmé — le montant net réel en dépend directement.");
  }

  // ─── Signaux de complexité ───
  const flags: string[] = [];
  const residence = answers.residenceType;
  const fiscalComplex = residence === "rental" || residence === "partial";
  if (fiscalComplex) flags.push("fiscal");
  if (residence === "secondary") flags.push("fiscal_soft");
  if (answers.propertyType === "plex") flags.push("revenue_property");
  if (mortgageUnknown) flags.push("mortgage_unknown");
  if (answers.mortgageType === "unknown") flags.push("mortgage_type_unknown");
  if (answers.penaltyKnowledge === "unknown" && mortgage > 0) flags.push("penalty_unknown");
  if (
    (answers.majorRenos === "25_50" || answers.majorRenos === "over_50") &&
    residence !== "principal" &&
    residence !== undefined
  ) {
    flags.push("capital_gain_reno");
  }

  // ─── Gain en capital ───
  const capitalGainApplies =
    residence === "rental" || residence === "partial" || residence === "secondary";
  const capitalGain = capitalGainApplies
    ? {
        applies: true,
        note:
          residence === "partial"
            ? "Une portion louée peut être imposable au gain en capital. L'ARC calcule généralement : produit de disposition − prix de base rajusté (achat + rénos majeures) − frais de vente. À valider avec ton comptable."
            : "Comme ce n'est pas ta résidence principale à 100 %, un gain en capital peut s'appliquer (produit − prix de base rajusté − frais de vente). À valider avec ton comptable.",
      }
    : undefined;

  // ─── Objectif net souhaité ───
  const desiredFloor =
    answers.desiredNet && answers.desiredNet !== "unknown"
      ? DESIRED_FLOOR[answers.desiredNet] ?? null
      : null;
  const meetsGoal = desiredFloor == null ? null : netEstimate >= desiredFloor;

  const equityLabel = equityLabelFor(mortgage, salePrice, mortgageUnknown);

  const verdict = pickVerdict({
    netEstimate,
    salePrice,
    feesPct,
    desiredFloor,
    flags,
  });

  return {
    verdict,
    salePrice,
    lineItems,
    totalDeductions,
    netEstimate,
    netLow,
    netHigh,
    assumptions,
    flags,
    metrics: { feesPct, equityLabel, desiredFloor, meetsGoal },
    capitalGain,
  };
}

function pickVerdict(args: {
  netEstimate: number;
  salePrice: number;
  feesPct: number;
  desiredFloor: number | null;
  flags: string[];
}): NetVerdict {
  const { netEstimate, salePrice, feesPct, desiredFloor, flags } = args;

  // 1. Complexité qui exige un vrai regard humain (fiscalité, hypothèque floue).
  const heavyComplexity =
    flags.includes("fiscal") ||
    flags.includes("mortgage_unknown") ||
    (flags.includes("penalty_unknown") && flags.includes("mortgage_type_unknown")) ||
    (flags.includes("revenue_property") && flags.includes("fiscal_soft"));
  if (heavyComplexity) return "analyse_humaine";

  // 2. Sans prix de vente, on ne peut pas juger le net.
  if (salePrice <= 0) return "analyse_humaine";

  // 3. Net non positif → frais cachés.
  if (netEstimate <= 0) return "frais_caches";

  const goalOk = desiredFloor == null ? true : netEstimate >= desiredFloor;
  const goalClose = desiredFloor == null ? true : netEstimate >= desiredFloor * 0.75;
  const lowCost = feesPct <= 0.09;
  const midCost = feesPct <= 0.14;

  if (goalOk && lowCost) return "tres_confortable";
  if ((goalOk && midCost) || (goalClose && lowCost)) return "a_optimiser";
  if (goalClose || midCost) return "a_optimiser";
  return "frais_caches";
}
