/**
 * @fileoverview CSS 样式生成器
 * @module styles/css-generator
 *
 * @description
 * 根据主题配置生成完整的 CSS 样式字符串。
 * 支持基准单位系统，所有尺寸值从主题配置中获取。
 */

import type { Theme } from '../types/theme'
import { defaultTheme } from './default-theme'

/**
 * 合并主题配置
 * @param customTheme - 自定义主题配置（部分）
 * @returns 合并后的完整主题
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
 * @param theme - 主题配置
 * @returns 完整的 CSS 样式字符串
 *
 * @description
 * 生成的 CSS 包含：
 * - 基础样式（重置、页面布局）
 * - 页眉页脚样式
 * - 各区块类型样式（info-grid、table、checkbox-grid 等）
 * - 打印媒体查询
 * - 水印样式
 *
 * 所有尺寸值从主题配置中获取，支持通过基准单位系统实现整体缩放。
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

.print-page.16k {
  width: 195mm;
  min-height: 270mm;
}

.print-page.16k.landscape {
  width: 270mm;
  min-height: 195mm;
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

  /* 分页控制 */
  .page-break-before {
    page-break-before: always;
  }

  .page-break-after {
    page-break-after: always;
  }

  .no-page-break {
    page-break-inside: avoid;
  }

  /* 避免在表格行中间分页 */
  .data-table tr {
    page-break-inside: avoid;
  }

  /* 避免在区块标题后分页 */
  .section-title {
    page-break-after: avoid;
  }

  /* 签名区域避免分页 */
  .signature-area {
    page-break-inside: avoid;
  }

  /* 表格表头避免与内容分离 */
  .data-table thead {
    display: table-header-group;
  }

  /* 表格页脚避免与内容分离 */
  .data-table tfoot {
    display: table-footer-group;
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
