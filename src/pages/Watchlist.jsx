import { Link } from 'react-router-dom';
import { useWatchlist } from '../hooks/useWatchlist';
import { useQuotes } from '../hooks/useQuotes';
import { fmtINR, fmtSignedPct, changeColor } from '../utils/format';
import { EmptyState } from '../components/States';
import { Trash2 } from 'lucide-react';

export default function Watchlist() {
  const { items, remove } = useWatchlist();
  const { quotes, loading } = useQuotes(items.map((i) => i.symbol));

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
      <h1 className="font-display text-2xl md:text-3xl font-semibold text-paper mb-1">Watchlist</h1>
      <p className="text-muted text-sm mb-6">Saved to this browser only — no account required.</p>

      {items.length === 0 && (
        <EmptyState
          title="Your watchlist is empty"
          subtitle="Search for a stock or ETF and tap the star icon to add it here."
          action={<Link to="/stocks" className="btn-primary text-sm">Browse stocks</Link>}
        />
      )}

      {items.length > 0 && (
        <div className="card overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-faint border-b border-line">
                <th className="py-2 pl-4">Security</th>
                <th className="py-2 pr-4 text-right">Price</th>
                <th className="py-2 pr-4 text-right">Change</th>
                <th className="py-2 pr-4"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => {
                const q = quotes[i.symbol];
                return (
                  <tr key={i.symbol} className="border-b border-line last:border-0 hover:bg-ink-800/60">
                    <td className="py-3 pl-4">
                      <Link to={i.type === 'ETF' ? `/etf/${i.symbol}` : `/stock/${i.symbol}`}>
                        <div className="text-sm font-medium text-paper">{i.name}</div>
                        <div className="text-xs text-muted">{i.symbol} · {i.exchange}</div>
                      </Link>
                    </td>
                    <td className="py-3 pr-4 text-right tnum font-mono text-sm">{loading || !q ? '…' : fmtINR(q.price)}</td>
                    <td className={`py-3 pr-4 text-right tnum font-mono text-sm ${q ? changeColor(q.changePercent) : ''}`}>
                      {loading || !q ? '…' : fmtSignedPct(q.changePercent)}
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <button onClick={() => remove(i.symbol)} className="text-faint hover:text-loss">
                        <Trash2 size={16} />
                      </button>
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
