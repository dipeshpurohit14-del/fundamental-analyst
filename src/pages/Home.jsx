import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import SearchBox from '../components/SearchBox';
import { SECURITIES } from '../data/securities';
import { useQuotes } from '../hooks/useQuotes';
import { getMarketData } from '../services/marketData/provider';
import { fmtINR, fmtSignedPct, changeColor } from '../utils/format';

const POPULAR_STOCKS = ['TCS', 'RELIANCE', 'INFY', 'HDFCBANK', 'ICICIBANK', 'ITC'];
const POPULAR_ETFS = ['NIFTYBEES', 'BANKBEES', 'GOLDBEES', 'JUNIORBEES'];
const INDEX_STRIP = [
  { key: 'NIFTY50', label: 'NIFTY 50' },
  { key: 'SENSEX', label: 'SENSEX' },
  { key: 'NIFTYBANK', label: 'NIFTY BANK' },
];

function MiniQuoteCard({ symbol }) {
  const sec = SECURITIES.find((s) => s.symbol === symbol);
  const { quotes, loading } = useQuotes([symbol]);
  const q = quotes[symbol];
  if (!sec) return null;
  return (
    <Link
      to={sec.type === 'ETF' ? `/etf/${symbol}` : `/stock/${symbol}`}
      className="card p-4 hover:border-amber-500/40 transition-colors block"
    >
      <div className="text-sm font-medium text-paper truncate">{sec.name}</div>
      <div className="text-xs text-muted mb-2">{symbol} · {sec.exchange}</div>
      {loading || !q ? (
        <div className="h-6 w-20 bg-ink-700 rounded animate-pulse" />
      ) : (
        <div className="flex items-baseline gap-2">
          <span className="tnum font-mono text-lg text-paper">{fmtINR(q.price)}</span>
          <span className={`tnum font-mono text-xs ${changeColor(q.changePercent)}`}>{fmtSignedPct(q.changePercent)}</span>
        </div>
      )}
    </Link>
  );
}

function IndexStrip() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {INDEX_STRIP.map((idx) => (
        <IndexCard key={idx.key} indexKey={idx.key} label={idx.label} />
      ))}
    </div>
  );
}

function IndexCard({ indexKey, label }) {
  const { quotes, loading } = useIndexQuote(indexKey);
  return (
    <div className="card p-4">
      <div className="text-xs text-muted mb-1">{label}</div>
      {loading || !quotes ? (
        <div className="h-6 w-24 bg-ink-700 rounded animate-pulse" />
      ) : (
        <div className="flex items-baseline gap-2">
          <span className="tnum font-mono text-lg text-paper">{quotes.price?.toLocaleString('en-IN') ?? 'Data unavailable'}</span>
          <span className={`tnum font-mono text-xs ${changeColor(quotes.changePercent)}`}>{fmtSignedPct(quotes.changePercent)}</span>
        </div>
      )}
    </div>
  );
}

function useIndexQuote(indexKey) {
  const [quotes, setQuotes] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;
    getMarketData(indexKey)
      .then((q) => !cancelled && setQuotes(q))
      .catch(() => !cancelled && setQuotes(null))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [indexKey]);
  return { quotes, loading };
}

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-16">
      <section className="text-center max-w-2xl mx-auto mb-12">
        <p className="chip inline-block mb-4">NSE · BSE · Educational Research</p>
        <h1 className="font-display text-3xl md:text-5xl font-semibold text-paper mb-4 leading-tight">
          Fundamental Analysis for Indian Markets
        </h1>
        <p className="text-muted text-base md:text-lg mb-8">
          Research companies, ETFs and securities using financial statements, valuation metrics,
          profitability ratios and long-term trends.
        </p>
        <SearchBox
          onSelect={(sec) => navigate(sec.type === 'ETF' ? `/etf/${sec.symbol}` : `/stock/${sec.symbol}`)}
        />
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {['TCS', 'RELIANCE', 'INFY', 'HDFCBANK', 'NIFTYBEES', 'BANKBEES'].map((s) => (
            <button key={s} onClick={() => navigate(SECURITIES.find(x=>x.symbol===s)?.type === 'ETF' ? `/etf/${s}` : `/stock/${s}`)} className="chip hover:border-amber-500/50 hover:text-amber-400">
              {s}
            </button>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-sm font-medium text-muted uppercase tracking-wide mb-3">Market Overview</h2>
        <IndexStrip />
      </section>

      <section className="mb-12">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-muted uppercase tracking-wide">Popular Stocks</h2>
          <Link to="/stocks" className="text-xs text-signal hover:underline">View all →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {POPULAR_STOCKS.map((s) => <MiniQuoteCard key={s} symbol={s} />)}
        </div>
      </section>

      <section className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-muted uppercase tracking-wide">Popular ETFs</h2>
          <Link to="/etfs" className="text-xs text-signal hover:underline">View all →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {POPULAR_ETFS.map((s) => <MiniQuoteCard key={s} symbol={s} />)}
        </div>
      </section>
    </div>
  );
}
