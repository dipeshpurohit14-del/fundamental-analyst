// netlify/functions/search.cjs
// Proxies Yahoo Finance symbol search, then filters to NSE (.NS) / BSE (.BO) results.

const { getYahooSession, withCrumb, UA } = require('./lib/yahooSession.cjs');

const YAHOO_SEARCH_URL = 'https://query2.finance.yahoo.com/v1/finance/search';

exports.handler = async (event) => {
  const q = event.queryStringParameters?.q;
  if (!q || q.trim().length < 1) {
    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json', 'access-control-allow-origin': '*' },
      body: JSON.stringify({ quotes: [] }),
    };
  }

  const session = await getYahooSession();
  const url = withCrumb(`${YAHOO_SEARCH_URL}?q=${encodeURIComponent(q)}&quotesCount=25&newsCount=0&listsCount=0`, session.crumb);

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, Accept: 'application/json', Cookie: session.cookie },
    });
    if (!res.ok) {
      return {
        statusCode: 502,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ error: 'Market data temporarily unavailable. Please try again.' }),
      };
    }
    const data = await res.json();
    const quotes = (data.quotes || []).filter(
      (r) => r.exchange === 'NSI' || r.exchange === 'BSE' || (r.symbol || '').endsWith('.NS') || (r.symbol || '').endsWith('.BO')
    );
    return {
      statusCode: 200,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'public, max-age=60',
        'access-control-allow-origin': '*',
      },
      body: JSON.stringify({ quotes }),
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ error: 'Market data temporarily unavailable. Please try again.', detail: err.message }),
    };
  }
};
