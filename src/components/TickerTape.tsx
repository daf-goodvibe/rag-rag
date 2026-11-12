import React, { useRef, useState } from 'react';
import { MarketAsset } from '../types/market';
import { Sparkline } from './ui/Sparkline';
import { AssetLogo } from './ui/AssetLogo';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';

interface TickerTapeProps {
  assets: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
  currencySymbol?: string;
  currencyRate?: number;
}

export const TickerTape: React.FC<TickerTapeProps> = ({
  assets,
  onSelectAsset,
  currencySymbol = '$',
  currencyRate = 1,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Take top assets for marquee
  const tickerAssets = assets.slice(0, 14);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -280 : 280;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const formatPrice = (price: number, symbol: string) => {
    const converted = price * currencyRate;
    if (symbol.includes('USD') && (symbol === 'EURUSD' || symbol === 'GBPUSD' || symbol === 'USDCHF')) {
      return converted.toFixed(4);
    }
    if (symbol.startsWith('US') && symbol.endsWith('Y')) {
      return `${price.toFixed(3)}%`;
    }
    if (converted >= 1000) {
      return `${currencySymbol}${converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `${currencySymbol}${converted.toFixed(2)}`;
  };

  return (
    <div className="relative group/tape bg-[#131722] dark:bg-[#131722] border-b border-[#2a2e39] text-[#d1d4dc] h-10 select-none overflow-hidden flex items-center">
      {/* Scroll Left Button */}
      <button
        onClick={() => scroll('left')}
        aria-label="Scroll ticker left"
        className="absolute left-0 top-0 bottom-0 z-20 px-1.5 bg-[#131722]/90 hover:bg-[#1e222d] text-slate-400 hover:text-white border-r border-[#2a2e39] flex items-center transition-colors opacity-0 group-hover/tape:opacity-100 backdrop-blur-xs"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Marquee Container */}
      <div
        ref={scrollRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="flex items-center overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap divide-x divide-[#2a2e39]/60 px-2"
        style={{ animationPlayState: isPaused ? 'paused' : 'running' }}
      >
        {/* Render twice for seamless continuous scroll feeling */}
        {[...tickerAssets, ...tickerAssets].map((asset, idx) => {
          const isPos = asset.change >= 0;
          return (
            <button
              key={`${asset.symbol}-${idx}`}
              onClick={() => onSelectAsset(asset)}
              className="flex items-center gap-2.5 px-3 py-1 hover:bg-[#1e222d] transition-colors shrink-0 group text-left cursor-pointer"
            >
              <AssetLogo symbol={asset.symbol} logoUrl={asset.logoUrl} size="sm" />
              
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-xs text-white group-hover:text-[#2962ff] transition-colors">
                    {asset.symbol}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                    {asset.exchange}
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-end font-mono">
                <span className="text-xs font-semibold tabular-nums text-slate-100">
                  {formatPrice(asset.price, asset.symbol)}
                </span>
                <span
                  className={`text-[10px] tabular-nums font-medium flex items-center gap-0.5 ${
                    isPos ? 'text-[#089981]' : 'text-[#f23645]'
                  }`}
                >
                  {isPos ? (
                    <TrendingUp className="w-2.5 h-2.5" />
                  ) : (
                    <TrendingDown className="w-2.5 h-2.5" />
                  )}
                  {isPos ? '+' : ''}
                  {asset.changePercent.toFixed(2)}%
                </span>
              </div>

              {/* Sparkline */}
              <div className="hidden lg:block pl-1">
                <Sparkline
                  data={asset.sparkline}
                  width={46}
                  height={18}
                  isPositive={isPos}
                  fillOpacity={0.2}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Scroll Right Button */}
      <button
        onClick={() => scroll('right')}
        aria-label="Scroll ticker right"
        className="absolute right-0 top-0 bottom-0 z-20 px-1.5 bg-[#131722]/90 hover:bg-[#1e222d] text-slate-400 hover:text-white border-l border-[#2a2e39] flex items-center transition-colors opacity-0 group-hover/tape:opacity-100 backdrop-blur-xs"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
