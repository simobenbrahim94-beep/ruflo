export { MBFCoordinator } from './coordinator.js';
export { MarcheAgent } from './specialists/marche.agent.js';
export { BrandAgent } from './specialists/brand.agent.js';
export { ProduitAgent } from './specialists/produit.agent.js';
export { MarketingAgent } from './specialists/marketing.agent.js';
export { LegalAgent } from './specialists/legal.agent.js';
export { FinanceAgent } from './specialists/finance.agent.js';
export { OperationsAgent } from './specialists/operations.agent.js';
export { EcommerceAgent } from './specialists/ecommerce.agent.js';
export { CustomerAgent } from './specialists/customer.agent.js';
export type {
  AgentRole,
  AgentContext,
  AgentResult,
  SwarmResult,
  LancementPhase,
  KPI,
  Recommandation,
} from './types.js';
export { PLAN_LANCEMENT_90J, JALONS_CRITIQUES, BUDGET_TOTAL_90J } from './launch-plan.js';
