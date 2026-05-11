import { AgentBase } from '../base.agent.js';
import type { AgentContext, AgentResult } from '../types.js';

const INGREDIENTS_CLES = [
  { nom: 'Huile d\'Argan Bio', origine: 'Coopérative féminine Sous, Agadir', cert: 'Ecocert + Halal', coût_kg: 45 },
  { nom: 'Argile Rhassoul', origine: 'Moyen Atlas, Maroc', cert: 'Naturelle pure', coût_kg: 8 },
  { nom: 'Eau Florale de Rose', origine: 'Vallée des roses, Kelaa M\'Gouna', cert: 'Bio', coût_kg: 12 },
  { nom: 'Beurre de Cactus (Karité local)', origine: 'Maroc central', cert: 'Ecocert', coût_kg: 35 },
  { nom: 'Acide Hyaluronique (synthèse éthique)', origine: 'Fournisseur certifié EU', cert: 'INCI clean', coût_kg: 180 },
];

const FABRICANTS_MAROC = [
  { nom: 'Coprophac (Casablanca)', specialite: 'Cosmétiques hauts de gamme', moq: 500, delai: '8 semaines' },
  { nom: 'Skin Lab Morocco (Rabat)', specialite: 'Clean beauty, halal', moq: 300, delai: '10 semaines' },
  { nom: 'Cosmebio MA (Casablanca)', specialite: 'Bio certifié', moq: 1000, delai: '12 semaines' },
];

const CERTIFICATIONS_REQUISES = {
  maroc: ['Visa OMPIC-IMANOR', 'Déclaration Ministère de la Santé (Art. 10 loi 17-04)', 'Halal IMANOR'],
  france: ['CPNP (Cosmetic Products Notification Portal EU)', 'Responsible Person (RP) désigné', 'INCI list conforme EU 1223/2009'],
  international: ['Ecocert (optionnel mais différenciateur)', 'Cruelty-free (Leaping Bunny)'],
};

export class ProduitAgent extends AgentBase {
  readonly role = 'produit' as const;
  readonly domaine = 'Développement Produit & Formulation';
  readonly expertise = [
    'Réglementation cosmétique MA/EU',
    'Sourcing ingrédients naturels Maroc',
    'Contract manufacturing (CMO)',
    'Certifications halal/bio/clean',
    'Gestion qualité et sécurité produit',
  ];

  constructor(contexte: AgentContext) {
    super(contexte);
  }

  analyser(): AgentResult {
    const analyse = `
## Développement Produit — routines.fr

### Stratégie Formulation
Approche **"Heritage + Science"** :
- Ingrédients marocains iconiques (argan, rhassoul, rose) en position hero (>5% actif)
- Actifs scientifiquement validés en support (HA, niacinamide, panthenol)
- Formules clean : 0 paraben, 0 sulfate, 0 silicone, liste positive INCI

### Ingrédients Sourcing (circuit court Maroc)
${INGREDIENTS_CLES.map(i => `- **${i.nom}** — ${i.origine} | ${i.cert} | ~${i.coût_kg} EUR/kg`).join('\n')}

### Partenaires CMO Recommandés
${FABRICANTS_MAROC.map(f => `- **${f.nom}** : ${f.specialite} | MOQ ${f.moq} unités | délai ${f.delai}`).join('\n')}

**Recommandation** : Commencer avec **Skin Lab Morocco** (MOQ 300 = moins de capital immobilisé)

### Conformité Réglementaire
**Maroc** : ${CERTIFICATIONS_REQUISES.maroc.join(' + ')}
**France/EU** : ${CERTIFICATIONS_REQUISES.france.join(' + ')}

### Plan Formulation Y1 (6 SKUs)
1. Huile Argan Sérum (30ml) — coût COGS cible : 45 MAD / 4.5 EUR
2. Crème Jour SPF30 (50ml) — COGS cible : 65 MAD / 6.5 EUR
3. Nettoyant Doux (150ml) — COGS cible : 30 MAD / 3 EUR
4. Masque Rhassoul (100g) — COGS cible : 35 MAD / 3.5 EUR
5. Eau Florale Rose (100ml) — COGS cible : 20 MAD / 2 EUR
6. Kit Discovery (3x30ml) — COGS cible : 90 MAD / 9 EUR

**Marge brute cible : 68–72%** (prix cible vs COGS)
    `.trim();

    const recommandations = [
      this.creerRecommandation(
        'Signer avec Skin Lab Morocco dès M1',
        'Négocier un accord-cadre : 300 unités/SKU à J1, clause d\'augmentation à 1000 unités si sell-through >70% en 60 jours. Obtenir exclusivité formule 18 mois.',
        'fort', 'critique', 'Semaine 2–4',
        ['Budget initial formulation : 50 000–80 000 MAD', 'Brief formulation validé par brand']
      ),
      this.creerRecommandation(
        'Déposer CPNP France avant tout envoi vers UE',
        'La notification CPNP (gratuite via portail UE) est obligatoire. Désigner un Responsible Person en France (cabinet spécialisé ~500 EUR/an).',
        'fort', 'critique', 'M1',
        ['Formules finalisées avec INCI list complète']
      ),
      this.creerRecommandation(
        'Obtenir certification Halal IMANOR dès le départ',
        'L\'audit IMANOR Halal (≈15 000 MAD) est un différenciateur commercial fort sur les deux marchés. Positionner comme standard, pas comme option.',
        'fort', 'haute', 'M2–M3'
      ),
      this.creerRecommandation(
        'Sourcer l\'argan via coopérative féminine certifiée',
        'Partenariat direct avec 1 coopérative (Taroudant/Agadir). Avantage : coût -20% vs intermédiaires + storytelling fort + label équitable.',
        'fort', 'haute', 'M1',
      ),
      this.creerRecommandation(
        'Tester les formules sur 20 "beta-testers" locaux',
        'Recrutement via Instagram. Formulaires dermatologiques. Retours à intégrer avant production série. Budget : 0 (produits gratuits contre feedback).',
        'moyen', 'haute', 'M2'
      ),
    ];

    const kpis = [
      this.creerKPI('COGS moyen pondéré', 48, 'MAD/unité', 'Production Y1'),
      this.creerKPI('Marge brute produit', 70, '%', 'M6'),
      this.creerKPI('Taux de défauts QC', 0.5, '%', 'Continu'),
      this.creerKPI('Délai formulation → stock', 10, 'semaines', 'M3'),
    ];

    this.envoyerMessage('operations', 'Brief fabrication',
      'CMO recommandé : Skin Lab Morocco. MOQ 300 unités. 6 SKUs Y1. Délai 10 semaines. Besoin logistique inbound matières premières.',
      { fabricants: FABRICANTS_MAROC, skus_count: 6 });
    this.envoyerMessage('legal', 'Checklist conformité',
      'Besoin CPNP France + Déclaration MS Maroc + Halal IMANOR. Fournir template INCI list validée pour chaque formule.',
      { certifications: CERTIFICATIONS_REQUISES });

    return this.creerResultat(analyse, recommandations, kpis, [
      'Jamais lancer en France sans CPNP : risque douanier + retrait de marché.',
      'Vérifier que l\'huile d\'argan sourcing est tracée (lutte contre fraudes + export MAR).',
      'Tester la stabilité des formules (6 mois minimum) avant lancement grande série.',
    ]);
  }
}
