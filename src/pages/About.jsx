export default function About() {
  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
      <h1 className="font-display text-2xl md:text-3xl font-semibold text-paper mb-1">About Fundamental Analyst</h1>
      <p className="text-muted text-sm mb-8">Understand the business. Analyze the numbers. Invest with clarity.</p>

      <div className="space-y-6 text-sm text-muted leading-relaxed">
        <section>
          <h2 className="text-paper font-medium mb-2">What this is</h2>
          <p>
            Fundamental Analyst is an educational research tool for NSE and BSE-listed stocks and ETFs. It pulls
            live (delayed) market data and financial-statement data from a public data source, computes standard
            valuation and profitability ratios, and presents a transparent, rule-based fundamental score and
            analytical signal — never a black-box recommendation.
          </p>
        </section>
        <section>
          <h2 className="text-paper font-medium mb-2">Data source & limitations</h2>
          <p>
            Market data is sourced from Yahoo Finance's public endpoints via server-side Netlify Functions.
            This is an unofficial, undocumented API — well suited to a non-commercial educational tool, but not a
            licensed, guaranteed real-time feed. Prices are delayed, and some fields (ISIN, expense ratio, ROCE,
            full financial-statement history for smaller companies) may show "Data unavailable" rather than a
            fabricated number. See the README for full details and how to swap in a licensed provider.
          </p>
        </section>
        <section>
          <h2 className="text-paper font-medium mb-2">Not investment advice</h2>
          <p>
            Fundamental Analyst is an educational and analytical platform. Market data may be delayed, incomplete,
            or inaccurate. Nothing on this website constitutes personalized investment advice. Verify important
            information with official exchange filings and company disclosures before making investment decisions.
          </p>
        </section>
      </div>
    </div>
  );
}
