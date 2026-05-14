/**
 * Financial analysis skills using mathjs, technicalindicators, simple-statistics.
 * All calculations designed for the Moroccan market context.
 */

import * as math from 'mathjs';
import * as ss from 'simple-statistics';
import { EMA, RSI, MACD, BollingerBands } from 'technicalindicators';

// ── Basic financial metrics ──────────────────────────────────────────────────

export function calculateROI(investment, netReturn) {
  return math.round(((netReturn - investment) / investment) * 100, 2);
}

export function calculateCAGR(startValue, endValue, years) {
  if (startValue <= 0 || years <= 0) return null;
  return math.round((Math.pow(endValue / startValue, 1 / years) - 1) * 100, 2);
}

export function calculateBreakeven({ fixedCosts, pricePerUnit, variableCostPerUnit }) {
  const contributionMargin = pricePerUnit - variableCostPerUnit;
  if (contributionMargin <= 0) return null;
  const units = math.ceil(fixedCosts / contributionMargin);
  const revenue = math.round(units * pricePerUnit, 2);
  return { units, revenue, contributionMargin: math.round(contributionMargin, 2) };
}

export function calculateGrossMargin(revenue, cogs) {
  if (revenue <= 0) return null;
  return math.round(((revenue - cogs) / revenue) * 100, 2);
}

export function calculateLTV({ avgOrderValue, purchaseFrequencyPerYear, avgCustomerLifespanYears, grossMarginPct }) {
  return math.round(
    avgOrderValue * purchaseFrequencyPerYear * avgCustomerLifespanYears * (grossMarginPct / 100),
    2
  );
}

// ── Moroccan market pricing model ────────────────────────────────────────────

const MAD_PRICE_TIERS = [
  { label: 'ultra-économique', min: 0, max: 29 },
  { label: 'économique', min: 30, max: 69 },
  { label: 'masstige', min: 70, max: 199, sweet_spot: true },
  { label: 'premium', min: 200, max: 499 },
  { label: 'luxe', min: 500, max: Infinity },
];

export function classifyPriceMAD(priceMAD) {
  const tier = MAD_PRICE_TIERS.find(t => priceMAD >= t.min && priceMAD <= t.max);
  return tier ?? MAD_PRICE_TIERS[0];
}

export function suggestPriceArchitecture(costMAD, targetMarginPct) {
  const basePrice = math.round(costMAD / (1 - targetMarginPct / 100), 2);
  const psychologicalPrices = [29, 49, 69, 99, 129, 149, 199, 249, 299, 349, 399, 499, 699, 999];
  const nearest = psychologicalPrices.reduce((a, b) =>
    Math.abs(b - basePrice) < Math.abs(a - basePrice) ? b : a
  );
  const tier = classifyPriceMAD(nearest);
  const actualMargin = calculateGrossMargin(nearest, costMAD);
  return { basePrice, recommendedPrice: nearest, tier, actualMarginPct: actualMargin };
}

// ── Market sizing (TAM/SAM/SOM) ──────────────────────────────────────────────

export function calculateMarketSizing({ totalPopulation, targetSegmentPct, avgSpendMAD, captureRatePct }) {
  const sam = math.round(totalPopulation * (targetSegmentPct / 100) * avgSpendMAD);
  const som = math.round(sam * (captureRatePct / 100));
  return {
    tam: math.round(totalPopulation * avgSpendMAD),
    sam,
    som,
    somUSD: math.round(som / 9.95),
  };
}

// ── Statistical trend analysis ────────────────────────────────────────────────

export function analyzeTrend(values) {
  if (values.length < 2) return { trend: 'insufficient_data' };
  const regression = ss.linearRegression(values.map((v, i) => [i, v]));
  const slope = regression.m;
  const r2 = ss.rSquared(values.map((v, i) => [i, v]), x => regression.m * x + regression.b);
  const trend = slope > 0 ? 'hausse' : slope < 0 ? 'baisse' : 'stable';
  return {
    trend,
    slope: math.round(slope, 4),
    r2: math.round(r2, 4),
    mean: math.round(ss.mean(values), 2),
    std: math.round(ss.standardDeviation(values), 2),
    forecast_next: math.round(regression.m * values.length + regression.b, 2),
  };
}

export function calculateVolatility(values) {
  if (values.length < 2) return null;
  const returns = values.slice(1).map((v, i) => (v - values[i]) / values[i]);
  return {
    volatilityPct: math.round(ss.standardDeviation(returns) * 100, 2),
    sharpeProxy: math.round(ss.mean(returns) / ss.standardDeviation(returns), 3),
  };
}

// ── Technical indicators for market signals ───────────────────────────────────

export function computeTechnicalSignals(prices) {
  if (prices.length < 14) return { signal: 'insufficient_data' };

  const rsiValues = RSI.calculate({ values: prices, period: Math.min(14, prices.length - 1) });
  const emaFast = EMA.calculate({ values: prices, period: Math.min(9, prices.length) });
  const emaSlow = EMA.calculate({ values: prices, period: Math.min(21, prices.length) });
  const lastRSI = rsiValues[rsiValues.length - 1];
  const lastFast = emaFast[emaFast.length - 1];
  const lastSlow = emaSlow[emaSlow.length - 1];

  const signal =
    lastRSI < 30 ? 'sur-vendu — opportunité achat'
    : lastRSI > 70 ? 'sur-acheté — attention'
    : lastFast > lastSlow ? 'tendance haussière'
    : 'tendance baissière';

  return {
    rsi: math.round(lastRSI, 2),
    emaFast: math.round(lastFast, 2),
    emaSlow: math.round(lastSlow, 2),
    signal,
  };
}

// ── 3-year P&L projection ─────────────────────────────────────────────────────

export function project3YearPL({ year1RevenueMAD, revenueGrowthPct, grossMarginPct, fixedCostsMAD }) {
  const years = [1, 2, 3];
  return years.map(y => {
    const revenue = math.round(year1RevenueMAD * Math.pow(1 + revenueGrowthPct / 100, y - 1));
    const grossProfit = math.round(revenue * (grossMarginPct / 100));
    const ebitda = math.round(grossProfit - fixedCostsMAD);
    const ebitdaMarginPct = math.round((ebitda / revenue) * 100, 1);
    return { year: y, revenueMAD: revenue, grossProfitMAD: grossProfit, ebitdaMAD: ebitda, ebitdaMarginPct };
  });
}

export function formatFinancialSummary({ sizing, pricing, projection, breakeven }) {
  const lines = ['ANALYSE FINANCIÈRE :'];
  if (sizing) lines.push(
    `  Marché adressable (SOM) : ${(sizing.som / 1e6).toFixed(1)}M MAD (${(sizing.somUSD / 1e6).toFixed(1)}M USD)`
  );
  if (pricing) lines.push(
    `  Prix recommandé : ${pricing.recommendedPrice} MAD | Positionnement : ${pricing.tier.label} | Marge réelle : ${pricing.actualMarginPct}%`
  );
  if (breakeven) lines.push(
    `  Seuil rentabilité : ${breakeven.units.toLocaleString()} unités (${(breakeven.revenue / 1e6).toFixed(2)}M MAD)`
  );
  if (projection) {
    lines.push('  Projection CA 3 ans :');
    for (const y of projection) lines.push(
      `    An ${y.year}: ${(y.revenueMAD / 1e6).toFixed(1)}M MAD | EBITDA ${(y.ebitdaMAD / 1e6).toFixed(1)}M (${y.ebitdaMarginPct}%)`
    );
  }
  return lines.join('\n');
}
