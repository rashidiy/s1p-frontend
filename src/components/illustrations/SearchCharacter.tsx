'use client';

import React from 'react';

interface Props {
  width?: number;
  height?: number;
  className?: string;
}

export function SearchCharacter({ width = 200, height = 200, className }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 200 200" fill="none" className={className}>
      {/* Body */}
      <circle cx="100" cy="125" r="45" fill="#e0e7ff" />
      {/* Head */}
      <circle cx="100" cy="72" r="35" fill="#c7d2fe" />
      {/* Eyes - focused, looking right */}
      <circle cx="92" cy="67" r="4" fill="#4338ca" />
      <circle cx="116" cy="67" r="4" fill="#4338ca" />
      {/* Slight smile */}
      <path d="M90 80 Q100 86 110 80" stroke="#4338ca" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Large magnifying glass */}
      <circle cx="152" cy="88" r="22" stroke="#6366f1" strokeWidth="4" fill="rgba(99,102,241,0.08)" />
      <line x1="168" y1="104" x2="182" y2="118" stroke="#6366f1" strokeWidth="4" strokeLinecap="round" />
      {/* Arm holding magnifying glass */}
      <line x1="130" y1="110" x2="145" y2="95" stroke="#c7d2fe" strokeWidth="8" strokeLinecap="round" />
      {/* Search results lines */}
      <rect x="25" y="90" width="35" height="4" rx="2" fill="#a5b4fc" opacity="0.5" />
      <rect x="25" y="100" width="28" height="4" rx="2" fill="#c7d2fe" opacity="0.4" />
      <rect x="25" y="110" width="32" height="4" rx="2" fill="#a5b4fc" opacity="0.3" />
      {/* Shadow */}
      <ellipse cx="100" cy="178" rx="38" ry="6" fill="rgba(99,102,241,0.1)" />
    </svg>
  );
}
