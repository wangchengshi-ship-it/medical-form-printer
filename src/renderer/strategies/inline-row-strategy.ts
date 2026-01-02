/**
 * @fileoverview 行内分列渲染策略
 * @module renderer/strategies/inline-row-strategy
 */

import type { SectionRenderStrategy } from './index'
import type { InlineRowConfig, FormData } from '../../types/print-schema'
import type { RenderOptions } from '../../types/options'
import { renderInlineRow } from '../section-renderers/inline-row'

/**
 * 行内分列渲染策略
 */
export class InlineRowStrategy implements SectionRenderStrategy {
  readonly type = 'inline-row'

  render(config: InlineRowConfig, data: FormData, options?: RenderOptions): string {
    return renderInlineRow(config, data, options)
  }
}
