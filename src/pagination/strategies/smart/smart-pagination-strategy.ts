/**
 * @fileoverview Smart pagination strategy adapter
 * @module pagination/strategies/smart/smart-pagination-strategy
 * @version 1.4.0
 * @author Kiro
 * @created 2026-01-04
 * @modified 2026-01-05
 *
 * @description
 * Smart pagination strategy adapter that wraps the existing page-break-calculator logic.
 * Implements the PaginationStrategy interface for table-based measurement pagination.
 * Delegates to existing calculatePageBreaks function without modifying the algorithm.
 *
 * Uses GoF Strategy Pattern for measurement logic - accepts a MeasurementStrategy
 * via dependency injection, defaulting to DomMeasurementStrategy for browser-based
 * DOM measurement.
 *
 * @requirements
 * - 1.3: SmartPaginationStrategy uses MeasurementStrategy for content measurement
 * - 2.1: Create SmartPaginationStrategy in strategies/smart/
 * - 2.3: Implement PaginationStrategy interface
 * - 2.4: Delegate to existing calculatePageBreaks and renderPaginatedHtml
 * - 2.5: shouldApply checks pagination.smartPagination.enabled === true
 * - 4.1, 4.2, 4.3, 4.4: Pass correct measurement data to pagination algorithm
 * - 5.1, 5.2, 5.3, 5.4: Deprecate estimateItems method
 *
 * @dependencies
 * - ../pagination-strategy - PaginationStrategy interface
 * - ./page-break-calculator - Existing smart pagination algorithm
 * - ./measurement-strategy - MeasurementStrategy interface
 * - ./dom-measurement-strategy - Default DOM measurement implementation
 * - ../../paginated-renderer - Paginated HTML renderer
 * - ../../types - Type definitions
 *
 * @usedBy
 * - ../index.ts - Strategy exports
 * - ../../paginated-renderer.ts - Main pagination renderer
 */

import type { 
  PaginationStrategy, 
  PrintSchemaWithPagination, 
  PaginationRenderOptions 
} from '../pagination-strategy'
import type { FormData } from '../../../types/print-schema'
import type { RenderOptions } from '../../../types/options'
import type { MeasurableItem } from '../../types'
import type { MeasurementStrategy } from './measurement-strategy'
import { DomMeasurementStrategy } from './dom-measurement-strategy'
import { calculatePageBreaks } from './page-break-calculator'
import { renderPaginatedHtml } from '../../paginated-renderer'
import { PAGE_16K } from '../../page-dimensions'

// ==================== Smart Pagination Strategy ====================

/**
 * Smart pagination strategy adapter
 * Wraps existing smart pagination logic in strategy interface
 *
 * Uses GoF Strategy Pattern for measurement - accepts a MeasurementStrategy
 * via constructor injection, defaulting to DomMeasurementStrategy.
 *
 * @requirements 1.3, 2.1, 2.3, 2.4, 2.5, 4.1, 4.2, 4.3, 4.4 - Smart pagination strategy implementation
 *
 * @example
 * // Default usage with DomMeasurementStrategy
 * const strategy = new SmartPaginationStrategy()
 * if (strategy.shouldApply(schema)) {
 *   const html = strategy.render(schema, data, options)
 * }
 *
 * @example
 * // Custom measurement strategy
 * const customStrategy = new SmartPaginationStrategy(myCustomMeasurementStrategy)
 */
export class SmartPaginationStrategy implements PaginationStrategy {
  /**
   * Strategy name identifier
   * @requirements 2.1 - Strategy name
   */
  readonly name = 'smart-pagination'

  /**
   * Measurement strategy for content measurement (GoF Strategy Pattern)
   * @requirements 1.3 - Use MeasurementStrategy for content measurement
   */
  private measurementStrategy: MeasurementStrategy

  /**
   * Constructor with optional measurement strategy injection
   * @param measurementStrategy - Custom measurement strategy (defaults to DomMeasurementStrategy)
   * @requirements 1.3 - Dependency injection for measurement strategy
   */
  constructor(measurementStrategy?: MeasurementStrategy) {
    this.measurementStrategy = measurementStrategy ?? new DomMeasurementStrategy()
  }

