import { AgentBase } from '../base.agent.js';
import type { AgentContext, AgentResult } from '../types.js';
import { ROUTINES_FR_BRAND } from '../data/routines-fr.data.js';

const PARCOURS_CLIENT_MAROC = [
  { etape: '1. Découverte', canal: 'TikTok / Instagram', action: 'Reel "routine en darija" → profil → lien bio', emotion: 'Curiosité + identification culturelle' },
  { etape: '2. Validation', canal: 'Site routines.ma', action: 'Badge "France + grade pharma" → FAQ halal → avis clientes marocaines', emotion: 'Confiance + réassurance' },
  { etape: '3. Premier achat', canal: 'Shopify', action: 'Kit Découverte 249 MAD ou sérum anti-taches → COD', emotion: 'Accessibilité + excitation' },
  { etape: '4. Réception colis', canal: 'Colis physique', action: 'Unboxing soigné + carte "Bienvenue dans le Club" + QR vidéo protocole', emotion: 'Joie + appartenance' },
  { etape: '5. Première utilisation', canal: 'Email J+7', action: 'Guide protocole + tips application + rappel résultats à 28j', emotion: 'Guidée + soutenue' },
  { etape: '6. Résultats (J+28)', canal: 'Email + WhatsApp', action: 'Demande avant/après + NPS + invitation programme Club Routines', emotion: 'Fierté si résultats + fidélité' },
  { etape: '7. Ambassadrice', canal: 'WhatsApp + Instagram', action: 'Code promo partageable + commission 10%', emotion: 'Prestige + appartenance communauté' },
];

const CLUB_ROUTINES = {
  nom: 'Club Routines Maroc',
  niveaux: [
    {
      niveau: 'Essentielle',
      condition: 'Toute cliente',
      avantages: ['Accès guides routines exclusifs', '-5% offerts le jour de ton anniversaire', 'Newsletter conseils beauté hebdo'],
    },
    {
      niveau: 'Experte',
      condition: '2 commandes ou 800+ MAD achetés',
      avantages: ['Livraison offerte dès 350 MAD', '-10% permanent', 'Invitation bêta-tests nouveaux produits', 'Kit surprise saisonnier'],
    },
    {
      niveau: 'Ambassadrice',
      condition: '4 commandes ou 3 parrainages ou 3 000+ MAD',
      avantages: ['Code promo personnel -15% partageable', 'Commission 10% sur ventes parrainées', 'Accès produits en avant-première', 'Invitation events pop-up Casablanca'],
    },
  ],
  outil: 'Smile.io (intégration Shopify, gratuit jusqu\'à 200 membres actifs)',
};

const SAV_MAROC = {
  canaux_prioritaires: [
    { canal: 'WhatsApp Business', note: 'Canal principal — 94% des Marocains l\'utilisent. Réponse < 2h.' },
    { canal: 'Instagram DM', note: 'Secondaire — répondre sous 4h en semaine.' },
    { canal: 'Email contact@routines.ma', note: 'Formel, pour réclamations et retours.' },
  ],
  horaires: '9h–20h du lundi au samedi (MAT)',
  kpi_temps_reponse: '< 2h WhatsApp, < 4h Instagram',
  politique_retour_maroc: {
    delai: '14 jours (au-delà de la loi 31-08 qui impose 7 jours — sur-livrer sur ce point)',
    processus: 'Client contacte WhatsApp → MBF envoie étiquette retour Amana → remboursement sous 5j ouvrés',
    note: 'Politique retour généreuse = signal confiance fort pour une marque inconnue',
  },
  gestion_insatisfaction: [
    '1. Remercier pour le retour (empathie immédiate)',
    '2. Ne jamais nier ou minimiser',
    '3. Proposer une solution sous 24h (remboursement OU remplacement)',
    '4. Si problème formulaire ou qualité : escalader vers produit',
    '5. Demander permission de partager le feedback en équipe (tourne en UGC positif)',
  ],
};

