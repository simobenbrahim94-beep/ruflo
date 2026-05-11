import { AgentBase } from '../base.agent.js';
import type { AgentContext, AgentResult } from '../types.js';
import { ROUTINES_FR_BRAND, GAMMES_ROUTINES_FR, ECARTS_CULTURELS } from '../data/routines-fr.data.js';

const REFORMULATIONS_PRIORITAIRES = [
  {
    produit: 'Crème jour SPF30',
    probleme: 'SPF30 insuffisant pour l\'été marocain (IUV 10–12 en juillet–août)',
    action: 'Reformuler en SPF50+ PA+++ avec filtres minéraux (dioxyde de titane + oxyde de zinc)',
    cout_reformulation: '25 000–40 000 MAD (test + validation)',
    urgence: 'critique',
    timeline: 'M2–M4',
  },
  {
    produit: 'Sérum vitamine C',
    probleme: 'Formule optimisée phototypes I–III. Efficacité réduite sur phototypes IV–VI (peaux mates à foncées)',
    action: 'Ajouter niacinamide 5% + acide kojique 1% pour efficacité anti-taches sur peaux maghrébines',
    cout_reformulation: '15 000–25 000 MAD',
    urgence: 'critique',
    timeline: 'M1–M3',
  },
  {
    produit: 'Masque argile',
    probleme: 'Argile générique sans différenciation',
    action: 'Substituer 40% de l\'argile par rhassoul du Moyen Atlas (Maroc). Actif local + storytelling fort',
    cout_reformulation: '8 000–12 000 MAD (sourcing + reformulation mineure)',
    urgence: 'haute',
    timeline: 'M2–M3',
  },
  {
    produit: 'Huile démaquillante',
    probleme: 'Huile générique (jojoba Europe). Pas de différenciation locale',
    action: 'Substituer par baume démaquillant à base de beurre de karité + argan bio marocain (15% du volume)',
    cout_reformulation: '12 000–18 000 MAD',
    urgence: 'haute',
    timeline: 'M2–M3',
  },
];

const INGREDIENTS_LOCAUX_INTEGRATION = [
  { ingredient: 'Huile d\'argan bio', origine: 'Coopérative Aït Souss, Agadir', pct_formule: '3–8%', cout_kg_mad: 450, certification: 'Ecocert + Halal' },
  { ingredient: 'Rhassoul (argile volcanique)', origine: 'Moyen Atlas, Midelt', pct_formule: '20–40%', cout_kg_mad: 80, certification: 'Naturelle pure' },
  { ingredient: 'Eau florale de rose', origine: 'Vallée des roses, Kelaa M\'Gouna', pct_formule: '60–80%', cout_kg_mad: 120, certification: 'Bio certifié' },
  { ingredient: 'Beurre de karité (Maroc)', origine: 'Maroc central + Sahel MA', pct_formule: '5–15%', cout_kg_mad: 350, certification: 'Ecocert' },
  { ingredient: 'Acide kojique (fermentation)', origine: 'Fournisseur certifié UE', pct_formule: '1%', cout_kg_mad: 1800, certification: 'INCI clean, halal' },
];

const CERTIFICATIONS_MAROC = {
  halal: {
    organisme: 'IMANOR (Rabat)',
    standard: 'NM 08.0.800 + OIC/SMIIC 1:2019',
    exigences: ['Absence alcool éthylique > 0.1%', 'Absence dérivés porcins', 'Traçabilité ingrédients', 'Audit site fabrication'],
    cout_mad: 15000,
    duree: '3–6 mois',
    remarque: 'Le CMO doit également être audité halal. Choisir Skin Lab Morocco (déjà certifié).',
  },
  dmp_maroc: {
    organisme: 'Direction du Médicament et de la Pharmacie',
    exigences: ['Dossier technique complet', 'Étiquetage bilingue AR/FR', 'Safety assessment', 'Coordonnées importateur marocain'],
    cout_par_sku_mad: 8000,
    total_6skus: 48000,
    delai: '6–8 semaines par SKU',
  },
  etiquetage_obligatoire: [
    'Nom du produit en arabe + français',
    'Ingrédients INCI en latin (obligatoire)',
    'Poids net en arabe + latin',
    'Durée de conservation (PAO + DLUO)',
    'Coordonnées de l\'importateur marocain',
    'Pays d\'origine : "Fabriqué en France" ou "Formulé en France, conditionné au Maroc"',
  ],
};

