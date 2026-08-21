import { useEffect, useState } from 'react';
import { getQuotes } from '../services/marketData/provider';

// Batches quote requests for a visible page of symbols into a single call.
export function useQuotes(symbols) {
  const [quotes, setQuotes] = useState({});
  const [loading, setLoading] = useState(true);
  const key = symbols.join(',');

  useEffect(() => {
    if (symbols.length === 0) {
      setQuotes({});
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    getQuotes(symbols)
      .then((results) => {
        if (cancelled) return;
        const map = {};
        for (const q of results) map[q.symbol] = q;
        setQuotes(map);
      })
      .catch(() => {
        if (!cancelled) setQuotes({});
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { quotes, loading };
}
