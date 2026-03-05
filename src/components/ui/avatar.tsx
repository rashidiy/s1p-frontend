'use client';

import * as React from 'react';
import { Avatar as AntdAvatar } from 'antd';
import { cn } from '@/lib/utils';

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  src?: string;
}

const Avatar = React.forwardRef<HTMLSpanElement, AvatarProps>(
  ({ className, children, src, ...props }, ref) => (
    <AntdAvatar
      ref={ref as any}
      src={src}
      size={40}
      className={cn(className)}
      style={{ backgroundColor: '#6366f1' }}
      {...(props as any)}
    >
      {children}
    </AntdAvatar>
  )
);
Avatar.displayName = 'Avatar';

const AvatarImage = React.forwardRef<HTMLImageElement, React.ImgHTMLAttributes<HTMLImageElement>>(
  (_props, _ref) => {
    return null;
  }
);
AvatarImage.displayName = 'AvatarImage';

const AvatarFallback = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ children }, _ref) => {
    return <>{children}</>;
  }
);
AvatarFallback.displayName = 'AvatarFallback';

export { Avatar, AvatarImage, AvatarFallback };
