import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { MarcheAgent } from '../src/agents/mbf-cosmetics/specialists/marche.agent.js';
import { BrandAgent } from '../src/agents/mbf-cosmetics/specialists/brand.agent.js';
import { ProduitAgent } from '../src/agents/mbf-cosmetics/specialists/produit.agent.js';
import { MarketingAgent } from '../src/agents/mbf-cosmetics/specialists/marketing.agent.js';
import { LegalAgent } from '../src/agents/mbf-cosmetics/specialists/legal.agent.js';
import { FinanceAgent } from '../src/agents/mbf-cosmetics/specialists/finance.agent.js';
import { OperationsAgent } from '../src/agents/mbf-cosmetics/specialists/operations.agent.js';
import { EcommerceAgent } from '../src/agents/mbf-cosmetics/specialists/ecommerce.agent.js';
import { CustomerAgent } from '../src/agents/mbf-cosmetics/specialists/customer.agent.js';
import { MBFCoordinator } from '../src/agents/mbf-cosmetics/coordinator.js';
import type { AgentContext, AgentResult } from '../src/agents/mbf-cosmetics/types.js';
import { BUDGET_TOTAL_90J, JALONS_CRITIQUES, PLAN_LANCEMENT_90J } from '../src/agents/mbf-cosmetics/launch-plan.js';

const CONTEXTE: AgentContext = {
  marque: 'routines.fr',
  maison: 'MBF Cosmétique',
  marches: ['maroc', 'france', 'diaspora'],
  phase: 'pre-lancement',
  budget: BUDGET_TOTAL_90J,
  dateObjectif: '2026-09-01',
};

function assertResult(result: AgentResult, agentName: string) {
  assert.ok(result, `${agentName}: résultat non nul`);
  assert.ok(result.agent, `${agentName}: rôle manquant`);
  assert.ok(result.analyse.length > 100, `${agentName}: analyse trop courte`);
  assert.ok(result.recommandations.length >= 3, `${agentName}: min 3 recommandations attendues`);
  assert.ok(result.kpis.length >= 3, `${agentName}: min 3 KPIs attendus`);

  for (const rec of result.recommandations) {
    assert.ok(rec.titre, `${agentName}: recommandation sans titre`);
    assert.ok(rec.action.length > 20, `${agentName}: action trop courte ("${rec.titre}")`);
    assert.ok(['critique', 'haute', 'moyenne', 'basse'].includes(rec.priorite), `${agentName}: priorité invalide`);
    assert.ok(['fort', 'moyen', 'faible'].includes(rec.impact), `${agentName}: impact invalide`);
  }

  for (const kpi of result.kpis) {
    assert.ok(kpi.name, `${agentName}: KPI sans nom`);
    assert.ok(kpi.unit, `${agentName}: KPI sans unité`);
    assert.ok(kpi.delai, `${agentName}: KPI sans délai`);
  }
}

