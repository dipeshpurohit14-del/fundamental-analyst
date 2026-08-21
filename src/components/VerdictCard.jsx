import { useState } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

const COLOR_MAP = {
  gain: { text: 'text-gain', bg: 'bg-gain/10', border: 'border-gain/30' },
  amber: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  loss: { text: 'text-loss', bg: 'bg-loss/10', border: 'border-loss/30' },
  muted: { text: 'text-muted', bg: 'bg-ink-700', border: 'border-line' },
};

export default function VerdictCard({ verdict }) {
  const [open, setOpen] = useState(false);
  const c = COLOR_MAP[verdict.color] || COLOR_MAP.muted;

  return (
    <div className={`card p-5 border ${c.border} ${c.bg}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs text-muted mb-1">Analytical Signal</div>
          <div className={`text-xl font-display font-semibold ${c.text}`}>{verdict.label}</div>
        </div>
        {verdict.overall !== null && (
          <div className="text-right">
            <div className="text-xs text-muted">Score</div>
            <div className={`text-lg font-mono tnum ${c.text}`}>{verdict.overall}/10</div>
          </div>
        )}
      </div>

      {verdict.qualifier && (
        <div className="flex items-start gap-2 mt-3 text-xs text-amber-400 bg-amber-500/5 border border-amber-500/20 rounded-lg px-3 py-2">
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>{verdict.qualifier}</span>
        </div>
      )}

      <button onClick={() => setOpen((o) => !o)} className="mt-3 flex items-center gap-1 text-xs text-signal hover:underline">
        Why this signal?
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <ul className="mt-2 space-y-1 text-xs text-muted list-disc list-inside">
          {verdict.reasons.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      )}

      <p className="text-[11px] text-faint mt-3 pt-3 border-t border-line">{verdict.disclaimer}</p>
    </div>
  );
}
