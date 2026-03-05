'use client';

import * as React from 'react';
import { Input as AntdInput } from 'antd';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, onChange, value, defaultValue, placeholder, disabled, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
    };

    if (type === 'password') {
      return (
        <AntdInput.Password
          ref={ref as any}
          className={cn('glass-input', className)}
          onChange={handleChange}
          value={value}
          defaultValue={defaultValue as string}
          placeholder={placeholder}
          disabled={disabled}
          {...props}
        />
      );
    }

    return (
      <AntdInput
        ref={ref as any}
        type={type}
        className={cn('glass-input', className)}
        onChange={handleChange}
        value={value}
        defaultValue={defaultValue as string}
        placeholder={placeholder}
        disabled={disabled}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
