import React, { useState } from 'react';
import { MarketAsset } from '../../types/market';
import { AssetLogo } from '../ui/AssetLogo';
import { Sparkline } from '../ui/Sparkline';
import {
  TrendingUp,
  TrendingDown,
  Flame,
  Zap,
  Droplet,
  Layers,
} from 'lucide-react';

interface CommoditiesViewProps {
  assets: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
}

export const CommoditiesView: React.FC<CommoditiesViewProps> = ({
  assets,
  onSelectAsset,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'all' | 'metals' | 'energy'>('all');

  const commodityAssets = assets.filter((a) => a.category === 'commodities');

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Commodities Summary Cards */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-white tracking-tight">
            Commodities & Energy Benchmarks
          </h2>
          <span className="text-xs text-slate-400 font-mono">NYMEX & COMEX Cash Contracts</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {commodityAssets.map((asset) => {
            const isPos = asset.change >= 0;
            return (
              <div
                key={asset.symbol}
                onClick={() => onSelectAsset(asset)}
                className="bg-[#1e222d] border border-[#2a2e39] hover:border-slate-600 rounded-xl p-4 transition-all hover:shadow-lg cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-[#131722] border border-[#2a2e39]">
                      {asset.exchange}
                    </span>
                    <span className="text-[11px] font-mono">{asset.technicalRating}</span>
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
                      ${asset.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
                  <Sparkline
                    data={asset.sparkline}
                    width={76}
                    height={34}
                    isPositive={isPos}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. Detailed Commodities List */}
      <section className="bg-[#1e222d] border border-[#2a2e39] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Commodities Market Quotes
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Continuous Contracts</span>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2a2e39] text-slate-400 font-semibold">
                <th className="pb-3 font-normal">Commodity</th>
                <th className="pb-3 text-right font-normal">Price</th>
                <th className="pb-3 text-right font-normal">Change</th>
                <th className="pb-3 text-right font-normal">% Change</th>
                <th className="pb-3 text-right font-normal hidden sm:table-cell">Day High</th>
                <th className="pb-3 text-right font-normal hidden sm:table-cell">Day Low</th>
                <th className="pb-3 text-right font-normal hidden md:table-cell">Signal</th>
                <th className="pb-3 text-right font-normal">24h Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2e39]/60">
              {commodityAssets.map((comm) => {
                const isPos = comm.change >= 0;
                return (
                  <tr
                    key={comm.symbol}
                    onClick={() => onSelectAsset(comm)}
                    className="hover:bg-[#131722]/80 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 pr-2">
                      <div className="flex items-center gap-3">
                        <AssetLogo symbol={comm.symbol} logoUrl={comm.logoUrl} size="md" />
                        <div>
                          <div className="font-bold text-white group-hover:text-[#2962ff] transition-colors font-mono">
                            {comm.symbol}
                          </div>
                          <div className="text-[11px] text-slate-400">{comm.name}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 text-right font-mono font-bold text-white tabular-nums">
                      ${comm.price.toFixed(2)}
                    </td>

                    <td
                      className={`py-3 text-right font-mono font-semibold tabular-nums ${
                        isPos ? 'text-[#089981]' : 'text-[#f23645]'
                      }`}
                    >
                      {isPos ? '+' : ''}
                      {comm.change.toFixed(2)}
                    </td>

                    <td className="py-3 text-right font-mono font-semibold tabular-nums">
                      <span
                        className={`inline-flex items-center gap-0.5 ${
                          isPos ? 'text-[#089981]' : 'text-[#f23645]'
                        }`}
                      >
                        {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isPos ? '+' : ''}
                        {comm.changePercent.toFixed(2)}%
                      </span>
                    </td>

                    <td className="py-3 text-right font-mono text-slate-300 tabular-nums hidden sm:table-cell">
                      ${comm.dayHigh.toFixed(2)}
                    </td>

                    <td className="py-3 text-right font-mono text-slate-300 tabular-nums hidden sm:table-cell">
                      ${comm.dayLow.toFixed(2)}
                    </td>

                    <td className="py-3 text-right font-mono hidden md:table-cell">
                      <span
                        className={`text-[11px] font-semibold ${
                          comm.technicalRating.includes('Buy')
                            ? 'text-[#089981]'
                            : comm.technicalRating.includes('Sell')
                            ? 'text-[#f23645]'
                            : 'text-slate-400'
                        }`}
                      >
                        {comm.technicalRating}
                      </span>
                    </td>

                    <td className="py-3 text-right">
                      <div className="flex justify-end">
                        <Sparkline
                          data={comm.sparkline}
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
