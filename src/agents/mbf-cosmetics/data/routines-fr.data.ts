/**
 * Données réelles de la marque routines.fr (France) — source : recherche web 2026.
 * Positionnement : Skincare clinique de longévité cutanée (NON clean beauty/bio/halal).
 * Distribution : DTC exclusif via routines.fr (pas de Sephora, pharmacies, revendeurs).
 */

export const ROUTINES_FR_BRAND = {
  nom: 'routines.fr',
  pays_origine: 'France',
  type: 'Marque DTC skincare de longévité (cosméceutique grade pharmaceutique)',

  // Positionnement réel — science-first, pas clean/bio/natural
  positionnement: 'Dermatological excellence at the service of skin\'s longevity',
  philosophie: 'Not just to diminish visible signs of aging, but to correct today while preserving tomorrow',
  concept_communaute: 'Longevity Activists — those who care for their skin with dedication, awareness, and consistency',

  // Protocole produit officiel
  protocole_4etapes: ['Prepare', 'Treat', 'Boost', 'Restore'],
  ingredient_signature: 'Longevity Complex™ — présent dans chaque sérum',
  claims_signature: [
    'Soutien à la régénération cellulaire',
    'Protection de la fonction barrière cutanée',
    'Préservation de la communication intercellulaire',
  ],

  // Produits confirmés par recherche
  produits_confirmes: [
    {
      nom: 'Collagen Boost Serum',
      type: 'Sérum collagène',
      protocole_etape: 'Boost',
      prix_eur_estime: 65,
      contains_longevity_complex: true,
    },
    {
      nom: 'Skin Beauty Collagen',
      type: 'Traitement collagène clinique',
      protocole_etape: 'Treat',
      claim_clinique: 'Fermeté, densité et vitalité visibles en 28 jours',
      prix_eur_estime: 80,
      contains_longevity_complex: true,
    },
  ],

  // Fourchette prix estimée (DTC premium cosméceutique)
  fourchette_prix_eur: { min: 40, max: 120, panier_moyen: 70 },
  fourchette_prix_mad_brut: { min: 432, max: 1296, panier_moyen: 756 },

  // Standards qualité
  qualite: [
    'Formules développées et fabriquées en France',
    'Standards cliniques de grade pharmaceutique',
    'Tests dermatologiques sur volontaires',
    'Études cliniques mesurées (28 jours)',
    'Convient aux peaux sensibles',
  ],

  // Certifications absentes — CRITIQUE pour le Maroc
  certifications_actuelles: ['Grade pharmaceutique', 'Testé dermatologiquement'],
  certifications_manquantes_maroc: [
    'Halal IMANOR (aucune mention halal dans les communications)',
    'Bio/Ecocert (positionnement scientifique, pas naturel)',
    'Déclaration DMP Maroc (obligatoire)',
    'Étiquetage bilingue AR/FR (obligation légale Maroc)',
    'Vegan/Cruelty-free certifié (non confirmé)',
  ],

  // Distribution
  canal_distribution_fr: ['Site DTC routines.fr uniquement'],
  canal_distribution_manquants_maroc: ['Site Maroc adapté', 'COD Amana', 'CMI paiement', 'WhatsApp Business'],

  // Cible France (vs cible Maroc à adapter)
  audience_fr: 'Femme 35–55 ans, urbaine, CSP+, préoccupée par la longévité cutanée et anti-âge scientifique',
  audience_maroc_cible: 'Femme 28–45 ans, urbaine (Casablanca/Rabat), classe moyenne-haute, préoccupée par anti-taches + prévention + qualité prouvée',

  forces: [
    'Crédibilité scientifique et clinique forte',
    'Label "fabriqué en France" = signal qualité premium au Maroc',
    'Protocole 4 étapes clair et pédagogique',
    'Formules testées dermatologiquement',
    'DTC = marges élevées et relation client directe',
  ],

  faiblesses_vs_maroc: [
    'Pas de certification halal (bloquant pour 65–80% des consommatrices marocaines)',
    'Prix EUR très élevés pour le marché marocain — adaptation pricing obligatoire',
    'Cible 35–55 ans (France) vs 25–40 ans dominant au Maroc',
    'Promesse "longévité" moins prioritaire que "anti-taches" au Maroc',
    'Aucune adaptation culturelle (langue, icones, storytelling)',
    'Pas de COD ni CMI — impossible de vendre au Maroc sans ça',
    'Formules testées sur phototypes européens (I–III) principalement',
    'Protocole 4 étapes complexe — à simplifier pour primo-accédantes Maroc',
    'Aucune notoriété Maroc (marque récente et discrète)',
  ],
};

