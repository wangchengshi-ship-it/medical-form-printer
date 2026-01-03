/**
 * @fileoverview 容器渲染器
 * @module renderer/section-renderers/container
 * @description 支持子区块嵌套，支持 row/column 布局方向，支持边框和内边距配置
 * @modified 2023/11/02
 */

import type { ContainerConfig, FormData } from '../../types/print-schema'
import type { RenderOptions } from '../../types/options'
import { cls } from '../../types/options'
import { renderSection } from './index'

/**
 * 渲染容器区块
 */
export function renderContainer(
  config: ContainerConfig,
  data: FormData,
  options?: RenderOptions
): string {
  const direction = config.direction || 'column'
  const gap = config.gap || '8px'
  const padding = config.padding || '0'
  
  // 边框样式
  let borderStyle = 'none'
  if (config.border === true) {
    borderStyle = '1px solid #000'
  } else if (typeof config.border === 'string') {
    borderStyle = config.border
  }
  
  // 渲染子区块
  const childrenHtml = config.children
    .map((child) => {
      const childHtml = renderSection(child.type, child.config, data, options)
      return `<div class="${cls('container-item', options)}">${childHtml}</div>`
    })
    .join('\n')
  
  const flexDirection = direction === 'row' ? 'row' : 'column'
  const styles = [
    'display: flex',
    `flex-direction: ${flexDirection}`,
    `gap: ${gap}`,
    `padding: ${padding}`,
    `border: ${borderStyle}`,
  ].join('; ')
  
  return `<div class="${cls('print-section', options)} ${cls('container-section', options)}" style="${styles}">
${childrenHtml}
</div>`
}
