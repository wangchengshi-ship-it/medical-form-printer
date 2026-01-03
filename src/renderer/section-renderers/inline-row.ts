/**
 * @fileoverview 行内分列渲染器
 * @module renderer/section-renderers/inline-row
 * @description 支持一行分多份布局（inline-flex），子元素可以是任意区块类型
 * @modif 2023-11-08
 */

import type { InlineRowConfig, FormData } from '../../types/print-schema'
import type { RenderOptions } from '../../types/options'
import { cls } from '../../types/options'
import { renderSection } from './index'

/**
 * 渲染行内分列区块
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
