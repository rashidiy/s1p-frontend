'use client';

import Image from 'next/image';

export type BotVariant =
  | 'default'
  | 'no-contacts'
  | 'no-deals'
  | 'no-calls'
  | 'no-results'
  | 'error'
  | 'loading'
  | 'setup'
  | 'confused'
  | 'thinking'
  | 'celebrating'
  | 'working'
  | 'sleeping';

interface Props {
  width?: number;
  height?: number;
  className?: string;
  variant?: BotVariant;
}

export function EmptyStateCharacter({ width = 160, height = 160, className, variant = 'default' }: Props) {
  return (
    <Image
      src={`/illustrations/bot-${variant}.png`}
      alt="S1P Bot"
      width={width}
      height={height}
      className={className}
      style={{ objectFit: 'contain' }}
      priority={false}
    />
  );
}
