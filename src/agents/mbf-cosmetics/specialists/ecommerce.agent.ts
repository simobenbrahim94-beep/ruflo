import { AgentBase } from '../base.agent.js';
import type { AgentContext, AgentResult } from '../types.js';
import { GRILLE_PRIX_ADAPTATION, PROTOCOLE_MAROC } from '../data/routines-fr.data.js';

const ARCHITECTURE_SITE = {
  domaine: 'routines.ma (recommandé) ou routines.fr/ma (sous-domaine)',
  note_domaine: 'routines.ma = identité forte Maroc. Vérifier disponibilité ANRT Maroc.',
  plateforme: 'Shopify (déjà utilisé par routines.fr France — demander accès au template ou dupliquer)',
  theme: 'Même thème que France (cohérence marque) + adaptation couleurs palette Maroc',
  langues: ['Français (principal)', 'Arabe (description produits + blog)'],
  paiements_maroc: [
    { methode: 'Amana COD', part_estimee: '65%', urgence: 'Critique — sans ça 65% des ventes perdues' },
    { methode: 'CMI (Carte Marocaine Interbank)', part_estimee: '25%', urgence: 'Critique — dossier à déposer semaine 1' },
    { methode: 'CIH Pay / Wafacash', part_estimee: '5%', urgence: 'Moyenne — activer en M3' },
    { methode: 'PayPal EUR (diaspora France)', part_estimee: '5%', urgence: 'Haute — pour clients France' },
  ],
};

const PAGES_ESSENTIELLES = [
  { page: 'Accueil', priorite: 'Critique', elements: 'Hero "Grade pharmaceutique français adapté pour vous", quiz peau CTA, 3 bestsellers, avis clients panel Maroc, badge halal dès certification' },
  { page: 'Le Protocole', priorite: 'Critique', elements: 'Expliquer les 4 étapes Prepare→Treat→Boost→Restore en français et arabe. Proposer le kit 3 étapes pour débutantes.' },
  { page: 'Sérum Anti-Taches', priorite: 'Critique', elements: 'Fiche produit dédiée avec avant/après clientes marocaines (phototype IV–VI), données cliniques, FAQ halal, prix 449 MAD' },
  { page: 'Kit Découverte Maroc', priorite: 'Critique', elements: 'Kit starter 249 MAD — porte d\'entrée. Mettre en avant "Résultats visibles en 14 jours"' },
  { page: 'Quiz Peau', priorite: 'Haute', elements: '5 questions (type peau, taches, âge, routine actuelle, objectif). Résultat = protocole personnalisé + email capture' },
  { page: 'Notre Histoire', priorite: 'Haute', elements: 'MBF Cosmétique + routines.fr France. Vidéo fondatrice. Pourquoi cette marque pour le Maroc.' },
  { page: 'Blog Routines', priorite: 'Haute', elements: 'Articles FR + AR. SEO "anti-taches", "routine soin visage maroc", "collagène peau". 2 articles/semaine.' },
  { page: 'FAQ Halal', priorite: 'Haute', elements: 'Page dédiée : "Nos produits sont-ils halal ?" Transparence totale sur la démarche certification.' },
];

const SEQUENCES_EMAIL_MAROC = [
  {
    nom: 'Bienvenue',
    declencheur: 'Inscription newsletter / création compte',
    emails: [
      { j: 0, sujet: 'Bienvenue dans le Club Routines — ton guide de démarrage', contenu: 'Histoire routines.fr + MBF + guide "par où commencer"' },
      { j: 3, sujet: 'Ton type de peau détermine ta routine — fais le quiz', contenu: 'CTA quiz peau → recommandation personnalisée' },
      { j: 7, sujet: 'Les 3 étapes que font les femmes avec le plus beau teint', contenu: 'Éducation protocole Prepare→Treat→Restore + offre kit starter' },
    ],
  },
  {
    nom: 'Abandon Panier',
    declencheur: 'Panier abandonné > 30min',
    emails: [
      { j: 0, sujet: 'Tu as oublié quelque chose 🌿', contenu: 'Rappel produit + avant/après + avis client' },
      { j: 1, sujet: 'Témoignage : "En 28 jours, j\'ai vu la différence"', contenu: 'Social proof fort + CTA retour panier' },
      { j: 3, sujet: 'Code promo -10% — expire dans 24h', contenu: 'Offre urgence + scarcity' },
    ],
  },
  {
    nom: 'Post-Achat',
    declencheur: 'Commande confirmée',
    emails: [
      { j: 0, sujet: 'Ta commande est confirmée — voici comment commencer', contenu: 'Confirmation + guide routine + QR vidéo tuto' },
      { j: 7, sujet: 'Tu utilises ton sérum correctement ?', contenu: 'Conseils application + FAQ erreurs communes' },
      { j: 21, sujet: 'Partage tes premiers résultats', contenu: 'UGC request + hashtag + code ambassadeur' },
      { j: 30, sujet: 'Il est temps de passer à l\'étape suivante', contenu: 'Upsell : si kit starter → proposer sérum complet' },
    ],
  },
];

