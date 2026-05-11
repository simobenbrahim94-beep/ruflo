import { AgentBase } from '../base.agent.js';
import type { AgentContext, AgentResult } from '../types.js';

const CANAUX_PRIORITAIRES = {
  instagram: { budget_pct: 35, objectif: 'Brand awareness + UGC + trafic', format: 'Reels + Stories + Posts' },
  tiktok: { budget_pct: 25, objectif: 'Acquisition rapide Gen Z', format: 'Routines vidéo 30–60s' },
  meta_ads: { budget_pct: 20, objectif: 'Conversion + retargeting', format: 'Catalogue + Vidéo + Dynamic' },
  email_sms: { budget_pct: 10, objectif: 'Rétention + LTV', format: 'Séquences onboarding + abandon panier' },
  seo_contenu: { budget_pct: 10, objectif: 'Acquisition organique long terme', format: 'Blog routines + mots-clés' },
};

const INFLUENCEURS_STRATEGIE = {
  tier1_micro: { abonnes: '10K–80K', nombre: 8, cout_post: '500–2000 MAD', type: 'Gifting + commission 10%' },
  tier2_mid: { abonnes: '80K–300K', nombre: 3, cout_post: '3000–8000 MAD', type: 'Partenariat payant + gifting' },
  tier3_aspirationnel: { abonnes: '300K+', nombre: 1, cout_post: '15000+ MAD', type: 'Collab capsule exclusive' },
};

const KEYWORDS_SEO = [
  { terme: 'routine visage naturelle', volume: 2400, difficulte: 'Moyenne' },
  { terme: 'soin argan marocain', volume: 1800, difficulte: 'Faible' },
  { terme: 'routine beauté simple', volume: 3600, difficulte: 'Haute' },
  { terme: 'cosmétique halal france', volume: 1200, difficulte: 'Faible' },
  { terme: 'rhassoul masque visage', volume: 900, difficulte: 'Très faible' },
];

export class MarketingAgent extends AgentBase {
  readonly role = 'marketing' as const;
  readonly domaine = 'Marketing Digital & Acquisition';
  readonly expertise = [
    'Stratégie social media MENA/France',
    'Performance marketing (Meta, Google)',
    'Influence marketing cosmétique',
    'SEO/Content marketing beauté',
    'Email/SMS automation',
  ];

  constructor(contexte: AgentContext) {
    super(contexte);
  }

