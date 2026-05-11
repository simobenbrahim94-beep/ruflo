import type { MarketData } from '../types.js';

export const MAROC_COSMETIQUES: MarketData = {
  taille: 820, // millions USD 2025 — source : AMITH + Euromonitor
  croissance: 6.8, // % CAGR — portée par digital + classe moyenne urbaine
  segments: {
    soin_peau: 38,
    maquillage: 22,
    soin_cheveux: 20,
    parfumerie: 12,
    soin_corps: 8,
  },
  concurrents: [
    {
      nom: "L'Oréal Maroc (Garnier, CeraVe, L'Oréal Paris)",
      part_marche: 18,
      positionnement: 'Mass market + premium pharmacie',
      faiblesses: ['Pas d\'adaptation culturelle', 'Distribution traditionnelle', 'Pas de DTC fort', 'Peu de storytelling local'],
    },
    {
      nom: 'The Ordinary (via import officiel et gris)',
      part_marche: 5,
      positionnement: 'Actifs scientifiques à bas prix',
      faiblesses: ['Pas halal certifié', 'Aucune adaptation locale', 'Protocole complexe pour débutantes'],
    },
    {
      nom: 'Nuxe / Vichy / La Roche-Posay (pharmacie)',
      part_marche: 8,
      positionnement: 'Premium pharmacie française',
      faiblesses: ['Canal unique (pharmacie)', 'Pas de DTC', 'Pas de présence TikTok', 'Prix élevés sans histoire locale'],
    },
    {
      nom: 'Marques locales (Karicia, Mystic Beauty, locales IG)',
      part_marche: 12,
      positionnement: 'Prix accessible, local, digital',
      faiblesses: ['Formulations basiques', 'Pas de grade pharmaceutique', 'Branding faible', 'Pas de preuve clinique'],
    },
    {
      nom: 'Import gris (via revendeurs informels, Jumia gris)',
      part_marche: 25,
      positionnement: 'Prix très bas',
      faiblesses: ['Contrefaçons possibles', 'Pas de garantie', 'Pas de certification halal', 'SAV inexistant'],
    },
  ],
};

export const FRANCE_DIASPORA: MarketData = {
  taille: 45, // millions EUR — segment diaspora marocaine + consommatrices affinité culturelle
  croissance: 12.4, // % — fort vent porteur : clean beauty mainstream + identité culturelle
  segments: {
    longevity_skincare: 32, // tendance montante 2025-2026 — segment routines.fr
    anti_taches_eclat: 28, // préoccupation forte diaspora (peaux maghrébines)
    clean_halal_certified: 22,
    routine_minimaliste: 18,
  },
  concurrents: [
    {
      nom: 'Typology (DTC FR)',
      part_marche: 4,
      positionnement: 'Clean, minimaliste, actifs, DTC',
      faiblesses: ['Pas ancré culture MENA/halal', 'Formules génériques non adaptées phototype IV-VI', 'Pas de storytelling culturel'],
    },
    {
      nom: 'Seasonly (longevity FR)',
      part_marche: 2,
      positionnement: 'Clean beauty + bien-être + longévité',
      faiblesses: ['Cible européenne, pas MENA', 'Prix élevés', 'Pas de certif halal'],
    },
    {
      nom: 'Sephora / Nocibé (multi-marques)',
      part_marche: 12,
      positionnement: 'Accessibilité + tendances',
      faiblesses: ['Dilution identitaire', 'Pas de personnalisation culturelle', 'Pas de spécialiste anti-taches'],
    },
  ],
};

export const SEGMENTS_CIBLES = {
  primaire: {
    profil: 'Femme marocaine 28–45 ans, urbaine (Casablanca, Rabat, Marrakech, Fès)',
    revenus: 'Classe moyenne-haute (7 000–20 000 MAD/mois)',
    comportement: 'Digital-first, TikTok + Instagram, cherche efficacité prouvée, méfiante envers marques inconnues',
    preoccupation_n1: 'Hyperpigmentation, mélasma, taches post-soleil (68% concernées)',
    preoccupation_n2: 'Prévention anti-âge précoce (30–45 ans) + éclat du teint',
    sensibilite_halal: 'Forte (65–80% vérifient ou demandent confirmation)',
    panier_moyen: 480, // MAD
    frequence_achat: 5, // fois/an
    canal_prefere: 'D2C en ligne (COD) + Instagram DM',
    attrait_france: 'Très fort — "marque française" = signal qualité (+30% intention d\'achat)',
  },
  secondaire: {
    profil: 'Diaspora marocaine France (2.5M personnes), femmes 25–45 ans',
    revenus: 'Classe moyenne EUR (1 800–4 000 EUR/mois)',
    comportement: 'Connaît déjà routines.fr France, cherche version "pour nous" avec histoire culturelle',
    panier_moyen: 68, // EUR
    frequence_achat: 6, // fois/an
    canal_prefere: 'Site routines.fr direct + Instagram + communauté WhatsApp diaspora',
    attrait_adaptation: 'Recherche une marque qui leur ressemble — routines.fr adapté halal + anti-taches = fit parfait',
  },
  tertiaire: {
    profil: 'Femme marocaine 22–28 ans, étudiante ou jeune active',
    revenus: 'Classe moyenne (3 000–7 000 MAD/mois)',
    comportement: 'Budget serré, TikTok natif, influencée par peers, premier achat = Kit Découverte 249 MAD',
    panier_moyen: 249, // MAD (kit découverte)
    frequence_achat: 3,
    canal_prefere: 'TikTok + Instagram → COD',
    potentiel: 'Faible panier M1 mais deviendra segment primaire dans 3–5 ans',
  },
};

export const TENDANCES_MARCHE = [
  { tendance: 'Longevity Skincare (anti-âge préventif + collagène)', croissance: 42, opportunite: 'Très haute', alignement_routines_fr: 'Parfait — c\'est le cœur de la marque' },
  { tendance: 'Anti-taches & Hyperpigmentation (actifs: kojique, azélaïque, vit C)', croissance: 38, opportunite: 'Critique Maroc', alignement_routines_fr: 'Fort — à mettre en avant Maroc' },
  { tendance: 'Grade Pharmaceutique / Cosméceutique', croissance: 35, opportunite: 'Très haute', alignement_routines_fr: 'Parfait — différenciation vs marques locales' },
  { tendance: 'Halal Beauty certifié', croissance: 28, opportunite: 'Haute', alignement_routines_fr: 'À obtenir — gap actuel' },
  { tendance: 'DTC + Protocole pédagogique (routine system)', croissance: 32, opportunite: 'Très haute', alignement_routines_fr: 'Parfait — ADN de la marque' },
  { tendance: 'SPF dans la routine quotidienne (awareness croissante)', croissance: 45, opportunite: 'Haute', alignement_routines_fr: 'SPF50 = reformulation urgente Maroc' },
  { tendance: 'Contenu darija + beauté authentic Maroc (TikTok)', croissance: 68, opportunite: 'Très haute', alignement_routines_fr: 'À créer — aucun contenu darija actuellement' },
];
