/**
 * @fileoverview DOM-based measurement strategy implementation
 * @module pagination/strategies/smart/dom-measurement-strategy
 * @version 1.4.0
 * @author Kiro
 * @created 2026-01-05
 * @modified 2026-01-05
 *
 * @description
 * Implements the MeasurementStrategy interface using actual DOM measurement.
 * Renders content to a hidden container and measures real element heights
 * using the existing createContentMeasurer utility.
 *
 * This strategy is only available in browser environments. For Node.js,
 * use Puppeteer or similar tools for DOM measurement.
 *
 * @requirements
 * - 3.1: Render content to hidden DOM container for measurement
 * - 3.2: Use existing createContentMeasurer to measure actual element heights
 * - 3.3: Measure each table row's actual rendered height
 * - 3.4: Clean up measurement container after measurement is complete
 * - 3.5: Throw descriptive error in non-browser environment
 *
 * @dependencies
 * - ./measurement-strategy - MeasurementStrategy interface
 * - ../pagination-strategy - PrintSchemaWithPagination type
 * - ../../../types/print-schema - FormData type
 * - ../../types - MeasurableItem type
 * - ../../content-measurer - DOM measurement utilities
 * - ../../../renderer/isolated-html-renderer - HTML rendering
 * - ../../page-dimensions - Page dimension utilities
 *
 * @usedBy
 * - ./smart-pagination-strategy.ts - Smart pagination strategy
 * - ./index.ts - Module exports
 */

import type { MeasurementStrategy, MeasurementConfig } from './measurement-strategy'
import type { PrintSchemaWithPagination } from '../pagination-strategy'
import type { FormData } from '../../../types/print-schema'
import type { MeasurableItem, PageSizePreset } from '../../types'
import {
  createContentMeasurer,
  isBrowserEnvironment,
} from '../../content-measurer'
import { renderToIsolatedFragment } from '../../../renderer/isolated-html-renderer'
import { calculateUsableWidth, getPageDimensions } from '../../page-dimensions'

// ==================== DOM Measurement Strategy ====================

/**
 * DOM-based measurement strategy
 *
 * Renders content to a hidden container and measures actual DOM element heights.
 * This provides accurate measurements for variable-height content like tables
 * with text wrapping.
 *
 * @requirements 3.1, 3.2, 3.3, 3.4, 3.5 - DOM measurement implementation
 *
 * @example
 * ```typescript
 * const strategy = new DomMeasurementStrategy()
 * const items = strategy.measure(schema, data, {
 *   minRowHeight: 8,
 *   pageHeight: 800,
 * })
 * // items contains actual measured heights for all content
 * ```
 */
export class DomMeasurementStrategy implements MeasurementStrategy {
  /**
   * Measure content and return measurable items with actual DOM heights
   *
   * @param schema - Print schema with pagination configuration
   * @param data - Form data containing actual content (e.g., table rows)
   * @param _config - Measurement configuration options (unused, kept for interface compliance)
   * @returns Array of measurable items with heights in pixels
   *
   * @throws Error if not running in browser environment
   * @throws Error if DOM measurement fails
   *
   * @requirements 3.1, 3.2, 3.3, 3.4, 3.5 - DOM measurement implementation
   */
  measure(
    schema: PrintSchemaWithPagination,
    data: FormData,
    _config: MeasurementConfig
  ): MeasurableItem[] {
    // Requirement 3.5: Ensure browser environment
    if (!isBrowserEnvironment()) {
      throw new Error(
        'DomMeasurementStrategy requires browser environment. ' +
          'Smart pagination with DOM measurement is only available in browser. ' +
          'For Node.js, use Puppeteer or provide pre-measured items.'
      )
    }

    // Requirement 3.1: Create hidden measurement container
    const containerWidth = this.getContainerWidth(schema)
    const measurer = createContentMeasurer({ containerWidth })

    let tempContainer: HTMLDivElement | null = null

    try {
      // Requirement 3.1: Render content to temporary container (without pagination)
      const tempHtml = renderToIsolatedFragment(schema, data)
      tempContainer = this.createTempContainer(tempHtml, containerWidth)
      document.body.appendChild(tempContainer)

      // Requirement 3.2, 3.3: Measure all elements using existing measurer
      const items = measurer.measureAll(tempContainer)

      // Filter and return valid items
      return this.filterInvalidItems(items)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      throw new Error(`DOM measurement failed: ${message}`)
    } finally {
      // Requirement 3.4: Cleanup temp container and measurer
      if (tempContainer?.parentNode) {
        tempContainer.parentNode.removeChild(tempContainer)
      }
      measurer.cleanup()
    }
  }

  // ==================== Private Helper Methods ====================

  /**
   * Get container width for measurement based on page dimensions
   * Reuses page dimension presets from page-dimensions module
   *
   * @param schema - Print schema with page configuration
   * @returns Container width in pixels
   */
  private getContainerWidth(schema: PrintSchemaWithPagination): number {
    const pageSize = (schema.pageSize?.toUpperCase() ?? '16K') as PageSizePreset
    const dimensions = getPageDimensions(pageSize)
    return calculateUsableWidth(dimensions)
  }

  /**
   * Create temporary hidden container for measurement
   *
   * @param html - HTML content to measure
   * @param width - Container width in pixels
   * @returns Hidden container element
   *
   * @requirements 3.1 - Render content to hidden DOM container
   */
  private createTempContainer(html: string, width: number): HTMLDivElement {
    const container = document.createElement('div')

    // Position off-screen and hidden
    container.style.position = 'absolute'
    container.style.left = '-9999px'
    container.style.top = '-9999px'
    container.style.visibility = 'hidden'

    // Set container width for proper text wrapping and layout
    container.style.width = `${width}px`

    // Ensure consistent rendering
    container.style.boxSizing = 'border-box'
    container.style.overflow = 'hidden'

    // Set content
    container.innerHTML = html

    return container
  }

  /**
   * Filter out items with invalid heights
   *
   * Removes items with zero or negative heights that would cause
   * pagination calculation issues.
   *
   * @param items - Measured items from DOM
   * @returns Valid measurable items with positive heights
   */
  private filterInvalidItems(items: MeasurableItem[]): MeasurableItem[] {
    return items.filter((item) => {
      if (item.height <= 0) {
        // Only warn for non-footer items, as footer may legitimately be empty
        if (item.type !== 'footer') {
          console.warn(
            `DomMeasurementStrategy: Item "${item.id}" has invalid height ${item.height}, skipping`
          )
        }
        return false
      }
      return true
    })
  }
}
