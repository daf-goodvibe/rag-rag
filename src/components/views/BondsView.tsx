import React from 'react';
import { MarketAsset } from '../../types/market';
import { Sparkline } from '../ui/Sparkline';
import { TrendingUp, TrendingDown, Percent, GitCommit } from 'lucide-react';

interface BondsViewProps {
  assets: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
}

export const BondsView: React.FC<BondsViewProps> = ({ assets, onSelectAsset }) => {
  const bondAssets = assets.filter((a) => a.category === 'bonds');

  // US Treasury Yield Curve points
  const yieldCurvePoints = [
    { maturity: '1M', yield: 4.54, prevMonth: 4.65 },
    { maturity: '3M', yield: 4.52, prevMonth: 4.61 },
    { maturity: '6M', yield: 4.48, prevMonth: 4.55 },
    { maturity: '1Y', yield: 4.38, prevMonth: 4.42 },
    { maturity: '2Y', yield: 4.295, prevMonth: 4.22 },
    { maturity: '5Y', yield: 4.34, prevMonth: 4.25 },
    { maturity: '10Y', yield: 4.418, prevMonth: 4.35 },
    { maturity: '20Y', yield: 4.65, prevMonth: 4.58 },
    { maturity: '30Y', yield: 4.592, prevMonth: 4.52 },
  ];

  const spread10y2y = 4.418 - 4.295; // positive = normal, negative = inverted

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. US Treasury Yield Curve Interactive Visualizer */}
      <section className="bg-[#1e222d] border border-[#2a2e39] rounded-xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-[#2962ff]" />
              <h2 className="text-base font-bold text-white tracking-tight">
                US Treasury Yield Curve
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Current curve (Blue) vs 1-Month Ago Benchmark (Gray)
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-2 bg-[#131722] px-3 py-1.5 rounded-lg border border-[#2a2e39]">
              <span className="text-slate-400">10Y - 2Y Spread:</span>
              <span className="font-bold text-emerald-400">
                +{spread10y2y.toFixed(3)}% (+{(spread10y2y * 100).toFixed(1)} bps)
              </span>
              <span className="text-[10px] text-slate-400 font-sans">(Normal / Un-inverted)</span>
            </div>
          </div>
        </div>

        {/* SVG Yield Curve Chart */}
        <div className="w-full h-64 relative bg-[#131722] rounded-lg p-4 border border-[#2a2e39]">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 900 200"
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            {/* Grid horizontal lines */}
            {[4.0, 4.2, 4.4, 4.6, 4.8].map((val) => {
              const y = 180 - ((val - 3.8) / 1.2) * 160;
              return (
                <g key={val}>
                  <line
                    x1="40"
                    y1={y}
                    x2="880"
                    y2={y}
                    stroke="#2a2e39"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x="10"
                    y={y + 4}
                    fill="#787b86"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {val.toFixed(1)}%
                  </text>
                </g>
              );
            })}

            {/* Previous Month Curve (Gray dashed) */}
            {(() => {
              const pts = yieldCurvePoints.map((pt, i) => {
                const x = 60 + (i / (yieldCurvePoints.length - 1)) * 800;
                const y = 180 - ((pt.prevMonth - 3.8) / 1.2) * 160;
                return `${x.toFixed(1)},${y.toFixed(1)}`;
              });
              return (
                <path
                  d={`M ${pts.join(' L ')}`}
                  fill="none"
                  stroke="#787b86"
                  strokeWidth="1.8"
                  strokeDasharray="4 4"
                />
              );
            })()}

            {/* Current Curve (Vibrant Blue) */}
            {(() => {
              const pts = yieldCurvePoints.map((pt, i) => {
                const x = 60 + (i / (yieldCurvePoints.length - 1)) * 800;
                const y = 180 - ((pt.yield - 3.8) / 1.2) * 160;
                return `${x.toFixed(1)},${y.toFixed(1)}`;
              });
              return (
                <g>
                  <path
                    d={`M ${pts.join(' L ')}`}
                    fill="none"
                    stroke="#2962ff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {yieldCurvePoints.map((pt, i) => {
                    const x = 60 + (i / (yieldCurvePoints.length - 1)) * 800;
                    const y = 180 - ((pt.yield - 3.8) / 1.2) * 160;
                    return (
                      <g key={i}>
                        <circle cx={x} cy={y} r="4" fill="#2962ff" stroke="#ffffff" strokeWidth="1.5" />
                        <text
                          x={x}
                          y={y - 8}
                          fill="#ffffff"
                          fontSize="9"
                          fontFamily="monospace"
                          textAnchor="middle"
                          fontWeight="bold"
                        >
                          {pt.yield.toFixed(2)}%
                        </text>
                        <text
                          x={x}
                          y="195"
                          fill="#787b86"
                          fontSize="10"
                          fontFamily="monospace"
                          textAnchor="middle"
                        >
                          {pt.maturity}
                        </text>
                      </g>
                    );
                  })}
                </g>
              );
            })()}
          </svg>
        </div>
      </section>

      {/* 2. Global Sovereign Bond Quotes Table */}
      <section className="bg-[#1e222d] border border-[#2a2e39] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-white tracking-tight">
            Benchmark Government Bond Yields
          </h3>
          <span className="text-xs text-slate-400 font-mono">Basis Points (bps) Change</span>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2a2e39] text-slate-400 font-semibold">
                <th className="pb-3 font-normal">Sovereign Debt Security</th>
                <th className="pb-3 text-right font-normal">Yield (%)</th>
                <th className="pb-3 text-right font-normal">Change (bps)</th>
                <th className="pb-3 text-right font-normal">% Change</th>
                <th className="pb-3 text-right font-normal hidden sm:table-cell">Day High</th>
                <th className="pb-3 text-right font-normal hidden sm:table-cell">Day Low</th>
                <th className="pb-3 text-right font-normal">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2e39]/60">
              {bondAssets.map((bond) => {
                const isPos = bond.change >= 0;
                const bps = (bond.change * 100).toFixed(1);
                return (
                  <tr
                    key={bond.symbol}
                    onClick={() => onSelectAsset(bond)}
                    className="hover:bg-[#131722]/80 cursor-pointer transition-colors group"
                  >
                    <td className="py-3 pr-2">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold font-mono text-xs shrink-0">
                          {bond.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-[#2962ff] transition-colors font-mono">
                            {bond.symbol}
                          </div>
                          <div className="text-[11px] text-slate-400">{bond.name}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 text-right font-mono font-bold text-white tabular-nums">
                      {bond.price.toFixed(3)}%
                    </td>

                    <td
                      className={`py-3 text-right font-mono font-semibold tabular-nums ${
                        isPos ? 'text-[#089981]' : 'text-[#f23645]'
                      }`}
                    >
                      {isPos ? '+' : ''}
                      {bps} bps
                    </td>

                    <td className="py-3 text-right font-mono font-semibold tabular-nums">
                      <span
                        className={`inline-flex items-center gap-0.5 ${
                          isPos ? 'text-[#089981]' : 'text-[#f23645]'
                        }`}
                      >
                        {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isPos ? '+' : ''}
                        {bond.changePercent.toFixed(2)}%
                      </span>
                    </td>

                    <td className="py-3 text-right font-mono text-slate-300 tabular-nums hidden sm:table-cell">
                      {bond.dayHigh.toFixed(3)}%
                    </td>

                    <td className="py-3 text-right font-mono text-slate-300 tabular-nums hidden sm:table-cell">
                      {bond.dayLow.toFixed(3)}%
                    </td>

                    <td className="py-3 text-right">
                      <div className="flex justify-end">
                        <Sparkline
                          data={bond.sparkline}
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
