/**
 * @fileoverview CSS 样式生成器
 * @module styles/css-generator
 * @version 1.1.0
 * @author Kiro
 * @created 2026-01-02
 * @modified 2026-01-03
 *
 * @description
 * 根据主题配置生成完整的 CSS 样式字符串。
 * 支持基准单位系统，所有尺寸值从主题配置中获取。
 *
 * @dependencies
 * - ../types/theme - 主题类型定义
 * - ./default-theme - 默认主题配置
 * - ./page-sizes - 页面尺寸常量
 *
 * @usedBy
 * - ../renderer/index.ts - 渲染器主入口
 * - ../pagination/paginated-renderer.ts - 分页渲染器
 */

import type { Theme } from '../types/theme'
import { defaultTheme } from './default-theme'
import { PAGE_SIZES } from './page-sizes'

// ==================== 主题合并 ====================

/** 深层部分类型 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * 深度合并两个对象
 */
function deepMerge<T extends object>(target: T, source: DeepPartial<T>): T {
  const result = { ...target } as T
  for (const key of Object.keys(source) as Array<keyof T>) {
    const sourceValue = source[key]
    const targetValue = target[key]
    if (
      sourceValue !== null &&
      sourceValue !== undefined &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue !== null &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      result[key] = deepMerge(targetValue as object, sourceValue as object) as T[keyof T]
    } else if (sourceValue !== undefined) {
      result[key] = sourceValue as T[keyof T]
    }
  }
  return result
}

/**
 * 深度合并主题配置
 * @param customTheme - 自定义主题配置（深层部分）
 * @returns 合并后的完整主题
 */
export function mergeTheme(customTheme?: DeepPartial<Theme>): Theme {
  if (!customTheme) return defaultTheme
  return deepMerge(defaultTheme, customTheme)
}

// ==================== CSS 生成函数 ====================

/**
 * 生成基础重置样式
 */
function generateResetStyles(): string {
  return `
/* 基础样式 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}`
}

/**
 * 生成页面布局样式
 * @param theme - 主题配置
 */
function generatePageStyles(theme: Theme): string {
  return `
/* 页面布局 */
.print-page {
  font-family: ${theme.fonts.body};
  font-size: ${theme.fontSize.body};
  line-height: 1.5;
  color: ${theme.colors.text};
  background: ${theme.colors.background};
  padding: ${theme.spacing.pageMargin};
  width: ${PAGE_SIZES.A4.width};
  min-height: ${PAGE_SIZES.A4.height};
}

.print-page.landscape {
  width: ${PAGE_SIZES.A4.height};
  min-height: ${PAGE_SIZES.A4.width};
}

.print-page.a5 {
  width: ${PAGE_SIZES.A5.width};
  min-height: ${PAGE_SIZES.A5.height};
}

.print-page.a5.landscape {
  width: ${PAGE_SIZES.A5.height};
  min-height: ${PAGE_SIZES.A5.width};
}

.print-page.16k {
  width: ${PAGE_SIZES['16K'].width};
  min-height: ${PAGE_SIZES['16K'].height};
}

.print-page.16k.landscape {
  width: ${PAGE_SIZES['16K'].height};
  min-height: ${PAGE_SIZES['16K'].width};
}`
}

/**
 * 生成页眉样式
 * @param theme - 主题配置
 */
function generateHeaderStyles(theme: Theme): string {
  return `
/* 页眉 */
.print-header {
  text-align: center;
  margin-bottom: ${theme.spacing.headerMarginBottom};
}

.hospital-name {
  font-family: ${theme.fonts.heading};
  font-size: ${theme.fontSize.hospitalName};
  font-weight: bold;
}

.department-name {
  font-size: ${theme.fontSize.sectionTitle};
  margin-top: ${theme.spacing.departmentMarginTop};
}

.form-title {
  font-family: ${theme.fonts.heading};
  font-size: ${theme.fontSize.formTitle};
  font-weight: bold;
  margin-top: ${theme.spacing.titleMarginTop};
}`
}

/**
 * 生成区块通用样式
 * @param theme - 主题配置
 */
function generateSectionStyles(theme: Theme): string {
  return `
/* 区块通用 */
.print-section {
  margin-bottom: ${theme.spacing.sectionGap};
}

.section-title {
  font-family: ${theme.fonts.heading};
  font-size: ${theme.fontSize.sectionTitle};
  font-weight: bold;
  margin-bottom: ${theme.spacing.xs};
}`
}

/**
 * 生成信息网格样式
 * @param theme - 主题配置
 */
function generateInfoGridStyles(theme: Theme): string {
  return `
/* 信息网格 */
.info-grid table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
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
  width: 15%;
}

.info-grid .value-cell {
  min-width: ${theme.spacing.signatureLineWidth};
  word-wrap: break-word;
  overflow-wrap: break-word;
}`
}

/**
 * 生成数据表格样式
 * @param theme - 主题配置
 */
function generateTableStyles(theme: Theme): string {
  return `
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
}`
}

/**
 * 生成勾选框网格样式
 * @param theme - 主题配置
 */
function generateCheckboxStyles(theme: Theme): string {
  return `
/* 勾选框网格 */
.checkbox-grid {
  display: flex;
  flex-wrap: wrap;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: 1mm ${theme.spacing.sm};
}

.checkbox-symbol {
  font-family: "Segoe UI Symbol", "Apple Symbols", sans-serif;
}`
}

/**
 * 生成签名区域样式
 * @param theme - 主题配置
 */
function generateSignatureStyles(theme: Theme): string {
  return `
/* 签名区域 */
.signature-area {
  display: flex;
  justify-content: flex-end;
  gap: ${theme.spacing.signatureGap};
  margin-top: ${theme.spacing.signatureMarginTop};
}

.signature-item {
  display: flex;
  align-items: baseline;
  gap: ${theme.spacing.xs};
}

.signature-label {
  white-space: nowrap;
}

.signature-line {
  display: inline-block;
  min-width: ${theme.spacing.signatureLineWidth};
  border-bottom: ${theme.borderWidth} solid ${theme.colors.border};
  line-height: 1.5;
}

.signature-line:empty::before {
  content: '\\00a0';
}`
}

/**
 * 生成备注和自由文本样式
 * @param theme - 主题配置
 */
function generateNotesStyles(theme: Theme): string {
  return `
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
  min-height: ${theme.spacing.freeTextMinHeight};
  white-space: pre-wrap;
}`
}

/**
 * 生成页脚样式
 * @param theme - 主题配置
 */
function generateFooterStyles(theme: Theme): string {
  return `
/* 页脚 */
.print-footer {
  margin-top: ${theme.spacing.footerMarginTop};
  display: flex;
  justify-content: space-between;
  font-size: ${theme.fontSize.small};
  color: ${theme.colors.textSecondary};
}`
}

/**
 * 生成打印媒体查询样式
 * @param theme - 主题配置
 */
function generatePrintStyles(theme: Theme): string {
  return `
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
}`
}

/**
 * 生成水印样式
 */
function generateWatermarkStyles(): string {
  return `
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
}`
}

// ==================== 主入口 ====================

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
  return [
    generateResetStyles(),
    generatePageStyles(theme),
    generateHeaderStyles(theme),
    generateSectionStyles(theme),
    generateInfoGridStyles(theme),
    generateTableStyles(theme),
    generateCheckboxStyles(theme),
    generateSignatureStyles(theme),
    generateNotesStyles(theme),
    generateFooterStyles(theme),
    generatePrintStyles(theme),
    generateWatermarkStyles(),
  ].join('\n')
}