// Adaptation du protocole 4 étapes pour le marché marocain
export const PROTOCOLE_MAROC = {
  original_fr: ['Prepare', 'Treat', 'Boost', 'Restore'],
  adapte_maroc_fr: ['Préparer', 'Traiter', 'Booster', 'Restaurer'],
  adapte_maroc_ar: ['التحضير', 'المعالجة', 'التعزيز', 'الاسترداد'],
  simplification_entry: {
    starter_3etapes: ['Préparer (nettoyant)', 'Traiter (sérum anti-taches)', 'Restaurer (crème SPF50)'],
    message: 'Commencer par 3 étapes — ajouter les boosters une fois la routine maîtrisée',
    produit_entree: 'Kit Découverte Maroc — étapes 1+2+3 en formats 15ml',
  },
};

// Gammes adaptées au Maroc avec données réelles de la marque
export const GAMMES_ROUTINES_FR = [
  {
    gamme: 'Routine Matin (Prepare + Restore)',
    etapes: 2,
    produits: [
      { nom: 'Nettoyant Prépare-Peau', format: '150ml', prix_eur_estime: 42, prix_mad_adapte: 299 },
      { nom: 'Crème Restauratrice SPF50 (adaptation Maroc)', format: '50ml', prix_eur_estime: 55, prix_mad_adapte: 349 },
    ],
    adaptation_maroc: {
      enjeu: 'SPF50 est non-négociable au Maroc (IUV 10–12 en été). La version française (SPF30 estimé) doit être reformulée.',
      opportunite: 'La routine matin 2 étapes est accessible même pour les débutantes. Kit d\'entrée idéal.',
      prix_bundle_mad: 549,
    },
  },
  {
    gamme: 'Traitement Anti-Taches + Éclat (Treat)',
    etapes: 1,
    produits: [
      { nom: 'Sérum Anti-Taches Longevity Complex™', format: '30ml', prix_eur_estime: 65, prix_mad_adapte: 449 },
      { nom: 'Sérum Vitamine C Éclat Longevity Complex™', format: '30ml', prix_eur_estime: 60, prix_mad_adapte: 399 },
    ],
    adaptation_maroc: {
      enjeu: 'Anti-taches = préoccupation n°1 Maroc (68% concernées). Le Longevity Complex doit prouver son efficacité sur phototypes IV–VI.',
      opportunite: 'Le sérum anti-taches devient le HÉROS de la gamme Maroc (inverse de la France où la longévité domine).',
      prix_bundle_mad: 799,
    },
  },
  {
    gamme: 'Boost Collagène (Boost)',
    etapes: 1,
    produits: [
      { nom: 'Collagen Boost Serum', format: '30ml', prix_eur_estime: 65, prix_mad_adapte: 449 },
      { nom: 'Skin Beauty Collagen (traitement)', format: '30ml', prix_eur_estime: 80, prix_mad_adapte: 549 },
    ],
    adaptation_maroc: {
      enjeu: 'Collagène = concept connu des 35–45 ans Maroc (préoccupation anti-âge). Les 25–35 ans sont moins sensibilisées.',
      opportunite: 'Éduquer les 30–40 ans sur la prévention collagène = créer une demande latente + élargir la cible.',
      prix_bundle_mad: 899,
    },
  },
  {
    gamme: 'Kit Découverte Maroc Edition',
    etapes: 0,
    produits: [
      { nom: 'Kit Starter Longevity (3 essentiels)', format: '3×15ml', prix_eur_estime: 35, prix_mad_adapte: 249 },
    ],
    adaptation_maroc: {
      enjeu: 'Prix d\'entrée critique. 249 MAD = zone impulsive pour la cible. Inclure un guide "comment démarrer ta routine".',
      opportunite: 'Premier achat = porte d\'entrée. Si résultats visibles en 14 jours → réachat garanti.',
      prix_bundle_mad: 249,
    },
  },
];

