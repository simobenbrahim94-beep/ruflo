import { AgentBase } from '../base.agent.js';
import type { AgentContext, AgentResult } from '../types.js';

const LOGISTIQUE_MAROC = {
  transporteurs: [
    { nom: 'Amana (ex-Hmizate Logistique)', delai: '24–48h', cout: '25–40 MAD/colis', force: 'COD (paiement à la livraison) natif' },
    { nom: 'Jumia Fulfillment', delai: '24h Casablanca', cout: '30–45 MAD', force: 'Volume + entrepôt Casablanca' },
    { nom: 'DHL Maroc', delai: '48h', cout: '55–75 MAD', force: 'Fiabilité, tracking, international' },
    { nom: 'Poste Maroc (EMS)', delai: '2–5j', cout: '20–35 MAD', force: 'Prix bas, couverture nationale' },
  ],
  entrepot: {
    option: 'Fulfillment Casablanca (sous-traité)',
    surface: '20–50 m² initial',
    cout: '3 000–6 000 MAD/mois',
    alternative: 'Garage/local dédié au départ si volume < 200 colis/mois',
  },
};

const LOGISTIQUE_FRANCE = {
  transporteurs: [
    { nom: 'Colissimo (La Poste)', delai: '2–3j', cout: '6.50–9 EUR', force: 'Réseau universel, bien connu' },
    { nom: 'Mondial Relay', delai: '3–5j', cout: '4.50–6 EUR', force: 'Livraison en point relais, moins cher' },
    { nom: 'DHL Express', delai: '1–2j', cout: '12–18 EUR', force: 'Premium, tracking, remboursement' },
  ],
  douanes: {
    accord: 'ALE Maroc–UE (Accord d\'Association 2000 + Statut Avancé)',
    taux_droit: '0% pour cosmétiques avec certificat d\'origine EUR.1',
    tva_france: '20% TVA (intégrée au prix TTC)',
    certificat_origine: 'EUR.1 — obtenir via CCISM ou Chambre de Commerce Casablanca',
  },
};

const PACKAGING_SPECS = {
  verre: { type: 'Verre givré recyclable', fournisseur: 'Omara Glass Casablanca', moq: 500, cout_unit: 8 },
  etiquettes: { type: 'Papier Kraft certifié FSC', fournisseur: 'Print Casa', moq: 1000, cout_unit: 1.5 },
  boites: { type: 'Carton recyclé neutre carbone', fournisseur: 'Packmar Casablanca', moq: 500, cout_unit: 4 },
  rubans: { type: 'Raphia naturel brun', cout_unit: 0.8 },
};

export class OperationsAgent extends AgentBase {
  readonly role = 'operations' as const;
  readonly domaine = 'Supply Chain & Logistique';
  readonly expertise = [
    'Logistique DTC Maroc/France',
    'Gestion stock et entrepôt',
    'Douanes ALE Maroc-UE',
    'Packaging éco-responsable',
    'KPIs opérationnels e-commerce',
  ];

  constructor(contexte: AgentContext) {
    super(contexte);
  }

