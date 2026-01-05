/**
 * @fileoverview Data Table Section Renderer
 * @module renderer/section-renderers/table
 * @version 2.0.0
 * @author Kiro
 * @created 2023-11-02
 * @modified 2026-01-05
 *
 * @description
 * Renders data tables with support for partial rendering (pagination).
 * Supports row filtering for smart pagination scenarios.
 *
 * @migration v1.x → v2.0
 *
 * ## New Features
 * - Multi-row header support (headerRows configuration)
 * - Cell merging (colspan/rowspan)
 * - Builder pattern API (TableHeaderBuilder)
 *
 * ## Backward Compatibility
 * - Existing columns configuration continues to work
 * - Behavior unchanged when headerRows is not used
 *
 * ## Recommended Upgrade
 * ```typescript
 * // Old way (still supported)
 * const config = {
 *   columns: [{ header: 'Date', field: 'date' }]
 * }
 *
 * // New way (recommended for complex headers)
 * const config = {
 *   columns: [{ header: 'Date', field: 'date' }],
 *   headerRows: new TableHeaderBuilder()
 *     .addRow().addCell('Date').done()
 *     .build()
 * }
 * ```
 */

import type { TableConfig, FormData } from '../../types/print-schema'
import type { RenderOptions } from '../../types/options'
import { cls } from '../../types/options'
import { formatValue } from '../../formatters'
import { escapeHtml } from '../../utils'
import { createHeaderRenderer } from './table/header-renderer'

/**
 * Options for partial table rendering (used in pagination)
 */
export interface PartialTableOptions {
  /** Row indices to render (if undefined, render all rows) */
  rowIndices?: number[]
  /** Whether to include table header (default: true) */
  includeHeader?: boolean
}

/**
 * Render data table section
 * Supports partial rendering for pagination scenarios
 *
 * @since next - Added support for multi-row headers via headerRows configuration
 *
 * @param config - Table configuration
 * @param data - Form data containing the table rows
 * @param options - Render options
 * @param partialOptions - Options for partial table rendering (pagination)
 * @returns Rendered table HTML string
 */
export function renderTable(
  config: TableConfig,
  data: FormData,
  options?: RenderOptions,
  partialOptions?: PartialTableOptions
): string {
  const { rowIndices, includeHeader = true } = partialOptions || {}

  // Get data array
  const allRows = (data[config.dataField] as Record<string, unknown>[]) || []

  // Filter rows if rowIndices is provided (for pagination)
  const rowsToRender = rowIndices
    ? rowIndices
        .filter((idx) => idx >= 0 && idx < allRows.length)
        .map((idx) => ({ row: allRows[idx], originalIndex: idx }))
    : allRows.map((row, idx) => ({ row, originalIndex: idx }))

  // Body
  const body = rowsToRender
    .map(({ row, originalIndex }) => {
      const cells = config.columns
        .map((col) => {
          const value = row[col.field]
          const formattedValue = formatValue(value, col.type, {
            emptyPlaceholder: options?.emptyPlaceholder,
            customFormatters: options?.formatters,
          })
          return `<td>${escapeHtml(formattedValue)}</td>`
        })
        .join('\n')

      const rowNumber = config.showRowNumber ? `<td>${originalIndex + 1}</td>\n` : ''

      return `<tr>\n${rowNumber}${cells}\n</tr>`
    })
    .join('\n')

  // Build header HTML using the new HeaderRenderer (Strategy + Decorator patterns)
  const headerHtml = includeHeader ? renderTableHeader(config, options) : ''

  return `<div class="${cls('print-section', options)} ${cls('data-table', options)}">
<table>
${headerHtml}
<tbody>
${body}
</tbody>
</table>
</div>`
}

/**
 * Render table header using the new HeaderRenderer system
 *
 * @since next
 * @description
 * Uses the Strategy Pattern to select the appropriate header rendering approach
 * (simple single-row or complex multi-row), and the Decorator Pattern to add
 * optional features like row numbers.
 *
 * @param config - Table configuration
 * @param options - Render options
 * @returns Rendered header HTML string
 */
function renderTableHeader(config: TableConfig, options?: RenderOptions): string {
  const renderer = createHeaderRenderer(config)
  return renderer.renderHeader(config, options)
}

/**
 * Render simple table header from columns configuration
 *
 * @deprecated Since v2.0.0, use headerRows configuration and HeaderRenderStrategy instead.
 * This function is retained for backward compatibility and will be removed in v3.0.0.
 *
 * @see MultiRowHeaderStrategy - New multi-row header rendering strategy
 * @see TableHeaderBuilder - Recommended header configuration builder
 *
 * @param config - Table configuration
 * @param _options - Render options (unused in legacy implementation)
 * @returns Rendered header HTML string
 */
export function renderSimpleHeader(config: TableConfig, _options?: RenderOptions): string {
  const headers = config.columns
    .map((col) => {
      const width = col.width ? ` style="width: ${col.width}"` : ''
      return `<th${width}>${escapeHtml(col.header)}</th>`
    })
    .join('\n')

  const rowNumberHeader = config.showRowNumber ? '<th>No.</th>\n' : ''

  return `<thead>
<tr>
${rowNumberHeader}${headers}
</tr>
</thead>`
}
