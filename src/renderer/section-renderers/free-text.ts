/**
 * @fileoverview 自由文本区块渲染器
 * @module renderer/section-renderers/free-text
 * @modif 2023-11-20
 */

import type { FreeTextConfig, FormData } from '../../types/print-schema'
import type { RenderOptions } from '../../types/options'
import { cls } from '../../types/options'
import { escapeHtml } from '../../utils'

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
  
  return `<div class="${cls('print-section', options)} ${cls('free-text', options)}"${minHeight}>
${escapeHtml(String(value))}
</div>`
}
