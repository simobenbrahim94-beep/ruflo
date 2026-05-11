import type { MarketData } from '../types.js';

export const MAROC_COSMETIQUES: MarketData = {
  taille: 820, // millions USD 2025
  croissance: 6.8, // % annuel
  segments: {
    soin_peau: 38,
    maquillage: 22,
    soin_cheveux: 20,
    parfumerie: 12,
    soin_corps: 8,
  },
  concurrents: [
    {
      nom: "L'Oréal Maroc",
      part_marche: 18,
      positionnement: 'Mass market + premium',
      faiblesses: ['Prix élevé', 'Peu local', 'Distribution traditionnelle'],
    },
    {
      nom: 'Nuxe / Vichy (importés)',
      part_marche: 8,
      positionnement: 'Pharmacie premium',
      faiblesses: ['Canal unique', 'Pas de digital fort', 'Hors de portée GMS'],
    },
    {
      nom: 'Brands locales (Karicia, etc.)',
      part_marche: 12,
      positionnement: 'Abordable, local',
      faiblesses: ['Branding faible', 'Pas de D2C', 'Formulations basiques'],
    },
    {
      nom: 'Import gris / non-certifié',
      part_marche: 25,
      positionnement: 'Prix bas',
      faiblesses: ['Pas de garantie', 'Pas de SAV', 'Risque légal'],
    },
  ],
};

export const FRANCE_DIASPORA: MarketData = {
  taille: 45, // segment diaspora marocaine + affinité, millions EUR
  croissance: 12.4,
  segments: {
    clean_beauty: 35,
    routine_minimaliste: 28,
    ingredients_naturels: 22,
    halal_certified: 15,
  },
  concurrents: [
    {
      nom: 'Typology',
      part_marche: 4,
      positionnement: 'Clean, minimaliste, D2C',
      faiblesses: ['Pas ancré culture MENA', 'Formules génériques'],
    },
    {
      nom: 'Sephora Collection',
      part_marche: 7,
      positionnement: 'Accessible, tendance',
      faiblesses: ['Multimarque, pas identitaire', 'Pas de storytelling culturel'],
    },
  ],
};

export const SEGMENTS_CIBLES = {
  primaire: {
    profil: 'Femme marocaine 22-38 ans, urbaine (Casablanca, Rabat, Marrakech)',
    revenus: 'Classe moyenne-haute (5 000–15 000 MAD/mois)',
    comportement: 'Digital-first, influencée par TikTok/Instagram, cherche routines claires',
    panier_moyen: 350, // MAD
    frequence_achat: 4, // fois/an
    canal_prefere: 'D2C en ligne + pop-up',
  },
  secondaire: {
    profil: 'Diaspora marocaine France (2.5M), 25-45 ans',
    revenus: 'Classe moyenne EUR',
    comportement: 'Nostalgie culturelle + conscience clean beauty',
    panier_moyen: 65, // EUR
    frequence_achat: 6,
    canal_prefere: 'routines.fr e-shop + Amazon.fr',
  },
};

export const TENDANCES_MARCHE = [
  { tendance: 'Clean Beauty Halal', croissance: 28, opportunite: 'Très haute' },
  { tendance: 'Ingrédients Marocains (Argan, Rhassoul)', croissance: 22, opportunite: 'Haute' },
  { tendance: 'Routines Minimalistes (3-5 étapes)', croissance: 35, opportunite: 'Très haute' },
  { tendance: 'Packaging Éco-responsable', croissance: 18, opportunite: 'Haute' },
  { tendance: 'Abonnement / Box Beauté', croissance: 45, opportunite: 'Haute' },
  { tendance: 'Personnalisation (quiz skin)', croissance: 52, opportunite: 'Très haute' },
];