const CRO_SPECIFIQUE_MAROC = [
  { optimisation: 'Badge "Fabriqué en France" visible sur chaque fiche', impact: '+18% conversion (signal qualité fort)', urgence: 'J1' },
  { optimisation: 'Badge "Halal certifié" dès certification obtenue', impact: '+25% conversion auprès de la cible principale', urgence: 'Dès certif halal' },
  { optimisation: 'Affichage prix en MAD (pas EUR)', impact: 'Évite friction cognitive — prix EUR perçus comme chers', urgence: 'J1' },
  { optimisation: 'Bouton "Commander + Payer à la livraison (COD)"', impact: '+65% accessibilité clients', urgence: 'J1' },
  { optimisation: 'Photos modèles avec phototype IV–VI (peaux marocaines)', impact: '+30% identification et confiance', urgence: 'M1' },
  { optimisation: 'Avis clients avec prénom marocain + ville', impact: '+22% confiance vs avis anonymes', urgence: 'M2 (après premiers achats)' },
  { optimisation: 'Quiz peau interactif → recommandation de routine', impact: 'CVR x2.6 vs navigation libre', urgence: 'M2' },
  { optimisation: 'Chat WhatsApp visible sur chaque page', impact: '-35% abandon panier (questions SAV)', urgence: 'J1' },
];

export class EcommerceAgent extends AgentBase {
  readonly role = 'ecommerce' as const;
  readonly domaine = 'E-commerce & Expérience Digitale Maroc';
  readonly expertise = [
    'Shopify Maroc (CMI, COD, configuration locale)',
    'Conversion Rate Optimization (CRO) pour marché marocain',
    'Protocole produit digital (Prepare → Treat → Boost → Restore)',
    'Email marketing automation (Klaviyo)',
    'SEO bilingue FR/AR + blog beauté Maroc',
  ];

  constructor(contexte: AgentContext) {
    super(contexte);
  }

