import { AgentBase } from '../base.agent.js';
import type { AgentContext, AgentResult } from '../types.js';
import { ROUTINES_FR_BRAND, ECARTS_CULTURELS } from '../data/routines-fr.data.js';

const CONFORMITE_MAROC = {
  loi_applicable: 'Loi n°17-04 du 23 novembre 2004 (Code du Médicament et de la Pharmacie)',
  organisme: 'Direction du Médicament et de la Pharmacie (DMP) — Ministère de la Santé Maroc',
  article_cle: 'Art. 10 : Tout produit cosmétique importé doit faire l\'objet d\'une déclaration préalable',
  exigences_import: [
    'Déclaration préalable à la DMP avec dossier technique complet',
    'Safety Assessment signé par toxicologue reconnu',
    'Étiquetage bilingue OBLIGATOIRE : arabe + français (Art. 11)',
    'Coordonnées de l\'importateur marocain désigné (MBF Cosmétique)',
    'Certificat d\'origine + Certificat de libre vente du pays d\'origine (France)',
    'Liste INCI complète + fiches sécurité (MSDS) de chaque ingrédient',
    'Rapport d\'évaluation toxicologique',
    'Numéro de lot + date limite d\'utilisation (PAO)',
  ],
  cout_par_sku_mad: 8000,
  delai_par_sku: '6–8 semaines',
  delai_total_6skus: '3–4 mois (demandes en parallèle)',
};

const HALAL_IMANOR = {
  standard: 'NM 08.0.800 (norme marocaine) + OIC/SMIIC 1:2019',
  organisme: 'IMANOR — Institut Marocain de Normalisation (Rabat)',
  scope_audit: [
    'Vérification absence alcool éthylique > 0.1% dans les formules',
    'Absence de tout dérivé porcin (gélatine, acide stéarique porcin)',
    'Absence de sang, os, graisse animale non halal',
    'Vérification Longevity Complex™ : composants et procédés de synthèse',
    'Audit du site de fabrication (France) ou du CMO Maroc',
    'Traçabilité complète de la chaîne d\'approvisionnement',
  ],
  points_vigilance_routines_fr: [
    'Longevity Complex™ : composition exacte à vérifier (dérivés marins ? collagène animal ?)',
    'Collagen Boost Serum : le collagène peut être d\'origine bovine ou marine — vérifier halal',
    'Conservateurs : phénoxyéthanol acceptable halal, alcool benzylique à surveiller',
    'Skin Beauty Collagen : "collagène" = mot-clé halal sensible (source bovine, porcine, ou marine)',
  ],
  cout_initial_mad: 15000,
  cout_renouvellement_mad: 6000,
  delai: '3–6 mois',
  validite: '3 ans avec audit annuel',
};

const PROPRIETE_INTELLECTUELLE = {
  situation: 'routines.fr est une marque française — MBF Cosmétique doit vérifier les droits de distribution exclusive Maroc',
  accord_distribution: [
    'Contrat de distribution exclusive Maroc + France (ou Maroc seul)',
    'Droits d\'adaptation des formules et du packaging',
    'Droits de sous-traitance à un CMO marocain',
    'Clause de propriété intellectuelle sur les adaptations locales',
    'Exclusivité géographique : Maroc + éventuellement MENA',
  ],
  ompic_maroc: {
    action: 'Déposer "routines.fr by MBF Cosmétique" à l\'OMPIC',
    classes: ['Classe 3 (cosmétiques)', 'Classe 35 (vente au détail + e-commerce)'],
    cout_mad: 3500,
    delai: '3–6 mois',
  },
  risque: 'Sans accord de distribution signé avec routines.fr France, toute vente et adaptation est illégale.',
};

const ECOMMERCE_LEGAL = {
  cgu_maroc: [
    'Mentions légales avec coordonnées MBF Cosmétique (siège social Maroc)',
    'CGV incluant droit de rétractation 7 jours (Maroc, loi 31-08 protection consommateur)',
    'Politique retour et remboursement claire',
    'Prix TTC affichés en MAD (obligatoire)',
  ],
  rgpd_france: [
    'Consentement cookies conforme RGPD si visiteurs français',
    'Politique de confidentialité bilingue',
    'Droit d\'accès, rectification, effacement des données personnelles',
    'Hébergement données UE recommandé pour les clients France',
  ],
};

