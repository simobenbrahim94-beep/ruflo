import { AgentBase } from '../base.agent.js';
import type { AgentContext, AgentResult } from '../types.js';
import { MAROC_COSMETIQUES, FRANCE_DIASPORA, SEGMENTS_CIBLES, TENDANCES_MARCHE } from '../data/market.data.js';

export class MarcheAgent extends AgentBase {
  readonly role = 'marche' as const;
  readonly domaine = 'Intelligence Marché & Veille Concurrentielle';
  readonly expertise = [
    'Analyse marché cosmétique Maroc/France',
    'Segmentation consommateurs MENA',
    'Benchmarking concurrentiel',
    'Tendances clean beauty & halal',
    'Sizing TAM/SAM/SOM',
  ];

  constructor(contexte: AgentContext) {
    super(contexte);
  }

  analyser(): AgentResult {
    const tam = MAROC_COSMETIQUES.taille;
    const sam = tam * 0.38; // soin peau = segment cible
    const som_y1 = sam * 0.005; // 0.5% réaliste Y1
    const som_y3 = sam * 0.025; // 2.5% avec croissance

    const analyse = `
## Analyse Marché MBF Cosmétique / routines.fr

### Marché Maroc
- **TAM** : ${tam}M USD (marché cosmétique total Maroc 2025)
- **Croissance** : ${MAROC_COSMETIQUES.croissance}% CAGR — portée par digital + classe moyenne urbaine
- **SAM** (soin peau + clean beauty) : ${sam.toFixed(0)}M USD
- **SOM Y1** : ${som_y1.toFixed(1)}M USD → **SOM Y3** : ${som_y3.toFixed(1)}M USD

### Marché France (segment diaspora + affinité)
- **Taille segment** : ${FRANCE_DIASPORA.taille}M EUR
- **Croissance** : ${FRANCE_DIASPORA.croissance}% — diaspora 2.5M + clean beauty mainstream
- Canal .fr : D2C Shopify + Amazon.fr

### Opportunité Compétitive
routines.fr se positionne dans un **white space** :
> Aucun acteur ne combine *ingrédients marocains iconiques + clean formulas + système de routines simples + canal digital natif*.

**Top tendances à capturer** :
${TENDANCES_MARCHE.slice(0, 4).map(t => `- ${t.tendance} → +${t.croissance}% (${t.opportunite})`).join('\n')}

### Segments Cibles
- **Primaire** : ${SEGMENTS_CIBLES.primaire.profil}
  - Panier moyen : ${SEGMENTS_CIBLES.primaire.panier_moyen} MAD | ${SEGMENTS_CIBLES.primaire.frequence_achat}x/an
- **Secondaire** : ${SEGMENTS_CIBLES.secondaire.profil}
  - Panier moyen : ${SEGMENTS_CIBLES.secondaire.panier_moyen} EUR | ${SEGMENTS_CIBLES.secondaire.frequence_achat}x/an
    `.trim();

    const recommandations = [
      this.creerRecommandation(
        'Focus D2C Maroc avant retail',
        'Lancer exclusivement en ligne (site + Instagram) pendant 6 mois. Collecter la data consommateurs avant toute négociation retail.',
        'fort', 'critique', 'Mois 1–6'
      ),
      this.creerRecommandation(
        'Tester le marché France dès le lancement',
        'Activer routines.fr (France) en simultané avec landing page + Meta Ads ciblant diaspora marocaine Île-de-France.',
        'fort', 'haute', 'Mois 1'
      ),
      this.creerRecommandation(
        'Exploiter le white-space "routines minimalistes halal"',
        'Positionner chaque produit comme étape d\'une routine : Routine Matin, Routine Soir, Routine Semaine. Éduquer plutôt que vendre.',
        'fort', 'critique', 'Stratégie dès J1'
      ),
      this.creerRecommandation(
        'Surveillance concurrentielle mensuelle',
        'Mettre en place un tracking des prix, lancements et avis de L\'Oréal, Typology et marques locales. Réagir en 72h sur les écarts de prix.',
        'moyen', 'moyenne', 'Mensuel continu'
      ),
      this.creerRecommandation(
        'Piloter le score NPS dès le 1er colis',
        'Envoyer une enquête satisfaction à J+7 de chaque commande. Objectif NPS > 60 en 90 jours.',
        'fort', 'haute', 'Mois 1'
      ),
    ];

    const kpis = [
      this.creerKPI('Part de marché soin peau (Maroc)', 0.5, '% SAM', 'Fin Y1'),
      this.creerKPI('Notoriété assistée (sondage)', 15, '%', 'M6'),
      this.creerKPI('Share of Search routines.fr', 3, '%', 'M12'),
      this.creerKPI('NPS client', 60, 'points', 'M3'),
    ];

    const alertes = [
      `Import gris (25% du marché Maroc) : risque de substitution sur les prix — différencier par certification halal + SAV + branding.`,
      `Saison de vente pic : Ramadan (Robes, soins corps) + Été (protection solaire). Anticiper les stocks 8 semaines avant.`,
      `Entrée potentielle Deciem/The Ordinary sur Maroc : surveiller les ouvertures de distribution.`,
    ];

    this.envoyerMessage('brand', 'Opportunité positionnement', 'White space confirmé : routines minimalistes halal + ingrédients marocains. Aucun concurrent ne tient ce carré.', { som_y1, som_y3 });
    this.envoyerMessage('finance', 'Données TAM/SAM/SOM', `SAM=${sam.toFixed(0)}M USD, SOM Y1=${som_y1.toFixed(1)}M, SOM Y3=${som_y3.toFixed(1)}M`, { tam, sam, som_y1, som_y3 });

    return this.creerResultat(analyse, recommandations, kpis, alertes);
  }
}
