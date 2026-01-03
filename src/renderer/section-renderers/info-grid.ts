/**
 * @fileoverview 信息网格区块渲染器
 * @module renderer/section-renderers/info-grid
 * @version 2.0.0
 * @author Kiro
 * @created 2025-11-28
 * @modified 2026-01-03
 * 
 * @description
 * 渲染纸质表单的下划线填空样式。
 * 格式：标签：______值______
 * 支持多种单元格类型：text, checkbox, date, number, signature,
 *              checkbox-inline, compound, textarea, checkbox-text
 */

import type { InfoGridConfig, InfoGridCell, FormData } from '../../types/print-schema'
import type { RenderOptions } from '../../types/options'
import { cls } from '../../types/options'
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
        .map((cell) => renderCell(cell, data, options))
        .join('\n')
      
      return `<div class="${cls('info-row', options)}">\n${cells}\n</div>`
    })
    .join('\n')
  
  return `<div class="${cls('print-section', options)} ${cls('info-grid', options)}">\n${rows}\n</div>`
}

/**
 * 渲染单个单元格
 */
function renderCell(
  cell: InfoGridCell,
  data: FormData,
  options?: RenderOptions
): string {
  const type = cell.type || 'text'
  
  // 空标签行：只显示下划线
  if (cell.label === '') {
    const value = getCellValue(cell, data)
    return `<span class="${cls('field-value', options)} ${cls('full-width', options)}">
<span class="${cls('text', options)}">${escapeHtml(value)}</span>
<span class="${cls('line', options)}"></span>
</span>`
  }
  
  // checkbox-text 类型：☑/□ + 文本
  if (type === 'checkbox-text') {
    return renderCheckboxTextCell(cell, data, options)
  }
  
  // textarea 类型：标签+内容自然换行
  if (type === 'textarea') {
    return renderTextareaCell(cell, data, options)
  }
  
  // 普通单元格
  const spanClass = cell.span === 2 ? ` ${cls('span-2', options)}` : ''
  const label = `<span class="${cls('label', options)}">${escapeHtml(cell.label)}：</span>`
  
  // checkbox-inline 类型
  if (type === 'checkbox-inline') {
    const checkboxContent = renderCheckboxInline(cell, data, options)
    return `<span class="${cls('info-item', options)}${spanClass}">
${label}
<span class="${cls('checkbox-inline', options)}">${checkboxContent}</span>
</span>`
  }
  
  // 其他类型：下划线填空样式
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
 * 获取单元格的值
 */
function getCellValue(cell: InfoGridCell, data: FormData): string {
  // 复合字段处理 - 支持两种格式
  if (cell.type === 'compound' && cell.compoundFormat) {
    let result = cell.compoundFormat
    const matches = cell.compoundFormat.match(/\{(\w+)\}/g)
    if (matches) {
      matches.forEach((match: string) => {
        const key = match.slice(1, -1)
        // 优先使用 compoundFields 映射，否则直接用 key 作为字段名
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
  
  // 日期格式化
  if (cell.type === 'date' && value) {
    try {
      const date = new Date(value as string)
      return date.toISOString().split('T')[0]
    } catch {
      return String(value)
    }
  }
  
  // 添加后缀
  if (cell.suffix) {
    return `${value}${cell.suffix}`
  }
  
  return String(value)
}

/**
 * 渲染复选框内联选项
 */
function renderCheckboxInline(
  cell: InfoGridCell,
  data: FormData,
  _options?: RenderOptions
): string {
  const value = data[cell.field]
  const cellOptions = cell.inlineOptions || ['无', '有']
  
  return cellOptions.map((opt: string, index: number) => {
    let isChecked = false
    
    // 布尔值：index 0 表示 false（无），index 1 表示 true（有）
    if (typeof value === 'boolean') {
      isChecked = (index === 1 && value) || (index === 0 && !value)
    } 
    // 字符串值：直接比较
    else if (typeof value === 'string') {
      isChecked = value === opt
    }
    // 数字值：比较索引
    else if (typeof value === 'number') {
      isChecked = value === index
    }
    
    return `${isChecked ? '☑' : '□'}${escapeHtml(opt)}`
  }).join(' ')
}

/**
 * 渲染 checkbox-text 类型（☑/□ + 文本）
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
 * 渲染 textarea 类型：标签+内容自然换行
 */
function renderTextareaCell(
  cell: InfoGridCell,
  data: FormData,
  options?: RenderOptions
): string {
  const value = getCellValue(cell, data)
  
  return `<div class="${cls('info-item', options)} ${cls('textarea-item', options)}">
<span class="${cls('label', options)}">${escapeHtml(cell.label)}：</span>
<span class="${cls('textarea-content', options)}">${escapeHtml(value)}</span>
</div>`
}
