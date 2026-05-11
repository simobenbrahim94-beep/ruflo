import { AgentBase } from '../base.agent.js';
import type { AgentContext, AgentResult } from '../types.js';

const BRAND_IDENTITY = {
  nom: 'routines.fr',
  maison: 'MBF Cosmétique',
  tagline: 'Ta routine. Tes racines.',
  promesse: 'Des routines simples, efficaces, ancrées dans le meilleur du soin marocain',
  valeurs: ['Efficacité prouvée', 'Héritage marocain modernisé', 'Formules clean & halal', 'Accessibilité premium'],
  personnalite: 'Chaleureuse, experte, moderne, fière de ses origines',
  archetype: 'Le Sage bienveillant + Le Créateur', // brand archetypes
};

const GAMMES_HERO = [
  {
    nom: 'Routine Argan Éclat',
    description: 'Système complet en 3 étapes à l\'argan bio du Sous',
    skus: ['Huile argan sérum', 'Crème jour SPF30', 'Nettoyant doux'],
    prix_cible_mad: [290, 320, 180],
    prix_cible_eur: [28, 31, 17],
  },
  {
    nom: 'Routine Rhassoul Purifiant',
    description: 'Détox hebdomadaire inspiré du rituel hammam',
    skus: ['Masque rhassoul argileux', 'Eau florale rose', 'Beurre post-masque'],
    prix_cible_mad: [250, 160, 230],
    prix_cible_eur: [24, 15, 22],
  },
  {
    nom: 'Routine Essence Légère (Travel)',
    description: 'Kit découverte formats 30ml — idéal acquisition',
    skus: ['Mini kit 3 produits'],
    prix_cible_mad: [199],
    prix_cible_eur: [19],
  },
];

export class BrandAgent extends AgentBase {
  readonly role = 'brand' as const;
  readonly domaine = 'Stratégie de Marque & Identité';
  readonly expertise = [
    'Architecture de marque DTC',
    'Positionnement premium accessible',
    'Storytelling culturel MENA',
    'Naming & identité visuelle',
    'Portfolio produits et gammes',
  ];

  constructor(contexte: AgentContext) {
    super(contexte);
  }

  analyser(): AgentResult {
    const analyse = `
## Stratégie de Marque — routines.fr by MBF Cosmétique

### Positionnement
> **"La marque de référence des routines beauté modernes, portée par le savoir-faire marocain authentique"**

- **Territoire** : Rituel × Science × Identité
- **Vs Typology** : Typology vend des actifs, routines.fr vend un **système de soin ancré dans une culture**
- **Vs marques locales** : Plus moderne, digital-first, formules clean certifiées
- **Vs L'Oréal** : Proximité culturelle, éthique, storytelling authentique

### Architecture de Marque
\`\`\`
MBF Cosmétique (maison)
  └── routines.fr (marque 1 — soin visage/corps)
       ├── Gamme Argan Éclat (héroïne)
       ├── Gamme Rhassoul Purifiant (rituel hebdo)
       └── Gamme Essence Légère (kit acquisition)
\`\`\`

### Identité Visuelle (directives)
- **Palette** : Terre ocre + Blanc ivoire + Or mat + Vert sauge
- **Typographie** : Serif élégant (FR) + Arabic calligraphique (MA)
- **Packagaing** : Verre givré recyclable + étiquettes papier Kraft certifié
- **Logo** : Symbole zellige géométrique + police minuscule douce

### Gammes Hero au Lancement
${GAMMES_HERO.map(g => `**${g.nom}** — ${g.description}
  - SKUs : ${g.skus.join(' | ')}
  - Prix Maroc : ${g.prix_cible_mad.join(' / ')} MAD
  - Prix France : ${g.prix_cible_eur.join(' / ')} EUR`).join('\n\n')}

### Stratégie de Lancement
- Lancer 1 gamme hero + kit discovery en J1 → éviter la dilution
- Raconter l'histoire des ingrédients via Instagram Reels & TikTok
- Collaborations avec 5-8 micro-influenceurs (15K–80K) avant le lancement officiel
    `.trim();

    const recommandations = [
      this.creerRecommandation(
        'Lancer avec 1 gamme hero uniquement (Argan Éclat)',
        'Concentrer toute la communication sur la gamme Argan Éclat les 90 premiers jours. Une marque se construit sur un produit emblématique, pas sur un catalogue.',
        'fort', 'critique', 'J1 – M3'
      ),
      this.creerRecommandation(
        'Créer le "Passeport Origine" pour chaque ingrédient',
        'QR code sur le packaging menant à une vidéo courte montrant la coopérative/producteur marocain. Différenciateur fort + traçabilité = confiance.',
        'fort', 'haute', 'M2'
      ),
      this.creerRecommandation(
        'Produire 20 contenus fondateurs avant le lancement',
        'Vidéos "La routine en 3 étapes", "L\'argan de notre coopérative", "Pourquoi halal = plus sûr". Ces contenus seront boosted ads + SEO permanent.',
        'fort', 'critique', 'M1 (pré-lancement)'
      ),
      this.creerRecommandation(
        'Déposer la marque routines.fr en France + Maroc',
        'OMPIC (Maroc) + EUIPO (classe 3 cosmétiques). Budget estimé : 800 EUR + 3 000 MAD. Non négociable avant tout investissement marketing.',
        'fort', 'critique', 'Semaine 1'
      ),
      this.creerRecommandation(
        'Kit presse pour 30 journalistes & influenceurs',
        'Boîte premium avec lettre personnalisée, 3 produits, carte "Origine de chaque ingrédient". Envoi J-30 avant lancement officiel.',
        'fort', 'haute', 'M2 (J-30)'
      ),
    ];

    const kpis = [
      this.creerKPI('Notoriété spontanée (Casablanca, Rabat)', 5, '%', 'M6'),
      this.creerKPI('Taux d\'engagement Instagram', 4.5, '%', 'M3'),
      this.creerKPI('UGC (contenus générés utilisateurs)', 200, 'posts/mois', 'M6'),
      this.creerKPI('Taux rétention marque (repeat purchase)', 35, '%', 'M6'),
    ];

    this.envoyerMessage('marketing', 'Brief créatif validé',
      'Identité visuelle : palette ocre/ivoire/or, storytelling ingrédient, lancement mono-gamme Argan Éclat. Besoin : 20 contenus fondateurs M1.',
      { gamme_hero: GAMMES_HERO[0] });
    this.envoyerMessage('produit', 'SKUs prioritaires',
      'Lancer en premier : huile argan sérum + crème jour SPF30 + nettoyant doux (gamme Argan Éclat) + Kit discovery.',
      { skus: GAMMES_HERO.map(g => g.skus).flat() });

    return this.creerResultat(analyse, recommandations, kpis, [
      'Éviter la dispersion : ne pas lancer plus de 6 SKUs en Y1.',
      'Nom routines.fr : vérifier disponibilité domaine + trademark FR/MA avant communications publiques.',
    ]);
  }
}
