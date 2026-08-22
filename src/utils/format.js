// src/utils/format.js
export const DATA_UNAVAILABLE = 'Data unavailable';

export function isMissing(v) {
  return v === null || v === undefined || v === DATA_UNAVAILABLE || Number.isNaN(v);
}

export function fmtINR(value, { compact = false, decimals = 2 } = {}) {
  if (isMissing(value)) return DATA_UNAVAILABLE;
  const n = Number(value);
  if (compact) return formatCompactINR(n);
  return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function formatCompactINR(n) {
  if (isMissing(n)) return DATA_UNAVAILABLE;
  const abs = Math.abs(n);
  if (abs >= 1e7) return '₹' + (n / 1e7).toFixed(2) + ' Cr';
  if (abs >= 1e5) return '₹' + (n / 1e5).toFixed(2) + ' L';
  if (abs >= 1e3) return '₹' + (n / 1e3).toFixed(2) + ' K';
  return '₹' + n.toFixed(2);
}

export function fmtNum(value, decimals = 2) {
  if (isMissing(value)) return DATA_UNAVAILABLE;
  return Number(value).toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export function fmtPct(value, decimals = 2) {
  if (isMissing(value)) return DATA_UNAVAILABLE;
  return Number(value).toFixed(decimals) + '%';
}

export function fmtSignedPct(value, decimals = 2) {
  if (isMissing(value)) return DATA_UNAVAILABLE;
  const n = Number(value);
  const sign = n > 0 ? '+' : '';
  return sign + n.toFixed(decimals) + '%';
}

export function fmtChange(value, decimals = 2) {
  if (isMissing(value)) return DATA_UNAVAILABLE;
  const n = Number(value);
  const sign = n > 0 ? '+' : '';
  return sign + n.toFixed(decimals);
}

export function changeColor(value) {
  if (isMissing(value)) return 'text-muted';
  return Number(value) >= 0 ? 'text-gain' : 'text-loss';
}

export function fmtDate(ts, opts = {}) {
  if (isMissing(ts)) return DATA_UNAVAILABLE;
  const d = typeof ts === 'number' ? new Date(ts * (ts < 2e10 ? 1000 : 1)) : new Date(ts);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', ...opts });
}

export function fmtTime(ts) {
  if (isMissing(ts)) return DATA_UNAVAILABLE;
  const d = typeof ts === 'number' ? new Date(ts * (ts < 2e10 ? 1000 : 1)) : new Date(ts);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }) + ' IST';
}
