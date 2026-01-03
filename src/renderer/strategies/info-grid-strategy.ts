/**
 * @fileoverview Info Grid Render Strategy
 * @module renderer/strategies/info-grid-strategy
 */

import type { SectionRenderStrategy } from './index'
import type { InfoGridConfig, FormData } from '../../types/print-schema'
import type { RenderOptions } from '../../types/options'
import { renderInfoGrid } from '../section-renderers/info-grid'

/**
 * Info Grid Render Strategy
 */
export class InfoGridStrategy implements SectionRenderStrategy {
  readonly type = 'info-grid'

  render(config: InfoGridConfig, data: FormData, options?: RenderOptions): string {
    return renderInfoGrid(config, data, options)
  }
}
