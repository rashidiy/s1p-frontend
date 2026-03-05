'use client';

import React from 'react';

interface Props {
  width?: number;
  height?: number;
  className?: string;
}

export function WelcomeCharacter({ width = 200, height = 200, className }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 200 200" fill="none" className={className}>
      {/* Body */}
      <circle cx="100" cy="125" r="45" fill="#e0e7ff" />
      {/* Head */}
      <circle cx="100" cy="72" r="35" fill="#c7d2fe" />
      {/* Eyes - happy */}
      <path d="M85 67 Q88 62 91 67" stroke="#4338ca" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M109 67 Q112 62 115 67" stroke="#4338ca" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Smile */}
      <path d="M87 80 Q100 92 113 80" stroke="#4338ca" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Blush */}
      <circle cx="82" cy="77" r="5" fill="rgba(244,114,182,0.3)" />
      <circle cx="118" cy="77" r="5" fill="rgba(244,114,182,0.3)" />
      {/* Waving hand */}
      <circle cx="155" cy="85" r="10" fill="#c7d2fe" />
      <line x1="145" y1="95" x2="135" y2="115" stroke="#c7d2fe" strokeWidth="8" strokeLinecap="round" />
      {/* Stars */}
      <text x="45" y="50" fontSize="16" fill="#f59e0b">&#9733;</text>
      <text x="150" y="55" fontSize="12" fill="#818cf8">&#9733;</text>
      <text x="160" y="140" fontSize="10" fill="#10b981">&#9733;</text>
      {/* Shadow */}
      <ellipse cx="100" cy="178" rx="38" ry="6" fill="rgba(99,102,241,0.1)" />
    </svg>
  );
}
