import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Logo from './Logo';
import SearchBox from './SearchBox';
import {
  LayoutDashboard,
  LineChart,
  ListFilter,
  Scale,
  Star,
  GraduationCap,
  Info,
  Landmark,
  PieChart,
  Calculator,
  Menu,
  X,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: LayoutDashboard, end: true },
  { to: '/stocks', label: 'Stocks', icon: LineChart },
  { to: '/etfs', label: 'ETFs', icon: PieChart },
  { to: '/screener', label: 'Screener', icon: ListFilter },
  { to: '/compare', label: 'Compare', icon: Scale },
  { to: '/watchlist', label: 'Watchlist', icon: Star },
  { to: '/market', label: 'Market', icon: Landmark },
  { to: '/tools/dcf', label: 'DCF Tool', icon: Calculator },
  { to: '/learn', label: 'Learn', icon: GraduationCap },
  { to: '/about', label: 'About', icon: Info },
];

const MOBILE_ITEMS = NAV_ITEMS.filter((i) =>
  ['/','/stocks','/screener','/watchlist','/learn'].includes(i.to)
);

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col w-60 shrink-0 border-r border-line bg-ink-900 sticky top-0 h-screen">
        <div className="px-5 py-5 border-b border-line">
          <Logo />
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive ? 'bg-ink-700 text-paper' : 'text-muted hover:bg-ink-800 hover:text-paper'
                }`
              }
            >
              <Icon size={17} strokeWidth={1.75} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-line text-xs text-faint leading-relaxed">
          Data delayed. Educational use only. Not investment advice.
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-ink-950/90 backdrop-blur border-b border-line">
          <div className="flex items-center gap-3 px-4 md:px-6 py-3">
            <button
              className="md:hidden text-muted hover:text-paper"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <div className="md:hidden">
              <Logo size={20} />
            </div>
            <div className="flex-1 max-w-xl ml-auto">
              <SearchBox
                compact
                onSelect={(sec) =>
                  navigate(sec.type === 'ETF' ? `/etf/${sec.symbol}` : `/stock/${sec.symbol}`)
                }
              />
            </div>
          </div>
        </header>

        <main className="flex-1 pb-20 md:pb-8">{children}</main>

        <footer className="hidden md:block border-t border-line px-6 py-6 text-xs text-faint">
          <p className="max-w-3xl">
            Fundamental Analyst is an educational and analytical platform. Market data may be delayed,
            incomplete, or inaccurate. Nothing on this website constitutes personalized investment advice.
            Verify important information with official exchange filings and company disclosures before
            making investment decisions.
          </p>
        </footer>
      </div>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-ink-900 border-t border-line flex justify-around py-2">
        {MOBILE_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1 text-[10px] ${
                isActive ? 'text-amber-500' : 'text-faint'
              }`
            }
          >
            <Icon size={19} strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-ink-950/95 backdrop-blur-sm">
          <div className="flex items-center justify-between px-5 py-5 border-b border-line">
            <Logo />
            <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="text-muted">
              <X size={24} />
            </button>
          </div>
          <nav className="p-4 space-y-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-lg text-base ${
                    isActive ? 'bg-ink-700 text-paper' : 'text-muted'
                  }`
                }
              >
                <Icon size={19} strokeWidth={1.75} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
