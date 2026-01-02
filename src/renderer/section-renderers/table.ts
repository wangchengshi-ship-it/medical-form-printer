/**
 * @fileoverview 数据表格区块渲染器
 * @module renderer/section-renderers/table
 */

import type { TableConfig, FormData } from '../../types/print-schema'
import type { RenderOptions } from '../../types/options'
import { formatValue } from '../../formatters'

/**
 * 渲染数据表格区块
 */
export function renderTable(
  config: TableConfig,
  data: FormData,
  options?: RenderOptions
): string {
  // 表头
  const headers = config.columns
    .map((col) => {
      const width = col.width ? ` style="width: ${col.width}"` : ''
      return `<th${width}>${escapeHtml(col.header)}</th>`
    })
    .join('\n')
  
  // 获取数据数组
  const rows = (data[config.dataField] as Record<string, unknown>[]) || []
  
  // 表体
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
  
  // 行号表头
  const rowNumberHeader = config.showRowNumber ? '<th>序号</th>\n' : ''
  
  return `<div class="print-section data-table">
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
