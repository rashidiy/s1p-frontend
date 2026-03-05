'use client';

import * as React from 'react';
import { Button as AntdButton } from 'antd';
import type { ButtonProps as AntdButtonProps } from 'antd';
import { cn } from '@/lib/utils';

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'color'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
  /** HTML button type (submit/button/reset). Maps to Ant Design htmlType. */
  htmlType?: 'submit' | 'button' | 'reset';
}

const variantToAntd: Record<ButtonVariant, { type: AntdButtonProps['type']; danger?: boolean }> = {
  default: { type: 'primary' },
  destructive: { type: 'primary', danger: true },
  outline: { type: 'default' },
  secondary: { type: 'default' },
  ghost: { type: 'text' },
  link: { type: 'link' },
};

const sizeToAntd: Record<ButtonSize, AntdButtonProps['size']> = {
  default: 'middle',
  sm: 'small',
  lg: 'large',
  icon: 'middle',
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', children, disabled, onClick, asChild, ...props }, ref) => {
    const antdProps = variantToAntd[variant] || variantToAntd.default;
    const antdSize = sizeToAntd[size] || 'middle';

    const { type: htmlType, ...restProps } = props as any;

    return (
      <AntdButton
        ref={ref as any}
        type={antdProps.type}
        danger={antdProps.danger}
        size={antdSize}
        disabled={disabled}
        onClick={onClick}
        htmlType={htmlType || 'button'}
        className={cn(
          size === 'icon' && '!w-10 !h-10 !p-0 !inline-flex !items-center !justify-center',
          className
        )}
        {...restProps}
      >
        {children}
      </AntdButton>
    );
  }
);
Button.displayName = 'Button';

export { Button };
