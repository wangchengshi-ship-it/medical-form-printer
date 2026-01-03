/**
 * @fileoverview CSS 样式生成器
 * @module styles/css-generator
 * @version 2.0.0
 * @author Kiro
 * @created 2026-01-02
 * @modified 2026-01-03
 *
 * @description
 * 根据主题配置生成完整的 CSS 样式字符串。
 * 支持基准单位系统，所有尺寸值从主题配置中获取。
 * 支持 CSS 隔离模式，确保样式不受外部影响。
 *
 * v2.0.0 重构：
 * - 使用配置驱动消除重复代码
 * - 统一普通模式和隔离模式的生成逻辑
 * - 提取公共工具函数
 *
 * @dependencies
 * - ../types/theme - 主题类型定义
 * - ./default-theme - 默认主题配置
 * - ./page-sizes - 页面尺寸常量
 * - ./isolation - CSS 隔离模块
 * - ../fonts - 字体模块
 *
 * @usedBy
 * - ../renderer/index.ts - 渲染器主入口
 * - ../pagination/paginated-renderer.ts - 分页渲染器
 */

import type { Theme } from '../types/theme'
import { defaultTheme } from './default-theme'
import { PAGE_SIZES } from './page-sizes'
import { CSS_NAMESPACE, generateIsolationCss } from './isolation'
import { getFontCss, FONT_FAMILY } from '../fonts'

// ==================== 类型定义 ====================

/** 深层部分类型 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/** 样式生成配置 */
interface StyleConfig {
  /** 是否使用命名空间前缀 */
  namespaced: boolean
  /** 是否强制使用内嵌字体（忽略主题字体配置） */
  forceEmbeddedFont: boolean
}

/** 默认配置：普通模式 */
const NORMAL_CONFIG: StyleConfig = {
  namespaced: false,
  forceEmbeddedFont: false,
}

/** 隔离模式配置 */
const ISOLATED_CONFIG: StyleConfig = {
  namespaced: true,
  forceEmbeddedFont: true,
}

// ==================== 工具函数 ====================

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

/**
 * 创建类名生成函数
 * @param config - 样式配置
 * @returns 类名生成函数
 */
function createClassNameFn(config: StyleConfig): (name: string) => string {
  return config.namespaced ? (name: string) => `${CSS_NAMESPACE}-${name}` : (name: string) => name
}

/**
 * 获取字体族字符串
 * @param theme - 主题配置
 * @param config - 样式配置
 * @param type - 字体类型 ('body' | 'heading')
 */
function getFontFamilyStr(theme: Theme, config: StyleConfig, type: 'body' | 'heading'): string {
  if (config.forceEmbeddedFont) {
    return `'${FONT_FAMILY}', serif`
  }
  return type === 'body' ? theme.fonts.body : theme.fonts.heading
}

// ==================== CSS 生成函数 ====================

/**
 * 生成基础重置样式
 */
function generateResetStyles(cls: (name: string) => string, config: StyleConfig): string {
  const selector = config.namespaced ? `.${cls('root')} *` : '*'
  return `
/* 基础样式 */
${selector} {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}`
}

/**
 * 生成页面布局样式
 */
function generatePageStyles(theme: Theme, cls: (name: string) => string, config: StyleConfig): string {
  const fontFamily = getFontFamilyStr(theme, config, 'body')
  
  return `
/* 页面布局 */
.${cls('print-page')} {
  font-family: ${fontFamily};
  font-size: ${theme.fontSize.body};
  line-height: 1.5;
  color: ${theme.colors.text};
  background: ${theme.colors.background};
  padding: ${theme.spacing.pageMargin};
  width: ${PAGE_SIZES.A4.width};
  min-height: ${PAGE_SIZES.A4.height};
}

.${cls('print-page')}.${cls('landscape')} {
  width: ${PAGE_SIZES.A4.height};
  min-height: ${PAGE_SIZES.A4.width};
}

.${cls('print-page')}.${cls('a5')} {
  width: ${PAGE_SIZES.A5.width};
  min-height: ${PAGE_SIZES.A5.height};
}

.${cls('print-page')}.${cls('a5')}.${cls('landscape')} {
  width: ${PAGE_SIZES.A5.height};
  min-height: ${PAGE_SIZES.A5.width};
}

/* 16K 纸张：固定高度以匹配物理打印尺寸，防止内容溢出导致分页问题 */
.${cls('print-page')}.${cls('16k')} {
  width: ${PAGE_SIZES['16K'].width};
  height: ${PAGE_SIZES['16K'].height};
  min-height: ${PAGE_SIZES['16K'].height};
  padding: 8mm 10mm;
  overflow: hidden;
}

.${cls('print-page')}.${cls('16k')}.${cls('landscape')} {
  width: ${PAGE_SIZES['16K'].height};
  height: ${PAGE_SIZES['16K'].width};
  min-height: ${PAGE_SIZES['16K'].width};
  padding: 10mm 8mm;
  overflow: hidden;
}`
}

