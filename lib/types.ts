// ───────────────────────────────────────────────────────────────
// Calculateur Net Vendeur — Emmanuel Bouchard (Rive-Sud)
// Le cœur de l'app : estimer le montant net qu'il reste au vendeur
// après hypothèque, pénalité, commission + taxes et frais de vente.
// ───────────────────────────────────────────────────────────────

export type PropertyType =
  | "maison" // Maison unifamiliale
  | "condo"
  | "plex" // Duplex, triplex, multilogement
  | "maisonville" // Maison de ville
  | "chalet" // Chalet / propriété secondaire
  | "autre";

export type MortgageType =
  | "fixe" // Taux fixe → pénalité IRD potentiellement élevée
  | "variable" // Taux variable → ~3 mois d'intérêts
  | "ouverte" // Hypothèque ouverte → aucune pénalité
  | "none" // Je n'ai plus d'hypothèque
  | "unknown"; // Je ne sais pas

export type PenaltyKnowledge =
  | "know" // Oui, je la connais → montant fourni
  | "estimate" // Non, je veux une estimation approximative
  | "none" // Je n'aurai pas de pénalité
  | "unknown"; // Je ne sais pas

export type CommissionPreference =
  | "standard" // Utilise une estimation standard (5 %)
  | "custom" // J'ai déjà un pourcentage en tête → % fourni
  | "none" // Je veux voir sans commission
  | "unknown"; // Je ne sais pas

export type PrepCosts =
  | "none" // Rien ou presque
  | "cleaning" // Petit ménage / retouches
  | "paint" // Peinture ou réparations mineures
  | "staging" // Home staging
  | "renos" // Rénovations plus importantes
  | "unknown"; // Je ne sais pas

export type LocalizationCert =
  | "recent" // Oui, il est récent
  | "old" // Non, il est vieux
  | "unknown" // Je ne sais pas
  | "na"; // Ne s'applique pas / condo

export type LegalFees =
  | "standard" // Oui, ajoute une estimation standard
  | "known" // Oui, je connais le montant → montant fourni
  | "none" // Non
  | "unknown"; // Je ne sais pas

export type ResidenceType =
  | "principal" // Résidence principale
  | "rental" // Propriété locative
  | "partial" // Une partie est louée
  | "secondary" // Propriété secondaire / chalet
  | "unknown"; // Je ne sais pas

export type MajorRenos =
  | "none" // Non
  | "under_10" // Moins de 10 000 $
  | "10_25" // 10 000 $ à 25 000 $
  | "25_50" // 25 000 $ à 50 000 $
  | "over_50" // 50 000 $ +
  | "unknown"; // Je ne sais pas

export type Objective =
  | "buy_bigger" // Acheter plus grand
  | "buy_smaller" // Acheter plus petit
  | "move_rivesud" // Déménager sur la Rive-Sud
  | "change_city" // Changer de ville
  | "cash_profit" // Encaisser le profit
  | "pay_debts" // Rembourser des dettes
  | "curious"; // Je suis juste curieux → pas un lead commercial

export type DesiredNet =
  | "under_50" // Moins de 50 000 $
  | "50_100" // 50 000 $ à 100 000 $
  | "100_200" // 100 000 $ à 200 000 $
  | "200_400" // 200 000 $ à 400 000 $
  | "over_400" // 400 000 $ +
  | "unknown"; // Je ne sais pas

export type Region = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

export interface Answers {
  propertyType?: PropertyType;
  region?: string;
  estimatedValue?: number; // Prix de vente estimé
  mortgageBalance?: number; // Solde hypothécaire (exact ou approximatif)
  mortgageBalanceUnknown?: boolean; // « Je ne suis pas certain »
  mortgageType?: MortgageType;
  penaltyKnowledge?: PenaltyKnowledge;
  penaltyAmount?: number; // Si penaltyKnowledge === "know"
  commissionPreference?: CommissionPreference;
  commissionRate?: number; // En %, si commissionPreference === "custom" (ex. 5)
  prepCosts?: PrepCosts;
  localizationCert?: LocalizationCert;
  legalFees?: LegalFees;
  legalFeesAmount?: number; // Si legalFees === "known"
  residenceType?: ResidenceType;
  purchasePrice?: number; // Prix d'achat initial (gain en capital)
  majorRenos?: MajorRenos;
  objective?: Objective;
  desiredNet?: DesiredNet;
}

// Verdicts affichés (le ton du résultat) :
//   tres_confortable : net solide, atteint l'objectif, peu d'incertitudes
//   a_optimiser      : vendable, mais certains frais font une vraie différence
//   frais_caches     : net plus bas que prévu — attention aux frais
//   analyse_humaine  : cas à variables (fiscalité, locatif, hypothèque floue)
export type NetVerdict =
  | "tres_confortable"
  | "a_optimiser"
  | "frais_caches"
  | "analyse_humaine";

export interface LineItem {
  key: string;
  label: string;
  // Montant signé : positif = base (prix de vente), négatif = déduction.
  amount: number;
  tone: "base" | "deduction" | "muted";
  // Note contextuelle (ex. « estimation à valider », fourchette).
  note?: string;
  // true = valeur estimée par le logiciel (pas saisie par l'utilisateur).
  estimated?: boolean;
}

export interface CalcResult {
  verdict: NetVerdict;
  salePrice: number;
  lineItems: LineItem[];
  totalDeductions: number;
  netEstimate: number;
  netLow: number; // Scénario prudent (pénalité / frais hauts)
  netHigh: number; // Scénario favorable
  // Notes « à valider » générées dynamiquement selon les réponses.
  assumptions: string[];
  // Signaux de complexité (fiscalité, inconnues) pour le verdict + le narratif.
  flags: string[];
  metrics: {
    feesPct: number; // Frais de vente (hors hypothèque) / prix de vente
    equityLabel: string;
    desiredFloor: number | null; // Seuil « net minimum souhaité »
    meetsGoal: boolean | null;
  };
  capitalGain?: {
    applies: boolean;
    note: string;
  };
}

export interface ReportStat {
  label: string;
  value: string;
  detail: string;
}

export interface ReportStep {
  title: string;
  description: string;
}

// Narratif (généré par Claude ou fallback déterministe). Les CHIFFRES viennent
// toujours de CalcResult, jamais du modèle.
export interface Report {
  headline: string;
  summary: string;
  steps: ReportStep[];
  marketInsight: string; // Marché Rive-Sud
  cta: string;
}

export interface AnalyzeResponse {
  calc: CalcResult;
  report: Report;
  generatedBy: "claude" | "fallback";
}

// net_vendeur : lead qualifié qui a demandé son analyse complète.
export type LeadType = "net_vendeur";

export interface LeadPayload {
  name: string;
  phone?: string;
  email: string;
  consent: boolean;
  answers: Answers;
  leadType?: LeadType;
}
