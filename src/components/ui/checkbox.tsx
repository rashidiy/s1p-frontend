'use client';

import * as React from 'react';
import { Checkbox as AntdCheckbox } from 'antd';
import { cn } from '@/lib/utils';

export interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onChange?: (e: any) => void;
  className?: string;
  id?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, defaultChecked, disabled, onCheckedChange, onChange, id, ...props }, ref) => {
    const handleChange = (e: any) => {
      onCheckedChange?.(e.target.checked);
      onChange?.(e);
    };

    return (
      <AntdCheckbox
        ref={ref as any}
        checked={checked}
        defaultChecked={defaultChecked}
        disabled={disabled}
        onChange={handleChange}
        id={id}
        className={cn(className)}
        {...(props as any)}
      />
    );
  }
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
