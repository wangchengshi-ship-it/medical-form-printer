/**
 * @fileoverview 信息网格区块渲染器
 * @module renderer/section-renderers/info-grid
 * @description 支持多种单元格类型：text, checkbox, date, number, signature,
 *              checkbox-inline, compound, textarea, checkbox-text
 */

import type { InfoGridConfig, InfoGridCell, FormData } from '../../types/print-schema'
import type { RenderOptions } from '../../types/options'
import { formatValue, formatBoolean } from '../../formatters'
import { escapeHtml } from '../../utils'

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
          const formattedValue = renderCellValue(cell, data, options)
          const colspan = cell.span ? ` colspan="${cell.span}"` : ''
          const widthStyle = cell.width ? ` style="width: ${cell.width}"` : ''
          
          return `<td class="label-cell"${widthStyle}>${escapeHtml(cell.label)}</td>
<td class="value-cell"${colspan}>${formattedValue}</td>`
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
 * 渲染单元格值
 */
function renderCellValue(
  cell: InfoGridCell,
  data: FormData,
  options?: RenderOptions
): string {
  const type = cell.type || 'text'
  
  switch (type) {
    case 'checkbox-inline':
      return renderCheckboxInline(cell, data)
    case 'compound':
      return renderCompound(cell, data, options)
    case 'textarea':
      return renderTextarea(cell, data, options)
    case 'checkbox-text':
      return renderCheckboxText(cell, data, options)
    default:
      return renderBasicValue(cell, data, options)
  }
}

/**
 * 渲染基础值（text, checkbox, date, number, signature）
 */
function renderBasicValue(
  cell: InfoGridCell,
  data: FormData,
  options?: RenderOptions
): string {
  const value = data[cell.field]
  const formattedValue = formatValue(value, cell.type, {
    emptyPlaceholder: options?.emptyPlaceholder,
    customFormatters: options?.formatters,
  })
  
  const suffix = cell.suffix ? `<span class="suffix">${escapeHtml(cell.suffix)}</span>` : ''
  return escapeHtml(formattedValue) + suffix
}

/**
 * 渲染内联勾选框（如 ['无', '有']）
 */
function renderCheckboxInline(
  cell: InfoGridCell,
  data: FormData
): string {
  const value = data[cell.field]
  const inlineOptions = cell.inlineOptions || ['无', '有']
  
  const items = inlineOptions.map((opt, index) => {
    // 对于布尔值，index 0 表示 false，index 1 表示 true
    // 对于字符串值，直接比较
    let checked = false
    if (typeof value === 'boolean') {
      checked = (index === 1 && value) || (index === 0 && !value)
    } else if (typeof value === 'string') {
      checked = value === opt
    } else if (typeof value === 'number') {
      checked = value === index
    }
    
    const symbol = formatBoolean(checked)
    return `<span class="checkbox-inline-item"><span class="checkbox-symbol">${symbol}</span>${escapeHtml(opt)}</span>`
  })
  
  return `<span class="checkbox-inline-group">${items.join('')}</span>`
}

/**
 * 渲染复合字段（如 '{systolic}/{diastolic}mmHg'）
 */
function renderCompound(
  cell: InfoGridCell,
  data: FormData,
  options?: RenderOptions
): string {
  if (!cell.compoundFormat || !cell.compoundFields) {
    return renderBasicValue(cell, data, options)
  }
  
  let result = cell.compoundFormat
  const placeholder = options?.emptyPlaceholder || '____'
  
  for (const [key, fieldName] of Object.entries(cell.compoundFields)) {
    const value = data[fieldName]
    const displayValue = value !== undefined && value !== null && value !== ''
      ? String(value)
      : placeholder
    result = result.replace(`{${key}}`, escapeHtml(displayValue))
  }
  
  return result
}

/**
 * 渲染多行文本
 */
function renderTextarea(
  cell: InfoGridCell,
  data: FormData,
  options?: RenderOptions
): string {
  const value = data[cell.field]
  const formattedValue = formatValue(value, 'text', {
    emptyPlaceholder: options?.emptyPlaceholder,
    customFormatters: options?.formatters,
  })
  
  const minHeightStyle = cell.minHeight ? ` style="min-height: ${cell.minHeight}"` : ''
  return `<div class="textarea-value"${minHeightStyle}>${escapeHtml(formattedValue)}</div>`
}

/**
 * 渲染勾选框+文本
 */
function renderCheckboxText(
  cell: InfoGridCell,
  data: FormData,
  options?: RenderOptions
): string {
  const checkboxField = cell.checkboxField || cell.field
  const textField = cell.textField || cell.field + 'Text'
  
  const checked = Boolean(data[checkboxField])
  const textValue = data[textField]
  const symbol = formatBoolean(checked)
  
  const displayText = textValue !== undefined && textValue !== null && textValue !== ''
    ? String(textValue)
    : (options?.emptyPlaceholder || '________')
  
  return `<span class="checkbox-text-group"><span class="checkbox-symbol">${symbol}</span><span class="text-value">${escapeHtml(displayText)}</span></span>`
}
