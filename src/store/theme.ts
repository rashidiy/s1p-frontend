import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  resolved: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
}

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  return mode === 'system' ? getSystemTheme() : mode;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'light' as ThemeMode,
      resolved: 'light' as const,
      setMode: (mode: ThemeMode) => {
        set({ mode, resolved: resolveTheme(mode) });
        if (typeof document !== 'undefined') {
          document.documentElement.classList.toggle('dark', resolveTheme(mode) === 'dark');
        }
      },
    }),
    {
      name: 's1p-theme',
      onRehydrateStorage: () => (state) => {
        if (state) {
          const resolved = resolveTheme(state.mode);
          state.resolved = resolved;
          if (typeof document !== 'undefined') {
            document.documentElement.classList.toggle('dark', resolved === 'dark');
          }
        }
      },
    }
  )
);
