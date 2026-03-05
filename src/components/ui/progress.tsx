'use client';

import * as React from 'react';
import { Progress as AntdProgress } from 'antd';
import { cn } from '@/lib/utils';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100 }, ref) => {
    const percent = Math.round((value / max) * 100);

    return (
      <div ref={ref} className={cn(className)}>
        <AntdProgress
          percent={percent}
          showInfo={false}
          strokeColor={{
            '0%': '#6366f1',
            '100%': '#818cf8',
          }}
          size="small"
        />
      </div>
    );
  }
);
Progress.displayName = 'Progress';

export { Progress };
