/**
 * @fileoverview Table Header Renderer with Decorator Pattern
 * @module renderer/section-renderers/table/header-renderer
 * @version 2.0.0
 * @author Kiro
 * @created 2026-01-05
 *
 * @description
 * Implements the Decorator Pattern (GoF) for table header rendering.
 * Provides a base renderer that uses the Strategy Pattern internally,
 * and decorators that add additional functionality like row numbers.
 *
 * Design Pattern: Decorator Pattern (GoF)
 * - Attaches additional responsibilities to an object dynamically
 * - Provides a flexible alternative to subclassing for extending functionality
 * - Decorators wrap the component and add behavior before/after delegation
 *
 * @example
 * ```typescript
 * // Basic usage
 * const baseRenderer = new BaseHeaderRenderer()
 * const html = baseRenderer.renderHeader(config, options)
 *
 * // With row number decorator
 * const renderer = new RowNumberHeaderDecorator(baseRenderer)
 * const htmlWithRowNum = renderer.renderHeader(config, options)
 * ```
 */

import type { TableConfig, HeaderRow } from '../../../types/print-schema'
import type { RenderOptions } from '../../../types/options'
import {
  HeaderRenderStrategy,
  SimpleHeaderStrategy,
  MultiRowHeaderStrategy,
  getHeaderStrategy,
} from './header-strategy'
import { tr, th, thead } from '../../../utils'

/**
 * Header renderer interface
 *
 * @since next
 * @description
 * Defines the contract for header renderers. Both base renderers and
 * decorators implement this interface, enabling transparent decoration.
 *
 * Design Pattern: Decorator Pattern (GoF) - Component Interface
 * - Defines the interface for objects that can have responsibilities added
 * - Both concrete components and decorators implement this interface
 * - Enables transparent wrapping of components
 *
 * @example
 * ```typescript
 * const renderer: HeaderRenderer = new BaseHeaderRenderer()
 * const html = renderer.renderHeader(config, options)
 * ```
 */
export interface HeaderRenderer {
  /**
   * Render the complete table header (including thead wrapper)
   * @param config - Table configuration
   * @param options - Render options
   * @returns Rendered header HTML string with thead wrapper
   */
  renderHeader(config: TableConfig, options?: RenderOptions): string
}

/**
 * Base header renderer using strategy pattern
 *
 * @since next
 * @description
 * Concrete component that renders table headers using the appropriate
 * strategy based on configuration. This is the base implementation
 * that decorators wrap.
 *
 * Design Pattern: Decorator Pattern (GoF) - Concrete Component
 * - Implements the base functionality for header rendering
 * - Uses Strategy Pattern internally for rendering logic
 * - Can be wrapped by decorators for additional functionality
 *
 * @example
 * ```typescript
 * const renderer = new BaseHeaderRenderer()
 * const html = renderer.renderHeader({
 *   columns: [{ header: 'Name', field: 'name' }],
 *   dataField: 'records'
 * })
 * ```
 */
export class BaseHeaderRenderer implements HeaderRenderer {
  private strategies: HeaderRenderStrategy[]

  /**
   * Create a new base header renderer
   * @param strategies - Optional array of strategies (defaults to Simple and MultiRow)
   */
  constructor(strategies?: HeaderRenderStrategy[]) {
    this.strategies = strategies || [new MultiRowHeaderStrategy(), new SimpleHeaderStrategy()]
  }

  /**
   * Render the table header using the appropriate strategy
   * @param config - Table configuration
   * @param options - Render options
   * @returns Rendered header HTML string with thead wrapper
   */
  renderHeader(config: TableConfig, options?: RenderOptions): string {
    const strategy = this.selectStrategy(config)
    const headerContent = strategy.render(config, options)
    return thead().raw(headerContent).build()
  }

  /**
   * Select the appropriate strategy for the configuration
   * @param config - Table configuration
   * @returns The selected strategy
   */
  private selectStrategy(config: TableConfig): HeaderRenderStrategy {
    for (const strategy of this.strategies) {
      if (strategy.canHandle(config)) {
        return strategy
      }
    }
    // Fallback to simple strategy
    return new SimpleHeaderStrategy()
  }
}

