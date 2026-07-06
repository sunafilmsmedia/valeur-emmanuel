# Calculateur Net Vendeur — Emmanuel Bouchard (Rive-Sud)

App Next.js dérivée du template courtier. Promesse : « Découvre combien il te
resterait vraiment après la vente de ta propriété. »

## Ce que fait l'app
1. **Hero** → hook « Calculateur Net Vendeur » + angle Emmanuel (courtier + ancien comptable).
2. **Questionnaire** (15 questions) : type de propriété, secteur (carte Rive-Sud),
   valeur, hypothèque, pénalité, commission, préparation, certificat, frais légaux,
   usage (principal/locatif), prix d'achat, rénos, objectif, net souhaité.
3. **Calcul déterministe** du montant net (`lib/calculator.ts`) :
   `net = prix − hypothèque − pénalité − commission − (TPS+TVQ) − préparation − certificat − frais légaux`.
4. **Écran « Ton estimation est prête »** → analyse complète (capture lead) **ou** estimation rapide.
5. **Résultats** : montant net + fourchette, détail ligne par ligne, points « à valider »,
   note gain en capital (si locatif/secondaire), prochaines étapes, CTA vers Emmanuel.

### 4 verdicts
- **Très confortable** — net solide, atteint l'objectif.
- **Possible — à optimiser** — vendable, mais des frais pèsent.
- **Attention aux frais** — net plus bas que prévu.
- **Analyse recommandée** — cas à variables (fiscalité, locatif, hypothèque floue).

## ⚠️ À COMPLÉTER avant la mise en ligne

### 1. Coordonnées d'Emmanuel — `lib/broker.ts` (valeurs placeholder)
- [ ] `phoneDisplay` / `phoneTel` (actuellement `450 000-0000` — **placeholder**)
- [ ] `email` (actuellement `emmanuel.bouchard@example.com` — **placeholder**)
- [ ] `agency` (vide — ex. « RE/MAX … » si applicable)
- [ ] `website` (vide)
- [ ] Photo : déposer un fichier dans `/public` et pointer `photo` dessus (sinon initiales « EB »)

### 2. Hypothèses de calcul — `lib/calculator.ts` (à valider avec Emmanuel)
- [ ] **Commission par défaut = 5 %** (`DEFAULT_COMMISSION_RATE`). *NB : l'exemple du
  cahier des charges utilisait 4 %.* J'ai gardé 5 % (plus prudent : sous-estime le net).
  Une ligne à changer si Emmanuel veut 4 %.
- [ ] Pénalités estimées (fractions du solde) : variable ≈ 3 mois d'intérêts, fixe ≈ IRD 2–4,5 %.
- [ ] Frais fixes : certificat ~1 500 $, quittance/admin ~1 200 $, préparation par palier.
- TPS+TVQ = **14,975 %** sur la commission (fixe, correct au Québec).

### 3. Variables Vercel (par déploiement) — voir `.env.local.example`
- [ ] `ANTHROPIC_API_KEY` (optionnel — enrichit le narratif ; les chiffres restent déterministes)
- [ ] `CRM_WEBHOOK_URL` / `CRM_WEBHOOK_SECRET` (GoHighLevel — sinon leads en console)
- [ ] `NEXT_PUBLIC_META_PIXEL_ID` / `NEXT_PUBLIC_CLARITY_PROJECT_ID` (tracking — **ID propres à Emmanuel**)

### 4. Secteurs de la carte — `lib/regions.ts`
Brossard, Saint-Lambert, Longueuil, Saint-Hubert, Boucherville, Sainte-Julie,
La Prairie, Candiac, Saint-Constant, Autre Rive-Sud. À ajuster au besoin.

## Dev
```bash
npm run dev      # http://localhost:3000
npm run build    # build de production (typecheck + lint)
```

## Notes
- Thème « finance / confiance » (sarcelle + or) pour coller à l'angle ancien comptable.
  Palette dans `app/globals.css` (`@theme`) — un seul endroit à changer.
- Aucun chiffre n'est inventé par l'IA : le prompt d'`/api/analyze` interdit d'inventer
  des montants ; le modèle ne fait que rédiger le narratif autour des chiffres calculés.
