import { useEffect, useRef, useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import { searchSecurities } from '../services/marketData/provider';

export default function SearchBox({ onSelect, compact = false, placeholder }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounced = useDebounce(query, 300);
  const boxRef = useRef(null);

  useEffect(() => {
    if (!debounced || debounced.trim().length < 1) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    searchSecurities(debounced)
      .then((r) => {
        if (!cancelled) setResults(r);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debounced]);

  useEffect(() => {
    function onClickOutside(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div ref={boxRef} className="relative w-full">
      <div className={`flex items-center gap-2 input ${compact ? 'py-1.5' : 'py-3 text-base'}`}>
        <Search size={compact ? 16 : 20} className="text-faint shrink-0" />
        <input
          className="bg-transparent outline-none flex-1 min-w-0 placeholder:text-faint"
          placeholder={placeholder || 'Search stocks, ETFs or companies…'}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
        {loading && <Loader2 size={16} className="animate-spin text-faint" />}
      </div>

      {open && query.trim().length > 0 && (
        <div className="absolute z-50 mt-2 w-full card overflow-hidden max-h-80 overflow-y-auto">
          {results.length === 0 && !loading && (
            <div className="px-4 py-3 text-sm text-muted">No matching NSE/BSE securities found.</div>
          )}
          {results.map((r) => (
            <button
              key={r.symbol}
              onClick={() => {
                setOpen(false);
                setQuery('');
                onSelect?.(r);
              }}
              className="w-full text-left px-4 py-2.5 hover:bg-ink-700 flex items-center justify-between gap-3 border-b border-line last:border-0"
            >
              <div className="min-w-0">
                <div className="text-sm font-medium text-paper truncate">{r.name}</div>
                <div className="text-xs text-muted truncate">
                  {r.symbol} · {r.exchange} · {r.sector}
                </div>
              </div>
              <span className="chip shrink-0">{r.type}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
