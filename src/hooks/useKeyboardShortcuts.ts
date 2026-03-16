import { useEffect } from 'react';

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      // Esc — blur active input or close modal
      if (e.key === 'Escape') {
        if (isInput) {
          (target as HTMLInputElement).blur();
        }
        // Click the topmost visible ant modal close button
        const closeBtn = document.querySelector(
          '.ant-modal-wrap:not([style*="display: none"]) .ant-modal-close'
        ) as HTMLElement;
        closeBtn?.click();
        return;
      }

      // Don't trigger shortcuts when typing in inputs
      if (isInput) return;

      // Ctrl+K or / — focus search input
      if ((e.ctrlKey && e.key === 'k') || e.key === '/') {
        e.preventDefault();
        const searchInput = document.querySelector(
          'input[type="search"], .ant-input-search input'
        ) as HTMLInputElement;
        if (searchInput) searchInput.focus();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);
}
