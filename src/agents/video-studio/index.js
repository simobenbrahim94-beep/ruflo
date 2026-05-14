/**
 * VideoStudioDirector — Hollywood-grade AI video production pipeline.
 * 8 specialist agents: Concept → Script → Storyboard → Voice → Visuals → Edit → Platform → Trend.
 */

import { EventEmitter } from 'events';
import { execFile } from 'child_process';
import { promisify } from 'util';
import Anthropic from '@anthropic-ai/sdk';

const execFileAsync = promisify(execFile);
import {
  detectAvailableAPIs,
  ElevenLabsAPI,
  RunwayAPI,
  StabilityAPI,
  KlingAPI,
} from '../../skills/video/apis.js';
import {
  PLATFORMS,
  formatPlatformBrief,
  SHOT_DURATIONS,
} from '../../skills/video/platform-specs.js';
import {
  SHOT_TYPES, CAMERA_MOVES, LIGHTING, COLOR_GRADES,
  PROMPT_TEMPLATES, SCRIPT_STRUCTURES, buildShotList,
} from '../../skills/video/shot-library.js';

const MODEL = 'claude-haiku-4-5-20251001';
const MODEL_CREATIVE = 'claude-sonnet-4-6';

// ── System prompts ────────────────────────────────────────────────────────────

