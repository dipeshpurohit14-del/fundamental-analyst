// netlify/functions/quote.cjs
// Proxies real-time (delayed) quote data for NSE/BSE symbols.
// Data source: Yahoo Finance public quote endpoint (unofficial, no API key).
// Symbols must be suffixed .NS (NSE) or .BO (BSE), e.g. TCS.NS, RELIANCE.BO

const { getYahooSession, withCrumb, UA } = require('./lib/yahooSession.cjs');

const YAHOO_QUOTE_URL = 'https://query1.finance.yahoo.com/v7/finance/quote';
const YAHOO_QUOTE_FALLBACK = 'https://query2.finance.yahoo.com/v7/finance/quote';

exports.handler = async (event) => {
  const symbols = event.queryStringParameters?.symbols;
  if (!symbols) {
    return {
      statusCode: 400,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ error: 'Missing required "symbols" query parameter' }),
    };
  }

  const session = await getYahooSession();
  const headers = { 'User-Agent': UA, Accept: 'application/json', Cookie: session.cookie };

  const urls = [
    withCrumb(`${YAHOO_QUOTE_URL}?symbols=${encodeURIComponent(symbols)}`, session.crumb),
    withCrumb(`${YAHOO_QUOTE_FALLBACK}?symbols=${encodeURIComponent(symbols)}`, session.crumb),
  ];

  let lastError = null;
  for (const url of urls) {
    try {
      const res = await fetch(url, { headers });
      if (!res.ok) {
        lastError = `Upstream returned ${res.status}`;
        continue;
      }
      const data = await res.json();
      return {
        statusCode: 200,
        headers: {
          'content-type': 'application/json',
          'cache-control': 'public, max-age=15, stale-while-revalidate=30',
          'access-control-allow-origin': '*',
        },
        body: JSON.stringify(data),
      };
    } catch (err) {
      lastError = err.message;
    }
  }

  return {
    statusCode: 502,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ error: 'Market data temporarily unavailable. Please try again.', detail: lastError }),
  };
};
