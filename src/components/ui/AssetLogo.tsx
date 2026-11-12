import React, { useState } from 'react';

interface AssetLogoProps {
  symbol: string;
  logoUrl?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AssetLogo: React.FC<AssetLogoProps> = ({
  symbol,
  logoUrl,
  name,
  size = 'md',
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: 'w-5 h-5 text-[10px]',
    md: 'w-7 h-7 text-xs font-semibold',
    lg: 'w-10 h-10 text-sm font-bold',
  };

  const getFallbackColor = (sym: string) => {
    let hash = 0;
    for (let i = 0; i < sym.length; i++) {
      hash = sym.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      'bg-blue-600/20 text-blue-400 border-blue-500/30',
      'bg-emerald-600/20 text-emerald-400 border-emerald-500/30',
      'bg-purple-600/20 text-purple-400 border-purple-500/30',
      'bg-amber-600/20 text-amber-400 border-amber-500/30',
      'bg-cyan-600/20 text-cyan-400 border-cyan-500/30',
      'bg-rose-600/20 text-rose-400 border-rose-500/30',
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  const cleanSymbol = symbol.replace('USD', '').replace('USDT', '').slice(0, 3);

  if (logoUrl && !hasError) {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden shrink-0 bg-white/5 border border-slate-700/50 flex items-center justify-center p-0.5 ${className}`}
      >
        <img
          src={logoUrl}
          alt={name || symbol}
          referrerPolicy="no-referrer"
          onError={() => setHasError(true)}
          className="w-full h-full object-contain rounded-full"
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full border shrink-0 flex items-center justify-center tracking-tight font-mono select-none ${getFallbackColor(
        symbol
      )} ${className}`}
    >
      {cleanSymbol}
    </div>
  );
};
