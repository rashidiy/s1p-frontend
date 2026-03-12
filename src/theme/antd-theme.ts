import type { ThemeConfig } from 'antd';
import { theme } from 'antd';

export const antdLightTheme: ThemeConfig = {
  token: {
    // Primary palette — indigo accent
    colorPrimary: '#4338CA',
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorInfo: '#4338CA',

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

    // Link — indigo tones
    colorLink: '#4338CA',
    colorLinkHover: '#6366F1',
    colorLinkActive: '#3730A3',
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
      activeBorderColor: '#4338CA',
      hoverBorderColor: '#A5B4FC',
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
    Table: {
      borderRadiusLG: 12,
      headerBg: '#FAFBFC',
      headerColor: '#64748B',
      rowHoverBg: '#F8FAFC',
    },
    Tag: {
      borderRadiusSM: 6,
    },
    Tabs: {
      itemSelectedColor: '#4338CA',
      inkBarColor: '#4338CA',
    },
    Alert: {
      borderRadiusLG: 12,
    },
    Notification: {
      borderRadiusLG: 12,
    },
  },
};

/** Backward compat alias */
export const antdTheme = antdLightTheme;

export const antdDarkTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#4338CA',
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorInfo: '#4338CA',
    borderRadius: 12,
    borderRadiusLG: 16,
    borderRadiusSM: 10,
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontSize: 14,
    colorLink: '#6366F1',
    colorLinkHover: '#818CF8',
    colorLinkActive: '#4338CA',
  },
  components: {
    Button: { borderRadius: 10, controlHeight: 40, controlHeightLG: 44, controlHeightSM: 32, fontWeight: 500 },
    Input: { borderRadius: 10, controlHeight: 40 },
    Select: { borderRadius: 10, controlHeight: 40 },
    Card: { borderRadiusLG: 16 },
    Menu: { itemBorderRadius: 10, itemHeight: 40, iconSize: 18 },
    Modal: { borderRadiusLG: 16 },
    Table: { borderRadiusLG: 12 },
    Tag: { borderRadiusSM: 6 },
    Tabs: { itemSelectedColor: '#4338CA', inkBarColor: '#4338CA' },
    Alert: { borderRadiusLG: 12 },
    Notification: { borderRadiusLG: 12 },
  },
};
