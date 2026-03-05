'use client';

import React from 'react';

interface Props {
  width?: number;
  height?: number;
  className?: string;
}

export function EmptyStateCharacter({ width = 200, height = 200, className }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 200 200" fill="none" className={className}>
      {/* Body */}
      <circle cx="100" cy="120" r="50" fill="#e0e7ff" />
      {/* Head */}
      <circle cx="100" cy="70" r="35" fill="#c7d2fe" />
      {/* Face */}
      <circle cx="88" cy="65" r="4" fill="#4338ca" />
      <circle cx="112" cy="65" r="4" fill="#4338ca" />
      {/* Slight frown */}
      <path d="M88 82 Q100 76 112 82" stroke="#4338ca" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Magnifying glass */}
      <circle cx="140" cy="100" r="18" stroke="#6366f1" strokeWidth="3" fill="rgba(99,102,241,0.1)" />
      <line x1="153" y1="113" x2="165" y2="125" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />
      {/* Question marks */}
      <text x="55" y="45" fontSize="16" fill="#a5b4fc" fontWeight="bold">?</text>
      <text x="140" y="50" fontSize="12" fill="#c7d2fe" fontWeight="bold">?</text>
      {/* Shadow */}
      <ellipse cx="100" cy="175" rx="40" ry="6" fill="rgba(99,102,241,0.1)" />
    </svg>
  );
}
