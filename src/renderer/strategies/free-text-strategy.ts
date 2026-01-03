/**
 * @fileoverview Free Text Render Strategy
 * @module renderer/strategies/free-text-strategy
 */

import type { SectionRenderStrategy } from './index'
import type { FreeTextConfig, FormData } from '../../types/print-schema'
import type { RenderOptions } from '../../types/options'
import { renderFreeText } from '../section-renderers/free-text'

/**
 * Free Text Render Strategy
 */
export class FreeTextStrategy implements SectionRenderStrategy {
  readonly type = 'free-text'

  render(config: FreeTextConfig, data: FormData, options?: RenderOptions): string {
    return renderFreeText(config, data, options)
  }
}
