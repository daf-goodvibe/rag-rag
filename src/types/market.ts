export type AssetCategory = 'indices' | 'stocks' | 'crypto' | 'forex' | 'commodities' | 'bonds';

export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1D' | '5D' | '1M' | '3M' | '6M' | '1Y' | '5Y' | 'ALL';

export type TechnicalSignal = 'Strong Buy' | 'Buy' | 'Neutral' | 'Sell' | 'Strong Sell';

export type ChartStyle = 'candles' | 'hollow' | 'heikin' | 'area' | 'baseline' | 'line';

export type DrawingToolType = 'cursor' | 'trendline' | 'horizontal' | 'fib' | 'position' | 'measure' | 'text';

export type GridLayout = '1' | '2-vert' | '2-horiz' | '4';

export interface Candle {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketAsset {
  symbol: string;
  name: string;
  category: AssetCategory;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  open: number;
  dayHigh: number;
  dayLow: number;
  yearHigh: number;
  yearLow: number;
  volume: string;
  volumeNum: number;
  marketCap?: string;
  marketCapNum?: number;
  peRatio?: number;
  dividendYield?: number;
  sector?: string;
  exchange: string;
  logoUrl?: string;
  sparkline: number[];
  technicalRating: TechnicalSignal;
  rsi14: number;
  beta?: number;
  avgVolume?: string;
}

export interface HeatmapItem {
  symbol: string;
  name: string;
  marketCap: number;
  changePercent: number;
  price: number;
  sector: string;
}

export interface HeatmapSector {
  name: string;
  totalMarketCap: number;
  items: HeatmapItem[];
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  timeAgo: string;
  timestamp: number;
  url?: string;
  relatedSymbols: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  summary: string;
  imageUrl?: string;
}

export interface EconomicEvent {
  id: string;
  time: string;
  date: string;
  country: string;
  countryCode: string;
  event: string;
  impact: 'high' | 'medium' | 'low';
  actual?: string;
  forecast?: string;
  previous?: string;
}

export interface WatchlistEntry {
  symbol: string;
  addedAt: number;
  alertPrice?: number;
  alertCondition?: 'above' | 'below';
}

export interface Level2Order {
  price: number;
  size: number;
  total: number;
  depthPct: number;
}

export interface TimeAndSaleTrade {
  id: string;
  time: string;
  price: number;
  size: number;
  side: 'buy' | 'sell';
}

export interface BacktestTrade {
  id: string;
  type: 'LONG' | 'SHORT';
  entryTime: string;
  entryPrice: number;
  exitTime: string;
  exitPrice: number;
  pnl: number;
  pnlPct: number;
}

export interface StrategyReport {
  name: string;
  netProfit: number;
  netProfitPct: number;
  profitFactor: number;
  maxDrawdownPct: number;
  winRatePct: number;
  totalTrades: number;
  trades: BacktestTrade[];
}

export interface UserDrawing {
  id: string;
  type: DrawingToolType;
  x1: number;
  y1: number;
  x2?: number;
  y2?: number;
  price1: number;
  price2?: number;
  text?: string;
  color?: string;
}
