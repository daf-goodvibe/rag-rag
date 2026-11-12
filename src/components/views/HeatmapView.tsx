import React, { useState } from 'react';
import { S_AND_P_HEATMAP_DATA, CRYPTO_HEATMAP_DATA } from '../../data/marketsData';
import { MarketAsset, HeatmapItem } from '../../types/market';
import {
  Layers,
  Coins,
  TrendingUp,
  TrendingDown,
  Info,
  Maximize2,
} from 'lucide-react';

interface HeatmapViewProps {
  assets: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
}

export const HeatmapView: React.FC<HeatmapViewProps> = ({
  assets,
  onSelectAsset,
}) => {
  const [heatmapMode, setHeatmapMode] = useState<'sp500' | 'crypto'>('sp500');
  const [period, setPeriod] = useState<'1D' | '1W' | '1M' | 'YTD'>('1D');
  const [hoveredItem, setHoveredItem] = useState<HeatmapItem | null>(null);

  const currentSectors = heatmapMode === 'sp500' ? S_AND_P_HEATMAP_DATA : CRYPTO_HEATMAP_DATA;

  // Multiplier for periods
  const periodMultiplier: Record<string, number> = {
    '1D': 1,
    '1W': 2.4,
    '1M': 4.8,
    'YTD': 12.2,
  };

  const getTileColor = (baseChange: number) => {
    const change = baseChange * (periodMultiplier[period] || 1);
    if (change >= 4.0) return 'bg-[#089981] text-white hover:brightness-110';
    if (change >= 1.5) return 'bg-[#00b894] text-white hover:brightness-110';
    if (change > 0) return 'bg-[#00b894]/80 text-white hover:brightness-110';
    if (change === 0) return 'bg-[#555a68] text-slate-200 hover:brightness-110';
    if (change > -1.5) return 'bg-[#f77c80]/80 text-white hover:brightness-110';
    if (change > -4.0) return 'bg-[#f23645] text-white hover:brightness-110';
    return 'bg-[#d82c3b] text-white hover:brightness-110';
  };

  const handleTileClick = (item: HeatmapItem) => {
    // Find matching asset or construct temporary asset
    const symbolToFind = heatmapMode === 'crypto' && !item.symbol.endsWith('USD') ? `${item.symbol}USD` : item.symbol;
    const found = assets.find((a) => a.symbol === symbolToFind || a.symbol === item.symbol);
    if (found) {
      onSelectAsset(found);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Heatmap Control Bar */}
      <div className="bg-[#1e222d] border border-[#2a2e39] rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        {/* Mode Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#131722] p-1 rounded-lg border border-[#2a2e39] text-xs font-semibold">
            <button
              onClick={() => setHeatmapMode('sp500')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                heatmapMode === 'sp500'
                  ? 'bg-[#2962ff] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>S&P 500 Stocks</span>
            </button>
            <button
              onClick={() => setHeatmapMode('crypto')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                heatmapMode === 'crypto'
                  ? 'bg-[#2962ff] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Crypto Ecosystem</span>
            </button>
          </div>
        </div>

        {/* Period Filter (1D, 1W, 1M, YTD) */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400 font-medium">Performance Period:</span>
          <div className="flex items-center bg-[#131722] p-1 rounded-lg border border-[#2a2e39] text-xs font-semibold">
            {(['1D', '1W', '1M', 'YTD'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  period === p
                    ? 'bg-[#2a2e39] text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Color Legend Scale */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">-3%</span>
          <div className="flex h-3 w-36 rounded-sm overflow-hidden">
            <div className="w-1/5 bg-[#d82c3b]" />
            <div className="w-1/5 bg-[#f77c80]/80" />
            <div className="w-1/5 bg-[#555a68]" />
            <div className="w-1/5 bg-[#00b894]/80" />
            <div className="w-1/5 bg-[#089981]" />
          </div>
          <span className="text-slate-400">+3%</span>
        </div>
      </div>

      {/* Main Treemap Visualization Grid */}
      <div className="space-y-4">
        {currentSectors.map((sector) => {
          const totalSectorCap = sector.items.reduce((acc, it) => acc + it.marketCap, 0);

          return (
            <div
              key={sector.name}
              className="bg-[#1e222d] border border-[#2a2e39] rounded-xl p-4 overflow-hidden"
            >
              {/* Sector Title Bar */}
              <div className="flex items-center justify-between mb-3 border-b border-[#2a2e39] pb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    {sector.name}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    ${(totalSectorCap / 1000000000000).toFixed(2)}T Cap
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {sector.items.length} Assets
                </span>
              </div>

              {/* Dynamic Tile Sizing Layout */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {sector.items.map((item) => {
                  const effectiveChange = item.changePercent * (periodMultiplier[period] || 1);
                  const isPos = effectiveChange >= 0;
                  const isLarge = item.marketCap > 1000000000000; // Mega cap gets 2 cols if on larger screens
                  const tileClass = getTileColor(item.changePercent);

                  return (
                    <div
                      key={item.symbol}
                      onClick={() => handleTileClick(item)}
                      onMouseEnter={() => setHoveredItem(item)}
                      onMouseLeave={() => setHoveredItem(null)}
                      className={`${tileClass} ${
                        isLarge ? 'sm:col-span-2' : ''
                      } p-3.5 rounded-lg flex flex-col justify-between h-28 cursor-pointer transition-all duration-150 shadow-xs relative group select-none`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-extrabold text-base font-mono tracking-tight">
                            {item.symbol}
                          </div>
                          <div className="text-[11px] opacity-85 truncate max-w-[120px]">
                            {item.name}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono opacity-80">
                          ${(item.marketCap / 1000000000000).toFixed(2)}T
                        </span>
                      </div>

                      <div className="flex items-end justify-between font-mono">
                        <span className="text-xs font-medium opacity-90">
                          ${item.price.toFixed(2)}
                        </span>
                        <span className="text-base font-extrabold tracking-tight">
                          {isPos ? '+' : ''}
                          {effectiveChange.toFixed(2)}%
                        </span>
                      </div>

                      {/* Tooltip on hover */}
                      <div className="absolute inset-0 bg-black/85 rounded-lg p-2.5 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between pointer-events-none z-10 text-white font-mono text-xs">
                        <div className="flex justify-between items-center border-b border-white/20 pb-1">
                          <span className="font-bold">{item.symbol}</span>
                          <span className="text-[10px] text-slate-300">{item.sector}</span>
                        </div>
                        <div className="text-[11px] space-y-0.5">
                          <div>Price: ${item.price.toFixed(2)}</div>
                          <div className={isPos ? 'text-[#089981]' : 'text-[#f23645]'}>
                            {period} Return: {isPos ? '+' : ''}
                            {effectiveChange.toFixed(2)}%
                          </div>
                        </div>
                        <div className="text-[10px] text-blue-400 text-right">Click for Chart ↗</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