  /**
   * Check if smart pagination should be applied
   * @param schema - Print schema with pagination configuration
   * @returns Whether smart pagination is enabled
   * @requirements 2.5 - shouldApply checks smartPagination.enabled
   */
  shouldApply(schema: PrintSchemaWithPagination): boolean {
    return schema.pagination?.smartPagination?.enabled === true
  }

  /**
   * Render content using smart pagination
   * Delegates to existing calculatePageBreaks and renderPaginatedHtml functions
   * Uses injected measurement strategy for DOM measurement
   * @param schema - Print schema with pagination configuration
   * @param data - Form data to render
   * @param options - Render options
   * @returns Rendered HTML string
   * @requirements 1.3, 2.3, 2.4, 3.1, 3.2, 4.1, 4.2, 4.3, 4.4 - Delegate to existing functions with correct measurement data
   */
  render(schema: PrintSchemaWithPagination, data: FormData, options?: PaginationRenderOptions): string {
    // Use provided measuredItems or measure using injected strategy
    // Requirements 4.1: Pass all MeasurableItems to calculatePageBreaks
    const measuredItems = options?.measuredItems ?? this.measurementStrategy.measure(
      schema,
      data,
      {
        minRowHeight: schema.pagination?.smartPagination?.minRowHeight ?? 8,
        pageHeight: this.getPageHeight(schema),
      }
    )
    
    // Extract header and footer heights from measured items
    // Requirements 1.3: Pass header height to calculatePageBreaks
    // Requirements 2.3: Pass footer height to calculatePageBreaks
    const headerHeight = this.extractHeaderHeight(measuredItems)
    const footerHeight = this.extractFooterHeight(measuredItems)
    const signatureHeight = this.extractSignatureHeight(measuredItems)
    
    // Determine if signature should be on each page
    // If signatureOnEachPage is false, signature height is only reserved on the last page
    const signatureOnEachPage = schema.pagination?.display?.signatureOnEachPage ?? false
    
    // Calculate effective footer height for pagination
    // Only include signature height if it should appear on each page
    const effectiveFooterHeight = signatureOnEachPage 
      ? footerHeight + signatureHeight 
      : footerHeight
    
    // Calculate last page extra height for signature (when not on each page)
    const lastPageExtraHeight = signatureOnEachPage ? 0 : signatureHeight
    
    // Filter content items (exclude header, footer, signature)
    // Requirements 4.1, 4.2, 4.3, 4.4: Only pass content items to pagination algorithm
    const contentItems = this.filterContentItems(measuredItems)
    
    // Calculate page breaks using existing algorithm with correct height parameters
    // Requirements 3.1, 3.2: Available height = pageHeight - headerHeight - footerHeight
    const pageBreakResult = calculatePageBreaks(contentItems, {
      pageHeight: this.getPageHeight(schema),
      headerHeight,
      footerHeight: effectiveFooterHeight,
      repeatTableHeaders: schema.pagination?.display?.repeatTableHeaders ?? true,
      lastPageExtraHeight,
    })

    // Convert PaginationRenderOptions to RenderOptions for renderPaginatedHtml
    const renderOptions: RenderOptions | undefined = options ? {
      theme: undefined, // Will be handled by renderPaginatedHtml
    } : undefined

    // Render paginated HTML using existing renderer
    // Pass original measuredItems (including all types) for rendering
    return renderPaginatedHtml({
      schema,
      data,
      options: renderOptions,
      pageBreakResult,
      measuredItems,
      config: { 
        isolated: options?.isolated,
        showHeaderOnEachPage: schema.pagination?.display?.headerOnEachPage ?? true,
        showFooterOnEachPage: schema.pagination?.display?.footerOnEachPage ?? true,
        showSignatureOnEachPage: schema.pagination?.display?.signatureOnEachPage ?? false,
      },
    })
  }

  // ==================== Private Helper Methods ====================

  /**
   * Extract header height from measured items
   * Finds the item with type 'header' and returns its height
   * @param items - All measured items
   * @returns Header height in pixels, or 0 if no header item found
   * @requirements 1.1, 1.2, 1.4 - Extract header height from measured results
   */
  private extractHeaderHeight(items: MeasurableItem[]): number {
    const headerItem = items.find(item => item.type === 'header')
    return headerItem?.height ?? 0
  }

