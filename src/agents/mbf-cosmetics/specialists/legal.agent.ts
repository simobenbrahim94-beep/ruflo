import { AgentBase } from '../base.agent.js';
import type { AgentContext, AgentResult } from '../types.js';

const REGLEMENTATIONS = {
  maroc: {
    loi: 'Loi n°17-04 du 23 novembre 2004 (Code du Médicament et de la Pharmacie)',
    organisme: 'Direction du Médicament et de la Pharmacie (DMP) — Ministère de la Santé',
    exigences: [
      'Déclaration préalable avant mise sur le marché',
      'Dossier sécurité produit (safety assessment)',
      'Rapport évaluation toxicologique',
      'Étiquetage bilingue (arabe + français) obligatoire',
      'Coordonnées fabricant/responsable local obligatoires',
    ],
    cout_enregistrement: '5 000–15 000 MAD par produit',
    delai: '4–8 semaines',
  },
  france_eu: {
    reglement: 'Règlement UE n°1223/2009 sur les produits cosmétiques',
    portail: 'CPNP (Cosmetic Products Notification Portal)',
    exigences: [
      'Notification CPNP obligatoire (gratuite)',
      'Responsible Person (RP) établi en UE — désigner avant tout import',
      'Product Information File (PIF) complet',
      'Safety Assessment signé par toxicologue qualifié',
      'INCI list complète + concentration si substance réglementée',
      'Pas de substances interdites (Annexe II Règlement)',
    ],
    cout_rp: '500–1200 EUR/an (cabinet de conseil)',
  },
  halal: {
    standard: 'OIC/SMIIC 1:2019 + NM 08.0.800 (norme marocaine)',
    organisme: 'IMANOR (Institut Marocain de Normalisation)',
    cout_audit: '12 000–18 000 MAD initial + 6 000 MAD/an renouvellement',
    duree: '3–6 mois',
  },
};

const IP_PROTECTION = {
  maroc_ompic: { delai: '3–6 mois', cout: '2 500–4 000 MAD', classes: ['Classe 3 : cosmétiques', 'Classe 35 : services e-commerce'] },
  france_inpi: { delai: '6–12 mois', cout: '250–400 EUR', classes: ['Classe 3 : cosmétiques'] },
  euipo: { delai: '4–6 mois', cout: '850–1 000 EUR', validite: '10 ans, renouvelable', note: 'Protège les 27 pays EU en 1 dépôt' },
};

export class LegalAgent extends AgentBase {
  readonly role = 'legal' as const;
  readonly domaine = 'Conformité Légale & Propriété Intellectuelle';
  readonly expertise = [
    'Droit cosmétique Maroc (Loi 17-04)',
    'Réglementation EU 1223/2009',
    'Certification halal IMANOR',
    'Propriété intellectuelle (OMPIC/EUIPO)',
    'E-commerce & RGPD',
  ];

  constructor(contexte: AgentContext) {
    super(contexte);
  }

