/**
 * @fileoverview Pagination strategies main exports
 * @module pagination/strategies
 * @version 1.0.0
 * @author Kiro
 * @created 2026-01-04
 * @modified 2026-01-04
 *
 * @description
 * Main export file for all pagination strategies and related utilities.
 * Provides unified access to the strategy pattern implementation.
 *
 * @requirements
 * - 5.3: Export all strategies and context
 * - 5.3: Export createDefaultPaginationContext factory
 *
 * @usedBy
 * - ../index.ts - Pagination module main export
 * - ../paginated-renderer.ts - Pagination renderer
 */

// ==================== Strategy Interface and Context ====================

export {
  PaginationContext,
  type PaginationStrategy,
  type PrintSchemaWithPagination,
  type PaginationRenderOptions,
} from './pagination-strategy'

// ==================== Strategy Imports for Factory ====================

import { PaginationContext } from './pagination-strategy'
import { SmartPaginationStrategy } from './smart'
import { OverflowPaginationStrategy } from './overflow'

// ==================== Smart Pagination Strategy ====================

export {
  SmartPaginationStrategy,
  calculatePageBreaks,
  type PageBreakOptions,
  type PageBreakResult,
  type PageContent,
  type MeasurableItem,
  type MeasurableItemType,
} from './smart'

// ==================== Overflow Pagination Strategy ====================

export {
  OverflowPaginationStrategy,
  getOverflowFirstLine,
  getOverflowRest,
  hasOverflowContent,
  createOverflowFieldConfig,
  createOverflowFieldConfigs,
  getOverflowFieldConfig,
  isOverflowField,
  processOverflowFields,
  hasAnyOverflowContent,
  isOverflowSection,
  findOverflowFieldLabel,
  findOverflowFieldCell,
  getOverflowFieldsFromConfig,
  getOverflowFieldNames,
  renderOverflowFirstLine,
  renderOverflowContinuation,
  renderOverflowContinuationPage,
  hasAnyContinuationContent,
  mergeOverflowTextConfig,
  OVERFLOW_CSS_CLASSES,
  type OverflowFieldResult,
  type OverflowRenderContext,
  type OverflowContinuationPageContext,
  type OverflowFieldConfig,
  type OverflowTextConfig,
  DEFAULT_OVERFLOW_TEXT,
  ENGLISH_OVERFLOW_TEXT,
} from './overflow'

// ==================== Factory Functions ====================

/**
 * Create default pagination context with built-in strategies
 * @returns PaginationContext with SmartPaginationStrategy and OverflowPaginationStrategy
 * @requirements 5.3 - Export createDefaultPaginationContext factory
 *
 * @example
 * const context = createDefaultPaginationContext()
 * const html = context.render(schema, data, options)
 */
export function createDefaultPaginationContext(): PaginationContext {
  return new PaginationContext([
    new SmartPaginationStrategy(),
    new OverflowPaginationStrategy(),
  ])
}