  analyser(): AgentResult {
    const analyse = `
## E-commerce — routines.fr Maroc

### Domaine et Architecture
- **Domaine recommandé** : ${ARCHITECTURE_SITE.domaine}
- **Note** : ${ARCHITECTURE_SITE.note_domaine}
- **Plateforme** : ${ARCHITECTURE_SITE.plateforme}

### Paiements — Configuration Critique Maroc
| Méthode | Part estimée | Urgence |
|---------|-------------|---------|
${ARCHITECTURE_SITE.paiements_maroc.map(p =>
  `| **${p.methode}** | ${p.part_estimee} | ${p.urgence} |`
).join('\n')}

### Présentation du Protocole sur le Site
Adapter le protocole routines.fr pour le marché marocain :

**Protocole FR** : ${PROTOCOLE_MAROC.original_fr.join(' → ')}
**Protocole Maroc FR** : ${PROTOCOLE_MAROC.adapte_maroc_fr.join(' → ')}
**Protocole Maroc AR** : ${PROTOCOLE_MAROC.adapte_maroc_ar.join(' → ')}
**Starter Recommandé** : ${PROTOCOLE_MAROC.simplification_entry.starter_3etapes.join(' + ')}
→ *"${PROTOCOLE_MAROC.simplification_entry.message}"*

### Pages Prioritaires
${PAGES_ESSENTIELLES.map(p =>
  `**${p.page}** [${p.priorite}]\n  ${p.elements}`
).join('\n\n')}

### Optimisations CRO Spécifiques Maroc
| Optimisation | Impact | À activer |
|-------------|--------|---------|
${CRO_SPECIFIQUE_MAROC.map(c =>
  `| ${c.optimisation} | ${c.impact} | ${c.urgence} |`
).join('\n')}

### Séquences Email (Klaviyo)
${SEQUENCES_EMAIL_MAROC.map(s =>
  `**${s.nom}** — ${s.emails.length} emails\n${s.emails.map(e => `  J+${e.j}: "${e.sujet}"`).join('\n')}`
).join('\n\n')}

### Grille Tarifaire Affichée en MAD
${GRILLE_PRIX_ADAPTATION.exemples.map(e =>
  `- Produit ~${e.prix_eur}€ → **${e.prix_mad_psycho} MAD** (prix psychologique)`
).join('\n')}
- Kit Starter Découverte : **${GRILLE_PRIX_ADAPTATION.kit_entree} MAD** (porte d\'entrée)
    `.trim();

    const recommandations = [
      this.creerRecommandation(
        'Enregistrer le domaine routines.ma à l\'ANRT dès la semaine 1',
        'Aller sur registre.ma (ANRT Maroc) et enregistrer routines.ma. Coût : 100–300 MAD/an. Si déjà pris, utiliser routines.fr/ma (sous-domaine Shopify). Le .ma renforce l\'identité locale et le SEO Maroc.',
        'fort', 'haute', 'Semaine 1'
      ),
      this.creerRecommandation(
        'Déposer le dossier CMI (paiement carte marocaine) en semaine 1',
        'Le dossier CMI prend 2–4 semaines. Sans CMI, les cartes bancaires marocaines (CIH, Attijariwafa, BMCE) ne fonctionnent pas. Démarrer immédiatement : dossier RIB + RC + ICE + KBis.',
        'fort', 'critique', 'Semaine 1'
      ),
      this.creerRecommandation(
        'Mettre le "Grade Pharmaceutique Français" en première ligne de chaque fiche produit',
        'C\'est l\'argument de différenciation n°1 vs les marques locales. Visible sans scroller sur mobile. Format : badge ou ligne de texte : "Formulé en France | Grade Pharmaceutique | Testé Dermatologiquement".',
        'fort', 'critique', 'J1'
      ),
      this.creerRecommandation(
        'Créer une page dédiée au "Protocole Longevity en 3 étapes pour débutantes"',
        'Le protocole 4 étapes original peut intimider. Créer une version starter "3 étapes" avec le Kit Découverte. Cette page = landing page des campagnes publicitaires. CTA = "Commander le Kit Découverte — 249 MAD".',
        'fort', 'critique', 'J1'
      ),
      this.creerRecommandation(
        'Installer le bouton WhatsApp flottant sur toutes les pages',
        'Au Maroc, le premier réflexe d\'une consommatrice hésitante est d\'envoyer un message WhatsApp. Bouton flottant vers WhatsApp Business = -35% abandon panier. Activer via Tidio ou Shopify Chat widget.',
        'fort', 'haute', 'J1'
      ),
    ];

    const kpis = [
      this.creerKPI('Taux de conversion site (Maroc)', 3.5, '%', 'M3'),
      this.creerKPI('Panier moyen Shopify Maroc', 480, 'MAD', 'M3'),
      this.creerKPI('Taux d\'email capture (quiz + popup)', 9, '%', 'M3'),
      this.creerKPI('Taux de récupération abandon panier', 18, '%', 'M2'),
      this.creerKPI('Score page speed mobile', 85, '/100', 'M1'),
      this.creerKPI('Part COD vs paiement direct', 65, '%', 'M3'),
    ];

    this.envoyerMessage('marketing', 'Tracking configuré',
      'Meta Pixel + TikTok Pixel + Google Tag Manager actifs. Flux catalogue Meta configuré avec prix MAD. Klaviyo connecté. Partager audiences lookalike après 100 achats.',
      {});

    return this.creerResultat(analyse, recommandations, kpis, [
      'CMI Maroc : sans intégration CMI, 25% des clientes ne peuvent pas payer. Dossier à déposer semaine 1, délai 2–4 semaines.',
      'Prix EUR vs MAD : ne jamais afficher EUR sur le site Maroc. Les consommatrices voient le taux de change et comparent défavorablement.',
      'Mobile-first absolu : 76% du trafic e-commerce beauté Maroc vient du mobile. Tester sur iPhone ET Android marocains.',
    ]);
  }
}
