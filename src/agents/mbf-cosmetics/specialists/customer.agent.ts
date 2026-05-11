import { AgentBase } from '../base.agent.js';
import type { AgentContext, AgentResult } from '../types.js';

const TOUCHPOINTS_PARCOURS = [
  { etape: 'Découverte', canal: 'Instagram/TikTok', action: 'Reel routine → clic profil → lien bio', emotion: 'Curiosité' },
  { etape: 'Considération', canal: 'Site routines.fr', action: 'Quiz peau → recommandation → fiche produit', emotion: 'Intérêt + confiance' },
  { etape: 'Achat', canal: 'Shopify checkout', action: 'Bundle → paiement CMI/COD → confirmation', emotion: 'Excitation' },
  { etape: 'Réception', canal: 'Colis physique', action: 'Unboxing premium → carte personnelle → QR tutoriel', emotion: 'Joie + surprise' },
  { etape: 'Utilisation', canal: 'Email J+7', action: 'Guide routine + FAQ → satisfaction survey', emotion: 'Satisfaction' },
  { etape: 'Fidélisation', canal: 'SMS + Email', action: 'Offre recharge → programme ambassadeur', emotion: 'Appartenance' },
];

const PROGRAMME_FIDELITE = {
  nom: 'Club Routines',
  niveaux: [
    { niveau: 'Essentiel', seuil: '0 MAD', avantages: 'Accès early sales, -5% birthday' },
    { niveau: 'Expert', seuil: '1 000 MAD achat cumulé', avantages: 'Livraison offerte, -10% permanente, kit surprise' },
    { niveau: 'Ambassadrice', seuil: '3 000 MAD ou 5 parrainages', avantages: 'Code promo partageable 15%, produits exclusifs, invitation events' },
  ],
  outil: 'Smile.io (intégration Shopify, gratuit jusqu\'à 200 membres)',
};

const SAV_STANDARDS = {
  canaux: ['WhatsApp Business (Maroc — principal)', 'Email contact@routines.fr', 'Instagram DM (moins de 24h)'],
  temps_reponse: '< 4h en heures ouvrées (9h–18h MAT)',
  politique_retour: '30 jours (Maroc) / 14 jours légaux (France)',
  script_reclamation: [
    'Empathie immédiate (ne jamais nier)',
    'Solution proposée sous 24h',
    'Remplacement ou remboursement sans friction',
    'Demander permission de partager le feedback en équipe',
  ],
};

export class CustomerAgent extends AgentBase {
  readonly role = 'customer' as const;
  readonly domaine = 'Expérience Client & Fidélisation';
  readonly expertise = [
    'Parcours client DTC beauté',
    'Programme fidélité e-commerce',
    'SAV et gestion des avis',
    'CRM et segmentation',
    'NPS et mesure satisfaction',
  ];

  constructor(contexte: AgentContext) {
    super(contexte);
  }

  analyser(): AgentResult {
    const analyse = `
## Expérience Client & Fidélisation — routines.fr

### Parcours Client (Customer Journey)
${TOUCHPOINTS_PARCOURS.map(t =>
  `**${t.etape}** → Canal: ${t.canal}\n  Action: ${t.action}\n  Émotion cible: ${t.emotion}`
).join('\n\n')}

### Programme de Fidélité — "${PROGRAMME_FIDELITE.nom}"
| Niveau | Seuil | Avantages |
|--------|-------|-----------|
${PROGRAMME_FIDELITE.niveaux.map(n => `| ${n.niveau} | ${n.seuil} | ${n.avantages} |`).join('\n')}

Outil : **${PROGRAMME_FIDELITE.outil}**

### Standards SAV
**Canaux** : ${SAV_STANDARDS.canaux.join(' | ')}
**Temps de réponse** : ${SAV_STANDARDS.temps_reponse}
**Politique retour** : ${SAV_STANDARDS.politique_retour}

**Script gestion réclamation** :
${SAV_STANDARDS.script_reclamation.map((s, i) => `${i + 1}. ${s}`).join('\n')}

### Stratégie Avis Clients
- Demander un avis Google + Shopify à J+14 (email automatique Klaviyo)
- Objectif : 50 avis authentiques en M3 (social proof pour les nouvelles visites)
- Répondre à 100% des avis (positifs et négatifs) sous 48h
- Intégrer les photos UGC clients sur les fiches produits

### CRM Segmentation (Klaviyo)
| Segment | Critère | Action |
|---------|---------|--------|
| Champions | ≥3 commandes | Programme ambassadeur |
| Loyaux | 2 commandes | Upsell gamme premium |
| À risque | 60j sans achat | Séquence réactivation |
| Nouveaux | 1 commande ≤30j | Nurturing + guide routine |
    `.trim();

    const recommandations = [
      this.creerRecommandation(
        'Ouvrir WhatsApp Business dès J1 comme canal SAV principal',
        'Au Maroc, WhatsApp est le canal de communication n°1. 94% d\'utilisation. Réponse < 4h = NPS +20 points. Utiliser WhatsApp Business API (Twilio ou WATI) dès 50+ messages/jour.',
        'fort', 'critique', 'J1'
      ),
      this.creerRecommandation(
        'Inclure une carte personnalisée manuscrite dans les 100 premiers colis',
        'Les 100 premiers clients sont vos plus précieux ambassadeurs. Une carte écrite à la main = 90% de chance de partage UGC + NPS proche de 100. Coût : temps + 1.5 MAD/carte.',
        'fort', 'critique', 'J1 – premiers 100 colis'
      ),
      this.creerRecommandation(
        'Lancer le programme ambassadeur "Club Routines" à M2',
        'Code parrainage personnel (15% offert à l\'ami) + 10% de commission. Mécanisme viral à coût marginal nul. Objectif : 30% des nouvelles commandes via parrainage en M6.',
        'fort', 'haute', 'M2'
      ),
      this.creerRecommandation(
        'Mesurer le NPS chaque mois et l\'afficher publiquement',
        'Email automatique J+7 : "Recommanderiez-vous routines.fr ?" (0–10). Afficher le NPS sur la homepage si > 70. Transparence = confiance = conversion.',
        'fort', 'haute', 'M1'
      ),
      this.creerRecommandation(
        'Créer une communauté privée Instagram/WhatsApp "Ma Routine Club"',
        'Groupe WhatsApp privé pour les 100 premières clientes. Partage de conseils, preview nouveaux produits, feedbacks. Coût zéro, engagement x3.',
        'moyen', 'moyenne', 'M2'
      ),
    ];

    const kpis = [
      this.creerKPI('NPS (Net Promoter Score)', 65, 'points', 'M3'),
      this.creerKPI('Taux rétention (repeat purchase M6)', 35, '%', 'M6'),
      this.creerKPI('Temps réponse SAV moyen', 3, 'heures', 'Continu'),
      this.creerKPI('Avis 5 étoiles collectés', 50, 'avis', 'M3'),
      this.creerKPI('Taux parrainage (commandes via code)', 20, '%', 'M6'),
    ];

    this.envoyerMessage('marketing', 'UGC et avis clients',
      'Automatiser demande avis J+14 via Klaviyo. Créer hashtag #MaRoutineMBF pour UGC. Objectif 200 posts en M6.',
      {});

    return this.creerResultat(analyse, recommandations, kpis, [
      'Un seul mauvais avis non répondu peut réduire le taux de conversion de 15%. Surveiller Google + Trustpilot quotidiennement.',
      'COD Maroc : appeler les clientes 24h après livraison pour vérifier la satisfaction. Converties en acheteuses fidèles si call bien mené.',
    ]);
  }
}
