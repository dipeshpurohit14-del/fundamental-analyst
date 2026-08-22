// src/services/marketData/provider.js
//
// This is the ONLY module the UI should import for market data.
// It re-exports whichever concrete provider is active, so swapping data
// vendors (e.g. moving from the free Yahoo-backed provider to a paid
// Twelve Data plan) means changing one line here — no UI code changes.
//
// Every provider module must implement this exact function set:
//
//   searchSecurities(query)         -> Promise<Array<SecurityResult>>
//   getQuote(symbol)                -> Promise<Quote>
//   getHistoricalPrices(symbol, range) -> Promise<Array<Candle>>
//   getCompanyProfile(symbol)       -> Promise<CompanyProfile>
//   getFinancialStatements(symbol)  -> Promise<FinancialStatements>
//   getFundamentals(symbol)         -> Promise<Fundamentals>
//   getETFProfile(symbol)           -> Promise<ETFProfile>
//   getETFHoldings(symbol)          -> Promise<ETFHoldings>
//   getMarketData(indexSymbol)      -> Promise<Quote>
//
// Every field that cannot be sourced from the live API must resolve to the
// exact string 'Data unavailable' (or null) rather than being fabricated.
// See DATA_UNAVAILABLE in utils/format.js.

import * as yahooProvider from './yahooFinanceProvider';

const provider = yahooProvider;

export const {
  searchSecurities,
  getQuote,
  getQuotes,
  getHistoricalPrices,
  getCompanyProfile,
  getFinancialStatements,
  getFundamentals,
  getETFProfile,
  getETFHoldings,
  getMarketData,
} = provider;

export const ACTIVE_PROVIDER_NAME = provider.PROVIDER_NAME;
export const DATA_FRESHNESS = provider.DATA_FRESHNESS; // 'delayed' | 'realtime' | 'eod'