  analyser(): AgentResult {
    const analyse = `
## Supply Chain & Opérations — routines.fr

### Schéma Logistique Recommandé
\`\`\`
CMO (Skin Lab Morocco, Casablanca)
  → QC interne (3j) → Étiquetage + Packaging
  → Stock dédié (garage/espace loué, Casablanca)
  → Commandes Maroc : Amana COD (24–48h)
  → Commandes France : DHL Maroc → Colissimo (4–6j total)
\`\`\`

### Transport Maroc
${LOGISTIQUE_MAROC.transporteurs.map(t =>
  `- **${t.nom}** : ${t.delai} | ${t.cout} | ${t.force}`
).join('\n')}
**Recommandation** : Amana en phase 1 (COD réduit le risque d'impayés Maroc).

### Transport France
${LOGISTIQUE_FRANCE.transporteurs.map(t =>
  `- **${t.nom}** : ${t.delai} | ${t.cout} | ${t.force}`
).join('\n')}
**Recommandation** : Colissimo standard + upgrade DHL pour commandes > 80 EUR.

### Douanes Maroc → France (ALE)
- Accord : ${LOGISTIQUE_FRANCE.douanes.accord}
- Taux douane : **${LOGISTIQUE_FRANCE.douanes.taux_droit}** ✓
- TVA : ${LOGISTIQUE_FRANCE.douanes.tva_france}
- Certificat EUR.1 : ${LOGISTIQUE_FRANCE.douanes.certificat_origine}

### Packaging Éco (Sources + Coûts)
- Flacon verre givré : ~${PACKAGING_SPECS.verre.cout_unit} MAD/unité (MOQ ${PACKAGING_SPECS.verre.moq})
- Étiquette Kraft FSC : ~${PACKAGING_SPECS.etiquettes.cout_unit} MAD/unité
- Boîte recyclée : ~${PACKAGING_SPECS.boites.cout_unit} MAD/unité
- Ruban raphia : ~${PACKAGING_SPECS.rubans.cout_unit} MAD/unité

### KPIs Opérationnels Cibles
- Expédition commande Maroc : < 24h après validation paiement
- Expédition commande France : < 48h
- Taux de retour Maroc : < 5% (colis COD refusé)
- Taux de retour France : < 8% (produit)
    `.trim();

    const recommandations = [
      this.creerRecommandation(
        'Utiliser Amana COD pour le Maroc (phase 1)',
        'Le paiement à la livraison (COD) représente 70%+ des commandes e-commerce au Maroc. Amana est leader COD. Réduire la friction d\'achat = augmenter la conversion.',
        'fort', 'critique', 'Dès lancement'
      ),
      this.creerRecommandation(
        'Obtenir le certificat EUR.1 dès les premiers exports France',
        'Sans EUR.1, la douane française peut appliquer les droits de douane standard. Demander via CCISM Casablanca (3–5 jours, gratuit).',
        'fort', 'critique', 'Avant 1er envoi France'
      ),
      this.creerRecommandation(
        'Gérer le stock en propre les 6 premiers mois',
        'Éviter les coûts de fulfillment externalisé avant 200 colis/mois. Un espace de 20m² suffit pour 6 SKUs × 300 unités. Internaliser = contrôle qualité total.',
        'moyen', 'haute', 'M1–M6'
      ),
      this.creerRecommandation(
        'Préparer un stock de sécurité 8 semaines avant Ramadan',
        'Le CMO a besoin de 8–10 semaines de production. Commander le stock Ramadan en janvier pour un Ramadan en mars/avril. Anticiper ×3 le volume normal.',
        'fort', 'haute', 'Annuel (anticipation)'
      ),
      this.creerRecommandation(
        'Insérer une carte "Note personnelle + Guide routine" dans chaque colis',
        'Impact NPS +12 points selon benchmarks DTC. Coût : 1.5 MAD/carte. Inclure QR code vers video tutoriel YouTube de la routine.',
        'fort', 'haute', 'Dès J1'
      ),
    ];

    const kpis = [
      this.creerKPI('Délai expédition Maroc', 24, 'heures', 'Continu'),
      this.creerKPI('Taux de retour (COD refusé)', 5, '%', 'M3'),
      this.creerKPI('Rupture de stock', 0, 'incidents/mois', 'Continu'),
      this.creerKPI('Coût logistique / commande', 40, 'MAD', 'M3'),
    ];

    this.envoyerMessage('ecommerce', 'Config livraison site',
      'Activer Amana COD + virement/carte sur Shopify. Livraison France via DHL Maroc → Colissimo. Seuil livraison offerte : 350 MAD (Maroc), 50 EUR (France).',
      { transporteurs_maroc: ['Amana'], transporteurs_france: ['Colissimo', 'DHL'] });

    return this.creerResultat(analyse, recommandations, kpis, [
      'COD Maroc : taux de refus à la livraison peut atteindre 30% → qualifier les commandes (numéro tél vérifié, adresse complète).',
      'Ne pas envoyer vers France avant d\'avoir le CPNP et le RP désigné.',
    ]);
  }
}