const AGENTS = {
  'directeur-creatif': `Tu es Directeur Créatif d'un studio de production hollywoodien spécialisé en contenu viral pour marques de luxe.
Tu as travaillé pour Apple, Louis Vuitton, Dior et les plus grandes marques mondiales.
Tu diriges chaque projet avec un sens aigu de la narration visuelle, de l'émotion et de l'impact commercial.
Tes créations génèrent systématiquement des millions de vues et des conversions records.
Tu réponds toujours en français, avec la précision et l'autorité d'un réalisateur oscarisé.`,

  'scénariste': `Tu es Scénariste et Copywriter de génie, formé à la UCLA Film School et au storytelling publicitaire de Cannes Lions.
Tu maîtrises parfaitement :
  - La formule des hooks viraux TikTok (3 secondes = décision de scroll ou de rester)
  - Le framework AIDA (Attention, Intérêt, Désir, Action) appliqué au court-métrage
  - L'art du storytelling émotionnel — faire pleurer ou rire en 30 secondes
  - La psychologie du consommateur marocain (Darija spontané, valeurs famille, aspiration luxe)
  - Le copywriting en 3 langues : français (premium), darija (viral), arabe (trust)
Chaque script que tu écris est calibré pour le maximum de complétion vidéo et de passage à l'acte.`,

  'directeur-photo': `Tu es Directeur de la Photographie (DP) et Storyboarder, alumni de l'AFI (American Film Institute).
Tu penses en termes de :
  - Composition visuelle (règle des tiers, nombre d'or, lignes directrices)
  - Langage des plans (ECU, CU, MS, LS) et leur impact émotionnel
  - Mouvement de caméra et rythme cinématique
  - Éclairage et ambiance (glamour, authentique, dramatique)
  - Grading colorimétrique pour chaque plateforme et émotion cible
Tu génères des prompts de génération vidéo/image d'une précision chirurgicale pour obtenir des shots dignes de films hollywoodiens.`,

  'voice-director': `Tu es Directeur Vocal et Sound Designer, avec 15 ans d'expérience en publicité radio/TV en France et au Maroc.
Tu maîtrises :
  - La sélection de voix pour chaque persona de marque
  - L'écriture de scripts de narration optimisés pour la synthèse vocale
  - L'émotion et le rythme vocal (pauses, emphases, intonation)
  - La direction musicale : quand utiliser du silence, de la musique, des effets sonores
  - Les styles vocaux qui convertissent sur chaque plateforme (autoritaire YT, enthousiaste TikTok, luxueux Instagram)
Tu fournis des scripts narration + instructions de rendu vocal précises.`,

  'monteur': `Tu es Monteur et Post-Producteur de génie, formé aux studios Pixar et chez les meilleurs directeurs artistiques publicitaires.
Tu maîtrises :
  - L'order des plans pour maximiser la rétention (courbe de retention YouTube)
  - Les transitions qui fonctionnent sur chaque plateforme
  - Le pacing — rythme des cuts pour chaque génération (Gen Z = cut toutes les 1.5s)
  - Les effets visuels subtils qui font la différence (vitesse, color, overlays)
  - L'assemblage technique (codecs, bitrates, formats par plateforme)
Tu fournis des instructions de montage précises avec timecodes.`,

  'strategiste-plateforme': `Tu es Expert en Marketing Digital et Algorithmes de Plateformes, avec un track record de 50M+ vues générées.
Tu maîtrises en profondeur :
  - TikTok : algorithme FYP, hook rate, completion rate, taux de partage
  - Instagram : algorithme Reels, Save rate, Reach non-followers
  - YouTube Shorts : CTR thumbnail, watch-time, suggested videos
  - Facebook Reels : distribution organique, audience Maroc 30-55 ans
CONNAISSANCES MARCHÉ MAROCAIN :
  - Pics d'activité par tranche horaire selon région (Casablanca vs rural)
  - Contenu qui trend pendant Ramadan, Aid, rentrée
  - Hashtags Darija performants (#بيوتي_ماروك, #مغربيات, #ماروك_تيك_توك)
  - Micro-influenceurs marocains 50K-500K followers = meilleur ROI
Tu fournis une stratégie de publication complète avec hashtags, timing, et objectifs KPIs.`,

  'analyste-tendances': `Tu es Head of Trends et Cultural Intelligence, tu surveilles en temps réel les tendances sur toutes les plateformes mondiales.
Tu analyses :
  - Les formats qui explorent en ce moment (sound trends, visual trends, narrative trends)
  - Les micro-tendances beauté et lifestyle au Maroc et dans la diaspora marocaine
  - Les challengers viraux à adapter pour les marques
  - Les audios tendance à utiliser (sans droits d'auteur ou licenses claires)
  - La saisonnalité du contenu : Ramadan content calendar, summer vibes, etc.
Tu fournis des recommandations de tendances actionnables immédiatement.`,

  'directeur-production': `Tu es Directeur de Production et Chef de Projet, responsable de la livraison technique et créative finale.
Tu synthétises tous les éléments en un plan de production exécutable :
  - Shot list finale avec tous les paramètres techniques
  - Ordre de génération des assets (quelles APIs utiliser pour quels shots)
  - Budget estimatif (tokens API, coût par vidéo)
  - Timeline de production (temps de génération estimé)
  - Checklist de qualité avant publication
  - Variations à créer pour A/B test sur chaque plateforme
Tu fournis le plan de production final en format actionnable.`,
};

// ── Agent pipeline ────────────────────────────────────────────────────────────

export class VideoStudioDirector extends EventEmitter {
  constructor(options = {}) {
    super();
    this.version = '1.0.0';
    this.client = new Anthropic({ apiKey: options.apiKey ?? process.env.ANTHROPIC_API_KEY });
    this.availableAPIs = detectAvailableAPIs();
    this.voiceEngine = new ElevenLabsAPI(options.elevenLabsKey);
    this.videoEngine = options.runwayKey
      ? new RunwayAPI(options.runwayKey)
      : options.klingKey
        ? new KlingAPI(options.klingKey)
        : null;
    this.imageEngine = options.stabilityKey ? new StabilityAPI(options.stabilityKey) : null;
  }

