/**
 * @fileoverview Section Title Renderer
 * @module renderer/section-renderers/section-title
 * @description Renders section titles, supports left/center/right alignment
 * @modif 2024-04-07
 */

import type { FormData } from '../../types/print-schema'
import type { RenderOptions } from '../../types/options'
import { cls } from '../../types/options'
import { escapeHtml } from '../../utils'

/** Section title configuration */
export interface SectionTitleConfig {
  /** Title text */
  text: string
  /** Alignment */
  align?: 'left' | 'center' | 'right'
  /** Font size */
  fontSize?: string
  /** Whether to bold */
  bold?: boolean
}

/**
 * Render section title
 */
export function renderSectionTitle(
  config: SectionTitleConfig,
  _data: FormData,
  options?: RenderOptions
): string {
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
  
  return `<div class="${cls('print-section', options)} ${cls('section-title', options)}"${styleAttr}>${escapeHtml(config.text)}</div>`
}
