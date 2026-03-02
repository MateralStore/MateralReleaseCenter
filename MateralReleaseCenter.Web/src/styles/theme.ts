import type { ThemeConfig } from 'antd'

export const theme: ThemeConfig = {
  token: {
    // 主色
    colorPrimary: '#1677ff',
    colorPrimaryHover: '#4096ff',
    colorPrimaryActive: '#0050b3',
    colorPrimaryBg: '#e6f4ff',

    // 功能色
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#ff4d4f',
    colorInfo: '#1677ff',

    // 中性色
    colorText: 'rgba(0, 0, 0, 0.65)',
    colorTextSecondary: 'rgba(0, 0, 0, 0.45)',
    colorBorder: '#d9d9d9',
    colorTextDisabled: 'rgba(0, 0, 0, 0.25)',
    colorBgContainer: '#ffffff',
    colorBgLayout: '#f5f5f5',

    // 字体
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontSize: 14,
    lineHeight: 1.5,

    // 圆角
    borderRadius: 6,

    // 按钮
    controlHeight: 32,
  },
  components: {
    Button: {
      primaryColor: '#ffffff',
      borderRadius: 6,
    },
    Card: {
      borderRadiusLG: 8,
    },
    Input: {
      borderRadius: 6,
    },
    Select: {
      borderRadius: 6,
    },
  },
}
