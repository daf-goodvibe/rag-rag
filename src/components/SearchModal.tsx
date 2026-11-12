import React, { useState, useEffect, useRef } from 'react';
import { MarketAsset } from '../types/market';
import { AssetLogo } from './ui/AssetLogo';
import { Search, X, TrendingUp, TrendingDown, CornerDownLeft } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  assets: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  assets,
  onSelectAsset,
}) => {
  const [query, setQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle keyboard shortcuts (Escape, Arrows, Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filteredAssets.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && filteredAssets[selectedIndex]) {
        e.preventDefault();
        onSelectAsset(filteredAssets[selectedIndex]);
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  if (!isOpen) return null;

  const filteredAssets = assets.filter((asset) => {
    const matchesCategory = filterCategory === 'all' || asset.category === filterCategory;
    const q = query.toLowerCase().trim();
    const matchesQuery =
      !q ||
      asset.symbol.toLowerCase().includes(q) ||
      asset.name.toLowerCase().includes(q) ||
      asset.exchange.toLowerCase().includes(q) ||
      (asset.sector && asset.sector.toLowerCase().includes(q));
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/70 backdrop-blur-xs">
      <div
        className="w-full max-w-2xl bg-[#1e222d] rounded-xl border border-[#2a2e39] shadow-2xl overflow-hidden flex flex-col text-[#d1d4dc] max-h-[80vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Box */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#2a2e39] gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search by symbol, company, crypto, or forex pair..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent text-sm text-white placeholder-slate-400 focus:outline-hidden font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 text-xs text-slate-400 hover:text-white rounded bg-[#131722] border border-[#2a2e39]"
          >
            ESC
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 px-4 py-2 bg-[#131722]/50 border-b border-[#2a2e39] overflow-x-auto no-scrollbar">
          {['all', 'stocks', 'crypto', 'forex', 'indices', 'commodities', 'bonds'].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => {
                  setFilterCategory(cat);
                  setSelectedIndex(0);
                }}
                className={`px-3 py-1 rounded text-xs font-medium capitalize whitespace-nowrap transition-colors cursor-pointer ${
                  filterCategory === cat
                    ? 'bg-[#2962ff] text-white'
                    : 'text-slate-400 hover:text-white hover:bg-[#2a2e39]'
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#2a2e39]/50 max-h-96">
          {filteredAssets.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No matching assets found for "{query}".
            </div>
          ) : (
            filteredAssets.map((asset, index) => {
              const isSelected = index === selectedIndex;
              const isPos = asset.change >= 0;

              return (
                <div
                  key={asset.symbol}
                  onClick={() => {
                    onSelectAsset(asset);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#2a2e39]' : 'hover:bg-[#2a2e39]/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <AssetLogo
                      symbol={asset.symbol}
                      logoUrl={asset.logoUrl}
                      name={asset.name}
                      size="md"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white font-mono">
                          {asset.symbol}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono px-1.5 py-0.2 rounded bg-[#131722] border border-[#2a2e39]">
                          {asset.exchange}
                        </span>
                        {asset.sector && (
                          <span className="text-xs text-slate-400 hidden sm:inline truncate">
                            {asset.sector}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 truncate max-w-xs">
                        {asset.name}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right shrink-0">
                    <div>
                      <div className="text-sm font-semibold font-mono text-white">
                        {asset.symbol.startsWith('US') && asset.symbol.endsWith('Y')
                          ? `${asset.price.toFixed(3)}%`
                          : `$${asset.price.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 4,
                            })}`}
                      </div>
                      <div
                        className={`text-xs font-mono font-medium flex items-center justify-end gap-0.5 ${
                          isPos ? 'text-[#089981]' : 'text-[#f23645]'
                        }`}
                      >
                        {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isPos ? '+' : ''}
                        {asset.changePercent.toFixed(2)}%
                      </div>
                    </div>
                    {isSelected && (
                      <CornerDownLeft className="w-4 h-4 text-slate-400 hidden sm:block" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 bg-[#131722] border-t border-[#2a2e39] text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1 py-0.5 bg-[#1e222d] border border-[#2a2e39] rounded text-[10px]">
                ↑↓
              </kbd>{' '}
              Navigate
            </span>
            <span>
              <kbd className="px-1 py-0.5 bg-[#1e222d] border border-[#2a2e39] rounded text-[10px]">
                ↵
              </kbd>{' '}
              Open Chart
            </span>
            <span>
              <kbd className="px-1 py-0.5 bg-[#1e222d] border border-[#2a2e39] rounded text-[10px]">
                esc
              </kbd>{' '}
              Close
            </span>
          </div>
          <span className="font-mono text-slate-400">{filteredAssets.length} symbols</span>
        </div>
      </div>
    </div>
  );
};
