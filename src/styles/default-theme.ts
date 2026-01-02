/**
 * @fileoverview 默认主题配置
 * @module styles/default-theme
 */

import type { Theme } from '../types/theme'

/** 默认主题 - 标准医疗表单样式 */
export const defaultTheme: Theme = {
  fonts: {
    body: '"SimSun", "宋体", "Songti SC", serif',
    heading: '"SimHei", "黑体", "Heiti SC", sans-serif',
    mono: '"Courier New", monospace',
  },
  colors: {
    primary: '#000000',
    border: '#000000',
    background: '#ffffff',
    labelBackground: '#f5f5f5',
    text: '#000000',
    textSecondary: '#666666',
  },
  spacing: {
    pageMargin: '20mm',
    sectionGap: '5mm',
    cellPadding: '2mm 3mm',
  },
  fontSize: {
    hospitalName: '14pt',
    formTitle: '16pt',
    sectionTitle: '12pt',
    body: '10.5pt',
    small: '9pt',
  },
  borderWidth: '1px',
}
