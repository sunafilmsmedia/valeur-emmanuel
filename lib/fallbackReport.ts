import type {
  Answers,
  CalcResult,
  NetVerdict,
  PropertyType,
  Report,
  ReportStep,
} from "./types";
import { BROKER } from "./broker";
import { formatCurrency } from "./format";
import { REGIONS } from "./regions";

const VERDICT_HEADLINE: Record<NetVerdict, string> = {
  tres_confortable: "Un montant net confortable se dessine",
  a_optimiser: "Vendable — mais certains frais peuvent tout changer",
  frais_caches: "Attention : ton net pourrait être plus bas que prévu",
  analyse_humaine: "Ton cas mérite une analyse personnalisée",
};

const VERDICT_SUMMARY: Record<NetVerdict, string> = {
  tres_confortable:
    "Selon tes réponses, la vente pourrait te laisser un montant net solide après les frais. La prochaine étape logique : valider la vraie valeur marchande de ta propriété avec Emmanuel.",
  a_optimiser:
    "Tu pourrais vendre, mais certains frais peuvent faire une grosse différence sur le montant final. Une bonne stratégie de prix et de préparation pourrait améliorer ton net vendeur.",
  frais_caches:
    "Ton montant net pourrait être plus bas que prévu. Avant de prendre une décision, mieux vaut valider la pénalité hypothécaire, les frais de vente et la vraie valeur marchande.",
  analyse_humaine:
    "Ton cas dépend de plusieurs variables : hypothèque, fiscalité, type de propriété ou usage locatif. Emmanuel — courtier et ancien comptable — peut t'aider à clarifier le vrai montant net.",
};

const PROPERTY_LABEL: Record<PropertyType, string> = {
  maison: "maison unifamiliale",
  condo: "condo",
  plex: "plex",
  maisonville: "maison de ville",
  chalet: "chalet / propriété secondaire",
  autre: "propriété",
};

function regionName(id?: string): string {
  return REGIONS.find((r) => r.id === id)?.name ?? BROKER.region;
}

// Étape 1 — toujours : valider la vraie valeur marchande.
function marketStep(answers: Answers): ReportStep {
  return {
    title: "Étape 1 — Valider la vraie valeur marchande",
    description: `Emmanuel fait une analyse comparative récente à ${regionName(
      answers.region
    )} pour remplacer ton estimation par un prix réaliste. C'est le chiffre qui fait bouger tout le reste du calcul.`,
  };
}

// Étape 2 — la plus grande incertitude qui reste (hypothèque ou pénalité).
function uncertaintyStep(answers: Answers, calc: CalcResult): ReportStep {
  if (calc.flags.includes("mortgage_unknown")) {
    return {
      title: "Étape 2 — Confirmer ton solde hypothécaire",
      description:
        "Ton montant net dépend directement du solde qu'il reste à rembourser. Un simple relevé de ta banque permet de fixer ce chiffre précisément.",
    };
  }
  if (calc.lineItems.some((l) => l.key === "penalty" && l.estimated)) {
    return {
      title: "Étape 2 — Confirmer ta pénalité hypothécaire",
      description:
        "La pénalité pour rembourser avant la fin du terme est estimée ici. Ta banque peut te donner le montant exact — ça peut représenter plusieurs milliers de dollars.",
    };
  }
  return {
    title: "Étape 2 — Optimiser tes frais de vente",
    description:
      "On révise ensemble chaque poste (commission, préparation, frais légaux) pour garder le maximum dans tes poches sans nuire au prix de vente.",
  };
}

// Étape 3 — préparation, fiscalité ou stratégie de prix selon le cas.
function strategyStep(answers: Answers, calc: CalcResult): ReportStep {
  const prep = answers.prepCosts;
  if (prep === "staging" || prep === "renos" || prep === "paint") {
    return {
      title: "Étape 3 — Préparer la propriété au bon niveau",
      description:
        "On cible les investissements qui rapportent le plus par dollar avant la mise en marché — sans surinvestir. Objectif : hausser le prix net, pas juste dépenser.",
    };
  }
  if (calc.capitalGain?.applies) {
    return {
      title: "Étape 3 — Clarifier ta situation fiscale",
      description:
        "Comme ce n'est pas ta résidence principale à 100 %, un gain en capital peut s'appliquer. L'avantage d'Emmanuel : ancien comptable, il peut cadrer la question avant que tu voies ton comptable.",
    };
  }
  return {
    title: "Étape 3 — Fixer la bonne stratégie de prix",
    description:
      "Le prix de départ influence autant ton net que les frais. On positionne ta propriété pour attirer les bons acheteurs et protéger ta marge.",
  };
}

function brokerStep(): ReportStep {
  return {
    title: "Étape 4 — Valider ton net final avec Emmanuel",
    description:
      "Un appel avec Emmanuel Bouchard, courtier et ancien comptable sur la Rive-Sud, pour transformer cette estimation en chiffre clair et fiable — sans pression.",
  };
}

export function buildFallbackReport(answers: Answers, calc: CalcResult): Report {
  const { verdict } = calc;

  const propertyLabel = answers.propertyType
    ? PROPERTY_LABEL[answers.propertyType]
    : "propriété";

  const netLine =
    calc.salePrice > 0 && calc.netEstimate > 0
      ? ` D'après tes chiffres, il te resterait environ ${formatCurrency(
          calc.netLow
        )} à ${formatCurrency(calc.netHigh)} après les frais estimés.`
      : "";

  const summary = `${VERDICT_SUMMARY[verdict]}${netLine} Ta ${propertyLabel} à ${regionName(
    answers.region
  )} a été prise en compte.`;

  const marketInsight =
    verdict === "tres_confortable"
      ? "Sur la Rive-Sud, surtout à Brossard, les propriétés bien positionnées et bien préparées se démarquent vite. Un bon prix de départ protège ton net vendeur."
      : verdict === "frais_caches"
      ? "Sur la Rive-Sud, l'écart entre un net « estimé » et un net « réel » vient souvent de la pénalité et des frais oubliés. Les valider tôt évite les mauvaises surprises."
      : "Le marché de la Rive-Sud reste actif pour les propriétés bien préparées. La différence entre un bon et un excellent net se joue sur le prix, la préparation et les frais.";

  const steps: ReportStep[] = [
    marketStep(answers),
    uncertaintyStep(answers, calc),
    strategyStep(answers, calc),
    brokerStep(),
  ];

  return {
    headline: VERDICT_HEADLINE[verdict],
    summary,
    steps,
    marketInsight,
    cta: "Valider mon montant net avec Emmanuel",
  };
}
