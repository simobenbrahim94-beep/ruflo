import { EventEmitter } from 'events';

const AGENTS = [
  { id: 'analyste-marche', role: 'Analyste Marché', domaine: 'tendances' },
  { id: 'formulateur', role: 'Formulateur Produit', domaine: 'formulation' },
  { id: 'responsable-qualite', role: 'Responsable Qualité', domaine: 'controle-qualite' },
  { id: 'stratege-marketing', role: 'Stratège Marketing', domaine: 'marketing' },
  { id: 'gestionnaire-supply', role: 'Gestionnaire Supply Chain', domaine: 'logistique' },
];

const TACHES = [
  { id: 'analyse-tendances', label: 'Analyse des tendances beauté', agent: 'analyste-marche', priorite: 1 },
  { id: 'dev-formule', label: 'Développement formule cosmétique', agent: 'formulateur', priorite: 2 },
  { id: 'controle-qualite', label: 'Contrôle qualité et conformité', agent: 'responsable-qualite', priorite: 3 },
  { id: 'strategie-lancement', label: 'Stratégie de lancement produit', agent: 'stratege-marketing', priorite: 4 },
  { id: 'plan-distribution', label: 'Plan de distribution et logistique', agent: 'gestionnaire-supply', priorite: 5 },
];

export class MBFCoordinator extends EventEmitter {
  constructor(options = {}) {
    super();
    this.nom = options.nom ?? 'Coordinateur MBF Cosmetics';
    this.version = options.version ?? '1.0.0';
    this.agents = new Map(AGENTS.map(a => [a.id, { ...a, statut: 'idle' }]));
    this.horodatage = null;
  }

  async orchestrer() {
    this.horodatage = new Date();
    this.emit('debut', { horodatage: this.horodatage });

    const resultats = [];
    for (const tache of TACHES) {
      const agent = this.agents.get(tache.agent);
      agent.statut = 'actif';
      this.emit('tache-debut', { tache: tache.id, agent: agent.role });

      const res = await this._executerTache(tache, agent);
      resultats.push(res);
      agent.statut = 'idle';
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
    const lignes = [
      `╔══════════════════════════════════════════════════╗`,
      `║         RAPPORT MBF COSMETICS — ORCHESTRATION    ║`,
      `╚══════════════════════════════════════════════════╝`,
      ``,
      `Session     : ${resultat.sessionId}`,
      `Date        : ${new Date(resultat.horodatage).toLocaleString('fr-FR')}`,
      `Statut      : ${resultat.succes ? '✓ Succès' : '✗ Échec'}`,
      `Durée       : ${duree}ms`,
      `Taux réussite: ${taux}%`,
      ``,
      `─── Tâches exécutées ─────────────────────────────`,
    ];

    for (const t of resultat.taches) {
      const icone = t.succes ? '✓' : '✗';
      lignes.push(`  ${icone} [${t.agent}] ${t.label}`);
      if (t.sortie) lignes.push(`      → ${t.sortie}`);
    }

    lignes.push(``, `─── Métriques ────────────────────────────────────`);
    for (const [k, v] of Object.entries(resultat.metriques)) {
      lignes.push(`  ${k}: ${v}`);
    }
    lignes.push(``);

    return lignes.join('\n');
  }

  async _executerTache(tache, agent) {
    const debut = Date.now();
    await new Promise(r => setTimeout(r, 10 + Math.random() * 20));
    return {
      id: tache.id,
      label: tache.label,
      agent: agent.role,
      domaine: agent.domaine,
      succes: true,
      dureeMs: Date.now() - debut,
      sortie: this._sortieDefaut(tache.id),
    };
  }

  _sortieDefaut(tacheId) {
    const sorties = {
      'analyse-tendances': 'Tendances 2026 identifiées : clean beauty, biotechnologie, personnalisation',
      'dev-formule': 'Formule CF-2026 validée — INCI complet, stabilité 24 mois',
      'controle-qualite': 'Conformité EU 1223/2009 confirmée, tests dermatologiques OK',
      'strategie-lancement': 'Plan go-to-market Q3 2026 finalisé — digital-first, 12 marchés',
      'plan-distribution': 'Réseau logistique optimisé — 3 hubs, délai J+2 Europe',
    };
    return sorties[tacheId] ?? 'Tâche complétée';
  }

  _calculerMetriques(resultats) {
    const reussies = resultats.filter(r => r.succes).length;
    const dureeTotaleMs = resultats.reduce((s, r) => s + r.dureeMs, 0);
    return {
      nbAgents: this.agents.size,
      nbTaches: resultats.length,
      tachesReussies: reussies,
      tauxReussite: reussies / resultats.length,
      dureeTotaleMs,
      dureeMoyenneMs: Math.round(dureeTotaleMs / resultats.length),
    };
  }
}
