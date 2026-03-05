'use client';

import React from 'react';

interface Props {
  width?: number;
  height?: number;
  className?: string;
}

export function SuccessCharacter({ width = 200, height = 200, className }: Props) {
  return (
    <svg width={width} height={height} viewBox="0 0 200 200" fill="none" className={className}>
      {/* Confetti */}
      <rect x="40" y="30" width="6" height="6" rx="1" fill="#f59e0b" transform="rotate(15 40 30)" />
      <rect x="160" y="40" width="5" height="5" rx="1" fill="#6366f1" transform="rotate(-20 160 40)" />
      <rect x="60" y="155" width="4" height="4" rx="1" fill="#10b981" transform="rotate(30 60 155)" />
      <rect x="150" y="150" width="5" height="5" rx="1" fill="#ec4899" transform="rotate(-10 150 150)" />
      {/* Body */}
      <circle cx="100" cy="125" r="45" fill="#d1fae5" />
      {/* Head */}
      <circle cx="100" cy="72" r="35" fill="#a7f3d0" />
      {/* Eyes - happy squints */}
      <path d="M84 66 Q88 60 92 66" stroke="#065f46" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M108 66 Q112 60 116 66" stroke="#065f46" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Big smile */}
      <path d="M85 80 Q100 95 115 80" stroke="#065f46" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Blush */}
      <circle cx="80" cy="76" r="6" fill="rgba(244,114,182,0.25)" />
      <circle cx="120" cy="76" r="6" fill="rgba(244,114,182,0.25)" />
      {/* Checkmark */}
      <circle cx="160" cy="90" r="16" fill="#10b981" />
      <path d="M151 90 L157 96 L169 84" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {/* Raised hands */}
      <circle cx="55" cy="85" r="8" fill="#a7f3d0" />
      <circle cx="145" cy="85" r="8" fill="#a7f3d0" />
      {/* Shadow */}
      <ellipse cx="100" cy="178" rx="38" ry="6" fill="rgba(16,185,129,0.1)" />
    </svg>
  );
}
