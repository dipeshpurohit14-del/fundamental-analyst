// src/utils/dcf.js
// Pure DCF calculation functions. All figures in the same currency unit
// the user enters (e.g. ₹ Crore) — the calculator does not convert units.

export function projectFreeCashFlows({
  revenue,
  revenueGrowth, // decimal, e.g. 0.12
  ebitdaMargin, // decimal
  taxRate, // decimal
  capexPctRevenue, // decimal
  workingCapitalPctRevenue, // decimal, change in WC as % of revenue
  years = 5,
}) {
  const rows = [];
  let rev = revenue;
  for (let y = 1; y <= years; y++) {
    rev = rev * (1 + revenueGrowth);
    const ebitda = rev * ebitdaMargin;
    const tax = ebitda * taxRate;
    const capex = rev * capexPctRevenue;
    const deltaWC = rev * workingCapitalPctRevenue;
    const fcf = ebitda - tax - capex - deltaWC;
    rows.push({ year: y, revenue: rev, ebitda, tax, capex, deltaWC, fcf });
  }
  return rows;
}

export function presentValue(cashflows, wacc) {
  return cashflows.reduce((sum, cf, i) => sum + cf / Math.pow(1 + wacc, i + 1), 0);
}

export function terminalValue(finalYearFcf, wacc, terminalGrowth) {
  if (wacc <= terminalGrowth) return null; // undefined / explosive — guard against bad inputs
  return (finalYearFcf * (1 + terminalGrowth)) / (wacc - terminalGrowth);
}

export function runDCF(inputs) {
  const {
    revenue,
    revenueGrowth,
    ebitdaMargin,
    taxRate,
    capexPctRevenue,
    workingCapitalPctRevenue,
    wacc,
    terminalGrowth,
    sharesOutstanding,
    netDebt,
    years = 5,
  } = inputs;

  const projection = projectFreeCashFlows({
    revenue,
    revenueGrowth,
    ebitdaMargin,
    taxRate,
    capexPctRevenue,
    workingCapitalPctRevenue,
    years,
  });

  const fcfs = projection.map((r) => r.fcf);
  const pvOfFcfs = presentValue(fcfs, wacc);

  const finalFcf = fcfs[fcfs.length - 1];
  const tv = terminalValue(finalFcf, wacc, terminalGrowth);
  const pvOfTv = tv !== null ? tv / Math.pow(1 + wacc, years) : null;

  const enterpriseValue = tv !== null ? pvOfFcfs + pvOfTv : null;
  const equityValue = enterpriseValue !== null ? enterpriseValue - netDebt : null;
  const intrinsicValuePerShare =
    equityValue !== null && sharesOutstanding > 0 ? equityValue / sharesOutstanding : null;

  return {
    projection,
    pvOfFcfs,
    terminalValue: tv,
    pvOfTerminalValue: pvOfTv,
    enterpriseValue,
    equityValue,
    intrinsicValuePerShare,
    valid: tv !== null,
  };
}

// Sensitivity grid: WACC (rows) x Terminal Growth (cols) -> intrinsic value/share
export function sensitivityGrid(inputs, waccRange, terminalGrowthRange) {
  const grid = [];
  for (const wacc of waccRange) {
    const row = [];
    for (const tg of terminalGrowthRange) {
      const result = runDCF({ ...inputs, wacc, terminalGrowth: tg });
      row.push(result.valid ? result.intrinsicValuePerShare : null);
    }
    grid.push(row);
  }
  return grid;
}
