/**
 * @fileoverview Smart pagination strategy exports
 * @module pagination/strategies/smart
 * @version 1.0.0
 * @author Kiro
 * @created 2026-01-04
 * @modified 2026-01-04
 *
 * @description
 * Exports for smart pagination strategy module.
 * Provides unified access to smart pagination strategy and related utilities.
 *
 * @requirements
 * - 5.1: Export SmartPaginationStrategy
 * - 5.1: Re-export from page-break-calculator.ts
 *
 * @usedBy
 * - ../index.ts - Main strategies export
 * - ../../paginated-renderer.ts - Pagination renderer
 */

// ==================== Strategy Export ====================

export { SmartPaginationStrategy } from './smart-pagination-strategy'

// ==================== Algorithm Re-exports ====================

export {
  calculatePageBreaks,
  type PageBreakOptions,
  type PageBreakResult,
  type PageContent,
} from './page-break-calculator'

// ==================== Type Re-exports ====================

export type {
  MeasurableItem,
  MeasurableItemType,
} from '../../types'