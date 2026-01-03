/**
 * @fileoverview 渲染选项类型定义
 * @module types/options
 */

import type { Theme } from './theme'

/** 日期格式化选项 */
export interface DateFormatOptions {
  /** 日期格式 */
  dateFormat?: string
  /** 时间格式 */
  timeFormat?: string
  /** 日期时间格式 */
  dateTimeFormat?: string
}

/** 渲染选项 */
export interface RenderOptions {
  /** 主题配置 */
  theme?: Partial<Theme>
  /** 语言环境 */
  locale?: string
  /** 日期格式化选项 */
  dateFormat?: DateFormatOptions
  /** 空值占位符 */
  emptyPlaceholder?: string
  /** 自定义格式化器 */
  formatters?: Record<string, (value: unknown) => string>
  /** CSS 类名前缀（用于隔离模式） */
  classPrefix?: string
}

/** PDF 生成选项 */
export interface PdfOptions extends RenderOptions {
  /** 水印文本 */
  watermark?: string
  /** 水印透明度 (0-1) */
  watermarkOpacity?: number
  /** 是否生成 PDF/A 格式 */
  pdfA?: boolean
}

/** PDF 合并选项 */
export interface MergeOptions {
  /** 是否生成目录 */
  tableOfContents?: boolean
  /** 分隔页标题 */
  sectionDividers?: boolean
}

/** 合并文档项 */
export interface MergeDocumentItem {
  /** 打印配置 */
  schema: import('./print-schema').PrintSchema
  /** 表单数据 */
  data: import('./print-schema').FormData
  /** 文档标题（用于目录） */
  title?: string
}

/**
 * 创建类名生成函数
 * @param options - 渲染选项
 * @returns 类名生成函数
 */
export function createClassNameFn(options?: RenderOptions): (name: string) => string {
  const prefix = options?.classPrefix
  return prefix ? (name: string) => `${prefix}-${name}` : (name: string) => name
}

/**
 * 获取类名（支持命名空间）
 * @param name - 原始类名
 * @param options - 渲染选项
 * @returns 处理后的类名
 */
export function cls(name: string, options?: RenderOptions): string {
  const prefix = options?.classPrefix
  return prefix ? `${prefix}-${name}` : name
}