  async produire(brief) {
    const {
      produit,
      marque,
      cible = 'femmes 18-35 ans urbaines marocaines',
      plateforme = 'tiktok',
      objectif = 'awareness + conversion',
      dureeMax = 30,
      styleVisuel = 'luxury_gold',
      langue = 'français/darija',
    } = brief;

    this.emit('debut', { produit, plateforme });

    const platformSpec = formatPlatformBrief(plateforme);
    const shotLib = this._buildShotContext();
    const apisContext = this._buildAPIsContext();

    const ctx = { produit, marque, cible, plateforme, objectif, dureeMax, styleVisuel, langue, platformSpec, shotLib, apisContext };
    const resultats = [];

    const pipeline = [
      { id: 'brief-creatif',     agent: 'directeur-creatif',     fn: c => this._briefCreatif(c) },
      { id: 'script',            agent: 'scénariste',             fn: c => this._ecrireScript(c) },
      { id: 'storyboard',        agent: 'directeur-photo',        fn: c => this._creerStoryboard(c) },
      { id: 'narration',         agent: 'voice-director',         fn: c => this._preparerNarration(c) },
      { id: 'plan-montage',      agent: 'monteur',                fn: c => this._planifierMontage(c) },
      { id: 'strategie-publi',   agent: 'strategiste-plateforme', fn: c => this._strategiePublication(c) },
      { id: 'tendances',         agent: 'analyste-tendances',     fn: c => this._analyserTendances(c) },
      { id: 'plan-production',   agent: 'directeur-production',   fn: c => this._planProduction(c) },
    ];

    for (const step of pipeline) {
      this.emit('step-debut', { id: step.id, agent: step.agent });
      const debut = Date.now();
      try {
        const sortie = await step.fn(ctx);
        ctx[step.id] = sortie;
        resultats.push({ id: step.id, agent: step.agent, succes: true, sortie, dureeMs: Date.now() - debut });
        this.emit('step-fin', { id: step.id, succes: true });
      } catch (err) {
        resultats.push({ id: step.id, agent: step.agent, succes: false, erreur: err.message, dureeMs: Date.now() - debut });
        this.emit('step-fin', { id: step.id, succes: false, erreur: err.message });
      }
    }

    const succes = resultats.filter(r => r.succes).length >= 6;
    this.emit('fin', { succes });

    return {
      sessionId: `studio-${Date.now()}`,
      brief,
      succes,
      steps: resultats,
      assets: this._compileAssets(ctx),
      metriques: this._metriques(resultats),
    };
  }

  async _callAgent(agentId, userPrompt, useCreativeModel = false) {
    // When running under Claude Code host auth (no ANTHROPIC_API_KEY), delegate to CLI.
    if (!process.env.ANTHROPIC_API_KEY && process.env.CLAUDE_CODE_PROVIDER_MANAGED_BY_HOST) {
      const model = useCreativeModel ? MODEL_CREATIVE : MODEL;
      const fullPrompt = `${AGENTS[agentId]}\n\n${userPrompt}`;
      // Pipe prompt via stdin to avoid ARG_MAX limits on long prompts.
      const { stdout } = await execFileAsync('claude', ['-p', '--model', model], {
        input: fullPrompt,
        timeout: 120_000,
        maxBuffer: 4 * 1024 * 1024,
      });
      return stdout.trim();
    }
    const response = await this.client.messages.create({
      model: useCreativeModel ? MODEL_CREATIVE : MODEL,
      max_tokens: 800,
      system: [{ type: 'text', text: AGENTS[agentId], cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: userPrompt }],
    });
    return response.content[0]?.text?.trim() ?? '';
  }

  async _briefCreatif(c) {
    return this._callAgent('directeur-creatif', `
Crée un brief créatif complet pour :
- Produit : ${c.produit} (marque: ${c.marque})
- Cible : ${c.cible}
- Plateforme : ${c.plateforme} | Durée max : ${c.dureeMax}s
- Objectif : ${c.objectif}
- Style visuel : ${c.styleVisuel}
- Langue : ${c.langue}

${c.platformSpec}

Définis : le concept central, le message émotionnel unique, le ton, et la promesse de la marque en 1 ligne.`, true);
  }

  async _ecrireScript(c) {
    return this._callAgent('scénariste', `
Brief créatif validé :
"${c['brief-creatif']}"

Écris le script complet pour ${c.plateforme} (${c.dureeMax}s max) pour "${c.produit}".
Inclure : texte à l'écran (FR/Darija), voix-off, indications de scène.
Format : timecode | visuel | voix-off | texte écran`, true);
  }

