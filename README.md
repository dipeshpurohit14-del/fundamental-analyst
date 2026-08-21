# Fundamental Analyst

**Understand the business. Analyze the numbers. Invest with clarity.**

A fundamental-analysis research platform for NSE and BSE-listed stocks and ETFs — financial
statements, valuation ratios, profitability, screening, comparison, a DCF calculator, and a
transparent, rule-based "analytical signal" (not a black-box AI recommendation).

---

## 1. Project overview

Fundamental Analyst lets you:

- Search NSE/BSE stocks and ETFs
- View live (delayed) price quotes and historical charts (1D/1W/1M/6M/1Y/5Y/ALL)
- View an approximate historical P/E chart alongside the price chart
- Read income statement, balance sheet and cash flow statement history
- See profitability, valuation, financial-health and cash-flow ratios
- View a chart of revenue vs. net profit growth
- Get a transparent **Fundamental Score** (0–10 per category) and an **Analytical Signal**
  ("Fundamentally Strong / Fair / Weak") — a documented, rule-based classification, explicitly
  **not personalized investment advice**
- Screen stocks and ETFs by sector, P/E, P/B, market cap and dividend yield
- Compare up to 4 securities side by side
- Build a watchlist (stored in the browser, no login)
- Calculate DCF intrinsic value per share with a WACC × terminal-growth sensitivity table
- Learn the formula, meaning, example, interpretation and limitations of every metric used

**No data is ever invented.** Any field the data source doesn't provide renders as the literal
string `Data unavailable` rather than a fabricated number.

---

## 2. Architecture

```
src/
  components/       Shared UI (Layout, SearchBox, charts, cards, states)
  pages/            One file per route (Home, StockAnalysis, Screener, DCFCalculator, …)
  services/
    marketData/
      provider.js              the ONLY module the UI imports for data
      yahooFinanceProvider.js  concrete implementation (swap this to change providers)
  hooks/            useDebounce, useAsync, useQuotes, useWatchlist
  utils/            format.js, cache.js, dcf.js, fundamentalScore.js, verdict.js
  data/
    securities.js   Curated reference universe (name/symbol/exchange/sector, no price data)

netlify/functions/
  quote.js          Live (delayed) quote proxy
  chart.js          Historical OHLCV proxy
  profile.js        Company profile / fundamentals / statements / ETF holdings proxy
  search.js         Symbol search proxy
  _yahooSession.js  Shared cookie+crumb session helper (see section 4)
```

**Provider abstraction:** every page imports from `services/marketData/provider.js`, never
from a specific vendor module. To switch data vendors, write a new file implementing the same
function signatures (`searchSecurities`, `getQuote`, `getHistoricalPrices`,
`getCompanyProfile`, `getFinancialStatements`, `getFundamentals`, `getETFProfile`,
`getETFHoldings`, `getMarketData`) and change one import line in `provider.js`. No page or
component needs to change.

**Security:** the browser never talks to the data vendor directly. All requests go through
Netlify Functions, so no vendor-specific request shape is ever exposed client-side.

---

## 3. Data provider — what it is, and why it isn't Twelve Data

The original brief specified Twelve Data as the initial provider, with an explicit requirement
to verify its free-tier capabilities before building the data layer, and to not fake anything
it couldn't provide.

**That verification found a hard blocker:** Twelve Data's free/Basic plan (800 calls/day,
8/min) does not include NSE/BSE (Indian market) coverage — India requires their paid "Grow"
plan ($29/mo) or a time-limited trial credential. Company fundamentals/financial statements are
also gated behind a paid tier. Faking that data, or only supporting a handful of US-listed
names, would have violated the project's own rule against fabricated or misrepresented data.

**What this app uses instead:** Yahoo Finance's public, unauthenticated quote / chart /
quoteSummary / search endpoints, called only from Netlify Functions (never the browser). This
is real, live-delayed NSE/BSE data with genuine financial-statement and ratio coverage, at zero
cost, with no API key to manage.

**Trade-offs to know:**

- **Unofficial & undocumented.** These endpoints aren't a published, contractual API. Yahoo
  can change field names or block access without notice. They are well suited to a
  non-commercial, educational research tool like this one — not to a commercial data
  redistribution product sold to end investors.
- **Anti-bot handshake required.** Since 2024, Yahoo requires a session cookie + "crumb" token
  per request or it returns 401. `netlify/functions/_yahooSession.js` performs that handshake
  and caches it for ~30 minutes per warm function instance. If Yahoo changes this mechanism
  again, requests will start failing with a clear "Market data temporarily unavailable"
  message rather than silently showing wrong data — but the code will need an update to match.
- **Delayed data, not real-time.** Every quote in the UI is labeled "Delayed" with a
  timestamp — never labeled "Live."
