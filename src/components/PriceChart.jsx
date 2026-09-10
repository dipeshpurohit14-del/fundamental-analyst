import { useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useAsync } from '../hooks/useAsync';
import { getHistoricalPrices } from '../services/marketData/provider';
import { fmtDate, fmtINR, isMissing, DATA_UNAVAILABLE } from '../utils/format';
import { LoadingState, ErrorState, EmptyState } from './States';

const RANGES = ['1D', '1W', '1M', '6M', '1Y', '5Y', 'ALL'];

export default function PriceChart({ symbol, trailingEps }) {
  const [range, setRange] = useState('1Y');
  const [mode, setMode] = useState('price'); // 'price' | 'pe'

  const { loading, error, data } = useAsync(() => getHistoricalPrices(symbol, range), [symbol, range]);

  const chartData = useMemo(() => {
    if (!data) return [];
    return data.map((c) => ({
      date: c.date,
      close: c.close,
      pe: !isMissing(trailingEps) && trailingEps > 0 ? c.close / trailingEps : null,
    }));
  }, [data, trailingEps]);

 const first = chartData[0]?.close; const last = chartData[chartData.length - 1]?.close; const periodChangePct = Number.isFinite(first) && Number.isFinite(last) && first !== 0 ? ((last - first) / first) * 100 : null; const positive = (periodChangePct ?? 0) >= 0;

  return (
    <div className="card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode('price')}
            className={`text-xs px-3 py-1.5 rounded-full border ${mode === 'price' ? 'border-amber-500 text-amber-400 bg-amber-500/10' : 'border-line text-muted'}`}
          >
            Share price
          </button>
          <button
            onClick={() => setMode('pe')}
            disabled={isMissing(trailingEps) || trailingEps <= 0}
            className={`text-xs px-3 py-1.5 rounded-full border disabled:opacity-40 disabled:cursor-not-allowed ${mode === 'pe' ? 'border-amber-500 text-amber-400 bg-amber-500/10' : 'border-line text-muted'}`}
            title={isMissing(trailingEps) ? 'Trailing EPS unavailable' : 'Approximate: price ÷ current trailing EPS'}
          >
            P/E (approx.)
          </button>
        </div>
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`text-xs px-2.5 py-1 rounded-md ${range === r ? 'bg-ink-700 text-paper' : 'text-muted hover:text-paper'}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {mode === 'pe' && (
        <p className="text-[11px] text-faint mb-2">
          Approximate — computed as historical close price ÷ current trailing EPS, since per-day historical EPS
          isn't available from this data source. Treat as directional, not exact.
        </p>
      )}

      {loading && <LoadingState label="Loading price history…" />}
      {!loading && error && <ErrorState message={error.message} />}
      {!loading && !error && chartData.length === 0 && <EmptyState title="No price history available" />}

      {!loading && !error && chartData.length > 0 && (
        <>
          <div className="flex items-baseline gap-2 mb-2">
           <span className="tnum font-mono text-2xl text-paper"> {mode === 'price' ? fmtINR(last) : Number.isFinite(chartData[chartData.length - 1]?.pe) ? chartData[chartData.length - 1].pe.toFixed(1) : DATA_UNAVAILABLE} </span> {periodChangePct !== null && ( <span className={`text-sm tnum font-mono ${positive ? 'text-gain' : 'text-loss'}`}> {positive ? '+' : ''} {Number.isFinite(periodChangePct) ? periodChangePct.toFixed(2) : '0.00'}% ({range}) </span> )}
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={positive ? '#31C48D' : '#E5546B'} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={positive ? '#31C48D' : '#E5546B'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#1E2733" vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(t) => fmtDate(t, { year: range === '5Y' || range === 'ALL' ? '2-digit' : undefined })}
                stroke="#59636F"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                minTickGap={40}
              />
              <YAxis
                domain={['auto', 'auto']}
                stroke="#59636F"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={56}
              />
              <Tooltip
                contentStyle={{ background: '#141B24', border: '1px solid #1E2733', borderRadius: 8, fontSize: 12 }}
                labelFormatter={(t) => fmtDate(t)}
                formatter={(v) => [mode === 'price' ? fmtINR(v) : v?.toFixed(2), mode === 'price' ? 'Price' : 'P/E']}
              />
              <Area
                type="monotone"
                dataKey={mode === 'price' ? 'close' : 'pe'}
                stroke={positive ? '#31C48D' : '#E5546B'}
                strokeWidth={1.75}
                fill="url(#priceFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </>
      )}
    </div>
  );
}
