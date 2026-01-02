/**
 * @fileoverview 签名区域区块渲染器
 * @module renderer/section-renderers/signature-area
 */

import type { SignatureConfig, FormData } from '../../types/print-schema'
import type { RenderOptions } from '../../types/options'
import { formatDate } from '../../formatters'

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
        dateHtml = `<span class="signature-date">日期：<span class="signature-line">${escapeHtml(formattedDate)}</span></span>`
      }
      
      return `<div class="signature-item">
<span class="signature-label">${escapeHtml(field.label)}：</span>
<span class="signature-line">${escapeHtml(String(value))}</span>
${dateHtml}
</div>`
    })
    .join('\n')
  
  return `<div class="print-section signature-area">
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
