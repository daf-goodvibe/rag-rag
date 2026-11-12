import React, { useState, useMemo } from 'react';
import { MarketAsset, TechnicalSignal } from '../../types/market';
import { AssetLogo } from '../ui/AssetLogo';
import { Sparkline } from '../ui/Sparkline';
import {
  Search,
  Download,
  Filter,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Sparkles,
} from 'lucide-react';

interface ScreenerViewProps {
  assets: MarketAsset[];
  onSelectAsset: (asset: MarketAsset) => void;
}

export const ScreenerView: React.FC<ScreenerViewProps> = ({
  assets,
  onSelectAsset,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [preset, setPreset] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('marketCap');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Apply Presets
  const applyPreset = (presetKey: string) => {
    setPreset(presetKey);
    if (presetKey === 'strong-buy') {
      setRatingFilter('Strong Buy');
      setSelectedCategory('all');
    } else if (presetKey === 'tech-gainers') {
      setSelectedCategory('stocks');
      setRatingFilter('all');
    } else if (presetKey === 'crypto-hot') {
      setSelectedCategory('crypto');
      setRatingFilter('all');
    } else if (presetKey === 'value') {
      setSelectedCategory('stocks');
      setRatingFilter('all');
    } else {
      setSelectedCategory('all');
      setRatingFilter('all');
    }
  };

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      // Category match
      if (selectedCategory !== 'all' && asset.category !== selectedCategory) return false;

      // Rating match
      if (ratingFilter !== 'all' && asset.technicalRating !== ratingFilter) return false;

      // Preset specific filtering
      if (preset === 'value' && (asset.peRatio === undefined || asset.peRatio > 30)) return false;
      if (preset === 'tech-gainers' && asset.sector !== 'Technology') return false;

      // Query match
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matches =
          asset.symbol.toLowerCase().includes(q) ||
          asset.name.toLowerCase().includes(q) ||
          (asset.sector && asset.sector.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    }).sort((a, b) => {
      let valA: any = a[sortField as keyof MarketAsset] ?? 0;
      let valB: any = b[sortField as keyof MarketAsset] ?? 0;

      if (sortField === 'marketCap') {
        valA = a.marketCapNum ?? 0;
        valB = b.marketCapNum ?? 0;
      } else if (sortField === 'volume') {
        valA = a.volumeNum ?? 0;
        valB = b.volumeNum ?? 0;
      } else if (sortField === 'change') {
        valA = a.changePercent;
        valB = b.changePercent;
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [assets, selectedCategory, ratingFilter, preset, searchQuery, sortField, sortAsc]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Symbol', 'Name', 'Category', 'Price', 'Change %', 'Market Cap', 'Volume', 'P/E', 'Rating'];
    const rows = filteredAssets.map((a) => [
      a.symbol,
      `"${a.name}"`,
      a.category,
      a.price,
      a.changePercent,
      a.marketCap || 'N/A',
      a.volume || 'N/A',
      a.peRatio || 'N/A',
      a.technicalRating,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tradingview_screener_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Toolbar & Quick Presets */}
      <div className="bg-[#1e222d] border border-[#2a2e39] rounded-xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Global Asset Screener
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Filter equities, cryptocurrencies, indices, and commodities across technical and fundamental signals
            </p>
          </div>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#131722] hover:bg-[#2a2e39] border border-[#2a2e39] text-xs font-semibold text-slate-200 transition-colors self-start md:self-auto cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#2962ff]" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Quick Presets Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-[#2a2e39]/60 text-xs">
          <span className="text-slate-400 font-semibold text-[11px] whitespace-nowrap flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Presets:
          </span>
          {[
            { id: 'all', label: 'All Symbols' },
            { id: 'strong-buy', label: '★ Strong Buy Signals' },
            { id: 'tech-gainers', label: 'Technology Leaders' },
            { id: 'crypto-hot', label: 'Crypto Ecosystem' },
            { id: 'value', label: 'Value P/E (<30)' },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => applyPreset(p.id)}
              className={`px-3 py-1 rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                preset === p.id
                  ? 'bg-[#2962ff] text-white font-bold shadow-xs'
                  : 'bg-[#131722] text-slate-400 hover:text-white border border-[#2a2e39]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Secondary Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search ticker, name, or sector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#131722] border border-[#2a2e39] rounded-lg text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-[#2962ff] font-medium"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPreset('custom');
            }}
            className="bg-[#131722] border border-[#2a2e39] text-xs text-slate-300 rounded-lg px-3 py-1.5 font-medium cursor-pointer"
          >
            <option value="all">All Asset Classes</option>
            <option value="stocks">Stocks</option>
            <option value="crypto">Crypto</option>
            <option value="indices">Indices</option>
            <option value="commodities">Commodities</option>
            <option value="bonds">Bonds</option>
          </select>

          {/* Technical Rating Filter */}
          <select
            value={ratingFilter}
            onChange={(e) => {
              setRatingFilter(e.target.value);
              setPreset('custom');
            }}
            className="bg-[#131722] border border-[#2a2e39] text-xs text-slate-300 rounded-lg px-3 py-1.5 font-medium cursor-pointer"
          >
            <option value="all">All Technical Signals</option>
            <option value="Strong Buy">Strong Buy</option>
            <option value="Buy">Buy</option>
            <option value="Neutral">Neutral</option>
            <option value="Sell">Sell</option>
          </select>

          <div className="text-right text-xs font-mono text-slate-400 flex items-center justify-end">
            Showing <strong className="text-white mx-1">{filteredAssets.length}</strong> matches
          </div>
        </div>
      </div>

      {/* 2. Comprehensive Data Grid Table */}
      <div className="bg-[#1e222d] border border-[#2a2e39] rounded-xl p-5 overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#2a2e39] text-slate-400 font-semibold select-none">
                <th
                  onClick={() => handleSort('symbol')}
                  className="pb-3 font-normal cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Symbol / Asset</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('price')}
                  className="pb-3 text-right font-normal cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Price</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('change')}
                  className="pb-3 text-right font-normal cursor-pointer hover:text-white"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Change %</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('technicalRating')}
                  className="pb-3 text-right font-normal cursor-pointer hover:text-white hidden sm:table-cell"
                >
                  <span>Technical Rating</span>
                </th>
                <th
                  onClick={() => handleSort('volume')}
                  className="pb-3 text-right font-normal cursor-pointer hover:text-white hidden md:table-cell"
                >
                  <span>24h Volume</span>
                </th>
                <th
                  onClick={() => handleSort('marketCap')}
                  className="pb-3 text-right font-normal cursor-pointer hover:text-white hidden lg:table-cell"
                >
                  <span>Market Cap</span>
                </th>
                <th
                  onClick={() => handleSort('peRatio')}
                  className="pb-3 text-right font-normal cursor-pointer hover:text-white hidden xl:table-cell"
                >
                  <span>P/E</span>
                </th>
                <th className="pb-3 text-right font-normal hidden sm:table-cell">RSI(14)</th>
                <th className="pb-3 text-right font-normal">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2e39]/60">
              {filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No financial instruments matched your current screener criteria.
                  </td>
                </tr>
              ) : (
                filteredAssets.map((asset) => {
                  const isPos = asset.change >= 0;
                  return (
                    <tr
                      key={asset.symbol}
                      onClick={() => onSelectAsset(asset)}
                      className="hover:bg-[#131722]/80 cursor-pointer transition-colors group"
                    >
                      <td className="py-3 pr-2">
                        <div className="flex items-center gap-3">
                          <AssetLogo symbol={asset.symbol} logoUrl={asset.logoUrl} size="md" />
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white group-hover:text-[#2962ff] transition-colors font-mono">
                                {asset.symbol}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono px-1.5 py-0.2 rounded bg-[#131722] border border-[#2a2e39]">
                                {asset.exchange}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                              {asset.name}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 text-right font-mono font-bold text-white tabular-nums">
                        ${asset.price.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: asset.price < 1 ? 4 : 2,
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
                          {asset.changePercent.toFixed(2)}%
                        </span>
                      </td>

                      <td className="py-3 text-right font-mono hidden sm:table-cell">
                        <span
                          className={`text-[11px] font-semibold ${
                            asset.technicalRating.includes('Buy')
                              ? 'text-[#089981]'
                              : asset.technicalRating.includes('Sell')
                              ? 'text-[#f23645]'
                              : 'text-slate-400'
                          }`}
                        >
                          {asset.technicalRating}
                        </span>
                      </td>

                      <td className="py-3 text-right font-mono text-slate-300 tabular-nums hidden md:table-cell">
                        {asset.volume}
                      </td>

                      <td className="py-3 text-right font-mono text-slate-300 tabular-nums hidden lg:table-cell">
                        {asset.marketCap || '—'}
                      </td>

                      <td className="py-3 text-right font-mono text-slate-400 tabular-nums hidden xl:table-cell">
                        {asset.peRatio ? asset.peRatio.toFixed(1) : '—'}
                      </td>

                      <td className="py-3 text-right font-mono text-slate-400 tabular-nums hidden sm:table-cell">
                        {asset.rsi14 ? asset.rsi14.toFixed(1) : '50.0'}
                      </td>

                      <td className="py-3 text-right">
                        <div className="flex justify-end">
                          <Sparkline
                            data={asset.sparkline}
                            width={64}
                            height={22}
                            isPositive={isPos}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
