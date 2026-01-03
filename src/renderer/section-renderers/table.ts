/**
 * @fileoverview Data Table Section Renderer
 * @module renderer/section-renderers/table
 * @modif 2023-11-02
 */

import type { TableConfig, FormData } from '../../types/print-schema'
import type { RenderOptions } from '../../types/options'
import { cls } from '../../types/options'
import { formatValue } from '../../formatters'
import { escapeHtml } from '../../utils'

/**
 * Render data table section
 */
export function renderTable(
  config: TableConfig,
  data: FormData,
  options?: RenderOptions
): string {
  // Header
  const headers = config.columns
    .map((col) => {
      const width = col.width ? ` style="width: ${col.width}"` : ''
      return `<th${width}>${escapeHtml(col.header)}</th>`
    })
    .join('\n')
  
  // Get data array
  const rows = (data[config.dataField] as Record<string, unknown>[]) || []
  
  // Body
  const body = rows
    .map((row, index) => {
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
        ? `<td>${index + 1}</td>\n`
        : ''
      
      return `<tr>\n${rowNumber}${cells}\n</tr>`
    })
    .join('\n')
  
  // Row number header
  const rowNumberHeader = config.showRowNumber ? '<th>No.</th>\n' : ''
  
  return `<div class="${cls('print-section', options)} ${cls('data-table', options)}">
<table>
<thead>
<tr>
${rowNumberHeader}${headers}
</tr>
</thead>
<tbody>
${body}
</tbody>
</table>
</div>`
}
