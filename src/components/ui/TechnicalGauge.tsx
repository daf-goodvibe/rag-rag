import React from 'react';
import { TechnicalSignal } from '../../types/market';

interface TechnicalGaugeProps {
  rating: TechnicalSignal;
  rsi?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const TechnicalGauge: React.FC<TechnicalGaugeProps> = ({
  rating,
  rsi,
  className = '',
  size = 'md',
}) => {
  // Mapping rating to angle: -90 deg (Strong Sell) to +90 deg (Strong Buy)
  const angleMap: Record<TechnicalSignal, number> = {
    'Strong Sell': -72,
    'Sell': -36,
    'Neutral': 0,
    'Buy': 36,
    'Strong Buy': 72,
  };

  const colorMap: Record<TechnicalSignal, string> = {
    'Strong Sell': '#f23645',
    'Sell': '#f77c80',
    'Neutral': '#b2b5be',
    'Buy': '#4ec3ab',
    'Strong Buy': '#089981',
  };

  const needleAngle = angleMap[rating] ?? 0;
  const activeColor = colorMap[rating] ?? '#b2b5be';

  const dimensions = {
    sm: { width: 120, height: 70, radius: 45, needleLen: 38 },
    md: { width: 180, height: 105, radius: 70, needleLen: 60 },
    lg: { width: 240, height: 135, radius: 95, needleLen: 80 },
  }[size];

  const { width, height, radius, needleLen } = dimensions;
  const centerX = width / 2;
  const centerY = height - 10;

  // Arc path from -180 deg to 0 deg
  const describeArc = (x: number, y: number, r: number, startAngle: number, endAngle: number) => {
    const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
      const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
      return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians),
      };
    };

    const start = polarToCartesian(x, y, r, endAngle);
    const end = polarToCartesian(x, y, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return ['M', start.x, start.y, 'A', r, r, 0, largeArcFlag, 0, end.x, end.y].join(' ');
  };

  // Convert needle angle (-90 to +90) into SVG radians
  const needleRad = ((needleAngle - 90) * Math.PI) / 180;
  const needleEndX = centerX + needleLen * Math.cos(needleRad);
  const needleEndY = centerY + needleLen * Math.sin(needleRad);

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <div className="relative">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          {/* Background Track Segments */}
          {/* Strong Sell */}
          <path
            d={describeArc(centerX, centerY, radius, -90, -54)}
            fill="none"
            stroke="#f23645"
            strokeWidth="7"
            strokeLinecap="round"
            opacity="0.85"
          />
          {/* Sell */}
          <path
            d={describeArc(centerX, centerY, radius, -54, -18)}
            fill="none"
            stroke="#f77c80"
            strokeWidth="7"
            opacity="0.85"
          />
          {/* Neutral */}
          <path
            d={describeArc(centerX, centerY, radius, -18, 18)}
            fill="none"
            stroke="#787b86"
            strokeWidth="7"
            opacity="0.85"
          />
          {/* Buy */}
          <path
            d={describeArc(centerX, centerY, radius, 18, 54)}
            fill="none"
            stroke="#4ec3ab"
            strokeWidth="7"
            opacity="0.85"
          />
          {/* Strong Buy */}
          <path
            d={describeArc(centerX, centerY, radius, 54, 90)}
            fill="none"
            stroke="#089981"
            strokeWidth="7"
            strokeLinecap="round"
            opacity="0.85"
          />

          {/* Needle */}
          <line
            x1={centerX}
            y1={centerY}
            x2={needleEndX}
            y2={needleEndY}
            stroke={activeColor}
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle cx={centerX} cy={centerY} r="5" fill={activeColor} />
          <circle cx={centerX} cy={centerY} r="2.5" fill="#131722" />
        </svg>

        {/* Labels below arc */}
        <div className="flex justify-between w-full px-1 text-[10px] text-slate-400 font-mono mt-1">
          <span>Sell</span>
          <span>Neutral</span>
          <span>Buy</span>
        </div>
      </div>

      <div className="mt-2 text-center">
        <div
          className="text-sm font-semibold tracking-tight"
          style={{ color: activeColor }}
        >
          {rating}
        </div>
        {rsi !== undefined && (
          <div className="text-[11px] text-slate-400 font-mono mt-0.5">
            RSI(14): <span className="text-slate-200">{rsi.toFixed(1)}</span>
          </div>
        )}
      </div>
    </div>
  );
};
