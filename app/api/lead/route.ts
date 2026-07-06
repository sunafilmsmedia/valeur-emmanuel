import { NextResponse } from "next/server";
import { computeNet } from "@/lib/calculator";
import { REGIONS } from "@/lib/regions";
import type { Answers, LeadPayload, LeadType, NetVerdict } from "@/lib/types";

export const runtime = "nodejs";

interface IncomingBody extends Partial<LeadPayload> {
  answers?: Answers;
  leadType?: LeadType;
}

function splitName(full: string): { firstName: string; lastName: string } {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

const VERDICT_LABEL: Record<NetVerdict, string> = {
  tres_confortable: "Très confortable",
  a_optimiser: "Possible — à optimiser",
  frais_caches: "Attention aux frais",
  analyse_humaine: "Analyse recommandée",
};

export async function POST(req: Request) {
  let body: IncomingBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, phone, email, consent, answers } = body;
  const leadType: LeadType = body.leadType ?? "net_vendeur";

  if (!name || !email || !consent || !answers) {
    return NextResponse.json({ stored: false, error: "Missing required fields" }, { status: 400 });
  }

  const calc = computeNet(answers);
  const { firstName, lastName } = splitName(name);
  const regionName = REGIONS.find((r) => r.id === answers.region)?.name ?? "";

  // Payload aplati pour mapping GoHighLevel + données brutes en complément.
  const payload = {
    source: "emmanuel-bouchard-app",
    receivedAt: new Date().toISOString(),
    leadType,

    // Contact
    firstName,
    lastName,
    fullName: name,
    phone: phone ?? "",
    email,

    // Résultat du calcul
    verdict: calc.verdict,
    verdictLabel: VERDICT_LABEL[calc.verdict],
    netEstime: calc.netEstimate,
    netFourchetteBasse: calc.netLow,
    netFourchetteHaute: calc.netHigh,
    prixDeVente: calc.salePrice,

    // Détails propriété / réponses
    propertyType: answers.propertyType ?? "",
    region: regionName,
    regionId: answers.region ?? "",
    estimatedValue: answers.estimatedValue ?? 0,
    mortgageBalance: answers.mortgageBalanceUnknown ? "incertain" : answers.mortgageBalance ?? 0,
    mortgageType: answers.mortgageType ?? "",
    penaltyKnowledge: answers.penaltyKnowledge ?? "",
    commissionPreference: answers.commissionPreference ?? "",
    prepCosts: answers.prepCosts ?? "",
    localizationCert: answers.localizationCert ?? "",
    legalFees: answers.legalFees ?? "",
    residenceType: answers.residenceType ?? "",
    purchasePrice: answers.purchasePrice ?? 0,
    majorRenos: answers.majorRenos ?? "",
    objective: answers.objective ?? "",
    desiredNet: answers.desiredNet ?? "",

    // Signaux utiles au suivi (fiscalité, inconnues à clarifier)
    flags: calc.flags,

    // Données brutes
    lead: { name, phone, email },
    answers,
  };

  const webhookUrl = process.env.CRM_WEBHOOK_URL;
  const webhookSecret = process.env.CRM_WEBHOOK_SECRET;

  if (webhookUrl) {
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (webhookSecret) headers["X-Webhook-Secret"] = webhookSecret;
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        console.error("[lead] Webhook returned", res.status);
      }
    } catch (err) {
      console.error("[lead] Webhook failed", err);
    }
  } else {
    console.log("[lead] Stored (no webhook configured):", JSON.stringify(payload));
  }

  return NextResponse.json({ stored: true, verdict: calc.verdict, leadType });
}
