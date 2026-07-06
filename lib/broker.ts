// Identité du courtier — SEUL fichier à modifier pour changer de courtier.
// (Voir aussi : lib/regions.ts, app/globals.css @theme, /public, variables Vercel.)
//
// ⚠️ À COMPLÉTER par Emmanuel avant la mise en ligne : phoneDisplay, phoneTel,
//    email, agency, website (et déposer une photo dans /public si souhaité).
export const BROKER = {
  name: "Emmanuel Bouchard",
  title: "Courtier immobilier",
  // Angle marketing : ancien comptable → estimation claire et chiffrée.
  credential: "Ancien comptable",
  experience: "7+ ans d'expérience",
  agency: "", // ex. « RE/MAX … » — à confirmer
  region: "Rive-Sud",
  specialty: "Rive-Sud · Brossard",
  // ⚠️ PLACEHOLDER — remplacer par le vrai numéro d'Emmanuel.
  phoneDisplay: "450 000-0000",
  phoneTel: "+14500000000",
  // ⚠️ PLACEHOLDER — remplacer par le vrai courriel.
  email: "emmanuel.bouchard@example.com",
  website: "",
  slogan: "Des chiffres clairs, pas juste un prix de vente.",
  // Initiales affichées si aucune photo n'est fournie dans /public.
  initials: "EB",
  // Photo du courtier (dans /public). Vide = fallback sur les initiales.
  photo: "",
  // Cadrage object-position de la photo dans l'avatar rond (focus visage).
  photoPosition: "50% 22%",
} as const;
