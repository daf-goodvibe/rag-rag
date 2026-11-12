import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MarketAsset, Timeframe, Candle } from '../types/market';
import { generateCandles } from '../data/marketsData';
import { AssetLogo } from './ui/AssetLogo';
import { TechnicalGauge } from './ui/TechnicalGauge';
import {
  X,
  Bookmark,
  TrendingUp,
  TrendingDown,
  BarChart2,
  LineChart,
  Bell,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Layers,
  Sliders,
} from 'lucide-react';

interface ChartModalProps {
  asset: MarketAsset | null;
  onClose: () => void;
  isWatchlisted: boolean;
  onToggleWatchlist: (symbol: string) => void;
  onSetAlert?: (symbol: string, price: number) => void;
}

export const ChartModal: React.FC<ChartModalProps> = ({
  asset,
  onClose,
  isWatchlisted,
  onToggleWatchlist,
  onSetAlert,
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const [chartType, setChartType] = useState<'candles' | 'area'>('candles');
  const [showMA20, setShowMA20] = useState(true);
  const [showMA50, setShowMA50] = useState(true);
  const [showVolume, setShowVolume] = useState(true);
  const [showRSI, setShowRSI] = useState(true);

  // Active hover candle for crosshair inspection
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Simulation order widget state
  const [orderType, setOrderType] = useState<'buy' | 'sell'>('buy');
  const [orderQuantity, setOrderQuantity] = useState('10');
  const [orderSuccessMsg, setOrderSuccessMsg] = useState<string | null>(null);

  // Alert builder state
  const [alertPriceInput, setAlertPriceInput] = useState('');
  const [alertSuccessMsg, setAlertSuccessMsg] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (asset) {
      setAlertPriceInput((asset.price * 1.05).toFixed(2));
    }
  }, [asset]);

  // Generate dynamic candles based on selected timeframe
  const candleData: Candle[] = useMemo(() => {
    if (!asset) return [];
    return generateCandles(asset.price, timeframe, 50).candles;
  }, [asset, timeframe]);

  // Calculate Moving Averages
  const ma20Series = useMemo(() => {
    const period = 10;
    return candleData.map((_, idx, arr) => {
      if (idx < period - 1) return null;
      const slice = arr.slice(idx - period + 1, idx + 1);
      const sum = slice.reduce((acc, c) => acc + c.close, 0);
      return sum / period;
    });
  }, [candleData]);

  const ma50Series = useMemo(() => {
    const period = 20;
    return candleData.map((_, idx, arr) => {
      if (idx < period - 1) return null;
      const slice = arr.slice(idx - period + 1, idx + 1);
      const sum = slice.reduce((acc, c) => acc + c.close, 0);
      return sum / period;
    });
  }, [candleData]);

  // Calculate simulated RSI(14)
  const rsiSeries = useMemo(() => {
    return candleData.map((c, i) => {
      const baseRsi = asset?.rsi14 || 55;
      const variation = Math.sin(i * 0.4) * 12 + ((c.close - c.open) / (c.open || 1)) * 50;
      return Math.min(95, Math.max(5, baseRsi + variation));
    });
  }, [candleData, asset]);

  if (!asset) return null;

  const isPos = asset.change >= 0;
  const currentHoverCandle = hoverIndex !== null && candleData[hoverIndex] ? candleData[hoverIndex] : null;
  const displayPrice = currentHoverCandle ? currentHoverCandle.close : asset.price;

  // Chart Geometry Calculations
  const chartHeight = 360;
  const volumeHeight = 70;
  const rsiHeight = showRSI ? 80 : 0;
  const totalSvgHeight = chartHeight + (showVolume ? volumeHeight : 0) + (showRSI ? rsiHeight : 0);

  const minPrice = Math.min(...candleData.map((c) => c.low));
  const maxPrice = Math.max(...candleData.map((c) => c.high));
  const priceRange = maxPrice - minPrice || 1;

  const maxVolume = Math.max(...candleData.map((c) => c.volume)) || 1;

  const getPriceY = (price: number) => {
    const padding = 15;
    const available = chartHeight - padding * 2;
    return chartHeight - padding - ((price - minPrice) / priceRange) * available;
  };

  const timeframesList: Timeframe[] = ['1D', '5D', '1M', '3M', '6M', '1Y', '5Y', 'ALL'];

  const handleExecuteOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(orderQuantity) || 1;
    const total = (qty * asset.price).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
    setOrderSuccessMsg(
      `Filled ${orderType.toUpperCase()} order for ${qty} ${asset.symbol} at $${asset.price.toFixed(
        2
      )} (${total})`
    );
    setTimeout(() => setOrderSuccessMsg(null), 4500);
  };

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const targetPrice = parseFloat(alertPriceInput);
    if (!isNaN(targetPrice)) {
      if (onSetAlert) onSetAlert(asset.symbol, targetPrice);
      setAlertSuccessMsg(true);
      setTimeout(() => setAlertSuccessMsg(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div
        className="relative w-full max-w-7xl bg-[#131722] border border-[#2a2e39] rounded-xl shadow-2xl text-[#d1d4dc] flex flex-col max-h-[96vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3 border-b border-[#2a2e39] bg-[#1e222d]">
          {/* Symbol Info */}
          <div className="flex items-center gap-3">
            <AssetLogo symbol={asset.symbol} logoUrl={asset.logoUrl} size="lg" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold font-mono text-white tracking-tight">
                  {asset.symbol}
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-[#131722] border border-[#2a2e39] text-slate-400 font-mono">
                  {asset.exchange}
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">{asset.name}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xl font-extrabold font-mono text-white tabular-nums">
                  ${displayPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                </span>
                <span
                  className={`text-xs font-mono font-semibold flex items-center gap-0.5 ${
                    isPos ? 'text-[#089981]' : 'text-[#f23645]'
                  }`}
                >
                  {isPos ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {isPos ? '+' : ''}
                  {asset.change.toFixed(2)} ({isPos ? '+' : ''}
                  {asset.changePercent.toFixed(2)}%)
                </span>
                <span className="text-xs text-slate-400 hidden md:inline">Today</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleWatchlist(asset.symbol)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                isWatchlisted
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  : 'bg-[#131722] hover:bg-[#2a2e39] text-slate-300 border-[#2a2e39]'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isWatchlisted ? 'fill-current' : ''}`} />
              <span>{isWatchlisted ? 'Watchlisted' : 'Add to Watchlist'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#131722] hover:bg-[#2a2e39] text-slate-400 hover:text-white border border-[#2a2e39] transition-colors cursor-pointer"
              title="Close chart (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-Header Toolbar (Timeframes, Chart Type, Indicator Toggles) */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 border-b border-[#2a2e39] bg-[#131722] text-xs">
          {/* Timeframe Selectors */}
          <div className="flex items-center gap-1 bg-[#1e222d] p-1 rounded-lg border border-[#2a2e39]">
            {timeframesList.map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded font-semibold text-xs transition-colors cursor-pointer ${
                  timeframe === tf
                    ? 'bg-[#2962ff] text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-[#2a2e39]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Chart Controls */}
          <div className="flex items-center gap-2">
            {/* Candlestick vs Area */}
            <div className="flex items-center bg-[#1e222d] p-0.5 rounded-lg border border-[#2a2e39]">
              <button
                onClick={() => setChartType('candles')}
                className={`px-2.5 py-1 rounded flex items-center gap-1.5 font-medium transition-colors cursor-pointer ${
                  chartType === 'candles'
                    ? 'bg-[#2a2e39] text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Candles</span>
              </button>
              <button
                onClick={() => setChartType('area')}
                className={`px-2.5 py-1 rounded flex items-center gap-1.5 font-medium transition-colors cursor-pointer ${
                  chartType === 'area'
                    ? 'bg-[#2a2e39] text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <LineChart className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Line / Area</span>
              </button>
            </div>

            {/* Technical Indicators */}
            <div className="hidden lg:flex items-center gap-1.5 bg-[#1e222d] px-2 py-1 rounded-lg border border-[#2a2e39]">
              <span className="text-[11px] text-slate-400 font-medium mr-1 flex items-center gap-1">
                <Sliders className="w-3 h-3" /> Indicators:
              </span>
              <button
                onClick={() => setShowMA20(!showMA20)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  showMA20 ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40' : 'text-slate-400'
                }`}
              >
                MA 20
              </button>
              <button
                onClick={() => setShowMA50(!showMA50)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  showMA50 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-slate-400'
                }`}
              >
                MA 50
              </button>
              <button
                onClick={() => setShowVolume(!showVolume)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  showVolume ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40' : 'text-slate-400'
                }`}
              >
                Vol
              </button>
              <button
                onClick={() => setShowRSI(!showRSI)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  showRSI ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40' : 'text-slate-400'
                }`}
              >
                RSI
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Crosshair Info Bar */}
        {currentHoverCandle && (
          <div className="flex flex-wrap items-center gap-4 px-4 py-1.5 bg-[#1e222d]/60 border-b border-[#2a2e39] text-[11px] font-mono text-slate-400">
            <div>Time: <span className="text-white font-medium">{currentHoverCandle.time}</span></div>
            <div>O: <span className="text-white font-medium">${currentHoverCandle.open.toFixed(2)}</span></div>
            <div>H: <span className="text-white font-medium">${currentHoverCandle.high.toFixed(2)}</span></div>
            <div>L: <span className="text-white font-medium">${currentHoverCandle.low.toFixed(2)}</span></div>
            <div>C: <span className="text-white font-medium">${currentHoverCandle.close.toFixed(2)}</span></div>
            <div>Vol: <span className="text-white font-medium">{currentHoverCandle.volume.toLocaleString()}</span></div>
            {showRSI && hoverIndex !== null && rsiSeries[hoverIndex] && (
              <div>RSI(14): <span className="text-purple-400 font-medium">{rsiSeries[hoverIndex].toFixed(1)}</span></div>
            )}
          </div>
        )}

        {/* Main Body Split: Interactive Chart Canvas (Left/Center) + Stats/Trading Panel (Right) */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-[460px]">
          {/* Chart Canvas Area */}
          <div className="flex-1 relative flex flex-col bg-[#131722] p-2 sm:p-4 select-none overflow-hidden">
            {/* SVG Interactive Chart Engine */}
            <div
              className="relative flex-1 w-full h-full min-h-[380px] cursor-crosshair"
              onMouseLeave={() => setHoverIndex(null)}
            >
              <svg
                width="100%"
                height="100%"
                viewBox={`0 0 1000 ${totalSvgHeight}`}
                preserveAspectRatio="none"
                className="w-full h-full"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const ratio = Math.max(0, Math.min(1, x / rect.width));
                  const idx = Math.floor(ratio * (candleData.length - 1));
                  setHoverIndex(idx);
                }}
              >
                <defs>
                  {/* Area chart vibrant gradient fill */}
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isPos ? '#089981' : '#f23645'} stopOpacity="0.4" />
                    <stop offset="100%" stopColor={isPos ? '#089981' : '#f23645'} stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                {[0.2, 0.4, 0.6, 0.8].map((ratio, i) => {
                  const y = chartHeight * ratio;
                  const pVal = maxPrice - ratio * priceRange;
                  return (
                    <g key={i}>
                      <line
                        x1="0"
                        y1={y}
                        x2="940"
                        y2={y}
                        stroke="#2a2e39"
                        strokeDasharray="4 4"
                        strokeWidth="1"
                      />
                      <text
                        x="945"
                        y={y + 4}
                        fill="#787b86"
                        fontSize="10"
                        fontFamily="monospace"
                      >
                        ${pVal.toFixed(1)}
                      </text>
                    </g>
                  );
                })}

                {/* Candlesticks OR Area Line */}
                {chartType === 'candles' ? (
                  candleData.map((c, i) => {
                    const count = candleData.length;
                    const candleWidth = Math.max(3, 900 / count - 3);
                    const x = (i / (count - 1)) * 900 + 10;
                    const openY = getPriceY(c.open);
                    const closeY = getPriceY(c.close);
                    const highY = getPriceY(c.high);
                    const lowY = getPriceY(c.low);
                    const isBullish = c.close >= c.open;
                    const candleColor = isBullish ? '#089981' : '#f23645';
                    const rectTop = Math.min(openY, closeY);
                    const rectHeight = Math.max(2, Math.abs(closeY - openY));

                    return (
                      <g key={i}>
                        {/* Upper & Lower Wick */}
                        <line
                          x1={x}
                          y1={highY}
                          x2={x}
                          y2={lowY}
                          stroke={candleColor}
                          strokeWidth="1.2"
                        />
                        {/* Candle Body */}
                        <rect
                          x={x - candleWidth / 2}
                          y={rectTop}
                          width={candleWidth}
                          height={rectHeight}
                          fill={candleColor}
                          rx="1"
                        />
                      </g>
                    );
                  })
                ) : (
                  <>
                    {/* Area Chart Mode */}
                    {(() => {
                      const count = candleData.length;
                      const points = candleData.map((c, i) => {
                        const x = (i / (count - 1)) * 900 + 10;
                        const y = getPriceY(c.close);
                        return `${x.toFixed(1)},${y.toFixed(1)}`;
                      });
                      const pathD = `M ${points.join(' L ')}`;
                      const areaD = `${pathD} L 910,${chartHeight} L 10,${chartHeight} Z`;

                      return (
                        <g>
                          <path d={areaD} fill="url(#areaGradient)" />
                          <path
                            d={pathD}
                            fill="none"
                            stroke={isPos ? '#089981' : '#f23645'}
                            strokeWidth="2.2"
                            strokeLinecap="round"
                          />
                        </g>
                      );
                    })()}
                  </>
                )}

                {/* Moving Average 20 Line Overlay (Sky Blue) */}
                {showMA20 && (
                  <path
                    d={
                      candleData
                        .map((_, i) => {
                          const ma = ma20Series[i];
                          if (ma === null) return null;
                          const x = (i / (candleData.length - 1)) * 900 + 10;
                          const y = getPriceY(ma);
                          return `${x.toFixed(1)},${y.toFixed(1)}`;
                        })
                        .filter((p): p is string => p !== null)
                        .reduce((acc, p, idx) => (idx === 0 ? `M ${p}` : `${acc} L ${p}`), '') || undefined
                    }
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="1.5"
                    opacity="0.85"
                  />
                )}

                {/* Moving Average 50 Line Overlay (Amber) */}
                {showMA50 && (
                  <path
                    d={
                      candleData
                        .map((_, i) => {
                          const ma = ma50Series[i];
                          if (ma === null) return null;
                          const x = (i / (candleData.length - 1)) * 900 + 10;
                          const y = getPriceY(ma);
                          return `${x.toFixed(1)},${y.toFixed(1)}`;
                        })
                        .filter((p): p is string => p !== null)
                        .reduce((acc, p, idx) => (idx === 0 ? `M ${p}` : `${acc} L ${p}`), '') || undefined
                    }
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="1.5"
                    opacity="0.85"
                  />
                )}

                {/* Volume Histogram Sub-Panel */}
                {showVolume && (
                  <g transform={`translate(0, ${chartHeight + 10})`}>
                    <line x1="0" y1="0" x2="940" y2="0" stroke="#2a2e39" strokeWidth="1" />
                    <text x="10" y="14" fill="#787b86" fontSize="10" fontFamily="monospace">
                      Volume: {((asset.volumeNum || 1000000) / 1000000).toFixed(1)}M
                    </text>
                    {candleData.map((c, i) => {
                      const count = candleData.length;
                      const x = (i / (count - 1)) * 900 + 10;
                      const barW = Math.max(2, 900 / count - 3);
                      const barH = (c.volume / maxVolume) * (volumeHeight - 20);
                      const isBull = c.close >= c.open;
                      return (
                        <rect
                          key={i}
                          x={x - barW / 2}
                          y={volumeHeight - barH}
                          width={barW}
                          height={barH}
                          fill={isBull ? 'rgba(8, 153, 129, 0.5)' : 'rgba(242, 54, 69, 0.5)'}
                          rx="0.5"
                        />
                      );
                    })}
                  </g>
                )}

                {/* RSI Indicator Sub-Panel */}
                {showRSI && (
                  <g transform={`translate(0, ${chartHeight + (showVolume ? volumeHeight : 0) + 15})`}>
                    <line x1="0" y1="0" x2="940" y2="0" stroke="#2a2e39" strokeWidth="1" />
                    {/* 70 overbought threshold */}
                    <line x1="0" y1="18" x2="940" y2="18" stroke="#f23645" strokeDasharray="3 3" strokeWidth="0.8" opacity="0.6" />
                    <text x="945" y="21" fill="#f23645" fontSize="9" fontFamily="monospace">70</text>
                    {/* 30 oversold threshold */}
                    <line x1="0" y1="52" x2="940" y2="52" stroke="#089981" strokeDasharray="3 3" strokeWidth="0.8" opacity="0.6" />
                    <text x="945" y="55" fill="#089981" fontSize="9" fontFamily="monospace">30</text>
                    <text x="10" y="14" fill="#a855f7" fontSize="10" fontFamily="monospace">
                      RSI (14): {(asset.rsi14 || 55).toFixed(1)}
                    </text>

                    {/* RSI Curve */}
                    <path
                      d={candleData
                        .map((_, i) => {
                          const rsi = rsiSeries[i] || 50;
                          const x = (i / (candleData.length - 1)) * 900 + 10;
                          const y = 65 - (rsi / 100) * 50;
                          return `${x.toFixed(1)},${y.toFixed(1)}`;
                        })
                        .reduce((acc, p, idx) => (idx === 0 ? `M ${p}` : `${acc} L ${p}`), '')}
                      fill="none"
                      stroke="#c084fc"
                      strokeWidth="1.6"
                    />
                  </g>
                )}

                {/* Crosshair Cursor Lines */}
                {hoverIndex !== null && candleData[hoverIndex] && (
                  <g>
                    {/* Vertical Time Line */}
                    {(() => {
                      const x = (hoverIndex / (candleData.length - 1)) * 900 + 10;
                      return (
                        <line
                          x1={x}
                          y1="0"
                          x2={x}
                          y2={totalSvgHeight}
                          stroke="#787b86"
                          strokeDasharray="3 3"
                          strokeWidth="1"
                        />
                      );
                    })()}
                    {/* Horizontal Price Line */}
                    {(() => {
                      const c = candleData[hoverIndex];
                      const y = getPriceY(c.close);
                      return (
                        <g>
                          <line
                            x1="0"
                            y1={y}
                            x2="940"
                            y2={y}
                            stroke="#787b86"
                            strokeDasharray="3 3"
                            strokeWidth="1"
                          />
                          <rect
                            x="935"
                            y={y - 10}
                            width="60"
                            height="20"
                            fill="#2962ff"
                            rx="3"
                          />
                          <text
                            x="940"
                            y={y + 3}
                            fill="#ffffff"
                            fontSize="10"
                            fontFamily="monospace"
                            fontWeight="bold"
                          >
                            ${c.close.toFixed(2)}
                          </text>
                        </g>
                      );
                    })()}
                  </g>
                )}
              </svg>
            </div>
          </div>

          {/* Right Sidebar: Key Financial Stats, Technical Gauge, and Paper Trading Simulation */}
          <div className="w-full lg:w-88 border-t lg:border-t-0 lg:border-l border-[#2a2e39] bg-[#1e222d] flex flex-col overflow-y-auto divide-y divide-[#2a2e39]">
            {/* Technical Analysis Rating Widget */}
            <div className="p-4 flex flex-col items-center">
              <div className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-2">
                Technical Analysis Summary
              </div>
              <TechnicalGauge
                rating={asset.technicalRating}
                rsi={asset.rsi14}
                size="md"
              />
              <div className="w-full grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-[#2a2e39]/60 text-center text-xs">
                <div>
                  <div className="text-slate-400 text-[10px]">Oscillators</div>
                  <div className="font-semibold text-slate-200 mt-0.5">Neutral (2)</div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px]">Summary</div>
                  <div
                    className={`font-semibold mt-0.5 ${
                      asset.technicalRating.includes('Buy')
                        ? 'text-[#089981]'
                        : asset.technicalRating.includes('Sell')
                        ? 'text-[#f23645]'
                        : 'text-slate-300'
                    }`}
                  >
                    {asset.technicalRating}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 text-[10px]">Moving Avg</div>
                  <div className="font-semibold text-[#089981] mt-0.5">Buy (12)</div>
                </div>
              </div>
            </div>

            {/* Key Statistics & Ranges */}
            <div className="p-4 space-y-3">
              <div className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                Key Market Statistics
              </div>

              {/* Day's Range Progress Bar */}
              <div>
                <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                  <span>Day Low: ${asset.dayLow.toFixed(2)}</span>
                  <span>Day High: ${asset.dayHigh.toFixed(2)}</span>
                </div>
                <div className="w-full h-1.5 bg-[#131722] rounded-full overflow-hidden relative">
                  <div
                    className="h-full bg-[#2962ff] rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          5,
                          ((asset.price - asset.dayLow) / (asset.dayHigh - asset.dayLow || 1)) * 100
                        )
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* 52-Week Range Progress Bar */}
              <div>
                <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                  <span>52W L: ${asset.yearLow.toFixed(2)}</span>
                  <span>52W H: ${asset.yearHigh.toFixed(2)}</span>
                </div>
                <div className="w-full h-1.5 bg-[#131722] rounded-full overflow-hidden relative">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          5,
                          ((asset.price - asset.yearLow) / (asset.yearHigh - asset.yearLow || 1)) * 100
                        )
                      )}%`,
                    }}
                  />
                </div>
              </div>

              {/* High Density Metric Grid */}
              <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-xs">
                {asset.marketCap && (
                  <div className="bg-[#131722] p-2 rounded-lg border border-[#2a2e39]">
                    <div className="text-[10px] text-slate-400">Market Cap</div>
                    <div className="font-bold text-white mt-0.5">{asset.marketCap}</div>
                  </div>
                )}
                <div className="bg-[#131722] p-2 rounded-lg border border-[#2a2e39]">
                  <div className="text-[10px] text-slate-400">24h Volume</div>
                  <div className="font-bold text-white mt-0.5">{asset.volume}</div>
                </div>
                {asset.peRatio && (
                  <div className="bg-[#131722] p-2 rounded-lg border border-[#2a2e39]">
                    <div className="text-[10px] text-slate-400">P/E Ratio</div>
                    <div className="font-bold text-white mt-0.5">{asset.peRatio.toFixed(1)}</div>
                  </div>
                )}
                {asset.dividendYield !== undefined && (
                  <div className="bg-[#131722] p-2 rounded-lg border border-[#2a2e39]">
                    <div className="text-[10px] text-slate-400">Div Yield</div>
                    <div className="font-bold text-white mt-0.5">{asset.dividendYield}%</div>
                  </div>
                )}
                {asset.beta && (
                  <div className="bg-[#131722] p-2 rounded-lg border border-[#2a2e39]">
                    <div className="text-[10px] text-slate-400">Beta (1Y)</div>
                    <div className="font-bold text-white mt-0.5">{asset.beta.toFixed(2)}</div>
                  </div>
                )}
                <div className="bg-[#131722] p-2 rounded-lg border border-[#2a2e39]">
                  <div className="text-[10px] text-slate-400">Avg Vol (30D)</div>
                  <div className="font-bold text-white mt-0.5">{asset.avgVolume || '48M'}</div>
                </div>
              </div>
            </div>

            {/* Trading Simulation / Execution Box */}
            <div className="p-4 space-y-3">
              <div className="text-xs font-bold text-slate-400 tracking-wider uppercase">
                Paper Trading Simulation
              </div>

              {orderSuccessMsg && (
                <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{orderSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleExecuteOrder} className="space-y-3">
                {/* Buy vs Sell Segmented Control */}
                <div className="grid grid-cols-2 gap-1 p-1 bg-[#131722] rounded-lg border border-[#2a2e39]">
                  <button
                    type="button"
                    onClick={() => setOrderType('buy')}
                    className={`py-1.5 text-xs font-bold rounded transition-colors cursor-pointer ${
                      orderType === 'buy'
                        ? 'bg-[#089981] text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    BUY / LONG
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('sell')}
                    className={`py-1.5 text-xs font-bold rounded transition-colors cursor-pointer ${
                      orderType === 'sell'
                        ? 'bg-[#f23645] text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    SELL / SHORT
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Shares / Units</label>
                  <div className="relative">
                    <input
                      type="number"
                      min="1"
                      value={orderQuantity}
                      onChange={(e) => setOrderQuantity(e.target.value)}
                      className="w-full bg-[#131722] border border-[#2a2e39] rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:outline-hidden focus:border-[#2962ff]"
                    />
                    <span className="absolute right-3 top-2 text-[10px] text-slate-400 font-mono">
                      UNIT
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs font-mono text-slate-400 px-1">
                  <span>Est. Value:</span>
                  <span className="font-bold text-white">
                    $
                    {(
                      (parseFloat(orderQuantity) || 1) * asset.price
                    ).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                <button
                  type="submit"
                  className={`w-full py-2 px-4 rounded-lg font-bold text-xs text-white transition-opacity shadow-xs cursor-pointer ${
                    orderType === 'buy' ? 'bg-[#089981] hover:opacity-90' : 'bg-[#f23645] hover:opacity-90'
                  }`}
                >
                  {orderType === 'buy' ? 'Place Buy Order' : 'Place Sell Order'}
                </button>
              </form>
            </div>

            {/* Quick Price Alert Configuration */}
            <div className="p-4 space-y-2">
              <div className="text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center justify-between">
                <span>Set Price Alert</span>
                <Bell className="w-3.5 h-3.5 text-amber-400" />
              </div>

              {alertSuccessMsg && (
                <div className="p-2 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs">
                  Alert armed for ${alertPriceInput}!
                </div>
              )}

              <form onSubmit={handleCreateAlert} className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-1.5 text-xs text-slate-400">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={alertPriceInput}
                    onChange={(e) => setAlertPriceInput(e.target.value)}
                    placeholder="Alert price"
                    className="w-full bg-[#131722] border border-[#2a2e39] rounded-lg pl-6 pr-2 py-1.5 text-xs font-mono text-white focus:outline-hidden focus:border-amber-400"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#2a2e39] hover:bg-[#363a45] text-white text-xs font-semibold rounded-lg transition-colors border border-[#363a45] shrink-0"
                >
                  Arm Alert
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
