/**
 * @fileoverview Overflow pagination strategy exports
 * @module pagination/strategies/overflow
 * @version 1.0.0
 * @author Kiro
 * @created 2026-01-04
 * @modified 2026-01-04
 *
 * @description
 * Exports for overflow pagination strategy module.
 * Provides unified access to overflow pagination strategy and related utilities.
 *
 * @requirements
 * - 5.2: Export OverflowPaginationStrategy
 * - 5.2: Re-export from overflow-handler.ts and overflow-pagination.ts
 *
 * @usedBy
 * - ../index.ts - Main strategies export
 * - ../../paginated-renderer.ts - Pagination renderer
 */

// ==================== Strategy Export ====================

export { OverflowPaginationStrategy } from './overflow-pagination-strategy'

// ==================== Handler Re-exports ====================

export {
  getOverflowFirstLine,
  getOverflowRest,
  hasOverflowContent,
  createOverflowFieldConfig,
  createOverflowFieldConfigs,
  getOverflowFieldConfig,
  isOverflowField,
  processOverflowFields,
  hasAnyOverflowContent,
  type OverflowFieldResult,
} from './overflow-handler'

// ==================== Rendering Re-exports ====================

export {
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
  type OverflowRenderContext,
  type OverflowContinuationPageContext,
} from './overflow-pagination'

// ==================== Type Re-exports ====================

export type {
  OverflowFieldConfig,
  OverflowTextConfig,
} from '../../types'

export {
  DEFAULT_OVERFLOW_TEXT,
  ENGLISH_OVERFLOW_TEXT,
} from '../../types'