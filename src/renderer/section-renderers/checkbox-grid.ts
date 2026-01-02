/**
 * @fileoverview 勾选框网格区块渲染器
 * @module renderer/section-renderers/checkbox-grid
 */

import type { CheckboxGridConfig, FormData } from '../../types/print-schema'
import type { RenderOptions } from '../../types/options'
import { formatBoolean, isChecked } from '../../formatters'

/**
 * 渲染勾选框网格区块
 */
export function renderCheckboxGrid(
  config: CheckboxGridConfig,
  data: FormData,
  options?: RenderOptions
): string {
  const values = data[config.field]
  const columnWidth = `${100 / config.columns}%`
  
  const items = config.options
    .map((opt) => {
      const checked = isChecked(values, opt.value)
      const symbol = formatBoolean(checked)
      
      let inputHtml = ''
      if (opt.hasInput && opt.inputField) {
        const inputValue = data[opt.inputField] || '________'
        inputHtml = `<span class="input-line">${escapeHtml(String(inputValue))}</span>`
      }
      
      return `<div class="checkbox-item" style="width: ${columnWidth}">
<span class="checkbox-symbol">${symbol}</span>
<span class="checkbox-label">${escapeHtml(opt.label)}</span>
${inputHtml}
</div>`
    })
    .join('\n')
  
  return `<div class="print-section checkbox-grid">
${items}
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