  analyser(): AgentResult {
    const budget_mensuel_mad = 15000; // budget lancement conservateur
    const cac_cible_mad = 120;
    const ltv_cible_mad = 800; // 4 commandes * 200 MAD panier
    const ltv_cac_ratio = (ltv_cible_mad / cac_cible_mad).toFixed(1);

    const analyse = `
## Stratégie Marketing Digital — routines.fr

### Budget Mensuel Recommandé (Phase Lancement)
Total : ${budget_mensuel_mad.toLocaleString()} MAD/mois → ajuster à M3 selon ROAS

| Canal | Budget % | Budget MAD | Objectif |
|-------|----------|-----------|----------|
${Object.entries(CANAUX_PRIORITAIRES).map(([c, d]) =>
  `| ${c} | ${d.budget_pct}% | ${Math.round(budget_mensuel_mad * d.budget_pct / 100).toLocaleString()} | ${d.objectif} |`
).join('\n')}

### Unit Economics Cibles
- **CAC cible** : ${cac_cible_mad} MAD (Maroc) / 12 EUR (France)
- **LTV cible** : ${ltv_cible_mad} MAD sur 12 mois (4 commandes)
- **LTV:CAC = ${ltv_cac_ratio}** (seuil sain = 3:1 → objectif 6:1 en Y2)
- **Payback period** : < 3 mois

### Stratégie Influenceurs
${Object.entries(INFLUENCEURS_STRATEGIE).map(([tier, data]) =>
  `**${tier.replace('_', ' ').toUpperCase()}** (${data.abonnes}) — ${data.nombre} créateurs — ${data.cout_post} — ${data.type}`
).join('\n')}

### SEO — Mots-clés prioritaires
${KEYWORDS_SEO.map(k => `- "${k.terme}" | Vol: ${k.volume}/mois | Difficulté: ${k.difficulte}`).join('\n')}

### Calendrier Contenu (90 jours)
- **Pré-lancement (J-30)** : Teasing ingrédients, behind-the-scenes, anticipation
- **Semaine lancement** : Unboxing influenceurs, tuto Routine Argan, avant/après
- **M2** : UGC repost, FAQ ingrediants, stories quiz peau
- **M3** : Programme ambassadeurs, témoignages clients, Ramadan content plan

### Automation Email/SMS
1. Welcome séquence (J0, J3, J7) — Histoire MBF + Guide routine
2. Abandon panier (1h, 24h) — Rappel + témoignage
3. Post-achat (J7, J30) — Satisfaction + cross-sell
4. Réactivation (J90 sans achat) — Offre exclusive
    `.trim();

    const recommandations = [
      this.creerRecommandation(
        'Lancer les contenus pré-lancement J-30 avant ouverture du shop',
        'Créer 20 contenus fondateurs (Reels "routine en 3 étapes", vidéos coopérative, ASMR application produit). Objectif : 2 000 abonnés organiques avant J1.',
        'fort', 'critique', 'M1 (pré-lancement)'
      ),
      this.creerRecommandation(
        'Tester Meta Ads avec 3 000 MAD avant de scaler',
        'A/B tester 3 créatifs (vidéo routine, avant/après, ingrédient origin). Scaler uniquement si ROAS > 2.5. Ne jamais augmenter le budget sans validation.',
        'fort', 'haute', 'M1'
      ),
      this.creerRecommandation(
        'Activer 5 micro-influenceurs en gifting avant le lancement',
        'Envoyer kits 1 mois avant. Brief précis : montrer "ma routine avec routines.fr", mentionner halal/clean, taguer @routines.fr. Pas de script, authenticité.',
        'fort', 'critique', 'J-30'
      ),
      this.creerRecommandation(
        'Créer un programme "Ambassadeurs Routines"',
        'Recrutement de 50 clientes satisfaites (après M1) → code promo personnalisé 15% → commission 10% sur ventes. CAC nul, LTV x2.',
        'fort', 'haute', 'M2'
      ),
      this.creerRecommandation(
        'Créer un "Quiz Peau" sur le site pour personnaliser la routine',
        'Le quiz (5 questions) donne une recommandation de routine personnalisée. Taux de conversion 3x supérieur selon benchmarks DTC beauté.',
        'fort', 'haute', 'M2'
      ),
    ];

    const kpis = [
      this.creerKPI('ROAS (Return on Ad Spend)', 3.5, 'x', 'M3'),
      this.creerKPI('CAC moyen (Maroc)', 120, 'MAD', 'M3'),
      this.creerKPI('Taux d\'engagement Instagram', 5, '%', 'M3'),
      this.creerKPI('Abonnés Instagram', 10000, 'followers', 'M6'),
      this.creerKPI('Taux ouverture email', 35, '%', 'Continu'),
      this.creerKPI('Taux conversion site', 2.8, '%', 'M3'),
    ];

    this.envoyerMessage('ecommerce', 'Intégration marketing site',
      'Besoin Quiz peau M2, popups email capture, tracking Meta Pixel + Google Analytics, flux produit Meta Catalog. Partager accès Shopify Analytics.',
      { canaux: Object.keys(CANAUX_PRIORITAIRES) });

    return this.creerResultat(analyse, recommandations, kpis, [
      'Ne pas dépenser en publicité avant d\'avoir des avis clients et du contenu authentique.',
      'Ramadan = pic majeur : préparer campagne dédiée 6 semaines avant.',
      'TikTok Maroc : audience très réactive mais nécessite consistance (min 3 posts/semaine).',
    ]);
  }
}
