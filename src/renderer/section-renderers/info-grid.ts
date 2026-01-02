/**
 * @fileoverview 信息网格区块渲染器
 * @module renderer/section-renderers/info-grid
 */

import type { InfoGridConfig, FormData } from '../../types/print-schema'
import type { RenderOptions } from '../../types/options'
import { formatValue } from '../../formatters'

/**
 * 渲染信息网格区块
 */
export function renderInfoGrid(
  config: InfoGridConfig,
  data: FormData,
  options?: RenderOptions
): string {
  const rows = config.rows
    .map((row) => {
      const cells = row.cells
        .map((cell) => {
          const value = data[cell.field]
          const formattedValue = formatValue(value, cell.type, {
            emptyPlaceholder: options?.emptyPlaceholder,
            customFormatters: options?.formatters,
          })
          const colspan = cell.span ? ` colspan="${cell.span}"` : ''
          
          return `<td class="label-cell">${escapeHtml(cell.label)}</td>
<td class="value-cell"${colspan}>${escapeHtml(formattedValue)}</td>`
        })
        .join('\n')
      
      return `<tr>\n${cells}\n</tr>`
    })
    .join('\n')
  
  return `<div class="print-section info-grid">
<table>
${rows}
</table>
</div>`
}

/**
 * HTML 转义
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
