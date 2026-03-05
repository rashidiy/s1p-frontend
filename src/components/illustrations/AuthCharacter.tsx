'use client';

import React from 'react';

interface Props {
  width?: number;
  height?: number;
  className?: string;
}

export function AuthCharacter({ width = 280, height = 280, className }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 280 280" fill="none" className={className}>
      {/* Background circle */}
      <circle cx="140" cy="140" r="120" fill="rgba(255,255,255,0.06)" />
      <circle cx="140" cy="140" r="90" fill="rgba(255,255,255,0.04)" />
      {/* Body */}
      <circle cx="140" cy="170" r="55" fill="rgba(199,210,254,0.9)" />
      {/* Head */}
      <circle cx="140" cy="100" r="42" fill="rgba(224,231,255,0.95)" />
      {/* Eyes */}
      <circle cx="126" cy="95" r="5" fill="#4338ca" />
      <circle cx="154" cy="95" r="5" fill="#4338ca" />
      {/* Eye shine */}
      <circle cx="128" cy="93" r="2" fill="white" />
      <circle cx="156" cy="93" r="2" fill="white" />
      {/* Smile */}
      <path d="M126 112 Q140 124 154 112" stroke="#4338ca" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Lock/Shield icon */}
      <rect x="115" y="155" width="50" height="40" rx="8" fill="#6366f1" />
      <rect x="125" y="145" width="30" height="20" rx="10" fill="none" stroke="#6366f1" strokeWidth="4" />
      <circle cx="140" cy="172" r="5" fill="white" />
      <line x1="140" y1="177" x2="140" y2="183" stroke="white" strokeWidth="3" strokeLinecap="round" />
      {/* Floating keys */}
      <circle cx="60" cy="80" r="6" fill="rgba(245,158,11,0.6)" />
      <line x1="66" y1="80" x2="78" y2="80" stroke="rgba(245,158,11,0.6)" strokeWidth="2" strokeLinecap="round" />
      <line x1="74" y1="80" x2="74" y2="86" stroke="rgba(245,158,11,0.6)" strokeWidth="2" strokeLinecap="round" />
      {/* Sparkles */}
      <text x="200" y="70" fontSize="20" fill="rgba(255,255,255,0.4)">&#10022;</text>
      <text x="50" y="180" fontSize="14" fill="rgba(255,255,255,0.3)">&#10022;</text>
      <text x="220" y="200" fontSize="16" fill="rgba(255,255,255,0.2)">&#10022;</text>
      {/* Shadow */}
      <ellipse cx="140" cy="240" rx="50" ry="8" fill="rgba(0,0,0,0.08)" />
    </svg>
  );
}
