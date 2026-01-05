/**
 * @fileoverview Measurement strategy interface (GoF Strategy Pattern)
 * @module pagination/strategies/smart/measurement-strategy
 * @version 1.4.0
 * @author Kiro
 * @created 2026-01-05
 * @modified 2026-01-05
 *
 * @description
 * Defines the MeasurementStrategy interface for decoupling measurement logic
 * from pagination logic. This follows the GoF Strategy Pattern to allow
 * different measurement implementations (e.g., DOM-based measurement).
 *
 * @requirements
 * - 1.1: Define MeasurementStrategy interface with measure method
 * - 1.2: Interface supports DOM-based measurement implementation
 *
 * @dependencies
 * - ../pagination-strategy - PrintSchemaWithPagination type
 * - ../../../types/print-schema - FormData type
 * - ../../types - MeasurableItem type
 *
 * @usedBy
 * - ./dom-measurement-strategy.ts - DOM measurement implementation
 * - ./smart-pagination-strategy.ts - Smart pagination strategy
 */

import type { PrintSchemaWithPagination } from '../pagination-strategy'
import type { FormData } from '../../../types/print-schema'
import type { MeasurableItem } from '../../types'

// ==================== Configuration Types ====================

/**
 * Measurement configuration options
 * Provides parameters needed for content measurement
 *
 * @requirements 1.1 - Configuration for measurement strategy
 */
export interface MeasurementConfig {
  /**
   * Minimum row height in millimeters (for fallback estimation)
   * Used when actual measurement is not possible
   * @default 8
   */
  minRowHeight: number

  /**
   * Available page height in pixels
   * Used to determine content fitting and page breaks
   */
  pageHeight: number
}

// ==================== Strategy Interface ====================

/**
 * Measurement strategy interface (GoF Strategy Pattern)
 *
 * Defines a unified interface for measuring content heights.
 * Implementations can provide different measurement approaches:
 * - DOM-based measurement (browser environment)
 * - Estimation-based measurement (fallback)
 *
 * @requirements 1.1, 1.2 - Unified measurement interface supporting DOM-based implementation
 *
 * @example
 * ```typescript
 * class DomMeasurementStrategy implements MeasurementStrategy {
 *   measure(schema, data, config): MeasurableItem[] {
 *     // Render to hidden container and measure actual heights
 *     return measuredItems
 *   }
 * }
 *
 * // Usage with SmartPaginationStrategy
 * const strategy = new SmartPaginationStrategy(new DomMeasurementStrategy())
 * ```
 */
export interface MeasurementStrategy {
  /**
   * Measure content and return measurable items with heights
   *
   * Implementations should:
   * 1. Analyze the schema to identify measurable content
   * 2. Use the data to determine actual content (e.g., table row count)
   * 3. Measure or estimate heights for each content item
   * 4. Return an array of MeasurableItem objects
   *
   * For table sections, implementations should create:
   * - One item for the table header
   * - One item for each data row
   *
   * @param schema - Print schema with pagination configuration
   * @param data - Form data containing actual content (e.g., table rows)
   * @param config - Measurement configuration options
   * @returns Array of measurable items with heights in pixels
   *
   * @throws Error if measurement cannot be performed (e.g., non-browser environment for DOM strategy)
   *
   * @requirements 1.1 - measure method signature
   * @requirements 1.2 - Support DOM-based measurement
   */
  measure(
    schema: PrintSchemaWithPagination,
    data: FormData,
    config: MeasurementConfig
  ): MeasurableItem[]
}
