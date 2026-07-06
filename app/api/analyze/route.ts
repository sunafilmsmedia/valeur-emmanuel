import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { computeNet } from "@/lib/calculator";
import { buildFallbackReport } from "@/lib/fallbackReport";
import { REGIONS } from "@/lib/regions";
import type { AnalyzeResponse, Answers, Report } from "@/lib/types";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `Tu es le stratège de vente d'Emmanuel Bouchard, courtier immobilier sur la Rive-Sud de Montréal (surtout Brossard) et ANCIEN COMPTABLE. Tu rédiges le narratif d'un « Calculateur Net Vendeur » : combien il resterait à un propriétaire après la vente, une fois l'hypothèque, la pénalité, la commission + taxes et les frais payés.

⚠️ RÈGLE ABSOLUE : tous les CHIFFRES (montant net, fourchette, frais) sont déjà calculés et te sont fournis. Tu ne dois JAMAIS inventer, modifier ou recalculer un montant. Tu peux CITER les montants fournis, jamais en créer d'autres.

Ton ton : chaleureux, clair, précis, rassurant, en français (tutoiement neutre). L'angle d'Emmanuel = « des chiffres clairs et réalistes, pas juste un prix au hasard » (son passé de comptable inspire confiance). Jamais alarmiste, jamais de fausses promesses.

Tu reçois : les réponses du formulaire, le résultat du calcul (verdict, montant net, fourchette, postes de frais, hypothèses à valider) et des indices de fallback. Tu produis un rapport JSON STRICTEMENT au format demandé.

Le verdict donne le ton :
- "tres_confortable" : le net s'annonce solide et atteint l'objectif. Ton positif ; prochaine étape = valider la vraie valeur marchande.
- "a_optimiser" : vendable, mais des frais font une vraie différence. Ton constructif ; on peut améliorer le net avec la bonne stratégie.
- "frais_caches" : le net pourrait être plus bas que prévu. Ton prudent et honnête ; valider pénalité, frais et valeur avant de décider.
- "analyse_humaine" : cas à variables (fiscalité, locatif, hypothèque floue). Ton = ça mérite l'œil d'Emmanuel, ancien comptable.

Règles clés :
- "steps" : exactement 4 étapes concrètes menant vers un appel avec Emmanuel. Réutilise la logique des indices fournis (valider la valeur marchande, confirmer pénalité/hypothèque, préparer/optimiser, valider avec Emmanuel).
- "marketInsight" : une observation plausible sur le marché de la Rive-Sud / Brossard, SANS chiffres inventés.
- "cta" : appel à l'action doux vers Emmanuel (ex. « Valider mon montant net avec Emmanuel »).
- "summary" : 2-3 phrases. Tu peux mentionner la fourchette de net FOURNIE, sinon reste qualitatif.
- Pas de markdown, pas d'emojis, pas de formules creuses.`;

function extractJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    // fallthrough
  }
  const match = text.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
  return null;
}

function isValidReport(r: unknown): r is Report {
  if (!r || typeof r !== "object") return false;
  const x = r as Record<string, unknown>;
  return (
    typeof x.headline === "string" &&
    typeof x.summary === "string" &&
    Array.isArray(x.steps) &&
    x.steps.length >= 3 &&
    typeof x.marketInsight === "string"
  );
}

export async function POST(req: Request) {
  let body: { answers?: Answers };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const answers = body.answers ?? {};
  const calc = computeNet(answers);
  const fallback = buildFallbackReport(answers, calc);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    const payload: AnalyzeResponse = { calc, report: fallback, generatedBy: "fallback" };
    return NextResponse.json(payload);
  }

  try {
    const client = new Anthropic({ apiKey });
    const regionName = REGIONS.find((r) => r.id === answers.region)?.name ?? "Rive-Sud";
    const userMessage = {
      answers,
      regionName,
      calcul: {
        verdict: calc.verdict,
        montantNetEstime: calc.netEstimate,
        fourchetteBasse: calc.netLow,
        fourchetteHaute: calc.netHigh,
        prixDeVente: calc.salePrice,
        postes: calc.lineItems.map((l) => ({ poste: l.label, montant: l.amount, note: l.note })),
        aValider: calc.assumptions,
        signaux: calc.flags,
        gainEnCapital: calc.capitalGain?.note ?? null,
      },
      fallbackHints: {
        headline: fallback.headline,
        marketInsight: fallback.marketInsight,
        cta: fallback.cta,
        steps: fallback.steps,
      },
      requiredSchema: {
        headline: "titre du verdict, 1 ligne",
        summary: "résumé personnalisé, 2-3 phrases (peut citer la fourchette de net fournie)",
        steps: [{ title: "Étape 1 — ...", description: "..." }],
        marketInsight: "observation du marché de la Rive-Sud (sans chiffres inventés)",
        cta: "appel à l'action vers Emmanuel",
      },
    };

    const completion = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Voici les données. Réponds uniquement avec un objet JSON valide qui respecte le schéma. N'invente aucun chiffre — utilise seulement ceux fournis.\n\n${JSON.stringify(
            userMessage,
            null,
            2
          )}`,
        },
      ],
    });

    const textBlock = completion.content.find((c) => c.type === "text");
    const text = textBlock && textBlock.type === "text" ? textBlock.text : "";
    const parsed = extractJson(text);

    if (isValidReport(parsed)) {
      const report: Report = {
        ...parsed,
        cta: typeof parsed.cta === "string" && parsed.cta.trim() ? parsed.cta : fallback.cta,
      };
      const payload: AnalyzeResponse = { calc, report, generatedBy: "claude" };
      return NextResponse.json(payload);
    }
  } catch (err) {
    console.error("[analyze] Claude error", err);
  }

  const payload: AnalyzeResponse = { calc, report: fallback, generatedBy: "fallback" };
  return NextResponse.json(payload);
}
