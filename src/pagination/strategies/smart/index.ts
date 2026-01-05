/**
 * @fileoverview Smart pagination strategy exports
 * @module pagination/strategies/smart
 * @version 1.4.0
 * @author Kiro
 * @created 2026-01-04
 * @modified 2026-01-05
 *
 * @description
 * Exports for smart pagination strategy module.
 * Provides unified access to smart pagination strategy and related utilities.
 *
 * @requirements
 * - 1.1: Export MeasurementStrategy interface and MeasurementConfig type
 * - 5.1: Export SmartPaginationStrategy
 * - 5.1: Re-export from page-break-calculator.ts
 *
 * @usedBy
 * - ../index.ts - Main strategies export
 * - ../../paginated-renderer.ts - Pagination renderer
 */

// ==================== Strategy Exports ====================

export { SmartPaginationStrategy } from './smart-pagination-strategy'
export { DomMeasurementStrategy } from './dom-measurement-strategy'

// ==================== Algorithm Re-exports ====================

export {
  calculatePageBreaks,
} from './page-break-calculator'

// ==================== Type Re-exports ====================

export type {
  MeasurementStrategy,
  MeasurementConfig,
} from './measurement-strategy'

export type {
  MeasurableItem,
  MeasurableItemType,
  PageBreakOptions,
  PageBreakResult,
  PageContent,
} from '../../types'