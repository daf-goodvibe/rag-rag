import React from 'react';
import { Search, Sun, Moon, Bookmark, SlidersHorizontal, Globe } from 'lucide-react';

export type ActiveTab =
  | 'overview'
  | 'supercharts'
  | 'stocks'
  | 'crypto'
  | 'forex'
  | 'commodities'
  | 'bonds'
  | 'heatmap'
  | 'screener';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenSearch: () => void;
  isWatchlistOpen: boolean;
  onToggleWatchlist: () => void;
  watchlistCount: number;
  isDarkMode: boolean;
  onToggleTheme: () => void;
  selectedCurrency: string;
  onCurrencyChange: (currency: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenSearch,
  isWatchlistOpen,
  onToggleWatchlist,
  watchlistCount,
  isDarkMode,
  onToggleTheme,
  selectedCurrency,
  onCurrencyChange,
}) => {
  const tabs: { id: ActiveTab; label: string; isPro?: boolean }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'supercharts', label: 'Supercharts PRO', isPro: true },
    { id: 'stocks', label: 'Stocks' },
    { id: 'crypto', label: 'Crypto' },
    { id: 'forex', label: 'Forex' },
    { id: 'commodities', label: 'Commodities' },
    { id: 'bonds', label: 'Bonds' },
    { id: 'heatmap', label: 'Heatmap' },
    { id: 'screener', label: 'Screener' },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#131722] dark:bg-[#131722] border-b border-[#2a2e39] text-[#d1d4dc] transition-colors">
      {/* Upper Navigation Bar */}
      <div className="max-w-[1720px] mx-auto px-4 lg:px-6 h-14 flex items-center justify-between gap-4">
        {/* Left: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onTabChange('overview')}
            className="flex items-center gap-2 text-left group cursor-pointer"
          >
            {/* TradingView Icon */}
            <div className="w-8 h-8 rounded-lg bg-[#2962ff] flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M4 14.5V18a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1v-3.5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1zm6-9v12.5a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1V5.5a1 1 0 0 0-1-1H11a1 1 0 0 0-1 1zm6 4.5V18a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1V10a1 1 0 0 0-1-1H17a1 1 0 0 0-1 1z" />
              </svg>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold tracking-tight text-white font-sans">
                TradingView
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#2962ff]">
                Markets
              </span>
            </div>
          </button>
        </div>

        {/* Center: Search Trigger (TradingView Style) */}
        <div className="flex-1 max-w-md mx-2 hidden sm:block">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-lg bg-[#1e222d] hover:bg-[#2a2e39] border border-[#2a2e39] text-xs text-slate-400 hover:text-slate-200 transition-all cursor-pointer group shadow-xs"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#2962ff] transition-colors" />
              <span>Search stocks, cryptos, forex, indices...</span>
            </div>
            <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-[#131722] rounded border border-[#2a2e39]">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Actions & Tools */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile Search Button */}
          <button
            onClick={onOpenSearch}
            className="sm:hidden p-2 rounded-lg bg-[#1e222d] text-slate-400 hover:text-white border border-[#2a2e39]"
            title="Search markets"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Currency Selector */}
          <div className="relative flex items-center">
            <select
              value={selectedCurrency}
              onChange={(e) => onCurrencyChange(e.target.value)}
              className="appearance-none bg-[#1e222d] hover:bg-[#2a2e39] text-xs font-semibold text-slate-200 pl-7 pr-3 py-1.5 rounded-lg border border-[#2a2e39] focus:outline-hidden focus:border-[#2962ff] cursor-pointer"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="JPY">JPY (¥)</option>
            </select>
            <Globe className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
          </div>

          {/* Watchlist Toggle */}
          <button
            onClick={onToggleWatchlist}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
              isWatchlistOpen
                ? 'bg-[#2962ff] text-white border-[#2962ff]'
                : 'bg-[#1e222d] hover:bg-[#2a2e39] text-slate-300 border-[#2a2e39]'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Watchlist</span>
            {watchlistCount > 0 && (
              <span className="text-[10px] font-mono opacity-80">({watchlistCount})</span>
            )}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-lg bg-[#1e222d] hover:bg-[#2a2e39] text-slate-300 border border-[#2a2e39] transition-colors"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
          </button>
        </div>
      </div>

      {/* Market Category Navigation Bar */}
      <div className="border-t border-[#2a2e39]/80 bg-[#131722]/80 backdrop-blur-xs">
        <div className="max-w-[1720px] mx-auto px-4 lg:px-6 flex items-center overflow-x-auto no-scrollbar gap-1 sm:gap-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-3.5 py-2.5 text-xs font-semibold tracking-wide whitespace-nowrap transition-colors relative cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{tab.label}</span>
                {tab.isPro && (
                  <span className="px-1.5 py-0.2 rounded bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-[9px] tracking-wider uppercase">
                    PRO
                  </span>
                )}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2962ff]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
