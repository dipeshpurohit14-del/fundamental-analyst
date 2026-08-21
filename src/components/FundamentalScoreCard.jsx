import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { SCORE_METHODOLOGY } from '../utils/fundamentalScore';

const CATEGORY_LABELS = {
  businessQuality: 'Business Quality',
  growth: 'Growth',
  profitability: 'Profitability',
  financialHealth: 'Financial Health',
  cashFlow: 'Cash Flow',
  valuation: 'Valuation',
};

function barColor(v) {
  if (v === null) return '#2E3C4D';
  if (v >= 7) return '#31C48D';
  if (v >= 4.5) return '#E8952A';
  return '#E5546B';
}

export default function FundamentalScoreCard({ score }) {
  const [open, setOpen] = useState(false);
  const { overall, categories, methodologyNote } = score;

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs text-muted mb-1">Overall Fundamental Score</div>
          <div className="text-3xl font-display font-semibold tnum" style={{ color: barColor(overall) }}>
            {overall !== null ? overall.toFixed(1) : '—'}
            <span className="text-base text-faint font-body"> / 10</span>
          </div>
        </div>
      </div>

      <div className="space-y-2.5">
        {Object.entries(categories).map(([key, val]) => (
          <div key={key}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted">{CATEGORY_LABELS[key]}</span>
              <span className="tnum text-paper">{val !== null ? val.toFixed(1) : 'N/A'}</span>
            </div>
            <div className="h-1.5 rounded-full bg-ink-700 overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${val !== null ? val * 10 : 0}%`, background: barColor(val) }}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setOpen((o) => !o)}
        className="mt-4 flex items-center gap-1 text-xs text-signal hover:underline"
      >
        How this is calculated
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="mt-3 space-y-2 border-t border-line pt-3">
          {SCORE_METHODOLOGY.map((m) => (
            <div key={m.category} className="text-xs">
              <span className="text-paper font-medium">{m.category}: </span>
              <span className="text-muted">{m.basis}</span>
            </div>
          ))}
          <p className="text-xs text-faint pt-2">{methodologyNote}</p>
        </div>
      )}
    </div>
  );
}