const CONTENUS_EDUCATION = [
  { titre: 'Le Protocole Longevity en 5 min', format: 'Vidéo Instagram', objectif: 'Comprendre les 4 étapes' },
  { titre: '"C\'est quoi le Longevity Complex™ ?"', format: 'Carrousel Instagram', objectif: 'Crédibilité scientifique' },
  { titre: 'Mon avant/après à 28 jours', format: 'TikTok + Instagram', objectif: 'Preuve efficacité + UGC' },
  { titre: '"Nos produits sont-ils halal ?" — Réponse transparente', format: 'Stories + article blog', objectif: 'Lever la barrière n°1' },
  { titre: 'Comment bien appliquer le sérum anti-taches', format: 'Reel darija', objectif: 'Réduction erreurs utilisateurs' },
  { titre: 'FAQ : Collagène — c\'est quoi ? C\'est pour moi ?', format: 'Carrousel + Article blog AR', objectif: 'Éducation + acquisition SEO' },
];

export class CustomerAgent extends AgentBase {
  readonly role = 'customer' as const;
  readonly domaine = 'Expérience Client & Fidélisation Maroc';
  readonly expertise = [
    'Parcours client DTC cosmétique Maroc',
    'Programme fidélité adapté aux comportements marocains',
    'SAV WhatsApp-first (modèle Maroc)',
    'Éducation client sur produit pharmaceutique',
    'NPS et gestion des avis sur marché MENA',
  ];

  constructor(contexte: AgentContext) {
    super(contexte);
  }

