'use client';

import * as React from 'react';
import { Input } from 'antd';
import { cn } from '@/lib/utils';

const { TextArea: AntdTextArea } = Input;

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, onChange, value, defaultValue, placeholder, disabled, rows, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(e);
    };

    return (
      <AntdTextArea
        ref={ref as any}
        className={cn('glass-input', className)}
        onChange={handleChange}
        value={value}
        defaultValue={defaultValue as string}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows || 3}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };
