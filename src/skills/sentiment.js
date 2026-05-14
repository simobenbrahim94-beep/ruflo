/**
 * NLP and market sentiment analysis for Moroccan business signals.
 * Uses AFINN-165 sentiment scoring + keyword extraction.
 */

import Sentiment from 'sentiment';
import naturalPkg from 'natural';
const { WordTokenizer, TfIdf } = naturalPkg;

const analyzer = new Sentiment();
const tokenizer = new WordTokenizer();

// Moroccan/French business signal lexicon (AFINN-extension)
const MOROCCO_EXTRAS = {
  // Positive
  halal: 3, argan: 3, premium: 2, luxe: 2, croissance: 2, opportunité: 3,
  rentable: 3, profit: 2, bénéfice: 2, expansion: 2, innovation: 2,
  'made-in-morocco': 3, export: 2, certifié: 2, tendance: 1, fidélisation: 2,
  // Negative
  crise: -3, risque: -2, réglementation: -1, concurrence: -2, perte: -3,
  difficultés: -2, blocage: -2, infraction: -3, sanction: -3, frauduleux: -4,
  contrefaçon: -3, informel: -1,
};

export function analyzeMarketSentiment(text) {
  if (!text || text.trim().length === 0) return { score: 0, signal: 'neutre', tokens: [] };

  const result = analyzer.analyze(text, { extras: MOROCCO_EXTRAS });
  const score = result.score;
  const signal =
    score >= 4 ? 'très positif — fort potentiel de profit'
    : score >= 1 ? 'positif — opportunité viable'
    : score === 0 ? 'neutre — analyse approfondie requise'
    : score >= -3 ? 'mitigé — surveiller les risques'
    : 'négatif — risque élevé';

  return {
    score,
    signal,
    positive: result.positive,
    negative: result.negative,
    comparative: Math.round(result.comparative * 100) / 100,
  };
}

export function extractKeyTerms(texts, topN = 10) {
  const tfidf = new TfIdf();
  const docs = Array.isArray(texts) ? texts : [texts];
  docs.forEach(t => tfidf.addDocument(t));

  const terms = [];
  tfidf.listTerms(0).slice(0, topN).forEach(item => {
    terms.push({ term: item.term, score: Math.round(item.tfidf * 100) / 100 });
  });
  return terms;
}

export function detectCompetitiveSignals(agentOutputs) {
  const combined = Object.values(agentOutputs).join(' ');
  const tokens = tokenizer.tokenize(combined.toLowerCase());

  const signals = {
    prixCles: tokens.filter(t => /\d+\s*(mad|dh|dirham)/.test(t + ' ')).slice(0, 5),
    canauxDistrib: [],
    risques: [],
    opportunites: [],
  };

  const channelKeywords = ['marjane', 'jumia', 'pharmacie', 'attar', 'hanout', 'tiktok', 'instagram', 'souk'];
  const riskKeywords = ['réglementation', 'concurrence', 'contrefaçon', 'tva', 'douane', 'onssa'];
  const opKeywords = ['export', 'afrique', 'halal', 'argan', 'premium', 'digital', 'ramadan'];

  channelKeywords.forEach(k => { if (combined.toLowerCase().includes(k)) signals.canauxDistrib.push(k); });
  riskKeywords.forEach(k => { if (combined.toLowerCase().includes(k)) signals.risques.push(k); });
  opKeywords.forEach(k => { if (combined.toLowerCase().includes(k)) signals.opportunites.push(k); });

  const sentiment = analyzeMarketSentiment(combined);

  return { ...signals, sentiment };
}

export function formatSentimentReport(signals) {
  return [
    'ANALYSE SIGNAUX MARCHÉ :',
    `  Sentiment global : ${signals.sentiment.signal} (score: ${signals.sentiment.score})`,
    `  Canaux détectés : ${signals.canauxDistrib.join(', ') || 'aucun'}`,
    `  Opportunités clés : ${signals.opportunites.join(', ') || 'aucune'}`,
    `  Points de risque : ${signals.risques.join(', ') || 'aucun'}`,
  ].join('\n');
}
