import { useState } from 'react';
import { useAsync } from '../hooks/useAsync';
import { getMarketData, getHistoricalPrices } from '../services/marketData/provider';
import { fmtSignedPct, fmtTime, changeColor } from '../utils/format';
import { LoadingState, ErrorState } from '../components/States';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { fmtDate } from '../utils/format';

const INDICES = [
  { key: 'NIFTY50', label: 'NIFTY 50', chartSymbol: '^NSEI' },
  { key: 'SENSEX', label: 'SENSEX', chartSymbol: '^BSESN' },
  { key: 'NIFTYBANK', label: 'NIFTY BANK', chartSymbol: '^NSEBANK' },
  { key: 'NIFTYIT', label: 'NIFTY IT', chartSymbol: '^CNXIT' },
];

function IndexCard({ idx }) {
  const [range, setRange] = useState('1Y');
  const { loading, error, data: quote } = useAsync(() => getMarketData(idx.key), [idx.key]);
  const { loading: cLoading, data: candles } = useAsync(() => getHistoricalPrices(idx.chartSymbol, range), [idx.chartSymbol, range]);

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-medium text-paper">{idx.label}</h3>
          {loading && <div className="h-7 w-28 bg-ink-700 rounded animate-pulse mt-1" />}
          {error && <p className="text-xs text-loss mt-1">{error.message}</p>}
          {quote && (
            <div className="flex items-baseline gap-2 mt-1">
              <span className="tnum font-mono text-2xl text-paper">{quote.price?.toLocaleString('en-IN')}</span>
              <span className={`tnum font-mono text-sm ${changeColor(quote.changePercent)}`}>{fmtSignedPct(quote.changePercent)}</span>
            </div>
          )}
          {quote && <p className="text-xs text-faint mt-0.5">Delayed · {fmtTime(quote.asOf)}</p>}
        </div>
        <div className="flex gap-1">
          {['1D', '1M', '1Y', 'ALL'].map((r) => (
            <button key={r} onClick={() => setRange(r)} className={`text-xs px-2 py-1 rounded ${range === r ? 'bg-ink-700 text-paper' : 'text-faint'}`}>{r}</button>
          ))}
        </div>
      </div>
      {cLoading ? (
        <div className="h-40 bg-ink-800 rounded animate-pulse" />
      ) : (
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={candles || []} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`grad-${idx.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4C8BF5" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#4C8BF5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#1E2733" vertical={false} />
            <XAxis dataKey="date" hide />
            <YAxis domain={['auto', 'auto']} hide />
            <Tooltip
              contentStyle={{ background: '#141B24', border: '1px solid #1E2733', borderRadius: 8, fontSize: 11 }}
              labelFormatter={(t) => fmtDate(t)}
              formatter={(v) => [v?.toFixed(2), 'Level']}
            />
            <Area type="monotone" dataKey="close" stroke="#4C8BF5" strokeWidth={1.5} fill={`url(#grad-${idx.key})`} />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default function MarketOverview() {
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
      <h1 className="font-display text-2xl md:text-3xl font-semibold text-paper mb-1">Market Overview</h1>
      <p className="text-muted text-sm mb-6">Major Indian indices, delayed pricing.</p>
      <div className="grid md:grid-cols-2 gap-4">
        {INDICES.map((idx) => <IndexCard key={idx.key} idx={idx} />)}
      </div>
    </div>
  );
}