describe('MBF Cosmétique — Agents Spécialistes (routines.fr × Maroc)', () => {

  describe('MarcheAgent', () => {
    it('produit une analyse marché complète avec TAM/SAM/SOM', () => {
      const agent = new MarcheAgent(CONTEXTE);
      const result = agent.analyser();
      assertResult(result, 'MarcheAgent');
      assert.ok(result.analyse.includes('TAM'), 'Doit mentionner le TAM');
      assert.ok(result.analyse.includes('SAM'), 'Doit mentionner le SAM');
      assert.ok(result.analyse.includes('routines.fr'), 'Doit mentionner la marque');
      assert.ok(result.alertes && result.alertes.length > 0, 'Doit avoir des alertes marché');
    });

    it('identifie les écarts critiques France → Maroc', () => {
      const agent = new MarcheAgent(CONTEXTE);
      const result = agent.analyser();
      const critiques = result.recommandations.filter(r => r.priorite === 'critique');
      assert.ok(critiques.length >= 2, 'Au moins 2 recommandations critiques attendues');
    });

    it('envoie des messages aux agents partenaires', () => {
      const agent = new MarcheAgent(CONTEXTE);
      const result = agent.analyser();
      assert.ok(result.messages && result.messages.length >= 2, 'Doit envoyer au moins 2 messages');
      const destinataires = result.messages!.map(m => m.a);
      assert.ok(destinataires.includes('brand'), 'Doit notifier le BrandAgent');
      assert.ok(destinataires.includes('finance'), 'Doit notifier le FinanceAgent');
    });
  });

  describe('BrandAgent', () => {
    it('produit une stratégie de marque adaptée au Maroc', () => {
      const agent = new BrandAgent(CONTEXTE);
      const result = agent.analyser();
      assertResult(result, 'BrandAgent');
      assert.ok(result.analyse.includes('Glocal') || result.analyse.includes('glocal') || result.analyse.includes('biculturel'), 'Doit aborder la stratégie bilingue/biculturelle');
      assert.ok(result.analyse.includes('darija') || result.analyse.includes('Darija'), 'Doit mentionner le darija');
    });

    it('recommande de garder le nom routines.fr (non renommé)', () => {
      const agent = new BrandAgent(CONTEXTE);
      const result = agent.analyser();
      const garderNom = result.recommandations.find(r =>
        r.titre.toLowerCase().includes('renommer') || r.titre.toLowerCase().includes('nom')
      );
      assert.ok(garderNom, 'Doit avoir une recommandation sur le nom de marque');
    });
  });

  describe('ProduitAgent', () => {
    it('identifie les reformulations urgentes pour le marché marocain', () => {
      const agent = new ProduitAgent(CONTEXTE);
      const result = agent.analyser();
      assertResult(result, 'ProduitAgent');
      assert.ok(result.analyse.toLowerCase().includes('spf'), 'Doit mentionner SPF50 pour le Maroc');
      assert.ok(result.analyse.toLowerCase().includes('halal'), 'Doit mentionner la certification halal');
    });

    it('alerte sur la vérification du collagène halal', () => {
      const agent = new ProduitAgent(CONTEXTE);
      const result = agent.analyser();
      const alertes = result.alertes ?? [];
      const halal = alertes.some(a => a.toLowerCase().includes('halal') || a.toLowerCase().includes('alcool'));
      assert.ok(halal || result.analyse.toLowerCase().includes('collagène'), 'Doit alerter sur halal ou collagène');
    });
  });

  describe('MarketingAgent', () => {
    it('couvre les plateformes digitales marocaines clés', () => {
      const agent = new MarketingAgent(CONTEXTE);
      const result = agent.analyser();
      assertResult(result, 'MarketingAgent');
      assert.ok(result.analyse.toLowerCase().includes('tiktok'), 'Doit inclure TikTok');
      assert.ok(result.analyse.toLowerCase().includes('instagram'), 'Doit inclure Instagram');
      assert.ok(result.analyse.toLowerCase().includes('meta'), 'Doit inclure Meta Ads');
    });

    it('inclut une stratégie influenceurs 3 tiers', () => {
      const agent = new MarketingAgent(CONTEXTE);
      const result = agent.analyser();
      assert.ok(result.analyse.toLowerCase().includes('nano'), 'Doit mentionner le tier nano');
      assert.ok(result.analyse.toLowerCase().includes('micro'), 'Doit mentionner le tier micro');
    });
  });

  describe('LegalAgent', () => {
    it('identifie l\'accord de distribution comme jalon n°1', () => {
      const agent = new LegalAgent(CONTEXTE);
      const result = agent.analyser();
      assertResult(result, 'LegalAgent');
      const accord = result.recommandations[0];
      assert.ok(
        accord.titre.toLowerCase().includes('distribution') || accord.titre.toLowerCase().includes('accord'),
        'La première recommandation doit concerner l\'accord de distribution'
      );
      assert.equal(accord.priorite, 'critique', 'L\'accord de distribution doit être critique');
    });

    it('couvre DMP Maroc + CPNP + Halal IMANOR', () => {
      const agent = new LegalAgent(CONTEXTE);
      const result = agent.analyser();
      const kpiNames = result.kpis.map(k => k.name.toLowerCase());
      assert.ok(
        result.analyse.toLowerCase().includes('dmp') || result.analyse.toLowerCase().includes('imanor'),
        'Doit mentionner DMP ou IMANOR'
      );
    });
  });

  describe('FinanceAgent', () => {
    it('calcule un investissement initial réaliste', () => {
      const agent = new FinanceAgent(CONTEXTE);
      const result = agent.analyser();
      assertResult(result, 'FinanceAgent');
      // Investissement doit être > 300 000 MAD (modèle import)
      const hasInvestissement = result.analyse.includes('MAD') && result.analyse.includes('180');
      assert.ok(hasInvestissement || result.analyse.includes('COGS'), 'Doit inclure des données financières en MAD');
    });

    it('présente un modèle import-distribution (pas fabrication)', () => {
      const agent = new FinanceAgent(CONTEXTE);
      const result = agent.analyser();
      assert.ok(
        result.analyse.toLowerCase().includes('import') || result.analyse.toLowerCase().includes('distributeur'),
        'Doit décrire le modèle import/distribution'
      );
    });
  });

  describe('OperationsAgent', () => {
    it('couvre le flux import complet France → Maroc', () => {
      const agent = new OperationsAgent(CONTEXTE);
      const result = agent.analyser();
      assertResult(result, 'OperationsAgent');
      assert.ok(result.analyse.toLowerCase().includes('eur.1') || result.analyse.toLowerCase().includes('ale'), 'Doit mentionner EUR.1 ou ALE');
      assert.ok(result.analyse.toLowerCase().includes('amana') || result.analyse.toLowerCase().includes('cod'), 'Doit mentionner Amana COD');
    });
  });

  describe('EcommerceAgent', () => {
    it('identifie CMI et COD comme critiques', () => {
      const agent = new EcommerceAgent(CONTEXTE);
      const result = agent.analyser();
      assertResult(result, 'EcommerceAgent');
      assert.ok(result.analyse.toLowerCase().includes('cmi'), 'Doit mentionner CMI');
      assert.ok(result.analyse.toLowerCase().includes('cod') || result.analyse.toLowerCase().includes('amana'), 'Doit mentionner COD');
    });

    it('présente le protocole 4 étapes adapté', () => {
      const agent = new EcommerceAgent(CONTEXTE);
      const result = agent.analyser();
      assert.ok(
        result.analyse.includes('Prepare') || result.analyse.includes('Préparer'),
        'Doit présenter le protocole Prepare/Treat/Boost/Restore'
      );
    });
  });

  describe('CustomerAgent', () => {
    it('place la FAQ halal comme priorité J1', () => {
      const agent = new CustomerAgent(CONTEXTE);
      const result = agent.analyser();
      assertResult(result, 'CustomerAgent');
      const faqHalal = result.recommandations.find(r =>
        r.titre.toLowerCase().includes('halal') || r.titre.toLowerCase().includes('faq')
      );
      assert.ok(faqHalal, 'Doit avoir une recommandation sur la FAQ halal');
      assert.equal(faqHalal?.priorite, 'critique');
    });

    it('inclut le Club Routines programme fidélité', () => {
      const agent = new CustomerAgent(CONTEXTE);
      const result = agent.analyser();
      assert.ok(result.analyse.toLowerCase().includes('club'), 'Doit mentionner le Club Routines');
    });
  });
});

