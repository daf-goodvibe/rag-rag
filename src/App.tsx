import React, { useState, useEffect } from 'react';
import { MarketAsset } from './types/market';
import {
  INITIAL_ASSETS,
  NEWS_FEED,
  ECONOMIC_CALENDAR,
} from './data/marketsData';
import { Header, ActiveTab } from './components/Header';
import { TickerTape } from './components/TickerTape';
import { SearchModal } from './components/SearchModal';
import { ChartModal } from './components/ChartModal';
import { WatchlistDrawer } from './components/WatchlistDrawer';

// Views
import { OverviewView } from './components/views/OverviewView';
import { StocksView } from './components/views/StocksView';
import { CryptoView } from './components/views/CryptoView';
import { ForexView } from './components/views/ForexView';
import { CommoditiesView } from './components/views/CommoditiesView';
import { BondsView } from './components/views/BondsView';
import { HeatmapView } from './components/views/HeatmapView';
import { ScreenerView } from './components/views/ScreenerView';

export default function App() {
  const [assets, setAssets] = useState<MarketAsset[]>(INITIAL_ASSETS);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [selectedAsset, setSelectedAsset] = useState<MarketAsset | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  // Watchlist & Alerts
  const [watchlistSymbols, setWatchlistSymbols] = useState<string[]>([
    'NVDA',
    'AAPL',
    'BTCUSD',
    'SPX',
    'TSLA',
    'XAUUSD',
  ]);
  const [alerts, setAlerts] = useState<
    { symbol: string; targetPrice: number; triggered: boolean }[]
  >([
    { symbol: 'BTCUSD', targetPrice: 96000, triggered: false },
    { symbol: 'NVDA', targetPrice: 152, triggered: false },
  ]);

  // Currency rate mapping
  const currencyRates: Record<string, { symbol: string; rate: number }> = {
    USD: { symbol: '$', rate: 1.0 },
    EUR: { symbol: '€', rate: 0.95 },
    GBP: { symbol: '£', rate: 0.79 },
    JPY: { symbol: '¥', rate: 154.6 },
  };

  const curr = currencyRates[selectedCurrency] || currencyRates.USD;

  // Toggle Theme on HTML document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.className =
        'bg-[#131722] text-[#d1d4dc] font-sans antialiased selection:bg-[#2962ff]/30 selection:text-white min-h-screen';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.className =
        'bg-[#f0f3fa] text-slate-900 font-sans antialiased selection:bg-[#2962ff]/30 selection:text-slate-900 min-h-screen';
    }
  }, [isDarkMode]);

  // Global Keyboard Shortcut: ⌘K or / to open Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.key === '/' && (e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Subtle real-time market tick engine (TradingView-style live heartbeat)
  useEffect(() => {
    const interval = setInterval(() => {
      setAssets((prev) => {
        // Pick 2-3 random assets to update tick
        return prev.map((asset) => {
          if (Math.random() > 0.45) return asset; // only update some assets
          const deltaPct = (Math.random() - 0.49) * 0.003;
          const newPrice = Number((asset.price * (1 + deltaPct)).toFixed(asset.price < 1 ? 4 : 2));
          const newChange = Number((newPrice - asset.previousClose).toFixed(asset.price < 1 ? 4 : 2));
          const newChangePct = Number(((newChange / asset.previousClose) * 100).toFixed(2));

          const newSparkline = [...asset.sparkline.slice(1), newPrice];

          return {
            ...asset,
            price: newPrice,
            change: newChange,
            changePercent: newChangePct,
            dayHigh: Math.max(asset.dayHigh, newPrice),
            dayLow: Math.min(asset.dayLow, newPrice),
            sparkline: newSparkline,
          };
        });
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleToggleWatchlist = (symbol: string) => {
    setWatchlistSymbols((prev) =>
      prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
    );
  };

  const handleAddAlert = (symbol: string, targetPrice: number) => {
    setAlerts((prev) => [
      ...prev.filter((a) => a.symbol !== symbol),
      { symbol, targetPrice, triggered: false },
    ]);
  };

  const handleRemoveAlert = (symbol: string) => {
    setAlerts((prev) => prev.filter((a) => a.symbol !== symbol));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#131722] dark:bg-[#131722] text-[#d1d4dc] transition-colors">
      {/* 1. Continuous Ticker Tape Marquee */}
      <TickerTape
        assets={assets}
        onSelectAsset={(a) => setSelectedAsset(a)}
        currencySymbol={curr.symbol}
        currencyRate={curr.rate}
      />

      {/* 2. Top Navigation Bar */}
      <Header
        activeTab={activeTab}
        onTabChange={(t) => setActiveTab(t)}
        onOpenSearch={() => setIsSearchOpen(true)}
        isWatchlistOpen={isWatchlistOpen}
        onToggleWatchlist={() => setIsWatchlistOpen(!isWatchlistOpen)}
        watchlistCount={watchlistSymbols.length}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        selectedCurrency={selectedCurrency}
        onCurrencyChange={(c) => setSelectedCurrency(c)}
      />

      {/* 3. Main Viewport Content */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto px-4 lg:px-6 py-6">
        {activeTab === 'overview' && (
          <OverviewView
            assets={assets}
            news={NEWS_FEED}
            economicEvents={ECONOMIC_CALENDAR}
            onSelectAsset={(a) => setSelectedAsset(a)}
            onNavigateToTab={(t) => setActiveTab(t)}
          />
        )}

        {activeTab === 'stocks' && (
          <StocksView
            assets={assets}
            onSelectAsset={(a) => setSelectedAsset(a)}
          />
        )}

        {activeTab === 'crypto' && (
          <CryptoView
            assets={assets}
            onSelectAsset={(a) => setSelectedAsset(a)}
          />
        )}

        {activeTab === 'forex' && (
          <ForexView
            assets={assets}
            onSelectAsset={(a) => setSelectedAsset(a)}
          />
        )}

        {activeTab === 'commodities' && (
          <CommoditiesView
            assets={assets}
            onSelectAsset={(a) => setSelectedAsset(a)}
          />
        )}

        {activeTab === 'bonds' && (
          <BondsView
            assets={assets}
            onSelectAsset={(a) => setSelectedAsset(a)}
          />
        )}

        {activeTab === 'heatmap' && (
          <HeatmapView
            assets={assets}
            onSelectAsset={(a) => setSelectedAsset(a)}
          />
        )}

        {activeTab === 'screener' && (
          <ScreenerView
            assets={assets}
            onSelectAsset={(a) => setSelectedAsset(a)}
          />
        )}
      </main>

      {/* 4. Professional TradingView Footer */}
      <footer className="border-t border-[#2a2e39] bg-[#1e222d] text-[#787b86] py-8 text-xs mt-12">
        <div className="max-w-[1720px] mx-auto px-4 lg:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#2962ff] flex items-center justify-center text-white text-[10px] font-bold">
              TV
            </div>
            <span className="font-bold text-slate-300">TradingView Markets</span>
            <span>· Global Financial Overview, Screener & Technical Analytics</span>
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <span>Real-time quotes provided for informational purposes</span>
            <button
              onClick={() => setActiveTab('screener')}
              className="hover:text-slate-300 transition-colors"
            >
              Screener
            </button>
            <button
              onClick={() => setActiveTab('heatmap')}
              className="hover:text-slate-300 transition-colors"
            >
              Heatmap
            </button>
            <button
              onClick={() => setActiveTab('overview')}
              className="hover:text-slate-300 transition-colors"
            >
              Overview
            </button>
          </div>
        </div>
      </footer>

      {/* 5. Modals & Drawers */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        assets={assets}
        onSelectAsset={(a) => setSelectedAsset(a)}
      />

      <ChartModal
        asset={selectedAsset}
        onClose={() => setSelectedAsset(null)}
        isWatchlisted={selectedAsset ? watchlistSymbols.includes(selectedAsset.symbol) : false}
        onToggleWatchlist={handleToggleWatchlist}
        onSetAlert={handleAddAlert}
      />

      <WatchlistDrawer
        isOpen={isWatchlistOpen}
        onClose={() => setIsWatchlistOpen(false)}
        watchlistSymbols={watchlistSymbols}
        allAssets={assets}
        onSelectAsset={(a) => setSelectedAsset(a)}
        onRemoveFromWatchlist={handleToggleWatchlist}
        onOpenSearch={() => setIsSearchOpen(true)}
        alerts={alerts}
        onRemoveAlert={handleRemoveAlert}
      />
    </div>
  );
}
