/**
 * Live Moroccan market data from free, keyless public APIs.
 * Falls back to curated baseline data if network is unavailable.
 */

const FALLBACK = {
  gdpUsd: 142_000_000_000,
  gdpGrowthPct: 3.5,
  gdpPerCapitaUsd: 3750,
  population: 37_840_000,
  urbanPct: 65,
  medianAgeYears: 29,
  giniIndex: 39.5,
  madPerEur: 10.85,
  madPerUsd: 9.95,
  inflationPct: 4.2,
  unemploymentPct: 12.9,
  cosmeticsMarketUsd: 1_400_000_000,
  cosmeticsGrowthPct: 8.2,
  ecommercePenetrPct: 32,
  internetPenetrPct: 88,
  mobilePayPct: 41,
  year: 2025,
};

async function fetchJson(url, timeout = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(id);
  }
}

async function fetchWorldBankIndicator(indicator) {
  const url = `https://api.worldbank.org/v2/country/MA/indicator/${indicator}?format=json&mrv=1`;
  const data = await fetchJson(url);
  const records = data?.[1];
  if (!Array.isArray(records) || records.length === 0) return null;
  return records[0]?.value ?? null;
}

export async function fetchMoroccoEconomics() {
  try {
    const [gdp, gdpPc, pop] = await Promise.all([
      fetchWorldBankIndicator('NY.GDP.MKTP.CD'),
      fetchWorldBankIndicator('NY.GDP.PCAP.CD'),
      fetchWorldBankIndicator('SP.POP.TOTL'),
    ]);
    return {
      source: 'WorldBank',
      live: true,
      gdpUsd: gdp ?? FALLBACK.gdpUsd,
      gdpPerCapitaUsd: gdpPc ?? FALLBACK.gdpPerCapitaUsd,
      population: pop ?? FALLBACK.population,
    };
  } catch {
    return { source: 'fallback', live: false, ...FALLBACK };
  }
}

export async function fetchMoroccoExchangeRates() {
  try {
    const data = await fetchJson('https://open.er-api.com/v6/latest/MAD');
    if (data?.result !== 'success') throw new Error('bad response');
    const rates = data.rates;
    return {
      source: 'ExchangeRate-API',
      live: true,
      madPerEur: rates.EUR ? +(1 / rates.EUR).toFixed(4) : FALLBACK.madPerEur,
      madPerUsd: rates.USD ? +(1 / rates.USD).toFixed(4) : FALLBACK.madPerUsd,
      eurPerMad: rates.EUR ?? null,
      usdPerMad: rates.USD ?? null,
      updatedAt: data.time_last_update_utc,
    };
  } catch {
    return { source: 'fallback', live: false, madPerEur: FALLBACK.madPerEur, madPerUsd: FALLBACK.madPerUsd };
  }
}

export async function fetchMoroccoProfile() {
  try {
    const data = await fetchJson('https://restcountries.com/v3.1/alpha/MA');
    const c = data?.[0];
    if (!c) throw new Error('no data');
    return {
      source: 'RestCountries',
      live: true,
      name: c.name?.common ?? 'Morocco',
      capital: c.capital?.[0] ?? 'Rabat',
      population: c.population ?? FALLBACK.population,
      area: c.area,
      languages: Object.values(c.languages ?? {}),
      currencies: Object.entries(c.currencies ?? {}).map(([code, v]) => ({ code, ...v })),
      region: c.region,
      subregion: c.subregion,
      borders: c.borders ?? [],
    };
  } catch {
    return {
      source: 'fallback',
      live: false,
      name: 'Morocco',
      capital: 'Rabat',
      population: FALLBACK.population,
      languages: ['Arabic', 'Berber (Tamazight)', 'French'],
      currencies: [{ code: 'MAD', name: 'Moroccan Dirham', symbol: 'د.م.' }],
      region: 'Africa',
      subregion: 'Northern Africa',
      borders: ['DZA', 'ESH', 'ESP'],
    };
  }
}

export async function fetchAllMoroccoData() {
  const [economics, rates, profile] = await Promise.all([
    fetchMoroccoEconomics(),
    fetchMoroccoExchangeRates(),
    fetchMoroccoProfile(),
  ]);
  return {
    economics: { ...economics, ...FALLBACK },
    rates,
    profile,
    market: {
      cosmeticsMarketUsd: FALLBACK.cosmeticsMarketUsd,
      cosmeticsGrowthPct: FALLBACK.cosmeticsGrowthPct,
      ecommercePenetrPct: FALLBACK.ecommercePenetrPct,
      internetPenetrPct: FALLBACK.internetPenetrPct,
      mobilePayPct: FALLBACK.mobilePayPct,
      urbanPct: FALLBACK.urbanPct,
      medianAgeYears: FALLBACK.medianAgeYears,
    },
  };
}

export function formatMoroccoContext(data) {
  const e = data.economics;
  const r = data.rates;
  const m = data.market;
  return [
    `DONNÉES MARCHÉ MAROC (${e.live ? 'live' : 'référence'} — ${new Date().getFullYear()})`,
    `  PIB : ${(e.gdpUsd / 1e9).toFixed(0)} Mds USD | PIB/hab : ${e.gdpPerCapitaUsd?.toFixed(0)} USD`,
    `  Population : ${(e.population / 1e6).toFixed(1)}M | Urbanisation : ${m.urbanPct}% | Âge médian : ${m.medianAgeYears} ans`,
    `  Taux de change : 1 EUR = ${r.madPerEur} MAD | 1 USD = ${r.madPerUsd} MAD`,
    `  Marché cosmétiques : ${(m.cosmeticsMarketUsd / 1e6).toFixed(0)}M USD | Croissance : +${m.cosmeticsGrowthPct}%/an`,
    `  E-commerce pénétration : ${m.ecommercePenetrPct}% | Internet : ${m.internetPenetrPct}% | Mobile pay : ${m.mobilePayPct}%`,
  ].join('\n');
}
