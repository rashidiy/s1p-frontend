'use client';

import Image from 'next/image';

interface Props {
  width?: number;
  height?: number;
  className?: string;
}

export function AuthCharacter({ width = 280, height = 280, className }: Props) {
  return (
    <Image
      src="/illustrations/bot-default.png"
      alt="S1P Bot"
      width={width}
      height={height}
      className={className}
      style={{ objectFit: 'contain' }}
      priority
    />
  );
}
