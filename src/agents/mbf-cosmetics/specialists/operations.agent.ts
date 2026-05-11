import { AgentBase } from '../base.agent.js';
import type { AgentContext, AgentResult } from '../types.js';

const FLUX_IMPORT = {
  etapes: [
    { etape: '1. Commande à routines.fr France', delai: 'J0', detail: 'Bon de commande + paiement (60j si consignation négociée)' },
    { etape: '2. Préparation + expédition France', delai: 'J3–J7', detail: 'Préparation CMR + facture commerciale + liste de colisage' },
    { etape: '3. Transit France → Maroc', delai: 'J7–J14', detail: 'DHL Express ou transitaire Maroc (Schenker, Bolloré Logistics)' },
    { etape: '4. Dédouanement (ALE Maroc-UE)', delai: 'J14–J17', detail: 'EUR.1 = droits 0%. Formalités douanières Casablanca ou Tanger Med' },
    { etape: '5. Contrôle DMP (1ère import)', delai: 'J17–J24', detail: 'Inspection possible lors de la première importation — prévoir délai' },
    { etape: '6. Réception entrepôt MBF', delai: 'J17–J24', detail: 'QC : vérifier conformité commande, intégrité packaging, DLC' },
    { etape: '7. Adaptation locale (sleeve bilingue)', delai: 'J24–J28', detail: 'Apposition sleeve AR/FR sur chaque unité avant mise en vente' },
    { etape: '8. Disponible à la vente', delai: 'J28–J35', detail: 'Stock disponible sur Shopify (synchroniser inventaire)' },
  ],
  delai_total: '28–35 jours (premier import), 18–25 jours (imports réguliers)',
  transitaires_recommandes: [
    { nom: 'DHL Express Maroc', temps: '3–5j', cout_colis_5kg: '45–70 EUR', force: 'Rapidité, tracking, fiabilité pour petits volumes' },
    { nom: 'Schenker Maroc (Casablanca)', temps: '7–10j', cout: 'Sur devis', force: 'Groupage, volume moyen, dédouanement intégré' },
    { nom: 'Bolloré Logistics (Tanger Med)', temps: '7–12j', cout: 'Sur devis', force: 'Grand volume, conteneur groupage' },
  ],
};

const DOUANES_ALE = {
  accord: 'Accord d\'Association Maroc–UE (2000) + Statut Avancé',
  taux_cosmetiques: '0% sur produits cosmétiques avec certificat EUR.1 (position tarifaire 33XX)',
  documents_requis: [
    'Facture commerciale en EUR (3 exemplaires)',
    'EUR.1 (certificat d\'origine préférentielle) — obtenir à la CCI France ou CCISM',
    'Liste de colisage (packing list) détaillée',
    'Autorisation DMP Maroc (après déclaration)',
    'Fiche technique sécurité (MSDS) pour chaque produit',
  ],
  tva_import: '20% — récupérable si MBF immatriculé TVA Maroc',
};

const LOGISTIQUE_MAROC = {
  modele_phase1: {
    label: 'Phase 1 (0–200 colis/mois) : Stockage en propre',
    espace: '20–30 m² (bureau, garage, local loué)',
    cout_mad: '2 000–4 000 MAD/mois',
    avantage: 'Contrôle total qualité + sleeve bilingue maîtrisé',
  },
  modele_phase2: {
    label: 'Phase 2 (200+ colis/mois) : Fulfillment externalisé',
    partenaires: ['Colis du Maroc (Casablanca)', 'Sendcloud Maroc', 'Jumia Fulfillment'],
    cout_mad: '15–25 MAD/colis + stockage',
  },
  transporteurs_livraison: [
    { nom: 'Amana (COD)', delai: '24–48h', cout_mad: 28, force: 'COD natif, leader Maroc, tracking SMS' },
    { nom: 'J&T Express Maroc', delai: '24–48h', cout_mad: 25, force: 'Prix compétitif, montée rapide', note: 'Récent, à tester sur fiabilité' },
    { nom: 'DHL Maroc (carte)', delai: '24–48h', cout_mad: 58, force: 'Premium, idéal client à fort panier' },
    { nom: 'Poste Maroc EMS', delai: '2–5j', cout_mad: 22, force: 'Couverture nationale totale, zones rurales' },
  ],
  livraison_france: [
    { nom: 'Colissimo La Poste', delai: '4–7j', cout_eur: 7.5, force: 'Réseau universel France' },
    { nom: 'Mondial Relay', delai: '5–8j', cout_eur: 5.5, force: 'Relais colis, moins cher' },
    { nom: 'DHL Express', delai: '2–3j', cout_eur: 16, force: 'Commandes urgentes ou > 80 EUR' },
  ],
};

export class OperationsAgent extends AgentBase {
  readonly role = 'operations' as const;
  readonly domaine = 'Import, Supply Chain & Logistique';
  readonly expertise = [
    'Flux import France → Maroc (ALE, EUR.1, dédouanement)',
    'Logistique DTC Maroc (Amana COD, J&T Express)',
    'Gestion stocks import et rotation',
    'Adaptation packaging sur stock importé',
    'KPIs opérationnels e-commerce Maroc',
  ];

  constructor(contexte: AgentContext) {
    super(contexte);
  }

