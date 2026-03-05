'use client';

import React from 'react';

interface Props {
  width?: number;
  height?: number;
  className?: string;
}

export function ErrorCharacter({ width = 200, height = 200, className }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 200 200" fill="none" className={className}>
      {/* Body */}
      <circle cx="100" cy="125" r="45" fill="#fce7f3" />
      {/* Head */}
      <circle cx="100" cy="72" r="35" fill="#fecdd3" />
      {/* Eyes - surprised */}
      <circle cx="88" cy="67" r="6" fill="#e11d48" />
      <circle cx="112" cy="67" r="6" fill="#e11d48" />
      <circle cx="88" cy="67" r="3" fill="white" />
      <circle cx="112" cy="67" r="3" fill="white" />
      {/* Open mouth */}
      <ellipse cx="100" cy="85" rx="7" ry="9" fill="#e11d48" />
      {/* Warning triangle */}
      <path d="M155 95 L170 125 L140 125 Z" fill="#f59e0b" stroke="#d97706" strokeWidth="2" />
      <text x="151" y="121" fontSize="18" fill="white" fontWeight="bold">!</text>
      {/* Sweat drop */}
      <path d="M72 55 Q70 48 68 55 Q66 60 72 60 Q76 60 72 55" fill="#93c5fd" />
      {/* Shadow */}
      <ellipse cx="100" cy="178" rx="38" ry="6" fill="rgba(239,68,68,0.1)" />
    </svg>
  );
}
