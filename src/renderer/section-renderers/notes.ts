/**
 * @fileoverview 备注区块渲染器
 * @module renderer/section-renderers/notes
 */

import type { NotesConfig } from '../../types/print-schema'
import { escapeHtml } from '../../utils'

/**
 * 渲染备注区块
 */
export function renderNotes(config: NotesConfig): string {
  const borderedClass = config.showBorder ? ' bordered' : ''
  
  return `<div class="print-section notes-section${borderedClass}">
${escapeHtml(config.content)}
</div>`
}
