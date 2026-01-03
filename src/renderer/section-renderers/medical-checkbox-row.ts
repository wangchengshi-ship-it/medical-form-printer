/**
 * @fileoverview Medical checkbox row renderer
 * @module renderer/section-renderers/medical-checkbox-row
 * @description Renders complex checkbox rows in medical forms, supporting prefix labels, option lists, input templates, etc.
 * @modif 2023-12-19
 */

import type { FormData, MedicalCheckboxRowConfig } from '../../types/print-schema'
import type { RenderOptions } from '../../types/options'
import { cls } from '../../types/options'
import { formatBoolean, isChecked } from '../../formatters'
import { escapeHtml } from '../../utils'

/**
 * Render medical checkbox row
 */
export function renderMedicalCheckboxRow(
  config: MedicalCheckboxRowConfig,
  data: FormData,
  options?: RenderOptions
): string {
  const parts: string[] = []
  
  // 1. Prefix label
  if (config.prefixLabel) {
    parts.push(`<span class="${cls('prefix-label', options)}">${escapeHtml(config.prefixLabel)}</span>`)
  }
  
  // 2. Options list
  if (config.options && config.options.length > 0 && config.field) {
    const values = data[config.field]
    const optionsHtml = config.options
      .map((opt) => {
        const checked = isChecked(values, opt.value)
        const symbol = formatBoolean(checked)
        return `<span class="${cls('checkbox-option', options)}"><span class="${cls('checkbox-symbol', options)}">${symbol}</span>${escapeHtml(opt.label)}</span>`
      })
      .join('')
    parts.push(`<span class="${cls('options-group', options)}">${optionsHtml}</span>`)
  }
  
  // 3. Input template format
  if (config.inputFormat && config.inputField) {
    const inputValue = data[config.inputField]
    const displayValue = inputValue !== undefined && inputValue !== null && inputValue !== ''
      ? String(inputValue)
      : '____'
    const formattedText = config.inputFormat.replace('{input}', `<span class="${cls('input-value', options)}">${escapeHtml(displayValue)}</span>`)
    parts.push(`<span class="${cls('input-format', options)}">${formattedText}</span>`)
  }
  
  // 4. Simple input label
  if (config.inputLabel && config.inputLabelField) {
    const inputValue = data[config.inputLabelField]
    const displayValue = inputValue !== undefined && inputValue !== null && inputValue !== ''
      ? String(inputValue)
      : '________________'
    parts.push(`<span class="${cls('input-label-group', options)}"><span class="${cls('input-label', options)}">${escapeHtml(config.inputLabel)}:</span><span class="${cls('input-value', options)}">${escapeHtml(displayValue)}</span></span>`)
  }
  
  // 5. Extra input items
  if (config.extraInputs && config.extraInputs.length > 0) {
    const extraHtml = config.extraInputs
      .map((extra) => {
        const inputValue = data[extra.field]
        const displayValue = inputValue !== undefined && inputValue !== null && inputValue !== ''
          ? String(inputValue)
          : '____'
        const labelHtml = extra.label ? `<span class="${cls('extra-label', options)}">${escapeHtml(extra.label)}</span>` : ''
        const suffixHtml = extra.suffix ? `<span class="${cls('extra-suffix', options)}">${escapeHtml(extra.suffix)}</span>` : ''
        return `<span class="${cls('extra-input', options)}">${labelHtml}<span class="${cls('input-value', options)}">${escapeHtml(displayValue)}</span>${suffixHtml}</span>`
      })
      .join('')
    parts.push(`<span class="${cls('extra-inputs', options)}">${extraHtml}</span>`)
  }
  
  return `<div class="${cls('print-section', options)} ${cls('medical-checkbox-row', options)}">${parts.join('')}</div>`
}
