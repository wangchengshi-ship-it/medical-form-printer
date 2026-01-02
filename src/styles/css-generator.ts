/**
 * @fileoverview CSS 样式生成器
 * @module styles/css-generator
 */

import type { Theme } from '../types/theme'
import { defaultTheme } from './default-theme'

/**
 * 合并主题配置
 */
export function mergeTheme(customTheme?: Partial<Theme>): Theme {
  if (!customTheme) return defaultTheme

  return {
    fonts: { ...defaultTheme.fonts, ...customTheme.fonts },
    colors: { ...defaultTheme.colors, ...customTheme.colors },
    spacing: { ...defaultTheme.spacing, ...customTheme.spacing },
    fontSize: { ...defaultTheme.fontSize, ...customTheme.fontSize },
    borderWidth: customTheme.borderWidth ?? defaultTheme.borderWidth,
  }
}

/**
 * 生成 CSS 样式字符串
 */
export function generateCss(theme: Theme): string {
  return `
/* 基础样式 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.print-page {
  font-family: ${theme.fonts.body};
  font-size: ${theme.fontSize.body};
  line-height: 1.5;
  color: ${theme.colors.text};
  background: ${theme.colors.background};
  padding: ${theme.spacing.pageMargin};
  width: 210mm;
  min-height: 297mm;
}

.print-page.landscape {
  width: 297mm;
  min-height: 210mm;
}

.print-page.a5 {
  width: 148mm;
  min-height: 210mm;
}

.print-page.a5.landscape {
  width: 210mm;
  min-height: 148mm;
}

/* 页眉 */
.print-header {
  text-align: center;
  margin-bottom: 10mm;
}

.hospital-name {
  font-family: ${theme.fonts.heading};
  font-size: ${theme.fontSize.hospitalName};
  font-weight: bold;
}

.department-name {
  font-size: ${theme.fontSize.sectionTitle};
  margin-top: 2mm;
}

.form-title {
  font-family: ${theme.fonts.heading};
  font-size: ${theme.fontSize.formTitle};
  font-weight: bold;
  margin-top: 5mm;
}

/* 区块通用 */
.print-section {
  margin-bottom: ${theme.spacing.sectionGap};
}

.section-title {
  font-family: ${theme.fonts.heading};
  font-size: ${theme.fontSize.sectionTitle};
  font-weight: bold;
  margin-bottom: 2mm;
}

/* 信息网格 */
.info-grid table {
  width: 100%;
  border-collapse: collapse;
}

.info-grid td {
  border: ${theme.borderWidth} solid ${theme.colors.border};
  padding: ${theme.spacing.cellPadding};
  vertical-align: middle;
}

.info-grid .label-cell {
  background: ${theme.colors.labelBackground};
  white-space: nowrap;
  font-weight: normal;
}

.info-grid .value-cell {
  min-width: 30mm;
}

/* 数据表格 */
.data-table table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  border: ${theme.borderWidth} solid ${theme.colors.border};
  padding: ${theme.spacing.cellPadding};
  text-align: center;
}

.data-table th {
  background: ${theme.colors.labelBackground};
  font-weight: normal;
}

/* 勾选框网格 */
.checkbox-grid {
  display: flex;
  flex-wrap: wrap;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 2mm;
  padding: 1mm 3mm;
}

.checkbox-symbol {
  font-family: "Segoe UI Symbol", "Apple Symbols", sans-serif;
}

/* 签名区域 */
.signature-area {
  display: flex;
  justify-content: flex-end;
  gap: 20mm;
  margin-top: 10mm;
}

.signature-item {
  display: flex;
  align-items: baseline;
  gap: 2mm;
}

.signature-line {
  display: inline-block;
  min-width: 30mm;
  border-bottom: ${theme.borderWidth} solid ${theme.colors.border};
}

/* 备注区域 */
.notes-section {
  padding: ${theme.spacing.cellPadding};
  font-size: ${theme.fontSize.small};
  color: ${theme.colors.textSecondary};
}

.notes-section.bordered {
  border: ${theme.borderWidth} solid ${theme.colors.border};
}

/* 自由文本 */
.free-text {
  border: ${theme.borderWidth} solid ${theme.colors.border};
  padding: ${theme.spacing.cellPadding};
  min-height: 20mm;
  white-space: pre-wrap;
}

/* 页脚 */
.print-footer {
  margin-top: 10mm;
  display: flex;
  justify-content: space-between;
  font-size: ${theme.fontSize.small};
  color: ${theme.colors.textSecondary};
}

/* 打印样式 */
@media print {
  .print-page {
    padding: 0;
    width: 100%;
    min-height: auto;
  }
  
  @page {
    margin: ${theme.spacing.pageMargin};
  }
}

/* 水印 */
.watermark {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-45deg);
  font-size: 48pt;
  color: rgba(0, 0, 0, 0.1);
  pointer-events: none;
  z-index: 1000;
  white-space: nowrap;
}
`
}
