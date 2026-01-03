/**
 * @fileoverview 备注区块渲染器
 * @module renderer/section-renderers/notes
 * @modif 2023-02-02
 */

import type { NotesConfig, FormData } from '../../types/print-schema'
import type { RenderOptions } from '../../types/options'
import { cls } from '../../types/options'
import { escapeHtml } from '../../utils'

/**
 * 渲染备注区块
 */
export function renderNotes(
  config: NotesConfig,
  _data: FormData,
  options?: RenderOptions
): string {
  const borderedClass = config.showBorder ? ` ${cls('bordered', options)}` : ''
  
  return `<div class="${cls('print-section', options)} ${cls('notes-section', options)}${borderedClass}">
${escapeHtml(config.content)}
</div>`
}