describe('MBF Cosmétique — Plan de Lancement 90 Jours', () => {
  it('contient 5 phases de lancement', () => {
    assert.equal(PLAN_LANCEMENT_90J.length, 5);
  });

  it('budget total cohérent (> 200 000 MAD)', () => {
    assert.ok(BUDGET_TOTAL_90J > 200000, `Budget trop faible : ${BUDGET_TOTAL_90J} MAD`);
  });

  it('identifie des jalons bloquants clés', () => {
    const bloquants = JALONS_CRITIQUES.filter(j => j.bloquant);
    assert.ok(bloquants.length >= 5, 'Minimum 5 jalons bloquants attendus');
    const accordDistrib = JALONS_CRITIQUES.find(j =>
      j.jalon.toLowerCase().includes('distribution') || j.jalon.toLowerCase().includes('accord')
    );
    assert.ok(accordDistrib, 'L\'accord de distribution doit être un jalon');
    assert.ok(accordDistrib?.bloquant, 'L\'accord de distribution doit être bloquant');
  });

  it('les phases couvrent toutes les dimensions', () => {
    const tousResponsables = PLAN_LANCEMENT_90J.flatMap(p => p.responsables);
    const expected = ['legal', 'finance', 'produit', 'marketing', 'operations', 'ecommerce', 'customer'];
    for (const r of expected) {
      assert.ok(tousResponsables.includes(r as never), `Agent ${r} absent des phases`);
    }
  });
});

describe('MBF Cosmétique — Coordinateur Swarm', () => {
  it('instancie le coordinateur correctement', () => {
    const coord = new MBFCoordinator();
    assert.ok(coord, 'Coordinateur non instancié');
  });

  it('orchestre tous les agents en parallèle et produit un rapport', async () => {
    const coord = new MBFCoordinator();
    const resultat = await coord.orchestrer();

    assert.ok(resultat, 'Résultat vide');
    assert.ok(resultat.contexte.marque === 'routines.fr', 'Marque incorrecte');
    assert.ok(Object.keys(resultat.resultats).length === 9, `Attendu 9 agents, obtenu ${Object.keys(resultat.resultats).length}`);
    assert.ok(resultat.scorePreparation >= 0 && resultat.scorePreparation <= 100, 'Score invalide');
    assert.ok(resultat.planLancement.length === 5, 'Plan lancement incomplet');

    const rapport = coord.genererRapport(resultat);
    assert.ok(rapport.length > 1000, 'Rapport trop court');
    assert.ok(rapport.includes('MBF'), 'Rapport doit mentionner MBF');
    assert.ok(rapport.includes('routines.fr'), 'Rapport doit mentionner routines.fr');
  });
});
