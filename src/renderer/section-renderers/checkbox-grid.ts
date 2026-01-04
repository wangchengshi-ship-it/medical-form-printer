/**
 * @fileoverview Checkbox Grid Section Renderer
 * @module renderer/section-renderers/checkbox-grid
 * @version 2.0.0
 * @author Kiro
 * @created 2023-11-20
 * @modified 2026-01-04
 * 
 * @description
 * Renders checkbox grid sections with support for two modes:
 * - options mode: Simple checkbox list with shared field
 * - items mode: Per-item field binding with prefix labels
 * 
 * Supports grid and flex layouts for flexible positioning.
 * 
 * @dependencies
 * - ../../types/print-schema - Type definitions
 * - ../../types/options - Render options and CSS class utilities
 * - ../../formatters - Boolean and value formatters
 * - ../../utils - HTML escape utilities
 */

import type { CheckboxGridConfig, CheckboxOption, CheckboxItem, FormData } from '../../types/print-schema'
import type { RenderOptions } from '../../types/options'
import { cls } from '../../types/options'
import { formatBoolean, isChecked } from '../../formatters'
import { escapeHtml } from '../../utils'

/**
 * Render checkbox grid section
 */
export function renderCheckboxGrid(
  config: CheckboxGridConfig,
  data: FormData,
  options?: RenderOptions
): string {
  const values = config.field ? data[config.field] : undefined
  const layout = config.layout || 'grid'
  const columns = config.columns || 4
  
  // Prefix label
  const prefixHtml = config.prefixLabel 
    ? `<span class="${cls('prefix-label', options)}">${escapeHtml(config.prefixLabel)}</span>` 
    : ''
  
  // Render items
  let itemsHtml: string
  if (config.items && config.items.length > 0) {
    itemsHtml = renderItems(config.items, values, data, layout, columns, options)
  } else if (config.options && config.options.length > 0) {
    itemsHtml = renderOptions(config.options, values, data, layout, columns, options)
  } else {
    itemsHtml = ''
  }
  
  const layoutClass = layout === 'flex' ? cls('checkbox-grid-flex', options) : cls('checkbox-grid-grid', options)
  
  return `<div class="${cls('print-section', options)} ${cls('checkbox-grid', options)} ${layoutClass}">
${prefixHtml}${itemsHtml}
</div>`
}

/**
 * Render options mode
 */
function renderOptions(
  optionsList: CheckboxOption[],
  values: unknown,
  data: FormData,
  layout: 'grid' | 'flex',
  columns: number,
  options?: RenderOptions
): string {
  const columnWidth = layout === 'grid' ? `${100 / columns}%` : 'auto'
  
  return optionsList
    .map((opt) => {
      const checked = isChecked(values, opt.value)
      const symbol = formatBoolean(checked)
      
      let inputHtml = ''
      if (opt.hasInput && opt.inputField) {
        const inputValue = data[opt.inputField]
        const displayValue = inputValue !== undefined && inputValue !== null && inputValue !== ''
          ? String(inputValue)
          : '________'
        inputHtml = `<span class="${cls('input-line', options)}">${escapeHtml(displayValue)}</span>`
      }
      
      const styleAttr = layout === 'grid' ? ` style="width: ${columnWidth}"` : ''
      
      return `<div class="${cls('checkbox-item', options)}"${styleAttr}>
<span class="${cls('checkbox-symbol', options)}">${symbol}</span>
<span class="${cls('checkbox-label', options)}">${escapeHtml(opt.label)}</span>
${inputHtml}
</div>`
    })
    .join('\n')
}

/**
 * Render items mode
 */
function renderItems(
  itemsList: CheckboxItem[],
  values: unknown,
  data: FormData,
  layout: 'grid' | 'flex',
  columns: number,
  options?: RenderOptions
): string {
  const columnWidth = layout === 'grid' ? `${100 / columns}%` : 'auto'
  
  return itemsList
    .map((item) => {
      const itemType = item.type || 'checkbox'
      const styleAttr = layout === 'grid' ? ` style="width: ${columnWidth}"` : ''
      
      // Prefix label (if present)
      const prefixHtml = item.prefixLabel 
        ? `<span class="${cls('prefix-label', options)}">${escapeHtml(item.prefixLabel)}</span>` 
        : ''
      
      if (itemType === 'text-input') {
        // Pure text input item
        const inputValue = item.inputField ? data[item.inputField] : (item.field ? data[item.field] : undefined)
        const displayValue = inputValue !== undefined && inputValue !== null && inputValue !== ''
          ? String(inputValue)
          : '________'
        
        return `<div class="${cls('checkbox-item', options)} ${cls('text-input-item', options)}"${styleAttr}>
${prefixHtml}<span class="${cls('text-input-label', options)}">${escapeHtml(item.label)}</span>
<span class="${cls('input-line', options)}">${escapeHtml(displayValue)}</span>
</div>`
      } else {
        // checkbox type - use item.field to get value from data
        const itemValue = item.field ? data[item.field] : values
        const checked = item.value !== undefined ? isChecked(itemValue, item.value) : false
        const symbol = formatBoolean(checked)
        
        let inputHtml = ''
        if (item.hasInput && item.inputField) {
          const inputValue = data[item.inputField]
          const displayValue = inputValue !== undefined && inputValue !== null && inputValue !== ''
            ? String(inputValue)
            : '________'
          inputHtml = `<span class="${cls('input-line', options)}">${escapeHtml(displayValue)}</span>`
        }
        
        return `<div class="${cls('checkbox-item', options)}"${styleAttr}>
${prefixHtml}<span class="${cls('checkbox-symbol', options)}">${symbol}</span>
<span class="${cls('checkbox-label', options)}">${escapeHtml(item.label)}</span>
${inputHtml}
</div>`
      }
    })
    .join('\n')
}
