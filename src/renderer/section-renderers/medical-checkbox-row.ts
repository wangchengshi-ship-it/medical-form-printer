/**
 * @fileoverview 医疗勾选行渲染器
 * @module renderer/section-renderers/medical-checkbox-row
 * @description 渲染医疗表单中的复杂勾选行，支持前缀标签、选项列表、输入框模板等
 * @modif 2023-12-19
 */

import type { FormData, MedicalCheckboxRowConfig } from '../../types/print-schema'
import type { RenderOptions } from '../../types/options'
import { cls } from '../../types/options'
import { formatBoolean, isChecked } from '../../formatters'
import { escapeHtml } from '../../utils'

/**
 * 渲染医疗勾选行
 */
export function renderMedicalCheckboxRow(
  config: MedicalCheckboxRowConfig,
  data: FormData,
  options?: RenderOptions
): string {
  const parts: string[] = []
  
  // 1. 前缀标签
  if (config.prefixLabel) {
    parts.push(`<span class="${cls('prefix-label', options)}">${escapeHtml(config.prefixLabel)}</span>`)
  }
  
  // 2. 选项列表
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
  
  // 3. 输入框模板格式
  if (config.inputFormat && config.inputField) {
    const inputValue = data[config.inputField]
    const displayValue = inputValue !== undefined && inputValue !== null && inputValue !== ''
      ? String(inputValue)
      : '____'
    const formattedText = config.inputFormat.replace('{input}', `<span class="${cls('input-value', options)}">${escapeHtml(displayValue)}</span>`)
    parts.push(`<span class="${cls('input-format', options)}">${formattedText}</span>`)
  }
  
  // 4. 简单输入框标签
  if (config.inputLabel && config.inputLabelField) {
    const inputValue = data[config.inputLabelField]
    const displayValue = inputValue !== undefined && inputValue !== null && inputValue !== ''
      ? String(inputValue)
      : '________________'
    parts.push(`<span class="${cls('input-label-group', options)}"><span class="${cls('input-label', options)}">${escapeHtml(config.inputLabel)}：</span><span class="${cls('input-value', options)}">${escapeHtml(displayValue)}</span></span>`)
  }
  
  // 5. 额外输入项
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
