import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import StockDirectory from './pages/StockDirectory';
import ETFDirectory from './pages/ETFDirectory';
import StockAnalysis from './pages/StockAnalysis';
import ETFAnalysis from './pages/ETFAnalysis';
import Screener from './pages/Screener';
import ETFScreener from './pages/ETFScreener';
import Compare from './pages/Compare';
import Watchlist from './pages/Watchlist';
import DCFCalculator from './pages/DCFCalculator';
import LearnCenter from './pages/LearnCenter';
import MarketOverview from './pages/MarketOverview';
import About from './pages/About';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/stocks" element={<StockDirectory />} />
        <Route path="/etfs" element={<ETFDirectory />} />
        <Route path="/stock/:symbol" element={<StockAnalysis />} />
        <Route path="/etf/:symbol" element={<ETFAnalysis />} />
        <Route path="/screener" element={<Screener />} />
        <Route path="/etf-screener" element={<ETFScreener />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/tools/dcf" element={<DCFCalculator />} />
        <Route path="/learn" element={<LearnCenter />} />
        <Route path="/market" element={<MarketOverview />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}
