'use client';

import * as React from 'react';
import { Tag } from 'antd';
import { cn } from '@/lib/utils';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantToColor: Record<BadgeVariant, string | undefined> = {
  default: 'blue',
  secondary: 'default',
  destructive: 'red',
  outline: undefined,
  success: 'green',
  warning: 'orange',
};

function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  const color = variantToColor[variant];

  return (
    <Tag
      color={color}
      bordered={variant === 'outline'}
      className={cn('!inline-flex !items-center !rounded-full !text-xs !font-semibold', className)}
      {...(props as any)}
    >
      {children}
    </Tag>
  );
}

export { Badge };