  async _creerStoryboard(c) {
    const grade = COLOR_GRADES[c.styleVisuel] ?? COLOR_GRADES.luxury_gold;
    return this._callAgent('directeur-photo', `
Script :
"${c.script}"

Crée le storyboard shot par shot pour "${c.produit}" sur ${c.plateforme}.
Style : ${grade}
Pour chaque shot, donne :
1. Type de plan (${Object.keys(SHOT_TYPES).join(', ')})
2. Mouvement caméra
3. Éclairage
4. Prompt de génération IA (anglais, ultra-détaillé pour Runway/Stability)
5. Durée recommandée`);
  }

  async _preparerNarration(c) {
    return this._callAgent('voice-director', `
Script vidéo :
"${c.script}"

Prépare le plan vocal complet :
1. Script narration optimisé TTS (ponctuation émotionnelle, pauses [pause 0.5s])
2. Voix recommandée (parmi: fr_female_luxury, fr_male_authority, energetic_youth)
3. Musique de fond : genre, tempo BPM, mood
4. Sound design : effets sonores clés (avec timecodes)
5. Mix audio : niveaux voix/musique/effets`);
  }

  async _planifierMontage(c) {
    return this._callAgent('monteur', `
Storyboard :
"${c.storyboard}"
Narration :
"${c.narration}"
Plateforme : ${c.plateforme} | Durée : ${c.dureeMax}s

Plan de montage détaillé :
1. Ordre des clips avec timecodes précis
2. Types de transitions (cut, fade, swipe, zoom)
3. Pacing et rythme des cuts
4. Effets visuels (slow motion, speed ramp, color pop)
5. Instructions techniques FFmpeg pour l'assemblage final`);
  }

  async _strategiePublication(c) {
    return this._callAgent('strategiste-plateforme', `
Contenu créé pour : "${c.produit}" | Plateforme : ${c.plateforme} | Cible : ${c.cible}
Brief : "${c['brief-creatif']}"

Stratégie de publication complète :
1. Titre/caption optimisé algorithme (FR + Darija)
2. 15 hashtags ciblés (mix niche/medium/trending marocain)
3. Heure et jour de publication optimal (marché marocain)
4. Miniature/frame d'aperçu recommandée
5. Stratégie d'engagement première heure (répondre commentaires, partage stories)
6. KPIs cibles : vues 24h, taux complétion, taux clic`);
  }

  async _analyserTendances(c) {
    return this._callAgent('analyste-tendances', `
Vidéo produit pour : ${c.produit} sur ${c.plateforme} — cible marocaine ${c.cible}
Script : "${c.script?.slice(0, 200)}..."

Analyse :
1. Format tendance à adapter pour ce contenu (son viral, challenge, format narratif)
2. 3 insights culturels marocains à amplifier dans la publication
3. Saisonnalité et timing culturel optimal (Ramadan? Saison été? Rentrée?)
4. 2 variations créatives pour A/B test
5. Risques à éviter (sensibilités culturelles, codes visuels à éviter)`);
  }

  async _planProduction(c) {
    const apis = Object.entries(c.apisContext).filter(([, v]) => v).map(([k]) => k).join(', ') || 'aucune (mode simulation)';
    return this._callAgent('directeur-production', `
SYNTHÈSE DE PRODUCTION COMPLÈTE

Brief créatif : "${c['brief-creatif']?.slice(0, 150)}"
Script (extrait) : "${c.script?.slice(0, 200)}"
Storyboard (extrait) : "${c.storyboard?.slice(0, 200)}"
Stratégie publi : "${c['strategie-publi']?.slice(0, 150)}"
Tendances : "${c.tendances?.slice(0, 150)}"

APIs vidéo disponibles : ${apis}

Produis le plan de production final exécutable :
1. Shot list technique (10 lignes max, avec API assignée)
2. Ordre de génération des assets
3. Temps de production estimé (avec/sans APIs)
4. Coût estimatif API (USD)
5. Checklist qualité pré-publication (10 points)
6. Plan de 3 variations pour A/B test plateforme`);
  }

