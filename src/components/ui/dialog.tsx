'use client';

import * as React from 'react';
import { Modal } from 'antd';
import { cn } from '@/lib/utils';

interface DialogContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextType>({
  open: false,
  setOpen: () => {},
});

interface DialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function Dialog({ children, open: controlledOpen, onOpenChange }: DialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const setOpen = (value: boolean) => {
    setInternalOpen(value);
    onOpenChange?.(value);
  };

  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
}

function DialogTrigger({ children, asChild, ...props }: { children: React.ReactNode; asChild?: boolean } & React.HTMLAttributes<HTMLElement>) {
  const { setOpen } = React.useContext(DialogContext);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: (e: any) => {
        (children as React.ReactElement<any>).props?.onClick?.(e);
        setOpen(true);
      },
    });
  }

  return (
    <span onClick={() => setOpen(true)} {...props}>
      {children}
    </span>
  );
}

const DialogPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const DialogOverlay = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  (_, _ref) => null
);
DialogOverlay.displayName = 'DialogOverlay';

const DialogClose = ({ children, ...props }: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode; asChild?: boolean }) => {
  const { setOpen } = React.useContext(DialogContext);
  return (
    <span onClick={() => setOpen(false)} {...(props as any)}>
      {children}
    </span>
  );
};

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

function DialogContent({ children, className }: DialogContentProps) {
  const { open, setOpen } = React.useContext(DialogContext);

  // Separate header/footer/body
  const childArray = React.Children.toArray(children);
  let title: React.ReactNode = null;
  let footer: React.ReactNode = null;
  const bodyChildren: React.ReactNode[] = [];

  childArray.forEach((child) => {
    if (React.isValidElement(child)) {
      if (child.type === DialogHeader) {
        title = child;
      } else if (child.type === DialogFooter) {
        footer = child;
      } else {
        bodyChildren.push(child);
      }
    } else {
      bodyChildren.push(child);
    }
  });

  return (
    <Modal
      open={open}
      onCancel={() => setOpen(false)}
      footer={footer || null}
      title={null}
      className={cn('glass-card', className)}
      width={520}
      destroyOnClose
    >
      {title}
      {bodyChildren}
    </Modal>
  );
}

function DialogHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left mb-4', className)} {...props}>
      {children}
    </div>
  );
}
DialogHeader.displayName = 'DialogHeader';

function DialogFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4', className)} {...props}>
      {children}
    </div>
  );
}
DialogFooter.displayName = 'DialogFooter';

function DialogTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-lg font-semibold leading-none tracking-tight', className)} {...props}>
      {children}
    </h3>
  );
}

function DialogDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-sm text-muted-foreground', className)} {...props}>
      {children}
    </p>
  );
}

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
