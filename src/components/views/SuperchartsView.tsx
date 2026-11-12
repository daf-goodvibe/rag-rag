import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  MarketAsset,
  Timeframe,
  ChartStyle,
  DrawingToolType,
  GridLayout,
  Candle,
  UserDrawing,
} from '../../types/market';
import { generateCandles } from '../../data/marketsData';
import {
  calculateEMA,
  calculateSMA,
  calculateBollingerBands,
  calculateMACD,
  transformHeikinAshi,
  calculateVWAP,
  playAudioCue,
} from '../../utils/technicalIndicators';
import { AssetLogo } from '../ui/AssetLogo';
import { DepthOfMarket } from '../pro/DepthOfMarket';
import { StrategyBacktester } from '../pro/StrategyBacktester';
import {
  BarChart2,
  LineChart,
  Sliders,
  Maximize2,
  Volume2,
  VolumeX,
  Plus,
  Trash2,
  MousePointer,
  Minus,
  TrendingUp,
  TrendingDown,
  Layers,
  ChevronDown,
  Grid2X2,
  Columns2,
  Square,
  Clock,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';

interface SuperchartsViewProps {
  assets: MarketAsset[];
  initialAsset?: MarketAsset;
  onSelectAsset?: (asset: MarketAsset) => void;
}

export const SuperchartsView: React.FC<SuperchartsViewProps> = ({
  assets,
  initialAsset,
  onSelectAsset,
}) => {
  // Main selected asset
  const [activeAsset, setActiveAsset] = useState<MarketAsset>(
    initialAsset || assets.find((a) => a.symbol === 'NVDA') || assets[0]
  );

  // Timeframe and chart styles
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const [chartStyle, setChartStyle] = useState<ChartStyle>('candles');
  const [activeTool, setActiveTool] = useState<DrawingToolType>('cursor');
  const [drawings, setDrawings] = useState<UserDrawing[]>([]);

  // Indicators toggle state
  const [indicators, setIndicators] = useState({
    ema9: true,
    ema21: true,
    sma50: false,
    sma200: false,
    bollinger: false,
    vwap: true,
    macd: true,
    rsi: true,
    volume: true,
  });

  const [isIndicatorsOpen, setIsIndicatorsOpen] = useState(false);
  const [gridLayout, setGridLayout] = useState<GridLayout>('1');
  const [isDOMOpen, setIsDOMOpen] = useState(true);
  const [isBacktesterOpen, setIsBacktesterOpen] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Compare asset overlay
  const [compareSymbol, setCompareSymbol] = useState<string | null>(null);

  // Selected secondary assets for multi-grid mode
  const [secondaryAsset1, setSecondaryAsset1] = useState<MarketAsset>(
    assets.find((a) => a.symbol === 'AAPL') || assets[1]
  );
  const [secondaryAsset2, setSecondaryAsset2] = useState<MarketAsset>(
    assets.find((a) => a.symbol === 'BTCUSD') || assets[2]
  );
  const [secondaryAsset3, setSecondaryAsset3] = useState<MarketAsset>(
    assets.find((a) => a.symbol === 'TSLA') || assets[3]
  );

  // Audio helper
  const triggerAudio = (type: 'click' | 'order' | 'alert' | 'tool') => {
    if (isAudioEnabled) playAudioCue(type);
  };

  // Generate dynamic candles
  const rawCandles = useMemo(() => {
    return generateCandles(activeAsset.price, timeframe, 60).candles;
  }, [activeAsset, timeframe]);

  // Apply Heikin-Ashi if selected
  const candles: Candle[] = useMemo(() => {
    if (chartStyle === 'heikin') {
      return transformHeikinAshi(rawCandles);
    }
    return rawCandles;
  }, [rawCandles, chartStyle]);

  const closes = useMemo(() => candles.map((c) => c.close), [candles]);

  // Calculated Indicators
  const ema9Series = useMemo(() => calculateEMA(closes, 9), [closes]);
  const ema21Series = useMemo(() => calculateEMA(closes, 21), [closes]);
  const sma50Series = useMemo(() => calculateSMA(closes, 50), [closes]);
  const sma200Series = useMemo(() => calculateSMA(closes, 200), [closes]);
  const bollingerSeries = useMemo(() => calculateBollingerBands(closes, 20, 2), [closes]);
  const vwapSeries = useMemo(() => calculateVWAP(candles), [candles]);
  const macdData = useMemo(() => calculateMACD(closes, 12, 26, 9), [closes]);

  // Handle canvas drawing click
  const handleChartClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (activeTool === 'cursor') return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratioX = clickX / rect.width;
    const index = Math.floor(ratioX * (candles.length - 1));
    const targetCandle = candles[index];

    if (!targetCandle) return;

    triggerAudio('tool');

    if (activeTool === 'horizontal') {
      const newDrawing: UserDrawing = {
        id: `draw-${Date.now()}`,
        type: 'horizontal',
        x1: 0,
        y1: targetCandle.close,
        price1: targetCandle.close,
        color: '#fbbf24',
      };
      setDrawings((prev) => [...prev, newDrawing]);
      setActiveTool('cursor');
    } else if (activeTool === 'trendline') {
      const newDrawing: UserDrawing = {
        id: `draw-${Date.now()}`,
        type: 'trendline',
        x1: Math.max(0, index - 15),
        y1: targetCandle.close * 0.96,
        x2: index,
        y2: targetCandle.close,
        price1: targetCandle.close * 0.96,
        price2: targetCandle.close,
        color: '#38bdf8',
      };
      setDrawings((prev) => [...prev, newDrawing]);
      setActiveTool('cursor');
    } else if (activeTool === 'fib') {
      const newDrawing: UserDrawing = {
        id: `draw-${Date.now()}`,
        type: 'fib',
        x1: Math.max(0, index - 20),
        y1: targetCandle.close * 0.94,
        x2: index,
        y2: targetCandle.close * 1.04,
        price1: targetCandle.close * 0.94,
        price2: targetCandle.close * 1.04,
        color: '#a855f7',
      };
      setDrawings((prev) => [...prev, newDrawing]);
      setActiveTool('cursor');
    } else if (activeTool === 'text') {
      const label = window.prompt('Enter chart annotation text:', 'Support Zone') || 'Note';
      const newDrawing: UserDrawing = {
        id: `draw-${Date.now()}`,
        type: 'text',
        x1: index,
        y1: targetCandle.close,
        price1: targetCandle.close,
        text: label,
        color: '#2962ff',
      };
      setDrawings((prev) => [...prev, newDrawing]);
      setActiveTool('cursor');
    }
  };

  const clearAllDrawings = () => {
    triggerAudio('click');
    setDrawings([]);
  };

  // Geometry calculations
  const chartHeight = 420;
  const volumeHeight = indicators.volume ? 70 : 0;
  const macdHeight = indicators.macd ? 85 : 0;
  const rsiHeight = indicators.rsi ? 75 : 0;
  const totalSvgHeight = chartHeight + volumeHeight + macdHeight + rsiHeight;

  const minPrice = Math.min(...candles.map((c) => c.low));
  const maxPrice = Math.max(...candles.map((c) => c.high));
  const priceRange = maxPrice - minPrice || 1;
  const maxVolume = Math.max(...candles.map((c) => c.volume)) || 1;

  const getPriceY = (price: number) => {
    const padding = 15;
    const available = chartHeight - padding * 2;
    return chartHeight - padding - ((price - minPrice) / priceRange) * available;
  };

  const currentHoverCandle = hoverIndex !== null && candles[hoverIndex] ? candles[hoverIndex] : null;
  const isPos = activeAsset.change >= 0;

  // Single Chart Sub-Component for Grid Layout
  const renderSingleChartInstance = (assetToRender: MarketAsset, showControls = false) => {
    const cData = generateCandles(assetToRender.price, timeframe, 40).candles;
    const minP = Math.min(...cData.map((c) => c.low));
    const maxP = Math.max(...cData.map((c) => c.high));
    const range = maxP - minP || 1;
    const isP = assetToRender.change >= 0;

    return (
      <div className="flex flex-col h-full bg-[#131722] border border-[#2a2e39] rounded-lg p-2 overflow-hidden select-none">
        <div className="flex items-center justify-between px-2 py-1 bg-[#1e222d] rounded border border-[#2a2e39]/60 text-xs">
          <div className="flex items-center gap-2">
            <AssetLogo symbol={assetToRender.symbol} logoUrl={assetToRender.logoUrl} size="sm" />
            <span className="font-bold text-white font-mono">{assetToRender.symbol}</span>
            <span className="text-[10px] text-slate-400 font-mono">{timeframe}</span>
          </div>
          <div className="flex items-center gap-2 font-mono">
            <span className="font-bold text-white">
              ${assetToRender.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span className={`text-[11px] ${isP ? 'text-[#089981]' : 'text-[#f23645]'}`}>
              {isP ? '+' : ''}
              {assetToRender.changePercent.toFixed(2)}%
            </span>
          </div>
        </div>

        <div className="flex-1 w-full mt-2">
          <svg width="100%" height="100%" viewBox="0 0 500 220" preserveAspectRatio="none">
            {cData.map((c, i) => {
              const x = (i / (cData.length - 1)) * 480 + 10;
              const openY = 200 - ((c.open - minP) / range) * 180;
              const closeY = 200 - ((c.close - minP) / range) * 180;
              const highY = 200 - ((c.high - minP) / range) * 180;
              const lowY = 200 - ((c.low - minP) / range) * 180;
              const isBull = c.close >= c.open;
              const col = isBull ? '#089981' : '#f23645';
              return (
                <g key={i}>
                  <line x1={x} y1={highY} x2={x} y2={lowY} stroke={col} strokeWidth="1" />
                  <rect
                    x={x - 3}
                    y={Math.min(openY, closeY)}
                    width="6"
                    height={Math.max(2, Math.abs(closeY - openY))}
                    fill={col}
                    rx="0.5"
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[750px] bg-[#131722] text-[#d1d4dc] border border-[#2a2e39] rounded-xl overflow-hidden shadow-2xl animate-in fade-in duration-200">
      {/* 1. Pro Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-[#2a2e39] bg-[#1e222d] text-xs">
        {/* Left: Active Symbol Quick Switcher + Exchanges */}
        <div className="flex items-center gap-2">
          {/* Pro Badge */}
          <span className="px-1.5 py-0.5 rounded bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-[10px] tracking-wider uppercase shadow-xs">
            PRO+
          </span>

          <div className="relative">
            <select
              value={activeAsset.symbol}
              onChange={(e) => {
                const found = assets.find((a) => a.symbol === e.target.value);
                if (found) {
                  setActiveAsset(found);
                  triggerAudio('click');
                }
              }}
              className="appearance-none bg-[#131722] hover:bg-[#2a2e39] border border-[#2a2e39] text-white font-mono font-bold text-xs pl-2.5 pr-7 py-1.5 rounded-lg focus:outline-hidden focus:border-[#2962ff] cursor-pointer"
            >
              {assets.map((a) => (
                <option key={a.symbol} value={a.symbol}>
                  {a.symbol} · {a.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-2 pointer-events-none" />
          </div>

          {/* Timeframe Selectors */}
          <div className="flex items-center bg-[#131722] p-0.5 rounded-lg border border-[#2a2e39] ml-1 overflow-x-auto no-scrollbar">
            {(['1m', '5m', '15m', '1h', '4h', '1D', '1W'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => {
                  setTimeframe(tf as any);
                  triggerAudio('click');
                }}
                className={`px-2 py-1 rounded font-semibold text-[11px] transition-colors cursor-pointer ${
                  timeframe === tf
                    ? 'bg-[#2962ff] text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Chart Style Switcher */}
          <div className="flex items-center bg-[#131722] p-0.5 rounded-lg border border-[#2a2e39] ml-1">
            <button
              onClick={() => {
                setChartStyle('candles');
                triggerAudio('click');
              }}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                chartStyle === 'candles' ? 'bg-[#2a2e39] text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Regular Japanese Candlesticks"
            >
              Candles
            </button>
            <button
              onClick={() => {
                setChartStyle('heikin');
                triggerAudio('click');
              }}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                chartStyle === 'heikin' ? 'bg-[#2a2e39] text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Heikin Ashi Smoothed Trend"
            >
              Heikin Ashi
            </button>
            <button
              onClick={() => {
                setChartStyle('area');
                triggerAudio('click');
              }}
              className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer ${
                chartStyle === 'area' ? 'bg-[#2a2e39] text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Mountain Area"
            >
              Area
            </button>
          </div>
        </div>

        {/* Right: Pro Indicators & Grid Layout Controls */}
        <div className="flex items-center gap-2">
          {/* Indicators Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setIsIndicatorsOpen(!isIndicatorsOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#131722] hover:bg-[#2a2e39] text-slate-200 border border-[#2a2e39] font-semibold cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-[#2962ff]" />
              <span>Indicators ({Object.values(indicators).filter(Boolean).length})</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isIndicatorsOpen && (
              <div
                className="absolute right-0 top-9 z-50 w-56 bg-[#1e222d] rounded-xl border border-[#2a2e39] p-3 shadow-2xl space-y-2 text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="font-bold text-slate-200 border-b border-[#2a2e39] pb-1.5 flex justify-between">
                  <span>Overlay Indicators</span>
                  <button
                    onClick={() => setIsIndicatorsOpen(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                {[
                  { id: 'ema9', label: 'EMA 9 (Fast)', color: '#38bdf8' },
                  { id: 'ema21', label: 'EMA 21 (Medium)', color: '#fbbf24' },
                  { id: 'sma50', label: 'SMA 50 (Major)', color: '#c084fc' },
                  { id: 'sma200', label: 'SMA 200 (Long)', color: '#f43f5e' },
                  { id: 'bollinger', label: 'Bollinger Bands (20, 2)', color: '#a78bfa' },
                  { id: 'vwap', label: 'VWAP (Volume Weighted)', color: '#34d399' },
                  { id: 'macd', label: 'MACD (12, 26, 9)', color: '#60a5fa' },
                  { id: 'rsi', label: 'RSI (14)', color: '#e879f9' },
                  { id: 'volume', label: 'Volume Histogram', color: '#94a3b8' },
                ].map((ind) => (
                  <label
                    key={ind.id}
                    className="flex items-center justify-between cursor-pointer hover:bg-[#131722] p-1.5 rounded"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: ind.color }}
                      />
                      <span>{ind.label}</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={indicators[ind.id as keyof typeof indicators]}
                      onChange={(e) => {
                        setIndicators((prev) => ({ ...prev, [ind.id]: e.target.checked }));
                        triggerAudio('click');
                      }}
                      className="accent-[#2962ff] cursor-pointer"
                    />
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Grid Layout Switcher (1x1, 2x1, 2x2) */}
          <div className="flex items-center bg-[#131722] p-0.5 rounded-lg border border-[#2a2e39]">
            <button
              onClick={() => {
                setGridLayout('1');
                triggerAudio('click');
              }}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                gridLayout === '1' ? 'bg-[#2962ff] text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Single Chart View"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setGridLayout('2-vert');
                triggerAudio('click');
              }}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                gridLayout === '2-vert' ? 'bg-[#2962ff] text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Dual Chart View"
            >
              <Columns2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setGridLayout('4');
                triggerAudio('click');
              }}
              className={`p-1.5 rounded transition-colors cursor-pointer ${
                gridLayout === '4' ? 'bg-[#2962ff] text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Quad 4-Chart Grid"
            >
              <Grid2X2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Depth of Market Toggle */}
          <button
            onClick={() => {
              setIsDOMOpen(!isDOMOpen);
              triggerAudio('click');
            }}
            className={`px-2.5 py-1.5 rounded-lg border font-semibold text-xs transition-colors cursor-pointer ${
              isDOMOpen
                ? 'bg-[#2962ff]/20 text-[#2962ff] border-[#2962ff]/40'
                : 'bg-[#131722] text-slate-300 border-[#2a2e39]'
            }`}
          >
            DOM / L2
          </button>

          {/* Strategy Tester Toggle */}
          <button
            onClick={() => {
              setIsBacktesterOpen(!isBacktesterOpen);
              triggerAudio('click');
            }}
            className={`px-2.5 py-1.5 rounded-lg border font-semibold text-xs transition-colors cursor-pointer ${
              isBacktesterOpen
                ? 'bg-[#2962ff]/20 text-[#2962ff] border-[#2962ff]/40'
                : 'bg-[#131722] text-slate-300 border-[#2a2e39]'
            }`}
          >
            Backtest
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setIsAudioEnabled(!isAudioEnabled)}
            className="p-1.5 rounded-lg bg-[#131722] hover:bg-[#2a2e39] text-slate-400 hover:text-white border border-[#2a2e39]"
            title={isAudioEnabled ? 'Mute Pro Audio Cues' : 'Enable Pro Audio Cues'}
          >
            {isAudioEnabled ? (
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <VolumeX className="w-3.5 h-3.5 text-slate-500" />
            )}
          </button>
        </div>
      </div>

      {/* 2. Main Terminal Body: Left Drawing Rail + Center Multi-Chart Canvas + Right DOM */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Drawing Tools Rail (TradingView Signature) */}
        <aside className="w-12 bg-[#1e222d] border-r border-[#2a2e39] flex flex-col items-center py-2 gap-1 shrink-0 select-none">
          {[
            { id: 'cursor', label: 'Crosshair', icon: MousePointer },
            { id: 'trendline', label: 'Trendline Ray', icon: ArrowUpRight },
            { id: 'horizontal', label: 'Horizontal Ray', icon: Minus },
            { id: 'fib', label: 'Fibonacci Levels', icon: Layers },
            { id: 'text', label: 'Text Note', icon: Sparkles },
          ].map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => {
                  setActiveTool(tool.id as any);
                  triggerAudio('tool');
                }}
                className={`p-2.5 rounded-lg transition-colors cursor-pointer group relative ${
                  isActive
                    ? 'bg-[#2962ff] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-[#131722]'
                }`}
                title={tool.label}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}

          <div className="w-6 h-px bg-[#2a2e39] my-2" />

          {/* Clear Drawings Button */}
          {drawings.length > 0 && (
            <button
              onClick={clearAllDrawings}
              className="p-2.5 rounded-lg text-slate-400 hover:text-[#f23645] hover:bg-[#131722] transition-colors"
              title="Clear all drawings"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </aside>

        {/* Center Main Viewport Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#131722] relative">
          {/* Active Crosshair Inspection Ticker Bar */}
          {currentHoverCandle && (
            <div className="flex flex-wrap items-center gap-3 px-4 py-1.5 bg-[#1e222d]/80 border-b border-[#2a2e39] text-[11px] font-mono text-slate-400 shrink-0">
              <span className="text-white font-bold">{activeAsset.symbol}</span>
              <span>Time: <strong className="text-white">{currentHoverCandle.time}</strong></span>
              <span>O: <strong className="text-white">${currentHoverCandle.open.toFixed(2)}</strong></span>
              <span>H: <strong className="text-white">${currentHoverCandle.high.toFixed(2)}</strong></span>
              <span>L: <strong className="text-white">${currentHoverCandle.low.toFixed(2)}</strong></span>
              <span>C: <strong className="text-white">${currentHoverCandle.close.toFixed(2)}</strong></span>
              <span>Vol: <strong className="text-white">{currentHoverCandle.volume.toLocaleString()}</strong></span>
            </div>
          )}

          {/* Grid Layout Container */}
          <div className="flex-1 p-2 overflow-hidden">
            {gridLayout === '1' && (
              /* Single Full Pro Chart with Live Indicators and Interactive Drawings */
              <div
                className="w-full h-full relative cursor-crosshair select-none"
                onMouseLeave={() => setHoverIndex(null)}
              >
                <svg
                  width="100%"
                  height="100%"
                  viewBox={`0 0 1000 ${totalSvgHeight}`}
                  preserveAspectRatio="none"
                  className="w-full h-full"
                  onClick={handleChartClick}
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const ratio = Math.max(0, Math.min(1, x / rect.width));
                    const idx = Math.floor(ratio * (candles.length - 1));
                    setHoverIndex(idx);
                  }}
                >
                  <defs>
                    <linearGradient id="proAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={isPos ? '#089981' : '#f23645'} stopOpacity="0.35" />
                      <stop offset="100%" stopColor={isPos ? '#089981' : '#f23645'} stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  {[0.2, 0.4, 0.6, 0.8].map((ratio, i) => {
                    const y = chartHeight * ratio;
                    const pVal = maxPrice - ratio * priceRange;
                    return (
                      <g key={i}>
                        <line x1="0" y1={y} x2="940" y2={y} stroke="#2a2e39" strokeDasharray="4 4" strokeWidth="1" />
                        <text x="945" y={y + 4} fill="#787b86" fontSize="10" fontFamily="monospace">
                          ${pVal.toFixed(2)}
                        </text>
                      </g>
                    );
                  })}

                  {/* Bollinger Bands Cloud Overlay */}
                  {indicators.bollinger && (
                    <g>
                      {/* Upper & Lower Bands */}
                      <path
                        d={candles
                          .map((_, i) => {
                            const u = bollingerSeries.upper[i];
                            if (u === null) return null;
                            const x = (i / (candles.length - 1)) * 900 + 10;
                            const y = getPriceY(u);
                            return `${x.toFixed(1)},${y.toFixed(1)}`;
                          })
                          .filter((p): p is string => p !== null)
                          .reduce((acc, p, idx) => (idx === 0 ? `M ${p}` : `${acc} L ${p}`), '')}
                        fill="none"
                        stroke="#a78bfa"
                        strokeWidth="1.2"
                        strokeDasharray="2 2"
                      />
                      <path
                        d={candles
                          .map((_, i) => {
                            const l = bollingerSeries.lower[i];
                            if (l === null) return null;
                            const x = (i / (candles.length - 1)) * 900 + 10;
                            const y = getPriceY(l);
                            return `${x.toFixed(1)},${y.toFixed(1)}`;
                          })
                          .filter((p): p is string => p !== null)
                          .reduce((acc, p, idx) => (idx === 0 ? `M ${p}` : `${acc} L ${p}`), '')}
                        fill="none"
                        stroke="#a78bfa"
                        strokeWidth="1.2"
                        strokeDasharray="2 2"
                      />
                    </g>
                  )}

                  {/* Candlesticks OR Mountain Area Mode */}
                  {chartStyle === 'candles' || chartStyle === 'heikin' ? (
                    candles.map((c, i) => {
                      const count = candles.length;
                      const candleW = Math.max(3, 900 / count - 3);
                      const x = (i / (count - 1)) * 900 + 10;
                      const openY = getPriceY(c.open);
                      const closeY = getPriceY(c.close);
                      const highY = getPriceY(c.high);
                      const lowY = getPriceY(c.low);
                      const isBull = c.close >= c.open;
                      const col = isBull ? '#089981' : '#f23645';

                      return (
                        <g key={i}>
                          <line x1={x} y1={highY} x2={x} y2={lowY} stroke={col} strokeWidth="1.2" />
                          <rect
                            x={x - candleW / 2}
                            y={Math.min(openY, closeY)}
                            width={candleW}
                            height={Math.max(2, Math.abs(closeY - openY))}
                            fill={col}
                            rx="0.5"
                          />
                        </g>
                      );
                    })
                  ) : (
                    /* Area Chart */
                    (() => {
                      const pts = candles.map((c, i) => {
                        const x = (i / (candles.length - 1)) * 900 + 10;
                        const y = getPriceY(c.close);
                        return `${x.toFixed(1)},${y.toFixed(1)}`;
                      });
                      const pathD = `M ${pts.join(' L ')}`;
                      const areaD = `${pathD} L 910,${chartHeight} L 10,${chartHeight} Z`;
                      return (
                        <g>
                          <path d={areaD} fill="url(#proAreaGrad)" />
                          <path d={pathD} fill="none" stroke={isPos ? '#089981' : '#f23645'} strokeWidth="2" />
                        </g>
                      );
                    })()
                  )}

                  {/* EMA 9 Line (Sky Blue) */}
                  {indicators.ema9 && (
                    <path
                      d={candles
                        .map((_, i) => {
                          const val = ema9Series[i];
                          if (val === null) return null;
                          const x = (i / (candles.length - 1)) * 900 + 10;
                          return `${x.toFixed(1)},${getPriceY(val).toFixed(1)}`;
                        })
                        .filter((p): p is string => p !== null)
                        .reduce((acc, p, idx) => (idx === 0 ? `M ${p}` : `${acc} L ${p}`), '') || undefined}
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="1.6"
                    />
                  )}

                  {/* EMA 21 Line (Amber) */}
                  {indicators.ema21 && (
                    <path
                      d={candles
                        .map((_, i) => {
                          const val = ema21Series[i];
                          if (val === null) return null;
                          const x = (i / (candles.length - 1)) * 900 + 10;
                          return `${x.toFixed(1)},${getPriceY(val).toFixed(1)}`;
                        })
                        .filter((p): p is string => p !== null)
                        .reduce((acc, p, idx) => (idx === 0 ? `M ${p}` : `${acc} L ${p}`), '') || undefined}
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth="1.6"
                    />
                  )}

                  {/* VWAP Line (Emerald green dotted) */}
                  {indicators.vwap && (
                    <path
                      d={candles
                        .map((_, i) => {
                          const val = vwapSeries[i];
                          if (val === null) return null;
                          const x = (i / (candles.length - 1)) * 900 + 10;
                          return `${x.toFixed(1)},${getPriceY(val).toFixed(1)}`;
                        })
                        .filter((p): p is string => p !== null)
                        .reduce((acc, p, idx) => (idx === 0 ? `M ${p}` : `${acc} L ${p}`), '') || undefined}
                      fill="none"
                      stroke="#34d399"
                      strokeWidth="1.5"
                      strokeDasharray="4 2"
                    />
                  )}

                  {/* User Drawings Render Layer */}
                  {drawings.map((draw) => {
                    if (draw.type === 'horizontal') {
                      const y = getPriceY(draw.price1);
                      return (
                        <g key={draw.id}>
                          <line x1="0" y1={y} x2="940" y2={y} stroke={draw.color || '#fbbf24'} strokeWidth="1.5" strokeDasharray="3 3" />
                          <text x="10" y={y - 4} fill={draw.color || '#fbbf24'} fontSize="10" fontFamily="monospace">
                            Support / Resistance: ${draw.price1.toFixed(2)}
                          </text>
                        </g>
                      );
                    }
                    if (draw.type === 'trendline' && draw.x2 !== undefined && draw.price2 !== undefined) {
                      const x1 = (draw.x1 / (candles.length - 1)) * 900 + 10;
                      const y1 = getPriceY(draw.price1);
                      const x2 = (draw.x2 / (candles.length - 1)) * 900 + 10;
                      const y2 = getPriceY(draw.price2);
                      return (
                        <line
                          key={draw.id}
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke={draw.color || '#38bdf8'}
                          strokeWidth="2"
                        />
                      );
                    }
                    if (draw.type === 'text') {
                      const x = (draw.x1 / (candles.length - 1)) * 900 + 10;
                      const y = getPriceY(draw.price1);
                      return (
                        <g key={draw.id}>
                          <rect x={x - 4} y={y - 18} width="90" height="20" fill="#2962ff" rx="3" />
                          <text x={x} y={y - 4} fill="#ffffff" fontSize="10" fontFamily="monospace" fontWeight="bold">
                            {draw.text}
                          </text>
                        </g>
                      );
                    }
                    return null;
                  })}

                  {/* Volume Histogram Sub-Panel */}
                  {indicators.volume && (
                    <g transform={`translate(0, ${chartHeight + 10})`}>
                      <line x1="0" y1="0" x2="940" y2="0" stroke="#2a2e39" strokeWidth="1" />
                      <text x="10" y="14" fill="#787b86" fontSize="10" fontFamily="monospace">
                        Vol: {((activeAsset.volumeNum || 1000000) / 1000000).toFixed(1)}M
                      </text>
                      {candles.map((c, i) => {
                        const count = candles.length;
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
                            fill={isBull ? 'rgba(8, 153, 129, 0.45)' : 'rgba(242, 54, 69, 0.45)'}
                            rx="0.5"
                          />
                        );
                      })}
                    </g>
                  )}

                  {/* MACD Sub-Panel */}
                  {indicators.macd && (
                    <g transform={`translate(0, ${chartHeight + volumeHeight + 15})`}>
                      <line x1="0" y1="0" x2="940" y2="0" stroke="#2a2e39" strokeWidth="1" />
                      <line x1="0" y1={macdHeight / 2} x2="940" y2={macdHeight / 2} stroke="#363a45" strokeDasharray="2 2" strokeWidth="1" />
                      <text x="10" y="14" fill="#60a5fa" fontSize="10" fontFamily="monospace">
                        MACD (12, 26, 9)
                      </text>

                      {/* MACD Histogram bars */}
                      {candles.map((_, i) => {
                        const hist = macdData.histogram[i];
                        if (hist === null) return null;
                        const count = candles.length;
                        const x = (i / (count - 1)) * 900 + 10;
                        const barW = Math.max(2, 900 / count - 3);
                        const midY = macdHeight / 2;
                        const barH = Math.min(35, Math.abs(hist) * 8);
                        const isHistPos = hist >= 0;
                        const y = isHistPos ? midY - barH : midY;

                        return (
                          <rect
                            key={i}
                            x={x - barW / 2}
                            y={y}
                            width={barW}
                            height={barH}
                            fill={isHistPos ? '#089981' : '#f23645'}
                            opacity="0.8"
                          />
                        );
                      })}
                    </g>
                  )}

                  {/* RSI Sub-Panel */}
                  {indicators.rsi && (
                    <g transform={`translate(0, ${chartHeight + volumeHeight + macdHeight + 15})`}>
                      <line x1="0" y1="0" x2="940" y2="0" stroke="#2a2e39" strokeWidth="1" />
                      <line x1="0" y1="18" x2="940" y2="18" stroke="#f23645" strokeDasharray="3 3" opacity="0.6" />
                      <line x1="0" y1="52" x2="940" y2="52" stroke="#089981" strokeDasharray="3 3" opacity="0.6" />
                      <text x="10" y="14" fill="#e879f9" fontSize="10" fontFamily="monospace">
                        RSI (14): {(activeAsset.rsi14 || 55).toFixed(1)}
                      </text>
                    </g>
                  )}

                  {/* Crosshair Cursor */}
                  {hoverIndex !== null && candles[hoverIndex] && (
                    <g>
                      {(() => {
                        const x = (hoverIndex / (candles.length - 1)) * 900 + 10;
                        const c = candles[hoverIndex];
                        const y = getPriceY(c.close);
                        return (
                          <>
                            <line x1={x} y1="0" x2={x} y2={totalSvgHeight} stroke="#787b86" strokeDasharray="3 3" strokeWidth="1" />
                            <line x1="0" y1={y} x2="940" y2={y} stroke="#787b86" strokeDasharray="3 3" strokeWidth="1" />
                            <rect x="935" y={y - 10} width="60" height="20" fill="#2962ff" rx="3" />
                            <text x="940" y={y + 3} fill="#ffffff" fontSize="10" fontFamily="monospace" fontWeight="bold">
                              ${c.close.toFixed(2)}
                            </text>
                          </>
                        );
                      })()}
                    </g>
                  )}
                </svg>
              </div>
            )}

            {gridLayout === '2-vert' && (
              /* Dual Split Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 h-full">
                {renderSingleChartInstance(activeAsset)}
                {renderSingleChartInstance(secondaryAsset1)}
              </div>
            )}

            {gridLayout === '4' && (
              /* Quad 4-Chart Grid View */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 h-full">
                {renderSingleChartInstance(activeAsset)}
                {renderSingleChartInstance(secondaryAsset1)}
                {renderSingleChartInstance(secondaryAsset2)}
                {renderSingleChartInstance(secondaryAsset3)}
              </div>
            )}
          </div>

          {/* Bottom Collapsible Strategy Backtester Panel */}
          {isBacktesterOpen && (
            <div className="h-48 shrink-0">
              <StrategyBacktester asset={activeAsset} />
            </div>
          )}
        </div>

        {/* Right Collapsible Level 2 DOM & Time & Sales */}
        {isDOMOpen && (
          <aside className="w-72 bg-[#1e222d] border-l border-[#2a2e39] flex flex-col shrink-0 overflow-hidden">
            <DepthOfMarket
              asset={activeAsset}
              onQuickBuy={(p) => {
                triggerAudio('order');
                alert(`Executed One-Click BUY for ${activeAsset.symbol} @ $${p.toFixed(2)}!`);
              }}
              onQuickSell={(p) => {
                triggerAudio('order');
                alert(`Executed One-Click SELL for ${activeAsset.symbol} @ $${p.toFixed(2)}!`);
              }}
            />
          </aside>
        )}
      </div>
    </div>
  );
};
