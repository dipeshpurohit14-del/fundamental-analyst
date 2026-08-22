import { useEffect, useRef, useState } from 'react';

// Simple async-fetch hook with loading / error / data states, and a guard
// against setting state after unmount or after a newer request has started.
export function useAsync(fn, deps) {
  const [state, setState] = useState({ loading: true, error: null, data: null });
  const requestId = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const id = ++requestId.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    fn()
      .then((data) => {
        if (!cancelled && id === requestId.current) setState({ loading: false, error: null, data });
      })
      .catch((error) => {
        if (!cancelled && id === requestId.current) setState({ loading: false, error, data: null });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
