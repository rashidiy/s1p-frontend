import type { ThemeConfig } from 'antd';

export const antdTheme: ThemeConfig = {
  token: {
    // Primary palette — red-orange accent
    colorPrimary: '#E84040',
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorInfo: '#E84040',

    // Clean white surfaces
    colorBgContainer: '#FFFFFF',
    colorBgLayout: '#F8F9FA',
    colorBgElevated: '#FFFFFF',

    // Rounded corners
    borderRadius: 12,
    borderRadiusLG: 16,
    borderRadiusSM: 10,

    // Typography
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontSize: 14,

    // Neutral shadows — no color tint
    boxShadow:
      '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
    boxShadowSecondary:
      '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.07)',

    // Link — red-orange tones
    colorLink: '#E84040',
    colorLinkHover: '#FF6B6B',
    colorLinkActive: '#C53030',
  },
  components: {
    Button: {
      borderRadius: 10,
      controlHeight: 40,
      controlHeightLG: 44,
      controlHeightSM: 32,
      fontWeight: 500,
    },
    Input: {
      borderRadius: 10,
      controlHeight: 40,
    },
    Select: {
      borderRadius: 10,
      controlHeight: 40,
    },
    Card: {
      borderRadiusLG: 16,
    },
    Menu: {
      itemBorderRadius: 10,
      itemHeight: 40,
      iconSize: 18,
    },
    Modal: {
      borderRadiusLG: 16,
    },
    Tag: {
      borderRadiusSM: 6,
    },
    Tabs: {
      itemSelectedColor: '#E84040',
      inkBarColor: '#E84040',
    },
  },
};
