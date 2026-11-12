import React, { useState } from 'react';
import { MarketAsset } from '../../types/market';
import { AssetLogo } from '../ui/AssetLogo';
import { Sparkline } from '../ui/Sparkline';
import {
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  BarChart3,
  Layers,
  SlidersHorizontal,
} from 'lucide-react';

interface StocksViewProps {
  assets: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
}

export const StocksView: React.FC<StocksViewProps> = ({ assets, onSelectAsset }) => {
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'marketCap' | 'change' | 'volume' | 'price'>('marketCap');

  const indices = assets.filter((a) => a.category === 'indices');
  const stockAssets = assets.filter((a) => a.category === 'stocks');

  // Sectors calculation
  const sectors = [
    { name: 'Technology', avgChange: 2.15, count: 5, leader: 'NVDA' },
    { name: 'Communication Services', avgChange: 1.17, count: 2, leader: 'GOOGL' },
    { name: 'Consumer Cyclical', avgChange: -0.99, count: 2, leader: 'AMZN' },
    { name: 'Financials', avgChange: 0.25, count: 2, leader: 'JPM' },
    { name: 'Energy', avgChange: -0.70, count: 1, leader: 'XOM' },
    { name: 'Healthcare', avgChange: -1.95, count: 1, leader: 'LLY' },
  ];

  const filteredStocks = stockAssets
    .filter((stock) => {
      const matchSector = sectorFilter === 'all' || stock.sector === sectorFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        stock.symbol.toLowerCase().includes(q) ||
        stock.name.toLowerCase().includes(q) ||
        (stock.sector && stock.sector.toLowerCase().includes(q));
      return matchSector && matchQuery;
    })
    .sort((a, b) => {
      if (sortBy === 'marketCap') return (b.marketCapNum || 0) - (a.marketCapNum || 0);
      if (sortBy === 'change') return b.changePercent - a.changePercent;
      if (sortBy === 'volume') return (b.volumeNum || 0) - (a.volumeNum || 0);
      return b.price - a.price;
    });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Global & US Indices Cards */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-white tracking-tight">
            Major Indices & Benchmarks
          </h2>
          <span className="text-xs text-slate-400 font-mono">{indices.length} Global Indices</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {indices.map((idxAsset) => {
            const isPos = idxAsset.change >= 0;
            return (
              <div
                key={idxAsset.symbol}
                onClick={() => onSelectAsset(idxAsset)}
                className="bg-[#1e222d] border border-[#2a2e39] hover:border-slate-600 rounded-xl p-4 transition-all hover:shadow-lg cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-[#131722] border border-[#2a2e39]">
                      {idxAsset.exchange}
                    </span>
                    <span className="text-[11px] font-mono">{idxAsset.technicalRating}</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <AssetLogo symbol={idxAsset.symbol} logoUrl={idxAsset.logoUrl} size="md" />
                    <div>
                      <div className="font-bold text-sm text-white group-hover:text-[#2962ff] transition-colors font-mono">
                        {idxAsset.symbol}
                      </div>
                      <div className="text-xs text-slate-400 truncate max-w-[150px]">
                        {idxAsset.name}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <div className="text-lg font-bold font-mono text-white tabular-nums">
                      {idxAsset.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div
                      className={`text-xs font-semibold font-mono flex items-center gap-1 mt-0.5 ${
                        isPos ? 'text-[#089981]' : 'text-[#f23645]'
                      }`}
                    >
                      {isPos ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {isPos ? '+' : ''}
                      {idxAsset.change.toFixed(2)} ({isPos ? '+' : ''}
                      {idxAsset.changePercent.toFixed(2)}%)
                    </div>
                  </div>
                  <Sparkline
                    data={idxAsset.sparkline}
                    width={70}
                    height={32}
                    isPositive={isPos}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. Sector Performance Heat Bar */}
      <section className="bg-[#1e222d] border border-[#2a2e39] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#2962ff]" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              S&P 500 Sector Breakdown (1D Return)
            </h3>
          </div>
          <span className="text-xs text-slate-400">Click sector to filter list below</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {sectors.map((sec) => {
            const isPos = sec.avgChange >= 0;
            const isSelected = sectorFilter === sec.name;
            return (
              <button
                key={sec.name}
                onClick={() => setSectorFilter(isSelected ? 'all' : sec.name)}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'border-[#2962ff] bg-[#2962ff]/15'
                    : 'border-[#2a2e39] bg-[#131722] hover:bg-[#131722]/80'
                }`}
              >
                <div className="text-xs font-bold text-slate-200 truncate">{sec.name}</div>
                <div
                  className={`text-sm font-extrabold font-mono mt-1 ${
                    isPos ? 'text-[#089981]' : 'text-[#f23645]'
                  }`}
                >
                  {isPos ? '+' : ''}
                  {sec.avgChange.toFixed(2)}%
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-1 flex justify-between">
                  <span>Leader: {sec.leader}</span>
                  <span>{sec.count}</span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Stocks Table & Screener Filter */}
      <section className="bg-[#1e222d] border border-[#2a2e39] rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-bold text-white tracking-tight">
              Large Cap Equities
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              ({filteredStocks.length} assets)
            </span>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter stocks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-[#131722] border border-[#2a2e39] rounded-lg text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-[#2962ff] w-48 sm:w-56 font-medium"
              />
            </div>

            {/* Sector Selector */}
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="bg-[#131722] border border-[#2a2e39] text-xs text-slate-300 rounded-lg px-3 py-1.5 font-medium cursor-pointer"
            >
              <option value="all">All Sectors</option>
              <option value="Technology">Technology</option>
              <option value="Communication Services">Communication</option>
              <option value="Consumer Cyclical">Consumer Cyclical</option>
              <option value="Financials">Financials</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Energy">Energy</option>
            </select>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#131722] border border-[#2a2e39] text-xs text-slate-300 rounded-lg px-3 py-1.5 font-medium cursor-pointer"
            >
              <option value="marketCap">Sort: Market Cap</option>
              <option value="change">Sort: 24h Change %</option>
              <option value="volume">Sort: Volume</option>
              <option value="price">Sort: Price</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2a2e39] text-slate-400 font-semibold">
                <th className="pb-3 font-normal">Symbol / Company</th>
                <th className="pb-3 text-right font-normal">Price</th>
                <th className="pb-3 text-right font-normal">Change %</th>
                <th className="pb-3 text-right font-normal hidden sm:table-cell">Market Cap</th>
                <th className="pb-3 text-right font-normal hidden md:table-cell">P/E Ratio</th>
                <th className="pb-3 text-right font-normal hidden lg:table-cell">52W Range</th>
                <th className="pb-3 text-right font-normal hidden sm:table-cell">Signal</th>
                <th className="pb-3 text-right font-normal">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2e39]/60">
              {filteredStocks.map((stock) => {
                const isPos = stock.change >= 0;
                return (
                  <tr
                    key={stock.symbol}
                    onClick={() => onSelectAsset(stock)}
                    className="hover:bg-[#131722]/80 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 pr-2">
                      <div className="flex items-center gap-3">
                        <AssetLogo symbol={stock.symbol} logoUrl={stock.logoUrl} size="md" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white group-hover:text-[#2962ff] transition-colors font-mono">
                              {stock.symbol}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono px-1.5 py-0.2 rounded bg-[#131722] border border-[#2a2e39]">
                              {stock.exchange}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[160px]">
                            {stock.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 text-right font-mono font-bold text-white tabular-nums">
                      ${stock.price.toFixed(2)}
                    </td>

                    <td className="py-3 text-right font-mono font-semibold tabular-nums">
                      <span
                        className={`inline-flex items-center gap-0.5 ${
                          isPos ? 'text-[#089981]' : 'text-[#f23645]'
                        }`}
                      >
                        {isPos ? '+' : ''}
                        {stock.changePercent.toFixed(2)}%
                      </span>
                    </td>

                    <td className="py-3 text-right font-mono text-slate-300 tabular-nums hidden sm:table-cell">
                      {stock.marketCap}
                    </td>

                    <td className="py-3 text-right font-mono text-slate-400 tabular-nums hidden md:table-cell">
                      {stock.peRatio ? stock.peRatio.toFixed(1) : '—'}
                    </td>

                    {/* 52W Range Mini Bar */}
                    <td className="py-3 text-right hidden lg:table-cell">
                      <div className="w-24 ml-auto">
                        <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-0.5">
                          <span>${stock.yearLow.toFixed(0)}</span>
                          <span>${stock.yearHigh.toFixed(0)}</span>
                        </div>
                        <div className="h-1 bg-[#131722] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#2962ff] rounded-full"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(
                                  5,
                                  ((stock.price - stock.yearLow) /
                                    (stock.yearHigh - stock.yearLow || 1)) *
                                    100
                                )
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="py-3 text-right font-mono hidden sm:table-cell">
                      <span
                        className={`text-[11px] font-semibold ${
                          stock.technicalRating.includes('Buy')
                            ? 'text-[#089981]'
                            : stock.technicalRating.includes('Sell')
                            ? 'text-[#f23645]'
                            : 'text-slate-400'
                        }`}
                      >
                        {stock.technicalRating}
                      </span>
                    </td>

                    <td className="py-3 text-right">
                      <div className="flex justify-end">
                        <Sparkline
                          data={stock.sparkline}
                          width={64}
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
      </section>
    </div>
  );
};
