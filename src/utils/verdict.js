// src/utils/verdict.js
//
// A transparent, rule-based signal derived entirely from the fundamental
// score categories (see fundamentalScore.js). This is NOT personalized
// investment advice, not a prediction of future price, and not generated
// by an opaque model — it is a documented if/else classification over
// publicly available ratios, shown with its exact reasoning every time.

import { computeFundamentalScore } from './fundamentalScore';

export function computeVerdict(fundamentals) {
  const score = computeFundamentalScore(fundamentals);
  const { overall, categories } = score;

  if (overall === null) {
    return {
      label: 'Not enough data',
      color: 'muted',
      overall,
      score,
      reasons: ['Too many required ratios are unavailable from the data source to form a signal.'],
    };
  }

  const reasons = [];
  const { profitability, growth, financialHealth, cashFlow, valuation } = categories;

  if (profitability !== null) reasons.push(`Profitability scores ${profitability}/10 (ROE, ROA, margins).`);
  if (growth !== null) reasons.push(`Growth scores ${growth}/10 (revenue & earnings growth).`);
  if (financialHealth !== null) reasons.push(`Financial health scores ${financialHealth}/10 (leverage & liquidity).`);
  if (cashFlow !== null) reasons.push(`Cash flow scores ${cashFlow}/10 (free cash flow quality).`);
  if (valuation !== null) reasons.push(`Valuation scores ${valuation}/10 (P/E, P/B, PEG vs. typical ranges).`);

  let label, color;
  if (overall >= 7.5) {
    label = 'Fundamentally Strong';
    color = 'gain';
  } else if (overall >= 5.5) {
    label = 'Fundamentally Fair';
    color = 'amber';
  } else {
    label = 'Fundamentally Weak';
    color = 'loss';
  }

  // Valuation-adjusted qualifier — a strong business at a stretched valuation
  // is flagged distinctly from a strong business at a reasonable valuation.
  let qualifier = null;
  if (overall >= 7.5 && valuation !== null && valuation < 4) {
    qualifier = 'Strong fundamentals, but current valuation appears expensive relative to typical ranges.';
  } else if (overall < 5.5 && valuation !== null && valuation >= 7) {
    qualifier = 'Valuation looks statistically cheap, but underlying fundamentals are weak — investigate why.';
  }

  return {
    label,
    color,
    overall,
    score,
    reasons,
    qualifier,
    disclaimer:
      'This is an automated classification of public ratios against typical healthy ranges — not personalized investment advice, not a price prediction, and not a substitute for reading the company\'s actual filings.',
  };
}
