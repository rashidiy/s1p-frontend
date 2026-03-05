'use client';

import * as React from 'react';
import { Tabs as AntdTabs } from 'antd';
import { cn } from '@/lib/utils';

interface TabsContextType {
  value?: string;
  onValueChange?: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextType>({});

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
}

function Tabs({ defaultValue, value, onValueChange, children, className, ...props }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value: value || defaultValue, onValueChange }}>
      <div className={cn(className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, children, ...props }, ref) => {
    const { value, onValueChange } = React.useContext(TabsContext);

    // Extract tab items from children
    const items: { key: string; label: React.ReactNode }[] = [];
    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && child.props.value) {
        items.push({
          key: child.props.value,
          label: child.props.children,
        });
      }
    });

    return (
      <div ref={ref} className={cn(className)} {...props}>
        <AntdTabs
          activeKey={value}
          onChange={onValueChange}
          items={items}
        />
      </div>
    );
  }
);
TabsList.displayName = 'TabsList';

interface TabsTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  value: string;
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ value, children }, _ref) => {
    // Rendered by TabsList, this is just a data carrier
    return null;
  }
);
TabsTrigger.displayName = 'TabsTrigger';

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ value: tabValue, className, children, ...props }, ref) => {
    const { value } = React.useContext(TabsContext);

    if (value !== tabValue) return null;

    return (
      <div ref={ref} className={cn('mt-2', className)} {...props}>
        {children}
      </div>
    );
  }
);
TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsContent };
