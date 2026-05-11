import { AgentBase } from '../base.agent.js';
import type { AgentContext, AgentResult } from '../types.js';

const INVESTISSEMENT_INITIAL = {
  formulation_cmo: 80000, // MAD
  packaging_design: 25000,
  stock_initial: 120000, // 300 unités x 6 SKUs x ~67 MAD COGS moyen
  legal_certif: 70000,
  site_ecommerce: 15000,
  marketing_lancement: 45000,
  fonds_roulement: 50000,
  get total() { return Object.values(this).filter(v => typeof v === 'number').reduce((a, b) => a + b, 0); },
};

const PROJECTION_CA = {
  m1: { unites: 150, panier_moyen: 280, ca: 42000 },
  m2: { unites: 300, panier_moyen: 290, ca: 87000 },
  m3: { unites: 500, panier_moyen: 295, ca: 147500 },
  m6: { unites: 1200, panier_moyen: 310, ca: 372000 },
  m12: { unites: 3000, panier_moyen: 320, ca: 960000 },
  y2: { unites: 8000, panier_moyen: 340, ca: 2720000 },
  y3: { unites: 18000, panier_moyen: 350, ca: 6300000 },
};

const STRUCTURE_MARGE = {
  prix_vente_moyen_mad: 290,
  cogs: 87, // 30% du PV
  marge_brute_pct: 70,
  frais_logistique_pct: 8,
  frais_paiement_pct: 2.5,
  marge_contribution_pct: 59.5,
  marketing_pct: 18, // CAC / CA
  marge_operationnelle_pct: 41.5, // hors salaires phase 1
};

const FINANCEMENTS_DISPONIBLES = [
  { source: 'Fonds propres / FFF', montant: '50K–200K MAD', conditions: 'Immédiat, dilution ou prêt familial' },
  { source: 'CCG Damane Express (TPE)', montant: 'Jusqu\'à 100K MAD', conditions: 'Garantie 50%, taux 5.5%, délai 15j' },
  { source: 'CIH Bank Startup Maroc', montant: 'Jusqu\'à 300K MAD', conditions: 'Bilan N-1 ou business plan solide' },
  { source: 'Innov Invest (CGEM/BMCE)', montant: '500K–2M MAD', conditions: 'Traction prouvée (6 mois data)' },
  { source: 'Bpifrance (France)', montant: '25K–50K EUR', conditions: 'Entité française, Prêt d\'honneur, 0% intérêt' },
];

export class FinanceAgent extends AgentBase {
  readonly role = 'finance' as const;
  readonly domaine = 'Finance, Pricing & Revenue';
  readonly expertise = [
    'Modélisation financière DTC',
    'Pricing cosmétique (Maroc/France)',
    'Unit economics (CAC, LTV, COGS)',
    'Financements startup Maroc',
    'Plan de trésorerie',
  ];

  constructor(contexte: AgentContext) {
    super(contexte);
  }

