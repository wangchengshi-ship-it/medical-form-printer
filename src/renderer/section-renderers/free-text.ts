/**
 * @fileoverview Free Text Section Renderer
 * @module renderer/section-renderers/free-text
 * @modif 2023-11-20
 */

import type { FreeTextConfig, FormData } from '../../types/print-schema'
import type { RenderOptions } from '../../types/options'
import { cls } from '../../types/options'
import { escapeHtml } from '../../utils'

/**
 * Render free text section
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
