// netlify/functions/chart.cjs
// Proxies historical OHLCV time series for a single NSE/BSE symbol.
// Data source: Yahoo Finance public chart endpoint (unofficial, no API key).

const { getYahooSession, withCrumb, UA } = require('./lib/yahooSession.cjs');

const YAHOO_CHART_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';

const RANGE_INTERVAL = {
  '1D': { range: '1d', interval: '5m' },
  '1W': { range: '5d', interval: '15m' },
  '1M': { range: '1mo', interval: '1d' },
  '6M': { range: '6mo', interval: '1d' },
  '1Y': { range: '1y', interval: '1d' },
  '5Y': { range: '5y', interval: '1wk' },
  ALL: { range: 'max', interval: '1mo' },
};

exports.handler = async (event) => {
  const symbol = event.queryStringParameters?.symbol;
  const rangeKey = event.queryStringParameters?.range || '1Y';

  if (!symbol) {
    return {
      statusCode: 400,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ error: 'Missing required "symbol" query parameter' }),
    };
  }

  const cfg = RANGE_INTERVAL[rangeKey] || RANGE_INTERVAL['1Y'];
  const session = await getYahooSession();
  const url = withCrumb(
    `${YAHOO_CHART_URL}/${encodeURIComponent(symbol)}?range=${cfg.range}&interval=${cfg.interval}&includePrePost=false`,
    session.crumb
  );

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
    return {
      statusCode: 200,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'public, max-age=60, stale-while-revalidate=120',
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
