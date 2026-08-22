// netlify/functions/lib/yahooSession.cjs
//
// Since 2024, Yahoo Finance's endpoints reject unauthenticated requests with
// 401 unless the request carries a valid session cookie + "crumb" token.
// This helper performs that handshake once and caches it in-process, so
// warm Netlify Function invocations reuse it instead of re-authenticating
// on every request.
//
// This file lives in a subfolder (netlify/functions/lib/) deliberately —
// Netlify's function auto-discovery only scans the top level of the
// functions directory, so a shared helper placed there directly risks being
// picked up as its own (handler-less, broken) function. Subfolders are
// treated as ordinary importable modules instead.

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36';

let cached = null; // { cookie, crumb, obtainedAt }
const TTL_MS = 30 * 60 * 1000; // refresh every 30 min

async function fetchSession() {
  // Step 1: hit a Yahoo Finance page to receive a session cookie.
  const consentRes = await fetch('https://fc.yahoo.com', { headers: { 'User-Agent': UA }, redirect: 'manual' });
  const setCookie = consentRes.headers.get('set-cookie') || '';
  const cookie = setCookie.split(';')[0];

  // Step 2: exchange the cookie for a crumb token.
  const crumbRes = await fetch('https://query1.finance.yahoo.com/v1/test/getcrumb', {
    headers: { 'User-Agent': UA, Cookie: cookie },
  });
  const crumb = await crumbRes.text();

  return { cookie, crumb: crumb && !crumb.includes('<') ? crumb.trim() : '', obtainedAt: Date.now() };
}

async function getYahooSession() {
  if (cached && Date.now() - cached.obtainedAt < TTL_MS) return cached;
  try {
    cached = await fetchSession();
  } catch {
    cached = { cookie: '', crumb: '', obtainedAt: Date.now() };
  }
  return cached;
}

function withCrumb(url, crumb) {
  if (!crumb) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}crumb=${encodeURIComponent(crumb)}`;
}

module.exports = { getYahooSession, withCrumb, UA };
