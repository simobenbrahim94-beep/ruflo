import { AgentBase } from '../base.agent.js';
import type { AgentContext, AgentResult } from '../types.js';
import { ROUTINES_FR_BRAND, GAMMES_ROUTINES_FR, GRILLE_PRIX_ADAPTATION } from '../data/routines-fr.data.js';

const STRUCTURE_COUTS = {
  // Achat des produits routines.fr France (import) + adaptation
  import_franco_bord: {
    note: 'Achat des produits finis en France + frais logistique vers Maroc',
    cout_par_unite_eur: 22, // ex-works estimé (40% du prix de vente FR)
    cout_par_unite_mad: 238, // 22 EUR × 10.8
    droits_douane: 0, // ALE Maroc-UE, taux 0% avec EUR.1
    tva_import: 20, // 20% TVA import (récupérable si immatriculé TVA)
  },
  adaptation_locale: {
    sleeve_bilingue: 3, // MAD/unité (packaging adaptation)
    reformulation_amortie: 8, // MAD/unité (amortissement reformulations sur 3000 unités)
    test_panel_maroc: 5, // MAD/unité (amortissement tests cliniques)
  },
  logistique_maroc: {
    livraison_client: 38, // MAD/commande Amana COD
    emballage_expedition: 12, // MAD/commande
    retours_provision: 15, // MAD/commande (provision 5% refus COD)
  },
  frais_vente: {
    paiement_cmi: 2.5, // % du prix de vente
    plateforme_shopify: 3, // MAD/commande (amorti)
  },
};

const SCENARIOS_PROJECTION = {
  conservateur: {
    label: 'Conservateur (marque inconnue, lancement difficile)',
    m3_unites: 200, m6_unites: 600, m12_unites: 1800,
    panier_moyen_mad: 450,
  },
  realiste: {
    label: 'Réaliste (bon marketing, label France bien reçu)',
    m3_unites: 400, m6_unites: 1200, m12_unites: 4000,
    panier_moyen_mad: 480,
  },
  optimiste: {
    label: 'Optimiste (viral TikTok + influenceurs + Ramadan)',
    m3_unites: 700, m6_unites: 2500, m12_unites: 8000,
    panier_moyen_mad: 520,
  },
};

const INVESTISSEMENT_INITIAL = {
  accord_distribution_routines_fr: 0, // Negociation — peut être sous forme de licence
  stock_initial_import: 180000, // 750 unités × 240 MAD COGS moyen import
  adaptation_reformulation: 90000, // reformulations SPF50 + anti-taches
  certifications_legal: 80000, // DMP + Halal + OMPIC + avocats
  packaging_adaptation: 25000, // sleeves bilingues + motif zellige
  site_shopify_maroc: 18000,
  marketing_lancement: 55000,
  tests_cliniques_maroc: 20000,
  fonds_roulement: 60000,
  get total() {
    return this.stock_initial_import + this.adaptation_reformulation
      + this.certifications_legal + this.packaging_adaptation
      + this.site_shopify_maroc + this.marketing_lancement
      + this.tests_cliniques_maroc + this.fonds_roulement;
  },
};

const FINANCEMENTS = [
  { source: 'Fonds propres', montant_mad: 200000, note: 'Apport fondateur MBF' },
  { source: 'Avance routines.fr (stock consignation)', montant_mad: 80000, note: 'Négocier paiement à 60j' },
  { source: 'CCG Damane Express', montant_mad: 100000, note: 'Garantie 50%, taux 5.5%, délai 15j' },
  { source: 'Bpifrance (via SAS France)', montant_mad: 54000, note: '~5 000 EUR Prêt d\'honneur 0%' },
];

export class FinanceAgent extends AgentBase {
  readonly role = 'finance' as const;
  readonly domaine = 'Finance, Pricing & Unit Economics';
  readonly expertise = [
    'Modélisation import-distribution cosmétique',
    'Pricing premium adapté au marché marocain',
    'Unit economics DTC Maroc (COGS import, marge, CAC)',
    'Financement startup distribution (CCG, Bpifrance)',
    'Gestion trésorerie import (délais paiement FR→MA)',
  ];

  constructor(contexte: AgentContext) {
    super(contexte);
  }