/**
 * 生成页眉样式
 */
function generateHeaderStyles(theme: Theme, cls: (name: string) => string, config: StyleConfig): string {
  const headingFont = getFontFamilyStr(theme, config, 'heading')
  
  return `
/* 页眉 */
.${cls('print-header')} {
  text-align: center;
  margin-bottom: 3mm;
  padding-bottom: 2mm;
}

.${cls('header-row')} {
  display: flex;
  justify-content: space-between;
  font-size: 10.5pt;
  font-weight: 600;
  margin-bottom: 1mm;
}

.${cls('hospital-name')} {
  font-family: ${headingFont};
  font-size: 10.5pt;
  font-weight: 600;
}

.${cls('department-name')} {
  font-size: 10.5pt;
  font-weight: 600;
}

.${cls('form-title')} {
  font-family: ${headingFont};
  font-size: 14pt;
  font-weight: bold;
  margin: 2mm 0 1mm 0;
  letter-spacing: 2pt;
}`
}

/**
 * 生成区块通用样式
 */
function generateSectionStyles(theme: Theme, cls: (name: string) => string, config: StyleConfig): string {
  const headingFont = getFontFamilyStr(theme, config, 'heading')
  
  return `
/* 区块通用 */
.${cls('print-section')} {
  margin-bottom: ${theme.spacing.sectionGap};
}

.${cls('section-title')} {
  font-family: ${headingFont};
  font-size: ${theme.fontSize.sectionTitle};
  font-weight: bold;
  margin-bottom: ${theme.spacing.xs};
}`
}

/**
 * 生成信息网格样式（下划线填空样式）
 * @param _theme - 主题配置（预留扩展，当前未使用）
 * @param cls - 类名生成函数
 */
function generateInfoGridStyles(_theme: Theme, cls: (name: string) => string): string {
  return `
/* 信息网格 - 下划线填空样式 */
.${cls('info-grid')} {
  margin-bottom: 0.5mm;
}

/* 每个 row 是一行，使用 flex 布局 */
.${cls('info-row')} {
  display: flex;
  flex-wrap: nowrap;
  margin-bottom: 0.5mm;
  line-height: 1.8;
}

.${cls('info-item')} {
  display: inline-flex;
  align-items: baseline;
  margin-right: 2mm;
  white-space: nowrap;
  flex-shrink: 0;
}

/* 最后一个 item 自动填满剩余空间 */
.${cls('info-item')}:last-child {
  flex: 1;
  margin-right: 0;
}

.${cls('info-item')}.${cls('span-2')} {
  margin-right: 3mm;
}

.${cls('label')} {
  letter-spacing: 0;
}

/* 字段值容器：文字 + 下划线 */
.${cls('field-value')} {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  min-width: 12mm;
  vertical-align: bottom;
  flex: 1;
}

.${cls('field-value')}.${cls('custom-width')} {
  min-width: unset;
  flex: none;
}

.${cls('field-value')} .${cls('text')} {
  min-height: 1.1em;
  display: block;
  padding: 0 0.5mm;
}

.${cls('field-value')} .${cls('text')}:empty::before {
  content: '\\00a0';
}

.${cls('field-value')} .${cls('line')} {
  width: 100%;
  border-bottom: 0.5pt solid #000;
}

/* 全宽下划线（用于空标签行） */
.${cls('field-value')}.${cls('full-width')} {
  width: 100%;
  flex: 1;
}

.${cls('checkbox-inline')} {
  margin-left: 1mm;
}

/* checkbox-text 类型：☑/□ + 文本 */
.${cls('checkbox-text-item')} {
  display: block;
  width: 100%;
  white-space: normal;
  line-height: 1.6;
}

.${cls('checkbox-text')} {
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* textarea 类型：标签+内容自然换行 */
.${cls('textarea-item')} {
  display: block;
  width: 100%;
  white-space: normal;
  line-height: 1.6;
}

.${cls('textarea-item')} .${cls('label')} {
  white-space: nowrap;
}

.${cls('textarea-content')} {
  white-space: pre-wrap;
  word-wrap: break-word;
  word-break: break-all;
}`
}

