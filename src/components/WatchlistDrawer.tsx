import React, { useState } from 'react';
import { MarketAsset } from '../types/market';
import { AssetLogo } from './ui/AssetLogo';
import { Sparkline } from './ui/Sparkline';
import {
  X,
  Bookmark,
  Bell,
  Trash2,
  TrendingUp,
  TrendingDown,
  Plus,
  ArrowUpRight,
  SlidersHorizontal,
} from 'lucide-react';

interface WatchlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  watchlistSymbols: string[];
  allAssets: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
  onRemoveFromWatchlist: (symbol: string) => void;
  onOpenSearch: () => void;
  alerts: { symbol: string; targetPrice: number; triggered: boolean }[];
  onRemoveAlert: (symbol: string) => void;
}

export const WatchlistDrawer: React.FC<WatchlistDrawerProps> = ({
  isOpen,
  onClose,
  watchlistSymbols,
  allAssets,
  onSelectAsset,
  onRemoveFromWatchlist,
  onOpenSearch,
  alerts,
  onRemoveAlert,
}) => {
  const [activeTab, setActiveTab] = useState<'watchlist' | 'alerts'>('watchlist');

  if (!isOpen) return null;

  const watchlistedAssets = allAssets.filter((a) => watchlistSymbols.includes(a.symbol));

  return (
    <aside className="fixed inset-y-0 right-0 z-40 w-80 sm:w-96 bg-[#1e222d] border-l border-[#2a2e39] shadow-2xl flex flex-col text-[#d1d4dc] animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2a2e39] bg-[#131722]">
        <div className="flex items-center gap-2">
          {/* Tabs */}
          <button
            onClick={() => setActiveTab('watchlist')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'watchlist'
                ? 'bg-[#2962ff] text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5 fill-current" />
            <span>Watchlist ({watchlistedAssets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'alerts'
                ? 'bg-[#2962ff] text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Alerts ({alerts.length})</span>
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-[#2a2e39] transition-colors"
          title="Close drawer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'watchlist' ? (
          <div>
            {/* Action Bar */}
            <div className="p-3 border-b border-[#2a2e39]/60 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-mono text-[11px]">
                {watchlistedAssets.length} symbols tracked
              </span>
              <button
                onClick={onOpenSearch}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#2962ff]/15 hover:bg-[#2962ff]/25 text-[#2962ff] font-semibold transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Add Symbol</span>
              </button>
            </div>

            {/* Assets List */}
            {watchlistedAssets.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs space-y-3">
                <Bookmark className="w-8 h-8 text-slate-400 mx-auto opacity-40" />
                <p>Your watchlist is currently empty.</p>
                <button
                  onClick={onOpenSearch}
                  className="px-3 py-1.5 rounded-lg bg-[#2962ff] text-white font-semibold shadow-xs"
                >
                  Search & Add Assets
                </button>
              </div>
            ) : (
              <div className="divide-y divide-[#2a2e39]/50">
                {watchlistedAssets.map((asset) => {
                  const isPos = asset.change >= 0;
                  return (
                    <div
                      key={asset.symbol}
                      onClick={() => onSelectAsset(asset)}
                      className="group flex items-center justify-between p-3 hover:bg-[#2a2e39]/60 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <AssetLogo symbol={asset.symbol} logoUrl={asset.logoUrl} size="sm" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-white group-hover:text-[#2962ff] transition-colors font-mono">
                              {asset.symbol}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {asset.exchange}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[120px]">
                            {asset.name}
                          </div>
                        </div>
                      </div>

                      {/* Mini Sparkline */}
                      <div className="hidden sm:block">
                        <Sparkline
                          data={asset.sparkline}
                          width={48}
                          height={20}
                          isPositive={isPos}
                        />
                      </div>

                      {/* Price & Change */}
                      <div className="flex items-center gap-3">
                        <div className="text-right font-mono">
                          <div className="text-xs font-bold text-white tabular-nums">
                            ${asset.price.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 4,
                            })}
                          </div>
                          <div
                            className={`text-[11px] font-semibold tabular-nums flex items-center justify-end gap-0.5 ${
                              isPos ? 'text-[#089981]' : 'text-[#f23645]'
                            }`}
                          >
                            {isPos ? '+' : ''}
                            {asset.changePercent.toFixed(2)}%
                          </div>
                        </div>

                        {/* Remove Action */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveFromWatchlist(asset.symbol);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-[#f23645] opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove from watchlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* Alerts Tab */
          <div className="p-4 space-y-3">
            <div className="text-xs font-mono text-slate-400">
              Active Price Target Alerts
            </div>
            {alerts.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs space-y-2">
                <Bell className="w-7 h-7 text-slate-400 mx-auto opacity-40" />
                <p>No active price alerts set.</p>
                <p className="text-[11px] text-slate-400">
                  Open any symbol chart to arm an alert.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {alerts.map((al) => (
                  <div
                    key={al.symbol}
                    className="p-3 bg-[#131722] rounded-lg border border-[#2a2e39] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-white font-mono">{al.symbol}</div>
                      <div className="text-[11px] text-amber-400 font-mono mt-0.5">
                        Target: ${al.targetPrice.toFixed(2)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                        Active
                      </span>
                      <button
                        onClick={() => onRemoveAlert(al.symbol)}
                        className="text-slate-400 hover:text-[#f23645] p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