- **Some fields are genuinely unavailable:** ISIN, ETF expense ratio, and ROCE (which needs
  multi-period EBIT/Capital-Employed detail this endpoint doesn't expose) show
  `Data unavailable` throughout rather than being estimated.
- **I could not run a live network test of these endpoints from the sandboxed environment this
  app was built in** (its firewall only allows a fixed list of package-registry domains). The
  code compiles and the request/response shapes match Yahoo's long-standing, widely used
  schema (the same one libraries like `yfinance` rely on), but you should smoke-test search, a
  stock page, and an ETF page immediately after your first deploy — see section 10.

### Swapping to a licensed provider later

If you outgrow this (e.g. you want a contractual SLA or guaranteed real-time data), implement
`src/services/marketData/twelveDataProvider.js` (or any other vendor) with the same exported
function names as `yahooFinanceProvider.js`, add the vendor's API key to Netlify environment
variables, and change the single import in `provider.js`. Nothing else in the app needs to
change.

---

## 4. Security universe

`src/data/securities.js` contains a curated reference list of roughly 100 large/mid-cap NSE
equities across all major sectors, plus the most liquid, well-known Indian ETFs (NIFTYBEES,
BANKBEES, GOLDBEES, etc.). This file holds only name/symbol/exchange/sector/industry
metadata, never price, market cap, or ratio data, which is always fetched live.

This is not the complete NSE/BSE universe (which runs to several thousand listings). Live
search (the `search` function) supplements the curated list with Yahoo's own symbol search for
anything not in it. A complete, continuously-updated universe requires a licensed
reference-data feed — see section 3.

---

## 5. Environment variables

```
# .env.example

# The default provider (Yahoo Finance) needs NO API key.
# Kept here for forward-compatibility if you swap providers later:
# TWELVE_DATA_API_KEY=
```

Copy `.env.example` to `.env` only if you add a provider that needs a key. Never commit `.env`.

---

## 6. Local installation

```bash
git clone <your-repo-url>
cd fundamental-analyst
npm install
```

## 7. Development

The app calls `/.netlify/functions/*` for all live data, so `vite dev` alone won't serve those
routes — use the Netlify CLI, which runs both the Vite dev server and the functions together:

```bash
npm install -g netlify-cli
netlify dev
```

This serves the app (typically `http://localhost:8888`) with working Netlify Functions.

## 8. Production build

```bash
npm run build      # outputs to dist/
npm run preview    # preview the production build locally
```

## 9. GitHub setup

```bash
git init
git add .
git commit -m "Initial commit: Fundamental Analyst"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

## 10. Netlify deployment

1. Push this repo to GitHub (see section 9).
2. In Netlify: Add new site -> Import an existing project -> select the repo.
3. Build settings (auto-detected from `netlify.toml`, but confirm):
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`
4. No environment variables are required for the default provider.
5. Deploy.

**Smoke-test immediately after your first deploy** (see section 3's caveat about not being
able to test live from the build sandbox):
- Search: type "TCS" in the header search box — you should see NSE results within about 1s.
- Stock page: open `/stock/TCS` — price, ratios, fundamental score and financial statements
  should populate (statements can take a moment on first load).
- ETF page: open `/etf/NIFTYBEES` — price and holdings should populate.
- Delayed labeling: confirm every quote shows "Delayed - as of HH:MM IST", never "Live".

If any of these show "Market data temporarily unavailable," check the function logs in the
Netlify dashboard — most likely cause is Yahoo's cookie/crumb handshake needing an update (see
section 3).

---

## 11. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| "Market data temporarily unavailable" everywhere | Yahoo's anti-bot handshake changed, or IP-level rate limiting kicked in | Check Netlify function logs; update `_yahooSession.js` if Yahoo's cookie/crumb flow changed |
| A specific stock shows mostly "Data unavailable" | That field genuinely isn't in Yahoo's response for that symbol (common for smaller/less-covered companies) | Expected behavior — the app never fabricates missing data |
| Search returns nothing for a valid ticker | Symbol isn't in the curated list and Yahoo's live search didn't match your query text | Try the company's full name instead of an abbreviation |
| Local `npm run dev` shows blank data | Vite alone doesn't run Netlify Functions | Use `netlify dev` instead (see section 7) |
| Charts look empty for the ALL range | Yahoo's max range can be slow for old, thinly-traded symbols | Try a shorter range first |

---

## 12. Known limitations

- Security universe is curated (about 100 equities plus major ETFs), not the full exchange
  listing.
- Data source is unofficial (Yahoo Finance public endpoints) — see section 3 for the full
  trade-off discussion and how to swap to a licensed vendor.
- ROCE, ISIN, and ETF expense ratios are not available from this data source and always show
  "Data unavailable."
- Historical P/E chart is an approximation (historical price divided by current trailing EPS),
  clearly labeled as such, since per-period historical EPS isn't exposed by this endpoint.
- Screener filters operate on quote-level metrics (price, P/E, P/B, market cap, dividend
  yield) fetched in a single batched request, to stay within reasonable request volume — it
  does not filter on ROE/ROCE/Debt-Equity/growth across the whole universe at once.
- The Fundamental Score and Analytical Signal are transparent, documented rule-based
  classifiers over public ratios — not machine-learned, not personalized, and not investment
  advice. Every score shows its exact methodology inline.
- This project was built and build-verified (`npm run build` succeeds) in a sandboxed
  environment without general internet access, so live API behavior could not be tested
  end-to-end before hand-off — smoke-test per section 10 immediately after deploying.

---

## Disclaimer

Fundamental Analyst is an educational and analytical platform. Market data may be delayed,
incomplete, or inaccurate. Nothing on this website constitutes personalized investment advice.
Verify important information with official exchange filings and company disclosures before
making investment decisions.
