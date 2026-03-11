'use client';

import Image from 'next/image';

interface Props {
  width?: number;
  height?: number;
  className?: string;
}

export function SearchCharacter({ width = 180, height = 180, className }: Props) {
  return (
    <Image
      src="/illustrations/bot-error.png"
      alt="S1P Bot"
      width={width}
      height={height}
      className={className}
      style={{ objectFit: 'contain' }}
      priority={false}
    />
  );
}
