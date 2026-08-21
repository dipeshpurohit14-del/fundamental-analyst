import { Link } from 'react-router-dom';
import { fmtINR, fmtSignedPct, formatCompactINR, changeColor, isMissing } from '../utils/format';
import { Star } from 'lucide-react';

export default function SecurityRow({ security, quote, onToggleWatch, isWatched }) {
  const href = security.type === 'ETF' ? `/etf/${security.symbol}` : `/stock/${security.symbol}`;
  return (
    <tr className="border-b border-line hover:bg-ink-800/60 transition-colors">
      <td className="py-3 pl-4 pr-2">
        {onToggleWatch && (
          <button onClick={() => onToggleWatch(security)} aria-label="Toggle watchlist">
            <Star size={16} className={isWatched ? 'fill-amber-500 text-amber-500' : 'text-faint'} />
          </button>
        )}
      </td>
      <td className="py-3 pr-4">
        <Link to={href} className="block">
          <div className="text-sm font-medium text-paper">{security.name}</div>
          <div className="text-xs text-muted">{security.symbol} · {security.exchange}</div>
        </Link>
      </td>
      <td className="py-3 pr-4 hidden md:table-cell text-xs text-muted">{security.sector || '—'}</td>
      <td className="py-3 pr-4 text-right tnum font-mono text-sm">
        {quote ? fmtINR(quote.price) : <span className="text-faint">…</span>}
      </td>
      <td className={`py-3 pr-4 text-right tnum font-mono text-sm ${quote ? changeColor(quote.changePercent) : ''}`}>
        {quote ? fmtSignedPct(quote.changePercent) : <span className="text-faint">…</span>}
      </td>
      <td className="py-3 pr-4 text-right tnum font-mono text-sm hidden sm:table-cell">
        {quote && !isMissing(quote.marketCap) ? formatCompactINR(quote.marketCap) : <span className="text-faint">—</span>}
      </td>
    </tr>
  );
}
