/**
 * @fileoverview 备注区块渲染器
 * @module renderer/section-renderers/notes
 */

import type { NotesConfig } from '../../types/print-schema'

/**
 * 渲染备注区块
 */
export function renderNotes(config: NotesConfig): string {
  const borderedClass = config.showBorder ? ' bordered' : ''
  
  return `<div class="print-section notes-section${borderedClass}">
${escapeHtml(config.content)}
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
