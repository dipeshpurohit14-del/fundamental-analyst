import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { fmtDate, formatCompactINR } from '../utils/format';
import { EmptyState } from './States';

export default function FinancialTrendChart({ incomeRows, title = 'Revenue & Net Profit' }) {
  const data = (incomeRows || [])
    .filter((r) => r.period && (r.revenue != null || r.netIncome != null))
    .map((r) => ({
      period: r.period,
      Revenue: r.revenue,
      'Net Profit': r.netIncome,
    }));

  if (data.length === 0) return <EmptyState title="Financial trend unavailable" subtitle="This company's statement history isn't provided by the current data source." />;

  return (
    <div className="card p-4">
      <h4 className="text-sm font-medium text-paper mb-3">{title}</h4>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#1E2733" vertical={false} />
          <XAxis dataKey="period" tickFormatter={(t) => fmtDate(t, { month: undefined })} stroke="#59636F" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis tickFormatter={(v) => formatCompactINR(v)} stroke="#59636F" fontSize={11} tickLine={false} axisLine={false} width={64} />
          <Tooltip
            contentStyle={{ background: '#141B24', border: '1px solid #1E2733', borderRadius: 8, fontSize: 12 }}
            labelFormatter={(t) => fmtDate(t, { month: undefined })}
            formatter={(v) => formatCompactINR(v)}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="Revenue" fill="#4C8BF5" radius={[3, 3, 0, 0]} />
          <Bar dataKey="Net Profit" fill="#31C48D" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
