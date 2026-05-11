export type AgentRole =
  | 'coordinator'
  | 'marche'
  | 'brand'
  | 'produit'
  | 'marketing'
  | 'legal'
  | 'finance'
  | 'operations'
  | 'ecommerce'
  | 'customer';

export type Priority = 'critique' | 'haute' | 'moyenne' | 'basse';
export type Status = 'pending' | 'en_cours' | 'termine' | 'bloque';
export type Market = 'maroc' | 'france' | 'mena' | 'diaspora';

export interface KPI {
  name: string;
  target: number;
  unit: string;
  delai: string;
}

export interface Recommandation {
  titre: string;
  action: string;
  impact: 'fort' | 'moyen' | 'faible';
  priorite: Priority;
  delai: string;
  prerequis?: string[];
}

export interface AgentContext {
  marque: string;
  maison: string;
  marches: Market[];
  phase: 'pre-lancement' | 'lancement' | 'croissance' | 'expansion';
  budget?: number;
  dateObjectif?: string;
}

export interface AgentMessage {
  de: AgentRole;
  a: AgentRole | 'tous';
  sujet: string;
  contenu: string;
  donnees?: Record<string, unknown>;
  timestamp: number;
}

export interface AgentResult {
  agent: AgentRole;
  analyse: string;
  recommandations: Recommandation[];
  kpis: KPI[];
  alertes?: string[];
  messages?: AgentMessage[];
}

export interface SwarmResult {
  contexte: AgentContext;
  resultats: Record<AgentRole, AgentResult>;
  planLancement: LancementPhase[];
  scorePreparation: number;
}

export interface LancementPhase {
  phase: string;
  duree: string;
  objectifs: string[];
  responsables: AgentRole[];
  livrables: string[];
  budget: number;
}

export interface MarketData {
  taille: number;
  croissance: number;
  segments: Record<string, number>;
  concurrents: Concurrent[];
}

export interface Concurrent {
  nom: string;
  part_marche: number;
  positionnement: string;
  faiblesses: string[];
}