// Écarts culturels et scientifiques à combler impérativement
export const ECARTS_CULTURELS = [
  {
    dimension: 'Certification Halal',
    situation_fr: 'Non certifié halal — positionnement scientifique/pharmaceutique sans mention halal',
    situation_maroc: '65–80% des consommatrices attendent un produit halal. Sans certification, refus d\'achat ou méfiance.',
    action: 'Audit halal IMANOR avant lancement. Vérifier absence alcool >0.1% + dérivés animaux dans le Longevity Complex™.',
    urgence: 'critique',
  },
  {
    dimension: 'Repositionnement Anti-Taches vs Longévité',
    situation_fr: 'Promesse principale = longévité cutanée + anti-âge scientifique (cible 35–55 ans)',
    situation_maroc: 'Préoccupation n°1 = hyperpigmentation/taches (68% femmes urbaines). Anti-âge vient en 2ème.',
    action: 'Adapter le message Maroc : "Efface les taches, préserve la jeunesse de ta peau." Mettre le sérum anti-taches en héros n°1.',
    urgence: 'critique',
  },
  {
    dimension: 'Prix et accessibilité',
    situation_fr: 'Sérums 40–120 EUR, DTC premium, cible CSP+',
    situation_maroc: '120 EUR = 1 296 MAD = inaccessible pour 80% du marché cible. Adapter pricing : 350–550 MAD/sérum.',
    action: 'Créer une grille tarifaire MAD avec prix psychologiques. Proposer le Kit Starter à 249 MAD comme porte d\'entrée.',
    urgence: 'critique',
  },
  {
    dimension: 'SPF et protection solaire',
    situation_fr: 'SPF30 standard (ou intégré dans crème jour)',
    situation_maroc: 'IUV 10–12 en été. SPF50+ attendu par les consommatrices informées. SPF30 = image de marque insuffisante.',
    action: 'Reformuler la crème restauratrice en SPF50+ PA+++ pour l\'édition Maroc.',
    urgence: 'critique',
  },
  {
    dimension: 'Langue et communication',
    situation_fr: 'Site bilingue FR/EN, communication très scientifique et internationale',
    situation_maroc: 'Étiquetage bilingue AR/FR obligatoire légalement. Communication TikTok = darija. Instagram = français élégant.',
    action: 'Traduire INCI en arabe sur étiquettes. Créer contenu darija pour TikTok. Maintenir le français pour l\'image premium.',
    urgence: 'critique',
  },
  {
    dimension: 'Simplification du protocole',
    situation_fr: 'Protocole 4 étapes (Prepare → Treat → Boost → Restore) — audience éduquée et mature',
    situation_maroc: 'Les 25–35 ans Maroc sont moins expérimentées en protocoles multi-étapes. Risque de frustration.',
    action: 'Proposer un "Kit Starter 3 étapes" comme porte d\'entrée. Éduquer progressivement vers le protocole complet.',
    urgence: 'haute',
  },
  {
    dimension: 'Phototype et efficacité clinique',
    situation_fr: 'Tests cliniques sur volontaires (phototypes européens I–III présumés)',
    situation_maroc: 'Phototypes IV–VI dominants. Efficacité du Longevity Complex™ non documentée sur ces phototypes.',
    action: 'Retests sur panel 30 femmes marocaines (phototype IV–VI). Résultats = argument marketing local ("prouvé sur peaux marocaines").',
    urgence: 'haute',
  },
  {
    dimension: 'Notoriété Maroc (quasi nulle)',
    situation_fr: 'Marque récente, peu de presse, DTC discrète — pas d\'influenceurs identifiés',
    situation_maroc: 'Notoriété zéro. Construire la crédibilité via preuves cliniques locales + témoignages + label "France".',
    action: 'Le label "Fabriqué en France, grade pharmaceutique" est l\'actif n°1 à mettre en avant. Compenser absence notoriété par preuve d\'efficacité.',
    urgence: 'haute',
  },
  {
    dimension: 'Paiement et distribution',
    situation_fr: 'DTC exclusif, carte bancaire internationale',
    situation_maroc: 'COD = 65–70% des commandes e-com Maroc. CMI = cartes bancaires marocaines. Sans ça : 70% des clientes inaccessibles.',
    action: 'Activer Amana COD + CMI sur Shopify Maroc dès J1.',
    urgence: 'critique',
  },
];

// Grille de conversion prix FR → Maroc
export const GRILLE_PRIX_ADAPTATION = {
  taux_conversion_brut: 10.8,
  facteur_positionnement: 0.72, // Ajustement pouvoir d'achat marocain sur du premium
  note: 'Prix MAD = Prix EUR × 10.8 × 0.72, arrondi au prix psychologique',
  exemples: [
    { prix_eur: 35, prix_mad_brut: 378, prix_mad_psycho: 349 },
    { prix_eur: 42, prix_mad_brut: 454, prix_mad_psycho: 399 },
    { prix_eur: 55, prix_mad_brut: 594, prix_mad_psycho: 549 },
    { prix_eur: 65, prix_mad_brut: 702, prix_mad_psycho: 649 },
    { prix_eur: 80, prix_mad_brut: 864, prix_mad_psycho: 799 },
    { prix_eur: 120, prix_mad_brut: 1296, prix_mad_psycho: 999 },
  ],
  prix_psychologiques_maroc: [149, 199, 249, 299, 349, 399, 449, 549, 649, 799, 999],
  kit_entree: 249, // MAD — porte d'entrée psychologique
};
