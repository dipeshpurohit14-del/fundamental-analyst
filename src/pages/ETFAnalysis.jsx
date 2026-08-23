import { useParams } from 'react-router-dom';
import { useAsync } from '../hooks/useAsync';
import { useWatchlist } from '../hooks/useWatchlist';
import { getQuote, getETFProfile, getETFHoldings } from '../services/marketData/provider';
import { fmtINR, fmtSignedPct, fmtPct, fmtNum, changeColor, formatCompactINR, fmtTime, isMissing, DATA_UNAVAILABLE } from '../utils/format';
import PriceChart from '../components/PriceChart';
import StatTile from '../components/StatTile';
import { LoadingState, ErrorState } from '../components/States';
import { Star } from 'lucide-react';

export default function ETFAnalysis() {
  const { symbol } = useParams();
  const { add, remove, has } = useWatchlist();

  const { loading: qLoading, error: qError, data: quote } = useAsync(() => getQuote(symbol), [symbol]);
  const { loading: pLoading, error: pError, data: etfProfile } = useAsync(() => getETFProfile(symbol), [symbol]);
  const { loading: hLoading, error: hError, data: holdings } = useAsync(() => getETFHoldings(symbol), [symbol]);

  if (qLoading) return <div className="max-w-6xl mx-auto px-4 py-16"><LoadingState label={`Loading ${symbol}…`} /></div>;
  if (qError) return <div className="max-w-6xl mx-auto px-4 py-16"><ErrorState message={qError.message} /></div>;

  const watched = has(symbol);

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-display text-2xl md:text-3xl font-semibold text-paper">{quote.name}</h1>
            <button onClick={() => (watched ? remove(symbol) : add({ symbol, name: quote.name, exchange: quote.exchange, type: 'ETF' }))}>
              <Star size={20} className={watched ? 'fill-amber-500 text-amber-500' : 'text-faint'} />
            </button>
          </div>
          <p className="text-sm text-muted">
            {symbol} · {quote.exchange} · ETF
            {etfProfile?.trackingIndex && !isMissing(etfProfile.trackingIndex) ? ` · Tracks ${etfProfile.trackingIndex}` : ''}
          </p>
        </div>
        <div className="text-right">
          <div className="tnum font-mono text-3xl text-paper">{fmtINR(quote.price)}</div>
          <div className={`tnum font-mono text-sm ${changeColor(quote.changePercent)}`}>
            {fmtSignedPct(quote.changePercent)} ({fmtINR(quote.change)})
          </div>
          <div className="text-xs text-faint mt-1">Delayed · as of {fmtTime(quote.asOf)}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-2">
        <StatTile
          label="AUM"
          value={pLoading ? '…' : isMissing(etfProfile?.aum) ? DATA_UNAVAILABLE : formatCompactINR(etfProfile.aum)}
        />
        <StatTile label="Expense Ratio" value={DATA_UNAVAILABLE} sub="Not exposed by data source" />
        <StatTile
          label="Dividend Yield"
          value={pLoading ? '…' : isMissing(etfProfile?.dividendYield) ? DATA_UNAVAILABLE : fmtPct(etfProfile.dividendYield)}
        />
        <StatTile label="Volume" value={isMissing(quote.volume) ? DATA_UNAVAILABLE : fmtNum(quote.volume, 0)} />
        <StatTile label="52W High" value={fmtINR(quote.fiftyTwoWeekHigh)} />
        <StatTile label="52W Low" value={fmtINR(quote.fiftyTwoWeekLow)} />
      </div>

      {pError && !pLoading && (
        <p className="text-xs text-loss mb-6">
          Some fund details (AUM, dividend yield) couldn't be loaded: {pError.message}
        </p>
      )}
      {!pError && <div className="mb-6" />}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PriceChart symbol={symbol} trailingEps={null} />
        </div>
        <div className="space-y-6">
          <div className="card p-5">
            <h4 className="text-sm font-medium text-paper mb-3">Top Holdings</h4>
            {hLoading && <p className="text-xs text-muted">Loading…</p>}
            {hError && !hLoading && <p className="text-xs text-loss">Holdings couldn't be loaded: {hError.message}</p>}
            {!hLoading && !hError && holdings && !holdings.holdingsAvailable && (
              <p className="text-xs text-muted">Holdings breakdown not provided by the current data source for this ETF.</p>
            )}
            {!hLoading && holdings?.holdingsAvailable && (
              <ul className="space-y-2">
                {holdings.holdings.slice(0, 10).map((h) => (
                  <li key={h.symbol} className="flex justify-between text-sm">
                    <span className="text-muted truncate pr-2">{h.name}</span>
                    <span className="tnum font-mono text-paper shrink-0">{fmtPct(h.weight)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {!hLoading && !hError && holdings?.sectorWeightings?.length > 0 && (
            <div className="card p-5">
              <h4 className="text-sm font-medium text-paper mb-3">Sector Allocation</h4>
              <ul className="space-y-2">
                {holdings.sectorWeightings.map((sw) => (
                  <li key={sw.sector} className="flex justify-between text-sm">
                    <span className="text-muted capitalize">{String(sw.sector).replace(/_/g, ' ')}</span>
                    <span className="tnum font-mono text-paper">{fmtPct(sw.weight)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {!pLoading && !pError && etfProfile && !isMissing(etfProfile.description) && (
        <div className="card p-5 mt-6">
          <h3 className="text-sm font-medium text-paper mb-2">About this ETF</h3>
          <p className="text-sm text-muted leading-relaxed">{etfProfile.description}</p>
        </div>
      )}
    </div>
  );
}
