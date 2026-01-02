/**
 * @fileoverview 内容测量器类型定义
 * @module pagination/measurer-types
 * @version 1.0.0
 * @author Kiro
 * @created 2026-01-03
 * @modified 2026-01-03
 *
 * @description
 * 定义内容测量器的所有类型，包括：
 * - 测量配置 (MeasureConfig)
 * - 测量结果 (MeasureResult)
 * - 元素测量选项 (MeasureElementOptions)
 *
 * 内容测量器用于在浏览器环境中测量渲染后元素的实际高度，
 * 以便进行精确的分页计算。
 *
 * @requirements
 * - 10.1: 创建隐藏容器匹配打印样式进行测量
 *
 * @usedBy
 * - ./content-measurer.ts - 内容测量器实现
 * - ./index.ts - 模块入口
 */

import type { MeasurableItemType } from './types'

// ==================== 测量配置 ====================

/**
 * 测量配置
 * 用于配置测量容器的样式，确保与打印样式一致
 * @requirements 10.1 - 创建隐藏容器匹配打印样式
 */
export interface MeasureConfig {
  /** 容器宽度 (px)，应与打印宽度一致 */
  containerWidth: number
  /** 字体大小，默认 '10pt' */
  fontSize?: string
  /** 行高，默认 1.8 */
  lineHeight?: number
  /** 字体，默认宋体 */
  fontFamily?: string
}

/**
 * 完整的测量配置（所有字段必填）
 */
export interface RequiredMeasureConfig {
  /** 容器宽度 (px) */
  containerWidth: number
  /** 字体大小 */
  fontSize: string
  /** 行高 */
  lineHeight: number
  /** 字体 */
  fontFamily: string
}

// ==================== 测量结果 ====================

/**
 * 单个元素的测量结果
 * @requirements 10.2 - 测量实际渲染高度
 */
export interface MeasureResult {
  /** 元素唯一标识 */
  id: string
  /** 测量高度 (px) */
  height: number
}

// ==================== 元素测量选项 ====================

/**
 * 元素测量选项
 * 用于指定测量元素的元数据
 * @requirements 10.5 - 支持批量测量多个元素
 */
export interface MeasureElementOptions {
  /** 元素唯一标识 */
  id: string
  /** 内容类型 */
  type: MeasurableItemType
  /** 所属表格ID（仅 table-header 和 table-row 有值） */
  tableId?: string
  /** 原始数据索引 */
  dataIndex?: number
}

// ==================== 表格测量选项 ====================

/**
 * 表格测量选项
 * @requirements 10.3 - 支持测量可变高度的表格行
 */
export interface MeasureTableOptions {
  /** 表格唯一标识 */
  tableId: string
  /** 是否包含表头测量，默认 true */
  includeHeader?: boolean
  /** 是否包含表体行测量，默认 true */
  includeRows?: boolean
}

// ==================== 文本估算选项 ====================

/**
 * 文本高度估算选项
 * 用于无 DOM 环境的降级方案
 * @requirements 10.4 - 处理文本换行估算
 */
export interface TextEstimateOptions {
  /** 容器宽度 (px) */
  containerWidth: number
  /** 字体大小 (px)，默认 13.33 (10pt ≈ 13.33px) */
  fontSize?: number
  /** 行高，默认 1.8 */
  lineHeight?: number
  /** 是否为中文文本，默认 true（影响字符宽度估算） */
  isChinese?: boolean
}

// ==================== 测量容器选项 ====================

/**
 * 测量容器创建选项
 * @requirements 10.1 - 创建隐藏容器
 */
export interface MeasureContainerOptions {
  /** 容器 CSS 类名，默认 'print-measure-container' */
  className?: string
  /** 是否添加到 document.body，默认 true */
  appendToBody?: boolean
  /** 自定义样式 */
  customStyles?: Partial<CSSStyleDeclaration>
}

// ==================== 批量测量选项 ====================

