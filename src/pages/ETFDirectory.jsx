import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SECURITIES } from '../data/securities';
import { useDebounce } from '../hooks/useDebounce';
import { useQuotes } from '../hooks/useQuotes';
import { useWatchlist } from '../hooks/useWatchlist';
import SecurityRow from '../components/SecurityRow';

export default function ETFDirectory() {
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 250);
  const { add, remove, has } = useWatchlist();

  const filtered = useMemo(() => {
    return SECURITIES.filter((s) => s.type === 'ETF').filter(
      (s) =>
        !debounced ||
        s.name.toLowerCase().includes(debounced.toLowerCase()) ||
        s.symbol.toLowerCase().includes(debounced.toLowerCase())
    );
  }, [debounced]);

  const { quotes } = useQuotes(filtered.map((s) => s.symbol));

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
      <h1 className="font-display text-2xl md:text-3xl font-semibold text-paper mb-1">ETFs</h1>
      <p className="text-muted text-sm mb-6">Exchange-traded funds listed on NSE, including index, gold, silver and sector ETFs.</p>

      <input
        className="input w-full mb-5"
        placeholder="Search ETFs by name or ticker…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="card overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs text-faint border-b border-line">
              <th className="py-2 pl-4"></th>
              <th className="py-2">ETF</th>
              <th className="py-2 hidden md:table-cell">Tracking Index</th>
              <th className="py-2 pr-4 text-right">Price</th>
              <th className="py-2 pr-4 text-right">Change</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.symbol} className="border-b border-line hover:bg-ink-800/60 transition-colors">
                <td className="py-3 pl-4">
                  <button onClick={() => (has(s.symbol) ? remove(s.symbol) : add(s))}>
                    <span className={has(s.symbol) ? 'text-amber-500' : 'text-faint'}>★</span>
                  </button>
                </td>
                <td className="py-3 pr-4">
                  <Link to={`/etf/${s.symbol}`} className="block">
                    <div className="text-sm font-medium text-paper">{s.name}</div>
                    <div className="text-xs text-muted">{s.symbol} · {s.exchange}</div>
                  </Link>
                </td>
                <td className="py-3 pr-4 hidden md:table-cell text-xs text-muted">{s.trackingIndex || '—'}</td>
                <td className="py-3 pr-4 text-right tnum font-mono text-sm">
                  {quotes[s.symbol] ? `₹${quotes[s.symbol].price?.toFixed(2)}` : '…'}
                </td>
                <td className={`py-3 pr-4 text-right tnum font-mono text-sm ${quotes[s.symbol]?.changePercent >= 0 ? 'text-gain' : 'text-loss'}`}>
                  {quotes[s.symbol] ? `${quotes[s.symbol].changePercent >= 0 ? '+' : ''}${quotes[s.symbol].changePercent?.toFixed(2)}%` : '…'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
