import { useMemo, useState } from 'react';
import { runDCF, sensitivityGrid } from '../utils/dcf';
import { formatCompactINR, fmtNum } from '../utils/format';

const DEFAULTS = {
  revenue: 10000, // ₹ Crore
  revenueGrowth: 12,
  ebitdaMargin: 22,
  taxRate: 25,
  capexPctRevenue: 6,
  workingCapitalPctRevenue: 2,
  wacc: 11,
  terminalGrowth: 4,
  sharesOutstanding: 100, // Crore shares
  netDebt: 2000, // ₹ Crore
  years: 5,
};

function Field({ label, value, onChange, suffix, step = 0.1 }) {
  return (
    <label className="block">
      <span className="text-xs text-muted">{label}</span>
      <div className="flex items-center input mt-1">
        <input
          type="number"
          step={step}
          className="bg-transparent outline-none flex-1 min-w-0 tnum"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        {suffix && <span className="text-xs text-faint ml-2">{suffix}</span>}
      </div>
    </label>
  );
}

export default function DCFCalculator() {
  const [inputs, setInputs] = useState(DEFAULTS);

  const set = (key) => (val) => setInputs((s) => ({ ...s, [key]: val }));

  const result = useMemo(() => {
    return runDCF({
      revenue: inputs.revenue,
      revenueGrowth: inputs.revenueGrowth / 100,
      ebitdaMargin: inputs.ebitdaMargin / 100,
      taxRate: inputs.taxRate / 100,
      capexPctRevenue: inputs.capexPctRevenue / 100,
      workingCapitalPctRevenue: inputs.workingCapitalPctRevenue / 100,
      wacc: inputs.wacc / 100,
      terminalGrowth: inputs.terminalGrowth / 100,
      sharesOutstanding: inputs.sharesOutstanding,
      netDebt: inputs.netDebt,
      years: inputs.years,
    });
  }, [inputs]);

  const waccRange = [inputs.wacc - 2, inputs.wacc - 1, inputs.wacc, inputs.wacc + 1, inputs.wacc + 2].map((w) => w / 100);
  const tgRange = [inputs.terminalGrowth - 1, inputs.terminalGrowth - 0.5, inputs.terminalGrowth, inputs.terminalGrowth + 0.5, inputs.terminalGrowth + 1].map((t) => t / 100);

  const grid = useMemo(
    () =>
      sensitivityGrid(
        {
          revenue: inputs.revenue,
          revenueGrowth: inputs.revenueGrowth / 100,
          ebitdaMargin: inputs.ebitdaMargin / 100,
          taxRate: inputs.taxRate / 100,
          capexPctRevenue: inputs.capexPctRevenue / 100,
          workingCapitalPctRevenue: inputs.workingCapitalPctRevenue / 100,
          sharesOutstanding: inputs.sharesOutstanding,
          netDebt: inputs.netDebt,
          years: inputs.years,
        },
        waccRange,
        tgRange
      ),
    [inputs]
  );

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
      <h1 className="font-display text-2xl md:text-3xl font-semibold text-paper mb-1">DCF Intrinsic Value Calculator</h1>
      <p className="text-muted text-sm mb-6">
        Estimate intrinsic value per share from a discounted cash flow model. All figures in ₹ Crore unless noted.
      </p>

      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 card p-5 space-y-4 h-fit">
          <h3 className="text-sm font-medium text-paper">Assumptions</h3>
          <Field label="Base Revenue (₹ Cr)" value={inputs.revenue} onChange={set('revenue')} step={100} />
          <Field label="Revenue Growth" value={inputs.revenueGrowth} onChange={set('revenueGrowth')} suffix="%" />
          <Field label="EBITDA Margin" value={inputs.ebitdaMargin} onChange={set('ebitdaMargin')} suffix="%" />
          <Field label="Tax Rate" value={inputs.taxRate} onChange={set('taxRate')} suffix="%" />
          <Field label="Capex (% of Revenue)" value={inputs.capexPctRevenue} onChange={set('capexPctRevenue')} suffix="%" />
          <Field label="Δ Working Capital (% of Revenue)" value={inputs.workingCapitalPctRevenue} onChange={set('workingCapitalPctRevenue')} suffix="%" />
          <Field label="WACC" value={inputs.wacc} onChange={set('wacc')} suffix="%" />
          <Field label="Terminal Growth" value={inputs.terminalGrowth} onChange={set('terminalGrowth')} suffix="%" />
          <Field label="Shares Outstanding (Cr)" value={inputs.sharesOutstanding} onChange={set('sharesOutstanding')} step={1} />
          <Field label="Net Debt (₹ Cr)" value={inputs.netDebt} onChange={set('netDebt')} step={10} />
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="card p-5">
            <h3 className="text-sm font-medium text-paper mb-4">Valuation Output</h3>
            {!result.valid ? (
              <p className="text-sm text-loss">
                WACC must be greater than terminal growth for a valid terminal value. Adjust your assumptions.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <Output label="PV of Forecast FCFs" value={formatCompactINR(result.pvOfFcfs * 1e7)} />
                <Output label="Terminal Value" value={formatCompactINR(result.terminalValue * 1e7)} />
                <Output label="Enterprise Value" value={formatCompactINR(result.enterpriseValue * 1e7)} />
                <Output label="Equity Value" value={formatCompactINR(result.equityValue * 1e7)} />
                <Output
                  label="Intrinsic Value / Share"
                  value={`₹${fmtNum(result.intrinsicValuePerShare)}`}
                  big
                />
              </div>
            )}
            <p className="text-xs text-faint mt-4 pt-4 border-t border-line">
              DCF results depend heavily on your assumptions — small changes in WACC or terminal growth
              materially shift the output. This is a modeling tool, not a price target or investment recommendation.
            </p>
          </div>

          <div className="card p-5 overflow-x-auto">
            <h3 className="text-sm font-medium text-paper mb-1">Sensitivity: WACC vs Terminal Growth</h3>
            <p className="text-xs text-faint mb-3">Intrinsic value per share (₹) across nearby assumption ranges.</p>
            <table className="w-full text-center text-xs">
              <thead>
                <tr>
                  <th className="p-2 text-faint">WACC ↓ / TG →</th>
                  {tgRange.map((tg) => (
                    <th key={tg} className="p-2 text-muted tnum">{(tg * 100).toFixed(1)}%</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {grid.map((row, i) => (
                  <tr key={i} className="border-t border-line">
                    <td className="p-2 text-muted tnum">{(waccRange[i] * 100).toFixed(1)}%</td>
                    {row.map((val, j) => (
                      <td
                        key={j}
                        className={`p-2 tnum font-mono ${waccRange[i] === inputs.wacc / 100 && tgRange[j] === inputs.terminalGrowth / 100 ? 'bg-amber-500/10 text-amber-400 font-semibold' : 'text-paper'}`}
                      >
                        {val !== null ? val.toFixed(0) : '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Output({ label, value, big }) {
  return (
    <div>
      <div className="text-xs text-muted mb-1">{label}</div>
      <div className={`tnum font-mono ${big ? 'text-2xl text-amber-400' : 'text-lg text-paper'}`}>{value}</div>
    </div>
  );
}
