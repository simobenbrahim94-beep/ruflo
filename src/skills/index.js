/**
 * Unified skills module for CoordinateurMarocain.
 * Aggregates: live market data, financial analysis, NLP sentiment.
 */

export * from './market-data.js';
export * from './financial.js';
export * from './sentiment.js';

import { fetchAllMoroccoData, formatMoroccoContext } from './market-data.js';
import {
  suggestPriceArchitecture,
  calculateMarketSizing,
  project3YearPL,
  calculateBreakeven,
  formatFinancialSummary,
} from './financial.js';
import { detectCompetitiveSignals, formatSentimentReport } from './sentiment.js';

/**
 * One-call init: fetches live data + computes baseline financial model.
 * Returns an enrichedContext object ready to be injected into agent prompts.
 */
export async function buildEnrichedContext(options = {}) {
  const {
    secteur = 'cosmétiques naturels',
    costPerUnitMAD = 35,
    targetMarginPct = 65,
    fixedCostsMAD = 200_000,
    year1RevenueMAD = 3_000_000,
    revenueGrowthPct = 35,
  } = options;

  const [liveData] = await Promise.all([fetchAllMoroccoData()]);

  const pricing = suggestPriceArchitecture(costPerUnitMAD, targetMarginPct);

  const sizing = calculateMarketSizing({
    totalPopulation: liveData.economics.population ?? 37_840_000,
    targetSegmentPct: 15,
    avgSpendMAD: pricing.recommendedPrice * 6,
    captureRatePct: 3,
  });

  const breakeven = calculateBreakeven({
    fixedCosts: fixedCostsMAD,
    pricePerUnit: pricing.recommendedPrice,
    variableCostPerUnit: costPerUnitMAD,
  });

  const projection = project3YearPL({
    year1RevenueMAD,
    revenueGrowthPct,
    grossMarginPct: pricing.actualMarginPct,
    fixedCostsMAD,
  });

  return {
    liveData,
    pricing,
    sizing,
    breakeven,
    projection,
    secteur,
    marketContextStr: formatMoroccoContext(liveData),
    financialStr: formatFinancialSummary({ sizing, pricing, projection, breakeven }),
  };
}

/**
 * Post-orchestration: runs sentiment analysis on all agent outputs.
 */
export function analyzeOrchestrationOutputs(contexte) {
  const signals = detectCompetitiveSignals(contexte);
  return {
    signals,
    report: formatSentimentReport(signals),
  };
}
