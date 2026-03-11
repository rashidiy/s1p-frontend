import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useThemeStore } from '@/store/theme';

beforeEach(() => {
  useThemeStore.setState({ mode: 'system', resolved: 'light' });
  localStorage.clear();
  document.documentElement.classList.remove('dark');
  // Reset matchMedia to default (light)
  vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});

describe('Theme Store', () => {
  it('has default mode of system', () => {
    expect(useThemeStore.getState().mode).toBe('system');
  });

  it('setMode("dark") sets mode to dark and resolved to dark', () => {
    useThemeStore.getState().setMode('dark');
    const state = useThemeStore.getState();

    expect(state.mode).toBe('dark');
    expect(state.resolved).toBe('dark');
  });

  it('setMode("light") sets mode to light and resolved to light', () => {
    // First set to dark
    useThemeStore.getState().setMode('dark');
    expect(useThemeStore.getState().resolved).toBe('dark');

    // Then set back to light
    useThemeStore.getState().setMode('light');
    const state = useThemeStore.getState();

    expect(state.mode).toBe('light');
    expect(state.resolved).toBe('light');
  });

  it('setMode("system") resolves based on matchMedia', () => {
    // Mock matchMedia to report dark mode
    vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    useThemeStore.getState().setMode('system');
    expect(useThemeStore.getState().resolved).toBe('dark');

    // Mock matchMedia to report light mode
    vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    useThemeStore.getState().setMode('system');
    expect(useThemeStore.getState().resolved).toBe('light');
  });

  it('setMode("dark") adds "dark" class to documentElement', () => {
    useThemeStore.getState().setMode('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('setMode("light") removes "dark" class from documentElement', () => {
    // First add dark class
    useThemeStore.getState().setMode('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // Then switch to light
    useThemeStore.getState().setMode('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('persists to localStorage under "s1p-theme" key', () => {
    useThemeStore.getState().setMode('dark');

    const stored = localStorage.getItem('s1p-theme');
    expect(stored).not.toBeNull();

    const parsed = JSON.parse(stored!);
    expect(parsed.state.mode).toBe('dark');
  });
});
