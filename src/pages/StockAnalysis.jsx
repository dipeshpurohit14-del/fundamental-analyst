import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAsync } from '../hooks/useAsync';
import { useWatchlist } from '../hooks/useWatchlist';
import { getQuote, getCompanyProfile, getFundamentals, getFinancialStatements } from '../services/marketData/provider';
import { findBySymbol } from '../data/securities';
import { fmtINR, fmtSignedPct, fmtNum, fmtPct, changeColor, formatCompactINR, fmtTime, isMissing, DATA_UNAVAILABLE } from '../utils/format';
import { computeFundamentalScore } from '../utils/fundamentalScore';
import { computeVerdict } from '../utils/verdict';
import PriceChart from '../components/PriceChart';
import FinancialTrendChart from '../components/FinancialTrendChart';
import FundamentalScoreCard from '../components/FundamentalScoreCard';
import VerdictCard from '../components/VerdictCard';
import StatTile from '../components/StatTile';
import { LoadingState, ErrorState } from '../components/States';
import { Star } from 'lucide-react';

const TABS = ['Overview', 'Income Statement', 'Balance Sheet', 'Cash Flow', 'Ratios'];

export default function StockAnalysis() {
  const { symbol } = useParams();
  const [tab, setTab] = useState('Overview');
  const { add, remove, has } = useWatchlist();
  const ref = findBySymbol(symbol);

  const { loading: qLoading, error: qError, data: quote } = useAsync(() => getQuote(symbol), [symbol]);
  const { loading: pLoading, data: profile } = useAsync(() => getCompanyProfile(symbol), [symbol]);
  const { loading: fLoading, error: fError, data: fundamentals } = useAsync(() => getFundamentals(symbol), [symbol]);
  const { loading: sLoading, data: statements } = useAsync(() => getFinancialStatements(symbol), [symbol]);

  if (qLoading) return <div className="max-w-6xl mx-auto px-4 py-16"><LoadingState label={`Loading ${symbol}…`} /></div>;
  if (qError) return <div className="max-w-6xl mx-auto px-4 py-16"><ErrorState message={qError.message} /></div>;

  const security = { symbol, name: quote.name, exchange: quote.exchange, type: 'EQUITY', sector: profile?.sector };
  const watched = has(symbol);
  const score = !fLoading && fundamentals ? computeFundamentalScore(fundamentals) : null;
  const verdict = !fLoading && fundamentals ? computeVerdict(fundamentals) : null;

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-display text-2xl md:text-3xl font-semibold text-paper">{quote.name}</h1>
            <button onClick={() => (watched ? remove(symbol) : add(security))}>
              <Star size={20} className={watched ? 'fill-amber-500 text-amber-500' : 'text-faint'} />
            </button>
          </div>
          <p className="text-sm text-muted">
            {symbol} · {quote.exchange} {profile?.sector && !isMissing(profile.sector) ? `· ${profile.sector}` : ''}
          </p>
        </div>
        <div className="text-right">
          <div className="tnum font-mono text-3xl text-paper">{fmtINR(quote.price)}</div>
          <div className={`tnum font-mono text-sm ${changeColor(quote.changePercent)}`}>
            {fmtSignedPct(quote.changePercent)} ({fmtINR(quote.change)})
          </div>
          <div className="text-xs text-faint mt-1">Delayed · as of {fmtTime(quote.asOf)}</div>
        </div>
      </div>

      {/* Key stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-6">
        <StatTile label="Market Cap" value={isMissing(quote.marketCap) ? DATA_UNAVAILABLE : formatCompactINR(quote.marketCap)} />
        <StatTile label="P/E (TTM)" value={fmtNum(quote.peTrailing)} />
        <StatTile label="P/B" value={fmtNum(quote.pb)} />
        <StatTile label="EPS (TTM)" value={fmtINR(quote.eps)} />
        <StatTile label="ROE" value={fLoading ? '…' : fmtPct(fundamentals?.roe)} />
        <StatTile label="Debt/Equity" value={fLoading ? '…' : fmtNum(fundamentals?.debtToEquity)} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 space-y-6">
          <PriceChart symbol={symbol} trailingEps={quote.eps} />
          {!sLoading && statements && <FinancialTrendChart incomeRows={statements.income} title="Revenue & Net Profit (Annual)" />}
        </div>
        <div className="space-y-6">
          {score && <FundamentalScoreCard score={score} />}
          {verdict && <VerdictCard verdict={verdict} />}
          {(fLoading || !fundamentals) && !fError && <LoadingState label="Scoring fundamentals…" />}
          {fError && <ErrorState message={fError.message} />}
        </div>
      </div>

      {/* Company overview */}
      {!pLoading && profile && !isMissing(profile.description) && (
        <div className="card p-5 mb-6">
          <h3 className="text-sm font-medium text-paper mb-2">Company Overview</h3>
          <p className="text-sm text-muted leading-relaxed line-clamp-6">{profile.description}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto mb-4 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm whitespace-nowrap border-b-2 -mb-px transition-colors ${
              tab === t ? 'border-amber-500 text-paper' : 'border-transparent text-muted hover:text-paper'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {sLoading && <LoadingState label="Loading financial statements…" />}
      {!sLoading && statements && (
        <>
          {tab === 'Overview' && <ValuationPanel quote={quote} fundamentals={fundamentals} />}
          {tab === 'Income Statement' && <StatementTable rows={statements.income} columns={INCOME_COLS} />}
          {tab === 'Balance Sheet' && <StatementTable rows={statements.balance} columns={BALANCE_COLS} />}
          {tab === 'Cash Flow' && <StatementTable rows={statements.cashflow} columns={CASHFLOW_COLS} />}
          {tab === 'Ratios' && <RatiosPanel fundamentals={fundamentals} />}
        </>
      )}
    </div>
  );
}

function ValuationPanel({ fundamentals }) {
  if (!fundamentals) return null;
  const rows = [
    ['P/E (Trailing)', fmtNum(fundamentals.peTrailing)],
    ['P/E (Forward)', fmtNum(fundamentals.peForward)],
    ['P/B', fmtNum(fundamentals.pb)],
    ['EV/EBITDA', fmtNum(fundamentals.evToEbitda)],
    ['EV/Revenue', fmtNum(fundamentals.evToRevenue)],
    ['PEG Ratio', fmtNum(fundamentals.pegRatio)],
    ['Dividend Yield', fmtPct(fundamentals.dividendYield)],
    ['Payout Ratio', fmtPct(fundamentals.payoutRatio)],
  ];
  return (
    <div className="card p-5 grid grid-cols-2 md:grid-cols-4 gap-4">
      {rows.map(([label, value]) => (
        <StatTile key={label} label={label} value={value} />
      ))}
    </div>
  );
}

function RatiosPanel({ fundamentals }) {
  if (!fundamentals) return null;
  const groups = [
    ['Profitability', [
      ['ROE', fmtPct(fundamentals.roe)],
      ['ROA', fmtPct(fundamentals.roa)],
      ['ROCE', DATA_UNAVAILABLE],
      ['Gross Margin', fmtPct(fundamentals.grossMargin)],
      ['EBITDA Margin', fmtPct(fundamentals.ebitdaMargin)],
      ['Operating Margin', fmtPct(fundamentals.operatingMargin)],
      ['Net Margin', fmtPct(fundamentals.netMargin)],
    ]],
    ['Financial Health', [
      ['Debt/Equity', fmtNum(fundamentals.debtToEquity)],
      ['Current Ratio', fmtNum(fundamentals.currentRatio)],
      ['Quick Ratio', fmtNum(fundamentals.quickRatio)],
      ['Total Cash', formatCompactINR(fundamentals.totalCash)],
      ['Total Debt', formatCompactINR(fundamentals.totalDebt)],
    ]],
    ['Growth', [
      ['Revenue Growth (YoY)', fmtPct(fundamentals.revenueGrowth)],
      ['Earnings Growth (YoY)', fmtPct(fundamentals.earningsGrowth)],
    ]],
    ['Cash Flow', [
      ['Operating Cash Flow', formatCompactINR(fundamentals.operatingCashFlow)],
      ['Free Cash Flow', formatCompactINR(fundamentals.freeCashFlow)],
    ]],
  ];
  return (
    <div className="space-y-6">
      {groups.map(([title, rows]) => (
        <div key={title} className="card p-5">
          <h4 className="text-sm font-medium text-paper mb-3">{title}</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {rows.map(([label, value]) => (
              <StatTile key={label} label={label} value={value} />
            ))}
          </div>
        </div>
      ))}
      <p className="text-xs text-faint">
        ROCE isn't directly exposed by this data source and requires EBIT ÷ Capital Employed derived from
        multi-period balance-sheet detail beyond what the free endpoint provides — shown as unavailable rather
        than estimated.
      </p>
    </div>
  );
}

const INCOME_COLS = [
  ['revenue', 'Revenue'],
  ['operatingIncome', 'Operating Profit'],
  ['ebitda', 'EBITDA'],
  ['interestExpense', 'Interest'],
  ['incomeTaxExpense', 'Tax'],
  ['netIncome', 'Net Income'],
];
const BALANCE_COLS = [
  ['totalAssets', 'Total Assets'],
  ['totalCurrentAssets', 'Current Assets'],
  ['cash', 'Cash'],
  ['debt', 'Debt'],
  ['totalCurrentLiabilities', 'Current Liabilities'],
  ['totalLiabilities', 'Total Liabilities'],
  ['totalStockholderEquity', "Shareholders' Equity"],
];
const CASHFLOW_COLS = [
  ['operatingCashFlow', 'Operating Cash Flow'],
  ['capitalExpenditures', 'Capital Expenditure'],
  ['investingCashFlow', 'Investing Cash Flow'],
  ['financingCashFlow', 'Financing Cash Flow'],
  ['freeCashFlow', 'Free Cash Flow'],
];

function StatementTable({ rows, columns }) {
  if (!rows || rows.length === 0) {
    return <div className="card p-8 text-center text-muted text-sm">Statement history unavailable from the current data source for this security.</div>;
  }
  return (
    <div className="card overflow-x-auto p-1">
      <table className="w-full text-left min-w-[600px]">
        <thead>
          <tr className="text-xs text-faint border-b border-line">
            <th className="py-3 pl-4">₹ (Crore)</th>
            {rows.map((r) => (
              <th key={r.period} className="py-3 pr-4 text-right">
                {new Date(r.period).getFullYear()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {columns.map(([key, label]) => (
            <tr key={key} className="border-b border-line last:border-0">
              <td className="py-2.5 pl-4 text-sm text-muted">{label}</td>
              {rows.map((r) => (
                <td key={r.period} className="py-2.5 pr-4 text-right tnum font-mono text-sm text-paper">
                  {isMissing(r[key]) ? DATA_UNAVAILABLE : formatCompactINR(r[key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
