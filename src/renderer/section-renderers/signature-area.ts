/**
 * @fileoverview 签名区域区块渲染器
 * @module renderer/section-renderers/signature-area
 * @modif 2023-11-08
 */

import type { SignatureConfig, FormData } from '../../types/print-schema'
import type { RenderOptions } from '../../types/options'
import { cls } from '../../types/options'
import { formatDate } from '../../formatters'
import { escapeHtml } from '../../utils'

/**
 * 渲染签名区域区块
 */
export function renderSignatureArea(
  config: SignatureConfig,
  data: FormData,
  options?: RenderOptions
): string {
  const items = config.fields
    .map((field) => {
      const value = data[field.field] || ''
      
      let dateHtml = ''
      if (field.showDate) {
        const dateField = `${field.field}Date`
        const dateValue = data[dateField]
        const formattedDate = dateValue
          ? formatDate(dateValue, options?.dateFormat?.dateFormat)
          : ''
        dateHtml = `<span class="${cls('signature-date', options)}">日期：<span class="${cls('signature-line', options)}">${escapeHtml(formattedDate)}</span></span>`
      }
      
      return `<div class="${cls('signature-item', options)}">
<span class="${cls('signature-label', options)}">${escapeHtml(field.label)}：</span>
<span class="${cls('signature-line', options)}">${escapeHtml(String(value))}</span>
${dateHtml}
</div>`
    })
    .join('\n')
  
  return `<div class="${cls('print-section', options)} ${cls('signature-area', options)}">
${items}
</div>`
}