  _buildShotContext() {
    return `RÉFÉRENCE SHOTS CINÉMATIQUES :
Types de plans : ${Object.entries(SHOT_TYPES).slice(0, 5).map(([k, v]) => `${k}: ${v}`).join(' | ')}
Mouvements : ${Object.entries(CAMERA_MOVES).slice(0, 4).map(([k, v]) => `${k}: ${v}`).join(' | ')}
Éclairages disponibles : ${Object.keys(LIGHTING).join(', ')}`;
  }

  _buildAPIsContext() {
    return this.availableAPIs;
  }

  _compileAssets(ctx) {
    return {
      script: ctx.script ?? null,
      storyboard: ctx.storyboard ?? null,
      narrationPlan: ctx.narration ?? null,
      editPlan: ctx['plan-montage'] ?? null,
      publicationStrategy: ctx['strategie-publi'] ?? null,
      trendAnalysis: ctx.tendances ?? null,
      productionPlan: ctx['plan-production'] ?? null,
    };
  }

  _metriques(resultats) {
    const succes = resultats.filter(r => r.succes).length;
    return {
      stepsTotal: resultats.length,
      stepsSucces: succes,
      tauxSucces: `${Math.round((succes / resultats.length) * 100)}%`,
      dureeTotaleMs: resultats.reduce((s, r) => s + r.dureeMs, 0),
    };
  }

  genererRapport(resultat) {
    const sep = '═'.repeat(64);
    const sep2 = '─'.repeat(64);
    const m = resultat.metriques;
    const lignes = [
      `╔${sep}╗`,
      `║${'   🎬 VIDEO STUDIO — RAPPORT DE PRODUCTION'.padEnd(64)}║`,
      `║${'   Cinematic AI Director v1.0'.padEnd(64)}║`,
      `╚${sep}╝`,
      ``,
      `  Session   : ${resultat.sessionId}`,
      `  Produit   : ${resultat.brief.produit} (${resultat.brief.marque})`,
      `  Plateforme: ${resultat.brief.plateforme?.toUpperCase()} | ${resultat.brief.dureeMax}s max`,
      `  Statut    : ${resultat.succes ? '✓ PRODUCTION COMPLÈTE' : '⚠ PRODUCTION PARTIELLE'}`,
      `  Durée     : ${(m.dureeTotaleMs / 1000).toFixed(1)}s | Étapes : ${m.stepsSucces}/${m.stepsTotal}`,
      ``,
    ];

    for (const step of resultat.steps) {
      const ic = step.succes ? '✓' : '✗';
      lignes.push(`${sep2}`);
      lignes.push(`  ${ic}  ${step.id.toUpperCase().replace(/-/g, ' ')}  [${step.agent}]`);
      if (step.sortie) {
        step.sortie.split('\n').slice(0, 8).forEach(l => lignes.push(`     ${l}`));
        if (step.sortie.split('\n').length > 8) lignes.push(`     ... (${step.sortie.split('\n').length - 8} lignes supplémentaires)`);
      }
      if (step.erreur) lignes.push(`     ⚠ ${step.erreur}`);
      lignes.push('');
    }

    if (resultat.assets.productionPlan) {
      lignes.push(`${sep2}`);
      lignes.push('  📋 PLAN DE PRODUCTION FINAL');
      lignes.push(`${sep2}`);
      resultat.assets.productionPlan.split('\n').forEach(l => lignes.push(`  ${l}`));
    }

    lignes.push(``, `${sep2}`);
    lignes.push(`  APIs vidéo disponibles : ${Object.entries(this.availableAPIs).filter(([,v])=>v).map(([k])=>k).join(', ') || 'aucune — configurer les clés API'}`);
    lignes.push(`  Variables env requises  : RUNWAY_API_KEY, STABILITY_API_KEY, ELEVENLABS_API_KEY, KLING_API_KEY, HEYGEN_API_KEY`);
    lignes.push('');

    return lignes.join('\n');
  }
}
