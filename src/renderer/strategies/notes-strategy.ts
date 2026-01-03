/**
 * @fileoverview Notes Area Render Strategy
 * @module renderer/strategies/notes-strategy
 */

import type { SectionRenderStrategy } from './index'
import type { NotesConfig, FormData } from '../../types/print-schema'
import type { RenderOptions } from '../../types/options'
import { renderNotes } from '../section-renderers/notes'

/**
 * Notes Area Render Strategy
 */
export class NotesStrategy implements SectionRenderStrategy {
  readonly type = 'notes'

  render(config: NotesConfig, data: FormData, options?: RenderOptions): string {
    return renderNotes(config, data, options)
  }
}