export class LegalAgent extends AgentBase {
  readonly role = 'legal' as const;
  readonly domaine = 'Conformité Légale & Propriété Intellectuelle';
  readonly expertise = [
    'Droit cosmétique Maroc (Loi 17-04, DMP)',
    'Réglementation EU 1223/2009 + CPNP France',
    'Certification halal IMANOR — spécificités cosméceutiques',
    'Accord de distribution exclusive + propriété intellectuelle',
    'Protection des consommateurs Maroc (loi 31-08)',
  ];

  constructor(contexte: AgentContext) {
    super(contexte);
  }

  analyser(): AgentResult {
    const budget_legal = (CONFORMITE_MAROC.cout_par_sku_mad * 6)
      + HALAL_IMANOR.cout_initial_mad
      + PROPRIETE_INTELLECTUELLE.ompic_maroc.cout_mad
      + 15000; // avocats + CGV

    const analyse = `
## Conformité Légale — Import et Adaptation routines.fr au Maroc

### Situation de départ
routines.fr est une **marque DTC française de grade pharmaceutique**.
MBF Cosmétique veut importer, adapter et distribuer cette marque au Maroc.

**Prérequis ABSOLU avant toute opération commerciale :**
> Obtenir un accord de distribution/licence signé avec routines.fr France.

Sans ce document, toute importation, reformulation, ou vente est juridiquement risquée.

### 1. Accord de Distribution — Priorité n°1
${PROPRIETE_INTELLECTUELLE.accord_distribution.map(e => `- ${e}`).join('\n')}

**Dépôt OMPIC (protection locale de la marque)**
- Classes : ${PROPRIETE_INTELLECTUELLE.ompic_maroc.classes.join(' + ')}
- Coût : ${PROPRIETE_INTELLECTUELLE.ompic_maroc.cout_mad.toLocaleString()} MAD
- Délai : ${PROPRIETE_INTELLECTUELLE.ompic_maroc.delai}

### 2. Conformité Réglementaire Maroc (Loi 17-04)
**Loi** : ${CONFORMITE_MAROC.loi_applicable}
**Exigences import** :
${CONFORMITE_MAROC.exigences_import.map(e => `- ${e}`).join('\n')}

Coût par SKU : **${CONFORMITE_MAROC.cout_par_sku_mad.toLocaleString()} MAD** | Délai : ${CONFORMITE_MAROC.delai_par_sku}
**Total 6 SKUs : ${(CONFORMITE_MAROC.cout_par_sku_mad * 6).toLocaleString()} MAD** | ${CONFORMITE_MAROC.delai_total_6skus}

### 3. Certification Halal IMANOR — Enjeu Central
**Standard** : ${HALAL_IMANOR.standard}

**Points de vigilance spécifiques à routines.fr** :
${HALAL_IMANOR.points_vigilance_routines_fr.map(p => `⚠️  ${p}`).join('\n')}

**Scope de l'audit** :
${HALAL_IMANOR.scope_audit.map(s => `- ${s}`).join('\n')}

Coût : ${HALAL_IMANOR.cout_initial_mad.toLocaleString()} MAD | Durée : ${HALAL_IMANOR.delai}

### 4. Étiquetage Bilingue (Obligation Art. 11)
Chaque produit vendu au Maroc DOIT afficher en arabe ET en français :
${ROUTINES_FR_BRAND.certifications_manquantes_maroc.map(c => `- ${c}`).join('\n')}

### 5. E-commerce & Protection Consommateur
**Maroc (Loi 31-08)** :
${ECOMMERCE_LEGAL.cgu_maroc.map(e => `- ${e}`).join('\n')}

**France/EU (RGPD)** :
${ECOMMERCE_LEGAL.rgpd_france.map(e => `- ${e}`).join('\n')}

### Budget Légal Total Estimé
| Poste | Coût MAD |
|-------|---------|
| Déclarations DMP (6 SKUs) | ${(CONFORMITE_MAROC.cout_par_sku_mad * 6).toLocaleString()} |
| Certification Halal IMANOR | ${HALAL_IMANOR.cout_initial_mad.toLocaleString()} |
| Dépôt OMPIC | ${PROPRIETE_INTELLECTUELLE.ompic_maroc.cout_mad.toLocaleString()} |
| Avocats + CGV + contrats | ~15 000 |
| **TOTAL** | **~${budget_legal.toLocaleString()} MAD** |
    `.trim();

    const recommandations = [
      this.creerRecommandation(
        'Signer l\'accord de distribution avec routines.fr France — Semaine 1',
        'Contacter la direction de routines.fr pour négocier un accord de distribution exclusive Maroc + droits d\'adaptation locale. Sans ce document signé, RIEN d\'autre ne peut avancer. C\'est la fondation juridique de tout le projet.',
        'fort', 'critique', 'Semaine 1',
        ['Contact direct avec routines.fr France identifié', 'Avocat spécialisé distribution FR/MA']
      ),
      this.creerRecommandation(
        'Auditer le Longevity Complex™ pour la conformité halal AVANT de demander la certification',
        'Le collagène dans "Collagen Boost Serum" peut être d\'origine bovine, porcine ou marine. Si porcine = blocage total. Obtenir de routines.fr la composition exacte et la source animale avant d\'investir dans l\'audit IMANOR.',
        'fort', 'critique', 'Semaine 2–3',
        ['Accord de distribution signé', 'Communication avec formulation routines.fr']
      ),
      this.creerRecommandation(
        'Déposer OMPIC classe 3+35 dès la semaine 1',
        'Protéger "routines.fr by MBF Cosmétique" au Maroc avant tout investissement marketing. Coût : 3 500 MAD. Délai 3–6 mois mais la date de dépôt fait foi. Ne pas attendre.',
        'fort', 'critique', 'Semaine 1'
      ),
      this.creerRecommandation(
        'Obtenir le Certificat de Libre Vente auprès des autorités françaises',
        'Document délivré par l\'ANSM (France) attestant que le produit est légalement commercialisé en France. Obligatoire pour la déclaration DMP Maroc. Délai : 2–4 semaines. Demander via un intermédiaire ou directement à routines.fr France.',
        'fort', 'critique', 'M1'
      ),
      this.creerRecommandation(
        'Rédiger CGV bilingues conformes à la loi 31-08 (protection consommateur Maroc)',
        'La loi 31-08 oblige à afficher le droit de rétractation 7 jours (Maroc) + politique de retour claire. Faire rédiger par un avocat Casablanca spécialisé e-commerce. Budget : 5 000–8 000 MAD. Pas de copier-coller de CGV françaises.',
        'fort', 'haute', 'M1'
      ),
    ];

    const kpis = [
      this.creerKPI('Accord distribution routines.fr signé', 1, 'contrat', 'Sem. 2'),
      this.creerKPI('SKUs déclarés DMP Maroc', 6, 'produits', 'M4'),
      this.creerKPI('Certification Halal IMANOR obtenue', 1, 'cert.', 'M6'),
      this.creerKPI('Dépôt OMPIC enregistré', 1, 'dépôt', 'Sem. 1'),
      this.creerKPI('Étiquettes bilingues conformes', 6, 'SKUs', 'M3'),
    ];

    this.envoyerMessage('finance', 'Budget légal',
      `Total conformité légale : ~${budget_legal.toLocaleString()} MAD à provisionner en Y1.`,
      { budget_legal });
    this.envoyerMessage('produit', 'Urgence halal',
      'Vérifier la source du collagène dans Longevity Complex™ et Collagen Boost Serum avant tout autre engagement. Porcin = blocage total.',
      {});

    return this.creerResultat(analyse, recommandations, kpis, [
      'CRITIQUE — Sans accord de distribution signé avec routines.fr France : toute importation et vente = contrefaçon ou concurrence déloyale.',
      'Le collagène dans les produits routines.fr est une bombe halal potentielle. À vérifier en priorité absolue.',
      'Vente sans déclaration DMP = saisie des produits par les autorités marocaines + amende + interdiction.',
      'RGPD France : si le site routines.fr collecte des données de clientes françaises via l\'adaptation Maroc, une conformité RGPD complète est obligatoire.',
    ]);
  }
}
