import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SECURITIES } from '../data/securities';
import { useQuotes } from '../hooks/useQuotes';
import { fmtINR, fmtSignedPct, changeColor } from '../utils/format';
import { LoadingState } from '../components/States';

const ETFS = SECURITIES.filter((s) => s.type === 'ETF');
const ETF_CATEGORIES = [...new Set(ETFS.map((e) => e.sector))];

export default function ETFScreener() {
  const [category, setCategory] = useState('ALL');
  const candidates = useMemo(() => ETFS.filter((e) => category === 'ALL' || e.sector === category), [category]);
  const { quotes, loading } = useQuotes(candidates.map((s) => s.symbol));

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
      <h1 className="font-display text-2xl md:text-3xl font-semibold text-paper mb-1">ETF Screener</h1>
      <p className="text-muted text-sm mb-6">Browse NSE-listed ETFs by category with live pricing.</p>

      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setCategory('ALL')} className={`text-xs px-3 py-1.5 rounded-full border ${category === 'ALL' ? 'border-amber-500 text-amber-400 bg-amber-500/10' : 'border-line text-muted'}`}>All</button>
        {ETF_CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCategory(c)} className={`text-xs px-3 py-1.5 rounded-full border ${category === c ? 'border-amber-500 text-amber-400 bg-amber-500/10' : 'border-line text-muted'}`}>{c}</button>
        ))}
      </div>

      {loading && <LoadingState label="Loading ETF quotes…" />}
      {!loading && (
        <div className="card overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-faint border-b border-line">
                <th className="py-2 pl-4">ETF</th>
                <th className="py-2 hidden md:table-cell">Tracks</th>
                <th className="py-2 pr-4 text-right">Price</th>
                <th className="py-2 pr-4 text-right">Change</th>
                <th className="py-2 pr-4 text-right hidden sm:table-cell">52W Range</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((s) => {
                const q = quotes[s.symbol];
                return (
                  <tr key={s.symbol} className="border-b border-line hover:bg-ink-800/60">
                    <td className="py-3 pl-4">
                      <Link to={`/etf/${s.symbol}`}>
                        <div className="text-sm font-medium text-paper">{s.name}</div>
                        <div className="text-xs text-muted">{s.symbol}</div>
                      </Link>
                    </td>
                    <td className="py-3 hidden md:table-cell text-xs text-muted">{s.trackingIndex}</td>
                    <td className="py-3 pr-4 text-right tnum font-mono text-sm">{q ? fmtINR(q.price) : '…'}</td>
                    <td className={`py-3 pr-4 text-right tnum font-mono text-sm ${q ? changeColor(q.changePercent) : ''}`}>{q ? fmtSignedPct(q.changePercent) : '…'}</td>
                    <td className="py-3 pr-4 text-right tnum font-mono text-xs hidden sm:table-cell text-muted">
                      {q ? `${fmtINR(q.fiftyTwoWeekLow)} – ${fmtINR(q.fiftyTwoWeekHigh)}` : '…'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
