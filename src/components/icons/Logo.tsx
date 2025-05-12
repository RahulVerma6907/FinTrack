import React from 'react';

const Logo = ({ className = "h-8 w-auto", color }: { className?: string, color?: string }) => {
  const fillColor = color || "currentColor";
  return (
    <svg 
      className={className}
      viewBox="0 0 180 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      aria-label="FinTrack Logo"
    >
      <path d="M10 30L10 10L20 10Q25 10 27.5 12.5T30 20Q30 27.5 27.5 30T20 32.5L10 32.5L10 30ZM12.5 30L20 30Q23.75 30 25.625 28.125T27.5 24.375L27.5 15.625Q27.5 11.875 25.625 10T20 8.125L12.5 8.125L12.5 30Z" fill={fillColor} />
      <text x="38" y="29" fontFamily="var(--font-geist-sans), Arial, sans-serif" fontSize="28" fontWeight="600" fill={fillColor}>
        FinTrack
      </text>
    </svg>
  );
};

export default Logo;
