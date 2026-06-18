import { AgentBase } from '../base.agent.js';
import type { AgentContext, AgentResult } from '../types.js';
import { ROUTINES_FR_BRAND } from '../data/routines-fr.data.js';

// Plateformes réseaux sociaux Maroc 2025
const RESEAUX_SOCIAUX_MAROC = {
  instagram: { utilisateurs: '8.2M', taux_penetration: '22%', audience_cible: 'F 22–38 ans urbaine', usage: 'Découverte produit, before/after, flat lay, témoignages' },
  tiktok: { utilisateurs: '12.1M', taux_penetration: '32%', audience_cible: 'F 18–32 ans', usage: 'Tutos routine, darija authentique, viraux, tendances' },
  facebook: { utilisateurs: '21M', taux_penetration: '57%', audience_cible: 'F 25–45 ans toute classe', usage: 'Groupes beauté, publicités, retargeting, mères de famille' },
  youtube: { utilisateurs: '18M', taux_penetration: '48%', audience_cible: 'F 20–45 ans', usage: 'Tutoriels longs, reviews complètes, comparatifs' },
  whatsapp: { utilisateurs: '28M', taux_penetration: '75%', audience_cible: 'Toutes', usage: 'SAV, groupes clients, broadcast, partage viral' },
};

const INFLUENCEURS_MAROC = {
  tier_nano: {
    abonnes: '1K–10K', cout: 'Gifting uniquement', nombre_cibles: 20,
    profils: 'Étudiantes en pharmacie, beautystas locales, femmes actives Casablanca',
    avantage: 'Authenticité maximale, engagement 8–12%, coût quasi nul',
    activation: 'Kit gratuit + code promo unique 15%',
  },
  tier_micro: {
    abonnes: '10K–80K', cout: '500–3 000 MAD/post', nombre_cibles: 8,
    profils: 'Yousra Hdidouan, Sara Benkaddour, Sarra B (beauté clean), Chama (lifestyle Casablanca)',
    avantage: 'Reach ciblé, crédibilité forte, audience Maroc pure',
    activation: 'Partenariat payant + code promo + vidéo Routine dédiée',
  },
  tier_mid: {
    abonnes: '80K–300K', cout: '5 000–15 000 MAD/campagne', nombre_cibles: 3,
    profils: 'Profils lifestyle et beauté marocains avec audience qualifiée',
    avantage: 'Volume + notoriété, reach 100K+ garanti',
    activation: 'Collab capsule produit + vidéo longue + Stories sponsorisées',
  },
};

const CALENDRIER_MARKETING = [
  { periode: 'Pré-lancement (M1)', actions: ['Teasing Instagram "bientôt" + waitlist', 'Contact influenceurs nano + micro', 'Publication 10 contenus fondateurs', 'Test Meta Ads 3 000 MAD budget test'] },
  { periode: 'Lancement (M2)', actions: ['Email blast waitlist (-15% early-bird)', 'Posts influenceurs synchronisés', 'Reels "routine en darija" TikTok', 'Google Ads "soin anti-taches Maroc"'] },
  { periode: 'Ramadan (selon calendrier)', actions: ['Campagne "Routine Ramadan"', 'Contenu "peau éclatante pendant le jeûne"', 'Édition limitée coffret cadeau', 'WhatsApp broadcast abonnées'] },
  { periode: 'Été (juin–août)', actions: ['Campagne SPF50 "protège ton éclat"', 'Collab avec beach resorts (Agadir, Saidia)', 'TikTok challenges "mon ritual plage"'] },
  { periode: 'Rentrée (septembre)', actions: ['"Reset ta routine" (back to normal)', 'Campagne anti-taches post-été', 'Bundle routines saisonnières'] },
];

const MOTS_CLES_SEO_MAROC = [
  { terme: 'routine soin visage maroc', volume_mensuel: 3200, difficulte: 'Moyenne', langue: 'FR' },
  { terme: 'sérum anti taches naturel', volume_mensuel: 2800, difficulte: 'Faible', langue: 'FR' },
  { terme: 'crème solaire visage maroc', volume_mensuel: 4500, difficulte: 'Haute', langue: 'FR' },
  { terme: 'soin peau halal', volume_mensuel: 1900, difficulte: 'Faible', langue: 'FR' },
  { terme: 'routines fr avis maroc', volume_mensuel: 800, difficulte: 'Très faible', langue: 'FR' },
  { terme: 'كريم تفتيح الوجه', volume_mensuel: 8200, difficulte: 'Haute', langue: 'AR' },
  { terme: 'روتين العناية بالبشرة', volume_mensuel: 5600, difficulte: 'Moyenne', langue: 'AR' },
  { terme: 'كريم واقي الشمس المغرب', volume_mensuel: 3100, difficulte: 'Moyenne', langue: 'AR' },
];

