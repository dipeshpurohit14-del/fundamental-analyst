import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SECURITIES, SECTORS } from '../data/securities';
import { useQuotes } from '../hooks/useQuotes';
import { useWatchlist } from '../hooks/useWatchlist';
import { fmtINR, fmtSignedPct, fmtNum, changeColor, formatCompactINR, isMissing } from '../utils/format';
import { LoadingState } from '../components/States';
import { Star } from 'lucide-react';

const EQUITIES = SECURITIES.filter((s) => s.type === 'EQUITY');

const PRESETS = {
  ALL: { label: 'All', filter: () => true },
  LARGE_CAP: { label: 'Large Cap (>₹50,000 Cr)', filter: (q) => q?.marketCap > 500e9 },
  MID_CAP: { label: 'Mid Cap (₹10,000–50,000 Cr)', filter: (q) => q?.marketCap > 100e9 && q?.marketCap <= 500e9 },
  SMALL_CAP: { label: 'Small Cap (<₹10,000 Cr)', filter: (q) => q?.marketCap > 0 && q?.marketCap <= 100e9 },
  VALUE: { label: 'Value (P/E < 20)', filter: (q) => q?.peTrailing > 0 && q?.peTrailing < 20 },
  HIGH_DIVIDEND: { label: 'Dividend Yield > 2%', filter: (q) => q?.dividendYield > 2 },
  LOW_DEBT_PROXY: { label: 'Low P/B (<3)', filter: (q) => q?.pb > 0 && q?.pb < 3 },
};

export default function Screener() {
  const [sector, setSector] = useState('ALL');
  const [preset, setPreset] = useState('ALL');
  const [maxPE, setMaxPE] = useState('');
  const [minMarketCap, setMinMarketCap] = useState('');
  const { add, remove, has } = useWatchlist();

  const candidates = useMemo(
    () => EQUITIES.filter((s) => sector === 'ALL' || s.sector === sector),
    [sector]
  );
  const { quotes, loading } = useQuotes(candidates.map((s) => s.symbol));

  const results = useMemo(() => {
    return candidates
      .map((s) => ({ security: s, quote: quotes[s.symbol] }))
      .filter(({ quote }) => quote)
      .filter(({ quote }) => PRESETS[preset].filter(quote))
      .filter(({ quote }) => !maxPE || (quote.peTrailing != null && quote.peTrailing < Number(maxPE)))
      .filter(({ quote }) => !minMarketCap || (quote.marketCap != null && quote.marketCap >= Number(minMarketCap) * 1e7))
      .sort((a, b) => (b.quote.marketCap || 0) - (a.quote.marketCap || 0));
  }, [candidates, quotes, preset, maxPE, minMarketCap]);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
      <h1 className="font-display text-2xl md:text-3xl font-semibold text-paper mb-1">Stock Screener</h1>
      <p className="text-muted text-sm mb-6">
        Screen the curated NSE/BSE equity universe using live market-cap, P/E, P/B and dividend-yield data.
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(PRESETS).map(([key, p]) => (
          <button
            key={key}
            onClick={() => setPreset(key)}
            className={`text-xs px-3 py-1.5 rounded-full border ${preset === key ? 'border-amber-500 text-amber-400 bg-amber-500/10' : 'border-line text-muted'}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <select className="input" value={sector} onChange={(e) => setSector(e.target.value)}>
          <option value="ALL">All sectors</option>
          {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input className="input w-40" type="number" placeholder="Max P/E" value={maxPE} onChange={(e) => setMaxPE(e.target.value)} />
        <input className="input w-56" type="number" placeholder="Min Market Cap (₹ Cr)" value={minMarketCap} onChange={(e) => setMinMarketCap(e.target.value)} />
      </div>

      {loading && <LoadingState label="Screening securities…" />}

      {!loading && (
        <div className="card overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-faint border-b border-line">
                <th className="py-2 pl-4"></th>
                <th className="py-2">Security</th>
                <th className="py-2 pr-4 text-right">Price</th>
                <th className="py-2 pr-4 text-right">Change</th>
                <th className="py-2 pr-4 text-right">P/E</th>
                <th className="py-2 pr-4 text-right">P/B</th>
                <th className="py-2 pr-4 text-right hidden sm:table-cell">Market Cap</th>
              </tr>
            </thead>
            <tbody>
              {results.map(({ security: s, quote: q }) => (
                <tr key={s.symbol} className="border-b border-line hover:bg-ink-800/60">
                  <td className="py-3 pl-4">
                    <button onClick={() => (has(s.symbol) ? remove(s.symbol) : add(s))}>
                      <Star size={16} className={has(s.symbol) ? 'fill-amber-500 text-amber-500' : 'text-faint'} />
                    </button>
                  </td>
                  <td className="py-3 pr-4">
                    <Link to={`/stock/${s.symbol}`}>
                      <div className="text-sm font-medium text-paper">{s.name}</div>
                      <div className="text-xs text-muted">{s.symbol} · {s.sector}</div>
                    </Link>
                  </td>
                  <td className="py-3 pr-4 text-right tnum font-mono text-sm">{fmtINR(q.price)}</td>
                  <td className={`py-3 pr-4 text-right tnum font-mono text-sm ${changeColor(q.changePercent)}`}>{fmtSignedPct(q.changePercent)}</td>
                  <td className="py-3 pr-4 text-right tnum font-mono text-sm">{fmtNum(q.peTrailing)}</td>
                  <td className="py-3 pr-4 text-right tnum font-mono text-sm">{fmtNum(q.pb)}</td>
                  <td className="py-3 pr-4 text-right tnum font-mono text-sm hidden sm:table-cell">
                    {isMissing(q.marketCap) ? '—' : formatCompactINR(q.marketCap)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {results.length === 0 && <p className="text-center text-muted text-sm py-10">No securities match these filters.</p>}
        </div>
      )}

      <p className="text-xs text-faint mt-4">
        Screening runs against quote-level metrics (price, P/E, P/B, market cap, dividend yield) available in a
        single batched request. Deeper ratios (ROE, ROCE, Debt/Equity, growth) require opening each security's
        analysis page, to stay within free-tier API limits.
      </p>
    </div>
  );
}