  analyser(): AgentResult {
    const analyse = `
## Conformité Légale & Protection IP — routines.fr / MBF Cosmétique

### 1. Réglementation Maroc
**Loi applicable** : ${REGLEMENTATIONS.maroc.loi}
**Organisme** : ${REGLEMENTATIONS.maroc.organisme}

Exigences obligatoires :
${REGLEMENTATIONS.maroc.exigences.map(e => `- ${e}`).join('\n')}

→ Coût estimé : ${REGLEMENTATIONS.maroc.cout_enregistrement} | Délai : ${REGLEMENTATIONS.maroc.delai}

### 2. Réglementation France / Union Européenne
**Règlement** : ${REGLEMENTATIONS.france_eu.reglement}
${REGLEMENTATIONS.france_eu.exigences.map(e => `- ${e}`).join('\n')}

→ RP (Responsible Person) coût annuel : ${REGLEMENTATIONS.france_eu.cout_rp}

### 3. Certification Halal
**Standard** : ${REGLEMENTATIONS.halal.standard}
**Organisme** : ${REGLEMENTATIONS.halal.organisme}
→ Coût : ${REGLEMENTATIONS.halal.cout_audit} | Durée : ${REGLEMENTATIONS.halal.duree}

### 4. Protection de la Marque
| Territoire | Organisme | Coût | Délai |
|-----------|-----------|------|-------|
| Maroc | OMPIC | ${IP_PROTECTION.maroc_ompic.cout} | ${IP_PROTECTION.maroc_ompic.delai} |
| France | INPI | ${IP_PROTECTION.france_inpi.cout} | ${IP_PROTECTION.france_inpi.delai} |
| EU (27 pays) | EUIPO | ${IP_PROTECTION.euipo.cout} | ${IP_PROTECTION.euipo.delai} |

**Recommandation** : Déposer OMPIC + EUIPO simultanément (EUIPO couvre la France).

### 5. E-commerce & RGPD (site routines.fr)
- Mentions légales + CGV + Politique de confidentialité obligatoires (France)
- Consentement cookies (RGPD Art. 7) : utiliser banner conforme
- Droit de rétractation 14 jours pour consommateurs EU
- Hébergement données UE recommandé (OVH/Scaleway)
    `.trim();

    const recommandations = [
      this.creerRecommandation(
        'Déposer trademark OMPIC + EUIPO en semaine 1',
        'Priorité absolue avant tout investissement marketing. Classe 3 (cosmétiques) + Classe 35 (retail en ligne). Budget total : 3 500–5 000 EUR.',
        'fort', 'critique', 'Semaine 1'
      ),
      this.creerRecommandation(
        'Désigner un Responsible Person EU avant export vers France',
        'Sans RP désigné, aucun produit ne peut être légalement vendu en France. Cabinet spécialisé recommandé : 500–800 EUR/an. Trouver via FEBEA ou Cosmed.',
        'fort', 'critique', 'M1'
      ),
      this.creerRecommandation(
        'Démarrer l\'audit Halal IMANOR dès M1',
        'Processus long (3–6 mois). Initier immédiatement. L\'audit porte sur la formule + le site de fabrication. Briefer le CMO en conséquence.',
        'fort', 'haute', 'M1',
        ['CMO doit être pré-audité ou certifié halal']
      ),
      this.creerRecommandation(
        'Rédiger les CGV e-commerce conformes aux deux marchés',
        'Template CGV bilingue (FR/AR) avec clauses spécifiques : droit de rétractation 14j (EU), remboursement, livraison internationale MA↔FR. Faire valider par avocat.',
        'fort', 'haute', 'M1'
      ),
      this.creerRecommandation(
        'Créer le dossier PIF (Product Information File) pour chaque SKU',
        'Le PIF est exigé en EU. Contient : formule, safety assessment, test efficacité, INCI. Faire établir par un toxicologue agréé (prestataire externe 300–600 EUR/SKU).',
        'fort', 'critique', 'M2',
        ['Formules finales validées par CMO']
      ),
    ];

    const kpis = [
      this.creerKPI('SKUs notifiés CPNP France', 6, 'produits', 'M3'),
      this.creerKPI('SKUs déclarés DMP Maroc', 6, 'produits', 'M3'),
      this.creerKPI('Marques déposées (OMPIC+EUIPO)', 2, 'dépôts', 'M1'),
      this.creerKPI('Certification Halal IMANOR obtenue', 1, 'cert', 'M6'),
    ];

    this.envoyerMessage('finance', 'Budget légal',
      'Prévoir ~60 000–80 000 MAD de budget légal/conformité Y1 : enregistrements + RP EU + Halal + CGV.',
      { budget_legal_mad: 70000 });
    this.envoyerMessage('produit', 'Exigences INCI + PIF',
      'Chaque SKU doit avoir : INCI list complète, safety assessment toxicologue, test stabilité 6 mois. Prévoir prestataire toxicologie dès M1.',
      {});

    return this.creerResultat(analyse, recommandations, kpis, [
      'CRITIQUE : Vente en France sans CPNP = infraction réglementaire + risque douanier. Priorité absolue.',
      'Vérifier que le CMO dispose de l\'autorisation Ministère Santé Maroc (Art.10) pour sous-traiter.',
      'RGPD : Ne jamais collecter d\'email sans opt-in explicite. Amende jusqu\'à 4% du CA annuel.',
    ]);
  }
}
