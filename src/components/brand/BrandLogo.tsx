import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  showTagline?: boolean;
  inverted?: boolean; // For dark backgrounds
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showWordmark = true,
  showTagline = false,
  inverted = false,
  className = '',
}) => {
  // Dimensions for original logo container preserving aspect ratio
  const dimensions = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
    xl: 'h-20 w-20',
  }[size];

  const textSizes = {
    sm: 'text-base font-bold tracking-tight',
    md: 'text-xl font-bold tracking-tight',
    lg: 'text-2xl font-extrabold tracking-tight',
    xl: 'text-3xl font-extrabold tracking-tight',
  }[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* 
        Strict Brand Rule: 
        1. Original unaltered logo image asset 
        2. Preserved aspect ratio with object-fit: contain 
        3. Never cropped, rotated, distorted, or redrawn
        4. When shown on light or dark background, contained in proportioned square
      */}
      <div
        className={`${dimensions} flex-shrink-0 flex items-center justify-center rounded-lg p-0.5 transition-transform duration-200 hover:scale-105`}
      >
        <img
          src="/logo.png"
          alt="XEEL TECH Logo"
          className="h-full w-full object-contain"
          loading="eager"
        />
      </div>

      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span
            className={`${textSizes} font-sans ${
              inverted ? 'text-white' : 'text-neutral-900'
            }`}
          >
            XEEL TECH
          </span>
          {showTagline && (
            <span
              className={`text-[10px] uppercase font-semibold tracking-wider mt-1 ${
                inverted ? 'text-neutral-400' : 'text-neutral-500'
              }`}
            >
              Business OS • Laascaanood
            </span>
          )}
        </div>
      )}
    </div>
  );
};
