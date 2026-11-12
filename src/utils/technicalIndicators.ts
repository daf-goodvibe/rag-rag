import { Candle } from '../types/market';

// Simple Moving Average
export function calculateSMA(data: number[], period: number): (number | null)[] {
  return data.map((_, idx, arr) => {
    if (idx < period - 1) return null;
    const slice = arr.slice(idx - period + 1, idx + 1);
    const sum = slice.reduce((a, b) => a + b, 0);
    return sum / period;
  });
}

// Exponential Moving Average
export function calculateEMA(data: number[], period: number): (number | null)[] {
  const k = 2 / (period + 1);
  const emaValues: (number | null)[] = [];
  let prevEMA: number | null = null;

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      emaValues.push(null);
    } else if (i === period - 1) {
      // First EMA is SMA
      const slice = data.slice(0, period);
      const sum = slice.reduce((a, b) => a + b, 0);
      prevEMA = sum / period;
      emaValues.push(prevEMA);
    } else {
      const currentPrice = data[i];
      const nextEMA: number = currentPrice * k + (prevEMA !== null ? prevEMA : currentPrice) * (1 - k);
      prevEMA = nextEMA;
      emaValues.push(nextEMA);
    }
  }

  return emaValues;
}

// Bollinger Bands (20, 2)
export function calculateBollingerBands(
  closes: number[],
  period = 20,
  stdDevMultiplier = 2
): { upper: (number | null)[]; middle: (number | null)[]; lower: (number | null)[] } {
  const middle = calculateSMA(closes, period);
  const upper: (number | null)[] = [];
  const lower: (number | null)[] = [];

  for (let i = 0; i < closes.length; i++) {
    const mid = middle[i];
    if (mid === null || i < period - 1) {
      upper.push(null);
      lower.push(null);
    } else {
      const slice = closes.slice(i - period + 1, i + 1);
      const variance =
        slice.reduce((acc, val) => acc + Math.pow(val - mid, 2), 0) / period;
      const stdDev = Math.sqrt(variance);
      upper.push(mid + stdDevMultiplier * stdDev);
      lower.push(mid - stdDevMultiplier * stdDev);
    }
  }

  return { upper, middle, lower };
}

// MACD (12, 26, 9)
export function calculateMACD(
  closes: number[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
): {
  macdLine: (number | null)[];
  signalLine: (number | null)[];
  histogram: (number | null)[];
} {
  const fastEMA = calculateEMA(closes, fastPeriod);
  const slowEMA = calculateEMA(closes, slowPeriod);

  const macdLine: (number | null)[] = [];
  for (let i = 0; i < closes.length; i++) {
    const f = fastEMA[i];
    const s = slowEMA[i];
    if (f === null || s === null) {
      macdLine.push(null);
    } else {
      macdLine.push(f - s);
    }
  }

  // Calculate Signal Line (EMA of MACD line)
  const validMacdStartIndex = macdLine.findIndex((v) => v !== null);
  const signalLine: (number | null)[] = new Array(closes.length).fill(null);

  if (validMacdStartIndex !== -1) {
    const validMacdValues = macdLine.slice(validMacdStartIndex) as number[];
    const calculatedSignal = calculateEMA(validMacdValues, signalPeriod);

    for (let i = 0; i < calculatedSignal.length; i++) {
      signalLine[validMacdStartIndex + i] = calculatedSignal[i];
    }
  }

  // Calculate Histogram = MACD - Signal
  const histogram: (number | null)[] = [];
  for (let i = 0; i < closes.length; i++) {
    const m = macdLine[i];
    const s = signalLine[i];
    if (m === null || s === null) {
      histogram.push(null);
    } else {
      histogram.push(m - s);
    }
  }

  return { macdLine, signalLine, histogram };
}

// Heikin-Ashi Transform
export function transformHeikinAshi(candles: Candle[]): Candle[] {
  const haCandles: Candle[] = [];

  for (let i = 0; i < candles.length; i++) {
    const curr = candles[i];
    const haClose = (curr.open + curr.high + curr.low + curr.close) / 4;

    let haOpen: number;
    if (i === 0) {
      haOpen = (curr.open + curr.close) / 2;
    } else {
      haOpen = (haCandles[i - 1].open + haCandles[i - 1].close) / 2;
    }

    const haHigh = Math.max(curr.high, haOpen, haClose);
    const haLow = Math.min(curr.low, haOpen, haClose);

    haCandles.push({
      ...curr,
      open: Number(haOpen.toFixed(2)),
      high: Number(haHigh.toFixed(2)),
      low: Number(haLow.toFixed(2)),
      close: Number(haClose.toFixed(2)),
    });
  }

  return haCandles;
}

// Volume Weighted Average Price (VWAP)
export function calculateVWAP(candles: Candle[]): (number | null)[] {
  let cumulativeTypicalVol = 0;
  let cumulativeVol = 0;

  return candles.map((c) => {
    const typicalPrice = (c.high + c.low + c.close) / 3;
    cumulativeTypicalVol += typicalPrice * c.volume;
    cumulativeVol += c.volume;
    return cumulativeVol > 0 ? cumulativeTypicalVol / cumulativeVol : null;
  });
}

// Web Audio API feedback for PRO interactions
let audioCtx: AudioContext | null = null;

export function playAudioCue(type: 'click' | 'order' | 'alert' | 'tool') {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (!audioCtx || audioCtx.state === 'suspended') {
      audioCtx?.resume();
    }
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'click') {
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.04);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === 'order') {
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(880, now + 0.08);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'alert') {
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.setValueAtTime(1200, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (type === 'tool') {
      osc.frequency.setValueAtTime(750, now);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
      osc.start(now);
      osc.stop(now + 0.03);
    }
  } catch {
    // Graceful fallback if audio is not permitted by browser policy
  }
}
