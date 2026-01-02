/**
 * @fileoverview 分页相关类型定义
 * @module pagination/types
 * @version 1.0.0
 * @author Kiro
 * @created 2026-01-03
 * @modified 2026-01-03
 *
 * @description
 * 定义智能分页模块的所有类型，包括：
 * - 页面尺寸配置
 * - 可测量内容项
 * - 分页结果
 * - 溢出字段配置
 * - 分页配置
 *
 * @requirements
 * - 9.1: 根据测量内容高度计算分页点
 * - 9.5: 支持可配置的页面尺寸
 * - 9.7: 支持预测量内容高度
 *
 * @usedBy
 * - ./page-dimensions.ts - 页面尺寸配置
 * - ./page-break-calculator.ts - 分页算法核心
 * - ./overflow-handler.ts - 溢出字段处理
 * - ./index.ts - 模块入口
 */

// ==================== 默认配置常量 ====================

/**
 * 分页模块默认配置
 */
export const PAGINATION_DEFAULTS = {
  /** 溢出字段第一页最大字符数 */
  OVERFLOW_FIRST_LINE_CHARS: 60,
  /** 表格行最小高度估算 (mm) */
  MIN_ROW_HEIGHT: 8,
  /** 默认 DPI（每英寸像素数），标准屏幕 DPI 为 96 */
  DPI: 96,
  /** 1英寸 = 25.4毫米 */
  MM_PER_INCH: 25.4,
  /** 默认边距 (mm) */
  MARGIN: {
    TOP: 8,
    BOTTOM: 8,
    LEFT: 10,
    RIGHT: 10,
  },
} as const

/** @deprecated 使用 PAGINATION_DEFAULTS.DPI 代替 */
export const DEFAULT_DPI = PAGINATION_DEFAULTS.DPI

/** @deprecated 使用 PAGINATION_DEFAULTS.MM_PER_INCH 代替 */
export const MM_PER_INCH = PAGINATION_DEFAULTS.MM_PER_INCH

// ==================== 可测量内容项类型 ====================

/**
 * 可测量的内容项类型枚举
 * @requirements 9.1 - 识别不同类型的内容项
 */
export const MEASURABLE_ITEM_TYPES = {
  HEADER: 'header',
  SECTION: 'section',
  TABLE_HEADER: 'table-header',
  TABLE_ROW: 'table-row',
  SIGNATURE: 'signature',
  FOOTER: 'footer',
} as const

/**
 * 可测量的内容项类型
 * @requirements 9.1 - 识别不同类型的内容项
 */
export type MeasurableItemType =
  (typeof MEASURABLE_ITEM_TYPES)[keyof typeof MEASURABLE_ITEM_TYPES]

// ==================== 页面尺寸类型 ====================

/**
 * 页面尺寸配置
 * @requirements 9.5 - 支持可配置的页面尺寸
 */
export interface PageDimensions {
  /** 页面宽度 (mm) */
  width: number
  /** 页面高度 (mm) */
  height: number
  /** 上边距 (mm) */
  marginTop: number
  /** 下边距 (mm) */
  marginBottom: number
  /** 左边距 (mm) */
  marginLeft: number
  /** 右边距 (mm) */
  marginRight: number
}

// ==================== 可测量内容项接口 ====================

/**
 * 可测量的内容项
 * @requirements 9.7 - 支持预测量内容高度
 */
export interface MeasurableItem {
  /** 唯一标识 */
  id: string
  /** 内容类型 */
  type: MeasurableItemType
  /** 测量得到的高度 (px) */
  height: number
  /** 所属表格ID（仅 table-header 和 table-row 有值） */
  tableId?: string
  /** 原始数据索引 */
  dataIndex?: number
}

// ==================== 分页结果类型 ====================

/**
 * 单页内容
 * @requirements 9.1 - 分页结果包含页面内容列表
 */
export interface PageContent {
  /** 页码（从1开始） */
  pageNumber: number
  /** 是否为续页 */
  isContinuation: boolean
  /** 页面包含的内容项ID列表 */
  items: string[]
  /** 需要重复的表头ID列表 */
  repeatedHeaders: string[]
}

/**
 * 分页结果
 * @requirements 9.1 - 返回分页后的页面列表
 */
export interface PageBreakResult {
  /** 页面列表 */
  pages: PageContent[]
  /** 总页数 */
  totalPages: number
}

