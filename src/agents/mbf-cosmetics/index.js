import { EventEmitter } from 'events';
import { execFile } from 'child_process';
import { promisify } from 'util';
import Anthropic from '@anthropic-ai/sdk';

const execFileAsync = promisify(execFile);

const MODEL = 'claude-haiku-4-5-20251001';

const SYSTEM_PROMPTS = {
  'analyste-marche': `Tu es un analyste marché senior spécialisé dans l'industrie cosmétique française pour MBF Cosmetics.
Tu identifies les tendances beauté émergentes, analyses la concurrence et fournis des insights consommateurs.
Réponds toujours en français, de façon concise et professionnelle (3-4 phrases max).`,

  'formulateur': `Tu es un formulateur expert en cosmétique chez MBF Cosmetics.
Tu développes des formules innovantes en respectant la réglementation EU 1223/2009.
Réponds toujours en français, de façon concise et professionnelle (3-4 phrases max).`,

  'responsable-qualite': `Tu es responsable qualité et conformité réglementaire chez MBF Cosmetics.
Tu vérifies la conformité des formules aux normes européennes et internationales.
Réponds toujours en français, de façon concise et professionnelle (3-4 phrases max).`,

  'stratege-marketing': `Tu es stratège marketing senior chez MBF Cosmetics.
Tu élabores les plans de lancement produit, la communication et le positionnement marque.
Réponds toujours en français, de façon concise et professionnelle (3-4 phrases max).`,

  'gestionnaire-supply': `Tu es gestionnaire supply chain chez MBF Cosmetics.
Tu optimises la distribution, la logistique et la chaîne d'approvisionnement en Europe.
Réponds toujours en français, de façon concise et professionnelle (3-4 phrases max).`,
};

const TACHES = [
  {
    id: 'analyse-tendances',
    label: 'Analyse des tendances beauté',
    agent: 'analyste-marche',
    prompt: 'Quelles sont les 3 principales tendances beauté à exploiter pour MBF Cosmetics en 2026 ?',
  },
  {
    id: 'dev-formule',
    label: 'Développement formule cosmétique',
    agent: 'formulateur',
    prompt: (ctx) =>
      `Sur la base des tendances identifiées : "${ctx['analyse-tendances']}", propose une formule cosmétique innovante pour MBF Cosmetics.`,
  },
  {
    id: 'controle-qualite',
    label: 'Contrôle qualité et conformité',
    agent: 'responsable-qualite',
    prompt: (ctx) =>
      `Évalue la conformité réglementaire et les points de vigilance pour cette formule : "${ctx['dev-formule']}".`,
  },
  {
    id: 'strategie-lancement',
    label: 'Stratégie de lancement produit',
    agent: 'stratege-marketing',
    prompt: (ctx) =>
      `Élabore une stratégie de lancement pour ce produit MBF Cosmetics (formule : "${ctx['dev-formule']}", conformité : "${ctx['controle-qualite']}").`,
  },
  {
    id: 'plan-distribution',
    label: 'Plan de distribution et logistique',
    agent: 'gestionnaire-supply',
    prompt: (ctx) =>
      `Propose un plan de distribution logistique pour le lancement MBF Cosmetics décrit ici : "${ctx['strategie-lancement']}".`,
  },
];

export class MBFCoordinator extends EventEmitter {
  constructor(options = {}) {
    super();
    this.nom = options.nom ?? 'Coordinateur MBF Cosmetics';
    this.version = options.version ?? '1.0.0';
    this.horodatage = null;
    this.client = new Anthropic({ apiKey: options.apiKey ?? process.env.ANTHROPIC_API_KEY });
  }

  async orchestrer() {
    this.horodatage = new Date();
    this.emit('debut', { horodatage: this.horodatage });

    const contexte = {};
    const resultats = [];

    for (const tache of TACHES) {
      this.emit('tache-debut', { tache: tache.id, agent: tache.agent });
      const res = await this._executerTache(tache, contexte);
      contexte[tache.id] = res.sortie;
      resultats.push(res);
      this.emit('tache-fin', { tache: tache.id, succes: res.succes });
    }

    const succes = resultats.every(r => r.succes);
    this.emit('fin', { succes, nbTaches: resultats.length });

    return {
      sessionId: `mbf-${Date.now()}`,
      horodatage: this.horodatage.toISOString(),
      succes,
      taches: resultats,
      metriques: this._calculerMetriques(resultats),
    };
  }

  genererRapport(resultat) {
    const duree = resultat.metriques.dureeTotaleMs;
    const taux = (resultat.metriques.tauxReussite * 100).toFixed(1);
    const tokensTotal = resultat.metriques.tokensTotal ?? '—';
    const lignes = [
      `╔══════════════════════════════════════════════════╗`,
      `║         RAPPORT MBF COSMETICS — ORCHESTRATION    ║`,
      `╚══════════════════════════════════════════════════╝`,
      ``,
      `Session      : ${resultat.sessionId}`,
      `Date         : ${new Date(resultat.horodatage).toLocaleString('fr-FR')}`,
      `Statut       : ${resultat.succes ? '✓ Succès' : '✗ Échec'}`,
      `Durée totale : ${duree}ms`,
      `Taux réussite: ${taux}%`,
      `Tokens utilisés: ${tokensTotal}`,
      ``,
      `─── Tâches exécutées ─────────────────────────────`,
    ];

    for (const t of resultat.taches) {
      const icone = t.succes ? '✓' : '✗';
      lignes.push(`  ${icone} [${t.agent}] ${t.label}`);
      if (t.sortie) {
        const lignesSortie = t.sortie.split('\n');
        for (const l of lignesSortie) lignes.push(`      ${l}`);
      }
      if (t.erreur) lignes.push(`      ! Erreur : ${t.erreur}`);
    }

    lignes.push(``, `─── Métriques ────────────────────────────────────`);
    for (const [k, v] of Object.entries(resultat.metriques)) {
      lignes.push(`  ${k}: ${v}`);
    }
    lignes.push(``);

    return lignes.join('\n');
  }

  async _executerTache(tache, contexte) {
    const debut = Date.now();
    const systemPrompt = SYSTEM_PROMPTS[tache.agent];
    const userPrompt = typeof tache.prompt === 'function' ? tache.prompt(contexte) : tache.prompt;

    try {
      let sortie, tokens;
      if (!process.env.ANTHROPIC_API_KEY && process.env.CLAUDE_CODE_PROVIDER_MANAGED_BY_HOST) {
        const { stdout } = await execFileAsync('claude', ['-p', '--model', MODEL, `${systemPrompt}\n\n${userPrompt}`], {
          timeout: 60_000,
          maxBuffer: 2 * 1024 * 1024,
        });
        sortie = stdout.trim();
        tokens = 0;
      } else {
        const response = await this.client.messages.create({
          model: MODEL,
          max_tokens: 300,
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
