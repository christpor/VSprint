import React from 'react';

export const VSprintLogo = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <linearGradient id="vGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#06b6d4" />
        <stop offset="50%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#8b5cf6" />
      </linearGradient>
      <filter id="vGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1.5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    {/* Energy Trail */}
    <path 
      d="M12 22L8 14L12 16L16 14L12 22Z" 
      fill="url(#vGrad)" 
      opacity="0.4"
      filter="url(#vGlow)"
    />
    {/* Main V Shape */}
    <path 
      d="M12 20L3 4H7L12 15L17 4H21L12 20Z" 
      fill="url(#vGrad)" 
      filter="url(#vGlow)"
    />
    {/* Rocket Core */}
    <path 
      d="M12 15L10 11L12 9L14 11L12 15Z" 
      fill="white" 
      opacity="0.9"
    />
  </svg>
);
