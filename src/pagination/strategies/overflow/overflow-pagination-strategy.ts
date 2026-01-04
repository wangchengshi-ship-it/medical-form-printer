/**
 * @fileoverview Overflow pagination strategy adapter
 * @module pagination/strategies/overflow/overflow-pagination-strategy
 * @version 1.0.0
 * @author Kiro
 * @created 2026-01-04
 * @modified 2026-01-04
 *
 * @description
 * Overflow pagination strategy adapter that wraps the existing overflow-handler logic.
 * Implements the PaginationStrategy interface for long text field pagination.
 * Delegates to existing processOverflowFields and renderPaginatedHtml functions.
 *
 * @requirements
 * - 3.1: Create OverflowPaginationStrategy in strategies/overflow/
 * - 3.3: Implement PaginationStrategy interface
 * - 3.4: Delegate to existing renderPaginatedHtml with overflow config
 * - 3.5: shouldApply checks pagination.overflow.fields has items
 *
 * @dependencies
 * - ../pagination-strategy - PaginationStrategy interface
 * - ./overflow-handler - Existing overflow field processing
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
import type { PageBreakResult, OverflowTextConfig } from '../../types'
import { DEFAULT_OVERFLOW_TEXT } from '../../types'
import { renderPaginatedHtml } from '../../paginated-renderer'

// ==================== Overflow Pagination Strategy ====================

/**
 * Overflow pagination strategy adapter
 * Wraps existing overflow field processing logic in strategy interface
 *
 * @requirements 3.1, 3.3, 3.4, 3.5 - Overflow pagination strategy implementation
 *
 * @example
 * const strategy = new OverflowPaginationStrategy()
 * if (strategy.shouldApply(schema)) {
 *   const html = strategy.render(schema, data, options)
 * }
 */
export class OverflowPaginationStrategy implements PaginationStrategy {
  /**
   * Strategy name identifier
   * @requirements 3.1 - Strategy name
   */
  readonly name = 'overflow-pagination'

  /**
   * Check if overflow pagination should be applied
   * @param schema - Print schema with pagination configuration
   * @returns Whether overflow pagination is configured
   * @requirements 3.5 - shouldApply checks pagination.overflow.fields has items
   */
  shouldApply(schema: PrintSchemaWithPagination): boolean {
    const fields = schema.pagination?.overflow?.fields
    return Array.isArray(fields) && fields.length > 0
  }

  /**
   * Render content using overflow pagination
   * Delegates to existing renderPaginatedHtml with overflow configuration
   * @param schema - Print schema with pagination configuration
   * @param data - Form data to render
   * @param options - Render options
   * @returns Rendered HTML string
   * @requirements 3.4 - Delegate to existing renderPaginatedHtml with overflow config
   */
  render(schema: PrintSchemaWithPagination, data: FormData, options?: PaginationRenderOptions): string {
    // Create a single-page result since overflow pagination doesn't use smart page breaks
    const pageBreakResult = this.createSinglePageResult()

    // Merge overflow text configuration
    const overflowTextConfig = this.mergeOverflowTextConfig(options?.textConfig)

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
      measuredItems: [], // Overflow pagination doesn't use measured items
      config: { 
        isolated: options?.isolated,
        showHeaderOnEachPage: schema.pagination?.display?.headerOnEachPage ?? true,
        showFooterOnEachPage: schema.pagination?.display?.footerOnEachPage ?? true,
        showSignatureOnEachPage: schema.pagination?.display?.signatureOnEachPage ?? false,
        overflowText: overflowTextConfig,
      },
    })
  }

  // ==================== Private Helper Methods ====================

  /**
   * Create single page result for overflow pagination
   * Overflow pagination uses a single logical page, with continuation pages handled separately
   * @returns Single page break result
   */
  private createSinglePageResult(): PageBreakResult {
    return {
      pages: [{
        pageNumber: 1,
        isContinuation: false,
        items: [], // Items will be handled by renderAllSections fallback
        repeatedHeaders: [],
      }],
      totalPages: 1,
    }
  }

  /**
   * Merge overflow text configuration with defaults
   * @param config - Partial overflow text configuration
   * @returns Complete overflow text configuration
   */
  private mergeOverflowTextConfig(config?: Partial<OverflowTextConfig>): OverflowTextConfig {
    return {
      ...DEFAULT_OVERFLOW_TEXT,
      ...config,
    }
  }
}