  analyser(): AgentResult {
    const analyse = `
## Expérience Client & Fidélisation — routines.fr Maroc

### Enjeu Spécifique
routines.fr est une marque **inconnue au Maroc** avec un positionnement **scientifique et premium**.
La consommatrice marocaine a besoin d\'être :
1. **Rassurée** sur la confiance (marque française, halal, testé)
2. **Éduquée** sur le protocole (concept longevité + 4 étapes = nouveau)
3. **Guidée** dans l\'utilisation (pour maximiser les résultats)
4. **Valorisée** pour fidéliser et transformer en ambassadrice

### Parcours Client Maroc (7 étapes)
${PARCOURS_CLIENT_MAROC.map(p =>
  `**${p.etape}** — ${p.canal}\n  Action : ${p.action}\n  Émotion cible : *${p.emotion}*`
).join('\n\n')}

### Programme de Fidélité — "${CLUB_ROUTINES.nom}"
${CLUB_ROUTINES.niveaux.map(n =>
  `**${n.niveau}** (${n.condition})\n${n.avantages.map(a => `  - ${a}`).join('\n')}`
).join('\n\n')}
Outil : **${CLUB_ROUTINES.outil}**

### SAV WhatsApp-First
${SAV_MAROC.canaux_prioritaires.map(c => `- **${c.canal}** : ${c.note}`).join('\n')}
Horaires : ${SAV_MAROC.horaires}

**Politique Retour** : ${SAV_MAROC.politique_retour_maroc.delai}
${SAV_MAROC.politique_retour_maroc.note}

**Protocole gestion insatisfaction** :
${SAV_MAROC.gestion_insatisfaction.map(g => `${g}`).join('\n')}

### Plan d'Éducation Client (Contenus)
${CONTENUS_EDUCATION.map(c =>
  `- **${c.titre}** [${c.format}] → *${c.objectif}*`
).join('\n')}

### Stratégie Avis Clients Maroc
- Email automatique J+28 (pas J+14 — laisser le temps aux résultats collagène/anti-taches de s\'installer)
- Objectif : 50 avis 4–5 étoiles avec prénom + ville marocains en M3
- Répondre à 100% des avis en 48h
- Les avis "avant/après" avec photo = 5× plus convaincants que texte seul → encourager activement

### Communauté "Club Routines — Maroc"
- Groupe WhatsApp privé pour les 200 premières clientes
- Partage de conseils, preview nouveaux arrivages
- Sondages sur prochaines gammes (co-création)
- Invitation à des événements pop-up (Casablanca, Rabat)
    `.trim();

    const recommandations = [
      this.creerRecommandation(
        'Créer une FAQ "Halal & Transparence" avant le lancement',
        'La première question de toute consommatrice marocaine sera "C\'est halal ?" Avoir une réponse transparente, honnête et documentée disponible dès J1 (page dédiée + pinned Stories Instagram). En attente de la certification, expliquer la démarche en cours.',
        'fort', 'critique', 'J1'
      ),
      this.creerRecommandation(
        'Inscrire une "experte beauté" marocaine pour animer le SAV et la communauté',
        'Une femme marocaine qui comprend la beauté locale, parle darija ET français, et maîtrise les produits routines.fr = profil idéal pour le SAV WhatsApp + community management. Budget : 3 000–5 000 MAD/mois. ROI : NPS +25 points.',
        'fort', 'critique', 'M1'
      ),
      this.creerRecommandation(
        'Inclure un "Passeport Protocole" dans chaque colis',
        'Carte A5 pliée : "Ton protocole Longevity en 4 étapes" illustré + QR code vers vidéo tuto. Recto = protocole complet, verso = "rejoins le Club Routines" avec QR WhatsApp. Coût : 2.5 MAD/carte. Impact NPS +18 points.',
        'fort', 'haute', 'J1 (inclure dans tous les colis)'
      ),
      this.creerRecommandation(
        'Lancer un défi "28 jours avant/après" dès M2',
        'Recruter 30 bêta-testers (nano-influenceurs + clientes satisfaites). Protocole documenté J0 → J28. Résultats publiés sur Instagram + TikTok. Données cliniques réelles sur phototypes marocains = contenu marketing le plus puissant.',
        'fort', 'haute', 'M2'
      ),
      this.creerRecommandation(
        'Appeler les clientes COD après livraison (24–48h)',
        'Un appel de 2 minutes "Avez-vous bien reçu votre commande ? Des questions sur le protocole ?" → NPS +30 points, réachat ×2. Budget : 30 min/j. ROI imbattable sur les 200 premières commandes. Construire la confiance manuellement.',
        'fort', 'haute', 'M1 (jusqu\'à 200 commandes)'
      ),
    ];

    const kpis = [
      this.creerKPI('NPS (Net Promoter Score)', 68, 'points', 'M3'),
      this.creerKPI('Taux réachat (M6)', 38, '%', 'M6'),
      this.creerKPI('Temps réponse SAV WhatsApp', 2, 'heures', 'Continu'),
      this.creerKPI('Avis 4–5 étoiles avec photo', 50, 'avis', 'M3'),
      this.creerKPI('Taux programme ambassadeur', 15, '% des clientes', 'M6'),
      this.creerKPI('Défi 28j participants', 30, 'participantes', 'M2'),
    ];

    this.envoyerMessage('marketing', 'Contenus éducation et UGC',
      `6 contenus éducatifs à créer avant lancement. Défi "28 jours" en M2 = pipeline UGC automatique. Résultats avant/après = pièce maîtresse des publicités.`,
      { contenus: CONTENUS_EDUCATION.map(c => c.titre) });

    return this.creerResultat(analyse, recommandations, kpis, [
      'La marque est INCONNUE au Maroc. Les 3 premiers mois, tout doit être fait manuellement : appels, messages, attention personnelle. C\'est l\'investissement le plus rentable.',
      'Ne jamais ignorer une réclamation publique (Instagram, Google). Une réponse professionnelle et empathique en public vaut 10 avis positifs.',
      `routines.fr n'a aucune notoriété presse au Maroc. Les avis clients locaux (avec prénom marocain + photo) valent 100× plus qu'un article générique.`,
    ]);
  }
}
