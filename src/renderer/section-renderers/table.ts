/**
 * @fileoverview Data Table Section Renderer
 * @module renderer/section-renderers/table
 * @version 1.1.0
 * @author Kiro
 * @created 2023-11-02
 * @modified 2026-01-05
 *
 * @description
 * Renders data tables with support for partial rendering (pagination).
 * Supports row filtering for smart pagination scenarios.
 */

import type { TableConfig, FormData } from '../../types/print-schema'
import type { RenderOptions } from '../../types/options'
import { cls } from '../../types/options'
import { formatValue } from '../../formatters'
import { escapeHtml } from '../../utils'

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
  
  // Header
  const headers = config.columns
    .map((col) => {
      const width = col.width ? ` style="width: ${col.width}"` : ''
      return `<th${width}>${escapeHtml(col.header)}</th>`
    })
    .join('\n')
  
  // Get data array
  const allRows = (data[config.dataField] as Record<string, unknown>[]) || []
  
  // Filter rows if rowIndices is provided (for pagination)
  const rowsToRender = rowIndices
    ? rowIndices
        .filter(idx => idx >= 0 && idx < allRows.length)
        .map(idx => ({ row: allRows[idx], originalIndex: idx }))
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
      
      const rowNumber = config.showRowNumber
        ? `<td>${originalIndex + 1}</td>\n`
        : ''
      
      return `<tr>\n${rowNumber}${cells}\n</tr>`
    })
    .join('\n')
  
  // Row number header
  const rowNumberHeader = config.showRowNumber ? '<th>No.</th>\n' : ''
  
  // Build header HTML
  const headerHtml = includeHeader
    ? `<thead>
<tr>
${rowNumberHeader}${headers}
</tr>
</thead>`
    : ''
  
  return `<div class="${cls('print-section', options)} ${cls('data-table', options)}">
<table>
${headerHtml}
<tbody>
${body}
</tbody>
</table>
</div>`
}
