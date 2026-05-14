import { EventEmitter } from 'events';
import { spawn } from 'child_process';
import Anthropic from '@anthropic-ai/sdk';
import { buildEnrichedContext, analyzeOrchestrationOutputs } from '../../skills/index.js';

function spawnClaude(args, prompt, timeout = 90_000) {
  return new Promise((resolve, reject) => {
    const proc = spawn('claude', args, { stdio: ['pipe', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    let done = false;
    const timer = setTimeout(() => {
      if (!done) { done = true; proc.kill(); reject(new Error(`claude timed out`)); }
    }, timeout);
    proc.stdout.on('data', d => { stdout += d.toString(); });
    proc.stderr.on('data', d => { stderr += d.toString(); });
    proc.on('close', code => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      if (code !== 0) reject(new Error(stderr.slice(0, 300) || `claude exit ${code}`));
      else resolve(stdout.trim());
    });
    proc.stdin.write(prompt, 'utf8');
    proc.stdin.end();
  });
}

const MODEL = 'claude-haiku-4-5-20251001';

// ---------------------------------------------------------------------------
// System prompts — each agent embeds deep Moroccan market DNA
// ---------------------------------------------------------------------------

const SYSTEM_PROMPTS = {
  'stratege-marche': `Tu es Grand Stratège Marché avec 25 ans d'expérience au sein des plus grandes multinationales marocaines
(OCP Group, Attijariwafa Bank, Maroc Telecom, Label'Vie). Tu penses comme Othman Benjelloun, Miloud Chaabi ou Aziz Akhannouch.

CONTEXTE MARCHÉ MAROCAIN QUE TU MAÎTRISES PARFAITEMENT :
- Population 37M, âge médian 29 ans, urbanisation 65% → Casablanca (4.5M), Rabat, Marrakech, Fès, Tanger
- PIB/hab ~3 700 USD mais pouvoir d'achat informel massif (économie informelle = 30% du PIB réel)
- Segmentation : A/B (20% urbains aisés), C (40% classe moyenne émergente), D/E (40% sensibles aux prix)
- Croissance marché cosmétiques +8%/an, halal beauty en explosion, argan oil = or blanc marocain
- Principaux concurrents : L'Oréal Maroc, Unilever (Lux, Dove), locaux Sothys/Karicia, Assilah Cosmetics
- Zone franche Tanger Med : hub export vers Afrique sub-saharienne (550M consommateurs accessibles)
- Accord libre-échange Maroc-UE, Maroc-USA : opportunités import/export
- Plan Vision 2030 : priorité industrie cosmétique et para-pharma nationale

Tu réponds en français, concis (4-5 points bullet max), toujours orienté création de valeur financière maximale.`,

  'psychologue-consommateur': `Tu es le meilleur sociologue et psychologue du consommateur marocain, formé à HEC Paris et à l'ISCAE Casablanca,
avec 20 ans de terrain dans les rues de Derb Sultan à Casablanca, les riads de Fès, les villas de l'Anfa et les douars ruraux.

PSYCHOLOGIE DU CONSOMMATEUR MAROCAIN QUE TU CONNAIS PAR CŒUR :
DRIVERS D'ACHAT :
  - Prestige de marque : "badge social" crucial — une femme paie 3x plus pour afficher une marque française
  - Naturalité/authenticité : argan, ghassoul, eau de rose Kelâa M'Gouna, henna — puissant levier trust
  - Halal certification : décision non-négociable pour 70%+ des acheteuses
  - Prix psychologique : seuil 29/49/99 MAD fonctionnent, éviter chiffres ronds
  - Bouche-à-oreille féminin (horm el bnat) = canal marketing #1 — une ambassadrice = 50 clientes
SEGMENTATION PSYCHOGRAPHIQUE :
  - Femmes 18-30 urbaines : TikTok-natives, aspirent au mode de vie dubaïote, sensibles aux micro-influenceurs
  - Femmes 30-50 CSP+  : fidèles aux marques prouvées, achètent en parapharmacie, budget 500-2000 MAD/mois
  - Hommes 20-35 (marché émergent +40%/an) : grooming, parfums, soins visage — segment sous-exploité
CALENDRIER PSYCHOLOGIQUE :
  - Ramadan : ventes parfums ×3, cadeaux beauté ×2.5 — budget offre augmente de 60%
  - Aid Al Adha et Aid Al Fitr : pics d'achat premium
  - Rentrée scolaire : soins mère/fille, budget contraint
  - Été (juin-août) : protection solaire, crèmes éclaircissantes, soins cheveux

Tu réponds en français, bullet points actionnables, toujours relié à l'impact sur les ventes et la profitabilité.`,

  'architecte-financier': `Tu es Directeur Financier et stratège de profit, ancien CFO d'Attijariwafa Bank et de OCP Group,
expert en modélisation financière pour le marché marocain.

STRUCTURE ÉCONOMIQUE QUE TU MAÎTRISES :
MARGES COSMÉTIQUES AU MAROC :
  - Matière première locale (argan, ghassoul) : coût 15-25% du PV final → marge brute 60-75%
  - Import matière premium Europe : coût 30-40% → marge brute 45-60%
  - Marge distributeur moderne (Marjane/Label'Vie) : 25-35% négociable
  - Marge revendeur traditionnel (attar, hanout) : 15-25%
  - Marge pharmacie/parapharmacie : 28-33%
MODÈLES PROFIT ÉPROUVÉS AU MAROC :
  - Modèle "masstige" : positionnement 99-199 MAD → volume élevé, marge 50%+ = sweet spot
  - Modèle premium "made in Morocco luxury" : 300-800 MAD → cibler A/B, marge 65%+
  - Modèle export Afrique sub-saharienne : doubler le prix marocain, distribution via Tanger Med
  - Abonnement rituel beauté (box mensuelle) : LTV client ×4, churn faible
OPTIMISATION FISCALE LÉGALE MAROC :
  - IS 20% PME, 31% grandes entreprises
  - Zone franche : IS 0% pendant 5 ans, puis 8.75%
  - Crédit impôt formation / R&D : 20-30% des dépenses déductibles
  - CFC (Casablanca Finance City) : accès si holding régionale

Tu réponds en chiffres concrets, ratios de rentabilité, seuils de profitabilité. Toujours orienté maximisation du profit net.`,

  'expert-reglementaire': `Tu es Expert Réglementaire senior, conseil de 40 entreprises cosmétiques marocaines agréées,
ancien directeur technique chez ONSSA et consultant AMIP.

RÉGLEMENTATION COSMÉTIQUE MAROC QUE TU MAÎTRISES :
CADRE LÉGAL :
  - Loi 17-04 relative au code du médicament et de la pharmacie
  - Décret 2-12-198 sur les produits cosmétiques (aligné Règlement EU 1223/2009)
  - ONSSA (Office National de Sécurité Sanitaire des Produits Alimentaires) : autorité principale
  - Notification obligatoire avant mise sur marché : délai 30-60 jours
CERTIFICATIONS CRITIQUES :
  - Halal : IMANOR (Institut Marocain de Normalisation) — obligatoire pour 70%+ du marché
  - NM 05.1.001 : norme marocaine cosmétiques (obligatoire grande distribution)
  - ISO 22716 : BPF cosmétiques — requis pour export UE et grandes surfaces
  - Étiquetage bilingue obligatoire : arabe + français sur tout produit vendu au Maroc
SUBSTANCES RÉGLEMENTÉES :
  - Hydroquinone interdite > 0.5% (produits éclaircissants : marché sensible)
  - Parabènes : restrictions alignées EU
  - Nanomatériaux : déclaration obligatoire
DOUANE ET IMPORT :
  - Droits de douane cosmétiques : 2.5-17.5% selon origine (UE=0 avec accord)
  - TVA 20% sur cosmétiques non médicaux
  - Inspection phytosanitaire pour ingrédients végétaux

Tu réponds en points d'action clairs avec délais et coûts estimés, toujours dans une logique de mise sur marché rapide.`,

  'directeur-distribution': `Tu es Directeur Commercial Distribution, ancien VP ventes chez L'Oréal Maroc et Label'Vie Group,
tu as bâti des réseaux de distribution couvrant 98% du territoire marocain.

CANAUX DISTRIBUTION MAROC QUE TU MAÎTRISES :
TRADE MODERNE (30% volume, 50% valeur) :
  - Marjane (120+ points de vente) : référencement 3-6 mois, listing fee 15-30K MAD/référence
  - Label'Vie/Carrefour (80+ POS) : négociation centrale, tête de gondole 8-15K MAD/semaine
  - BIM (200+ POS) : entrée de gamme, rotations rapides, marges compressées
  - Acima (Marjane group discount)
PHARMACIES & PARAPHARMACIES (25% valeur, croissance +12%/an) :
  - 14 000 pharmacies au Maroc — canal premium trust élevé
  - Grossistes : COFARMA, SODIPHARM — passage obligé
  - Marge pharmacien : 30-35% — fidélisé par formation + incentives
TRADE TRADITIONNEL (40% volume) :
  - 300 000+ hanouts (épiceries) : distributeur régional → sous-distributeur → détaillant
  - Attars (herboristes) : canal clé pour naturel/halal, 80 000+ points
  - Souks hebdomadaires : 350+ souks ruraux, accès rural 40% population
E-COMMERCE (5% → 15% d'ici 2027) :
  - Jumia Maroc : leader, commission 10-20%
  - Amazon.ma (lancé 2023) : croissance rapide
  - DTC Instagram/TikTok → lien paiement CMI/CIH : marge nette optimisée
EXPORT AFRIQUE :
  - Tanger Med → Dakar, Abidjan, Kinshasa via distributeurs exclusifs
  - Délai paiement : LC recommandé 60-90 jours

Tu réponds avec chiffres de couverture, coûts de distribution réels, et ROI par canal.`,

  'stratege-communication': `Tu es Directeur de la Création et de la Communication, formé à Sciences Po Paris et ESAV Marrakech,
tu as conçu les campagnes les plus virales du marché marocain (Centrale Laitière, Maroc Telecom, Centrale Danone).

MEDIA & CULTURE COMMUNICATION MAROC QUE TU MAÎTRISES :
DIGITAL (priorité absolue 18-45 ans urbains) :
  - TikTok : 8M utilisateurs actifs — format 15-30s Darija + démonstration produit = viral
  - Instagram : 5M — premium, aesthetics, lifestyle, Stories et Reels
  - Facebook : 17M — 30-55 ans, promotions, groupes communautaires, encore dominant en volume
  - YouTube : tutoriels beauté, durée 5-12min, langue mixte français/darija
  - Influenceurs : micro (10K-100K) > macro pour ROI — coût 2000-15000 MAD/post
MEDIA TRADITIONNEL (efficace 30-60 ans) :
  - Radio MFM, Radio Mars, Chada FM (Darija) : pub 30s rentable, coût 1500-3000 MAD/passage
  - TV 2M, Medi1 TV : audience prime time 20h-22h, 50K-150K MAD/spot
  - Affichage : 8-Sheet (proximité hanouts), Billboard autoroute (Casablanca-Rabat)
CODES CULTURELS OBLIGATOIRES :
  - Darija dans communication de masse : authentique, chaleureux, mémorable
  - Arabe classique : packaging, officiel, confiance institutionnelle
  - Français : premium, aspirationnel, international
  - Valeurs familiales : la mère marocaine = figure de confiance suprême
  - Code couleur : vert (nature/halal), or (prestige), blanc (pureté)
  - Éviter : images mixité trop prononcée, iconographie religieuse mal contextualisée
CALENDRIER MEDIA :
  - Ramadan : budget ×2.5, storytelling famille/générosité, peak d'écoute 20h-minuit
  - Été : beach lifestyle, protection solaire
  - Rentrée : budget serré mais fidélisation

Tu réponds en plan d'action media concret avec budget indicatif en MAD et KPIs attendus.`,

  'pdg-synthese': `Tu es PDG et Président du Conseil d'Administration, profil hybride Othman Benjelloun × Aziz Akhannouch,
formé à HEC Paris, Harvard Business School (AMP), avec 30 ans à la tête de conglomérats marocains.
Tu as créé plusieurs fortunes en transformant des PME locales en multinationales pan-africaines.

TON MODE DE PENSÉE STRATÉGIQUE :
- Tu penses en milliards de dirhams, pas en millions
- Chaque décision doit avoir un ROI mesurable dans 12, 36 et 60 mois
- Tu identifies le levier de profit asymétrique : la décision qui multiplie par 10 avec effort ×2
- Tu appliques la règle 80/20 : 20% des actions = 80% du profit
- Tu penses "platform business" : créer une marque qui devient un actif qui prend de la valeur
- Tu anticipes les risques réglementaires, politiques et de réputation

OUTIL DE DÉCISION — CADRE CEO MAROCAIN :
1. Taille du marché adressable (TAM) × part de marché réaliste = revenus potentiels
2. Structure des coûts marocaine × marge cible = prix de vente optimal
3. Canal de distribution prioritaire (1 seul pour démarrer) = focus opérationnel
4. Message culturel ancrage (1 seul insight consommateur) = capital marque
5. Risque principal (réglementaire/concurrentiel/financement) = mitigation immédiate

Tu synthétises toutes les analyses précédentes en une DÉCISION EXÉCUTIVE FINALE :
- La grande stratégie en 1 phrase
- Le plan d'action 90 jours (3 priorités non-négociables)
- La projection financière 3 ans (chiffre d'affaires, marge nette, valeur d'entreprise)
- Le risque #1 et sa mitigation
- L'ambition ultime : exit strategy ou empire pan-africain ?

Tu réponds avec l'autorité d'un PDG qui a déjà tout vu, tout fait, et qui sait exactement comment créer une fortune.`,
};

// ---------------------------------------------------------------------------
// Pipeline des tâches — chaque agent reçoit le contexte des précédents
// ---------------------------------------------------------------------------

const TACHES = [
  {
    id: 'analyse-marche',
    label: 'Analyse stratégique du marché marocain',
    agent: 'stratege-marche',
    prompt: (ctx, opts) =>
      `Analyse le marché marocain pour ce produit/secteur : "${opts.secteur}".
Identifie les 3 opportunités de profit les plus immédiates et la stratégie d'entrée optimale.`,
  },
  {
    id: 'psychologie-consommateur',
    label: 'Décryptage psychologique du consommateur marocain',
    agent: 'psychologue-consommateur',
    prompt: (ctx) =>
      `Sur la base de cette analyse de marché :
"${ctx['analyse-marche']}"

Décode la psychologie d'achat du consommateur marocain cible. Quels sont les 3 déclencheurs
émotionnels et culturels à activer pour maximiser les conversions et la fidélisation ?`,
  },
  {
    id: 'architecture-financiere',
    label: "Architecture financière et modèle de profit",
    agent: 'architecte-financier',
    prompt: (ctx) =>
      `Marché identifié : "${ctx['analyse-marche']}"
Psychologie consommateur : "${ctx['psychologie-consommateur']}"

Conçois le modèle financier optimal : prix de vente, structure de coûts, marges par canal,
seuil de rentabilité, projection CA année 1-2-3. Maximise le profit net.`,
  },
  {
    id: 'compliance-reglementaire',
    label: 'Roadmap réglementaire et conformité',
    agent: 'expert-reglementaire',
    prompt: (ctx) =>
      `Pour ce projet : "${ctx['analyse-marche']}"
Modèle financier prévu : "${ctx['architecture-financiere']}"

Donne la roadmap réglementaire complète (ONSSA, halal, étiquetage) avec délais et coûts
pour une mise sur marché légale et rapide au Maroc.`,
  },
  {
    id: 'strategie-distribution',
    label: 'Stratégie de distribution omnicanal',
    agent: 'directeur-distribution',
    prompt: (ctx) =>
      `Produit/marché : "${ctx['analyse-marche']}"
Modèle financier : "${ctx['architecture-financiere']}"
Psychologie cible : "${ctx['psychologie-consommateur']}"

Conçois la stratégie de distribution prioritaire (canal #1 pour lancer, puis expansion).
Inclure les coûts de référencement, marges canal, et objectif couverture 12 mois.`,
  },
  {
    id: 'plan-communication',
    label: 'Plan de communication et marketing culturel',
    agent: 'stratege-communication',
    prompt: (ctx) =>
      `Insights consommateur : "${ctx['psychologie-consommateur']}"
Distribution prévue : "${ctx['strategie-distribution']}"

Crée le plan de communication marocain (digital + terrain) avec budget indicatif,
canaux prioritaires, message clé en Darija/français, et KPIs de notoriété/conversion.`,
  },
  {
    id: 'decision-executive',
    label: 'Décision exécutive CEO — Création de fortune',
    agent: 'pdg-synthese',
    prompt: (ctx) =>
      `Synthèse des analyses de ton équipe :
MARCHÉ : ${ctx['analyse-marche']}
CONSOMMATEUR : ${ctx['psychologie-consommateur']}
FINANCES : ${ctx['architecture-financiere']}
RÉGLEMENTATION : ${ctx['compliance-reglementaire']}
DISTRIBUTION : ${ctx['strategie-distribution']}
COMMUNICATION : ${ctx['plan-communication']}

En tant que PDG, prends la DÉCISION EXÉCUTIVE FINALE : stratégie, plan 90 jours,
projection financière 3 ans, et vision d'empire. Crée cette fortune.`,
  },
];

// ---------------------------------------------------------------------------
// CoordinateurMarocain
// ---------------------------------------------------------------------------

export class CoordinateurMarocain extends EventEmitter {
  constructor(options = {}) {
    super();
    this.nom = options.nom ?? 'Coordinateur Stratégique Marché Marocain';
    this.version = '2.0.0';
    this.secteur = options.secteur ?? 'cosmétiques et soins beauté naturels';
    this.client = new Anthropic({ apiKey: options.apiKey ?? process.env.ANTHROPIC_API_KEY });
    this.horodatage = null;
    this.skillsOptions = {
      costPerUnitMAD: options.costPerUnitMAD ?? 35,
      targetMarginPct: options.targetMarginPct ?? 65,
      fixedCostsMAD: options.fixedCostsMAD ?? 200_000,
      year1RevenueMAD: options.year1RevenueMAD ?? 3_000_000,
      revenueGrowthPct: options.revenueGrowthPct ?? 35,
    };
  }

  async orchestrer() {
    this.horodatage = new Date();
    this.emit('debut', { horodatage: this.horodatage, secteur: this.secteur });

    // Phase 0 — fetch live data + pre-compute financial baseline
    this.emit('skills-init', { status: 'fetching live market data...' });
    const enriched = await buildEnrichedContext({ secteur: this.secteur, ...this.skillsOptions });
    this.emit('skills-ready', { live: enriched.liveData.economics.live });

    const contexte = {
      _marketContext: enriched.marketContextStr,
      _financialContext: enriched.financialStr,
    };
    const resultats = [];

    for (const tache of TACHES) {
      this.emit('tache-debut', { id: tache.id, agent: tache.agent, label: tache.label });

      const res = await this._executerTache(tache, contexte, enriched);
      contexte[tache.id] = res.sortie;
      resultats.push(res);

      this.emit('tache-fin', { id: tache.id, succes: res.succes, tokens: res.tokens });
    }

    // Phase N — post-analysis: sentiment scan on all outputs
    const intelligence = analyzeOrchestrationOutputs(contexte);

    const succes = resultats.every(r => r.succes);
    this.emit('fin', { succes, nbTaches: resultats.length });

    return {
      sessionId: `maroc-${Date.now()}`,
      horodatage: this.horodatage.toISOString(),
      secteur: this.secteur,
      succes,
      taches: resultats,
      intelligence,
      enriched: { pricing: enriched.pricing, sizing: enriched.sizing, projection: enriched.projection },
      metriques: this._calculerMetriques(resultats),
    };
  }

  genererRapport(resultat) {
    const duree = (resultat.metriques.dureeTotaleMs / 1000).toFixed(1);
    const taux = (resultat.metriques.tauxReussite * 100).toFixed(0);
    const sep = '═'.repeat(62);
    const sep2 = '─'.repeat(62);

    const lignes = [
      `╔${sep}╗`,
      `║${'   RAPPORT STRATÉGIQUE — MARCHÉ MAROCAIN'.padEnd(62)}║`,
      `║${'   Coordinateur IA Grande Fortune'.padEnd(62)}║`,
      `╚${sep}╝`,
      ``,
      `  Secteur analysé : ${resultat.secteur}`,
      `  Session         : ${resultat.sessionId}`,
      `  Date            : ${new Date(resultat.horodatage).toLocaleString('fr-FR')}`,
      `  Statut          : ${resultat.succes ? '✓ SUCCÈS' : '✗ ÉCHEC PARTIEL'}`,
      `  Durée totale    : ${duree}s`,
      `  Taux réussite   : ${taux}%`,
      `  Tokens Claude   : ${resultat.metriques.tokensTotal}`,
      ``,
    ];

    for (const t of resultat.taches) {
      const icone = t.succes ? '✓' : '✗';
      lignes.push(`${sep2}`);
      lignes.push(`  ${icone}  ${t.label.toUpperCase()}`);
      lignes.push(`     Agent : ${t.agent}`);
      lignes.push(``);
      if (t.sortie) {
        for (const l of t.sortie.split('\n')) {
          lignes.push(`     ${l}`);
        }
      }
      if (t.erreur) lignes.push(`     ⚠ ERREUR : ${t.erreur}`);
      lignes.push(``);
    }

    if (resultat.enriched) {
      const e = resultat.enriched;
      lignes.push(`${sep2}`);
      lignes.push(`  MODÈLE FINANCIER (SKILLS)`);
      lignes.push(`${sep2}`);
      if (e.pricing) lignes.push(`  Prix recommandé   : ${e.pricing.recommendedPrice} MAD | ${e.pricing.tier.label} | marge ${e.pricing.actualMarginPct}%`);
      if (e.sizing) lignes.push(`  Marché SOM        : ${(e.sizing.som / 1e6).toFixed(1)}M MAD (~${(e.sizing.somUSD / 1e6).toFixed(1)}M USD)`);
      if (e.projection) {
        lignes.push(`  Projection 3 ans  :`);
        for (const y of e.projection) {
          lignes.push(`    An ${y.year} : CA ${(y.revenueMAD / 1e6).toFixed(1)}M MAD | EBITDA ${(y.ebitdaMAD / 1e6).toFixed(1)}M MAD (${y.ebitdaMarginPct}%)`);
        }
      }
      lignes.push(``);
    }

    if (resultat.intelligence?.report) {
      lignes.push(`${sep2}`);
      lignes.push(`  INTELLIGENCE NLP (SKILLS)`);
      lignes.push(`${sep2}`);
      for (const l of resultat.intelligence.report.split('\n')) lignes.push(`  ${l}`);
      lignes.push(``);
    }

    lignes.push(`${sep2}`);
    lignes.push(`  MÉTRIQUES D'EXÉCUTION`);
    lignes.push(`${sep2}`);
    for (const [k, v] of Object.entries(resultat.metriques)) {
      lignes.push(`  ${k.padEnd(24)}: ${v}`);
    }
    lignes.push(``);

    return lignes.join('\n');
  }

  async _executerTache(tache, contexte, enriched) {
    const debut = Date.now();
    const systemPrompt = SYSTEM_PROMPTS[tache.agent];
    const basePrompt = tache.prompt(contexte, { secteur: this.secteur });

    // Prepend live market data + financial baseline to first two agents
    const livePrefix = enriched
      ? `\n\n--- DONNÉES RÉELLES INJECTÉES PAR LES SKILLS ---\n${enriched.marketContextStr}\n${enriched.financialStr}\n---\n\n`
      : '';
    const userPrompt = livePrefix + basePrompt;

    try {
      let sortie, tokens;
      if (!process.env.ANTHROPIC_API_KEY && process.env.CLAUDE_CODE_PROVIDER_MANAGED_BY_HOST) {
        sortie = await spawnClaude(['-p', '--model', 'haiku'], `${systemPrompt}\n\n${userPrompt}`, 90_000);
        tokens = 0;
      } else {
        const response = await this.client.messages.create({
          model: MODEL,
          max_tokens: 600,
          system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
          messages: [{ role: 'user', content: userPrompt }],
        });
        sortie = response.content[0]?.text?.trim() ?? '';
        tokens = response.usage.input_tokens + response.usage.output_tokens;
      }

      return {
        id: tache.id,
        label: tache.label,
        agent: tache.agent,
        succes: true,
        dureeMs: Date.now() - debut,
        tokens,
        sortie,
      };
    } catch (err) {
      return {
        id: tache.id,
        label: tache.label,
        agent: tache.agent,
        succes: false,
        dureeMs: Date.now() - debut,
        tokens: 0,
        sortie: '',
        erreur: err.message,
      };
    }
  }

  _calculerMetriques(resultats) {
    const reussies = resultats.filter(r => r.succes).length;
    const dureeTotaleMs = resultats.reduce((s, r) => s + r.dureeMs, 0);
    const tokensTotal = resultats.reduce((s, r) => s + (r.tokens ?? 0), 0);
    return {
      nbAgents: Object.keys(SYSTEM_PROMPTS).length,
      nbTaches: resultats.length,
      tachesReussies: reussies,
      tauxReussite: reussies / resultats.length,
      dureeTotaleMs,
      dureeMoyenneMs: Math.round(dureeTotaleMs / resultats.length),
      tokensTotal,
    };
  }
}

