/**
 * @fileoverview Inline Row Renderer
 * @module renderer/section-renderers/inline-row
 * @description Supports multi-column layout in a row (inline-flex), child elements can be any section type
 * @modif 2023-11-08
 */

import type { InlineRowConfig, FormData } from '../../types/print-schema'
import type { RenderOptions } from '../../types/options'
import { cls } from '../../types/options'
import { renderSection } from './index'

/**
 * Render inline row section
 */
export function renderInlineRow(
  config: InlineRowConfig,
  data: FormData,
  options?: RenderOptions
): string {
  const gap = config.gap || '8px'
  const columns = config.columns || config.children.map(() => 1)
  const totalWeight = columns.reduce((sum, w) => sum + w, 0)
  
  const childrenHtml = config.children
    .map((child, index) => {
      const weight = columns[index] || 1
      const flexBasis = `${(weight / totalWeight) * 100}%`
      const childHtml = renderSection(child.type, child.config, data, options)
      
      return `<div class="${cls('inline-row-item', options)}" style="flex: ${weight} 1 ${flexBasis}; min-width: 0;">${childHtml}</div>`
    })
    .join('\n')
  
  return `<div class="${cls('print-section', options)} ${cls('inline-row', options)}" style="display: flex; gap: ${gap}; align-items: flex-start;">
${childrenHtml}
</div>`
}