  /**
   * Extract footer height from measured items
   * Only includes 'footer' type items. Signature height is handled separately
   * based on signatureOnEachPage configuration.
   * @param items - All measured items
   * @returns Footer height in pixels, or 0 if no footer items found
   * @requirements 2.1, 2.2, 2.4 - Extract footer height from measured results
   */
  private extractFooterHeight(items: MeasurableItem[]): number {
    let totalHeight = 0
    for (const item of items) {
      if (item.type === 'footer') {
        totalHeight += item.height
      }
    }
    return totalHeight
  }

  /**
   * Extract signature height from measured items
   * @param items - All measured items
   * @returns Signature height in pixels, or 0 if no signature items found
   */
  private extractSignatureHeight(items: MeasurableItem[]): number {
    let totalHeight = 0
    for (const item of items) {
      if (item.type === 'signature') {
        totalHeight += item.height
      }
    }
    return totalHeight
  }

  /**
   * Filter content items for pagination calculation
   * Excludes header, footer, and signature items - only keeps section and table items
   * @param items - All measured items
   * @returns Array containing only section, table-header, and table-row items
   * @requirements 4.1, 4.2, 4.3, 4.4 - Filter non-content items from pagination
   */
  private filterContentItems(items: MeasurableItem[]): MeasurableItem[] {
    return items.filter(item => 
      item.type === 'section' || 
      item.type === 'table-header' || 
      item.type === 'table-row'
    )
  }

  /**
   * Get page height for pagination calculation
   * @param _schema - Print schema (unused in current implementation)
   * @returns Page height in pixels
   */
  private getPageHeight(_schema: PrintSchemaWithPagination): number {
    // Use configured page dimensions or default to 16K
    const pageDimensions = PAGE_16K
    
    // Convert mm to pixels (assuming 96 DPI)
    const mmToPixels = (mm: number) => (mm * 96) / 25.4
    
    const availableHeight = pageDimensions.height 
      - pageDimensions.marginTop 
      - pageDimensions.marginBottom
    
    return mmToPixels(availableHeight)
  }

  /**
   * Estimate measurable items when not provided
   * Creates basic section items for each schema section
   *
   * @deprecated Since v1.4.0. Use DomMeasurementStrategy instead.
   * This method only provides rough estimates and does not measure actual DOM heights.
   * The method is no longer used internally - SmartPaginationStrategy now uses
   * MeasurementStrategy (default: DomMeasurementStrategy) for accurate DOM-based measurement.
   * Will be removed in v2.0.0.
   *
   * @see {@link DomMeasurementStrategy} - For accurate DOM-based measurement
   * @see {@link MeasurementStrategy} - Interface for custom measurement strategies
   *
   * @param schema - Print schema
   * @returns Estimated measurable items (inaccurate)
   * @requirements 5.1, 5.2, 5.3, 5.4 - Deprecated method with annotations
   */
  private estimateItems(schema: PrintSchemaWithPagination): MeasurableItem[] {
    const items: MeasurableItem[] = []
    const minRowHeight = schema.pagination?.smartPagination?.minRowHeight ?? 8
    const mmToPixels = (mm: number) => (mm * 96) / 25.4
    const estimatedSectionHeight = mmToPixels(minRowHeight * 3) // Estimate 3 rows per section

    schema.sections.forEach((section, index) => {
      const sectionId = `section-${index}`
      
      items.push({
        id: sectionId,
        type: 'section',
        height: estimatedSectionHeight,
      })

      // For table sections, add estimated table rows
      if (section.type === 'table') {
        const tableConfig = section.config as { dataField: string; columns: Array<unknown> }
        const tableId = `table-${tableConfig.dataField}`
        
        // Add table header
        items.push({
          id: `${tableId}-header`,
          type: 'table-header',
          height: mmToPixels(minRowHeight),
          tableId,
        })

        // Estimate some table rows (we don't have actual data here)
        for (let i = 0; i < 5; i++) {
          items.push({
            id: `${tableId}-row-${i}`,
            type: 'table-row',
            height: mmToPixels(minRowHeight),
            tableId,
            dataIndex: i,
          })
        }
      }
    })

    return items
  }
}