/**
 * @fileoverview Info Grid Section Renderer
 * @module renderer/section-renderers/info-grid
 * @version 2.0.0
 * @author Kiro
 * @created 2025-11-28
 * @modified 2026-01-03
 * 
 * @description
 * Renders paper form underline fill-in style.
 * Format: Label: ______value______
 * Supports multiple cell types: text, checkbox, date, number, signature,
 *              checkbox-inline, compound, textarea, checkbox-text
 */

import type { InfoGridConfig, InfoGridCell, FormData } from '../../types/print-schema'
import type { RenderOptions } from '../../types/options'
import { cls } from '../../types/options'
import { escapeHtml } from '../../utils'

/**
 * Render info grid section
 */
export function renderInfoGrid(
  config: InfoGridConfig,
  data: FormData,
  options?: RenderOptions
): string {
  const rows = config.rows
    .map((row) => {
      const cells = row.cells
        .map((cell) => renderCell(cell, data, options))
        .join('\n')
      
      return `<div class="${cls('info-row', options)}">\n${cells}\n</div>`
    })
    .join('\n')
  
  return `<div class="${cls('print-section', options)} ${cls('info-grid', options)}">\n${rows}\n</div>`
}

/**
 * Render single cell
 */
function renderCell(
  cell: InfoGridCell,
  data: FormData,
  options?: RenderOptions
): string {
  const type = cell.type || 'text'
  
  // Empty label row: only show underline
  if (cell.label === '') {
    const value = getCellValue(cell, data)
    return `<span class="${cls('field-value', options)} ${cls('full-width', options)}">
<span class="${cls('text', options)}">${escapeHtml(value)}</span>
<span class="${cls('line', options)}"></span>
</span>`
  }
  
  // checkbox-text type: checkbox symbol + text
  if (type === 'checkbox-text') {
    return renderCheckboxTextCell(cell, data, options)
  }
  
  // textarea type: label + content with natural line breaks
  if (type === 'textarea') {
    return renderTextareaCell(cell, data, options)
  }
  
  // Normal cell
  const spanClass = cell.span === 2 ? ` ${cls('span-2', options)}` : ''
  const label = `<span class="${cls('label', options)}">${escapeHtml(cell.label)}:</span>`
  
  // checkbox-inline type
  if (type === 'checkbox-inline') {
    const checkboxContent = renderCheckboxInline(cell, data, options)
    return `<span class="${cls('info-item', options)}${spanClass}">
${label}
<span class="${cls('checkbox-inline', options)}">${checkboxContent}</span>
</span>`
  }
  
  // Other types: underline fill-in style
  const value = getCellValue(cell, data)
  const widthStyle = cell.width ? ` style="width: ${cell.width}"` : ''
  const customWidthClass = cell.width ? ` ${cls('custom-width', options)}` : ''
  
  return `<span class="${cls('info-item', options)}${spanClass}">
${label}
<span class="${cls('field-value', options)}${customWidthClass}"${widthStyle}>
<span class="${cls('text', options)}">${escapeHtml(value)}</span>
<span class="${cls('line', options)}"></span>
</span>
</span>`
}

/**
 * Get cell value
 */
function getCellValue(cell: InfoGridCell, data: FormData): string {
  // Compound field handling - supports two formats
  if (cell.type === 'compound' && cell.compoundFormat) {
    let result = cell.compoundFormat
    const matches = cell.compoundFormat.match(/\{(\w+)\}/g)
    if (matches) {
      matches.forEach((match: string) => {
        const key = match.slice(1, -1)
        // Prefer compoundFields mapping, otherwise use key as field name directly
        const fieldName = cell.compoundFields?.[key] || key
        const value = data[fieldName]
        result = result.replace(match, value !== undefined && value !== null ? String(value) : '')
      })
    }
    return result
  }
  
  const value = data[cell.field]
  
  if (value === undefined || value === null || value === '') {
    return ''
  }
  
  // Date formatting
  if (cell.type === 'date' && value) {
    try {
      const date = new Date(value as string)
      return date.toISOString().split('T')[0]
    } catch {
      return String(value)
    }
  }
  
  // Add suffix
  if (cell.suffix) {
    return `${value}${cell.suffix}`
  }
  
  return String(value)
}

/**
 * Render checkbox inline options
 */
function renderCheckboxInline(
  cell: InfoGridCell,
  data: FormData,
  _options?: RenderOptions
): string {
  const value = data[cell.field]
  const cellOptions = cell.inlineOptions || ['No', 'Yes']
  
  return cellOptions.map((opt: string, index: number) => {
    let isChecked = false
    
    // Boolean value: index 0 means false (No), index 1 means true (Yes)
    if (typeof value === 'boolean') {
      isChecked = (index === 1 && value) || (index === 0 && !value)
    } 
    // String value: direct comparison
    else if (typeof value === 'string') {
      isChecked = value === opt
    }
    // Number value: compare index
    else if (typeof value === 'number') {
      isChecked = value === index
    }
    
    return `${isChecked ? '☑' : '□'}${escapeHtml(opt)}`
  }).join(' ')
}

/**
 * Render checkbox-text type (checkbox symbol + text)
 */
function renderCheckboxTextCell(
  cell: InfoGridCell,
  data: FormData,
  options?: RenderOptions
): string {
  const value = data[cell.field]
  const isChecked = value === true
  const symbol = isChecked ? '☑' : '□'
  const text = cell.text || ''
  
  return `<div class="${cls('info-item', options)} ${cls('checkbox-text-item', options)}">
<span class="${cls('checkbox-text', options)}">${symbol}${escapeHtml(text)}</span>
</div>`
}

/**
 * Render textarea type: label + content with natural line breaks
 */
function renderTextareaCell(
  cell: InfoGridCell,
  data: FormData,
  options?: RenderOptions
): string {
  const value = getCellValue(cell, data)
  
  return `<div class="${cls('info-item', options)} ${cls('textarea-item', options)}">
<span class="${cls('label', options)}">${escapeHtml(cell.label)}:</span>
<span class="${cls('textarea-content', options)}">${escapeHtml(value)}</span>
</div>`
}
