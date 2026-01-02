/**
 * @fileoverview 备注区域渲染策略
 * @module renderer/strategies/notes-strategy
 */

import type { SectionRenderStrategy } from './index'
import type { NotesConfig, FormData } from '../../types/print-schema'
import type { RenderOptions } from '../../types/options'
import { renderNotes } from '../section-renderers/notes'

/**
 * 备注区域渲染策略
 */
export class NotesStrategy implements SectionRenderStrategy {
  readonly type = 'notes'

  render(config: NotesConfig, _data: FormData, _options?: RenderOptions): string {
    return renderNotes(config)
  }
}
