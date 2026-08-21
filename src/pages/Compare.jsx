import { useState } from 'react';
import { useAsync } from '../hooks/useAsync';
import { getQuote, getFundamentals } from '../services/marketData/provider';
import SearchBox from '../components/SearchBox';
import { LoadingState, ErrorState } from '../components/States';
import { fmtINR, fmtNum, fmtPct, formatCompactINR, isMissing, DATA_UNAVAILABLE } from '../utils/format';
import { X } from 'lucide-react';

const ROWS = [
  { label: 'Price', get: (q) => fmtINR(q?.price) },
  { label: 'Market Cap', get: (q) => (isMissing(q?.marketCap) ? DATA_UNAVAILABLE : formatCompactINR(q.marketCap)) },
  { label: 'P/E', get: (q) => fmtNum(q?.peTrailing) },
  { label: 'P/B', get: (q) => fmtNum(q?.pb) },
  { label: 'EPS', get: (q) => fmtINR(q?.eps) },
  { label: 'Dividend Yield', get: (q) => fmtPct(q?.dividendYield) },
  { label: 'ROE', get: (_, f) => fmtPct(f?.roe) },
  { label: 'ROA', get: (_, f) => fmtPct(f?.roa) },
  { label: 'Net Margin', get: (_, f) => fmtPct(f?.netMargin) },
  { label: 'Debt/Equity', get: (_, f) => fmtNum(f?.debtToEquity) },
  { label: 'Revenue Growth (YoY)', get: (_, f) => fmtPct(f?.revenueGrowth) },
  { label: 'Free Cash Flow', get: (_, f) => (isMissing(f?.freeCashFlow) ? DATA_UNAVAILABLE : formatCompactINR(f.freeCashFlow)) },
];

export default function Compare() {
  const [symbols, setSymbols] = useState([]);

  const { loading, error, data } = useAsync(async () => {
    if (symbols.length === 0) return [];
    return Promise.all(
      symbols.map(async (symbol) => {
        const [quote, fundamentals] = await Promise.all([getQuote(symbol), getFundamentals(symbol)]);
        return { symbol, quote, fundamentals };
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbols.join(',')]);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
      <h1 className="font-display text-2xl md:text-3xl font-semibold text-paper mb-1">Compare Securities</h1>
      <p className="text-muted text-sm mb-6">Compare up to 4 stocks or ETFs side by side on price, valuation and fundamentals.</p>

      {symbols.length < 4 && (
        <div className="max-w-md mb-6">
          <SearchBox
            placeholder="Add a security to compare…"
            onSelect={(sec) => {
              if (!symbols.includes(sec.symbol)) setSymbols((s) => [...s, sec.symbol]);
            }}
          />
        </div>
      )}

      {symbols.length === 0 && (
        <p className="text-sm text-muted">
          Search above to add securities. Stock-vs-stock and ETF-vs-ETF are both supported; mixed comparisons
          show only the metrics that apply to both types.
        </p>
      )}

      {symbols.length > 0 && loading && <LoadingState label="Loading comparison data…" />}
      {symbols.length > 0 && error && <ErrorState message={error.message} />}

      {!loading && data && data.length > 0 && (
        <div className="card overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-line">
                <th className="py-3 pl-4 text-xs text-faint w-40">Metric</th>
                {data.map((c) => (
                  <th key={c.symbol} className="py-3 px-4 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-paper">{c.symbol}</span>
                      <button onClick={() => setSymbols((arr) => arr.filter((x) => x !== c.symbol))} className="text-faint hover:text-loss">
                        <X size={14} />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.label} className="border-b border-line last:border-0">
                  <td className="py-2.5 pl-4 text-xs text-muted">{row.label}</td>
                  {data.map((c) => (
                    <td key={c.symbol} className="py-2.5 px-4 tnum font-mono text-sm text-paper">
                      {row.get(c.quote, c.fundamentals)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
