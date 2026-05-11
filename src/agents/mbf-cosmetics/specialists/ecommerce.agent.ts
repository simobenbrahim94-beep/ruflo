import { AgentBase } from '../base.agent.js';
import type { AgentContext, AgentResult } from '../types.js';

const STACK_TECHNIQUE = {
  plateforme: 'Shopify (Basic → Shopify plan à M3 si CA > 50K MAD/mois)',
  theme: 'Dawn (gratuit) customisé ou Impulse (~180 USD, DTC optimisé)',
  paiement_maroc: ['CMI (Carte Maroc Interbancaire)', 'CashPlus / M-Wallet', 'Amana COD (intégration Shopify)'],
  paiement_france: ['Stripe (Visa/MC/Apple Pay)', 'PayPal', 'Klarna (Buy Now Pay Later)'],
  analytics: ['Google Analytics 4', 'Meta Pixel', 'Hotjar (heatmaps)'],
  email: ['Klaviyo (intégration Shopify native, freemium jusqu\'à 500 contacts)'],
  seo: ['Shopify SEO + Blog natif', 'Schema.org produits', 'Sitemap auto'],
};

const PAGES_ESSENTIELLES = [
  { page: 'Accueil', priorite: 'Critique', elements: 'Hero routines, quiz peau CTA, bestsellers, preuves sociales' },
  { page: 'Collection "Ma Routine"', priorite: 'Critique', elements: 'Filtre type de peau, bundle Routine complète' },
  { page: 'Fiche Produit', priorite: 'Critique', elements: 'Photo 360°, INCI, Origine ingrédient (vidéo QR), avis, FAQ' },
  { page: 'Quiz Peau', priorite: 'Haute', elements: '5 questions, résultat = bundle personnalisé + email capture' },
  { page: 'Notre Histoire', priorite: 'Haute', elements: 'Fondateurs, coopérative Argan, mission halal/clean' },
  { page: 'Blog Routines', priorite: 'Haute', elements: 'Articles SEO, guides routine, explications ingrédients' },
];

const TAUX_CONVERSION_BENCHMARKS = {
  ecommerce_beaute_moyen: 2.2,
  avec_quiz_peau: 5.8,
  avec_avis_clients: 3.4,
  mobile_optimise: 3.1,
  objectif_routines_fr: 3.0,
};

const SEQUENCES_EMAIL = [
  { nom: 'Bienvenue', declencheur: 'Inscription', emails: 3, objectif: 'Onboarding + première commande' },
  { nom: 'Abandon panier', declencheur: 'Panier abandonné 1h', emails: 3, objectif: 'Récupérer 15% des paniers' },
  { nom: 'Post-achat', declencheur: 'Commande confirmée J0', emails: 4, objectif: 'Satisfaction + cross-sell' },
  { nom: 'Rétention 60j', declencheur: '60j sans commande', emails: 2, objectif: 'Réactivation avec offre' },
  { nom: 'Anniversaire', declencheur: '1 an client', emails: 1, objectif: 'Fidélisation + offre spéciale' },
];

export class EcommerceAgent extends AgentBase {
  readonly role = 'ecommerce' as const;
  readonly domaine = 'E-commerce & Expérience Digitale';
  readonly expertise = [
    'Shopify DTC setup & optimisation',
    'Conversion Rate Optimization (CRO)',
    'Paiement multimarché MA/FR',
    'Email marketing automation',
    'SEO e-commerce beauté',
  ];

  constructor(contexte: AgentContext) {
    super(contexte);
  }

