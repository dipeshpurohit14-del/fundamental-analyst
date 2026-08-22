import { isMissing } from '../utils/format';

export default function StatTile({ label, value, sub, valueClass = '' }) {
  const missing = isMissing(value);
  return (
    <div className="card px-4 py-3">
      <div className="text-xs text-muted mb-1">{label}</div>
      <div className={`tnum font-mono text-lg ${missing ? 'text-faint text-sm' : 'text-paper'} ${valueClass}`}>
        {value}
      </div>
      {sub && <div className="text-xs text-faint mt-0.5">{sub}</div>}
    </div>
  );
}
