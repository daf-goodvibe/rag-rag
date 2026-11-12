import React, { useState } from 'react';
import { MarketAsset } from '../../types/market';
import { AssetLogo } from '../ui/AssetLogo';
import { Sparkline } from '../ui/Sparkline';
import {
  TrendingUp,
  TrendingDown,
  Coins,
  Search,
  Fuel,
  PieChart,
  Activity,
  Zap,
} from 'lucide-react';

interface CryptoViewProps {
  assets: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
}

export const CryptoView: React.FC<CryptoViewProps> = ({ assets, onSelectAsset }) => {
  const [filterTag, setFilterTag] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const cryptoAssets = assets.filter((a) => a.category === 'crypto');

  const filteredCryptos = cryptoAssets.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      c.symbol.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q);
    return matchesQuery;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Global Crypto Market KPI Strip */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1e222d] border border-[#2a2e39] rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
            <span>Global Market Cap</span>
            <Coins className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white mt-2">$3.38T</div>
          <div className="text-xs font-semibold font-mono text-[#089981] flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> +2.45% today
          </div>
        </div>

        <div className="bg-[#1e222d] border border-[#2a2e39] rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
            <span>24h Global Volume</span>
            <Activity className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white mt-2">$124.8B</div>
          <div className="text-xs font-semibold font-mono text-[#089981] flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" /> +14.2% from yesterday
          </div>
        </div>

        <div className="bg-[#1e222d] border border-[#2a2e39] rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
            <span>Bitcoin Dominance</span>
            <PieChart className="w-3.5 h-3.5 text-orange-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white mt-2">58.4%</div>
          <div className="text-xs text-slate-400 font-mono mt-1">
            ETH: 12.8% · SOL: 4.1%
          </div>
        </div>

        <div className="bg-[#1e222d] border border-[#2a2e39] rounded-xl p-4">
          <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
            <span>ETH Gas Price</span>
            <Fuel className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white mt-2">12 Gwei</div>
          <div className="text-xs text-emerald-400 font-mono mt-1">
            Low Congestion · ~$0.45 transfer
          </div>
        </div>
      </section>

      {/* 2. Top Coins Table */}
      <section className="bg-[#1e222d] border border-[#2a2e39] rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white tracking-tight">
              Cryptocurrency Prices by Market Cap
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              ({filteredCryptos.length} coins)
            </span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search coin..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-[#131722] border border-[#2a2e39] rounded-lg text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-[#2962ff] w-48 sm:w-60 font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2a2e39] text-slate-400 font-semibold">
                <th className="pb-3 w-8 font-normal">#</th>
                <th className="pb-3 font-normal">Name</th>
                <th className="pb-3 text-right font-normal">Price</th>
                <th className="pb-3 text-right font-normal">24h Change</th>
                <th className="pb-3 text-right font-normal hidden sm:table-cell">24h Volume</th>
                <th className="pb-3 text-right font-normal hidden md:table-cell">Market Cap</th>
                <th className="pb-3 text-right font-normal hidden lg:table-cell">Technical Rating</th>
                <th className="pb-3 text-right font-normal">Last 7 Days</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2e39]/60">
              {filteredCryptos.map((coin, index) => {
                const isPos = coin.change >= 0;
                return (
                  <tr
                    key={coin.symbol}
                    onClick={() => onSelectAsset(coin)}
                    className="hover:bg-[#131722]/80 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 text-slate-400 font-mono text-xs">{index + 1}</td>

                    <td className="py-3 pr-2">
                      <div className="flex items-center gap-3">
                        <AssetLogo symbol={coin.symbol} logoUrl={coin.logoUrl} size="md" />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-white group-hover:text-[#2962ff] transition-colors font-mono">
                              {coin.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono uppercase">
                              {coin.symbol.replace('USD', '')}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            {coin.exchange}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 text-right font-mono font-bold text-white tabular-nums">
                      ${coin.price.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: coin.price < 1 ? 4 : 2,
                      })}
                    </td>

                    <td className="py-3 text-right font-mono font-semibold tabular-nums">
                      <span
                        className={`inline-flex items-center gap-0.5 ${
                          isPos ? 'text-[#089981]' : 'text-[#f23645]'
                        }`}
                      >
                        {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isPos ? '+' : ''}
                        {coin.changePercent.toFixed(2)}%
                      </span>
                    </td>

                    <td className="py-3 text-right font-mono text-slate-300 tabular-nums hidden sm:table-cell">
                      {coin.volume}
                    </td>

                    <td className="py-3 text-right font-mono text-slate-300 tabular-nums hidden md:table-cell">
                      {coin.marketCap}
                    </td>

                    <td className="py-3 text-right font-mono hidden lg:table-cell">
                      <span
                        className={`text-[11px] font-semibold ${
                          coin.technicalRating.includes('Buy')
                            ? 'text-[#089981]'
                            : coin.technicalRating.includes('Sell')
                            ? 'text-[#f23645]'
                            : 'text-slate-400'
                        }`}
                      >
                        {coin.technicalRating}
                      </span>
                    </td>

                    <td className="py-3 text-right">
                      <div className="flex justify-end">
                        <Sparkline
                          data={coin.sparkline}
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
