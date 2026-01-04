/**
 * @fileoverview Pagination module entry point
 * @module pagination
 * @version 1.0.0
 * @author Kiro
 * @created 2026-01-03
 * @modified 2026-01-03
 *
 * @description
 * Exports all pagination-related types and functions:
 * - Type definitions
 * - Page size configuration
 * - Pagination algorithm
 * - Overflow field handling
 *
 * @requirements
 * - 9.1: Calculate page breaks based on measured content height
 *
 * @usedBy
 * - ../index.ts - Library main entry
 * - international-postpartum-frontend - Frontend print module
 */

// ==================== Type Exports ====================

export type {
  // Page dimensions
  PageDimensions,
  // Measurable content items
  MeasurableItemType,
  MeasurableItem,
  // Pagination result
  PageContent,
  PageBreakResult,
  // Overflow field configuration
  OverflowFieldConfig,
  OverflowConfig,
  DisplayConfig,
  // Pagination configuration
  PageHeaderConfig,
  PageFooterConfig,
  SmartPaginationConfig,
  PaginationConfig,
  // Page break calculation options
  PageBreakOptions,
  // Utility types
  PageSizePreset,
  PaginationMode,
  // Overflow text i18n configuration
  OverflowTextConfig,
} from './types'

export {
  // Constants
  PAGINATION_DEFAULTS,
  MEASURABLE_ITEM_TYPES,
  // Compatibility exports
  DEFAULT_DPI,
  MM_PER_INCH,
  // Overflow text i18n constants
  DEFAULT_OVERFLOW_TEXT,
  ENGLISH_OVERFLOW_TEXT,
} from './types'

// ==================== Page Size Exports ====================

export {
  // Preset configurations
  PAGE_16K,
  PAGE_A4,
  PAGE_A5,
  PAGE_PRESETS,
  // Unit conversion
  mmToPx,
  pxToMm,
  mmToPt,
  ptToMm,
  // Size calculation
  calculateUsableHeight,
  calculateUsableWidth,
  calculateUsableHeightMm,
  calculateUsableWidthMm,
  // Utility functions
  getPageDimensions,
  createPageDimensions,
} from './page-dimensions'

// ==================== Pagination Algorithm Exports ====================

export {
  // Core algorithm
  calculatePageBreaks,
  calculatePageBreaksSimple,
  // Helper functions
  findTableHeader,
  buildTableHeaderMap,
  // Validation functions
  validatePageBreakResult,
  getPageContentHeight,
} from './strategies/smart/page-break-calculator'

// ==================== Overflow Field Handling Exports ====================

export {
  // Core functions
  getOverflowFirstLine,
  getOverflowRest,
  hasOverflowContent,
  // Configuration functions
  createOverflowFieldConfig,
  createOverflowFieldConfigs,
  getOverflowFieldConfig,
  isOverflowField,
  // Batch processing
  processOverflowFields,
  hasAnyOverflowContent,
} from './strategies/overflow/overflow-handler'

export type { OverflowFieldResult } from './strategies/overflow/overflow-handler'

// ==================== Overflow Pagination Exports ====================

export {
  // Section identification
  isOverflowSection,
  findOverflowFieldLabel,
  findOverflowFieldCell,
  // Configuration extraction
  getOverflowFieldsFromConfig,
  getOverflowFieldNames,
  // First page rendering
  renderOverflowFirstLine,
  // Continuation page rendering
  renderOverflowContinuation,
  renderOverflowContinuationPage,
  // Utility functions
  mergeOverflowTextConfig,
  hasAnyContinuationContent,
  // CSS class constants
  OVERFLOW_CSS_CLASSES,
} from './overflow-pagination'

export type { OverflowRenderContext, OverflowContinuationPageContext } from './overflow-pagination'

// ==================== Content Measurer Exports ====================

export {
  // Environment detection
  isBrowserEnvironment,
  // Measurement container management
  createMeasureContainer,
  destroyMeasureContainer,
  // Element measurement
  measureElementHeight,
  measureElementWithOptions,
  measureElements,
  // Table measurement
  measureTableRows,
  measureMultipleTables,
  // Text estimation
  estimateTextHeight,
  estimateMultipleTextHeights,
  estimateTableRowHeight,
  // Batch measurement
  measureAll,
  // Composable style API
  createContentMeasurer,
  // Constants
  DEFAULT_MEASURE_CONFIG,
  MEASURE_CONTAINER_CLASS,
  DEFAULT_TEXT_ESTIMATE_OPTIONS,
  MEASURE_SELECTORS,
  // Type guards
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

// ==================== Paginated Renderer Exports ====================

export {
  // Main render function
  renderPaginatedHtml,
  renderPaginatedHtmlSimple,
  // CSS generation
  generatePaginationCss,
  // Configuration utilities
  createRenderConfigFromPaginationConfig,
  // Default configuration
  DEFAULT_PAGINATED_RENDER_CONFIG,
} from './paginated-renderer'

export type {
  PaginatedRenderConfig,
  PaginatedRenderContext,
} from './paginated-renderer'

// ==================== Composable Style API ====================

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
 * Print pagination utility function collection
 * Provides Vue Composable-like API style
 *
 * @param dimensions - Page size configuration, default 16K
 * @returns Pagination utility functions
 *
 * @example
 * const { calculateBreaks, usableHeight } = usePrintPagination()
 * const result = calculateBreaks(measuredItems, usableHeight)
 */
export function usePrintPagination(dimensions: PageDimensions = PAGE_16K) {
  const usableHeight = calculateUsableHeight(dimensions)
  const usableWidth = calculateUsableWidth(dimensions)

  /**
   * Calculate pagination
   * @param items - List of measured content items
   * @param headerHeight - Header height (px)
   * @param footerHeight - Footer height (px)
   * @returns Pagination result
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
    /** Page size configuration */
    dimensions,
    /** Usable content height (px) */
    usableHeight,
    /** Usable content width (px) */
    usableWidth,
    /** Calculate pagination */
    calculateBreaks,
    /** mm to px */
    mmToPx,
    /** px to mm */
    pxToMm,
  }
}
