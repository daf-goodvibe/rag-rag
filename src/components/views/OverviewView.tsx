import React, { useState } from 'react';
import { MarketAsset, NewsItem, EconomicEvent } from '../../types/market';
import { Sparkline } from '../ui/Sparkline';
import { AssetLogo } from '../ui/AssetLogo';
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Flame,
  Globe2,
  Calendar,
  Newspaper,
  Compass,
  Layers,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface OverviewViewProps {
  assets: MarketAsset[];
  news: NewsItem[];
  economicEvents: EconomicEvent[];
  onSelectAsset: (asset: MarketAsset) => void;
  onNavigateToTab: (tab: any) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  assets,
  news,
  economicEvents,
  onSelectAsset,
  onNavigateToTab,
}) => {
  const [moversTab, setMoversTab] = useState<'gainers' | 'losers' | 'active'>('gainers');
  const [newsFilter, setNewsFilter] = useState<'all' | 'crypto' | 'stocks'>('all');

  // Key asset highlights
  const spx = assets.find((a) => a.symbol === 'SPX') || assets[0];
  const btc = assets.find((a) => a.symbol === 'BTCUSD') || assets[13];
  const gold = assets.find((a) => a.symbol === 'XAUUSD') || assets[20];
  const eurusd = assets.find((a) => a.symbol === 'EURUSD') || assets[16];

  // Sorting Movers
  const gainers = [...assets]
    .filter((a) => a.category === 'stocks' || a.category === 'crypto')
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, 6);

  const losers = [...assets]
    .filter((a) => a.category === 'stocks' || a.category === 'crypto')
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, 6);

  const mostActive = [...assets]
    .filter((a) => a.category === 'stocks' || a.category === 'crypto')
    .sort((a, b) => (b.volumeNum || 0) - (a.volumeNum || 0))
    .slice(0, 6);

  const currentMovers = moversTab === 'gainers' ? gainers : moversTab === 'losers' ? losers : mostActive;

  const filteredNews = news.filter((item) => {
    if (newsFilter === 'crypto') return item.relatedSymbols.some((s) => s.includes('USD') || s === 'BTCUSD');
    if (newsFilter === 'stocks') return item.relatedSymbols.some((s) => !s.includes('USD') || s === 'SPX');
    return true;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Supercharts PRO Quick Launch Banner */}
      <div className="bg-gradient-to-r from-[#1e222d] via-[#1a233a] to-[#1e222d] border border-[#2962ff]/40 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#2962ff] to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md">
            <span className="font-extrabold text-xs tracking-wider">PRO</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-tight">
                TradingView Supercharts PRO Terminal
              </h2>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px]">
                Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Multi-chart split screens (1x1, 2x1, 2x2), Level 2 Order Book DOM, Time & Sales, and Strategy Backtester.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateToTab('supercharts')}
          className="px-4 py-2 rounded-lg bg-[#2962ff] hover:bg-blue-600 text-white font-bold text-xs transition-colors flex items-center gap-2 shrink-0 cursor-pointer shadow-md"
        >
          <span>Launch Supercharts PRO</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 1. Markets at a Glance - 4-Column Strip */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-tight">
              Markets at a Glance
            </h2>
            <span className="text-xs text-slate-400">· Live Global Indices</span>
          </div>
          <button
            onClick={() => onNavigateToTab('stocks')}
            className="text-xs font-semibold text-[#2962ff] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All Indices</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'US Equities', asset: spx, tab: 'stocks' },
            { label: 'Cryptocurrency', asset: btc, tab: 'crypto' },
            { label: 'Precious Metals', asset: gold, tab: 'commodities' },
            { label: 'Foreign Exchange', asset: eurusd, tab: 'forex' },
          ].map(({ label, asset, tab }) => {
            const isPos = asset.change >= 0;
            return (
              <div
                key={asset.symbol}
                onClick={() => onSelectAsset(asset)}
                className="bg-[#1e222d] border border-[#2a2e39] hover:border-slate-600 rounded-xl p-4 transition-all hover:shadow-lg cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="font-medium">{label}</span>
                    <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-[#131722] border border-[#2a2e39]">
                      {asset.exchange}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <AssetLogo symbol={asset.symbol} logoUrl={asset.logoUrl} size="md" />
                    <div>
                      <div className="font-bold text-sm text-white group-hover:text-[#2962ff] transition-colors font-mono">
                        {asset.symbol}
                      </div>
                      <div className="text-xs text-slate-400 truncate max-w-[150px]">
                        {asset.name}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <div className="text-xl font-bold font-mono text-white tabular-nums">
                      ${asset.price.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: asset.symbol === 'EURUSD' ? 4 : 2,
                      })}
                    </div>
                    <div
                      className={`text-xs font-semibold font-mono flex items-center gap-1 mt-0.5 ${
                        isPos ? 'text-[#089981]' : 'text-[#f23645]'
                      }`}
                    >
                      {isPos ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {isPos ? '+' : ''}
                      {asset.change.toFixed(2)} ({isPos ? '+' : ''}
                      {asset.changePercent.toFixed(2)}%)
                    </div>
                  </div>

                  {/* Sparkline Area */}
                  <Sparkline
                    data={asset.sparkline}
                    width={80}
                    height={36}
                    isPositive={isPos}
                    fillOpacity={0.25}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. Middle Row: Today's Biggest Movers + Market Sentiment Gauge */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Movers Table (2 Columns wide on desktop) */}
        <div className="lg:col-span-2 bg-[#1e222d] border border-[#2a2e39] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Today's Biggest Movers
                </h3>
              </div>

              {/* Segmented Movers Tabs */}
              <div className="flex items-center p-0.5 bg-[#131722] rounded-lg border border-[#2a2e39] text-xs">
                <button
                  onClick={() => setMoversTab('gainers')}
                  className={`px-3 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                    moversTab === 'gainers'
                      ? 'bg-[#089981] text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Top Gainers
                </button>
                <button
                  onClick={() => setMoversTab('losers')}
                  className={`px-3 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                    moversTab === 'losers'
                      ? 'bg-[#f23645] text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Top Losers
                </button>
                <button
                  onClick={() => setMoversTab('active')}
                  className={`px-3 py-1 font-semibold rounded-md transition-colors cursor-pointer ${
                    moversTab === 'active'
                      ? 'bg-[#2962ff] text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Most Active
                </button>
              </div>
            </div>

            {/* Movers Table */}
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#2a2e39] text-slate-400 font-semibold">
                    <th className="pb-2.5 font-normal">Asset</th>
                    <th className="pb-2.5 text-right font-normal">Price</th>
                    <th className="pb-2.5 text-right font-normal">Change %</th>
                    <th className="pb-2.5 text-right font-normal hidden sm:table-cell">Volume</th>
                    <th className="pb-2.5 text-right font-normal hidden md:table-cell">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2e39]/60">
                  {currentMovers.map((asset) => {
                    const isPos = asset.change >= 0;
                    return (
                      <tr
                        key={asset.symbol}
                        onClick={() => onSelectAsset(asset)}
                        className="hover:bg-[#131722]/60 cursor-pointer transition-colors group"
                      >
                        <td className="py-2.5 pr-2">
                          <div className="flex items-center gap-2.5">
                            <AssetLogo symbol={asset.symbol} logoUrl={asset.logoUrl} size="sm" />
                            <div>
                              <div className="font-bold text-white group-hover:text-[#2962ff] transition-colors font-mono">
                                {asset.symbol}
                              </div>
                              <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                                {asset.name}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 text-right font-mono font-bold text-white tabular-nums">
                          ${asset.price.toLocaleString('en-US', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="py-2.5 text-right font-mono font-semibold tabular-nums">
                          <span
                            className={`inline-flex items-center gap-0.5 ${
                              isPos ? 'text-[#089981]' : 'text-[#f23645]'
                            }`}
                          >
                            {isPos ? '+' : ''}
                            {asset.changePercent.toFixed(2)}%
                          </span>
                        </td>
                        <td className="py-2.5 text-right font-mono text-slate-400 tabular-nums hidden sm:table-cell">
                          {asset.volume}
                        </td>
                        <td className="py-2.5 text-right hidden md:table-cell">
                          <div className="flex justify-end">
                            <Sparkline
                              data={asset.sparkline}
                              width={60}
                              height={22}
                              isPositive={isPos}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-3 border-t border-[#2a2e39] flex justify-end">
            <button
              onClick={() => onNavigateToTab('screener')}
              className="text-xs font-semibold text-[#2962ff] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Explore Full Financial Screener</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Market Sentiment & Fear & Greed Card */}
        <div className="bg-[#1e222d] border border-[#2a2e39] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#2962ff]" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Market Sentiment Index
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">Updated 10m ago</span>
            </div>

            {/* Fear & Greed Visual Gauge */}
            <div className="p-4 bg-[#131722] rounded-xl border border-[#2a2e39] text-center mt-2">
              <div className="text-3xl font-extrabold font-mono text-emerald-400 tracking-tight">
                68
              </div>
              <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider mt-0.5">
                Greed
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Investors showing strong upside risk appetite in tech and crypto assets.
              </div>

              {/* Multi-segment Spectrum Bar */}
              <div className="mt-4 space-y-1">
                <div className="h-2 w-full rounded-full flex overflow-hidden">
                  <div className="h-full w-1/5 bg-[#f23645]" title="Extreme Fear" />
                  <div className="h-full w-1/5 bg-amber-600" title="Fear" />
                  <div className="h-full w-1/5 bg-slate-500" title="Neutral" />
                  <div className="h-full w-1/5 bg-emerald-600" title="Greed" />
                  <div className="h-full w-1/5 bg-[#089981]" title="Extreme Greed" />
                </div>
                {/* Pointer indicator marker */}
                <div className="flex justify-between text-[10px] text-slate-400 font-mono pt-1">
                  <span>Extreme Fear</span>
                  <span>Neutral</span>
                  <span className="text-emerald-400 font-bold">Greed (68)</span>
                </div>
              </div>
            </div>

            {/* Historical Sentiment Benchmarks */}
            <div className="mt-4 space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-400 py-1 border-b border-[#2a2e39]/50">
                <span>Previous Close</span>
                <span className="text-slate-200">65 (Greed)</span>
              </div>
              <div className="flex justify-between text-slate-400 py-1 border-b border-[#2a2e39]/50">
                <span>1 Week Ago</span>
                <span className="text-slate-200">58 (Neutral)</span>
              </div>
              <div className="flex justify-between text-slate-400 py-1">
                <span>1 Month Ago</span>
                <span className="text-slate-200">49 (Neutral)</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#2a2e39] text-[11px] text-slate-400 flex items-center justify-between">
            <span>Macro VIX: <strong className="text-slate-200 font-mono">14.28 (-2.1%)</strong></span>
            <span className="text-emerald-400">Low Volatility</span>
          </div>
        </div>
      </section>

      {/* 3. Heatmap Teaser Section */}
      <section className="bg-[#1e222d] border border-[#2a2e39] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#2962ff]" />
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                S&P 500 Sector Performance Heatmap
              </h3>
              <p className="text-xs text-slate-400">
                Tile geometry sized by Market Capitalization · Color intensity by 24h Price Change
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateToTab('heatmap')}
            className="px-3 py-1.5 rounded-lg bg-[#2962ff] hover:bg-blue-600 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>Full Heatmap View</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mini Interactive Heatmap Preview */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {[
            { sym: 'NVDA', name: 'Nvidia', change: 3.23, price: 147.20, cap: '$3.62T' },
            { sym: 'AAPL', name: 'Apple', change: 0.82, price: 228.45, cap: '$3.45T' },
            { sym: 'MSFT', name: 'Microsoft', change: 0.50, price: 422.80, cap: '$3.14T' },
            { sym: 'GOOGL', name: 'Alphabet', change: 1.34, price: 181.30, cap: '$2.24T' },
            { sym: 'AMZN', name: 'Amazon', change: 1.54, price: 210.50, cap: '$2.19T' },
            { sym: 'META', name: 'Meta', change: 1.00, price: 588.60, cap: '$1.49T' },
            { sym: 'TSLA', name: 'Tesla', change: -3.53, price: 338.50, cap: '$1.08T' },
            { sym: 'BRK.B', name: 'Berkshire', change: -0.28, price: 468.20, cap: '$1.01T' },
            { sym: 'LLY', name: 'Eli Lilly', change: -1.95, price: 815.40, cap: '$774B' },
            { sym: 'JPM', name: 'JPMorgan', change: 0.79, price: 242.60, cap: '$692B' },
            { sym: 'PLTR', name: 'Palantir', change: 5.62, price: 64.80, cap: '$147B' },
            { sym: 'AMD', name: 'AMD', change: 2.87, price: 139.80, cap: '$226B' },
          ].map((item) => {
            const isPos = item.change >= 0;
            const targetAsset = assets.find((a) => a.symbol === item.sym);
            const bgColor = isPos
              ? item.change > 2.5
                ? 'bg-[#089981]'
                : 'bg-[#089981]/80'
              : item.change < -2
              ? 'bg-[#f23645]'
              : 'bg-[#f23645]/80';

            return (
              <div
                key={item.sym}
                onClick={() => targetAsset && onSelectAsset(targetAsset)}
                className={`${bgColor} text-white p-3 rounded-lg flex flex-col justify-between h-24 hover:scale-[1.02] transition-transform cursor-pointer shadow-xs`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-bold text-sm font-mono">{item.sym}</span>
                  <span className="text-[10px] opacity-80 font-mono">{item.cap}</span>
                </div>
                <div>
                  <div className="text-xs font-mono font-medium opacity-90">
                    ${item.price.toFixed(2)}
                  </div>
                  <div className="text-sm font-extrabold font-mono">
                    {isPos ? '+' : ''}
                    {item.change.toFixed(2)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Bottom Row: Curated Market News & Economic Calendar */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Curated Market Wire News */}
        <div className="bg-[#1e222d] border border-[#2a2e39] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-[#2962ff]" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Live Financial News Wire
                </h3>
              </div>

              {/* News Category Tabs */}
              <div className="flex items-center gap-1 text-[11px]">
                {(['all', 'stocks', 'crypto'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setNewsFilter(filter)}
                    className={`px-2 py-0.5 rounded capitalize transition-colors cursor-pointer ${
                      newsFilter === filter
                        ? 'bg-[#2962ff] text-white font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3.5">
              {filteredNews.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-[#131722]/60 hover:bg-[#131722] rounded-lg border border-[#2a2e39]/60 transition-colors"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                    <span className="font-semibold text-[#2962ff]">{item.source}</span>
                    <span>{item.timeAgo}</span>
                  </div>
                  <h4 className="text-xs font-bold text-white hover:text-[#2962ff] transition-colors cursor-pointer">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {item.summary}
                  </p>
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#2a2e39]/40">
                    <span className="text-[10px] text-slate-400 font-mono">Related:</span>
                    {item.relatedSymbols.map((sym) => {
                      const matched = assets.find((a) => a.symbol === sym);
                      return (
                        <button
                          key={sym}
                          onClick={() => matched && onSelectAsset(matched)}
                          className="px-1.5 py-0.2 rounded bg-[#1e222d] hover:bg-[#2a2e39] text-[10px] font-mono text-slate-300 border border-[#2a2e39] transition-colors"
                        >
                          {sym}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Real-Time Macro Economic Calendar */}
        <div className="bg-[#1e222d] border border-[#2a2e39] rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Economic Calendar & Releases
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">All times EST</span>
            </div>

            <div className="divide-y divide-[#2a2e39]/60">
              {economicEvents.map((evt) => (
                <div key={evt.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="text-[11px] font-mono text-slate-400 shrink-0 w-16">
                      {evt.time}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-white truncate">{evt.event}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-mono uppercase tracking-wider ${
                            evt.impact === 'high'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : evt.impact === 'medium'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-700/30 text-slate-400'
                          }`}
                        >
                          {evt.impact}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {evt.country} ({evt.countryCode})
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-right font-mono shrink-0">
                    {evt.actual && (
                      <div>
                        <div className="text-[10px] text-slate-400">Actual</div>
                        <div className="font-bold text-emerald-400">{evt.actual}</div>
                      </div>
                    )}
                    {evt.forecast && (
                      <div>
                        <div className="text-[10px] text-slate-400">Forecast</div>
                        <div className="text-slate-300">{evt.forecast}</div>
                      </div>
                    )}
                    {evt.previous && (
                      <div className="hidden sm:block">
                        <div className="text-[10px] text-slate-400">Previous</div>
                        <div className="text-slate-400">{evt.previous}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#2a2e39] text-[11px] text-slate-400 flex items-center justify-between">
            <span>Next Major Risk Event: US Initial Jobless Claims (Tomorrow 08:30)</span>
          </div>
        </div>
      </section>
    </div>
  );
};
