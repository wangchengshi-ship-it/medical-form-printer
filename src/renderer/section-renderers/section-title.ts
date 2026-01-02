/**
 * @fileoverview 区块标题渲染器
 * @module renderer/section-renderers/section-title
 * @description 渲染区块标题，支持 left/center/right 对齐
 */

import { escapeHtml } from '../../utils'

/** 区块标题配置 */
export interface SectionTitleConfig {
  /** 标题文本 */
  text: string
  /** 对齐方式 */
  align?: 'left' | 'center' | 'right'
  /** 字体大小 */
  fontSize?: string
  /** 是否加粗 */
  bold?: boolean
}

/**
 * 渲染区块标题
 */
export function renderSectionTitle(config: SectionTitleConfig): string {
  const align = config.align || 'left'
  const bold = config.bold !== false
  
  const styles: string[] = [`text-align: ${align}`]
  if (config.fontSize) {
    styles.push(`font-size: ${config.fontSize}`)
  }
  if (bold) {
    styles.push('font-weight: bold')
  }
  
  const styleAttr = styles.length > 0 ? ` style="${styles.join('; ')}"` : ''
  
  return `<div class="print-section section-title"${styleAttr}>${escapeHtml(config.text)}</div>`
}
