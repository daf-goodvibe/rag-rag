export type AssetCategory = 'indices' | 'stocks' | 'crypto' | 'forex' | 'commodities' | 'bonds';

export type Timeframe = '1D' | '5D' | '1M' | '3M' | '6M' | '1Y' | '5Y' | 'ALL';

export type TechnicalSignal = 'Strong Buy' | 'Buy' | 'Neutral' | 'Sell' | 'Strong Sell';

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
