/**
 * @fileoverview Inline Row Render Strategy
 * @module renderer/strategies/inline-row-strategy
 */

import type { SectionRenderStrategy } from './index'
import type { InlineRowConfig, FormData } from '../../types/print-schema'
import type { RenderOptions } from '../../types/options'
import { renderInlineRow } from '../section-renderers/inline-row'

/**
 * Inline Row Render Strategy
 */
export class InlineRowStrategy implements SectionRenderStrategy {
  readonly type = 'inline-row'

  render(config: InlineRowConfig, data: FormData, options?: RenderOptions): string {
    return renderInlineRow(config, data, options)
  }
}