/**
 * 生成数据表格样式
 */
function generateTableStyles(theme: Theme, cls: (name: string) => string): string {
  return `
/* 数据表格 */
.${cls('data-table')} table {
  width: 100%;
  border-collapse: collapse;
}

.${cls('data-table')} th,
.${cls('data-table')} td {
  border: ${theme.borderWidth} solid ${theme.colors.border};
  padding: ${theme.spacing.cellPadding};
  text-align: center;
}

.${cls('data-table')} th {
  background: ${theme.colors.labelBackground};
  font-weight: normal;
}`
}

/**
 * 生成勾选框网格样式
 * @param _theme - 主题配置（预留扩展，当前未使用）
 * @param cls - 类名生成函数
 */
function generateCheckboxStyles(_theme: Theme, cls: (name: string) => string): string {
  return `
/* 勾选框网格 */
.${cls('checkbox-grid')} {
  margin: 0.5mm 0;
  line-height: 1.8;
}

/* 网格布局 */
.${cls('checkbox-grid')}.${cls('checkbox-grid-grid')} {
  display: grid;
  gap: 0.5mm 2mm;
}

/* 流式布局 */
.${cls('checkbox-grid')}.${cls('checkbox-grid-flex')} {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5mm 1.5mm;
}

.${cls('checkbox-item')} {
  display: flex;
  align-items: baseline;
  gap: 0.3mm;
  white-space: nowrap;
}

.${cls('prefix-label')} {
  flex-shrink: 0;
}

.${cls('checkbox-symbol')} {
  font-family: "SimSun", "宋体", serif;
  font-size: 10pt;
}

.${cls('checkbox-label')} {
  flex-shrink: 0;
}

.${cls('text-input-item')} {
  display: flex;
  align-items: baseline;
}

.${cls('text-input-label')} {
  flex-shrink: 0;
}

.${cls('input-line')} {
  min-width: 15mm;
  border-bottom: 0.5pt solid #000;
  padding: 0 1mm;
  margin-left: 1mm;
  text-align: center;
}`
}

/**
 * 生成签名区域样式
 */
function generateSignatureStyles(theme: Theme, cls: (name: string) => string): string {
  return `
/* 签名区域 */
.${cls('signature-area')} {
  display: flex;
  justify-content: flex-end;
  gap: ${theme.spacing.signatureGap};
  margin-top: ${theme.spacing.signatureMarginTop};
}

.${cls('signature-item')} {
  display: flex;
  align-items: baseline;
  gap: ${theme.spacing.xs};
}

.${cls('signature-label')} {
  white-space: nowrap;
}

.${cls('signature-line')} {
  display: inline-block;
  min-width: ${theme.spacing.signatureLineWidth};
  border-bottom: ${theme.borderWidth} solid ${theme.colors.border};
  line-height: 1.5;
}

.${cls('signature-line')}:empty::before {
  content: '\\00a0';
}`
}

/**
 * 生成备注和自由文本样式
 */
function generateNotesStyles(theme: Theme, cls: (name: string) => string): string {
  return `
/* 备注区域 */
.${cls('notes-section')} {
  padding: ${theme.spacing.cellPadding};
  font-size: ${theme.fontSize.small};
  color: ${theme.colors.textSecondary};
}

.${cls('notes-section')}.${cls('bordered')} {
  border: ${theme.borderWidth} solid ${theme.colors.border};
}

/* 自由文本 */
.${cls('free-text')} {
  border: ${theme.borderWidth} solid ${theme.colors.border};
  padding: ${theme.spacing.cellPadding};
  min-height: ${theme.spacing.freeTextMinHeight};
  white-space: pre-wrap;
}`
}

/**
 * 生成页脚样式
 */
