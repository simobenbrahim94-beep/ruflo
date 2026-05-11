import { MBFCoordinator } from './coordinator.js';
import type { AgentContext } from './types.js';

/**
 * Point d'entrée principal pour lancer le swarm MBF Cosmétique.
 *
 * Usage:
 *   npx ts-node src/agents/mbf-cosmetics/swarm.ts
 *   ou: import { lancerSwarmMBF } from './swarm.js'
 */
export async function lancerSwarmMBF(contexte?: Partial<AgentContext>): Promise<void> {
  const coordinator = new MBFCoordinator(contexte);

  console.log('\n🚀 Démarrage du Swarm MBF Cosmétique...\n');
  console.log('Agents actifs : Marché | Brand | Produit | Marketing | Legal | Finance | Ops | E-commerce | Customer\n');

  const resultat = await coordinator.orchestrer();
  const rapport = coordinator.genererRapport(resultat);

  console.log(rapport);
}

// Exécution directe (CLI)
if (process.argv[1]?.includes('swarm')) {
  lancerSwarmMBF().catch(console.error);
}
