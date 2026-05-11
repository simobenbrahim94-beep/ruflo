import type {
  AgentRole,
  AgentContext,
  AgentResult,
  AgentMessage,
  Recommandation,
  KPI,
} from './types.js';

export abstract class AgentBase {
  abstract readonly role: AgentRole;
  abstract readonly domaine: string;
  abstract readonly expertise: string[];

  protected messages: AgentMessage[] = [];
  protected contexte: AgentContext;

  constructor(contexte: AgentContext) {
    this.contexte = contexte;
  }

  abstract analyser(): AgentResult;

  protected creerRecommandation(
    titre: string,
    action: string,
    impact: Recommandation['impact'],
    priorite: Recommandation['priorite'],
    delai: string,
    prerequis?: string[]
  ): Recommandation {
    return { titre, action, impact, priorite, delai, prerequis };
  }

  protected creerKPI(name: string, target: number, unit: string, delai: string): KPI {
    return { name, target, unit, delai };
  }

  envoyerMessage(a: AgentRole | 'tous', sujet: string, contenu: string, donnees?: Record<string, unknown>): AgentMessage {
    const msg: AgentMessage = {
      de: this.role,
      a,
      sujet,
      contenu,
      donnees,
      timestamp: Date.now(),
    };
    this.messages.push(msg);
    return msg;
  }

  protected creerResultat(
    analyse: string,
    recommandations: Recommandation[],
    kpis: KPI[],
    alertes?: string[]
  ): AgentResult {
    return {
      agent: this.role,
      analyse,
      recommandations,
      kpis,
      alertes,
      messages: this.messages,
    };
  }
}
