import React, { useState, useEffect } from 'react';
import { MarketAsset, Level2Order, TimeAndSaleTrade } from '../../types/market';
import { TrendingUp, TrendingDown, Layers, History, ArrowDown, ArrowUp } from 'lucide-react';

interface DepthOfMarketProps {
  asset: MarketAsset;
  onQuickBuy?: (price: number) => void;
  onQuickSell?: (price: number) => void;
}

export const DepthOfMarket: React.FC<DepthOfMarketProps> = ({
  asset,
  onQuickBuy,
  onQuickSell,
}) => {
  const [activeTab, setActiveTab] = useState<'dom' | 'trades'>('dom');
  const [bids, setBids] = useState<Level2Order[]>([]);
  const [asks, setAsks] = useState<Level2Order[]>([]);
  const [trades, setTrades] = useState<TimeAndSaleTrade[]>([]);

  // Generate realistic L2 Book around current price
  useEffect(() => {
    const p = asset.price;
    const spread = p * 0.0004;

    const newAsks: Level2Order[] = [];
    let cumulativeAsk = 0;
    for (let i = 5; i >= 1; i--) {
      const price = p + spread * i;
      const size = Math.floor(Math.random() * 450 + 50);
      cumulativeAsk += size;
      newAsks.push({
        price: Number(price.toFixed(asset.price < 1 ? 4 : 2)),
        size,
        total: cumulativeAsk,
        depthPct: 0,
      });
    }

    const newBids: Level2Order[] = [];
    let cumulativeBid = 0;
    for (let i = 1; i <= 5; i++) {
      const price = p - spread * i;
      const size = Math.floor(Math.random() * 450 + 50);
      cumulativeBid += size;
      newBids.push({
        price: Number(price.toFixed(asset.price < 1 ? 4 : 2)),
        size,
        total: cumulativeBid,
        depthPct: 0,
      });
    }

    const maxTotal = Math.max(cumulativeAsk, cumulativeBid) || 1;
    newAsks.forEach((a) => (a.depthPct = Math.min(100, (a.total / maxTotal) * 100)));
    newBids.forEach((b) => (b.depthPct = Math.min(100, (b.total / maxTotal) * 100)));

    setAsks(newAsks);
    setBids(newBids);

    // Initial trades
    const initialTrades: TimeAndSaleTrade[] = [];
    const now = Date.now();
    for (let i = 0; i < 8; i++) {
      const side = Math.random() > 0.48 ? 'buy' : 'sell';
      const offset = (Math.random() - 0.5) * spread;
      initialTrades.push({
        id: `t-${i}`,
        time: new Date(now - i * 1500).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        price: Number((p + offset).toFixed(asset.price < 1 ? 4 : 2)),
        size: Math.floor(Math.random() * 200 + 10),
        side,
      });
    }
    setTrades(initialTrades);
  }, [asset]);

  // Subtle live tick generator for Time & Sales
  useEffect(() => {
    const timer = setInterval(() => {
      const side = Math.random() > 0.46 ? 'buy' : 'sell';
      const spread = asset.price * 0.0004;
      const offset = (Math.random() - 0.5) * spread;
      const newTrade: TimeAndSaleTrade = {
        id: `t-${Date.now()}`,
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        price: Number((asset.price + offset).toFixed(asset.price < 1 ? 4 : 2)),
        size: Math.floor(Math.random() * 250 + 15),
        side,
      };

      setTrades((prev) => [newTrade, ...prev.slice(0, 14)]);
    }, 2800);

    return () => clearInterval(timer);
  }, [asset.price]);

  const bestAsk = asks[asks.length - 1]?.price || asset.price;
  const bestBid = bids[0]?.price || asset.price;
  const spreadValue = Math.max(0.01, bestAsk - bestBid);
  const spreadPct = ((spreadValue / asset.price) * 100).toFixed(3);

  return (
    <div className="flex flex-col h-full bg-[#1e222d] text-xs font-mono select-none">
      {/* Sub-header Tabs */}
      <div className="flex items-center justify-between p-2 border-b border-[#2a2e39] bg-[#131722]">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('dom')}
            className={`px-2.5 py-1 rounded text-[11px] font-bold font-sans transition-colors cursor-pointer ${
              activeTab === 'dom'
                ? 'bg-[#2962ff] text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Level 2 DOM
          </button>
          <button
            onClick={() => setActiveTab('trades')}
            className={`px-2.5 py-1 rounded text-[11px] font-bold font-sans transition-colors cursor-pointer ${
              activeTab === 'trades'
                ? 'bg-[#2962ff] text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Time & Sales
          </button>
        </div>
        <span className="text-[10px] text-slate-400 font-sans">Live L2 Feed</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-2">
        {activeTab === 'dom' ? (
          <div className="space-y-1">
            {/* Headers */}
            <div className="grid grid-cols-3 text-[10px] text-slate-400 pb-1 border-b border-[#2a2e39]/60 font-sans">
              <span>Price</span>
              <span className="text-right">Size</span>
              <span className="text-right">Total</span>
            </div>

            {/* Asks (Sell Orders - Red) */}
            <div className="space-y-0.5">
              {asks.map((ask, idx) => (
                <div
                  key={`ask-${idx}`}
                  onClick={() => onQuickBuy && onQuickBuy(ask.price)}
                  className="relative grid grid-cols-3 py-0.5 px-1 hover:bg-rose-500/10 cursor-pointer text-[11px]"
                >
                  <div
                    className="absolute inset-y-0 right-0 bg-[#f23645]/15 pointer-events-none"
                    style={{ width: `${ask.depthPct}%` }}
                  />
                  <span className="text-[#f23645] font-semibold z-10">
                    ${ask.price.toFixed(asset.price < 1 ? 4 : 2)}
                  </span>
                  <span className="text-right text-slate-300 z-10">{ask.size}</span>
                  <span className="text-right text-slate-400 z-10">{ask.total}</span>
                </div>
              ))}
            </div>

            {/* Mid Price & Spread Bar */}
            <div className="py-2 px-2 bg-[#131722] rounded border border-[#2a2e39] flex items-center justify-between text-xs my-1">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <span>Last: ${asset.price.toFixed(asset.price < 1 ? 4 : 2)}</span>
              </div>
              <div className="text-[10px] text-slate-400">
                Spread: <span className="text-amber-400">${spreadValue.toFixed(2)}</span> ({spreadPct}%)
              </div>
            </div>

            {/* Bids (Buy Orders - Green) */}
            <div className="space-y-0.5">
              {bids.map((bid, idx) => (
                <div
                  key={`bid-${idx}`}
                  onClick={() => onQuickSell && onQuickSell(bid.price)}
                  className="relative grid grid-cols-3 py-0.5 px-1 hover:bg-emerald-500/10 cursor-pointer text-[11px]"
                >
                  <div
                    className="absolute inset-y-0 right-0 bg-[#089981]/15 pointer-events-none"
                    style={{ width: `${bid.depthPct}%` }}
                  />
                  <span className="text-[#089981] font-semibold z-10">
                    ${bid.price.toFixed(asset.price < 1 ? 4 : 2)}
                  </span>
                  <span className="text-right text-slate-300 z-10">{bid.size}</span>
                  <span className="text-right text-slate-400 z-10">{bid.total}</span>
                </div>
              ))}
            </div>

            {/* Quick One-Click Pro Buttons */}
            <div className="grid grid-cols-2 gap-1.5 pt-3 mt-2 border-t border-[#2a2e39]/60 font-sans">
              <button
                onClick={() => onQuickBuy && onQuickBuy(bestAsk)}
                className="py-1.5 px-2 bg-[#089981] hover:brightness-110 text-white rounded font-bold text-xs flex items-center justify-center gap-1 cursor-pointer shadow-xs"
              >
                <ArrowUp className="w-3 h-3" />
                <span>Buy @ Ask</span>
              </button>
              <button
                onClick={() => onQuickSell && onQuickSell(bestBid)}
                className="py-1.5 px-2 bg-[#f23645] hover:brightness-110 text-white rounded font-bold text-xs flex items-center justify-center gap-1 cursor-pointer shadow-xs"
              >
                <ArrowDown className="w-3 h-3" />
                <span>Sell @ Bid</span>
              </button>
            </div>
          </div>
        ) : (
          /* Time & Sales Stream */
          <div className="space-y-1">
            <div className="grid grid-cols-3 text-[10px] text-slate-400 pb-1 border-b border-[#2a2e39]/60 font-sans">
              <span>Time</span>
              <span className="text-right">Price</span>
              <span className="text-right">Size</span>
            </div>

            <div className="divide-y divide-[#2a2e39]/40">
              {trades.map((t) => (
                <div
                  key={t.id}
                  className="grid grid-cols-3 py-1 px-1 hover:bg-[#131722] text-[11px] animate-in fade-in duration-100"
                >
                  <span className="text-slate-400">{t.time}</span>
                  <span
                    className={`text-right font-semibold ${
                      t.side === 'buy' ? 'text-[#089981]' : 'text-[#f23645]'
                    }`}
                  >
                    ${t.price.toFixed(asset.price < 1 ? 4 : 2)}
                  </span>
                  <span className="text-right text-slate-200">{t.size}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
