import { useCallback, useEffect, useState } from 'react';

const KEY = 'fa_watchlist_v1';

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useWatchlist() {
  const [items, setItems] = useState(read);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const add = useCallback((security) => {
    setItems((prev) => (prev.some((i) => i.symbol === security.symbol) ? prev : [...prev, security]));
  }, []);

  const remove = useCallback((symbol) => {
    setItems((prev) => prev.filter((i) => i.symbol !== symbol));
  }, []);

  const has = useCallback((symbol) => items.some((i) => i.symbol === symbol), [items]);

  return { items, add, remove, has };
}
