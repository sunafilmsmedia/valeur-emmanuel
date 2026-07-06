import type { Answers } from "./types";

export type QuestionId =
  | "propertyType"
  | "region"
  | "estimatedValue"
  | "mortgageBalance"
  | "mortgageType"
  | "penalty"
  | "commission"
  | "prepCosts"
  | "localizationCert"
  | "legalFees"
  | "residenceType"
  | "purchasePrice"
  | "majorRenos"
  | "objective"
  | "desiredNet";

export type QuestionKind =
  | "choice"
  | "currency"
  | "region"
  | "mortgageBalance"
  | "penalty"
  | "commission"
  | "legal"
  | "purchasePrice";

export interface Choice<V extends string = string> {
  value: V;
  label: string;
  hint?: string;
}

export interface QuestionDef {
  id: QuestionId;
  kind: QuestionKind;
  title: string;
  subtitle?: string;
  choices?: Choice[];
  autoAdvance?: boolean;
  showIf?: (a: Answers) => boolean;
}

export const QUESTIONS: QuestionDef[] = [
  {
    id: "propertyType",
    kind: "choice",
    title: "Quel type de propriété veux-tu vendre ?",
    subtitle: "Ça influence les frais, les documents et les ajustements.",
    autoAdvance: true,
    choices: [
      { value: "maison", label: "Maison unifamiliale", hint: "Détachée ou jumelée" },
      { value: "condo", label: "Condo", hint: "Copropriété" },
      { value: "plex", label: "Plex", hint: "Duplex, triplex, multilogement" },
      { value: "maisonville", label: "Maison de ville" },
      { value: "chalet", label: "Chalet / propriété secondaire" },
      { value: "autre", label: "Autre" },
    ],
  },
  {
    id: "region",
    kind: "region",
    title: "Dans quel secteur est située ta propriété ?",
    subtitle: "Touche un marqueur sur la carte de la Rive-Sud.",
  },
  {
    id: "estimatedValue",
    kind: "currency",
    title: "À combien penses-tu pouvoir la vendre aujourd'hui ?",
    subtitle: "Pas besoin d'être exact — Emmanuel validera avec une vraie analyse du marché.",
  },
  {
    id: "mortgageBalance",
    kind: "mortgageBalance",
    title: "Combien reste-t-il environ sur ton hypothèque ?",
    subtitle: "C'est ici que le vrai calcul commence.",
  },
  {
    id: "mortgageType",
    kind: "choice",
    title: "Ton hypothèque est de quel type ?",
    subtitle: "Pour estimer — ou au moins signaler — une pénalité possible.",
    autoAdvance: true,
    choices: [
      { value: "fixe", label: "Taux fixe" },
      { value: "variable", label: "Taux variable" },
      { value: "ouverte", label: "Ouverte", hint: "Aucune pénalité en général" },
      { value: "none", label: "Je n'ai plus d'hypothèque" },
      { value: "unknown", label: "Je ne sais pas" },
    ],
  },
  {
    id: "penalty",
    kind: "penalty",
    title: "Connais-tu ta pénalité pour rembourser avant la fin du terme ?",
    subtitle: "La pénalité peut faire une vraie différence sur ton net.",
    showIf: (a) => a.mortgageType !== "none",
    choices: [
      { value: "know", label: "Oui, je la connais" },
      { value: "estimate", label: "Non, je veux une estimation approximative" },
      { value: "none", label: "Je n'aurai pas de pénalité" },
      { value: "unknown", label: "Je ne sais pas" },
    ],
  },
  {
    id: "commission",
    kind: "commission",
    title: "Veux-tu inclure une commission de courtage dans le calcul ?",
    subtitle: "La TPS (5 %) et la TVQ (9,975 %) s'ajoutent sur la commission.",
    choices: [
      { value: "standard", label: "Oui, utilise une estimation standard", hint: "≈ 5 % + taxes" },
      { value: "custom", label: "Oui, j'ai déjà un pourcentage en tête" },
      { value: "none", label: "Non, je veux voir sans commission" },
      { value: "unknown", label: "Je ne sais pas" },
    ],
  },
  {
    id: "prepCosts",
    kind: "choice",
    title: "Penses-tu devoir investir avant de vendre ?",
    subtitle: "Préparer la propriété peut changer le prix — et le net.",
    autoAdvance: true,
    choices: [
      { value: "none", label: "Rien ou presque", hint: "0 $" },
      { value: "cleaning", label: "Petit ménage / retouches", hint: "≈ 1 000 $" },
      { value: "paint", label: "Peinture ou réparations mineures", hint: "≈ 3 000 $" },
      { value: "staging", label: "Home staging", hint: "≈ 7 500 $" },
      { value: "renos", label: "Rénovations plus importantes", hint: "≈ 15 000 $ +" },
      { value: "unknown", label: "Je ne sais pas" },
    ],
  },
  {
    id: "localizationCert",
    kind: "choice",
    title: "Ton certificat de localisation est-il récent ?",
    subtitle: "S'il est vieux ou incertain, on ajoute une estimation à valider.",
    autoAdvance: true,
    choices: [
      { value: "recent", label: "Oui, il est récent" },
      { value: "old", label: "Non, il est vieux" },
      { value: "unknown", label: "Je ne sais pas" },
      { value: "na", label: "Ne s'applique pas / condo" },
    ],
  },
  {
    id: "legalFees",
    kind: "legal",
    title: "Veux-tu inclure les frais de quittance et d'administration ?",
    subtitle: "Par défaut, on utilise une estimation conservatrice et modifiable.",
    choices: [
      { value: "standard", label: "Oui, ajoute une estimation standard" },
      { value: "known", label: "Oui, je connais le montant" },
      { value: "none", label: "Non" },
      { value: "unknown", label: "Je ne sais pas" },
    ],
  },
  {
    id: "residenceType",
    kind: "choice",
    title: "Cette propriété est-elle ta résidence principale ?",
    subtitle: "Important pour la fiscalité et un gain en capital éventuel.",
    autoAdvance: true,
    choices: [
      { value: "principal", label: "Oui, résidence principale" },
      { value: "rental", label: "Non, propriété locative" },
      { value: "partial", label: "Une partie est louée" },
      { value: "secondary", label: "Propriété secondaire / chalet" },
      { value: "unknown", label: "Je ne sais pas" },
    ],
  },
  {
    id: "purchasePrice",
    kind: "purchasePrice",
    title: "Combien avais-tu payé la propriété à l'achat ?",
    subtitle: "Utile surtout si ce n'est pas ta résidence principale à 100 %. Facultatif.",
  },
  {
    id: "majorRenos",
    kind: "choice",
    title: "As-tu investi dans des rénovations majeures depuis l'achat ?",
    subtitle: "Ça peut réduire un gain en capital imposable — à valider avec ton comptable.",
    autoAdvance: true,
    choices: [
      { value: "none", label: "Non" },
      { value: "under_10", label: "Oui, moins de 10 000 $" },
      { value: "10_25", label: "10 000 $ à 25 000 $" },
      { value: "25_50", label: "25 000 $ à 50 000 $" },
      { value: "over_50", label: "50 000 $ +" },
      { value: "unknown", label: "Je ne sais pas" },
    ],
  },
  {
    id: "objective",
    kind: "choice",
    title: "Pourquoi veux-tu savoir combien il te resterait ?",
    subtitle: "Ça nous aide à te donner le bon prochain pas.",
    autoAdvance: true,
    choices: [
      { value: "buy_bigger", label: "Acheter plus grand" },
      { value: "buy_smaller", label: "Acheter plus petit" },
      { value: "move_rivesud", label: "Déménager sur la Rive-Sud" },
      { value: "change_city", label: "Changer de ville" },
      { value: "cash_profit", label: "Encaisser le profit" },
      { value: "pay_debts", label: "Rembourser des dettes" },
      { value: "curious", label: "Je suis juste curieux" },
    ],
  },
  {
    id: "desiredNet",
    kind: "choice",
    title: "Combien aimerais-tu qu'il te reste, au minimum ?",
    subtitle: "Pour te donner un verdict plus intelligent.",
    autoAdvance: true,
    choices: [
      { value: "under_50", label: "Moins de 50 000 $" },
      { value: "50_100", label: "50 000 $ à 100 000 $" },
      { value: "100_200", label: "100 000 $ à 200 000 $" },
      { value: "200_400", label: "200 000 $ à 400 000 $" },
      { value: "over_400", label: "400 000 $ +" },
      { value: "unknown", label: "Je ne sais pas" },
    ],
  },
];

