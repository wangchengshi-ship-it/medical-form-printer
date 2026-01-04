/**
 * @fileoverview Smart pagination strategy adapter
 * @module pagination/strategies/smart/smart-pagination-strategy
 * @version 1.0.0
 * @author Kiro
 * @created 2026-01-04
 * @modified 2026-01-04
 *
 * @description
 * Smart pagination strategy adapter that wraps the existing page-break-calculator logic.
 * Implements the PaginationStrategy interface for table-based measurement pagination.
 * Delegates to existing calculatePageBreaks function without modifying the algorithm.
 *
 * @requirements
 * - 2.1: Create SmartPaginationStrategy in strategies/smart/
 * - 2.3: Implement PaginationStrategy interface
 * - 2.4: Delegate to existing calculatePageBreaks and renderPaginatedHtml
 * - 2.5: shouldApply checks pagination.smartPagination.enabled === true
 *
 * @dependencies
 * - ../pagination-strategy - PaginationStrategy interface
 * - ./page-break-calculator - Existing smart pagination algorithm
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
import { calculatePageBreaks } from './page-break-calculator'
import { renderPaginatedHtml } from '../../paginated-renderer'
import { PAGE_16K } from '../../page-dimensions'

// ==================== Smart Pagination Strategy ====================

/**
 * Smart pagination strategy adapter
 * Wraps existing smart pagination logic in strategy interface
 *
 * @requirements 2.1, 2.3, 2.4, 2.5 - Smart pagination strategy implementation
 *
 * @example
 * const strategy = new SmartPaginationStrategy()
 * if (strategy.shouldApply(schema)) {
 *   const html = strategy.render(schema, data, options)
 * }
 */
export class SmartPaginationStrategy implements PaginationStrategy {
  /**
   * Strategy name identifier
   * @requirements 2.1 - Strategy name
   */
  readonly name = 'smart-pagination'

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
   * @param schema - Print schema with pagination configuration
   * @param data - Form data to render
   * @param options - Render options
   * @returns Rendered HTML string
   * @requirements 2.4 - Delegate to existing functions
   */
  render(schema: PrintSchemaWithPagination, data: FormData, options?: PaginationRenderOptions): string {
    // Get or estimate measured items
    const measuredItems = options?.measuredItems ?? this.estimateItems(schema)
    
    // Calculate page breaks using existing algorithm
    const pageBreakResult = calculatePageBreaks(measuredItems, {
      pageHeight: this.getPageHeight(schema),
      repeatTableHeaders: schema.pagination?.display?.repeatTableHeaders ?? true,
    })

    // Convert PaginationRenderOptions to RenderOptions for renderPaginatedHtml
    const renderOptions: RenderOptions | undefined = options ? {
      theme: undefined, // Will be handled by renderPaginatedHtml
    } : undefined

    // Render paginated HTML using existing renderer
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
   * @param schema - Print schema
   * @returns Estimated measurable items
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