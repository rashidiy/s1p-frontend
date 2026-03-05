'use client';

import * as React from 'react';
import { Select as AntdSelect } from 'antd';
import { cn } from '@/lib/utils';

interface SelectContextType {
  value?: string;
  onValueChange?: (value: string) => void;
}

const SelectContext = React.createContext<SelectContextType>({});

interface SelectProps {
  children: React.ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

function Select({ children, value, defaultValue, onValueChange }: SelectProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || value);

  React.useEffect(() => {
    if (value !== undefined) setInternalValue(value);
  }, [value]);

  const handleChange = (val: string) => {
    setInternalValue(val);
    onValueChange?.(val);
  };

  return (
    <SelectContext.Provider value={{ value: internalValue, onValueChange: handleChange }}>
      {children}
    </SelectContext.Provider>
  );
}

const SelectGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>;

interface SelectValueProps {
  placeholder?: string;
}

function SelectValue({ placeholder }: SelectValueProps) {
  return <span>{placeholder}</span>;
}

interface SelectTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

const SelectTrigger = React.forwardRef<HTMLDivElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('select-trigger-wrapper', className)} {...props}>
        {children}
      </div>
    );
  }
);
SelectTrigger.displayName = 'SelectTrigger';

interface SelectContentProps {
  children: React.ReactNode;
}

function SelectContent({ children }: SelectContentProps) {
  return <>{children}</>;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

function SelectItem({ value, children }: SelectItemProps) {
  return <option value={value}>{children}</option>;
}

interface SelectLabelProps {
  children: React.ReactNode;
  className?: string;
}

function SelectLabel({ children }: SelectLabelProps) {
  return <>{children}</>;
}

function SelectSeparator() {
  return null;
}

function SelectScrollUpButton() {
  return null;
}

function SelectScrollDownButton() {
  return null;
}

// Convenience wrapper to use AntD Select directly
interface AntdSelectWrapperProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onValueChange?: (value: string) => void;
  options?: { label: string; value: string }[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  allowClear?: boolean;
  showSearch?: boolean;
  style?: React.CSSProperties;
}

function SelectDirect({
  value,
  defaultValue,
  onChange,
  onValueChange,
  options,
  placeholder,
  className,
  disabled,
  allowClear,
  showSearch,
  style,
}: AntdSelectWrapperProps) {
  const handleChange = (val: string) => {
    onChange?.(val);
    onValueChange?.(val);
  };

  return (
    <AntdSelect
      value={value}
      defaultValue={defaultValue}
      onChange={handleChange}
      options={options}
      placeholder={placeholder}
      className={cn(className)}
      disabled={disabled}
      allowClear={allowClear}
      showSearch={showSearch}
      style={{ width: '100%', ...style }}
      filterOption={(input, option) =>
        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
      }
    />
  );
}

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
  SelectDirect,
};
