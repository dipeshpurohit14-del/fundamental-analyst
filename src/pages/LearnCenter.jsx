import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const TOPICS = [
  {
    category: 'Profitability',
    metrics: [
      { name: 'Return on Equity (ROE)', formula: 'Net Income ÷ Shareholders\' Equity', meaning: 'How efficiently a company generates profit from shareholders\' capital.', example: 'Net income ₹1,000 Cr, equity ₹5,000 Cr → ROE = 20%.', interpretation: 'Higher is generally better; compare within the same industry.', limitations: 'Can be inflated by high debt (financial leverage) rather than genuine efficiency.' },
      { name: 'Return on Capital Employed (ROCE)', formula: 'EBIT ÷ (Total Assets − Current Liabilities)', meaning: 'Returns generated on all capital employed, debt and equity combined.', example: 'EBIT ₹800 Cr, capital employed ₹4,000 Cr → ROCE = 20%.', interpretation: 'Useful for capital-intensive businesses and comparing capital efficiency across capital structures.', limitations: 'Ignores off-balance-sheet items; sensitive to asset revaluations.' },
      { name: 'Return on Assets (ROA)', formula: 'Net Income ÷ Total Assets', meaning: 'Profit generated per rupee of assets owned.', example: 'Net income ₹500 Cr, assets ₹10,000 Cr → ROA = 5%.', interpretation: 'Useful for comparing asset-heavy businesses like banks and manufacturers.', limitations: 'Varies enormously by industry — not comparable across sectors.' },
    ],
  },
  {
    category: 'Valuation',
    metrics: [
      { name: 'Price-to-Earnings (P/E)', formula: 'Market Price per Share ÷ EPS', meaning: 'How much investors pay for each rupee of annual earnings.', example: 'Price ₹1,500, EPS ₹50 → P/E = 30x.', interpretation: 'Lower P/E can mean undervalued or reflect weaker growth prospects; context matters.', limitations: 'Meaningless for loss-making companies; distorted by one-off items.' },
      { name: 'Price-to-Book (P/B)', formula: 'Market Price per Share ÷ Book Value per Share', meaning: 'Market value relative to net accounting assets.', example: 'Price ₹800, book value ₹400 → P/B = 2x.', interpretation: 'Useful for banks/financials; less useful for asset-light IT/services firms.', limitations: 'Book value can lag true economic value, especially for intangible-heavy firms.' },
      { name: 'EV/EBITDA', formula: '(Market Cap + Debt − Cash) ÷ EBITDA', meaning: 'Values the whole business independent of capital structure.', example: 'EV ₹50,000 Cr, EBITDA ₹5,000 Cr → EV/EBITDA = 10x.', interpretation: 'Useful for comparing companies with different debt levels.', limitations: 'Ignores capex intensity differences between businesses.' },
      { name: 'PEG Ratio', formula: 'P/E ÷ Expected EPS Growth Rate', meaning: 'Adjusts P/E for growth to judge if a high multiple is justified.', example: 'P/E 30, growth 20% → PEG = 1.5.', interpretation: 'PEG near 1 is often considered fairly valued; below 1, potentially undervalued.', limitations: 'Highly sensitive to the growth estimate used, which is inherently uncertain.' },
      { name: 'Dividend Yield', formula: 'Annual Dividend per Share ÷ Market Price per Share', meaning: 'Cash return to shareholders relative to share price.', example: 'Dividend ₹20, price ₹1,000 → yield = 2%.', interpretation: 'High yield can signal value or can signal distress — check payout sustainability.', limitations: 'Says nothing about capital appreciation potential.' },
    ],
  },
  {
    category: 'Liquidity & Solvency',
    metrics: [
      { name: 'Current Ratio', formula: 'Current Assets ÷ Current Liabilities', meaning: 'Ability to cover short-term obligations with short-term assets.', example: 'Current assets ₹2,000 Cr, liabilities ₹1,000 Cr → ratio = 2.0.', interpretation: 'Above 1 generally indicates adequate short-term liquidity.', limitations: 'Inventory-heavy current assets may not be quickly convertible to cash.' },
      { name: 'Quick Ratio', formula: '(Current Assets − Inventory) ÷ Current Liabilities', meaning: 'Stricter liquidity test excluding inventory.', example: 'Quick assets ₹1,200 Cr, liabilities ₹1,000 Cr → ratio = 1.2.', interpretation: 'A ratio near or above 1 suggests healthy near-term liquidity.', limitations: 'Still assumes receivables are collectible quickly.' },
      { name: 'Debt-to-Equity', formula: 'Total Debt ÷ Shareholders\' Equity', meaning: 'Degree of financial leverage used to fund the business.', example: 'Debt ₹2,000 Cr, equity ₹4,000 Cr → D/E = 0.5.', interpretation: 'Lower generally means less financial risk, but some leverage can boost returns.', limitations: '"Good" levels vary hugely by industry — capital-intensive sectors run higher.' },
      { name: 'Interest Coverage Ratio', formula: 'EBIT ÷ Interest Expense', meaning: 'How comfortably a company can pay interest on its debt from operating profit.', example: 'EBIT ₹600 Cr, interest ₹100 Cr → coverage = 6x.', interpretation: 'Higher is safer; below 1.5–2x is often considered a warning sign.', limitations: 'Doesn\'t account for principal repayment obligations.' },
    ],
  },
  {
    category: 'Growth & Cash Flow',
    metrics: [
      { name: 'Revenue Growth (YoY)', formula: '(Current Year Revenue − Prior Year Revenue) ÷ Prior Year Revenue', meaning: 'Top-line expansion rate.', example: 'Revenue grows from ₹8,000 Cr to ₹9,200 Cr → growth = 15%.', interpretation: 'Sustained double-digit growth is generally attractive, but check quality (organic vs. acquired).', limitations: 'A single year can be distorted by one-off events or base effects.' },
      { name: 'Profit Growth (YoY)', formula: '(Current Year Net Income − Prior Year Net Income) ÷ Prior Year Net Income', meaning: 'Bottom-line expansion rate.', example: 'Net income grows from ₹1,000 Cr to ₹1,250 Cr → growth = 25%.', interpretation: 'Should ideally track or exceed revenue growth over time (margin expansion).', limitations: 'Very sensitive to one-off items, tax changes, and accounting adjustments.' },
      { name: 'Free Cash Flow (FCF)', formula: 'Operating Cash Flow − Capital Expenditure', meaning: 'Cash left over after maintaining and growing the asset base.', example: 'OCF ₹1,200 Cr, capex ₹400 Cr → FCF = ₹800 Cr.', interpretation: 'Positive, growing FCF funds dividends, buybacks and debt paydown without external capital.', limitations: 'Lumpy in capital-intensive years; look at multi-year averages.' },
      { name: 'Earnings per Share (EPS)', formula: 'Net Income ÷ Weighted Average Shares Outstanding', meaning: 'Profit attributable to each share.', example: 'Net income ₹1,000 Cr, shares 100 Cr → EPS = ₹10.', interpretation: 'Track growth over time rather than the absolute number, which depends on share count.', limitations: 'Can be boosted by buybacks even if total profit is flat.' },
    ],
  },
];

