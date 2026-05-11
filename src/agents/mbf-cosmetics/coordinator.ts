import type { AgentContext, SwarmResult, AgentResult, AgentRole } from './types.js';
import { MarcheAgent } from './specialists/marche.agent.js';
import { BrandAgent } from './specialists/brand.agent.js';
import { ProduitAgent } from './specialists/produit.agent.js';
import { MarketingAgent } from './specialists/marketing.agent.js';
import { LegalAgent } from './specialists/legal.agent.js';
import { FinanceAgent } from './specialists/finance.agent.js';
import { OperationsAgent } from './specialists/operations.agent.js';
import { EcommerceAgent } from './specialists/ecommerce.agent.js';
import { CustomerAgent } from './specialists/customer.agent.js';
import { PLAN_LANCEMENT_90J, JALONS_CRITIQUES, BUDGET_TOTAL_90J } from './launch-plan.js';

export class MBFCoordinator {
  private contexte: AgentContext;
  private agents: Map<AgentRole, { analyser: () => AgentResult }>;

  constructor(contexte?: Partial<AgentContext>) {
    this.contexte = {
      marque: 'routines.fr',
      maison: 'MBF Cosmétique',
      marches: ['maroc', 'france', 'diaspora'],
      phase: 'pre-lancement',
      budget: 405000, // MAD — budget total 90j
      dateObjectif: '2026-08-01', // date lancement cible
      ...contexte,
    };

    this.agents = new Map([
      ['marche', new MarcheAgent(this.contexte)],
      ['brand', new BrandAgent(this.contexte)],
      ['produit', new ProduitAgent(this.contexte)],
      ['marketing', new MarketingAgent(this.contexte)],
      ['legal', new LegalAgent(this.contexte)],
      ['finance', new FinanceAgent(this.contexte)],
      ['operations', new OperationsAgent(this.contexte)],
      ['ecommerce', new EcommerceAgent(this.contexte)],
      ['customer', new CustomerAgent(this.contexte)],
    ]);
  }

  async orchestrer(): Promise<SwarmResult> {
    const resultats = {} as Record<AgentRole, AgentResult>;

    // Exécuter tous les agents en parallèle
    const executions = Array.from(this.agents.entries()).map(([role, agent]) =>
      Promise.resolve(agent.analyser()).then(result => {
        resultats[role] = result;
      })
    );

    await Promise.all(executions);

    const score = this.calculerScorePreparation(resultats);

    return {
      contexte: this.contexte,
      resultats,
      planLancement: PLAN_LANCEMENT_90J,
      scorePreparation: score,
    };
  }

  private calculerScorePreparation(resultats: Record<AgentRole, AgentResult>): number {
    const critiques = ['legal', 'finance', 'produit', 'ecommerce'];
    const critiquesOk = critiques.filter(r => resultats[r as AgentRole]?.recommandations.length > 0).length;
    return Math.round((critiquesOk / critiques.length) * 100);
  }

  genererRapport(resultat: SwarmResult): string {
    const alertesCritiques = Object.values(resultat.resultats)
      .flatMap(r => r.alertes ?? [])
      .filter(Boolean);

    const topRecommandations = Object.values(resultat.resultats)
      .flatMap(r => r.recommandations)
      .filter(r => r.priorite === 'critique')
      .slice(0, 10);

    const sections = [
      this.genererEnTete(resultat),
      this.genererResume(resultat, alertesCritiques),
      this.genererPlanAction(topRecommandations),
      this.genererPlanLancement(resultat),
      this.genererKPIsDashboard(resultat),
    ];

    return sections.join('\n\n' + '═'.repeat(60) + '\n\n');
  }

  private genererEnTete(r: SwarmResult): string {
    return `
╔══════════════════════════════════════════════════════════╗
║         RAPPORT SWARM MBF COSMÉTIQUE                     ║
║         ${r.contexte.maison} — ${r.contexte.marque}${' '.repeat(Math.max(0, 23 - r.contexte.marque.length))}║
║         Score de préparation : ${r.scorePreparation}%${' '.repeat(Math.max(0, 28 - String(r.scorePreparation).length))}║
╚══════════════════════════════════════════════════════════╝

**Phase** : ${r.contexte.phase.toUpperCase()}
**Marchés** : ${r.contexte.marches.join(', ')}
**Budget total 90j** : ${BUDGET_TOTAL_90J.toLocaleString()} MAD (~${(BUDGET_TOTAL_90J / 10.8).toFixed(0)} EUR)
**Date lancement** : ${r.contexte.dateObjectif}
**Agents mobilisés** : ${Object.keys(r.resultats).length} spécialistes
    `.trim();
  }

  private genererResume(_r: SwarmResult, alertes: string[]): string {
    return `## ALERTES CRITIQUES (${alertes.length})

${alertes.map((a, i) => `⚠️  ${i + 1}. ${a}`).join('\n')}`;
  }

  private genererPlanAction(recommandations: ReturnType<MarcheAgent['analyser']>['recommandations']): string {
    return `## TOP 10 ACTIONS CRITIQUES IMMÉDIATES

${recommandations.map((r, i) =>
  `**${i + 1}. ${r.titre}** [${r.delai}]
   → ${r.action}${r.prerequis ? `\n   ✓ Prérequis : ${r.prerequis.join(' | ')}` : ''}`
).join('\n\n')}`;
  }

  private genererPlanLancement(r: SwarmResult): string {
    const jalonsBloquants = JALONS_CRITIQUES.filter(j => j.bloquant);

    return `## PLAN DE LANCEMENT 90 JOURS

${r.planLancement.map(phase =>
  `### ${phase.phase}
**Budget** : ${phase.budget.toLocaleString()} MAD
**Responsables** : ${phase.responsables.join(', ')}
**Objectifs** :
${phase.objectifs.map(o => `  - ${o}`).join('\n')}
**Livrables** :
${phase.livrables.map(l => `  ✓ ${l}`).join('\n')}`
).join('\n\n')}

### JALONS BLOQUANTS (ne pas avancer sans eux)
${jalonsBloquants.map(j => `  🔴 Sem. ${j.semaine}: ${j.jalon}`).join('\n')}`;
  }

  private genererKPIsDashboard(r: SwarmResult): string {
    const tousKpis = Object.entries(r.resultats)
      .flatMap(([agent, result]) =>
        result.kpis.map(kpi => ({ ...kpi, agent }))
      );

    return `## DASHBOARD KPIs (${tousKpis.length} métriques)

| Agent | KPI | Cible | Unité | Délai |
|-------|-----|-------|-------|-------|
${tousKpis.map(k =>
  `| ${k.agent} | ${k.name} | ${k.target} | ${k.unit} | ${k.delai} |`
).join('\n')}`;
  }
}
