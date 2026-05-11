import type { LancementPhase } from './types.js';

export const PLAN_LANCEMENT_90J: LancementPhase[] = [
  {
    phase: 'Phase 0 — Fondations (Semaines 1–2)',
    duree: '2 semaines',
    objectifs: [
      'Déposer trademark OMPIC + EUIPO (classes 3 + 35)',
      'Ouvrir compte bancaire professionnel Maroc',
      'Signer accord CMO avec Skin Lab Morocco',
      'Démarrer dossier CMI (paiement en ligne Maroc)',
      'Désigner Responsible Person EU (cabinet France)',
      'Réserver domaine routines.fr + SSL',
      'Initialiser dossier IMANOR Halal',
    ],
    responsables: ['legal', 'finance', 'produit'],
    livrables: [
      'Reçu dépôt OMPIC + EUIPO',
      'Contrat CMO signé',
      'Compte bancaire pro actif',
      'Brief formulation finalisé',
    ],
    budget: 40000, // MAD
  },
  {
    phase: 'Phase 1 — Construction (Semaines 3–6)',
    duree: '4 semaines',
    objectifs: [
      'Lancer formulation des 6 SKUs (CMO)',
      'Designer identité visuelle (logo, palette, packaging)',
      'Construire le site Shopify (pages essentielles)',
      'Configurer Klaviyo + séquences email de base',
      'Identifier et contacter 8 micro-influenceurs pour gifting',
      'Produire 10 premiers contenus fondateurs (brief photo/vidéo)',
      'Démarrer CPNP France + dossier DMP Maroc',
    ],
    responsables: ['produit', 'brand', 'ecommerce', 'marketing', 'legal'],
    livrables: [
      'Formules en test stabilité (6 SKUs)',
      'Charte graphique validée',
      'Site Shopify en mode "Coming Soon"',
      'Liste influenceurs validée',
      '10 contenus créés',
    ],
    budget: 85000, // MAD
  },
  {
    phase: 'Phase 2 — Pré-lancement (Semaines 7–10)',
    duree: '4 semaines',
    objectifs: [
      'Recevoir et valider le stock de production (QC)',
      'Envoi kits presse + influenceurs (J-30)',
      'Ouvrir liste d\'attente (waitlist) sur le site',
      'Configurer paiement CMI + Amana COD sur Shopify',
      'Lancer les contenus fondateurs sur Instagram + TikTok',
      'Tester Meta Ads avec 3 000 MAD (A/B créatifs)',
      'Obtenir 20 beta-testers locaux + collecter avis',
      'Activer programme ambassadeur early-access',
    ],
    responsables: ['operations', 'marketing', 'brand', 'ecommerce', 'customer'],
    livrables: [
      'Stock 300u × 6 SKUs validé QC',
      'Kits envoyés à 8 influenceurs',
      'Waitlist 500+ emails',
      'Paiement fonctionnel (test end-to-end)',
      'ROAS test Meta > 1.5',
    ],
    budget: 55000, // MAD
  },
  {
    phase: 'Phase 3 — LANCEMENT (Semaines 11–12)',
    duree: '2 semaines',
    objectifs: [
      'Ouvrir le shop routines.fr (J1)',
      'Email blast à la waitlist (offre early-bird -10%)',
      'Contenu influenceurs live (coordonner simultanément)',
      'Activer Meta Ads scaler (ROAS > 2.5 confirmé)',
      'Traitement commandes en temps réel (< 24h expédition)',
      'Support WhatsApp actif (9h–20h)',
      'Monitoring NPS et avis en temps réel',
    ],
    responsables: ['coordinator', 'marketing', 'operations', 'customer'],
    livrables: [
      '150+ commandes J1–J14',
      'Zéro rupture de stock semaine 1',
      'NPS premier retour > 60',
      '10 000+ vues organiques Instagram',
    ],
    budget: 20000, // MAD (marketing activation)
  },
  {
    phase: 'Phase 4 — Optimisation post-lancement (M2–M3)',
    duree: '6 semaines',
    objectifs: [
      'Analyser data J1–J30 : CA, CAC, ROAS, CVR, top SKUs',
      'Ajuster budget marketing selon canaux performants',
      'Lancer le Quiz Peau sur le site (Shopify + Klaviyo)',
      'Activer programme "Club Routines" (fidélité)',
      'Ouvrir routines.fr pour la France (si CPNP obtenu)',
      'Passer commande réassort stock (si sell-through > 70%)',
      'Collecter 50 avis authentiques (email automatique)',
      'Préparer campagne Ramadan (si dans la période)',
    ],
    responsables: ['coordinator', 'marche', 'ecommerce', 'marketing', 'customer', 'finance'],
    livrables: [
      'Dashboard KPIs opérationnel (hebdo)',
      'Quiz peau live avec >8% taux de capture email',
      'Break-even atteint ou tracé clairement',
      '300+ commandes cumulées',
      'CA M3 > 150 000 MAD',
    ],
    budget: 30000, // MAD
  },
];

export const JALONS_CRITIQUES = [
  { semaine: 1, jalon: 'Trademark déposé OMPIC + EUIPO', bloquant: true },
  { semaine: 2, jalon: 'CMO signé + formulation démarrée', bloquant: true },
  { semaine: 4, jalon: 'CPNP France notifié', bloquant: true },
  { semaine: 6, jalon: 'Site Shopify "Coming Soon" live + waitlist active', bloquant: false },
  { semaine: 8, jalon: 'Stock reçu + QC validé', bloquant: true },
  { semaine: 9, jalon: 'Kits influenceurs envoyés (J-30)', bloquant: false },
  { semaine: 10, jalon: 'Paiement CMI fonctionnel + test commande réussie', bloquant: true },
  { semaine: 11, jalon: '🚀 LANCEMENT OFFICIEL routines.fr', bloquant: false },
  { semaine: 16, jalon: 'Break-even mensuel atteint (M3)', bloquant: false },
  { semaine: 24, jalon: 'Certification Halal IMANOR obtenue', bloquant: false },
];

export const BUDGET_TOTAL_90J = PLAN_LANCEMENT_90J.reduce((sum, phase) => sum + phase.budget, 0);
