// src/data/securities.js
//
// Reference universe of Indian securities: name, ticker, exchange, type,
// sector and industry only. NO price, market cap, ratio, or financial-statement
// values live here — those are always fetched live via services/marketData.
//
// This is a curated subset (large & well-known mid caps + major ETFs), not the
// complete NSE/BSE universe. A licensed reference-data feed (e.g. Twelve Data's
// paid Grow+ plan, or an exchange-licensed vendor) is required for full coverage;
// see README.md "Known limitations".

export const SECURITY_TYPES = { EQUITY: 'EQUITY', ETF: 'ETF' };
export const EXCHANGES = { NSE: 'NSE', BSE: 'BSE' };

// yahooSymbol carries the .NS / .BO suffix used to query the live data provider.
export const SECURITIES = [
  // ---- Information Technology ----
  { symbol: 'TCS', yahooSymbol: 'TCS.NS', name: 'Tata Consultancy Services Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Information Technology', industry: 'IT Services & Consulting' },
  { symbol: 'INFY', yahooSymbol: 'INFY.NS', name: 'Infosys Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Information Technology', industry: 'IT Services & Consulting' },
  { symbol: 'WIPRO', yahooSymbol: 'WIPRO.NS', name: 'Wipro Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Information Technology', industry: 'IT Services & Consulting' },
  { symbol: 'HCLTECH', yahooSymbol: 'HCLTECH.NS', name: 'HCL Technologies Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Information Technology', industry: 'IT Services & Consulting' },
  { symbol: 'TECHM', yahooSymbol: 'TECHM.NS', name: 'Tech Mahindra Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Information Technology', industry: 'IT Services & Consulting' },
  { symbol: 'LTIM', yahooSymbol: 'LTIM.NS', name: 'LTIMindtree Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Information Technology', industry: 'IT Services & Consulting' },
  { symbol: 'PERSISTENT', yahooSymbol: 'PERSISTENT.NS', name: 'Persistent Systems Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Information Technology', industry: 'IT Services & Consulting' },
  { symbol: 'COFORGE', yahooSymbol: 'COFORGE.NS', name: 'Coforge Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Information Technology', industry: 'IT Services & Consulting' },

  // ---- Banking & Financial Services ----
  { symbol: 'HDFCBANK', yahooSymbol: 'HDFCBANK.NS', name: 'HDFC Bank Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Financial Services', industry: 'Private Sector Bank' },
  { symbol: 'ICICIBANK', yahooSymbol: 'ICICIBANK.NS', name: 'ICICI Bank Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Financial Services', industry: 'Private Sector Bank' },
  { symbol: 'SBIN', yahooSymbol: 'SBIN.NS', name: 'State Bank of India', exchange: 'NSE', type: 'EQUITY', sector: 'Financial Services', industry: 'Public Sector Bank' },
  { symbol: 'KOTAKBANK', yahooSymbol: 'KOTAKBANK.NS', name: 'Kotak Mahindra Bank Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Financial Services', industry: 'Private Sector Bank' },
  { symbol: 'AXISBANK', yahooSymbol: 'AXISBANK.NS', name: 'Axis Bank Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Financial Services', industry: 'Private Sector Bank' },
  { symbol: 'INDUSINDBK', yahooSymbol: 'INDUSINDBK.NS', name: 'IndusInd Bank Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Financial Services', industry: 'Private Sector Bank' },
  { symbol: 'BAJFINANCE', yahooSymbol: 'BAJFINANCE.NS', name: 'Bajaj Finance Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Financial Services', industry: 'NBFC' },
  { symbol: 'BAJAJFINSV', yahooSymbol: 'BAJAJFINSV.NS', name: 'Bajaj Finserv Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Financial Services', industry: 'Financial Services' },
  { symbol: 'HDFCLIFE', yahooSymbol: 'HDFCLIFE.NS', name: 'HDFC Life Insurance Company Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Financial Services', industry: 'Life Insurance' },
  { symbol: 'SBILIFE', yahooSymbol: 'SBILIFE.NS', name: 'SBI Life Insurance Company Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Financial Services', industry: 'Life Insurance' },
  { symbol: 'ICICIGI', yahooSymbol: 'ICICIGI.NS', name: 'ICICI Lombard General Insurance Co Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Financial Services', industry: 'General Insurance' },
  { symbol: 'ICICIPRULI', yahooSymbol: 'ICICIPRULI.NS', name: 'ICICI Prudential Life Insurance Co Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Financial Services', industry: 'Life Insurance' },
  { symbol: 'PFC', yahooSymbol: 'PFC.NS', name: 'Power Finance Corporation Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Financial Services', industry: 'NBFC' },
  { symbol: 'RECLTD', yahooSymbol: 'RECLTD.NS', name: 'REC Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Financial Services', industry: 'NBFC' },

  // ---- Energy / Oil & Gas ----
  { symbol: 'RELIANCE', yahooSymbol: 'RELIANCE.NS', name: 'Reliance Industries Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Energy', industry: 'Refineries & Petrochemicals' },
  { symbol: 'ONGC', yahooSymbol: 'ONGC.NS', name: 'Oil & Natural Gas Corporation Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Energy', industry: 'Oil Exploration' },
  { symbol: 'IOC', yahooSymbol: 'IOC.NS', name: 'Indian Oil Corporation Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Energy', industry: 'Refineries' },
  { symbol: 'BPCL', yahooSymbol: 'BPCL.NS', name: 'Bharat Petroleum Corporation Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Energy', industry: 'Refineries' },
  { symbol: 'GAIL', yahooSymbol: 'GAIL.NS', name: 'GAIL (India) Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Energy', industry: 'Gas Transmission & Marketing' },
  { symbol: 'NTPC', yahooSymbol: 'NTPC.NS', name: 'NTPC Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Utilities', industry: 'Power Generation' },
  { symbol: 'POWERGRID', yahooSymbol: 'POWERGRID.NS', name: 'Power Grid Corporation of India Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Utilities', industry: 'Power Transmission' },
  { symbol: 'COALINDIA', yahooSymbol: 'COALINDIA.NS', name: 'Coal India Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Energy', industry: 'Coal Mining' },
  { symbol: 'ADANIENT', yahooSymbol: 'ADANIENT.NS', name: 'Adani Enterprises Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Diversified', industry: 'Diversified Conglomerate' },
  { symbol: 'ADANIPORTS', yahooSymbol: 'ADANIPORTS.NS', name: 'Adani Ports & SEZ Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Industrials', industry: 'Ports & Logistics' },
  { symbol: 'ADANIGREEN', yahooSymbol: 'ADANIGREEN.NS', name: 'Adani Green Energy Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Utilities', industry: 'Renewable Power' },
  { symbol: 'TATAPOWER', yahooSymbol: 'TATAPOWER.NS', name: 'Tata Power Company Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Utilities', industry: 'Power Generation & Distribution' },

  // ---- FMCG / Consumer ----
  { symbol: 'HINDUNILVR', yahooSymbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Consumer Staples', industry: 'FMCG - Diversified' },
  { symbol: 'ITC', yahooSymbol: 'ITC.NS', name: 'ITC Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Consumer Staples', industry: 'FMCG - Tobacco & Diversified' },
  { symbol: 'NESTLEIND', yahooSymbol: 'NESTLEIND.NS', name: 'Nestle India Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Consumer Staples', industry: 'FMCG - Food Products' },
  { symbol: 'BRITANNIA', yahooSymbol: 'BRITANNIA.NS', name: 'Britannia Industries Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Consumer Staples', industry: 'FMCG - Food Products' },
  { symbol: 'DABUR', yahooSymbol: 'DABUR.NS', name: 'Dabur India Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Consumer Staples', industry: 'FMCG - Personal Care' },
  { symbol: 'MARICO', yahooSymbol: 'MARICO.NS', name: 'Marico Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Consumer Staples', industry: 'FMCG - Personal Care' },
  { symbol: 'TATACONSUM', yahooSymbol: 'TATACONSUM.NS', name: 'Tata Consumer Products Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Consumer Staples', industry: 'FMCG - Beverages & Food' },
  { symbol: 'VBL', yahooSymbol: 'VBL.NS', name: 'Varun Beverages Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Consumer Staples', industry: 'FMCG - Beverages' },

  // ---- Consumer Discretionary / Auto ----
  { symbol: 'MARUTI', yahooSymbol: 'MARUTI.NS', name: 'Maruti Suzuki India Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Consumer Discretionary', industry: 'Passenger Vehicles' },
  { symbol: 'TATAMOTORS', yahooSymbol: 'TATAMOTORS.NS', name: 'Tata Motors Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Consumer Discretionary', industry: 'Automobiles - Diversified' },
  { symbol: 'M&M', yahooSymbol: 'M&M.NS', name: 'Mahindra & Mahindra Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Consumer Discretionary', industry: 'Automobiles - Diversified' },
  { symbol: 'BAJAJ-AUTO', yahooSymbol: 'BAJAJ-AUTO.NS', name: 'Bajaj Auto Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Consumer Discretionary', industry: 'Two & Three Wheelers' },
  { symbol: 'HEROMOTOCO', yahooSymbol: 'HEROMOTOCO.NS', name: 'Hero MotoCorp Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Consumer Discretionary', industry: 'Two Wheelers' },
  { symbol: 'EICHERMOT', yahooSymbol: 'EICHERMOT.NS', name: 'Eicher Motors Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Consumer Discretionary', industry: 'Two Wheelers & Commercial Vehicles' },
  { symbol: 'TITAN', yahooSymbol: 'TITAN.NS', name: 'Titan Company Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Consumer Discretionary', industry: 'Jewellery & Watches' },
  { symbol: 'TRENT', yahooSymbol: 'TRENT.NS', name: 'Trent Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Consumer Discretionary', industry: 'Retail - Apparel' },
  { symbol: 'DMART', yahooSymbol: 'DMART.NS', name: 'Avenue Supermarts Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Consumer Discretionary', industry: 'Retail - Supermarkets' },

  // ---- Pharma & Healthcare ----
  { symbol: 'SUNPHARMA', yahooSymbol: 'SUNPHARMA.NS', name: 'Sun Pharmaceutical Industries Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Healthcare', industry: 'Pharmaceuticals' },
  { symbol: 'DRREDDY', yahooSymbol: 'DRREDDY.NS', name: "Dr. Reddy's Laboratories Ltd", exchange: 'NSE', type: 'EQUITY', sector: 'Healthcare', industry: 'Pharmaceuticals' },
  { symbol: 'CIPLA', yahooSymbol: 'CIPLA.NS', name: 'Cipla Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Healthcare', industry: 'Pharmaceuticals' },
  { symbol: 'DIVISLAB', yahooSymbol: 'DIVISLAB.NS', name: "Divi's Laboratories Ltd", exchange: 'NSE', type: 'EQUITY', sector: 'Healthcare', industry: 'Pharmaceuticals - API' },
  { symbol: 'APOLLOHOSP', yahooSymbol: 'APOLLOHOSP.NS', name: 'Apollo Hospitals Enterprise Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Healthcare', industry: 'Hospitals & Healthcare' },
  { symbol: 'LUPIN', yahooSymbol: 'LUPIN.NS', name: 'Lupin Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Healthcare', industry: 'Pharmaceuticals' },
  { symbol: 'AUROPHARMA', yahooSymbol: 'AUROPHARMA.NS', name: 'Aurobindo Pharma Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Healthcare', industry: 'Pharmaceuticals' },
  { symbol: 'MAXHEALTH', yahooSymbol: 'MAXHEALTH.NS', name: 'Max Healthcare Institute Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Healthcare', industry: 'Hospitals & Healthcare' },

  // ---- Materials / Metals / Cement ----
  { symbol: 'TATASTEEL', yahooSymbol: 'TATASTEEL.NS', name: 'Tata Steel Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Materials', industry: 'Steel' },
  { symbol: 'JSWSTEEL', yahooSymbol: 'JSWSTEEL.NS', name: 'JSW Steel Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Materials', industry: 'Steel' },
  { symbol: 'HINDALCO', yahooSymbol: 'HINDALCO.NS', name: 'Hindalco Industries Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Materials', industry: 'Aluminium' },
  { symbol: 'VEDL', yahooSymbol: 'VEDL.NS', name: 'Vedanta Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Materials', industry: 'Diversified Metals & Mining' },
  { symbol: 'ULTRACEMCO', yahooSymbol: 'ULTRACEMCO.NS', name: 'UltraTech Cement Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Materials', industry: 'Cement' },
  { symbol: 'SHREECEM', yahooSymbol: 'SHREECEM.NS', name: 'Shree Cement Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Materials', industry: 'Cement' },
  { symbol: 'GRASIM', yahooSymbol: 'GRASIM.NS', name: 'Grasim Industries Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Materials', industry: 'Diversified - Cement & Chemicals' },
  { symbol: 'JINDALSTEL', yahooSymbol: 'JINDALSTEL.NS', name: 'Jindal Steel & Power Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Materials', industry: 'Steel' },
  { symbol: 'PIDILITIND', yahooSymbol: 'PIDILITIND.NS', name: 'Pidilite Industries Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Materials', industry: 'Specialty Chemicals - Adhesives' },
  { symbol: 'UPL', yahooSymbol: 'UPL.NS', name: 'UPL Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Materials', industry: 'Agrochemicals' },

  // ---- Industrials / Infra / Capital Goods ----
  { symbol: 'LT', yahooSymbol: 'LT.NS', name: 'Larsen & Toubro Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Industrials', industry: 'Engineering & Construction' },
  { symbol: 'SIEMENS', yahooSymbol: 'SIEMENS.NS', name: 'Siemens Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Industrials', industry: 'Electrical Equipment' },
  { symbol: 'ABB', yahooSymbol: 'ABB.NS', name: 'ABB India Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Industrials', industry: 'Electrical Equipment' },
  { symbol: 'CUMMINSIND', yahooSymbol: 'CUMMINSIND.NS', name: 'Cummins India Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Industrials', industry: 'Engines & Power Equipment' },
  { symbol: 'HAL', yahooSymbol: 'HAL.NS', name: 'Hindustan Aeronautics Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Industrials', industry: 'Aerospace & Defense' },
  { symbol: 'BEL', yahooSymbol: 'BEL.NS', name: 'Bharat Electronics Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Industrials', industry: 'Aerospace & Defense Electronics' },
  { symbol: 'BHEL', yahooSymbol: 'BHEL.NS', name: 'Bharat Heavy Electricals Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Industrials', industry: 'Heavy Electrical Equipment' },
  { symbol: 'DLF', yahooSymbol: 'DLF.NS', name: 'DLF Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Real Estate', industry: 'Real Estate Development' },
  { symbol: 'GODREJPROP', yahooSymbol: 'GODREJPROP.NS', name: 'Godrej Properties Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Real Estate', industry: 'Real Estate Development' },

  // ---- Telecom / Media ----
  { symbol: 'BHARTIARTL', yahooSymbol: 'BHARTIARTL.NS', name: 'Bharti Airtel Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Telecommunication', industry: 'Telecom Services' },
  { symbol: 'IDEA', yahooSymbol: 'IDEA.NS', name: 'Vodafone Idea Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Telecommunication', industry: 'Telecom Services' },

  // ---- Diversified / Ports / Retail ----
  { symbol: 'ASIANPAINT', yahooSymbol: 'ASIANPAINT.NS', name: 'Asian Paints Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Materials', industry: 'Paints' },
  { symbol: 'HAVELLS', yahooSymbol: 'HAVELLS.NS', name: 'Havells India Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Consumer Discretionary', industry: 'Consumer Electricals' },
  { symbol: 'ZOMATO', yahooSymbol: 'ZOMATO.NS', name: 'Eternal Ltd (Zomato)', exchange: 'NSE', type: 'EQUITY', sector: 'Consumer Discretionary', industry: 'Internet - Food Delivery' },
  { symbol: 'NYKAA', yahooSymbol: 'NYKAA.NS', name: 'FSN E-Commerce Ventures Ltd (Nykaa)', exchange: 'NSE', type: 'EQUITY', sector: 'Consumer Discretionary', industry: 'Internet - E-commerce' },
  { symbol: 'PAYTM', yahooSymbol: 'PAYTM.NS', name: 'One 97 Communications Ltd (Paytm)', exchange: 'NSE', type: 'EQUITY', sector: 'Financial Services', industry: 'Fintech' },
  { symbol: 'IRCTC', yahooSymbol: 'IRCTC.NS', name: 'Indian Railway Catering & Tourism Corp Ltd', exchange: 'NSE', type: 'EQUITY', sector: 'Consumer Discretionary', industry: 'Travel Services' },
  { symbol: 'INDIGO', yahooSymbol: 'INDIGO.NS', name: 'InterGlobe Aviation Ltd (IndiGo)', exchange: 'NSE', type: 'EQUITY', sector: 'Industrials', industry: 'Airlines' },

  // ---- ETFs (major, liquid, well-known) ----
  { symbol: 'NIFTYBEES', yahooSymbol: 'NIFTYBEES.NS', name: 'Nippon India ETF Nifty 50 BeES', exchange: 'NSE', type: 'ETF', sector: 'Broad Market', industry: 'Nifty 50 Index Fund', trackingIndex: 'NIFTY 50' },
  { symbol: 'BANKBEES', yahooSymbol: 'BANKBEES.NS', name: 'Nippon India ETF Bank BeES', exchange: 'NSE', type: 'ETF', sector: 'Financials', industry: 'Bank Nifty Index Fund', trackingIndex: 'NIFTY Bank' },
  { symbol: 'JUNIORBEES', yahooSymbol: 'JUNIORBEES.NS', name: 'Nippon India ETF Nifty Next 50 Junior BeES', exchange: 'NSE', type: 'ETF', sector: 'Broad Market', industry: 'Nifty Next 50 Index Fund', trackingIndex: 'NIFTY Next 50' },
  { symbol: 'GOLDBEES', yahooSymbol: 'GOLDBEES.NS', name: 'Nippon India ETF Gold BeES', exchange: 'NSE', type: 'ETF', sector: 'Commodities', industry: 'Gold ETF', trackingIndex: 'Domestic Gold Prices' },
  { symbol: 'ICICINIFTY', yahooSymbol: 'ICICINIFTY.NS', name: 'ICICI Prudential Nifty 50 ETF', exchange: 'NSE', type: 'ETF', sector: 'Broad Market', industry: 'Nifty 50 Index Fund', trackingIndex: 'NIFTY 50' },
  { symbol: 'SETFNIF50', yahooSymbol: 'SETFNIF50.NS', name: 'SBI Nifty 50 ETF', exchange: 'NSE', type: 'ETF', sector: 'Broad Market', industry: 'Nifty 50 Index Fund', trackingIndex: 'NIFTY 50' },
  { symbol: 'ITBEES', yahooSymbol: 'ITBEES.NS', name: 'Nippon India ETF Nifty IT', exchange: 'NSE', type: 'ETF', sector: 'Information Technology', industry: 'Nifty IT Index Fund', trackingIndex: 'NIFTY IT' },
  { symbol: 'MON100', yahooSymbol: 'MON100.NS', name: 'Motilal Oswal Nasdaq 100 ETF', exchange: 'NSE', type: 'ETF', sector: 'International', industry: 'Nasdaq 100 Index Fund', trackingIndex: 'NASDAQ 100' },
  { symbol: 'LIQUIDBEES', yahooSymbol: 'LIQUIDBEES.NS', name: 'Nippon India ETF Liquid BeES', exchange: 'NSE', type: 'ETF', sector: 'Cash Equivalent', industry: 'Liquid Fund ETF', trackingIndex: 'Overnight Money Market' },
  { symbol: 'SILVERBEES', yahooSymbol: 'SILVERBEES.NS', name: 'Nippon India ETF Silver BeES', exchange: 'NSE', type: 'ETF', sector: 'Commodities', industry: 'Silver ETF', trackingIndex: 'Domestic Silver Prices' },
  { symbol: 'CPSEETF', yahooSymbol: 'CPSEETF.NS', name: 'CPSE ETF', exchange: 'NSE', type: 'ETF', sector: 'Public Sector', industry: 'PSU Index Fund', trackingIndex: 'Nifty CPSE' },
  { symbol: 'HDFCNIFTY', yahooSymbol: 'HDFCNIFTY.NS', name: 'HDFC Nifty 50 ETF', exchange: 'NSE', type: 'ETF', sector: 'Broad Market', industry: 'Nifty 50 Index Fund', trackingIndex: 'NIFTY 50' },
];

export const SECTORS = [...new Set(SECURITIES.map((s) => s.sector))].sort();
export const INDUSTRIES = [...new Set(SECURITIES.map((s) => s.industry))].sort();

export function findBySymbol(symbol) {
  return SECURITIES.find((s) => s.symbol.toUpperCase() === String(symbol).toUpperCase());
}