/**
 * 批量测量选项
 * @requirements 10.5 - 支持批量测量多个元素
 */
export interface MeasureAllOptions {
  /** 是否测量页眉，默认 true */
  measureHeader?: boolean
  /** 是否测量页脚，默认 true */
  measureFooter?: boolean
  /** 是否测量签名区域，默认 true */
  measureSignature?: boolean
  /** 是否测量表格，默认 true */
  measureTables?: boolean
  /** 是否测量区块，默认 true */
  measureSections?: boolean
}

// ==================== 默认配置常量 ====================

/**
 * 默认测量配置
 */
export const DEFAULT_MEASURE_CONFIG: RequiredMeasureConfig = {
  containerWidth: 624, // 约 165mm @ 96dpi (16K 纸张可用宽度)
  fontSize: '10pt',
  lineHeight: 1.8,
  fontFamily: "'Source Han Serif SC', 'SimSun', '宋体', serif",
}

/**
 * 测量容器的默认 CSS 类名
 */
export const MEASURE_CONTAINER_CLASS = 'print-measure-container'

/**
 * 默认文本估算配置
 */
export const DEFAULT_TEXT_ESTIMATE_OPTIONS: Required<TextEstimateOptions> = {
  containerWidth: 624,
  fontSize: 13.33, // 10pt ≈ 13.33px
  lineHeight: 1.8,
  isChinese: true,
}

// ==================== CSS 选择器常量 ====================

/**
 * 内容测量器使用的 CSS 选择器
 * 用于在 DOM 中查找各类可测量元素
 */
export const MEASURE_SELECTORS = {
  /** 页眉选择器 */
  HEADER: ':scope > .print-header',
  /** 页面主体选择器 */
  BODY: ':scope > .print-body',
  /** 区块标题选择器 */
  SECTION_TITLE: ':scope > .section-title-block',
  /** 信息网格包装选择器 */
  INFO_GRID_WRAPPER: ':scope > .info-grid-wrapper[data-section-id]',
  /** 数据表格包装选择器 */
  TABLE_WRAPPER: ':scope > .data-table-wrapper[data-section-id]',
  /** 勾选框网格包装选择器 */
  CHECKBOX_GRID_WRAPPER: ':scope > .checkbox-grid-wrapper[data-section-id]',
  /** 医疗勾选行包装选择器 */
  MEDICAL_CHECKBOX_ROW_WRAPPER: ':scope > .medical-checkbox-row-wrapper[data-section-id]',
  /** 备注选择器 */
  NOTES: ':scope > .notes-text',
  /** 签名区域选择器 */
  SIGNATURE: ':scope > .signature-area',
  /** 表头选择器 */
  TABLE_HEADER: 'thead',
  /** 表格行选择器 */
  TABLE_ROWS: 'tbody tr',
} as const

// ==================== 类型守卫 ====================

/**
 * 检查是否为有效的测量配置
 * @param config - 待检查的配置
 * @returns 是否为有效配置
 */
export function isValidMeasureConfig(config: unknown): config is MeasureConfig {
  if (typeof config !== 'object' || config === null) {
    return false
  }
  const c = config as Record<string, unknown>
  return (
    typeof c.containerWidth === 'number' &&
    c.containerWidth > 0 &&
    (c.fontSize === undefined || typeof c.fontSize === 'string') &&
    (c.lineHeight === undefined || typeof c.lineHeight === 'number') &&
    (c.fontFamily === undefined || typeof c.fontFamily === 'string')
  )
}

/**
 * 检查是否为有效的测量结果
 * @param result - 待检查的结果
 * @returns 是否为有效结果
 */
export function isValidMeasureResult(result: unknown): result is MeasureResult {
  if (typeof result !== 'object' || result === null) {
    return false
  }
  const r = result as Record<string, unknown>
  return (
    typeof r.id === 'string' &&
    r.id.length > 0 &&
    typeof r.height === 'number' &&
    r.height >= 0
  )
}
