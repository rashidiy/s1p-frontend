'use client';

import Image from 'next/image';

interface Props {
  width?: number;
  height?: number;
  className?: string;
}

export function ErrorCharacter({ width = 200, height = 200, className }: Props) {
  return (
    <Image
      src="/illustrations/bot-error.png"
      alt="S1P Bot Error"
      width={width}
      height={height}
      className={className}
      style={{ objectFit: 'contain' }}
      priority={false}
    />
  );
}