export function getVisibleQuestions(answers: Answers): QuestionDef[] {
  return QUESTIONS.filter((q) => !q.showIf || q.showIf(answers));
}

export function isAnswered(q: QuestionDef, a: Answers): boolean {
  switch (q.id) {
    case "propertyType":
      return !!a.propertyType;
    case "region":
      return !!a.region;
    case "estimatedValue":
      return typeof a.estimatedValue === "number" && a.estimatedValue > 0;
    case "mortgageBalance":
      // Répondu si un montant est saisi OU si « je ne suis pas certain » est coché.
      return a.mortgageBalanceUnknown === true || typeof a.mortgageBalance === "number";
    case "mortgageType":
      return !!a.mortgageType;
    case "penalty":
      // « Oui, je la connais » exige un montant.
      if (a.penaltyKnowledge === "know") return typeof a.penaltyAmount === "number";
      return !!a.penaltyKnowledge;
    case "commission":
      // « J'ai un pourcentage en tête » exige un %.
      if (a.commissionPreference === "custom") return typeof a.commissionRate === "number";
      return !!a.commissionPreference;
    case "prepCosts":
      return !!a.prepCosts;
    case "localizationCert":
      return !!a.localizationCert;
    case "legalFees":
      if (a.legalFees === "known") return typeof a.legalFeesAmount === "number";
      return !!a.legalFees;
    case "residenceType":
      return !!a.residenceType;
    case "purchasePrice":
      // Facultatif — on peut toujours avancer.
      return true;
    case "majorRenos":
      return !!a.majorRenos;
    case "objective":
      return !!a.objective;
    case "desiredNet":
      return !!a.desiredNet;
  }
}
