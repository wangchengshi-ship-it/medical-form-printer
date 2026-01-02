/**
 * @fileoverview 自由文本区块渲染器
 * @module renderer/section-renderers/free-text
 */

import type { FreeTextConfig, FormData } from '../../types/print-schema'
import type { RenderOptions } from '../../types/options'

/**
 * 渲染自由文本区块
 */
export function renderFreeText(
  config: FreeTextConfig,
  data: FormData,
  options?: RenderOptions
): string {
  const value = data[config.field] || options?.emptyPlaceholder || ''
  const minHeight = config.minHeight ? ` style="min-height: ${config.minHeight}"` : ''
  
  return `<div class="print-section free-text"${minHeight}>
${escapeHtml(String(value))}
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
