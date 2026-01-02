/**
 * @fileoverview 分页模块入口
 * @module pagination
 * @version 1.0.0
 * @author Kiro
 * @created 2026-01-03
 * @modified 2026-01-03
 *
 * @description
 * 导出所有分页相关的类型和函数：
 * - 类型定义
 * - 页面尺寸配置
 * - 分页算法
 * - 溢出字段处理
 *
 * @requirements
 * - 9.1: 根据测量内容高度计算分页点
 *
 * @usedBy
 * - ../index.ts - 库主入口
 * - international-postpartum-frontend - 前端打印模块
 */

// ==================== 类型导出 ====================

export type {
  // 页面尺寸
  PageDimensions,
  // 可测量内容项
  MeasurableItemType,
  MeasurableItem,
  // 分页结果
  PageContent,
  PageBreakResult,
  // 溢出字段配置
  OverflowFieldConfig,
  OverflowConfig,
  DisplayConfig,
  // 分页配置
  PageHeaderConfig,
  PageFooterConfig,
  SmartPaginationConfig,
  PaginationConfig,
  // 分页计算参数
  PageBreakOptions,
  // 工具类型
  PageSizePreset,
  PaginationMode,
} from './types'

export {
  // 常量
  PAGINATION_DEFAULTS,
  MEASURABLE_ITEM_TYPES,
  // 兼容性导出
  DEFAULT_DPI,
  MM_PER_INCH,
} from './types'

// ==================== 页面尺寸导出 ====================

export {
  // 预设配置
  PAGE_16K,
  PAGE_A4,
  PAGE_A5,
  PAGE_PRESETS,
  // 单位转换
  mmToPx,
  pxToMm,
  mmToPt,
  ptToMm,
  // 尺寸计算
  calculateUsableHeight,
  calculateUsableWidth,
  calculateUsableHeightMm,
  calculateUsableWidthMm,
  // 工具函数
  getPageDimensions,
  createPageDimensions,
} from './page-dimensions'

// ==================== 分页算法导出 ====================

export {
  // 核心算法
  calculatePageBreaks,
  calculatePageBreaksSimple,
  // 辅助函数
  findTableHeader,
  buildTableHeaderMap,
  // 验证函数
  validatePageBreakResult,
  getPageContentHeight,
} from './page-break-calculator'

// ==================== 溢出字段处理导出 ====================

export {
  // 核心函数
  getOverflowFirstLine,
  getOverflowRest,
  hasOverflowContent,
  // 配置函数
  createOverflowFieldConfig,
  createOverflowFieldConfigs,
  getOverflowFieldConfig,
  isOverflowField,
  // 批量处理
  processOverflowFields,
  hasAnyOverflowContent,
} from './overflow-handler'

export type { OverflowFieldResult } from './overflow-handler'

// ==================== 内容测量器导出 ====================

export {
  // 环境检测
  isBrowserEnvironment,
  // 测量容器管理
  createMeasureContainer,
  destroyMeasureContainer,
  // 元素测量
  measureElementHeight,
  measureElementWithOptions,
  measureElements,
  // 表格测量
  measureTableRows,
  measureMultipleTables,
  // 文本估算
  estimateTextHeight,
  estimateMultipleTextHeights,
  estimateTableRowHeight,
  // 批量测量
  measureAll,
  // Composable 风格 API
  createContentMeasurer,
  // 常量
  DEFAULT_MEASURE_CONFIG,
  MEASURE_CONTAINER_CLASS,
  DEFAULT_TEXT_ESTIMATE_OPTIONS,
  MEASURE_SELECTORS,
  // 类型守卫
  isValidMeasureConfig,
  isValidMeasureResult,
} from './content-measurer'

export type {
  MeasureConfig,
  RequiredMeasureConfig,
  MeasureResult,
  MeasureElementOptions,
  MeasureTableOptions,
  TextEstimateOptions,
  MeasureContainerOptions,
  MeasureAllOptions,
} from './content-measurer'

// ==================== 分页渲染器导出 ====================

export {
  // 主渲染函数
  renderPaginatedHtml,
  renderPaginatedHtmlSimple,
  // CSS 生成
  generatePaginationCss,
  // 配置工具
  createRenderConfigFromPaginationConfig,
  // 默认配置
  DEFAULT_PAGINATED_RENDER_CONFIG,
} from './paginated-renderer'

export type {
  PaginatedRenderConfig,
  PaginatedRenderContext,
} from './paginated-renderer'

// ==================== Composable 风格 API ====================

import type { PageDimensions, MeasurableItem, PageBreakResult } from './types'
import {
  PAGE_16K,
  calculateUsableHeight,
  calculateUsableWidth,
  mmToPx,
  pxToMm,
} from './page-dimensions'
import { calculatePageBreaks } from './page-break-calculator'

/**
 * 打印分页工具函数集合
 * 提供类似 Vue Composable 的 API 风格
 *
 * @param dimensions - 页面尺寸配置，默认十六开
 * @returns 分页相关的工具函数
 *
 * @example
 * const { calculateBreaks, usableHeight } = usePrintPagination()
 * const result = calculateBreaks(measuredItems, usableHeight)
 */
export function usePrintPagination(dimensions: PageDimensions = PAGE_16K) {
  const usableHeight = calculateUsableHeight(dimensions)
  const usableWidth = calculateUsableWidth(dimensions)

  /**
   * 计算分页
   * @param items - 测量后的内容项列表
   * @param headerHeight - 页眉高度 (px)
   * @param footerHeight - 页脚高度 (px)
   * @returns 分页结果
   */
  const calculateBreaks = (
    items: MeasurableItem[],
    headerHeight: number = 0,
    footerHeight: number = 0
  ): PageBreakResult => {
    return calculatePageBreaks(items, {
      pageHeight: usableHeight,
      headerHeight,
      footerHeight,
      repeatTableHeaders: true,
    })
  }

  return {
    /** 页面尺寸配置 */
    dimensions,
    /** 可用内容高度 (px) */
    usableHeight,
    /** 可用内容宽度 (px) */
    usableWidth,
    /** 计算分页 */
    calculateBreaks,
    /** mm 转 px */
    mmToPx,
    /** px 转 mm */
    pxToMm,
  }
}
