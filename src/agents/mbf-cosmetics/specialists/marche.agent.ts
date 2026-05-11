import { AgentBase } from '../base.agent.js';
import type { AgentContext, AgentResult } from '../types.js';
import { MAROC_COSMETIQUES, FRANCE_DIASPORA, SEGMENTS_CIBLES, TENDANCES_MARCHE } from '../data/market.data.js';
import { ROUTINES_FR_BRAND, ECARTS_CULTURELS } from '../data/routines-fr.data.js';

export class MarcheAgent extends AgentBase {
  readonly role = 'marche' as const;
  readonly domaine = 'Intelligence Marché & Veille Concurrentielle';
  readonly expertise = [
    'Analyse marché cosmétique Maroc (segments, canaux, prix)',
    'Adaptation marque étrangère au contexte MENA',
    'Veille concurrentielle Casablanca / Rabat / Marrakech',
    'Comportement consommateur marocain digital',
    'Sizing TAM/SAM/SOM + scénarios réalistes',
  ];

  constructor(contexte: AgentContext) {
    super(contexte);
  }

  analyser(): AgentResult {
    const tam = MAROC_COSMETIQUES.taille; // 820M USD
    const sam = tam * 0.38;               // soin visage = 38%
    const som_y1 = sam * 0.004;           // 0.4% réaliste an 1 (marque importée)
    const som_y3 = sam * 0.022;           // 2.2% an 3 avec notoriété

    const ecartsCritiques = ECARTS_CULTURELS.filter(e => e.urgence === 'critique');

    const analyse = `
## Analyse Marché — routines.fr by MBF Cosmétique (Adaptation France → Maroc)

### Contexte de la marque
**${ROUTINES_FR_BRAND.nom}** est une marque ${ROUTINES_FR_BRAND.type} d'origine ${ROUTINES_FR_BRAND.pays_origine}.
Promesse originale : "${ROUTINES_FR_BRAND.promesse_fr}"
Distribution France : ${ROUTINES_FR_BRAND.canal_distribution_fr.join(', ')}

L'enjeu de MBF Cosmétique : importer CE produit en l'adaptant au marché marocain —
sans perdre l'ADN de la marque, mais en comblant les ${ROUTINES_FR_BRAND.faiblesses_vs_maroc.length} écarts identifiés.

### Sizing Marché Maroc
| Indicateur | Valeur | Note |
|-----------|--------|------|
| **TAM** (marché cosméto total Maroc 2025) | ${tam}M USD | Source : AMITH + Euromonitor |
| **SAM** (soin visage + clean beauty) | ${sam.toFixed(0)}M USD | Segment cœur de cible |
| **SOM Y1** (scénario réaliste) | ${som_y1.toFixed(1)}M USD | Marque importée = ramp-up lent |
| **SOM Y3** (avec notoriété établie) | ${som_y3.toFixed(1)}M USD | +certif halal + retail sélectif |
| **Croissance sectorielle** | ${MAROC_COSMETIQUES.croissance}% CAGR | Portée par digital + classe moyenne |

### Marché France — Diaspora marocaine
- Segment diaspora + affinité culturelle : **${FRANCE_DIASPORA.taille}M EUR**
- Croissance : **${FRANCE_DIASPORA.croissance}%** — nostalgie culturelle × clean beauty
- Avantage compétitif : routines.fr est déjà présente France → pas de lancement à froid

### Segmentation Consommatrices Maroc

**Segment PRIMAIRE — "La Marocaine Moderne Urbaine"**
${SEGMENTS_CIBLES.primaire.profil}
- Revenus : ${SEGMENTS_CIBLES.primaire.revenus}
- Comportement : ${SEGMENTS_CIBLES.primaire.comportement}
- Panier moyen : **${SEGMENTS_CIBLES.primaire.panier_moyen} MAD** | ${SEGMENTS_CIBLES.primaire.frequence_achat} achats/an
- Canal préféré : ${SEGMENTS_CIBLES.primaire.canal_prefere}
- Douleur n°1 : **hyperpigmentation et taches** (68% concernées)
- Douleur n°2 : **peau grasse zone T + desséchement joues** (climat continental)

**Segment SECONDAIRE — Diaspora marocaine France**
${SEGMENTS_CIBLES.secondaire.profil}
- Panier moyen : **${SEGMENTS_CIBLES.secondaire.panier_moyen} EUR** | ${SEGMENTS_CIBLES.secondaire.frequence_achat} achats/an
- Attrait : marque française qu'elles connaissent déjà, adaptée à leur identité

### Écarts France → Maroc à combler EN PRIORITÉ
${ecartsCritiques.map(e =>
  `⚠️  **${e.dimension}**
   Situation France : ${e.situation_fr}
   Situation Maroc : ${e.situation_maroc}
   → Action : ${e.action}`
).join('\n\n')}

### Opportunité Compétitive Unique
routines.fr arrive avec un **avantage rare** : marque déjà crédible en France.
Au Maroc, "marque française" = signal de qualité et modernité.
Combiné à une adaptation locale soignée (halal + darija + anti-taches) = positionnement inattaquable.

Aucun concurrent local ne cumule : *crédibilité France + clean formulas + certif halal + routine system*.

### Top Tendances Marché à Capturer
${TENDANCES_MARCHE.map(t => `- **${t.tendance}** → +${t.croissance}% | Opportunité : ${t.opportunite}`).join('\n')}
    `.trim();

    const recommandations = [
      this.creerRecommandation(
        'Tester la réception "Marque française" auprès de 100 femmes marocaines',
        'Avant tout investissement, réaliser 10 focus groups en ligne (Instagram Stories poll + WhatsApp). Question clé : "Une marque française clean beauty adaptée halal, combien paieriez-vous ?" Les résultats calibreront le pricing et le messaging.',
        'fort', 'critique', 'Semaine 1–2'
      ),
      this.creerRecommandation(
        'Positionner "anti-taches" comme promesse n°1 au Maroc',
        'La promesse française "routine simple et efficace" doit être adaptée : au Maroc la promesse doit être "peau éclatante sans taches". C\'est le problème n°1. Sérum anti-taches = produit héros Maroc (même si ce n\'est pas le cas en France).',
        'fort', 'critique', 'Brief marketing M1'
      ),
      this.creerRecommandation(
        'D2C exclusif pendant 9 mois, puis approcher Marjane/L\'Boulvard',
        'Lancer 100% en ligne. Collecter 500 commandes Maroc avant toute négociation retail. Les données de vente sont le meilleur argument commercial pour Marjane Beauty.',
        'fort', 'critique', 'M1–M9'
      ),
      this.creerRecommandation(
        'Surveillance hebdomadaire des marques locales émergentes',
        'Karicia, Melvita Maroc, et nouvelles marques Instagram à surveiller. Tracker leurs lancements produits, prix, et contenus TikTok. Réagir sous 72h si concurrent lance sur anti-taches.',
        'moyen', 'moyenne', 'Hebdomadaire'
      ),
      this.creerRecommandation(
        'Anticiper la saisonnalité marocaine dans le plan marché',
        'Pics de vente : Aïd al-Adha (été), Ramadan (printemps), rentrée septembre, fêtes de fin d\'année. Creuses : juillet–août (budget vacances). Plan stocks + marketing calé sur ce calendrier.',
        'fort', 'haute', 'Plan annuel'
      ),
    ];

    const kpis = [
      this.creerKPI('SOM Maroc Y1 (CA)', som_y1.toFixed(1), 'M USD', 'Fin Y1'),
      this.creerKPI('Notoriété assistée Casablanca + Rabat', 20, '%', 'M9'),
      this.creerKPI('Share of Search "routines soin Maroc"', 5, '%', 'M12'),
      this.creerKPI('NPS client (benchmark marque importée)', 65, 'points', 'M3'),
      this.creerKPI('Taux réachat M6', 35, '%', 'M6'),
      this.creerKPI('Commandes Maroc cumulées M6', 1500, 'commandes', 'M6'),
    ];

    const alertes = [
      `CRITIQUE — Import gris (25% du marché Maroc) : des produits routines.fr France pourraient déjà circuler via revendeurs informels. Surveiller Jumia + Facebook Marketplace avant lancement.`,
      `TIMING — Ramadan 2027 tombe en janvier. Préparer une campagne "Routine Ramadan" (soin peau sous voile, lèvres hydratées, teint pendant le jeûne) dès M9.`,
      `RISQUE — Marché saturé par The Ordinary qui s'étend au Maroc via distribution pharmacies. Se différencier sur l'émotion et la culture, pas seulement sur les actifs.`,
      `OPPORTUNITÉ — TikTok Maroc : 12M+ utilisateurs actifs. Les vidéos "routine en 3 étapes" en darija font régulièrement 500K+ vues. Canal gratuit à activer en priorité.`,
    ];

    this.envoyerMessage('brand', 'Insight marché critique',
      'Anti-taches = promesse n°1 au Maroc. La promesse française doit être adaptée. Sérum anti-taches = héros Maroc. Brief identité à revoir.',
      { segment_primaire: SEGMENTS_CIBLES.primaire, ecarts_critiques: ecartsCritiques.length });
    this.envoyerMessage('finance', 'Données sizing',
      `SAM=${sam.toFixed(0)}M USD, SOM Y1=${som_y1.toFixed(1)}M, SOM Y3=${som_y3.toFixed(1)}M. Marque importée = ramp-up 15–18 mois avant profitabilité.`,
      { tam, sam, som_y1, som_y3 });
    this.envoyerMessage('produit', 'Reformulation prioritaire',
      'Écarts critiques identifiés : (1) halal manquant, (2) SPF30→50 pour été marocain, (3) tester formules phototype IV–VI. Voir ECARTS_CULTURELS.',
      { ecarts: ECARTS_CULTURELS.map(e => e.dimension) });

    return this.creerResultat(analyse, recommandations, kpis, alertes);
  }
}