// ==================== 溢出字段配置 ====================

/**
 * 溢出字段配置
 * 用于指定哪些字段在内容过长时需要分页处理
 * @requirements 9.7 - 支持溢出字段分页
 */
export interface OverflowFieldConfig {
  /** 字段名 */
  fieldName: string
  /** 第一页显示的最大字符数，默认 60 */
  maxFirstLineChars?: number
}

// ==================== 分页配置子类型 ====================

/**
 * 溢出配置
 * 用于配置字段内容溢出时的分页行为
 */
export interface OverflowConfig {
  /** 哪些字段内容溢出时放到下一页 */
  fields?: string[]
  /** 第一页显示的最大字符数，默认 60 */
  firstLineChars?: number
}

/**
 * 显示配置
 * 用于配置每页显示的元素
 */
export interface DisplayConfig {
  /** 是否在每页显示页眉 */
  headerOnEachPage?: boolean
  /** 是否在每页显示页脚 */
  footerOnEachPage?: boolean
  /** 是否在每页底部显示签名区域 */
  signatureOnEachPage?: boolean
  /** 续页是否重复表头 */
  repeatTableHeaders?: boolean
}

/**
 * 页眉配置
 * 用于配置每页页眉的显示
 */
export interface PageHeaderConfig {
  /** 是否在每页显示页眉 */
  showOnEachPage: boolean
  /** 续页标题后缀，如 "(续)" */
  continuationSuffix?: string
}

/**
 * 页脚配置
 * 用于配置每页页脚的显示
 */
export interface PageFooterConfig {
  /** 是否在每页显示页脚 */
  showOnEachPage: boolean
  /** 页码格式，如 "第 {current} 页 / 共 {total} 页" */
  pageNumberFormat?: string
}

/**
 * 智能分页配置
 * 用于启用基于测量的智能分页功能
 */
export interface SmartPaginationConfig {
  /** 是否启用智能分页 */
  enabled: boolean
  /** 表格行最小高度估算 (mm)，用于预估，默认 8 */
  minRowHeight?: number
}

// ==================== 分页配置主类型 ====================

/**
 * 分页配置
 * @requirements 9.1, 9.5 - 支持可配置的分页规则
 */
export interface PaginationConfig {
  /** 是否启用分页 */
  enabled: boolean
  /** 分页模式：auto 自动 | manual 手动指定断点 */
  mode?: 'auto' | 'manual'
  /** 手动模式下，在哪些 section 索引后分页（从0开始） */
  pageBreaks?: number[]
  /** 溢出配置 */
  overflow?: OverflowConfig
  /** 显示配置 */
  display?: DisplayConfig
  /** 智能分页配置 */
  smartPagination?: SmartPaginationConfig
  /** 页眉配置 */
  headerConfig?: PageHeaderConfig
  /** 页脚配置 */
  footerConfig?: PageFooterConfig

  // ==================== 兼容性字段（已废弃） ====================
  /** @deprecated 使用 overflow.fields 代替 */
  overflowFields?: string[]
  /** @deprecated 使用 overflow.firstLineChars 代替 */
  overflowFirstLineChars?: number
  /** @deprecated 使用 display.headerOnEachPage 代替 */
  showHeaderOnEachPage?: boolean
  /** @deprecated 使用 display.footerOnEachPage 代替 */
  showFooterOnEachPage?: boolean
  /** @deprecated 使用 display.signatureOnEachPage 代替 */
  showSignatureOnEachPage?: boolean
  /** @deprecated 使用 display.repeatTableHeaders 代替 */
  repeatTableHeaders?: boolean
}

// ==================== 分页计算参数类型 ====================

/**
 * 分页计算选项
 * 用于 calculatePageBreaks 函数的参数
 * @requirements 9.1 - 分页计算参数
 */
export interface PageBreakOptions {
  /** 页面可用高度 (px) */
  pageHeight: number
  /** 页眉高度 (px)，默认 0 */
  headerHeight?: number
  /** 页脚高度 (px)，默认 0 */
  footerHeight?: number
  /** 是否重复表头，默认 true */
  repeatTableHeaders?: boolean
}

// ==================== 工具类型 ====================

/**
 * 页面尺寸预设名称
 */
export type PageSizePreset = '16K' | 'A4' | 'A5'

/**
 * 分页模式
 */
export type PaginationMode = 'auto' | 'manual'