  analyser(): AgentResult {
    const investissement_total = INVESTISSEMENT_INITIAL.formulation_cmo
      + INVESTISSEMENT_INITIAL.packaging_design
      + INVESTISSEMENT_INITIAL.stock_initial
      + INVESTISSEMENT_INITIAL.legal_certif
      + INVESTISSEMENT_INITIAL.site_ecommerce
      + INVESTISSEMENT_INITIAL.marketing_lancement
      + INVESTISSEMENT_INITIAL.fonds_roulement;

    const breakeven_mois = Math.ceil(investissement_total / (PROJECTION_CA.m3.ca * (STRUCTURE_MARGE.marge_contribution_pct / 100)));

    const analyse = `
## Plan Financier — MBF Cosmétique / routines.fr

### Investissement Initial Requis
| Poste | MAD |
|-------|-----|
| Formulation + CMO | ${INVESTISSEMENT_INITIAL.formulation_cmo.toLocaleString()} |
| Design + packaging | ${INVESTISSEMENT_INITIAL.packaging_design.toLocaleString()} |
| Stock initial (300u×6 SKUs) | ${INVESTISSEMENT_INITIAL.stock_initial.toLocaleString()} |
| Légal + certifications | ${INVESTISSEMENT_INITIAL.legal_certif.toLocaleString()} |
| Site e-commerce | ${INVESTISSEMENT_INITIAL.site_ecommerce.toLocaleString()} |
| Marketing lancement | ${INVESTISSEMENT_INITIAL.marketing_lancement.toLocaleString()} |
| Fonds de roulement | ${INVESTISSEMENT_INITIAL.fonds_roulement.toLocaleString()} |
| **TOTAL** | **${investissement_total.toLocaleString()} MAD** |

→ Équivalent : ~**${(investissement_total / 10.8).toFixed(0)} EUR** (taux 1 EUR = 10.8 MAD)

### Projections CA (scénario réaliste)
| Période | Unités | Panier MAD | CA MAD |
|---------|--------|------------|--------|
${Object.entries(PROJECTION_CA).map(([p, d]) =>
  `| ${p.toUpperCase()} | ${d.unites.toLocaleString()} | ${d.panier_moyen} | **${d.ca.toLocaleString()}** |`
).join('\n')}

### Structure de Marge
- Prix vente moyen : ${STRUCTURE_MARGE.prix_vente_moyen_mad} MAD
- COGS : ${STRUCTURE_MARGE.cogs} MAD (${STRUCTURE_MARGE.cogs/STRUCTURE_MARGE.prix_vente_moyen_mad*100}%)
- **Marge brute** : **${STRUCTURE_MARGE.marge_brute_pct}%**
- Logistique + paiement : ${STRUCTURE_MARGE.frais_logistique_pct + STRUCTURE_MARGE.frais_paiement_pct}%
- **Marge contribution** : **${STRUCTURE_MARGE.marge_contribution_pct}%**
- Marketing (~CAC/CA) : ${STRUCTURE_MARGE.marketing_pct}%
- **Marge opérationnelle** : **${STRUCTURE_MARGE.marge_operationnelle_pct}%** (hors masse salariale Y1)

### Point d\'équilibre estimé : **~${breakeven_mois} mois** (scénario M3 ramp-up)

### Financements Recommandés
${FINANCEMENTS_DISPONIBLES.map(f => `- **${f.source}** : ${f.montant} → ${f.conditions}`).join('\n')}
    `.trim();

    const recommandations = [
      this.creerRecommandation(
        'Structurer l\'investissement : 70% propres + 30% CCG Damane',
        'Lever 250K MAD : 175K fonds propres + 75K via CCG Damane Express. Éviter la dilution en phase pre-revenue. Le CCG réduit le risque banque.',
        'fort', 'critique', 'M1'
      ),
      this.creerRecommandation(
        'Fixer les prix avec marge brute minimum 65%',
        'Règle d\'or DTC beauté : COGS < 30% du prix de vente. Huile argan sérum = COGS 45 MAD → prix min 150 MAD → prix recommandé 290 MAD (premium justifié).',
        'fort', 'critique', 'Avant lancement'
      ),
      this.creerRecommandation(
        'Ouvrir une SAS en France pour l\'e-commerce routines.fr',
        'Pour vendre légalement en France : structure FR obligatoire. SAS simplifiée : 1 EUR capital, ~1 500 EUR frais création. Ouvre droit au Prêt d\'honneur Bpifrance.',
        'fort', 'haute', 'M2'
      ),
      this.creerRecommandation(
        'Mettre en place un tableau de bord financier hebdomadaire',
        'Suivre chaque semaine : CA, CAC, ROAS, taux conversion, stock restant, trésorerie J+30/J+60. Ne jamais piloter à l\'aveugle. Outil gratuit : Google Sheets ou Notion.',
        'fort', 'haute', 'Dès J1'
      ),
      this.creerRecommandation(
        'Proposer un abonnement mensuel (box routine)',
        'Modèle subscription = revenu récurrent + LTV x2.5. Prix : 199 MAD/mois (3 produits pleine taille). Activer dès M3 quand le produit est validé.',
        'fort', 'moyenne', 'M3'
      ),
    ];

    const kpis = [
      this.creerKPI('Marge brute', 68, '%', 'Continu'),
      this.creerKPI('CA cumulé M6', 900000, 'MAD', 'M6'),
      this.creerKPI('Point mort (break-even)', 5, 'mois', 'M5'),
      this.creerKPI('Trésorerie disponible (buffer)', 50000, 'MAD', 'Continu'),
      this.creerKPI('LTV:CAC ratio', 5, 'x', 'M6'),
    ];

    this.envoyerMessage('operations', 'Contrainte capital',
      `Stock initial maximum : ${INVESTISSEMENT_INITIAL.stock_initial.toLocaleString()} MAD. Prioriser rotation rapide (J-30 vente sur stock).`,
      { budget_stock: INVESTISSEMENT_INITIAL.stock_initial });
    this.envoyerMessage('coordinator', 'Investissement total',
      `Besoin total : ${investissement_total.toLocaleString()} MAD. Break-even estimé à ${breakeven_mois} mois.`,
      { investissement: investissement_total, breakeven: breakeven_mois });

    return this.creerResultat(analyse, recommandations, kpis, [
      `Trésorerie critique : ne jamais tomber sous 40 000 MAD de buffer. Surveiller chaque lundi.`,
      'Ne pas reinvestir le CA avant M3 : reconstituer le stock et payer les prestataires d\'abord.',
      'Fluctuation MAD/EUR : se couvrir si le sourcing France dépasse 20% des COGS.',
    ]);
  }
}
