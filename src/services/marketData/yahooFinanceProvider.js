// src/services/marketData/yahooFinanceProvider.js
//
// Concrete provider implementation backed by Yahoo Finance's public,
// unauthenticated endpoints, reached through Netlify Functions (never
// called from the browser directly, and no API key is required or used).
//
// IMPORTANT — read before swapping providers:
// These Yahoo endpoints are UNOFFICIAL and undocumented. They are well
// suited to a non-commercial, educational research tool like this one, but
// they can change or go down without notice, and they are not a licensed
// redistribution product. Do not represent this app as a commercial data
// redistribution product to end investors. Prices are best-effort delayed
// snapshots, not exchange-certified real-time feeds — see DATA_FRESHNESS.
//
// To swap to a licensed vendor (e.g. Twelve Data's paid Grow/Pro plan),
// implement the same function signatures in a new file and repoint
// provider.js at it. Nothing else in the app needs to change.

import { withCache } from '../../utils/cache';
import { DATA_UNAVAILABLE } from '../../utils/format';
import { SECURITIES, findBySymbol } from '../../data/securities';

export const PROVIDER_NAME = 'Yahoo Finance (unofficial, delayed)';
export const DATA_FRESHNESS = 'delayed';

const FN_BASE = '/.netlify/functions';

async function callFn(path, params) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${FN_BASE}/${path}?${qs}`);
  const contentType = res.headers.get('content-type') || '';
  const looksLikeJson = contentType.includes('application/json');

  if (!res.ok) {
    let msg = 'Market data temporarily unavailable. Please try again.';
    try {
      const body = await res.json();
      if (body?.error) msg = body.error;
    } catch {
      /* ignore parse errors, use default message */
    }
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }

  // A 200 status with a non-JSON body means something upstream of the
  // function handler (a misconfigured redirect, a build-time function
  // failure, etc.) served the wrong content — e.g. the app shell instead
  // of the function's response. Fail with a clear, actionable message
  // rather than letting res.json() throw a raw SyntaxError.
  if (!looksLikeJson) {
    throw new Error(
      `Netlify function "${path}" returned ${contentType || 'an unexpected response type'} instead of JSON. ` +
        'This usually means the function failed to deploy or is being intercepted by a redirect rule — check the Netlify Functions log.'
    );
  }

  try {
    return await res.json();
  } catch {
    throw new Error(`Netlify function "${path}" returned malformed JSON. Please try again.`);
  }
}

// Yahoo's newer endpoints wrap numbers as { raw, fmt }. Unwrap safely.
function raw(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === 'object' && 'raw' in v) return v.raw ?? null;
  return v;
}

function toYahooSymbol(symbol) {
  if (symbol.includes('.')) return symbol; // already suffixed
  const ref = findBySymbol(symbol);
  return ref ? ref.yahooSymbol : `${symbol}.NS`;
}

function fromYahooSymbol(yahooSymbol) {
  return yahooSymbol.replace(/\.(NS|BO)$/, '');
}

// ---------------------------------------------------------------------
// searchSecurities
// ---------------------------------------------------------------------
export async function searchSecurities(query) {
  const q = (query || '').trim();
  if (!q) return [];

  // Fast path: match against the curated local reference universe first —
  // this covers the common case with zero network latency.
  const local = SECURITIES.filter(
    (s) =>
      s.name.toLowerCase().includes(q.toLowerCase()) ||
      s.symbol.toLowerCase().includes(q.toLowerCase())
  ).map((s) => ({
    symbol: s.symbol,
    name: s.name,
    exchange: s.exchange,
    type: s.type,
    sector: s.sector,
    industry: s.industry,
  }));

  if (local.length >= 8 || q.length < 2) return local.slice(0, 20);

  // Fall back to live Yahoo search for anything not in the curated list.
  try {
    const data = await withCache(`search:${q}`, 60_000, () => callFn('search', { q }));
    const remote = (data.quotes || [])
      .filter((r) => r.quoteType === 'EQUITY' || r.quoteType === 'ETF')
      .map((r) => ({
        symbol: fromYahooSymbol(r.symbol),
        name: r.longname || r.shortname || r.symbol,
        exchange: r.exchange === 'NSI' ? 'NSE' : r.exchange === 'BSE' ? 'BSE' : r.exchange,
        type: r.quoteType === 'ETF' ? 'ETF' : 'EQUITY',
        sector: DATA_UNAVAILABLE,
        industry: DATA_UNAVAILABLE,
      }));
    const merged = [...local];
    for (const r of remote) {
      if (!merged.some((m) => m.symbol === r.symbol)) merged.push(r);
    }
    return merged.slice(0, 20);
  } catch {
    return local;
  }
}

// ---------------------------------------------------------------------
// getQuote / getQuotes
// ---------------------------------------------------------------------
function mapQuote(q) {
  if (!q) return null;
  return {
    symbol: fromYahooSymbol(q.symbol || ''),
    name: q.longName || q.shortName || DATA_UNAVAILABLE,
    exchange: q.fullExchangeName?.includes('NSE') ? 'NSE' : q.fullExchangeName?.includes('BSE') ? 'BSE' : (q.exchange ?? DATA_UNAVAILABLE),
    currency: q.currency || 'INR',
    price: q.regularMarketPrice ?? null,
    change: q.regularMarketChange ?? null,
    changePercent: q.regularMarketChangePercent ?? null,
    previousClose: q.regularMarketPreviousClose ?? null,
    open: q.regularMarketOpen ?? null,
    dayHigh: q.regularMarketDayHigh ?? null,
    dayLow: q.regularMarketDayLow ?? null,
    volume: q.regularMarketVolume ?? null,
    marketCap: q.marketCap ?? null,
    peTrailing: q.trailingPE ?? null,
    pb: q.priceToBook ?? null,
    eps: q.epsTrailingTwelveMonths ?? null,
    fiftyTwoWeekHigh: q.fiftyTwoWeekHigh ?? null,
    fiftyTwoWeekLow: q.fiftyTwoWeekLow ?? null,
    dividendYield: q.trailingAnnualDividendYield ?? null,
    marketState: q.marketState || DATA_UNAVAILABLE,
    asOf: q.regularMarketTime ? q.regularMarketTime * 1000 : Date.now(),
    freshness: DATA_FRESHNESS,
  };
}

export async function getQuotes(symbols) {
  const yahooSymbols = symbols.map(toYahooSymbol).join(',');
  const data = await withCache(`quotes:${yahooSymbols}`, 15_000, () => callFn('quote', { symbols: yahooSymbols }));
  const results = data?.quoteResponse?.result || [];
  return results.map(mapQuote).filter(Boolean);
}

export async function getQuote(symbol) {
  const [q] = await getQuotes([symbol]);
  if (!q) throw new Error('Symbol not found.');
  return q;
}

// ---------------------------------------------------------------------
// getHistoricalPrices
// ---------------------------------------------------------------------
export async function getHistoricalPrices(symbol, range = '1Y') {
  const ySym = toYahooSymbol(symbol);
  const data = await withCache(`chart:${ySym}:${range}`, 60_000, () => callFn('chart', { symbol: ySym, range }));
  const result = data?.chart?.result?.[0];
  if (!result) return [];
  const timestamps = result.timestamp || [];
  const quote = result.indicators?.quote?.[0] || {};
  const closes = quote.close || [];
  const opens = quote.open || [];
  const highs = quote.high || [];
  const lows = quote.low || [];
  const volumes = quote.volume || [];

  return timestamps
    .map((t, i) => ({
      date: t * 1000,
      open: opens[i] ?? null,
      high: highs[i] ?? null,
      low: lows[i] ?? null,
      close: closes[i] ?? null,
      volume: volumes[i] ?? null,
    }))
    .filter((c) => c.close !== null);
}

// ---------------------------------------------------------------------
// quoteSummary helper (shared by profile / fundamentals / statements / ETF)
// ---------------------------------------------------------------------
async function getSummary(symbol) {
  const ySym = toYahooSymbol(symbol);
  const data = await withCache(`summary:${ySym}`, 300_000, () => callFn('profile', { symbol: ySym }));
  const result = data?.quoteSummary?.result?.[0];
  if (!result) throw new Error('Symbol not found.');
  return result;
}

// ---------------------------------------------------------------------
// getCompanyProfile
// ---------------------------------------------------------------------
export async function getCompanyProfile(symbol) {
  const s = await getSummary(symbol);
  const p = s.assetProfile || {};
  const ref = findBySymbol(symbol);
  return {
    symbol,
    name: s.price?.longName || s.price?.shortName || ref?.name || DATA_UNAVAILABLE,
    sector: p.sector || ref?.sector || DATA_UNAVAILABLE,
    industry: p.industry || ref?.industry || DATA_UNAVAILABLE,
    description: p.longBusinessSummary || DATA_UNAVAILABLE,
    employees: p.fullTimeEmployees ?? DATA_UNAVAILABLE,
    website: p.website || DATA_UNAVAILABLE,
    address: [p.address1, p.city, p.country].filter(Boolean).join(', ') || DATA_UNAVAILABLE,
    exchange: ref?.exchange || (s.price?.exchangeName ?? DATA_UNAVAILABLE),
    isin: DATA_UNAVAILABLE, // Not provided by this endpoint on the free tier.
  };
}

// ---------------------------------------------------------------------
// getFundamentals — ratio snapshot used across the app
// ---------------------------------------------------------------------
export async function getFundamentals(symbol) {
  const s = await getSummary(symbol);
  const sd = s.summaryDetail || {};
  const ks = s.defaultKeyStatistics || {};
  const fd = s.financialData || {};

  const val = (obj, key) => {
    const v = obj?.[key];
    return v === undefined ? null : raw(v);
  };

  return {
    marketCap: val(sd, 'marketCap') ?? val(ks, 'enterpriseValue'),
    peTrailing: val(sd, 'trailingPE'),
    peForward: val(sd, 'forwardPE'),
    pb: val(ks, 'priceToBook'),
    eps: val(ks, 'trailingEps'),
    bookValue: val(ks, 'bookValue'),
    pegRatio: val(ks, 'pegRatio'),
    evToEbitda: val(ks, 'enterpriseToEbitda'),
    evToRevenue: val(ks, 'enterpriseToRevenue'),
    priceToSales: val(sd, 'priceToSalesTrailing12Months'),
    dividendYield: val(sd, 'dividendYield') != null ? val(sd, 'dividendYield') * 100 : null,
    payoutRatio: val(sd, 'payoutRatio') != null ? val(sd, 'payoutRatio') * 100 : null,
    beta: val(ks, 'beta'),

    roe: val(fd, 'returnOnEquity') != null ? val(fd, 'returnOnEquity') * 100 : null,
    roa: val(fd, 'returnOnAssets') != null ? val(fd, 'returnOnAssets') * 100 : null,
    roce: null, // Not directly available from this endpoint; requires EBIT/Capital Employed derivation — see getFinancialStatements.

    grossMargin: val(fd, 'grossMargins') != null ? val(fd, 'grossMargins') * 100 : null,
    ebitdaMargin: val(fd, 'ebitdaMargins') != null ? val(fd, 'ebitdaMargins') * 100 : null,
    operatingMargin: val(fd, 'operatingMargins') != null ? val(fd, 'operatingMargins') * 100 : null,
    netMargin: val(fd, 'profitMargins') != null ? val(fd, 'profitMargins') * 100 : null,

    revenueGrowth: val(fd, 'revenueGrowth') != null ? val(fd, 'revenueGrowth') * 100 : null,
    earningsGrowth: val(fd, 'earningsGrowth') != null ? val(fd, 'earningsGrowth') * 100 : null,

    totalCash: val(fd, 'totalCash'),
    totalDebt: val(fd, 'totalDebt'),
    debtToEquity: val(fd, 'debtToEquity') != null ? val(fd, 'debtToEquity') / 100 : null,
    currentRatio: val(fd, 'currentRatio'),
    quickRatio: val(fd, 'quickRatio'),

    operatingCashFlow: val(fd, 'operatingCashflow'),
    freeCashFlow: val(fd, 'freeCashflow'),

    fiftyTwoWeekHigh: val(sd, 'fiftyTwoWeekHigh'),
    fiftyTwoWeekLow: val(sd, 'fiftyTwoWeekLow'),
    averageVolume: val(sd, 'averageVolume'),
  };
}

// ---------------------------------------------------------------------
// getFinancialStatements
// ---------------------------------------------------------------------
function mapStatementRows(rows, fieldMap) {
  return (rows || []).map((row) => {
    const out = { period: row.endDate ? raw(row.endDate) * 1000 : null };
    for (const [outKey, srcKey] of Object.entries(fieldMap)) {
      out[outKey] = raw(row[srcKey]) ?? null;
    }
    return out;
  }).sort((a, b) => (a.period || 0) - (b.period || 0));
}

// If a metric is exactly 0 across every available period, that's far more
// likely to be Yahoo defaulting a missing field to zero than a real business
// result (especially for large, profitable companies) — treat it as
// unavailable rather than display a misleading "₹0.00".
function nullifyImplausibleZeroColumns(rows, keys) {
  if (rows.length === 0) return rows;
  const allZeroKeys = keys.filter((key) => rows.every((r) => r[key] === 0));
  if (allZeroKeys.length === 0) return rows;
  return rows.map((r) => {
    const copy = { ...r };
    for (const key of allZeroKeys) copy[key] = null;
    return copy;
  });
}
export async function getFinancialStatements(symbol) {
  const s = await getSummary(symbol);

  const income = mapStatementRows(s.incomeStatementHistory?.incomeStatementHistory, {
    revenue: 'totalRevenue',
    costOfRevenue: 'costOfRevenue',
    grossProfit: 'grossProfit',
    operatingIncome: 'operatingIncome',
    ebit: 'ebit',
    interestExpense: 'interestExpense',
    incomeTaxExpense: 'incomeTaxExpense',
    netIncome: 'netIncome',
  });

  const balance = mapStatementRows(s.balanceSheetHistory?.balanceSheetStatements, {
    totalAssets: 'totalAssets',
    totalCurrentAssets: 'totalCurrentAssets',
    cash: 'cash',
    totalLiabilities: 'totalLiab',
    totalCurrentLiabilities: 'totalCurrentLiabilities',
    shortLongTermDebt: 'shortLongTermDebt',
    longTermDebt: 'longTermDebt',
    totalStockholderEquity: 'totalStockholderEquity',
  });

  const cashflow = mapStatementRows(s.cashflowStatementHistory?.cashflowStatements, {
    operatingCashFlow: 'totalCashFromOperatingActivities',
    capitalExpenditures: 'capitalExpenditures',
    investingCashFlow: 'totalCashflowsFromInvestingActivities',
    financingCashFlow: 'totalCashFromFinancingActivities',
    netIncome: 'netIncome',
  });

  const incomeWithEbitda = income.map((r) => ({ ...r, ebitda: r.ebit ?? null }));
  const incomeClean = nullifyImplausibleZeroColumns(incomeWithEbitda, [
    'revenue',
    'costOfRevenue',
    'grossProfit',
    'operatingIncome',
    'ebit',
    'ebitda',
    'interestExpense',
    'incomeTaxExpense',
    'netIncome',
  ]);

  const balanceWithDebt = balance.map((r) => ({
    ...r,
    debt: (r.shortLongTermDebt ?? 0) + (r.longTermDebt ?? 0) || r.shortLongTermDebt || r.longTermDebt || null,
  }));
  const balanceClean = nullifyImplausibleZeroColumns(balanceWithDebt, [
    'totalAssets',
    'totalCurrentAssets',
    'cash',
    'totalLiabilities',
    'totalCurrentLiabilities',
    'debt',
    'totalStockholderEquity',
  ]);

  const cashflowWithFcf = cashflow.map((r) => ({
    ...r,
    freeCashFlow:
      r.operatingCashFlow != null && r.capitalExpenditures != null
        ? r.operatingCashFlow + r.capitalExpenditures // capex is already negative in Yahoo's convention
        : null,
  }));
  const cashflowClean = nullifyImplausibleZeroColumns(cashflowWithFcf, [
    'operatingCashFlow',
    'capitalExpenditures',
    'investingCashFlow',
    'financingCashFlow',
    'freeCashFlow',
  ]);

  return {
    income: incomeClean,
    balance: balanceClean,
    cashflow: cashflowClean,
  };
}
// ---------------------------------------------------------------------
// getETFProfile / getETFHoldings
// ---------------------------------------------------------------------
export async function getETFProfile(symbol) {
  const s = await getSummary(symbol);
  const sd = s.summaryDetail || {};
  const p = s.assetProfile || {};
  const ref = findBySymbol(symbol);
  const val = (obj, key) => (obj?.[key] === undefined ? null : raw(obj[key]));

  return {
    symbol,
    name: s.price?.longName || s.price?.shortName || ref?.name || DATA_UNAVAILABLE,
    exchange: ref?.exchange || DATA_UNAVAILABLE,
    trackingIndex: ref?.trackingIndex || DATA_UNAVAILABLE,
    aum: val(sd, 'totalAssets') ?? DATA_UNAVAILABLE,
    expenseRatio: DATA_UNAVAILABLE, // Not exposed by this endpoint for Indian ETFs on the free tier.
    dividendYield: val(sd, 'dividendYield') != null ? val(sd, 'dividendYield') * 100 : DATA_UNAVAILABLE,
    fiftyTwoWeekHigh: val(sd, 'fiftyTwoWeekHigh') ?? DATA_UNAVAILABLE,
    fiftyTwoWeekLow: val(sd, 'fiftyTwoWeekLow') ?? DATA_UNAVAILABLE,
    description: p.longBusinessSummary || DATA_UNAVAILABLE,
  };
}

export async function getETFHoldings(symbol) {
  const s = await getSummary(symbol);
  const th = s.topHoldings || {};
  const val = (v) => (v === undefined ? null : raw(v));

  const holdings = (th.holdings || []).map((h) => ({
    symbol: h.symbol,
    name: h.holdingName,
    weight: val(h.holdingPercent) != null ? val(h.holdingPercent) * 100 : null,
  }));

   const sectorWeightings = (th.sectorWeightings || [])
    .map((sw) => {
      const entry = Object.entries(sw || {})[0];
      if (!entry) return null;
      const [key, v] = entry;
      return { sector: key, weight: val(v) != null ? val(v) * 100 : null };
    })
    .filter(Boolean);

  return {
    holdings: holdings.length ? holdings : [],
    holdingsAvailable: holdings.length > 0,
    sectorWeightings,
    top10Weight: val(th.holdingsCount) ? null : null,
  };
}

// ---------------------------------------------------------------------
// getMarketData — index quotes (NIFTY 50, SENSEX, NIFTY BANK, etc.)
// ---------------------------------------------------------------------
const INDEX_SYMBOLS = {
  NIFTY50: '^NSEI',
  SENSEX: '^BSESN',
  NIFTYBANK: '^NSEBANK',
  NIFTYIT: '^CNXIT',
  NIFTYMIDCAP: 'NIFTY_MIDCAP_100.NS',
};

export async function getMarketData(indexKey) {
  const ySym = INDEX_SYMBOLS[indexKey] || indexKey;
  const data = await withCache(`index:${ySym}`, 15_000, () => callFn('quote', { symbols: ySym }));
  const q = data?.quoteResponse?.result?.[0];
  if (!q) throw new Error('Index data unavailable.');
  return mapQuote(q);
}

export const INDEX_KEYS = Object.keys(INDEX_SYMBOLS);