export class ProduitAgent extends AgentBase {
  readonly role = 'produit' as const;
  readonly domaine = 'Développement Produit & Adaptation Formules';
  readonly expertise = [
    'Reformulation pour phototypes IV–VI (peaux maghrébines)',
    'Intégration ingrédients locaux marocains',
    'Certification halal IMANOR + DMP Maroc',
    'Adaptation climatique des formules (chaleur, humidité)',
    'Gestion CMO et contrôle qualité',
  ];

  constructor(contexte: AgentContext) {
    super(contexte);
  }

  analyser(): AgentResult {
    const cout_total_reformulation = REFORMULATIONS_PRIORITAIRES
      .reduce((sum, r) => sum + (r.cout_reformulation.split('–').map(Number)[0] ?? 0) * 1000, 0) / 1000;
    const cout_certifs = CERTIFICATIONS_MAROC.halal.cout_mad + CERTIFICATIONS_MAROC.dmp_maroc.total_6skus;

    const analyse = `
## Développement Produit — Adaptation routines.fr pour le Marché Marocain

### Situation de Départ
routines.fr est une marque **${ROUTINES_FR_BRAND.certifications_actuelles.join(', ')}**.
Ce qui manque pour le Maroc : **${ROUTINES_FR_BRAND.certifications_manquantes_maroc.join(' | ')}**.

Les formules françaises ont été développées pour phototypes I–III (peaux claires européennes).
Au Maroc : phototypes IV–VI dominants → certains actifs nécessitent un ajustement de concentration.

### Reformulations Prioritaires (par ordre d\'urgence)
${REFORMULATIONS_PRIORITAIRES.map((r, i) =>
  `**${i + 1}. ${r.produit}** [${r.urgence.toUpperCase()}]
  Problème : ${r.probleme}
  Action : ${r.action}
  Coût : ${r.cout_reformulation}
  Timeline : ${r.timeline}`
).join('\n\n')}

### Intégration Ingrédients Marocains (Différenciation)
${INGREDIENTS_LOCAUX_INTEGRATION.map(ing =>
  `- **${ing.ingredient}** (${ing.origine})
    Usage : ${ing.pct_formule} | Coût : ${ing.cout_kg_mad} MAD/kg | Cert : ${ing.certification}`
).join('\n')}

### Certifications Obligatoires Maroc

**Halal IMANOR**
- Organisme : ${CERTIFICATIONS_MAROC.halal.organisme}
- Exigences : ${CERTIFICATIONS_MAROC.halal.exigences.join(', ')}
- Coût : ${CERTIFICATIONS_MAROC.halal.cout_mad.toLocaleString()} MAD | Durée : ${CERTIFICATIONS_MAROC.halal.duree}
- ⚠️  ${CERTIFICATIONS_MAROC.halal.remarque}

**Déclaration DMP (Direction Médicament & Pharmacie)**
- ${CERTIFICATIONS_MAROC.dmp_maroc.exigences.join(', ')}
- Coût : ${CERTIFICATIONS_MAROC.dmp_maroc.cout_par_sku_mad.toLocaleString()} MAD/SKU × 6 = **${CERTIFICATIONS_MAROC.dmp_maroc.total_6skus.toLocaleString()} MAD total**
- Délai : ${CERTIFICATIONS_MAROC.dmp_maroc.delai}

**Étiquetage bilingue obligatoire** (Art. 11, loi 17-04) :
${CERTIFICATIONS_MAROC.etiquetage_obligatoire.map(e => `- ${e}`).join('\n')}

### Gammes Importées vs Adaptées

| Gamme (France) | Adaptation Maroc | Ingrédient local ajouté |
|---------------|-----------------|------------------------|
${GAMMES_ROUTINES_FR.map(g =>
  `| ${g.gamme} | ${g.adaptation_maroc.enjeu.substring(0, 50)}... | Voir reformulations |`
).join('\n')}

### Budget Produit — Adaptation Complète
| Poste | Coût MAD |
|-------|----------|
| Reformulations (4 produits) | ~${(cout_total_reformulation).toLocaleString()} |
| Certification Halal IMANOR | ${CERTIFICATIONS_MAROC.halal.cout_mad.toLocaleString()} |
| Déclarations DMP (6 SKUs) | ${CERTIFICATIONS_MAROC.dmp_maroc.total_6skus.toLocaleString()} |
| Tests cliniques panel marocain | ~20 000 |
| **TOTAL** | **~${(cout_total_reformulation + cout_certifs + 20000).toLocaleString()} MAD** |
    `.trim();

    const recommandations = [
      this.creerRecommandation(
        'Reformuler le sérum vitamine C pour phototypes IV–VI en priorité absolue',
        'Ajouter niacinamide 5% + kojique 1% au sérum vitamine C existant. Ce produit devient le héros anti-taches Maroc. Coût reformulation : 15–25K MAD. Sans ça, la promesse anti-taches est vide.',
        'fort', 'critique', 'M1–M3',
        ['Formule originale routines.fr transmise par CMO France', 'Accord marque pour adaptation locale']
      ),
      this.creerRecommandation(
        'Choisir Skin Lab Morocco comme CMO (déjà certifié halal)',
        'Le CMO doit impérativement être certifié halal pour que la certification produit soit valide. Skin Lab Morocco (Rabat) est pré-certifié halal et spécialisé clean beauty. MOQ 300 unités. Délai 10 semaines.',
        'fort', 'critique', 'Semaine 2',
        ['Signature accord de confidentialité (NDA)', 'Transmission formules routines.fr']
      ),
      this.creerRecommandation(
        'Réaliser des tests cliniques sur 30 femmes marocaines avant production série',
        'Panel : 30 femmes Casablanca/Rabat, phototypes IV–VI, âges 22–45. Tester tolérance, efficacité et sensations (texture, odeur). Budget : 15 000–20 000 MAD. Résultats = argument marketing (avant/après réels).',
        'fort', 'haute', 'M2–M3'
      ),
      this.creerRecommandation(
        'Sourcer l\'argan et le rhassoul en circuit direct coopérative',
        'Contact direct avec Aït Souss (argan) et groupement Midelt (rhassoul). Avantages : -20% sur prix négo vs distributeur, traçabilité totale, storytelling fort "ingrédient de source". Formaliser par contrat d\'approvisionnement annuel.',
        'fort', 'haute', 'M1'
      ),
      this.creerRecommandation(
        'Démarrer l\'audit IMANOR dès la signature du CMO',
        'L\'audit halal prend 3–6 mois. Initier dès M1. Sans halal, 65% des consommatrices marocaines ne considèrent pas l\'achat. C\'est la certification la plus impactante sur les ventes Maroc.',
        'fort', 'critique', 'M1',
        ['CMO Skin Lab Morocco certifié halal confirmé']
      ),
    ];

    const kpis = [
      this.creerKPI('SKUs reformulés (anti-taches + SPF50)', 2, 'produits', 'M4'),
      this.creerKPI('Certification Halal IMANOR obtenue', 1, 'certification', 'M6'),
      this.creerKPI('SKUs déclarés DMP Maroc', 6, 'produits', 'M4'),
      this.creerKPI('COGS moyen par unité', 55, 'MAD', 'Production M4'),
      this.creerKPI('Marge brute produit', 68, '%', 'M4'),
      this.creerKPI('Taux défauts QC', 0.3, '%', 'Continu'),
    ];

    this.envoyerMessage('legal', 'Dossiers réglementaires à préparer',
      `6 SKUs × DMP Maroc = ${CERTIFICATIONS_MAROC.dmp_maroc.total_6skus.toLocaleString()} MAD. Halal IMANOR = ${CERTIFICATIONS_MAROC.halal.cout_mad.toLocaleString()} MAD. Étiquetage bilingue obligatoire. Prévoir toxicologue pour safety assessment.`,
      { certifs: ['halal', 'dmp', 'etiquetage_bilingue'] });
    this.envoyerMessage('finance', 'Budget adaptation produit',
      `Total adaptation + certifs + tests : ~${(cout_total_reformulation + cout_certifs + 20000).toLocaleString()} MAD à prévoir en Y1.`,
      {});

    return this.creerResultat(analyse, recommandations, kpis, [
      'CRITIQUE — Ne jamais importer et vendre sans déclaration DMP Maroc. Risque saisie + amende + image.',
      'SPF50 obligatoire en été (juin–août). SPF30 sera perçu comme insuffisant par les consommatrices informées.',
      'Vérifier que les formules FR ne contiennent pas d\'alcool éthylique > 0.1% (bloquant pour certification halal).',
      'Certains conservateurs utilisés en France (phénoxyéthanol, chlorphénésine) sont limités en halal — vérifier avant reformulation.',
    ]);
  }
}
