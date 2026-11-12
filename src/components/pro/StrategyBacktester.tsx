import React, { useState } from 'react';
import { MarketAsset, StrategyReport } from '../../types/market';
import { Play, RotateCcw, TrendingUp, TrendingDown, CheckCircle, BarChart3, Code } from 'lucide-react';

interface StrategyBacktesterProps {
  asset: MarketAsset;
}

export const StrategyBacktester: React.FC<StrategyBacktesterProps> = ({ asset }) => {
  const [selectedStrategy, setSelectedStrategy] = useState<'supertrend' | 'macd' | 'rsi'>('supertrend');
  const [activeTab, setActiveTab] = useState<'overview' | 'trades' | 'pine'>('overview');

  const p = asset.price;

  const strategies: Record<string, StrategyReport> = {
    supertrend: {
      name: 'Supertrend Trend-Following (10, 3)',
      netProfit: p * 4.2 * 10,
      netProfitPct: 32.8,
      profitFactor: 2.45,
      maxDrawdownPct: -6.4,
      winRatePct: 66.7,
      totalTrades: 36,
      trades: [
        {
          id: 'tr-1',
          type: 'LONG',
          entryTime: 'Oct 24, 09:30',
          entryPrice: p * 0.91,
          exitTime: 'Nov 02, 16:00',
          exitPrice: p * 0.98,
          pnl: p * 0.07 * 10,
          pnlPct: 7.69,
        },
        {
          id: 'tr-2',
          type: 'LONG',
          entryTime: 'Nov 04, 10:15',
          entryPrice: p * 0.97,
          exitTime: 'Nov 08, 14:30',
          exitPrice: p * 1.02,
          pnl: p * 0.05 * 10,
          pnlPct: 5.15,
        },
        {
          id: 'tr-3',
          type: 'SHORT',
          entryTime: 'Nov 09, 11:00',
          entryPrice: p * 1.02,
          exitTime: 'Nov 11, 15:45',
          exitPrice: p * 1.00,
          pnl: p * 0.02 * 10,
          pnlPct: 1.96,
        },
      ],
    },
    macd: {
      name: 'MACD Exponential Momentum (12, 26, 9)',
      netProfit: p * 2.8 * 10,
      netProfitPct: 21.4,
      profitFactor: 1.85,
      maxDrawdownPct: -8.9,
      winRatePct: 58.3,
      totalTrades: 48,
      trades: [
        {
          id: 'tr-m1',
          type: 'LONG',
          entryTime: 'Oct 18, 11:00',
          entryPrice: p * 0.88,
          exitTime: 'Oct 26, 15:00',
          exitPrice: p * 0.94,
          pnl: p * 0.06 * 10,
          pnlPct: 6.82,
        },
        {
          id: 'tr-m2',
          type: 'SHORT',
          entryTime: 'Oct 28, 09:45',
          entryPrice: p * 0.95,
          exitTime: 'Nov 01, 10:30',
          exitPrice: p * 0.93,
          pnl: p * 0.02 * 10,
          pnlPct: 2.11,
        },
      ],
    },
    rsi: {
      name: 'RSI Mean Reversion (14, 30/70)',
      netProfit: p * 3.4 * 10,
      netProfitPct: 27.2,
      profitFactor: 2.12,
      maxDrawdownPct: -5.2,
      winRatePct: 71.4,
      totalTrades: 28,
      trades: [
        {
          id: 'tr-r1',
          type: 'LONG',
          entryTime: 'Oct 12, 14:30',
          entryPrice: p * 0.86,
          exitTime: 'Oct 19, 11:15',
          exitPrice: p * 0.92,
          pnl: p * 0.06 * 10,
          pnlPct: 6.98,
        },
      ],
    },
  };

  const report = strategies[selectedStrategy];

  const pineScriptCode = `//@version=5
strategy("${report.name}", overlay=true, margin_long=100, margin_short=100)

// Inputs
periods = input.int(10, "ATR Period")
multiplier = input.float(3.0, "Multiplier")

// Calculation
[supertrend, direction] = ta.supertrend(periods, multiplier)

if ta.change(direction) < 0
    strategy.entry("Long", strategy.long)

if ta.change(direction) > 0
    strategy.entry("Short", strategy.short)

plot(supertrend, color = direction < 0 ? color.teal : color.maroon)`;

  return (
    <div className="bg-[#1e222d] border-t border-[#2a2e39] text-xs font-mono select-none">
      {/* Strategy Tester Bar */}
      <div className="px-4 py-2 border-b border-[#2a2e39] bg-[#131722] flex flex-wrap items-center justify-between gap-3 font-sans">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#2962ff]" />
          <span className="font-bold text-white text-xs">Strategy Backtester PRO</span>

          <select
            value={selectedStrategy}
            onChange={(e) => setSelectedStrategy(e.target.value as any)}
            className="bg-[#1e222d] border border-[#2a2e39] text-xs text-white rounded px-2.5 py-1 font-semibold ml-2 cursor-pointer"
          >
            <option value="supertrend">Supertrend (10, 3)</option>
            <option value="macd">MACD Momentum (12, 26, 9)</option>
            <option value="rsi">RSI Mean Reversion (14)</option>
          </select>
        </div>

        {/* Sub Tabs */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#2962ff] text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Performance Summary
          </button>
          <button
            onClick={() => setActiveTab('trades')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'trades'
                ? 'bg-[#2962ff] text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            List of Trades ({report.trades.length})
          </button>
          <button
            onClick={() => setActiveTab('pine')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'pine'
                ? 'bg-[#2962ff] text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-1">
              <Code className="w-3.5 h-3.5 text-blue-400" />
              <span>Pine Script</span>
            </span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            <div className="bg-[#131722] p-3 rounded-lg border border-[#2a2e39]">
              <div className="text-[10px] text-slate-400 font-sans">Net Profit</div>
              <div className="text-sm font-bold text-[#089981] mt-1">
                +${report.netProfit.toFixed(2)} ({report.netProfitPct.toFixed(1)}%)
              </div>
            </div>

            <div className="bg-[#131722] p-3 rounded-lg border border-[#2a2e39]">
              <div className="text-[10px] text-slate-400 font-sans">Profit Factor</div>
              <div className="text-sm font-bold text-white mt-1">
                {report.profitFactor.toFixed(2)}
              </div>
            </div>

            <div className="bg-[#131722] p-3 rounded-lg border border-[#2a2e39]">
              <div className="text-[10px] text-slate-400 font-sans">Max Drawdown</div>
              <div className="text-sm font-bold text-[#f23645] mt-1">
                {report.maxDrawdownPct.toFixed(1)}%
              </div>
            </div>

            <div className="bg-[#131722] p-3 rounded-lg border border-[#2a2e39]">
              <div className="text-[10px] text-slate-400 font-sans">Win Rate %</div>
              <div className="text-sm font-bold text-emerald-400 mt-1">
                {report.winRatePct.toFixed(1)}%
              </div>
            </div>

            <div className="bg-[#131722] p-3 rounded-lg border border-[#2a2e39]">
              <div className="text-[10px] text-slate-400 font-sans">Total Closed Trades</div>
              <div className="text-sm font-bold text-white mt-1">
                {report.totalTrades}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'trades' && (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-[#2a2e39] font-sans pb-2">
                  <th className="pb-2 font-normal">#</th>
                  <th className="pb-2 font-normal">Type</th>
                  <th className="pb-2 font-normal">Entry Date</th>
                  <th className="pb-2 text-right font-normal">Entry Price</th>
                  <th className="pb-2 font-normal">Exit Date</th>
                  <th className="pb-2 text-right font-normal">Exit Price</th>
                  <th className="pb-2 text-right font-normal">Net Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2e39]/50">
                {report.trades.map((tr, idx) => (
                  <tr key={tr.id} className="hover:bg-[#131722]/50">
                    <td className="py-2 text-slate-400">{idx + 1}</td>
                    <td className="py-2">
                      <span
                        className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                          tr.type === 'LONG'
                            ? 'bg-[#089981]/20 text-[#089981]'
                            : 'bg-[#f23645]/20 text-[#f23645]'
                        }`}
                      >
                        {tr.type}
                      </span>
                    </td>
                    <td className="py-2 text-slate-300">{tr.entryTime}</td>
                    <td className="py-2 text-right text-slate-100">${tr.entryPrice.toFixed(2)}</td>
                    <td className="py-2 text-slate-300">{tr.exitTime}</td>
                    <td className="py-2 text-right text-slate-100">${tr.exitPrice.toFixed(2)}</td>
                    <td className="py-2 text-right font-bold text-[#089981]">
                      +${tr.pnl.toFixed(2)} (+{tr.pnlPct.toFixed(2)}%)
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'pine' && (
          <div className="relative">
            <pre className="p-3 bg-[#131722] rounded-lg border border-[#2a2e39] text-xs text-emerald-400 overflow-x-auto leading-relaxed">
              <code>{pineScriptCode}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