function MetricCard({ m }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card p-4">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between text-left">
        <span className="text-sm font-medium text-paper">{m.name}</span>
        <ChevronDown size={16} className={`text-faint transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="mt-3 space-y-2 text-xs">
          <p><span className="text-muted">Formula: </span><span className="text-paper font-mono">{m.formula}</span></p>
          <p><span className="text-muted">Meaning: </span><span className="text-paper">{m.meaning}</span></p>
          <p><span className="text-muted">Example: </span><span className="text-paper">{m.example}</span></p>
          <p><span className="text-muted">Interpretation: </span><span className="text-paper">{m.interpretation}</span></p>
          <p><span className="text-muted">Limitations: </span><span className="text-paper">{m.limitations}</span></p>
        </div>
      )}
    </div>
  );
}

export default function LearnCenter() {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
      <h1 className="font-display text-2xl md:text-3xl font-semibold text-paper mb-1">Learning Center</h1>
      <p className="text-muted text-sm mb-8">Formula, meaning, example, interpretation and limitations for each metric used across the platform.</p>

      <div className="space-y-8">
        {TOPICS.map((topic) => (
          <section key={topic.category}>
            <h2 className="text-sm font-medium text-amber-400 uppercase tracking-wide mb-3">{topic.category}</h2>
            <div className="space-y-3">
              {topic.metrics.map((m) => <MetricCard key={m.name} m={m} />)}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