  analyser(): AgentResult {
    const investissement_total = INVESTISSEMENT_INITIAL.total;
    const cogs_moyen = STRUCTURE_COUTS.import_franco_bord.cout_par_unite_mad
      + STRUCTURE_COUTS.adaptation_locale.sleeve_bilingue
      + STRUCTURE_COUTS.adaptation_locale.reformulation_amortie
      + STRUCTURE_COUTS.adaptation_locale.test_panel_maroc;
    const prix_vente_moyen = 450; // MAD (scénario réaliste)
    const marge_brute_pct = ((prix_vente_moyen - cogs_moyen) / prix_vente_moyen * 100).toFixed(1);
    const contribution = prix_vente_moyen - cogs_moyen
      - STRUCTURE_COUTS.logistique_maroc.livraison_client
      - STRUCTURE_COUTS.logistique_maroc.emballage_expedition
      - STRUCTURE_COUTS.logistique_maroc.retours_provision;
    const marge_contribution_pct = (contribution / prix_vente_moyen * 100).toFixed(1);
    const ca_m12_realiste = SCENARIOS_PROJECTION.realiste.m12_unites * SCENARIOS_PROJECTION.realiste.panier_moyen_mad;

    const analyse = `
## Plan Financier — Import et Distribution routines.fr au Maroc

### Modèle Économique : Import + Adaptation + Distribution DTC
**NB : Différence fondamentale vs marque propre**
routines.fr est une marque EXISTANTE. MBF Cosmétique est distributeur/importateur + adaptateur local.
Le modèle est donc : acheter en France + adapter + revendre au Maroc, pas fabriquer.

### Structure des Coûts par Unité (MAD)
| Poste | MAD/unité | % PV |
|-------|----------|------|
| Achat produit France (ex-works) | ${STRUCTURE_COUTS.import_franco_bord.cout_par_unite_mad} | ${(STRUCTURE_COUTS.import_franco_bord.cout_par_unite_mad/prix_vente_moyen*100).toFixed(0)}% |
| Sleeve bilingue + adaptation | ${STRUCTURE_COUTS.adaptation_locale.sleeve_bilingue + STRUCTURE_COUTS.adaptation_locale.reformulation_amortie + STRUCTURE_COUTS.adaptation_locale.test_panel_maroc} | ${((STRUCTURE_COUTS.adaptation_locale.sleeve_bilingue + 8 + 5)/prix_vente_moyen*100).toFixed(0)}% |
| **COGS Total** | **${cogs_moyen}** | **${(cogs_moyen/prix_vente_moyen*100).toFixed(0)}%** |
| Livraison + emballage | ${STRUCTURE_COUTS.logistique_maroc.livraison_client + STRUCTURE_COUTS.logistique_maroc.emballage_expedition} | ${((STRUCTURE_COUTS.logistique_maroc.livraison_client + STRUCTURE_COUTS.logistique_maroc.emballage_expedition)/prix_vente_moyen*100).toFixed(0)}% |
| Provision retours COD | ${STRUCTURE_COUTS.logistique_maroc.retours_provision} | ${(STRUCTURE_COUTS.logistique_maroc.retours_provision/prix_vente_moyen*100).toFixed(0)}% |
| **Marge brute** | **${prix_vente_moyen - cogs_moyen} MAD** | **${marge_brute_pct}%** |
| **Marge contribution** | **${contribution.toFixed(0)} MAD** | **${marge_contribution_pct}%** |

### Grille Tarifaire Maroc (adaptée du FR)
| Produit | Prix FR (EUR) | Prix MAD brut | Prix MAD psycho | Marge brute |
|---------|-------------|--------------|----------------|------------|
${GRILLE_PRIX_ADAPTATION.exemples.map(e =>
  `| Produit ~${e.prix_eur}€ | ${e.prix_eur} EUR | ${e.prix_mad_brut} MAD | **${e.prix_mad_psycho} MAD** | ~${(((e.prix_mad_psycho - cogs_moyen) / e.prix_mad_psycho) * 100).toFixed(0)}% |`
).join('\n')}
**Kit Starter Maroc** : **249 MAD** (porte d\'entrée, format réduit)

### Projections CA (3 scénarios)
| Scénario | M3 | M6 | M12 |
|---------|----|----|-----|
${Object.entries(SCENARIOS_PROJECTION).map(([, s]) =>
  `| ${s.label.split(' (')[0]} | ${(s.m3_unites * s.panier_moyen_mad / 1000).toFixed(0)}K MAD | ${(s.m6_unites * s.panier_moyen_mad / 1000).toFixed(0)}K MAD | **${(s.m12_unites * s.panier_moyen_mad / 1000).toFixed(0)}K MAD** |`
).join('\n')}

### Investissement Initial : ${investissement_total.toLocaleString()} MAD (~${(investissement_total / 10.8).toFixed(0)} EUR)
| Poste | MAD |
|-------|-----|
| Stock initial import France | ${INVESTISSEMENT_INITIAL.stock_initial_import.toLocaleString()} |
| Adaptation + reformulation | ${INVESTISSEMENT_INITIAL.adaptation_reformulation.toLocaleString()} |
| Certifications + légal | ${INVESTISSEMENT_INITIAL.certifications_legal.toLocaleString()} |
| Packaging bilingue | ${INVESTISSEMENT_INITIAL.packaging_adaptation.toLocaleString()} |
| Site Shopify Maroc | ${INVESTISSEMENT_INITIAL.site_shopify_maroc.toLocaleString()} |
| Marketing lancement | ${INVESTISSEMENT_INITIAL.marketing_lancement.toLocaleString()} |
| Tests cliniques Maroc | ${INVESTISSEMENT_INITIAL.tests_cliniques_maroc.toLocaleString()} |
| Fonds de roulement | ${INVESTISSEMENT_INITIAL.fonds_roulement.toLocaleString()} |
| **TOTAL** | **${investissement_total.toLocaleString()}** |

### Plan de Financement
${FINANCEMENTS.map(f => `- **${f.source}** : ${f.montant_mad.toLocaleString()} MAD — ${f.note}`).join('\n')}

### Point Mort Estimé
CA mensuel nécessaire (scénario réaliste) : **${(investissement_total / 12 / parseFloat(marge_contribution_pct) * 100).toFixed(0)} MAD/mois**
→ Break-even estimé : **~M7–M8** (distribution importée = ramp-up plus lent que marque propre)
    `.trim();

    const recommandations = [
      this.creerRecommandation(
        'Négocier une consignation ou paiement à 60j avec routines.fr France',
        'En tant que distributeur, éviter de payer le stock en avance. Objectif : consignation ou paiement à 60 jours. Cela préserve la trésorerie pour l\'adaptation et le marketing. Levier : MBF Cosmétique assure toute la mise en marché locale.',
        'fort', 'critique', 'Accord distribution'
      ),
      this.creerRecommandation(
        'Fixer les prix MAD avec une marge brute minimum 50%',
        'COGS import = 254 MAD. Prix minimum pour 50% marge = 508 MAD. Viser 450–550 MAD sur les sérums. En dessous de 350 MAD, la marge ne couvre pas le marketing. Le Kit Starter 249 MAD est un produit d\'acquisition (marge sacrifice acceptée).',
        'fort', 'critique', 'Avant lancement'
      ),
      this.creerRecommandation(
        'Ouvrir une SAS en France pour optimiser les flux import',
        'Une structure française de MBF Cosmétique permet : achat direct à routines.fr en euros (évite double marge), numéro TVA intracommunautaire, accès Bpifrance. Coût : 1 500 EUR. Rentabilisé en 2 mois sur les économies de marge.',
        'fort', 'haute', 'M2'
      ),
      this.creerRecommandation(
        'Mettre en place un tableau de bord financier hebdomadaire dès J1',
        'Tracker chaque semaine : stock disponible (unités), CA semaine, marge nette, CAC, trésorerie nette. Alerte si trésorerie < 50 000 MAD. Outil : Google Sheets partagé ou Notion.',
        'fort', 'haute', 'J1'
      ),
      this.creerRecommandation(
        'Ne pas réinvestir le CA avant M4 — reconstituer le stock en priorité',
        'Le délai import France → Maroc est de 2–4 semaines. Avec du délai de reformulation, une rupture de stock peut immobiliser le business 6 semaines. Toujours garder 6 semaines de stock tampon.',
        'fort', 'haute', 'Règle permanente'
      ),
    ];

    const kpis = [
      this.creerKPI('Marge brute (import + adaptation)', 53, '%', 'Continu'),
      this.creerKPI('CA M12 (scénario réaliste)', ca_m12_realiste / 1000, 'K MAD', 'M12'),
      this.creerKPI('Break-even mensuel', 8, 'mois', 'M8'),
      this.creerKPI('Trésorerie buffer minimum', 50000, 'MAD', 'Permanent'),
      this.creerKPI('Stock tampon (semaines)', 6, 'semaines', 'Permanent'),
      this.creerKPI('COGS par unité (import + adapt.)', 254, 'MAD', 'M3'),
    ];

    this.envoyerMessage('operations', 'Contrainte stocks import',
      'Délai réapprovisionnement France : 3–4 semaines. Maintenir 6 semaines de stock tampon en permanence. Commander quand stock = 8 semaines restantes.',
      { stock_initial: INVESTISSEMENT_INITIAL.stock_initial_import });

    return this.creerResultat(analyse, recommandations, kpis, [
      'RISQUE CHANGE — MAD/EUR fluctue. Si l\'EUR monte de 5%, COGS en MAD augmente de 12 MAD/unité. Surveiller le taux et provisionner.',
      'Trésorerie critique : les délais import + certif + adaptation = 6–8 mois avant retour sur investissement. Ne pas sous-capitaliser.',
      'TVA import Maroc (20%) est récupérable si MBF est assujetti TVA — ne pas oublier de s\'immatriculer avant le premier import.',
    ]);
  }
}