export class MarketingAgent extends AgentBase {
  readonly role = 'marketing' as const;
  readonly domaine = 'Marketing Digital & Acquisition Maroc';
  readonly expertise = [
    'Stratégie social media Maroc (TikTok, Instagram, Facebook)',
    'Marketing d\'influence MENA (nano à mid-tier)',
    'Saisonnalité marocaine (Ramadan, Aïd, été)',
    'SEO bilingue FR + AR pour marché Maroc',
    'Performance marketing (Meta Ads, Google Shopping)',
  ];

  constructor(contexte: AgentContext) {
    super(contexte);
  }

  analyser(): AgentResult {
    const budget_mensuel_lancement = 18000; // MAD
    const cac_cible_mad = 110;
    const ltv_cible_mad = 850;

    const analyse = `
## Stratégie Marketing Digital — routines.fr au Maroc

### Contexte : Marque française, consommatrice marocaine
**Avantage majeur** : routines.fr est déjà crédible en France.
Au Maroc, cela se traduit en signal qualité immédiat.
**Défi** : faire connaître la marque sans budget TV, avec des consommatrices digitales mais méfiantes.

### Cartographie des Plateformes Maroc 2025
| Plateforme | Utilisateurs | Audience Cible | Usage Beauté |
|-----------|-------------|---------------|-------------|
${Object.entries(RESEAUX_SOCIAUX_MAROC).map(([p, d]) =>
  `| **${p}** | ${d.utilisateurs} | ${d.audience_cible} | ${d.usage} |`
).join('\n')}

### Stratégie par Canal (Budget ${budget_mensuel_lancement.toLocaleString()} MAD/mois)
| Canal | Budget | Objectif | Format |
|-------|--------|---------|--------|
| TikTok organique | 0 MAD | Viralité routine darija | 3 Reels/semaine |
| Instagram organique + payant | 5 000 MAD | Brand awareness + trafic | Posts + Reels + Stories ads |
| Meta Ads (FB + IG) | 7 000 MAD | Acquisition + retargeting | Vidéo produit + carrousel |
| Google Ads | 3 000 MAD | Intention d\'achat haute | Search "anti-taches" + Shopping |
| Email / SMS | 1 500 MAD | Rétention + LTV | Séquences Klaviyo |
| Influenceurs | 4 500 MAD | Crédibilité + UGC | Gifting nano + 1 micro/mois |

**Unit Economics**
- CAC cible : **${cac_cible_mad} MAD** (Maroc) / 11 EUR (France)
- LTV cible : **${ltv_cible_mad} MAD** sur 12 mois
- LTV:CAC = **${(ltv_cible_mad / cac_cible_mad).toFixed(1)}x** (objectif sain : >5x)

### Stratégie Influenceurs Maroc
${Object.entries(INFLUENCEURS_MAROC).map(([tier, d]) =>
  `**${tier.toUpperCase()}** (${d.abonnes})
  - ${d.nombre_cibles} créateurs | Coût : ${d.cout}
  - Profils : ${d.profils}
  - Avantage : ${d.avantage}
  - Activation : ${d.activation}`
).join('\n\n')}

### Calendrier Marketing (Saisonnalité Marocaine)
${CALENDRIER_MARKETING.map(p =>
  `**${p.periode}**\n${p.actions.map(a => `  - ${a}`).join('\n')}`
).join('\n\n')}

### SEO Bilingue (FR + Arabe)
Mots-clés prioritaires :
${MOTS_CLES_SEO_MAROC.map(k =>
  `- "${k.terme}" [${k.langue}] — ${k.volume_mensuel}/mois — Difficulté : ${k.difficulte}`
).join('\n')}

**Stratégie** : 2 articles/semaine en FR + 1 en AR. Blog Shopify = trafic organique permanent.

### Contenu Fondateur (20 pièces à créer avant J1)
1. Vidéo "Ma routine en 3 étapes" en darija (TikTok + Reels)
2. Vidéo fondatrice MBF : "Pourquoi j'ai ramené routines.fr au Maroc"
3. Before/after sérum anti-taches (panel test J0 → J56)
4. "Origine de l'argan" — visite coopérative Agadir (60 sec)
5. FAQ "Est-ce halal ?" — réponse transparente et documentée
6. Comparatif "France vs Maroc edition — les différences"
7. "Comment choisir ta routine selon ton type de peau" (quiz teaser)
8. Tuto "comment appliquer le sérum anti-taches correctement"
9. "Pourquoi le SPF est non-négociable au Maroc" (éducation)
10. Témoignage client beta-tester (vraie cliente Casablanca)
    `.trim();

    const recommandations = [
      this.creerRecommandation(
        'Commencer sur TikTok Maroc avec des vidéos en darija — coût zéro',
        'TikTok Maroc est sous-exploité par les marques clean beauty. Une vidéo "routine en 3 étapes" en darija authentique peut dépasser 200K vues organiquement. Recruter une créatrice de contenu darija (500–1 500 MAD/vidéo). Publier 3×/semaine minimum.',
        'fort', 'critique', 'Dès M1 (pré-lancement)'
      ),
      this.creerRecommandation(
        'Activer 20 nano-influenceurs en gifting avant le lancement',
        'Envoyer le Kit Découverte Maroc Edition (249 MAD coût) à 20 femmes influentes (1K–10K abonnés, vraies Marocaines). Brief : "montre ta vraie routine". Résultat attendu : 15–20 posts UGC organiques avant J1. Social proof avant ouverture shop.',
        'fort', 'critique', 'J-30'
      ),
      this.creerRecommandation(
        'Construire une campagne Ramadan dédiée chaque année',
        'Ramadan = pic de consommation beauté (peau sous voile, care nocturne intense, cadeaux). Créer "Routine Ramadan" avec contenu spécifique (care après iftar, lèvres hydratées sans rouge). Préparer 6 semaines avant. Budget campagne Ramadan : 15 000 MAD.',
        'fort', 'haute', 'Ramadan annuel'
      ),
      this.creerRecommandation(
        'Lancer Google Ads sur "sérum anti-taches Maroc" dès J1',
        'Intention d\'achat maximale. Budget 3 000 MAD/mois. Cibler : "sérum anti taches naturel", "crème anti taches visage maroc", "soin anti melasma halal". CPC estimé : 1.5–3 MAD. Taux conversion 4%+ sur ces mots.',
        'fort', 'haute', 'J1'
      ),
      this.creerRecommandation(
        'Créer du contenu en arabe classique pour le référencement',
        'Les requêtes arabes sur le soin anti-taches ont 3× plus de volume que les requêtes françaises. Blog bilingue (1 article AR/semaine minimum). Pas de traduction automatique — faire écrire par une rédactrice marocaine.',
        'fort', 'haute', 'M1–M2'
      ),
    ];

    const kpis = [
      this.creerKPI('ROAS Meta Ads', 3.5, 'x', 'M3'),
      this.creerKPI('CAC moyen (Maroc)', 110, 'MAD', 'M3'),
      this.creerKPI('Abonnés TikTok Maroc', 5000, 'followers', 'M3'),
      this.creerKPI('Abonnés Instagram', 12000, 'followers', 'M6'),
      this.creerKPI('Vues organiques/mois (TikTok)', 500000, 'vues', 'M3'),
      this.creerKPI('Taux ouverture email', 38, '%', 'Continu'),
      this.creerKPI('Taux conversion site Maroc', 3.2, '%', 'M3'),
    ];

    this.envoyerMessage('ecommerce', 'Intégration tracking marketing',
      'Besoin Meta Pixel + TikTok Pixel + Google Tag Manager actifs sur Shopify. Catalogue produits Meta/TikTok configuré. Suivre "Add to Cart", "Checkout", "Purchase" pour optimiser les campagnes.',
      {});
    this.envoyerMessage('customer', 'Programme ambassadeurs',
      '20 nano-influenceurs activés pré-lancement = premières ambassadrices. Basculer en programme "Club Routines" dès M2. Code promo unique par ambassadrice = tracking attribution.',
      {});

    return this.creerResultat(analyse, recommandations, kpis, [
      'TikTok Maroc : les comptes qui postent trop en français perdent l\'engagement. La darija est obligatoire pour ce canal.',
      'Meta Ads Maroc : le ciblage "intérêt cosmétiques" est large. Affiner avec "a acheté en ligne", "revenu supérieur", "Casablanca + Rabat + Marrakech".',
      'Attention au faux engagement : vérifier les stats des micro-influenceurs (ratio likes/commentaires doit être >3%).',
    ]);
  }
}
