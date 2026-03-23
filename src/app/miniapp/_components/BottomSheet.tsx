'use client';

import type { ReactNode } from 'react';

export function BottomSheet({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <>
      <div className="miniapp-bottomsheet-overlay" onClick={onClose} />
      <div className="miniapp-bottomsheet">
        <div className="miniapp-bottomsheet-handle" />
        {children}
      </div>
    </>
  );
}

export function BottomSheetOption({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <div className="miniapp-bottomsheet-option" onClick={onClick}>
      <div className="miniapp-bottomsheet-option-icon">{icon}</div>
      <span>{label}</span>
    </div>
  );
}
