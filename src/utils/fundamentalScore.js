// src/utils/fundamentalScore.js
//
// A transparent, rule-based scoring framework — NOT a machine-learned or
// black-box model, and NOT investment advice. Every threshold below is
// shown to the user on the "How this is calculated" panel of the stock page.
//
// Each category scores 0–10. Missing inputs are excluded from the category
// average (not treated as zero) and flagged, so a category confidence stays
// visible instead of a silently misleading number.

function clampScore(x) {
  return Math.max(0, Math.min(10, x));
}

// Piecewise-linear scorer: below `lo` -> 0, above `hi` -> 10, linear between.
function scaleUp(value, lo, hi) {
  if (value == null || Number.isNaN(value)) return null;
  if (value <= lo) return 0;
  if (value >= hi) return 10;
  return clampScore(((value - lo) / (hi - lo)) * 10);
}

// Same, but lower values score higher (e.g. Debt/Equity, P/E in some framings).
function scaleDown(value, hi, lo) {
  if (value == null || Number.isNaN(value)) return null;
  if (value >= hi) return 0;
  if (value <= lo) return 10;
  return clampScore(((hi - value) / (hi - lo)) * 10);
}

function average(scores) {
  const valid = scores.filter((s) => s !== null);
  if (valid.length === 0) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

export function computeFundamentalScore(f) {
  // f = fundamentals object from provider.getFundamentals()

  const profitability = average([
    scaleUp(f.roe, 0, 25), // ROE: 0% -> 0, 25%+ -> 10
    scaleUp(f.roa, 0, 12), // ROA: 0% -> 0, 12%+ -> 10
    scaleUp(f.netMargin, 0, 25), // Net margin: 0% -> 0, 25%+ -> 10
    scaleUp(f.operatingMargin, 0, 30),
  ]);

  const growth = average([
    scaleUp(f.revenueGrowth, -5, 20), // Revenue growth: -5% -> 0, 20%+ -> 10
    scaleUp(f.earningsGrowth, -10, 25),
  ]);

  const financialHealth = average([
    scaleDown(f.debtToEquity, 2, 0), // D/E: 2.0+ -> 0, 0 -> 10
    scaleUp(f.currentRatio, 0.5, 2.5),
    scaleUp(f.quickRatio, 0.3, 1.8),
  ]);

  const cashFlow = average([
    f.operatingCashFlow != null && f.freeCashFlow != null
      ? scaleUp(f.freeCashFlow / Math.max(Math.abs(f.operatingCashFlow), 1), 0, 0.8) * 10 / 10 // FCF conversion proxy
      : null,
    f.freeCashFlow != null ? (f.freeCashFlow > 0 ? 10 : 2) : null,
  ]);

  const valuation = average([
    scaleDown(f.peTrailing, 60, 8), // Cheaper P/E scores higher; 60+ -> 0, 8 or below -> 10
    scaleDown(f.pb, 10, 1),
    f.pegRatio != null ? scaleDown(f.pegRatio, 3, 0.5) : null,
  ]);

  // "Business quality" blends profitability durability + low leverage as a proxy
  // for franchise strength, since moat data isn't quantifiable from ratios alone.
  const businessQuality = average([profitability, financialHealth]);

  const categories = {
    businessQuality,
    growth,
    profitability,
    financialHealth,
    cashFlow,
    valuation,
  };

  const overall = average(Object.values(categories));

  return {
    overall: overall !== null ? Number(overall.toFixed(1)) : null,
    categories: Object.fromEntries(
      Object.entries(categories).map(([k, v]) => [k, v !== null ? Number(v.toFixed(1)) : null])
    ),
    methodologyNote:
      'Fundamental score is an analytical framework, not financial advice. Each category is a weighted average of standard ratios scaled against typical healthy ranges for Indian large/mid-cap equities; missing data points are excluded rather than penalized.',
  };
}

export const SCORE_METHODOLOGY = [
  { category: 'Profitability', basis: 'ROE, ROA, net margin, operating margin — scaled against 0–25%/0–30% healthy ranges.' },
  { category: 'Growth', basis: 'YoY revenue growth (-5% to 20% range) and earnings growth (-10% to 25% range).' },
  { category: 'Financial Health', basis: 'Debt/Equity (lower is better, 0–2.0 range), current ratio, quick ratio.' },
  { category: 'Cash Flow', basis: 'Free cash flow positivity and FCF conversion relative to operating cash flow.' },
  { category: 'Valuation', basis: 'Trailing P/E, P/B and PEG scaled inversely — cheaper valuations score higher.' },
  { category: 'Business Quality', basis: 'Composite of profitability durability and balance-sheet strength.' },
];
