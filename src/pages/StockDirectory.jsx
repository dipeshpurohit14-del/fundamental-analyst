import { useMemo, useState } from 'react';
import { SECURITIES, SECTORS } from '../data/securities';
import { useDebounce } from '../hooks/useDebounce';
import { useQuotes } from '../hooks/useQuotes';
import { useWatchlist } from '../hooks/useWatchlist';
import SecurityRow from '../components/SecurityRow';

const PAGE_SIZE = 20;

export default function StockDirectory() {
  const [query, setQuery] = useState('');
  const [exchange, setExchange] = useState('ALL');
  const [sector, setSector] = useState('ALL');
  const [page, setPage] = useState(1);
  const debounced = useDebounce(query, 250);
  const { items, add, remove, has } = useWatchlist();

  const filtered = useMemo(() => {
    return SECURITIES.filter((s) => s.type === 'EQUITY')
      .filter((s) => exchange === 'ALL' || s.exchange === exchange)
      .filter((s) => sector === 'ALL' || s.sector === sector)
      .filter(
        (s) =>
          !debounced ||
          s.name.toLowerCase().includes(debounced.toLowerCase()) ||
          s.symbol.toLowerCase().includes(debounced.toLowerCase())
      );
  }, [debounced, exchange, sector]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const { quotes } = useQuotes(pageItems.map((s) => s.symbol));

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
      <h1 className="font-display text-2xl md:text-3xl font-semibold text-paper mb-1">Stocks</h1>
      <p className="text-muted text-sm mb-6">Searchable directory of NSE and BSE-listed equities.</p>

      <div className="flex flex-wrap gap-3 mb-5">
        <input
          className="input flex-1 min-w-[200px]"
          placeholder="Search by name or ticker…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
        />
        <select className="input" value={exchange} onChange={(e) => { setExchange(e.target.value); setPage(1); }}>
          <option value="ALL">All exchanges</option>
          <option value="NSE">NSE</option>
          <option value="BSE">BSE</option>
        </select>
        <select className="input" value={sector} onChange={(e) => { setSector(e.target.value); setPage(1); }}>
          <option value="ALL">All sectors</option>
          {SECTORS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="text-xs text-faint border-b border-line">
              <th className="py-2 pl-4"></th>
              <th className="py-2">Security</th>
              <th className="py-2 hidden md:table-cell">Sector</th>
              <th className="py-2 pr-4 text-right">Price</th>
              <th className="py-2 pr-4 text-right">Change</th>
              <th className="py-2 pr-4 text-right hidden sm:table-cell">Market Cap</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((s) => (
              <SecurityRow
                key={s.symbol}
                security={s}
                quote={quotes[s.symbol]}
                isWatched={has(s.symbol)}
                onToggleWatch={() => (has(s.symbol) ? remove(s.symbol) : add(s))}
              />
            ))}
          </tbody>
        </table>
        {pageItems.length === 0 && <p className="text-center text-muted text-sm py-10">No securities match your filters.</p>}
      </div>

      <div className="flex items-center justify-between mt-4 text-sm text-muted">
        <span>
          {filtered.length} result{filtered.length !== 1 ? 's' : ''} · Page {page} of {totalPages}
        </span>
        <div className="flex gap-2">
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="btn-ghost text-xs disabled:opacity-40">
            Previous
          </button>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="btn-ghost text-xs disabled:opacity-40">
            Next
          </button>
        </div>
      </div>

      <p className="text-xs text-faint mt-6">
        This directory currently lists a curated set of large & mid-cap NSE/BSE equities and major ETFs — not the
        full exchange universe. Use search for other listed symbols not yet in this directory.
      </p>
    </div>
  );
}
