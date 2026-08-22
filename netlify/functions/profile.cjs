// netlify/functions/profile.cjs
// Proxies Yahoo Finance quoteSummary: company profile, key statistics,
// financial statements, and ETF top holdings — for a single NSE/BSE symbol.
// Data source: unofficial public endpoint, no API key required.

const { getYahooSession, withCrumb, UA } = require('./lib/yahooSession.cjs');

const BASE = 'https://query2.finance.yahoo.com/v10/finance/quoteSummary';

const DEFAULT_MODULES = [
  'assetProfile',
  'summaryDetail',
  'defaultKeyStatistics',
  'financialData',
  'price',
  'incomeStatementHistory',
  'incomeStatementHistoryQuarterly',
  'balanceSheetHistory',
  'cashflowStatementHistory',
  'topHoldings',
  'fundProfile',
].join(',');

exports.handler = async (event) => {
  const symbol = event.queryStringParameters?.symbol;
  const modules = event.queryStringParameters?.modules || DEFAULT_MODULES;

  if (!symbol) {
    return {
      statusCode: 400,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ error: 'Missing required "symbol" query parameter' }),
    };
  }

  const session = await getYahooSession();
  const url = withCrumb(`${BASE}/${encodeURIComponent(symbol)}?modules=${encodeURIComponent(modules)}`, session.crumb);

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, Accept: 'application/json', Cookie: session.cookie },
    });
    if (!res.ok) {
      return {
        statusCode: res.status === 404 ? 404 : 502,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          error: res.status === 404 ? 'Symbol not found.' : 'Market data temporarily unavailable. Please try again.',
        }),
      };
    }
    const data = await res.json();
    return {
      statusCode: 200,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'public, max-age=300, stale-while-revalidate=600',
        'access-control-allow-origin': '*',
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ error: 'Market data temporarily unavailable. Please try again.', detail: err.message }),
    };
  }
};
