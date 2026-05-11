import { AgentBase } from '../base.agent.js';
import type { AgentContext, AgentResult } from '../types.js';
import { ROUTINES_FR_BRAND, GAMMES_ROUTINES_FR, ECARTS_CULTURELS } from '../data/routines-fr.data.js';

const IDENTITE_MAROC = {
  tagline_fr: 'Ta routine. Tes racines.',
  tagline_ar: 'روتينك. جذورك.',
  tagline_darija: 'Routine dyalek. Chedda dyalek.',
  positionnement: 'La marque française clean beauty, formulée pour la femme marocaine moderne',
  territoire: 'Efficacité prouvée × Identité culturelle × Transparence des formules',
  archetype: 'Expert bienveillant + Allié culturel',
  palette_maroc: {
    primaire: '#C8963E',   // Or satiné (argan, luxe naturel)
    secondaire: '#F5F0E8', // Blanc ivoire crème
    accent: '#2C5F3E',     // Vert olive (naturel, terre)
    texte: '#1A1A1A',      // Quasi-noir (lisibilité)
  },
  motifs_visuels: ['Géométrie zellige (emballage)', 'Arabesque dorée (newsletter)', 'Goutte argan stylisée (logo secondaire)'],
  ton_communication: {
    maroc: 'Chaleureux, expert, fier de la culture marocaine, pédagogique. Darija pour l\'intimité, français pour le prestige.',
    france_diaspora: 'Moderne, identitaire, qualité française × fierté marocaine.',
  },
};

const ADAPTATION_GAMMES_MAROC = [
  {
    gamme_originale: 'Routine Matin',
    nom_maroc: 'Routine Matin Éclat',
    adaptation: 'Reformuler crème SPF30 → SPF50. Ajouter niacinamide anti-taches dans le sérum.',
    hero_produit: 'Sérum Vitamine C + Niacinamide (double action éclat + anti-taches)',
    argument_vente: 'Protège et éclaire matin après matin',
    prix_bundle_mad: 680,
  },
  {
    gamme_originale: 'Routine Soir',
    nom_maroc: 'Routine Soir Réparatrice',
    adaptation: 'Remplacer huile démaquillante par "Baume démaquillant au beurre de karité local". Intégrer story hammam.',
    hero_produit: 'Baume démaquillant au karité du Maroc (remplacement huile démaquillante)',
    argument_vente: 'Le rituel du soir inspiré du hammam, en 3 gestes',
    prix_bundle_mad: 750,
  },
  {
    gamme_originale: 'Boosts & Soins Ciblés',
    nom_maroc: 'Cures Ciblées',
    adaptation: 'Renommer "Sérum anti-taches" → produit n°1 au Maroc. Remplacer masque argile générique par masque rhassoul marocain.',
    hero_produit: 'Sérum anti-taches intensif (azelaic + kojic acid) — HÉROS MAROC',
    argument_vente: '8 semaines pour une peau sans taches visible',
    prix_bundle_mad: 450,
  },
  {
    gamme_originale: 'Kit Découverte',
    nom_maroc: 'Kit Découverte Maroc Edition',
    adaptation: 'Ajouter une eau florale rose du Maroc en bonus. Packaging édition limitée "Zellige".',
    hero_produit: 'Kit 3 essentiels + eau florale rose (bonus local)',
    argument_vente: 'Découvre ta routine en 7 jours',
    prix_bundle_mad: 249,
  },
];

export class BrandAgent extends AgentBase {
  readonly role = 'brand' as const;
  readonly domaine = 'Stratégie de Marque & Adaptation Culturelle';
  readonly expertise = [
    'Adaptation marque France → Maroc sans dilution ADN',
    'Positionnement premium accessible MENA',
    'Storytelling biculturel (FR × MA)',
    'Portfolio produits et localisation gammes',
    'Identité visuelle adaptée au marché marocain',
  ];

  constructor(contexte: AgentContext) {
    super(contexte);
  }