function generateFooterStyles(theme: Theme, cls: (name: string) => string): string {
  return `
/* 页脚 */
.${cls('print-footer')} {
  margin-top: ${theme.spacing.footerMarginTop};
  display: flex;
  justify-content: space-between;
  font-size: ${theme.fontSize.small};
  color: ${theme.colors.textSecondary};
}`
}

/**
 * 生成打印媒体查询样式
 */
function generatePrintStyles(theme: Theme, cls: (name: string) => string, config: StyleConfig): string {
  // 隔离模式额外的打印样式
  const isolatedPrintStyles = config.namespaced
    ? `
  /* 打印时禁用字体平滑以获得更清晰的输出 */
  .${cls('root')},
  .${cls('root')} * {
    -webkit-font-smoothing: subpixel-antialiased !important;
    -moz-osx-font-smoothing: auto !important;
  }`
    : ''

  return `
/* 打印样式 */
@media print {
  .${cls('print-page')} {
    padding: 0;
    width: 100%;
    min-height: auto;
  }
  
  @page {
    margin: ${theme.spacing.pageMargin};
  }

  /* 分页控制 */
  .${cls('page-break-before')} {
    page-break-before: always;
  }

  .${cls('page-break-after')} {
    page-break-after: always;
  }

  .${cls('no-page-break')} {
    page-break-inside: avoid;
  }

  /* 避免在表格行中间分页 */
  .${cls('data-table')} tr {
    page-break-inside: avoid;
  }

  /* 避免在区块标题后分页 */
  .${cls('section-title')} {
    page-break-after: avoid;
  }

  /* 签名区域避免分页 */
  .${cls('signature-area')} {
    page-break-inside: avoid;
  }

  /* 表格表头避免与内容分离 */
  .${cls('data-table')} thead {
    display: table-header-group;
  }

  /* 表格页脚避免与内容分离 */
  .${cls('data-table')} tfoot {
    display: table-footer-group;
  }${isolatedPrintStyles}
}`
}

/**
 * 生成水印样式
 */
function generateWatermarkStyles(cls: (name: string) => string): string {
  return `
/* 水印 */
.${cls('watermark')} {
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

// ==================== 核心生成函数 ====================

/**
 * 生成组件样式（内部函数）
 * @param theme - 主题配置
 * @param config - 样式配置
 * @returns CSS 字符串
 */
function generateComponentStyles(theme: Theme, config: StyleConfig): string {
  const cls = createClassNameFn(config)

  return [
    generateResetStyles(cls, config),
    generatePageStyles(theme, cls, config),
    generateHeaderStyles(theme, cls, config),
    generateSectionStyles(theme, cls, config),
    generateInfoGridStyles(theme, cls),
    generateTableStyles(theme, cls),
    generateCheckboxStyles(theme, cls),
    generateSignatureStyles(theme, cls),
    generateNotesStyles(theme, cls),
    generateFooterStyles(theme, cls),
    generatePrintStyles(theme, cls, config),
    generateWatermarkStyles(cls),
  ].join('\n')
}

// ==================== 公共 API ====================

/**
 * 生成 CSS 样式字符串（普通模式）
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
  return generateComponentStyles(theme, NORMAL_CONFIG)
}

/**
 * 生成完整的隔离 CSS
 *
 * @param customTheme - 自定义主题配置（字体配置将被忽略）
 * @returns 包含字体、隔离和组件样式的完整 CSS
 *
 * @description
 * 生成的 CSS 包含：
 * 1. @font-face 声明（内嵌 Base64 字体）
 * 2. 字体强制覆盖规则
 * 3. CSS 隔离容器样式
 * 4. 所有组件样式（带 mpr- 前缀）
 * 5. 打印媒体查询
 *
 * 注意：传入的主题配置中的 fonts 属性将被忽略，
 * 始终使用内嵌的思源宋体 SC。
 */
export function generateIsolatedCss(customTheme?: DeepPartial<Theme>): string {
  const theme = mergeTheme(customTheme)

  return [
    // 1. 字体 CSS（@font-face + 强制覆盖）
    getFontCss(),
    // 2. 隔离容器样式
    generateIsolationCss(),
    // 3. 组件样式（带命名空间）
    generateComponentStyles(theme, ISOLATED_CONFIG),
  ].join('\n')
}
