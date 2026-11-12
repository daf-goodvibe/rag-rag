import React, { useState } from 'react';
import { MarketAsset } from '../../types/market';
import { AssetLogo } from '../ui/AssetLogo';
import { Sparkline } from '../ui/Sparkline';
import {
  TrendingUp,
  TrendingDown,
  Globe,
  Clock,
  ArrowRightLeft,
  SlidersHorizontal,
} from 'lucide-react';

interface ForexViewProps {
  assets: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
}

export const ForexView: React.FC<ForexViewProps> = ({ assets, onSelectAsset }) => {
  const forexAssets = assets.filter((a) => a.category === 'forex');

  // Matrix of cross rates
  const currencies = ['USD', 'EUR', 'GBP', 'JPY', 'CHF'];
  const crossRates: Record<string, Record<string, { rate: string; change: number }>> = {
    USD: {
      USD: { rate: '1.0000', change: 0 },
      EUR: { rate: '0.9485', change: 0.26 },
      GBP: { rate: '0.7883', change: -0.28 },
      JPY: { rate: '154.65', change: 0.38 },
      CHF: { rate: '0.8845', change: -0.14 },
    },
    EUR: {
      USD: { rate: '1.0542', change: -0.26 },
      EUR: { rate: '1.0000', change: 0 },
      GBP: { rate: '0.8311', change: -0.54 },
      JPY: { rate: '163.03', change: 0.12 },
      CHF: { rate: '0.9324', change: -0.40 },
    },
    GBP: {
      USD: { rate: '1.2685', change: 0.28 },
      EUR: { rate: '1.2032', change: 0.54 },
      GBP: { rate: '1.0000', change: 0 },
      JPY: { rate: '196.17', change: 0.66 },
      CHF: { rate: '1.1219', change: 0.14 },
    },
    JPY: {
      USD: { rate: '0.0064', change: -0.38 },
      EUR: { rate: '0.0061', change: -0.12 },
      GBP: { rate: '0.0051', change: -0.66 },
      JPY: { rate: '1.0000', change: 0 },
      CHF: { rate: '0.0057', change: -0.52 },
    },
    CHF: {
      USD: { rate: '1.1305', change: 0.14 },
      EUR: { rate: '1.0725', change: 0.40 },
      GBP: { rate: '0.8913', change: -0.14 },
      JPY: { rate: '174.84', change: 0.52 },
      CHF: { rate: '1.0000', change: 0 },
    },
  };

  // Global Trading Sessions (UTC)
  const sessions = [
    { city: 'Sydney', hours: '22:00 - 07:00 UTC', status: 'Closed', active: false },
    { city: 'Tokyo', hours: '00:00 - 09:00 UTC', status: 'Open', active: true },
    { city: 'London', hours: '08:00 - 17:00 UTC', status: 'Open', active: true },
    { city: 'New York', hours: '13:00 - 22:00 UTC', status: 'Pre-Market', active: false },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Global Forex Sessions Strip */}
      <section className="bg-[#1e222d] border border-[#2a2e39] rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#2962ff]" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              World Forex Trading Sessions
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">24-Hour OTC Market</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {sessions.map((sess) => (
            <div
              key={sess.city}
              className={`p-3 rounded-lg border text-xs ${
                sess.active
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-[#131722] border-[#2a2e39]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">{sess.city}</span>
                <span
                  className={`text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded ${
                    sess.active
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-slate-700/30 text-slate-400'
                  }`}
                >
                  {sess.status}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono mt-1">{sess.hours}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Major Forex Pairs Table */}
      <section className="bg-[#1e222d] border border-[#2a2e39] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Major Currency Pairs
            </h2>
            <p className="text-xs text-slate-400">
              Real-time spot exchange rates, pip spreads, and technical signals
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">{forexAssets.length} Pairs</span>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2a2e39] text-slate-400 font-semibold">
                <th className="pb-3 font-normal">Currency Pair</th>
                <th className="pb-3 text-right font-normal">Bid / Spot</th>
                <th className="pb-3 text-right font-normal">Pip Change</th>
                <th className="pb-3 text-right font-normal">% Change</th>
                <th className="pb-3 text-right font-normal hidden sm:table-cell">Day High</th>
                <th className="pb-3 text-right font-normal hidden sm:table-cell">Day Low</th>
                <th className="pb-3 text-right font-normal hidden md:table-cell">Signal</th>
                <th className="pb-3 text-right font-normal">24h Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2e39]/60">
              {forexAssets.map((pair) => {
                const isPos = pair.change >= 0;
                const pips = (pair.change * 10000).toFixed(1);
                return (
                  <tr
                    key={pair.symbol}
                    onClick={() => onSelectAsset(pair)}
                    className="hover:bg-[#131722]/80 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 pr-2">
                      <div className="flex items-center gap-3">
                        <AssetLogo symbol={pair.symbol} logoUrl={pair.logoUrl} size="md" />
                        <div>
                          <div className="font-bold text-white group-hover:text-[#2962ff] transition-colors font-mono">
                            {pair.symbol.slice(0, 3)} / {pair.symbol.slice(3)}
                          </div>
                          <div className="text-[11px] text-slate-400">{pair.name}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 text-right font-mono font-bold text-white tabular-nums">
                      {pair.price.toFixed(4)}
                    </td>

                    <td
                      className={`py-3 text-right font-mono font-semibold tabular-nums ${
                        isPos ? 'text-[#089981]' : 'text-[#f23645]'
                      }`}
                    >
                      {isPos ? '+' : ''}
                      {pips} pips
                    </td>

                    <td className="py-3 text-right font-mono font-semibold tabular-nums">
                      <span
                        className={`inline-flex items-center gap-0.5 ${
                          isPos ? 'text-[#089981]' : 'text-[#f23645]'
                        }`}
                      >
                        {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isPos ? '+' : ''}
                        {pair.changePercent.toFixed(2)}%
                      </span>
                    </td>

                    <td className="py-3 text-right font-mono text-slate-300 tabular-nums hidden sm:table-cell">
                      {pair.dayHigh.toFixed(4)}
                    </td>

                    <td className="py-3 text-right font-mono text-slate-300 tabular-nums hidden sm:table-cell">
                      {pair.dayLow.toFixed(4)}
                    </td>

                    <td className="py-3 text-right font-mono hidden md:table-cell">
                      <span
                        className={`text-[11px] font-semibold ${
                          pair.technicalRating.includes('Buy')
                            ? 'text-[#089981]'
                            : pair.technicalRating.includes('Sell')
                            ? 'text-[#f23645]'
                            : 'text-slate-400'
                        }`}
                      >
                        {pair.technicalRating}
                      </span>
                    </td>

                    <td className="py-3 text-right">
                      <div className="flex justify-end">
                        <Sparkline
                          data={pair.sparkline}
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

      {/* 3. TradingView Iconic Cross Rates Matrix */}
      <section className="bg-[#1e222d] border border-[#2a2e39] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-[#2962ff]" />
            <h3 className="text-sm font-bold text-white tracking-tight">
              Cross-Rates Matrix
            </h3>
          </div>
          <span className="text-xs text-slate-400">Row Base / Column Quote</span>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-center text-xs border border-[#2a2e39]">
            <thead>
              <tr className="bg-[#131722] border-b border-[#2a2e39] text-slate-400 font-mono">
                <th className="p-3 text-left font-bold text-white">Base \ Quote</th>
                {currencies.map((c) => (
                  <th key={c} className="p-3 font-bold text-white">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2e39]/60 font-mono">
              {currencies.map((rowCurr) => (
                <tr key={rowCurr} className="hover:bg-[#131722]/50">
                  <td className="p-3 text-left font-bold text-white bg-[#131722]/40">
                    {rowCurr}
                  </td>
                  {currencies.map((colCurr) => {
                    const data = crossRates[rowCurr]?.[colCurr] || { rate: '1.0000', change: 0 };
                    const isSelf = rowCurr === colCurr;
                    const isPos = data.change >= 0;

                    if (isSelf) {
                      return (
                        <td key={colCurr} className="p-3 text-slate-400 bg-[#131722]/20 font-medium">
                          1.0000
                        </td>
                      );
                    }

                    return (
                      <td key={colCurr} className="p-3">
                        <div className="font-bold text-slate-100">{data.rate}</div>
                        <div
                          className={`text-[10px] mt-0.5 ${
                            isPos ? 'text-[#089981]' : 'text-[#f23645]'
                          }`}
                        >
                          {isPos ? '+' : ''}
                          {data.change.toFixed(2)}%
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
