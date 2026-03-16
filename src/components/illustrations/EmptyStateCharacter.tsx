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
  height?: number;
  className?: string;
  variant?: BotVariant;
}

export function EmptyStateCharacter({ height = 115, className, variant = 'default' }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- decorative illustration, no optimization needed
    <img
      src={`/illustrations/bot-${variant}.png`}
      alt="S1P Bot"
      height={height}
      className={className}
      style={{ height, width: 'auto', objectFit: 'contain' }}
    />
  );
}
