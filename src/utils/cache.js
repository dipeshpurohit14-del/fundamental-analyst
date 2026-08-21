// src/utils/cache.js
// Minimal in-memory TTL cache shared across the app session.
// Avoids re-fetching the same symbol/endpoint on every re-render or nav.

const store = new Map();

export async function withCache(key, ttlMs, fetcher) {
  const hit = store.get(key);
  const now = Date.now();
  if (hit && now - hit.t < ttlMs) {
    return hit.v;
  }
  const value = await fetcher();
  store.set(key, { v: value, t: now });
  return value;
}

export function clearCache(prefix) {
  if (!prefix) {
    store.clear();
    return;
  }
  for (const k of store.keys()) {
    if (k.startsWith(prefix)) store.delete(k);
  }
}