  analyser(): AgentResult {
    const analyse = `
## E-commerce & Digital — routines.fr

### Stack Technique Recommandée
- **Plateforme** : ${STACK_TECHNIQUE.plateforme}
- **Thème** : ${STACK_TECHNIQUE.theme}
- **Paiements Maroc** : ${STACK_TECHNIQUE.paiement_maroc.join(' | ')}
- **Paiements France** : ${STACK_TECHNIQUE.paiement_france.join(' | ')}
- **Analytics** : ${STACK_TECHNIQUE.analytics.join(' | ')}
- **Email** : ${STACK_TECHNIQUE.email[0]}

### Pages Prioritaires
| Page | Priorité | Éléments Clés |
|------|---------|---------------|
${PAGES_ESSENTIELLES.map(p => `| ${p.page} | ${p.priorite} | ${p.elements} |`).join('\n')}

### Benchmarks Taux de Conversion
| Scénario | CVR |
|---------|-----|
${Object.entries(TAUX_CONVERSION_BENCHMARKS).map(([k, v]) =>
  `| ${k.replace(/_/g, ' ')} | ${v}% |`
).join('\n')}

→ **Quiz Peau = levier x2.6 vs moyenne** : priorité M2.

### Séquences Email Automation (Klaviyo)
${SEQUENCES_EMAIL.map(s =>
  `- **${s.nom}** (${s.declencheur}) : ${s.emails} emails → ${s.objectif}`
).join('\n')}

### Architecture URL SEO
- /collections/routine-argan → routine-eclat-argan
- /collections/routine-rhassoul → routine-purifiant-rhassoul
- /pages/quiz-peau → Recommandation personnalisée
- /blogs/routines → Guide beauté + SEO long-tail

### Optimisations Mobile (70%+ du trafic)
- AMP / Mobile-first Shopify Dawn
- Bouton "Ajouter au panier" fixe en bas d\'écran
- Paiement en 1 clic (Apple Pay / Google Pay)
- Images WebP < 100ko chacune
    `.trim();

    const recommandations = [
      this.creerRecommandation(
        'Ouvrir Shopify avec CMI + Amana COD en semaine 1',
        'Sans paiement en ligne marocain et COD, vous perdez 80% des clients Maroc. CMI = cartes bancaires marocaines. Délai intégration CMI : 2–4 semaines (dossier banque).',
        'fort', 'critique', 'Semaine 1–3',
        ['Compte bancaire professionnel (Maroc) ouvert', 'Numéro SIRET si Shopify France']
      ),
      this.creerRecommandation(
        'Créer le "Quiz Peau" en M2 (Shopify + Klaviyo)',
        'Un quiz 5 questions (type peau, préoccupations, habitudes) recommande une routine et capture l\'email. Taux de conversion 5.8% vs 2.2% sans quiz.',
        'fort', 'haute', 'M2'
      ),
      this.creerRecommandation(
        'Configurer la séquence abandon panier dès J1',
        'Sequence 3 emails : J+1h (rappel), J+24h (témoignage), J+72h (offre -10%). Récupère en moyenne 15–20% des paniers abandonnés. ROI immédiat.',
        'fort', 'haute', 'J1'
      ),
      this.creerRecommandation(
        'Créer des bundles "Routine Complète" avec remise 15%',
        'Les bundles augmentent le panier moyen de 40–60%. "Routine Argan Éclat Complète" (sérum + crème + nettoyant) à prix bundle. Configurer en produit distinct Shopify.',
        'fort', 'haute', 'J1'
      ),
      this.creerRecommandation(
        'Installer Hotjar pour comprendre le comportement visiteurs',
        'Heatmaps + enregistrements sessions = comprendre où les visiteurs bloquent. Gratuit jusqu\'à 35 sessions/jour. Analyser après 500 sessions = M1/M2.',
        'moyen', 'moyenne', 'M1'
      ),
    ];

    const kpis = [
      this.creerKPI('Taux de conversion site', 3.0, '%', 'M3'),
      this.creerKPI('Panier moyen Shopify', 310, 'MAD', 'M3'),
      this.creerKPI('Taux d\'email capture (quiz/popup)', 8, '%', 'M3'),
      this.creerKPI('Taux de récupération abandon panier', 15, '%', 'M2'),
      this.creerKPI('Page speed score (mobile)', 85, '/100', 'M1'),
    ];

    this.envoyerMessage('marketing', 'Pixels + Tracking prêts',
      'Meta Pixel + GA4 configurés sur Shopify. Flux catalogue produits Meta prêt. Klaviyo connecté. Partager les audiences lookalike dès 100 achats.',
      {});

    return this.creerResultat(analyse, recommandations, kpis, [
      'CMI Maroc : le dossier d\'intégration prend 2–4 semaines. Démarrer immédiatement.',
      'Mobile-first absolument : 72% du trafic beauté Maroc vient du mobile.',
      'Ne pas lancer le site sans politique retour visible et conditions de livraison claires.',
    ]);
  }
}