  analyser(): AgentResult {
    const ecartsPkg = ECARTS_CULTURELS.find(e => e.dimension === 'Packaging & Esthétique');
    const ecartsLang = ECARTS_CULTURELS.find(e => e.dimension === 'Langue & Communication');

    const analyse = `
## Stratégie de Marque — Adaptation routines.fr au Marché Marocain

### Défi Central : "Glocalization"
routines.fr possède une forte identité française (minimalisme, clean, science).
Au Maroc, cette crédibilité est un actif — à condition de **l'ancrer localement**.
L'erreur à éviter : diluer l'ADN français (perte de prestige) OU ignorer les codes marocains (rejet culturel).

**Solution** : Édition "Maroc" de routines.fr — même marque, même qualité, storytelling biculturel.

### Positionnement Maroc
> **"La rigueur scientifique française + l'efficacité des soins marocains"**

${IDENTITE_MAROC.positionnement}

**Territoire** : ${IDENTITE_MAROC.territoire}
**Archétype** : ${IDENTITE_MAROC.archetype}

### Taglines par Marché
| Marché | Tagline |
|--------|---------|
| France | "${ROUTINES_FR_BRAND.promesse_fr}" |
| Maroc (FR) | "${IDENTITE_MAROC.tagline_fr}" |
| Maroc (AR) | "${IDENTITE_MAROC.tagline_ar}" |
| Maroc (Darija) | "${IDENTITE_MAROC.tagline_darija}" |

### Identité Visuelle — Adaptation Maroc
**Palette chromique** :
- Or satiné ${IDENTITE_MAROC.palette_maroc.primaire} — évoque l'argan, luxe naturel
- Blanc ivoire ${IDENTITE_MAROC.palette_maroc.secondaire} — pureté, clean beauty
- Vert olive ${IDENTITE_MAROC.palette_maroc.accent} — naturel, confiance
- Motifs : ${IDENTITE_MAROC.motifs_visuels.join(' | ')}

**Conservation de l'emballage existant** : Ajouter un sleeve ou étiquette bilingue AR/FR + motif zellige discret.
Budget adaptation packaging : ~15 000 MAD (sleeve uniquement, sans refonte complète).

### Adaptation Gammes pour le Marché Marocain
${ADAPTATION_GAMMES_MAROC.map(g =>
  `**${g.nom_maroc}** (basé sur ${g.gamme_originale})
  - Héros produit : ${g.hero_produit}
  - Adaptation : ${g.adaptation}
  - Argument de vente : *"${g.argument_vente}"*
  - Prix bundle Maroc : ${g.prix_bundle_mad} MAD`
).join('\n\n')}

### Ton de Communication
**Maroc** : ${IDENTITE_MAROC.ton_communication.maroc}
**Diaspora France** : ${IDENTITE_MAROC.ton_communication.france_diaspora}

**Règle d'or** : Les posts Instagram = français élégant. Les Reels TikTok = darija naturelle.
Les deux publics sont ciblés avec leurs codes respectifs.

### Architecture de Marque
\`\`\`
MBF Cosmétique (maison — Maroc)
  └── routines.fr
        ├── Edition France (formules originales)
        └── Edition Maroc (formules adaptées + packaging bilingue)
              ├── Routine Matin Éclat (SPF50 + anti-taches)
              ├── Routine Soir Réparatrice (baume karité local)
              ├── Cures Ciblées (sérum anti-taches = héros)
              └── Kit Découverte Maroc Edition (+eau florale rose)
\`\`\`
    `.trim();

    const recommandations = [
      this.creerRecommandation(
        'NE PAS renommer la marque — exploiter "routines.fr" comme label d\'origine',
        'Le ".fr" dans le nom est un signal de qualité massive au Maroc. "Marque française" = +30% d\'intention d\'achat selon études MENA. Garder le nom exact, ajouter "by MBF Cosmétique" en sous-titre discret.',
        'fort', 'critique', 'Décision stratégique J1'
      ),
      this.creerRecommandation(
        'Créer une histoire biculturelle authentique',
        'La fondatrice/directrice MBF doit apparaître en vidéo racontant : "J\'ai découvert routines.fr à Paris et j\'ai voulu l\'adapter pour nous, pour nos peaux, notre soleil, notre culture." Ce storytelling vaut plus que n\'importe quelle pub.',
        'fort', 'critique', 'M1 (contenu fondateur)'
      ),
      this.creerRecommandation(
        'Adapter les emballages avec sleeve bilingue zellige — budget minimal',
        `${ecartsPkg?.action ?? 'Adapter le packaging'}. Un sleeve cartonné autour du flacon existant = coût ~3 MAD/unité, impression Casablanca. Légal + esthétique + local. Pas de refonte complète.`,
        'fort', 'haute', 'M2 (avant production)'
      ),
      this.creerRecommandation(
        'Positionner le sérum anti-taches comme n°1 au Maroc (pas en France)',
        'En France, ce produit est "boost ciblé". Au Maroc, il doit être le produit héros en vitrine, en tête de gondole, premier cité dans les pubs. Adapter TOUTE la communication locale sur ce produit.',
        'fort', 'critique', 'Brief marketing M1'
      ),
      this.creerRecommandation(
        'Créer une édition limitée "Ramadan" chaque année',
        'Coffret cadeau routines.fr "Collection Nuit du Ramadan" : 3 soins dans une boîte dorée avec verset calligraphié. Prix : 399–499 MAD. Vendre exclusivement J-14 avant Ramadan. Tout part en 72h.',
        'fort', 'haute', 'Premier Ramadan après lancement'
      ),
    ];

    const kpis = [
      this.creerKPI('Reconnaissance marque "routines.fr" (sondage Casablanca)', 15, '%', 'M6'),
      this.creerKPI('Association "qualité française + soin marocain"', 60, '% sondage', 'M9'),
      this.creerKPI('Taux engagement Instagram Maroc', 5.5, '%', 'M3'),
      this.creerKPI('UGC organiques #routinesfr Maroc', 300, 'posts', 'M6'),
      this.creerKPI('Part du sérum anti-taches dans les ventes', 35, '%', 'M3'),
    ];

    this.envoyerMessage('marketing', 'Brief créatif Maroc',
      'Ton darija pour TikTok, français pour Instagram. Héros = sérum anti-taches. Storytelling fondatrice = pièce maîtresse. Kit Découverte = produit d\'entrée premier achat.',
      { adaptation_gammes: ADAPTATION_GAMMES_MAROC.map(g => g.nom_maroc) });
    this.envoyerMessage('produit', 'Adaptation packaging',
      `Sleeve bilingue AR/FR à créer. Motif zellige doré. ${ecartsLang?.action ?? ''}. Budget : 15 000 MAD.`,
      {});

    return this.creerResultat(analyse, recommandations, kpis, [
      'Ne jamais traduire le nom "routines.fr" en arabe — le nom français est l\'actif principal.',
      'Éviter les clichés orientalistes (trop de motifs, rose partout) : rester minimaliste avec touche locale subtile.',
      'Tester les taglines darija sur 20 femmes cibles avant diffusion — certaines formulations peuvent sonner faux.',
    ]);
  }
}