/**
 * Row number header decorator
 *
 * @since next
 * @description
 * Decorator that adds a row number column to the table header.
 * Wraps another HeaderRenderer and adds the row number header cell
 * to the rendered output.
 *
 * Design Pattern: Decorator Pattern (GoF) - Concrete Decorator
 * - Wraps a HeaderRenderer component
 * - Adds row number column functionality
 * - Delegates to wrapped component for base rendering
 * - Handles multi-row headers by adding rowspan to the row number cell
 *
 * @example
 * ```typescript
 * const baseRenderer = new BaseHeaderRenderer()
 * const renderer = new RowNumberHeaderDecorator(baseRenderer)
 * const html = renderer.renderHeader({
 *   columns: [{ header: 'Name', field: 'name' }],
 *   dataField: 'records',
 *   showRowNumber: true
 * })
 * ```
 */
export class RowNumberHeaderDecorator implements HeaderRenderer {
  private wrapped: HeaderRenderer

  /**
   * Create a new row number header decorator
   * @param renderer - The header renderer to wrap
   */
  constructor(renderer: HeaderRenderer) {
    this.wrapped = renderer
  }

  /**
   * Render the table header with row number column
   * @param config - Table configuration
   * @param options - Render options
   * @returns Rendered header HTML string with row number column
   */
  renderHeader(config: TableConfig, options?: RenderOptions): string {
    // If showRowNumber is not enabled, delegate directly
    if (!config.showRowNumber) {
      return this.wrapped.renderHeader(config, options)
    }

    // Calculate the number of header rows for rowspan
    const rowCount = this.getHeaderRowCount(config)

    // Build the row number header cell
    const rowNumCell = th().text('No.')
    if (rowCount > 1) {
      rowNumCell.attr('rowspan', rowCount)
    }
    const rowNumHtml = rowNumCell.build()

    // Get the base header HTML
    const baseHtml = this.wrapped.renderHeader(config, options)

    // Insert row number cell into the first row
    return this.insertRowNumberCell(baseHtml, rowNumHtml)
  }

  /**
   * Get the number of header rows
   * @param config - Table configuration
   * @returns Number of header rows
   */
  private getHeaderRowCount(config: TableConfig): number {
    if (config.headerRows && config.headerRows.length > 0) {
      return config.headerRows.length
    }
    return 1
  }

  /**
   * Insert row number cell into the first row of the header
   * @param headerHtml - The base header HTML
   * @param rowNumHtml - The row number cell HTML
   * @returns Modified header HTML with row number cell
   */
  private insertRowNumberCell(headerHtml: string, rowNumHtml: string): string {
    // Find the first <tr> and insert the row number cell after it
    const firstTrMatch = headerHtml.match(/<tr>/)
    if (!firstTrMatch) {
      return headerHtml
    }

    const insertIndex = headerHtml.indexOf('<tr>') + 4 // After '<tr>'
    return (
      headerHtml.slice(0, insertIndex) + '\n' + rowNumHtml + headerHtml.slice(insertIndex)
    )
  }
}

/**
 * Create a header renderer with optional row number support
 *
 * @since next
 * @description
 * Factory function that creates the appropriate header renderer
 * based on configuration. Automatically wraps with RowNumberHeaderDecorator
 * if showRowNumber is enabled.
 *
 * @param config - Table configuration
 * @returns Configured header renderer
 *
 * @example
 * ```typescript
 * const renderer = createHeaderRenderer(config)
 * const html = renderer.renderHeader(config, options)
 * ```
 */
export function createHeaderRenderer(config: TableConfig): HeaderRenderer {
  const baseRenderer = new BaseHeaderRenderer()

  if (config.showRowNumber) {
    return new RowNumberHeaderDecorator(baseRenderer)
  }

  return baseRenderer
}