  analyser(): AgentResult {
    const analyse = `
## Opérations & Supply Chain — Import routines.fr France → Distribution Maroc

### Schéma Logistique Complet
\`\`\`
routines.fr (France, fournisseur)
  ↓ Commande + paiement 60j
Entrepôt France → Transit DHL/Schenker (7–14j)
  ↓ EUR.1 (0% droits douane ALE)
Dédouanement Casablanca ou Tanger Med (2–5j)
  ↓ Inspection DMP possible (1ère fois)
Entrepôt MBF Cosmétique Casablanca (local 20–30m²)
  ↓ QC + Apposition sleeve bilingue AR/FR
Stock disponible Shopify
  ├── Livraison Maroc → Amana COD (24–48h, 28 MAD)
  └── Livraison France → Colissimo (4–7j, 7.5 EUR)
\`\`\`

**Délai total réappro : ${FLUX_IMPORT.delai_total}**

### Flux Import Détaillé
${FLUX_IMPORT.etapes.map(e => `**${e.etape}** [${e.delai}]\n   ${e.detail}`).join('\n\n')}

### Douanes & ALE Maroc-UE
- Accord : ${DOUANES_ALE.accord}
- Taux cosmétiques : **${DOUANES_ALE.taux_cosmetiques}**
- Documents : ${DOUANES_ALE.documents_requis.length} documents obligatoires
- TVA import : ${DOUANES_ALE.tva_import}

### Transporteurs Livraison Maroc
${LOGISTIQUE_MAROC.transporteurs_livraison.map(t =>
  `- **${t.nom}** : ${t.delai} | ${t.cout_mad} MAD | ${t.force}${t.note ? ' ⚠️ ' + t.note : ''}`
).join('\n')}

### Livraison France (clients diaspora)
${LOGISTIQUE_MAROC.livraison_france.map(t =>
  `- **${t.nom}** : ${t.delai} | ${t.cout_eur} EUR | ${t.force}`
).join('\n')}

### Adaptation Packaging en Entrepôt Maroc
Chaque unité importée reçoit :
1. **Sleeve bilingue AR/FR** (imprimé chez Print Casa Casablanca)
2. **Sticker DMP** (n° de déclaration) apposé une fois autorisation obtenue
3. **Vérification DLC** + n° de lot lisible

Processus : 2 personnes × 200 unités/heure = 20h de travail pour 4 000 unités
    `.trim();

    const recommandations = [
      this.creerRecommandation(
        'Travailler avec un transitaire dédié dès le premier import',
        'Ne jamais dédouaner seul pour un premier import cosmétique. Utiliser Schenker Maroc ou un agent en douane Casablanca (600–1 200 MAD/opération). Ils connaissent les codes douaniers cosmétiques et évitent les blocages DMP.',
        'fort', 'critique', 'Premier import'
      ),
      this.creerRecommandation(
        'Obtenir le certificat EUR.1 pour chaque envoi',
        'Sans EUR.1, droits de douane de 2.5–17.5% sur les cosmétiques s\'appliquent. Le certificat s\'obtient à la CCI de France (2–3j). Faire établir par routines.fr France à chaque commande. Économie : 10–30 MAD/unité.',
        'fort', 'critique', 'Chaque import'
      ),
      this.creerRecommandation(
        'Activer Amana COD dès J1 — condition sine qua non du succès Maroc',
        'COD = 65–70% des commandes e-commerce Maroc. Sans Amana, vous perdez les 2/3 de vos clientes potentielles. Ouvrir le compte Amana en semaine 1 (dossier : RC + ICE + RIB + carte d\'identité). Délai activation : 5–10 jours ouvrés.',
        'fort', 'critique', 'Semaine 1'
      ),
      this.creerRecommandation(
        'Maintenir 8 semaines de stock tampon en permanence',
        'Délai import 28–35j + délai adaptation 5j + marge de sécurité = 8 semaines minimum. Commander le réassort quand le stock atteint 10 semaines. Ne jamais attendre la rupture.',
        'fort', 'haute', 'Règle permanente'
      ),
      this.creerRecommandation(
        'Préparer le processus DMP pour la première importation',
        'La DMP peut retenir physiquement les produits lors du premier import pour inspection. Prévoir 2 000–3 000 MAD de frais de stockage douanier et 7–14j de délai supplémentaire. Avoir les autorisations DMP AVANT le premier envoi.',
        'fort', 'haute', 'Avant 1er import',
        ['Déclarations DMP obtenues pour chaque SKU']
      ),
    ];

    const kpis = [
      this.creerKPI('Délai import France → vente (jours)', 28, 'jours', 'M3'),
      this.creerKPI('Taux refus livraison COD', 5, '%', 'M3'),
      this.creerKPI('Ruptures de stock', 0, 'par mois', 'Permanent'),
      this.creerKPI('Coût logistique/commande (Maroc)', 40, 'MAD', 'M3'),
      this.creerKPI('Stock tampon (semaines)', 8, 'semaines', 'Permanent'),
    ];

    this.envoyerMessage('ecommerce', 'Config livraison Shopify',
      'Activer Amana COD + DHL Maroc + Colissimo France sur Shopify. Seuil livraison offerte : 499 MAD (Maroc) / 55 EUR (France). Délais affichés sur site : 24–48h Maroc, 5–7j France.',
      {});

    return this.creerResultat(analyse, recommandations, kpis, [
      'CRITIQUE — Premier import sans autorisation DMP = risque de blocage et destruction des produits par les douanes marocaines.',
      'COD Maroc : taux de refus à la livraison peut atteindre 15–25% si l\'adresse est incomplète. Validation téléphonique des commandes COD recommandée.',
      'Stocker les produits à < 25°C (formules pharmaceutiques sensibles à la chaleur). Éviter les entrepôts sans climatisation en été.',
    ]);
  }
}
